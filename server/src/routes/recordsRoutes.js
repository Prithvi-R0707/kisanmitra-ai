import express from 'express';
import Farmer from '../models/Farmer.js';
import Farm from '../models/Farm.js';
import Expense from '../models/Expense.js';
import History from '../models/History.js';
import { isDbConnected } from '../config/db.js';
import { getLanguageName } from '../utils/languageHelper.js';
import {
  getFallbackReply,
  getExpenseConfirmedReply,
  getActivityConfirmedReply,
} from '../utils/multilingualReplies.js';

const router = express.Router();

export const PER_ACRE_COSTS = {
  Paddy: { seeds: 1200, fertilizer: 3500, labor: 4000, water: 1500, other: 1000 },
  Wheat: { seeds: 1500, fertilizer: 3000, labor: 3500, water: 1200, other: 800 },
  Cotton: { seeds: 2000, fertilizer: 4500, labor: 5000, water: 2000, other: 1500 },
  Groundnut: { seeds: 2500, fertilizer: 2800, labor: 3200, water: 1000, other: 900 },
  Soybean: { seeds: 1800, fertilizer: 2500, labor: 3000, water: 1000, other: 700 },
  Maize: { seeds: 1400, fertilizer: 3200, labor: 3500, water: 1200, other: 800 },
  Sugarcane: { seeds: 4000, fertilizer: 6000, labor: 7000, water: 4000, other: 2000 },
  default: { seeds: 1500, fertilizer: 3000, labor: 3500, water: 1500, other: 1000 },
};

export function calculateBudget(cropName = 'Paddy', acres = 1) {
  const normAcres = Math.max(0.25, Number(acres) || 1);
  const base = PER_ACRE_COSTS[cropName] || PER_ACRE_COSTS.default;
  const seeds = Math.round(base.seeds * normAcres);
  const fertilizer = Math.round(base.fertilizer * normAcres);
  const labor = Math.round(base.labor * normAcres);
  const water = Math.round(base.water * normAcres);
  const other = Math.round(base.other * normAcres);
  const total = seeds + fertilizer + labor + water + other;
  return {
    crop: cropName,
    acres: normAcres,
    seeds,
    fertilizer,
    labor,
    water,
    other,
    total,
  };
}

// Fallback in-memory store
export const memoryExpenses = new Map();
export const memoryHistory = new Map();
export const memoryBudgets = new Map();

// Helper to calculate category breakdown
function calculateBreakdown(expenses) {
  const breakdown = {};
  let total = 0;
  for (const exp of expenses) {
    const cat = exp.category || 'other';
    breakdown[cat] = (breakdown[cat] || 0) + Number(exp.amount || 0);
    total += Number(exp.amount || 0);
  }
  return { breakdown, total };
}

// 1. Get Expenses, Farm History & Season Budget
router.get('/', async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    const cleanPhone = phone.trim().slice(-10);

    let expenses = [];
    let history = [];
    let budget = null;

    if (isDbConnected) {
      expenses = await Expense.find({ phoneNumber: cleanPhone }).sort({ date: -1 }).limit(30).lean();
      history = await History.find({ phoneNumber: cleanPhone }).sort({ date: -1 }).limit(30).lean();
      const farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
      if (farmer) {
        const farm = await Farm.findOne({ farmerId: farmer._id }).lean();
        if (farm?.budget?.total) {
          budget = farm.budget;
        } else {
          budget = calculateBudget(farm?.primaryCrop || 'Paddy', farm?.totalAcreage || 1);
        }
      }
    } else {
      expenses = memoryExpenses.get(cleanPhone) || [];
      history = memoryHistory.get(cleanPhone) || [];
      budget = memoryBudgets.get(cleanPhone) || calculateBudget('Paddy', 1);
    }

    if (!budget) {
      budget = calculateBudget('Paddy', 1);
    }

    // If completely empty, insert small helpful initial entries (max 3 items)
    if (expenses.length === 0 && history.length === 0) {
      const defaultExp = [
        {
          phoneNumber: cleanPhone,
          category: 'seeds',
          amount: 800,
          description: '',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          phoneNumber: cleanPhone,
          category: 'fertilizer',
          amount: 650,
          description: '',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];
      const defaultHist = [
        {
          phoneNumber: cleanPhone,
          action: 'sowing',
          type: 'activity',
          crop: 'Paddy',
          details: '',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];

      if (isDbConnected) {
        await Expense.insertMany(defaultExp).catch(() => {});
        await History.insertMany(defaultHist).catch(() => {});
        expenses = await Expense.find({ phoneNumber: cleanPhone }).sort({ date: -1 }).lean();
        history = await History.find({ phoneNumber: cleanPhone }).sort({ date: -1 }).lean();
      } else {
        memoryExpenses.set(cleanPhone, defaultExp);
        memoryHistory.set(cleanPhone, defaultHist);
        expenses = defaultExp;
        history = defaultHist;
      }
    }

    const { breakdown, total } = calculateBreakdown(expenses);

    return res.json({
      expenses,
      totalSpent: total,
      categoryBreakdown: breakdown,
      history,
      budget,
    });
  } catch (err) {
    console.error('records error:', err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// 2. Save / Calculate Season Budget
router.post('/budget', async (req, res) => {
  try {
    const { phone, crop = 'Paddy', acres = 1 } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    const cleanPhone = phone.trim().slice(-10);

    const calculated = calculateBudget(crop, acres);

    if (isDbConnected) {
      const farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
      if (farmer) {
        await Farm.findOneAndUpdate(
          { farmerId: farmer._id },
          {
            primaryCrop: crop,
            totalAcreage: calculated.acres,
            budget: calculated,
          },
          { upsert: true, new: true }
        );
      }
    } else {
      memoryBudgets.set(cleanPhone, calculated);
    }

    return res.json({ success: true, budget: calculated });
  } catch (err) {
    console.error('budget calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate budget' });
  }
});

// 3. Add Manual Expense
router.post('/expense', async (req, res) => {
  try {
    const { phone, category = 'other', amount, description = '', date } = req.body;
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount are required' });
    }
    const cleanPhone = phone.trim().slice(-10);
    const numAmount = Math.max(0, Number(amount));
    const entryDate = date ? new Date(date) : new Date();

    const expItem = {
      phoneNumber: cleanPhone,
      category,
      amount: numAmount,
      description,
      date: entryDate,
    };

    const histItem = {
      phoneNumber: cleanPhone,
      action: 'expense',
      type: 'expense',
      amount: numAmount,
      details: description || category,
      date: entryDate,
    };

    if (isDbConnected) {
      const savedExp = await Expense.create(expItem);
      await History.create(histItem).catch(() => {});
      return res.status(201).json({ success: true, expense: savedExp });
    } else {
      const expList = memoryExpenses.get(cleanPhone) || [];
      expList.unshift(expItem);
      memoryExpenses.set(cleanPhone, expList);

      const histList = memoryHistory.get(cleanPhone) || [];
      histList.unshift(histItem);
      memoryHistory.set(cleanPhone, histList);

      return res.status(201).json({ success: true, expense: expItem });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// 4. Add Farm History Event (sowing, watering, fertilizer, spray, harvest, expense, income)
router.post('/history', async (req, res) => {
  try {
    const { phone, action = 'sowing', crop = '', details = '', date, amount, type = 'activity' } = req.body;
    if (!phone || !action) {
      return res.status(400).json({ error: 'Phone and action are required' });
    }
    const cleanPhone = phone.trim().slice(-10);
    const entryDate = date ? new Date(date) : new Date();

    const histItem = {
      phoneNumber: cleanPhone,
      action: action.toLowerCase(),
      crop,
      details,
      amount: amount ? Number(amount) : null,
      type,
      date: entryDate,
    };

    if (isDbConnected) {
      const saved = await History.create(histItem);
      if (crop) {
        const farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
        if (farmer) await Farm.findOneAndUpdate({ farmerId: farmer._id }, { primaryCrop: crop });
      }
      return res.status(201).json({ success: true, history: saved });
    } else {
      const list = memoryHistory.get(cleanPhone) || [];
      list.unshift(histItem);
      memoryHistory.set(cleanPhone, list);
      return res.status(201).json({ success: true, history: histItem });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to record history' });
  }
});

// 5. Undo Last Action / Specific Record
router.post('/undo', async (req, res) => {
  try {
    const { phone, recordId, type = 'expense' } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone is required' });
    const cleanPhone = phone.trim().slice(-10);

    if (isDbConnected) {
      if (recordId) {
        if (type === 'expense') {
          const exp = await Expense.findByIdAndDelete(recordId);
          if (exp) {
            await History.findOneAndDelete({ phoneNumber: cleanPhone, amount: exp.amount, action: 'expense' });
          }
        } else {
          await History.findByIdAndDelete(recordId);
        }
      } else {
        // Remove most recent
        if (type === 'expense') {
          const lastExp = await Expense.findOne({ phoneNumber: cleanPhone }).sort({ createdAt: -1 });
          if (lastExp) {
            await Expense.findByIdAndDelete(lastExp._id);
            await History.findOneAndDelete({ phoneNumber: cleanPhone, amount: lastExp.amount, action: 'expense' });
          }
        } else {
          const lastHist = await History.findOne({ phoneNumber: cleanPhone }).sort({ createdAt: -1 });
          if (lastHist) await History.findByIdAndDelete(lastHist._id);
        }
      }
    } else {
      if (type === 'expense') {
        const list = memoryExpenses.get(cleanPhone) || [];
        if (list.length > 0) {
          list.shift();
          memoryExpenses.set(cleanPhone, list);
        }
      } else {
        const list = memoryHistory.get(cleanPhone) || [];
        if (list.length > 0) {
          list.shift();
          memoryHistory.set(cleanPhone, list);
        }
      }
    }

    return res.json({ success: true, undone: true });
  } catch (err) {
    console.error('undo error:', err);
    res.status(500).json({ error: 'Failed to undo record' });
  }
});

// Core Natural-Language Processing function (used by /api/records/natural-update and /api/chat)
export async function processNaturalUpdate(cleanPhone, text, clientLang = null) {
  let farmer = null;
  if (isDbConnected) {
    farmer = await Farmer.findOne({ phoneNumber: cleanPhone }).lean();
  }
  const farmerName = farmer?.name || 'Farmer';
  const langCode = (clientLang || farmer?.selectedLanguage?.code || 'en').toLowerCase().slice(0, 2);
  const farmerLang = (clientLang && getLanguageName(clientLang)) || farmer?.selectedLanguage?.name || getLanguageName(langCode);

  let parsed = null;
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (apiKey) {
    try {
      const prompt = `You are KisanMitra. A farmer says: "${text.trim()}".
Extract structured agricultural information from this statement.
Respond ONLY with a valid JSON object with this exact structure:
{
  "type": "expense" | "history" | "both" | "unknown",
  "expense": {
    "category": "seeds" | "fertilizer" | "pesticide" | "labor" | "machinery" | "fuel" | "irrigation" | "other",
    "amount": <number or null>,
    "description": "<short item description>"
  },
  "history": {
    "action": "<short farm action like Sowing, Spraying, Weeding, Harvesting>",
    "crop": "<crop name or empty>",
    "details": "<short detail>"
  },
  "farmerReply": "<1 friendly sentence in ${farmerLang} acknowledging what was recorded, using farmer's name ${farmerName}>"
}
Do not include markdown or backticks.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        parsed = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Gemini natural-update error:', e.message);
    }
  }

  // Rule-based fallback parser if Gemini is unavailable
  if (!parsed || !parsed.type) {
    const lower = text.toLowerCase();
    const numMatch = text.match(/(\d+[\d,]*)/);
    const amount = numMatch ? Number(numMatch[1].replace(/,/g, '')) : null;

    if (amount && (lower.includes('spent') || lower.includes('खर्च') || lower.includes('ரூபாய்') || lower.includes('cost') || lower.includes('rs') || lower.includes('bought') || lower.includes('வாங்கினேன்'))) {
      let cat = 'other';
      if (lower.includes('seed') || lower.includes('बीज') || lower.includes('விதை')) cat = 'seeds';
      else if (lower.includes('fertilizer') || lower.includes('खाद') || lower.includes('உரம்')) cat = 'fertilizer';
      else if (lower.includes('pesticide') || lower.includes('दवा') || lower.includes('மருந்து')) cat = 'pesticide';
      else if (lower.includes('labor') || lower.includes('मजदूरी') || lower.includes('கூலி')) cat = 'labor';
      else if (lower.includes('tractor') || lower.includes('machinery') || lower.includes('ट्रैक्टर')) cat = 'machinery';
      else if (lower.includes('diesel') || lower.includes('fuel') || lower.includes('डीजल')) cat = 'fuel';

      parsed = {
        type: 'expense',
        expense: { category: cat, amount, description: text.trim() },
        history: null,
        farmerReply: getExpenseConfirmedReply(langCode, farmerName, amount, cat),
      };
    } else if (lower.includes('sow') || lower.includes('बोया') || lower.includes('விதைத்தேன்') || lower.includes('spray') || lower.includes('छिड़काव') || lower.includes('harvest') || lower.includes('कटाई')) {
      let crop = '';
      if (lower.includes('paddy') || lower.includes('धान') || lower.includes('நெல்')) crop = 'Paddy';
      else if (lower.includes('wheat') || lower.includes('गेहूं')) crop = 'Wheat';
      else if (lower.includes('cotton') || lower.includes('कपास') || lower.includes('பருத்தி')) crop = 'Cotton';

      parsed = {
        type: 'history',
        expense: null,
        history: { action: 'sowing', crop, details: text.trim() },
        farmerReply: getActivityConfirmedReply(langCode, farmerName, 'sowing'),
      };
    }
  }

  let savedRecord = null;

  // Save extracted Expense
  if (parsed && (parsed.type === 'expense' || parsed.type === 'both') && parsed.expense?.amount) {
    const expItem = {
      phoneNumber: cleanPhone,
      category: parsed.expense.category || 'other',
      amount: parsed.expense.amount,
      description: parsed.expense.description || text.trim(),
      date: new Date(),
    };
    if (isDbConnected) {
      const expDoc = await Expense.create(expItem).catch(() => {});
      if (expDoc) {
        await History.create({
          phoneNumber: cleanPhone,
          action: 'expense',
          type: 'expense',
          amount: expItem.amount,
          details: expItem.description,
          date: new Date(),
        }).catch(() => {});
        savedRecord = { type: 'expense', id: expDoc._id, amount: expItem.amount, item: expItem.category };
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
        amount: expItem.amount,
        details: expItem.description,
        date: new Date(),
      });
      memoryHistory.set(cleanPhone, histList);

      savedRecord = { type: 'expense', id: expItem._id, amount: expItem.amount, item: expItem.category };
    }
  }

  // Save extracted History
  if (parsed && (parsed.type === 'history' || parsed.type === 'both') && parsed.history) {
    const histItem = {
      phoneNumber: cleanPhone,
      action: parsed.history.action || 'sowing',
      crop: parsed.history.crop || '',
      details: parsed.history.details || text.trim(),
      type: 'activity',
      date: new Date(),
    };
    if (isDbConnected) {
      const histDoc = await History.create(histItem).catch(() => {});
      if (histDoc) {
        savedRecord = savedRecord || { type: 'history', id: histDoc._id, item: histItem.action };
      }
      if (histItem.crop) {
        const farmerObj = await Farmer.findOne({ phoneNumber: cleanPhone });
        if (farmerObj) await Farm.findOneAndUpdate({ farmerId: farmerObj._id }, { primaryCrop: histItem.crop });
      }
    } else {
      histItem._id = 'mem_hist_' + Date.now();
      const list = memoryHistory.get(cleanPhone) || [];
      list.unshift(histItem);
      memoryHistory.set(cleanPhone, list);
      savedRecord = savedRecord || { type: 'history', id: histItem._id, item: histItem.action };
    }
  }

  if (parsed) {
    parsed.savedRecord = savedRecord;
  }
  return parsed;
}

// 4. Natural-Language Updates using Gemini
router.post('/natural-update', async (req, res) => {
  try {
    const { phone, text, language } = req.body;
    if (!phone || !text || !text.trim()) {
      return res.status(400).json({ error: 'Phone and text are required' });
    }
    const cleanPhone = phone.trim().slice(-10);
    const parsed = await processNaturalUpdate(cleanPhone, text, language);

    const defaultReply = getFallbackReply((language || 'en').slice(0, 2), 'Farmer');
    return res.json({
      success: true,
      parsed,
      savedRecord: parsed?.savedRecord || null,
      farmerReply: parsed?.farmerReply || defaultReply,
    });
  } catch (err) {
    console.error('natural-update error:', err);
    res.status(500).json({ error: 'Failed to process natural update' });
  }
});

export default router;
