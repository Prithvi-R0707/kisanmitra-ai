import express from 'express';
import Chat from '../models/Chat.js';
import Farmer from '../models/Farmer.js';
import Expense from '../models/Expense.js';
import History from '../models/History.js';
import { memoryExpenses, memoryHistory } from './recordsRoutes.js';
import { isDbConnected } from '../config/db.js';
import { getLanguageName } from '../utils/languageHelper.js';
import {
  getFallbackReply,
  getExpenseConfirmedReply,
  getMissingAmountReply,
  getActivityConfirmedReply,
} from '../utils/multilingualReplies.js';

const router = express.Router();

// Fallback memory stores
const memoryChatStore = new Map();

router.get('/history', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.json({ messages: [] });
    const cleanPhone = phone.trim().slice(-10);

    if (isDbConnected) {
      const docs = await Chat.find({ phoneNumber: cleanPhone })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
      return res.json({ messages: docs.reverse() });
    } else {
      const history = memoryChatStore.get(cleanPhone) || [];
      return res.json({ messages: history.slice(-10) });
    }
  } catch (err) {
    res.json({ messages: [] });
  }
});

router.post('/', async (req, res) => {
  const { phone, message, language } = req.body;
  if (!phone || !message || !message.trim()) {
    return res.status(400).json({ error: 'Phone and message are required' });
  }

  const cleanPhone = phone.trim().slice(-10);

  // 1. Load Farmer profile
  let farmer = null;
  if (isDbConnected) {
    farmer = await Farmer.findOne({ phoneNumber: cleanPhone }).lean();
  }
  const farmerName = farmer?.name || 'Kisan';
  const langCode = (language || farmer?.selectedLanguage?.code || 'en').toLowerCase().slice(0, 2);
  const farmerLang = (language && getLanguageName(language)) || farmer?.selectedLanguage?.name || getLanguageName(langCode);
  const village = farmer?.village || 'Village';
  const state = farmer?.state || 'State';

  // 2. Load last 6 messages
  let previousMessages = [];
  if (isDbConnected) {
    const raw = await Chat.find({ phoneNumber: cleanPhone })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    previousMessages = raw.reverse();
  } else {
    const mem = memoryChatStore.get(cleanPhone) || [];
    previousMessages = mem.slice(-6);
  }

  // 3. Save incoming user message
  const userMsgObj = {
    phoneNumber: cleanPhone,
    role: 'user',
    text: message.trim(),
    language: langCode,
    createdAt: new Date(),
  };

  if (isDbConnected) {
    await Chat.create(userMsgObj).catch((e) => console.warn('Chat save error:', e.message));
  } else {
    const list = memoryChatStore.get(cleanPhone) || [];
    list.push(userMsgObj);
    memoryChatStore.set(cleanPhone, list);
  }

  // 4. Single Gemini call with JSON output mode
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  let aiReplyText = '';
  let extractedAction = null;

  const systemInstruction = `You are KisanMitra, a friendly AI farm manager for Indian farmers.
Farmer details: Name: ${farmerName}, Village: ${village}, State: ${state}, Preferred Language: ${farmerLang}.
Always reply in ${farmerLang}, max 3 short sentences, simple words, no technical terms, address the farmer by name.

You must respond ONLY with a valid JSON object with EXACTLY this structure:
{
  "reply": "<Friendly 1-3 short sentences in ${farmerLang} addressing ${farmerName}>",
  "action": null | {
    "type": "expense" | "history" | "income",
    "amount": <number or null>,
    "item": "<seeds/fertilizer/pesticide/labor/water/machinery/fuel/other/sowing/watering/spray/harvest/income>",
    "crop": "<crop name or null>",
    "date": "<YYYY-MM-DD or today>",
    "note": "<short note>"
  }
}

CRITICAL RULES FOR ACTION:
1. Normal farm questions (crop advice, weather questions, greetings, pest remedies):
   - Set action to null.
   - Answer the question helpfully in reply.
2. If the farmer mentions spending money or buying farm inputs (e.g. "I spent 500 on seeds", "bought fertilizer for 1200"):
   - If the amount IS SPECIFIED: set action.type = "expense", action.amount = <number>, action.item = "<category>". In reply, confirm to ${farmerName} in ${farmerLang} that this expense of ₹{amount} has been saved to their farm diary.
   - If the amount is MISSING (e.g. "I bought seeds today", "paid labor"):
     DO NOT GUESS OR INVENT AN AMOUNT. Set action to null. In reply, ask ${farmerName} in ${farmerLang} kindly how much they spent so you can record it.
3. If the farmer mentions farm field activities (e.g. "I sowed paddy today", "watered the field", "sprayed insecticide", "harvested"):
   - Set action.type = "history", action.item = "<sowing/watering/spray/fertilizer/harvest>", action.amount = null. In reply, warmly acknowledge the completed task to ${farmerName} in ${farmerLang}.
4. If the farmer mentions receiving farm income:
   - If amount is specified: set action.type = "income", action.amount = <number>. In reply, congratulate ${farmerName} in ${farmerLang}.`;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      const contents = [];
      for (const m of previousMessages) {
        contents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message.trim() }],
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              maxOutputTokens: 250,
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && candidate.trim()) {
          try {
            const parsed = JSON.parse(candidate.trim());
            aiReplyText = parsed.reply || '';
            extractedAction = parsed.action || null;
          } catch (e) {
            const match = candidate.match(/\{[\s\S]*\}/);
            if (match) {
              const parsed = JSON.parse(match[0]);
              aiReplyText = parsed.reply || '';
              extractedAction = parsed.action || null;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Gemini call error or timeout:', err.message);
    }
  }

  // 5. Rule-based Fallback Parser if Gemini was offline or response incomplete
  const lowerMsg = message.trim().toLowerCase();
  const numMatch = message.match(/(\d+[\d,]*)/);
  const detectedAmount = numMatch ? Number(numMatch[1].replace(/,/g, '')) : null;

  if (!aiReplyText) {
    if (detectedAmount && (lowerMsg.includes('spent') || lowerMsg.includes('ખર્ચ') || lowerMsg.includes('खर्च') || lowerMsg.includes('செலவு') || lowerMsg.includes('రూపాయలు') || lowerMsg.includes('cost') || lowerMsg.includes('rs') || lowerMsg.includes('bought') || lowerMsg.includes('₹'))) {
      let item = 'other';
      if (lowerMsg.includes('seed') || lowerMsg.includes('बीज') || lowerMsg.includes('விதை') || lowerMsg.includes('విత్తన')) item = 'seeds';
      else if (lowerMsg.includes('fertilizer') || lowerMsg.includes('खाद') || lowerMsg.includes('உரம்') || lowerMsg.includes('ఎరువు')) item = 'fertilizer';
      else if (lowerMsg.includes('pesticide') || lowerMsg.includes('दवा') || lowerMsg.includes('மருந்து') || lowerMsg.includes('పురుగు')) item = 'pesticide';
      else if (lowerMsg.includes('labor') || lowerMsg.includes('मजदूरी') || lowerMsg.includes('கூலி') || lowerMsg.includes('కూలీ')) item = 'labor';
      else if (lowerMsg.includes('water') || lowerMsg.includes('irrigation') || lowerMsg.includes('पानी') || lowerMsg.includes('தண்ணீர்')) item = 'water';
      else if (lowerMsg.includes('tractor') || lowerMsg.includes('machinery')) item = 'machinery';
      else if (lowerMsg.includes('diesel') || lowerMsg.includes('fuel')) item = 'fuel';

      extractedAction = { type: 'expense', amount: detectedAmount, item, note: message.trim() };
      aiReplyText = getExpenseConfirmedReply(langCode, farmerName, detectedAmount, item);
    } else if (lowerMsg.includes('bought') || lowerMsg.includes('खरीदा') || lowerMsg.includes('வாங்கி') || lowerMsg.includes('కొన్నాను')) {
      // Amount missing! Ask the farmer instead of guessing
      extractedAction = null;
      aiReplyText = getMissingAmountReply(langCode, farmerName);
    } else if (lowerMsg.includes('sow') || lowerMsg.includes('बोया') || lowerMsg.includes('விதைத்தேன்') || lowerMsg.includes('నాటాను') || lowerMsg.includes('water') || lowerMsg.includes('पानी दिया') || lowerMsg.includes('spray') || lowerMsg.includes('harvest')) {
      let act = 'sowing';
      if (lowerMsg.includes('water') || lowerMsg.includes('पानी')) act = 'watering';
      else if (lowerMsg.includes('spray') || lowerMsg.includes('छिड़काव')) act = 'spray';
      else if (lowerMsg.includes('harvest') || lowerMsg.includes('कटाई')) act = 'harvest';

      extractedAction = { type: 'history', item: act, crop: '', note: message.trim() };
      aiReplyText = getActivityConfirmedReply(langCode, farmerName, act);
    } else {
      aiReplyText = getFallbackReply(langCode, farmerName);
    }
  }

  // 6. Validate & Save Action
  let savedRecord = null;
  if (extractedAction && typeof extractedAction === 'object') {
    const { type, amount, item, crop, date, note } = extractedAction;
    const numAmount = Number(amount);
    const entryDate = date && !isNaN(new Date(date).getTime()) ? new Date(date) : new Date();

    if (type === 'expense' && !isNaN(numAmount) && numAmount > 0) {
      const validCats = ['seeds', 'fertilizer', 'pesticide', 'labor', 'water', 'machinery', 'fuel', 'other'];
      const normItem = (item || 'other').toLowerCase();
      const category = validCats.includes(normItem) ? normItem : 'other';

      const expItem = {
        phoneNumber: cleanPhone,
        category,
        amount: numAmount,
        description: note || message.trim(),
        date: entryDate,
      };

      if (isDbConnected) {
        const expDoc = await Expense.create(expItem).catch(() => {});
        if (expDoc) {
          await History.create({
            phoneNumber: cleanPhone,
            action: 'expense',
            type: 'expense',
            amount: numAmount,
            details: note || category,
            date: entryDate,
          }).catch(() => {});
          savedRecord = { type: 'expense', id: expDoc._id, amount: numAmount, item: category };
        }
      } else {
        expItem._id = 'mem_exp_' + Date.now();
        const list = memoryExpenses.get(cleanPhone) || [];
        list.unshift(expItem);
        memoryExpenses.set(cleanPhone, list);

        const histList = memoryHistory.get(cleanPhone) || [];
        histList.unshift({
          _id: 'mem_hist_' + Date.now(),
          phoneNumber: cleanPhone,
          action: 'expense',
          type: 'expense',
          amount: numAmount,
          details: note || category,
          date: entryDate,
        });
        memoryHistory.set(cleanPhone, histList);

        savedRecord = { type: 'expense', id: expItem._id, amount: numAmount, item: category };
      }
    } else if (type === 'history' && item) {
      const histItem = {
        phoneNumber: cleanPhone,
        action: item.toLowerCase(),
        type: 'activity',
        crop: crop || '',
        details: note || message.trim(),
        date: entryDate,
      };

      if (isDbConnected) {
        const histDoc = await History.create(histItem).catch(() => {});
        if (histDoc) {
          savedRecord = { type: 'history', id: histDoc._id, item: item.toLowerCase() };
        }
      } else {
        histItem._id = 'mem_hist_' + Date.now();
        const list = memoryHistory.get(cleanPhone) || [];
        list.unshift(histItem);
        memoryHistory.set(cleanPhone, list);
        savedRecord = { type: 'history', id: histItem._id, item: item.toLowerCase() };
      }
    } else if (type === 'income' && !isNaN(numAmount) && numAmount > 0) {
      const histItem = {
        phoneNumber: cleanPhone,
        action: 'income',
        type: 'income',
        amount: numAmount,
        crop: crop || '',
        details: note || message.trim(),
        date: entryDate,
      };

      if (isDbConnected) {
        const histDoc = await History.create(histItem).catch(() => {});
        if (histDoc) {
          savedRecord = { type: 'income', id: histDoc._id, amount: numAmount, item: 'income' };
        }
      } else {
        histItem._id = 'mem_hist_' + Date.now();
        const list = memoryHistory.get(cleanPhone) || [];
        list.unshift(histItem);
        memoryHistory.set(cleanPhone, list);
        savedRecord = { type: 'income', id: histItem._id, amount: numAmount, item: 'income' };
      }
    }
  }

  // 7. Save assistant reply in Chat collection
  const assistantMsgObj = {
    phoneNumber: cleanPhone,
    role: 'assistant',
    text: aiReplyText,
    language: langCode,
    createdAt: new Date(),
  };

  if (isDbConnected) {
    await Chat.create(assistantMsgObj).catch((e) => console.warn('Chat save error:', e.message));
  } else {
    const list = memoryChatStore.get(cleanPhone) || [];
    list.push(assistantMsgObj);
    memoryChatStore.set(cleanPhone, list);
  }

  return res.json({
    reply: aiReplyText,
    language: langCode,
    action: extractedAction,
    savedRecord,
  });
});

export default router;
