import React, { useState, useEffect, useRef } from 'react';
import {
  IndianRupee,
  Clock,
  Plus,
  Mic,
  MicOff,
  Send,
  Sparkles,
  TrendingDown,
  Calendar,
  Tag,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Volume2,
  Calculator
} from 'lucide-react';
import { getRecords, addExpense, addHistory, saveBudget, undoRecord, submitNaturalUpdate } from '../api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { isAppOnline, queueOfflineEntry, cacheData, getCachedData, getPendingEntries } from '../utils/offlineSync';

const CATEGORY_ICONS = {
  seeds: '🌰',
  fertilizer: '🧪',
  pesticide: '🛡️',
  labor: '👥',
  machinery: '🚜',
  fuel: '⛽',
  irrigation: '💧',
  water: '💧',
  other: '📦',
};

const ACTION_ICONS = {
  sowing: '🌱',
  watering: '💧',
  fertilizer: '🧪',
  spray: '🛡️',
  harvest: '🌾',
  expense: '💸',
  income: '💰',
  diagnosis: '🔬',
  other: '📋',
};

const COMMON_CROPS = [
  'Paddy',
  'Wheat',
  'Cotton',
  'Groundnut',
  'Soybean',
  'Maize',
  'Sugarcane',
];

const PER_ACRE_COSTS = {
  Paddy: { seeds: 1200, fertilizer: 3500, labor: 4000, water: 1500, other: 1000 },
  Wheat: { seeds: 1500, fertilizer: 3000, labor: 3500, water: 1200, other: 800 },
  Cotton: { seeds: 2000, fertilizer: 4500, labor: 5000, water: 2000, other: 1500 },
  Groundnut: { seeds: 2500, fertilizer: 2800, labor: 3200, water: 1000, other: 900 },
  Soybean: { seeds: 1800, fertilizer: 2500, labor: 3000, water: 1000, other: 700 },
  Maize: { seeds: 1400, fertilizer: 3200, labor: 3500, water: 1200, other: 800 },
  Sugarcane: { seeds: 4000, fertilizer: 6000, labor: 7000, water: 4000, other: 2000 },
  default: { seeds: 1500, fertilizer: 3000, labor: 3500, water: 1500, other: 1000 },
};

const SPEECH_LANG_MAP = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  or: 'or-IN',
  en: 'en-IN',
};

export default function RecordsTracker({ farmer, onCropUpdated }) {
  const { t } = useTranslation();
  const { currentLanguage, languageConfig } = useLanguage();
  const [records, setRecords] = useState({ expenses: [], totalSpent: 0, categoryBreakdown: {}, history: [], budget: null });
  const [loading, setLoading] = useState(true);
  const [naturalText, setNaturalText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [lastSavedRecord, setLastSavedRecord] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'history'

  // Budget Calculator state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [calcCrop, setCalcCrop] = useState(farmer?.farm?.primaryCrop || 'Paddy');
  const [calcAcres, setCalcAcres] = useState(farmer?.farm?.totalAcreage || 1);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Manual Add Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'expense' | 'history'
  const [formCategory, setFormCategory] = useState('seeds');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDesc, setFormDesc] = useState('');
  const [formAction, setFormAction] = useState('sowing');
  const [formCrop, setFormCrop] = useState('');

  const recognitionRef = useRef(null);
  const langCode = (currentLanguage || 'en').toLowerCase().slice(0, 2);
  const speechLang = languageConfig?.speechCode || SPEECH_LANG_MAP[langCode] || 'en-IN';

  const loadData = async () => {
    if (!farmer?.phoneNumber) return;
    setLoading(true);
    const cleanPhone = farmer.phoneNumber.slice(-10);
    const cacheKey = `km_records_${cleanPhone}`;

    let baseRecords = { expenses: [], totalSpent: 0, categoryBreakdown: {}, history: [], budget: null };

    if (isAppOnline()) {
      try {
        const data = await getRecords(farmer.phoneNumber);
        baseRecords = data;
        await cacheData(cacheKey, data);
      } catch (err) {
        console.warn('Failed to load records from server, checking cache:', err);
        const cached = await getCachedData(cacheKey);
        if (cached) baseRecords = cached;
      }
    } else {
      const cached = await getCachedData(cacheKey);
      if (cached) baseRecords = cached;
    }

    // Merge pending offline entries
    const pending = await getPendingEntries(farmer.phoneNumber);
    const pendingExpenses = pending.filter((p) => p.type === 'expense' || p.category);
    const pendingHistory = pending.filter((p) => p.type !== 'expense' && !p.category);

    const mergedExpenses = [...pendingExpenses, ...(baseRecords.expenses || [])];
    const mergedHistory = [...pending, ...(baseRecords.history || [])];

    let extraSpent = 0;
    const extraBreakdown = { ...(baseRecords.categoryBreakdown || {}) };
    for (const pe of pendingExpenses) {
      const amt = Number(pe.amount) || 0;
      extraSpent += amt;
      const cat = pe.category || 'other';
      extraBreakdown[cat] = (extraBreakdown[cat] || 0) + amt;
    }

    setRecords({
      ...baseRecords,
      expenses: mergedExpenses,
      history: mergedHistory,
      totalSpent: (baseRecords.totalSpent || 0) + extraSpent,
      categoryBreakdown: extraBreakdown,
    });

    if (baseRecords.budget) {
      if (baseRecords.budget.crop) setCalcCrop(baseRecords.budget.crop);
      if (baseRecords.budget.acres) setCalcAcres(baseRecords.budget.acres);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleSynced = () => loadData();
    const handleNet = () => loadData();
    window.addEventListener('kisanmitra_synced', handleSynced);
    window.addEventListener('kisanmitra_network_change', handleNet);
    window.addEventListener('online', handleSynced);

    return () => {
      window.removeEventListener('kisanmitra_synced', handleSynced);
      window.removeEventListener('kisanmitra_network_change', handleNet);
      window.removeEventListener('online', handleSynced);
    };
  }, [farmer?.phoneNumber]);

  // Voice Speech Recognition for Natural Updates
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('call.voiceUnsupportedNotice'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNaturalText(transcript);
          handleNaturalSubmit(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Submit Natural Language Update (Gemini-powered)
  const handleNaturalSubmit = async (overrideText) => {
    const textToSubmit = overrideText || naturalText;
    if (!textToSubmit || !textToSubmit.trim() || isProcessing) return;

    setIsProcessing(true);
    setFeedbackMsg('');
    try {
      const lang = currentLanguage || farmer?.selectedLanguage?.code || 'en';
      const res = await submitNaturalUpdate(farmer.phoneNumber, textToSubmit.trim(), lang);
      setNaturalText('');
      setFeedbackMsg(res.farmerReply || t('records.recordedSuccess'));
      setLastSavedRecord(res.savedRecord || null);

      // Voice readout of confirmation
      if ('speechSynthesis' in window && res.farmerReply) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(res.farmerReply);
          utterance.lang = speechLang;
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        } catch (e) {}
      }

      if (res.parsed?.history?.crop && onCropUpdated) {
        onCropUpdated(res.parsed.history.crop);
      }

      loadData();
    } catch (err) {
      setFeedbackMsg(t('records.processFailed'));
      setLastSavedRecord(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Undo Last Action from feedback banner
  const handleUndoLast = async () => {
    if (!lastSavedRecord || !farmer?.phoneNumber) return;
    try {
      await undoRecord(farmer.phoneNumber, lastSavedRecord.id, lastSavedRecord.type);
      setLastSavedRecord(null);
      setFeedbackMsg(t('records.undoSuccess'));
      loadData();
    } catch (e) {
      console.warn('Undo error:', e);
    }
  };

  // Save Calculated Budget
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!farmer?.phoneNumber) return;
    setIsSavingBudget(true);
    try {
      const res = await saveBudget(farmer.phoneNumber, calcCrop, Number(calcAcres) || 1);
      if (res.budget) {
        setRecords((prev) => ({ ...prev, budget: res.budget }));
      }
      setShowBudgetModal(false);
      loadData();
    } catch (err) {
      console.warn('Failed to save budget:', err);
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Manual Add Form Submit
  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (modalType === 'expense') {
      if (!formAmount) return;
      if (!isAppOnline()) {
        await queueOfflineEntry(farmer.phoneNumber, {
          type: 'expense',
          category: formCategory,
          amount: Number(formAmount),
          description: formDesc,
          date: formDate,
        });
      } else {
        await addExpense(farmer.phoneNumber, formCategory, formAmount, formDesc, formDate);
      }
    } else {
      if (!formAction) return;
      const type = formAction === 'expense' ? 'expense' : formAction === 'income' ? 'income' : 'activity';
      if (!isAppOnline()) {
        await queueOfflineEntry(farmer.phoneNumber, {
          type,
          action: formAction,
          crop: formCrop,
          details: formDesc,
          date: formDate,
          amount: formAmount ? Number(formAmount) : null,
        });
      } else {
        await addHistory(farmer.phoneNumber, formAction, formCrop, formDesc, formDate, formAmount || null, type);
      }
      if (formCrop && onCropUpdated) onCropUpdated(formCrop);
    }
    setShowAddModal(false);
    setFormAmount('');
    setFormDesc('');
    setFormCrop('');
    loadData();
  };

  // Calculate live budget estimates for the calculator preview
  const baseCost = PER_ACRE_COSTS[calcCrop] || PER_ACRE_COSTS.default;
  const normAcres = Math.max(0.25, parseFloat(calcAcres) || 1);
  const estSeeds = Math.round(baseCost.seeds * normAcres);
  const estFertilizer = Math.round(baseCost.fertilizer * normAcres);
  const estLabor = Math.round(baseCost.labor * normAcres);
  const estWater = Math.round(baseCost.water * normAcres);
  const estOther = Math.round(baseCost.other * normAcres);
  const estTotal = estSeeds + estFertilizer + estLabor + estWater + estOther;

  // Budget progress calculations
  const budgetTotal = records.budget?.total || 0;
  const spentPercent = budgetTotal > 0 ? Math.round((records.totalSpent / budgetTotal) * 100) : 0;
  const isWarning = spentPercent >= 80;
  const isOverBudget = spentPercent >= 100;
  const remainingBudget = Math.max(0, budgetTotal - records.totalSpent);

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl text-lg">💰</span>
          <div>
            <h3 className="font-bold text-base text-stone-900 leading-tight">
              {t('records.title')}
            </h3>
            <p className="text-xs text-stone-500">
              {t('records.subtitle')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalType(activeTab === 'expenses' ? 'expense' : 'history');
            setShowAddModal(true);
          }}
          className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{activeTab === 'expenses' ? t('records.addExpense') : t('records.addActivity')}</span>
        </button>
      </div>

      {/* 1. Natural Language Voice/Text Bar */}
      <div className="bg-emerald-950 text-white rounded-2xl p-3.5 space-y-2 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('records.naturalPrompt')}</span>
          </span>
          <span className="text-[10px] text-emerald-400/80 font-mono">Gemini AI</span>
        </div>

        <p className="text-[11px] text-stone-300">
          {t('records.naturalHint')}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? t('call.stopListening') : t('call.tapToSpeak')}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-90 ${
              isListening
                ? 'bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNaturalSubmit();
            }}
            className="flex-1 flex items-center gap-1.5"
          >
            <input
              type="text"
              value={naturalText}
              onChange={(e) => setNaturalText(e.target.value)}
              placeholder={t('records.naturalInputPlaceholder')}
              className="flex-1 bg-stone-900 border border-stone-700 focus:border-emerald-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-stone-500 outline-none"
            />
            <button
              type="submit"
              disabled={!naturalText.trim() || isProcessing}
              className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>

        {/* Feedback message banner with Undo button */}
        {feedbackMsg && (
          <div className="p-2.5 bg-emerald-900/90 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="flex-1">{feedbackMsg}</p>
            </div>
            {lastSavedRecord && (
              <button
                type="button"
                onClick={handleUndoLast}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg font-bold text-xs shrink-0 active:scale-95 transition-all shadow-xs"
              >
                {t('common.undo')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Budget Calculator & Spent vs Budget Tracker */}
      <div className="bg-gradient-to-r from-emerald-50 via-stone-50 to-stone-100 p-4 rounded-2xl border border-emerald-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-500 font-semibold block">{t('records.spentVsBudget')}</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-stone-900 flex items-center">
                <IndianRupee className="w-5 h-5 inline text-emerald-800" />
                <span>{records.totalSpent.toLocaleString('en-IN')}</span>
              </span>
              <span className="text-xs text-stone-500 font-medium">
                / ₹{budgetTotal.toLocaleString('en-IN')}
                {records.budget?.crop && ` (${t(`crops.names.${records.budget.crop}`, { defaultValue: records.budget.crop })} • ${records.budget.acres || 1} ${t('records.acresLabel')})`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBudgetModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t('records.calculatorTitle')}</span>
          </button>
        </div>

        {/* Progress Bar (warning colour above 80%) */}
        <div className="space-y-1.5">
          <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-red-600'
                  : isWarning
                  ? 'bg-amber-500'
                  : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, spentPercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium">
            <span className={`font-bold flex items-center gap-1 ${
              isOverBudget ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-emerald-700'
            }`}>
              {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
              <span>
                {isOverBudget
                  ? t('records.budgetExceeded')
                  : isWarning
                  ? t('records.budgetWarning')
                  : t('records.budgetNormal')}
              </span>
            </span>

            <span className="text-stone-500 font-mono">
              {spentPercent}% • {t('records.remaining')}: ₹{remainingBudget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Category Breakdown Badges */}
        {Object.keys(records.categoryBreakdown).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-stone-200/60">
            {Object.entries(records.categoryBreakdown).map(([cat, amount]) => (
              <span
                key={cat}
                className="text-[11px] bg-white border border-stone-200 px-2.5 py-0.5 rounded-full font-semibold text-stone-700 shadow-2xs"
              >
                {CATEGORY_ICONS[cat] || '📦'} {t(`records.categories.${cat.toUpperCase()}`, { defaultValue: cat })}: ₹{amount}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 3. Tabs: Expenses vs Farm Timeline */}
      <div className="flex border-b border-stone-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className={`pb-2 px-3 border-b-2 transition-all ${
            activeTab === 'expenses'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          {t('records.tabExpenses', { count: records.expenses.length })}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-3 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-400 hover:text-stone-700'
          }`}
        >
          {t('records.tabHistory', { count: records.history.length })}
        </button>
      </div>

      {/* Tab 1: Expense List */}
      {activeTab === 'expenses' && (
        <div className="space-y-2">
          {records.expenses.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4">{t('records.noExpenses')}</p>
          ) : (
            records.expenses.map((exp, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl p-1 bg-white rounded-xl border border-stone-200">
                    {CATEGORY_ICONS[exp.category] || '📦'}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-bold text-stone-800 capitalize">
                        {t(`records.categories.${exp.category.toUpperCase()}`, { defaultValue: exp.category })}
                      </h5>
                      {exp.status === 'pending' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>⏳</span>
                          <span>{t('common.pendingBadge')}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-stone-500 text-[11px] truncate max-w-[180px]">
                      {exp.description || t(`records.categories.${exp.category.toUpperCase()}`, { defaultValue: exp.category })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-stone-900">
                    ₹{exp.amount}
                  </span>
                  <p className="text-[10px] text-stone-400 font-mono">
                    {new Date(exp.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Farm History Timeline (sowing, watering, fertilizer, spray, harvest, expense, income) */}
      {activeTab === 'history' && (
        <div className="relative pl-5 border-l-2 border-emerald-300 space-y-4 my-2">
          {records.history.length === 0 ? (
            <p className="text-xs text-stone-400 py-2">{t('records.noHistory')}</p>
          ) : (
            records.history.map((hist, idx) => {
              const actKey = (hist.action || 'sowing').toLowerCase();
              const icon = ACTION_ICONS[actKey] || ACTION_ICONS.other;
              return (
                <div key={idx} className="relative group">
                  {/* Timeline node */}
                  <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <span>{icon}</span>
                        <span>{t(`records.actions.${actKey.toUpperCase()}`, { defaultValue: hist.action })}</span>
                      </span>
                      {hist.status === 'pending' && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                          <span>⏳</span>
                          <span>{t('common.pendingBadge')}</span>
                        </span>
                      )}
                      {hist.crop && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                          {t(`crops.names.${hist.crop}`, { defaultValue: hist.crop })}
                        </span>
                      )}
                      {hist.amount && (
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                          actKey === 'income' || hist.type === 'income'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200/80 text-stone-800'
                        }`}>
                          {actKey === 'income' || hist.type === 'income' ? '+' : '-'}₹{hist.amount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">{hist.details}</p>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(hist.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Budget Calculator Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 rounded-xl text-base">🧮</span>
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {t('records.calculatorTitle')}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {t('records.calculatorSubtitle')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBudgetModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('records.cropLabel')}
                </label>
                <select
                  value={calcCrop}
                  onChange={(e) => setCalcCrop(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800"
                >
                  {COMMON_CROPS.map((c) => (
                    <option key={c} value={c}>
                      {t(`crops.names.${c}`, { defaultValue: c })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">
                  {t('records.acresLabel')}
                </label>
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  required
                  placeholder={t('records.acresPlaceholder')}
                  value={calcAcres}
                  onChange={(e) => setCalcAcres(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold text-stone-800"
                />
              </div>

              {/* Live Cost Breakdown Table */}
              <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  {t('records.spentVsBudget')}
                </span>
                <div className="flex justify-between text-stone-600">
                  <span>🌰 {t('records.costSeeds')}</span>
                  <span className="font-bold">₹{estSeeds.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>🧪 {t('records.costFertilizer')}</span>
                  <span className="font-bold">₹{estFertilizer.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>👥 {t('records.costLabor')}</span>
                  <span className="font-bold">₹{estLabor.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>💧 {t('records.costWater')}</span>
                  <span className="font-bold">₹{estWater.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>📦 {t('records.costOther')}</span>
                  <span className="font-bold">₹{estOther.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-900 pt-1 border-t border-stone-200 text-sm">
                  <span>{t('records.seasonBudget')}</span>
                  <span>₹{estTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingBudget}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {isSavingBudget ? t('common.loading') : t('records.calculateBtn')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Modal (Expense or History) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h4 className="font-bold text-stone-900 text-sm">
                {modalType === 'expense' ? t('records.addExpense') : t('records.addActivity')}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              {modalType === 'expense' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.category')}</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    >
                      {Object.keys(CATEGORY_ICONS).filter((c) => c !== 'water').map((c) => (
                        <option key={c} value={c}>{CATEGORY_ICONS[c]} {t(`records.categories.${c.toUpperCase()}`, { defaultValue: c.toUpperCase() })}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.amount')} (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder={t('records.amountPlaceholder')}
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.dateLabel')}</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.descOptional')}</label>
                    <input
                      type="text"
                      placeholder={t('records.descPlaceholder')}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.actionActivity')}</label>
                    <select
                      value={formAction}
                      onChange={(e) => setFormAction(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    >
                      {['sowing', 'watering', 'fertilizer', 'spray', 'harvest', 'expense', 'income'].map((act) => (
                        <option key={act} value={act}>
                          {ACTION_ICONS[act]} {t(`records.actions.${act.toUpperCase()}`, { defaultValue: act })}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.cropOptional')}</label>
                    <select
                      value={formCrop}
                      onChange={(e) => setFormCrop(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    >
                      <option value="">{t('common.select')}</option>
                      {COMMON_CROPS.map((c) => (
                        <option key={c} value={c}>
                          {t(`crops.names.${c}`, { defaultValue: c })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(formAction === 'expense' || formAction === 'income') && (
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.amount')} (₹)</label>
                      <input
                        type="number"
                        placeholder={t('records.amountPlaceholder')}
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-bold"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.dateLabel')}</label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 uppercase mb-1">{t('records.details')}</label>
                    <input
                      type="text"
                      placeholder={t('records.detailsPlaceholder')}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {t('common.save')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
