import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Smartphone, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SmsSimulationPanel({ farmer, weather, crop = 'Paddy' }) {
  const { t } = useTranslation();

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'system',
      text: '[KisanMitra SMS] Welcome! Reply: WEATHER for forecast, PLAN for tasks, PRICE PADDY for mandi rates. Toll-Free: 1800-180-1551',
      time: '10:00 AM',
    },
  ]);

  // Pure rule-based SMS reply generator (Strictly < 160 chars, NO Gemini API)
  const generateRuleBasedReply = (query) => {
    const clean = (query || '').trim().toUpperCase();

    if (clean === 'WEATHER') {
      const temp = weather?.current?.temp || 30;
      const condition = weather?.current?.label || 'Clear';
      const humidity = weather?.current?.humidity || 65;
      const rain = weather?.current?.precipitation || 0;
      const district = farmer?.district || 'Your area';
      return `[KM Weather] ${district}: ${temp}°C, ${condition}, Humidity ${humidity}%, Rain ${rain}mm. Good spraying conditions before 11AM.`;
    }

    if (clean === 'PLAN') {
      const activeCrop = crop || farmer?.farm?.primaryCrop || 'Paddy';
      return `[KM Plan] ${activeCrop} Day 15: 1. Morning field & weed check. 2. Verify water flow in nursery. 3. Evening scouting for leaf folder.`;
    }

    if (clean.startsWith('PRICE')) {
      const parts = clean.split(' ');
      const targetCrop = parts[1] || crop || 'PADDY';
      const priceMap = {
        PADDY: { mandi: 'Nagpur APMC', rate: '2,420', trend: 'Rising' },
        WHEAT: { mandi: 'Indore Mandi', rate: '2,550', trend: 'Rising' },
        COTTON: { mandi: 'Rajkot APMC', rate: '7,450', trend: 'Rising' },
        SOYBEAN: { mandi: 'Dewas Mandi', rate: '4,820', trend: 'Rising' },
        GROUNDNUT: { mandi: 'Gondal APMC', rate: '6,680', trend: 'Rising' },
      };

      const info = priceMap[targetCrop] || { mandi: 'Local APMC', rate: '2,400', trend: 'Stable' };
      return `[KM Market] ${targetCrop}: Best rate at ${info.mandi} is Rs ${info.rate}/Qtl (${info.trend}). Good time to sell.`;
    }

    // Default HELP text
    return `[KM Help] Commands: WEATHER (forecast), PLAN (daily tasks), PRICE <crop> (e.g. PRICE SOYBEAN). Helpline: 18001801551`;
  };

  const handleSend = (textToSend) => {
    const text = (textToSend || inputMsg).trim();
    if (!text) return;

    const userBubble = {
      id: Date.now(),
      sender: 'user',
      text: text.slice(0, 160),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const replyText = generateRuleBasedReply(text).slice(0, 160);
    const replyBubble = {
      id: Date.now() + 1,
      sender: 'system',
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userBubble, replyBubble]);
    setInputMsg('');
  };

  const QUICK_COMMANDS = ['WEATHER', 'PLAN', `PRICE ${crop.toUpperCase()}`, 'PRICE SOYBEAN', 'HELP'];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-xl shadow-xs">
            💬
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              {t('sms.title')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('sms.subtitle')}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
          <Smartphone className="w-3 h-3 text-indigo-600" />
          <span>{t('sms.demoNotice')}</span>
        </span>
      </div>

      {/* Phone Style Message Container */}
      <div className="bg-stone-100 border border-stone-300/80 rounded-2xl p-3.5 max-h-72 overflow-y-auto space-y-2.5 text-xs shadow-inner">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 font-medium shadow-2xs ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                }`}
              >
                <p className="leading-relaxed break-words">{m.text}</p>
                <div className="flex items-center justify-between gap-2 mt-1 text-[9px] opacity-75">
                  <span>{t('sms.charCount', { count: m.text.length })}</span>
                  <span>{m.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Keyword Shortcuts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
          {t('sms.quickKeywords')}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => handleSend(cmd)}
              className="bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold px-2.5 py-1 rounded-xl text-xs border border-stone-300/80 transition-all shadow-2xs"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>

      {/* SMS Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            maxLength={160}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={t('sms.inputPlaceholder')}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 focus:border-indigo-600 focus:bg-white rounded-2xl text-xs font-semibold text-stone-900 outline-none transition-all placeholder:text-stone-400"
          />
          <span className="absolute right-3 top-2.5 text-[10px] text-stone-400 font-bold pointer-events-none">
            {160 - inputMsg.length}
          </span>
        </div>

        <button
          type="submit"
          disabled={!inputMsg.trim()}
          className="bg-indigo-700 hover:bg-indigo-800 active:scale-95 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-xs flex items-center gap-1.5 transition-all shrink-0"
        >
          <span>{t('sms.sendBtn')}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
