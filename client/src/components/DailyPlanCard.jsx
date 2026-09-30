import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Volume2, Sparkles, Calendar, Clock, Loader2, RefreshCw } from 'lucide-react';
import { getDailyPlan } from '../api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { isAppOnline, cacheData, getCachedData } from '../utils/offlineSync';

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

export default function DailyPlanCard({ farmer, crop = 'Paddy', weather }) {
  const { t } = useTranslation();
  const { currentLanguage, languageConfig } = useLanguage();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCached, setIsCached] = useState(false);

  const langCode = (currentLanguage || 'en').toLowerCase().slice(0, 2);
  const speechLang = languageConfig?.speechCode || SPEECH_LANG_MAP[langCode] || 'en-IN';

  const weatherSummary = weather?.current
    ? `${weather.current.label}, ${weather.current.temp}°C, Humidity ${weather.current.humidity}%`
    : 'Clear Weather 30°C';

  const fetchPlan = async () => {
    if (!farmer || !crop) return;
    const cleanPhone = (farmer.phoneNumber || '').replace(/\D/g, '');
    const cacheKey = `km_plan_${cleanPhone}_${crop}_${langCode}`;

    if (!isAppOnline()) {
      const cached = await getCachedData(cacheKey);
      if (cached && cached.tasks) {
        setTasks(cached.tasks);
        setIsCached(true);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await getDailyPlan(farmer.phoneNumber, crop, 15, weatherSummary, currentLanguage);
      if (res.tasks) {
        setTasks(res.tasks);
        setIsCached(res.isCached);
        await cacheData(cacheKey, { tasks: res.tasks, isCached: res.isCached });
      }
    } catch (err) {
      console.warn('Daily plan network error, checking cache:', err);
      const cached = await getCachedData(cacheKey);
      if (cached && cached.tasks) {
        setTasks(cached.tasks);
        setIsCached(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();

    const handleNetChange = () => fetchPlan();
    window.addEventListener('kisanmitra_network_change', handleNetChange);
    window.addEventListener('online', handleNetChange);

    return () => {
      window.removeEventListener('kisanmitra_network_change', handleNetChange);
      window.removeEventListener('online', handleNetChange);
    };
  }, [farmer?.phoneNumber, crop, currentLanguage]);

  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const speakAllTasks = () => {
    if (!('speechSynthesis' in window) || tasks.length === 0) return;
    try {
      window.speechSynthesis.cancel();
      const textToSpeak = tasks.map((t) => `${t.time}: ${t.task}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = speechLang;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center space-y-2">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-semibold text-stone-600">
          {t('plan.loading')}
        </p>
      </div>
    );
  }

  if (tasks.length === 0) return null;

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl text-lg">📋</span>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base text-stone-900 leading-tight">
                {t('plan.title')}
              </h3>
              {isCached && (
                <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-mono">
                  {t('plan.savedToday')}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              {crop} • {t('plan.dayAfterSowing', { day: 15 })}
            </p>
          </div>
        </div>

        {/* Read aloud button */}
        <button
          type="button"
          onClick={speakAllTasks}
          title={t('plan.listen')}
          className="p-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold border border-emerald-200"
        >
          <Volume2 className="w-4 h-4 text-emerald-700" />
          <span className="hidden sm:inline">{t('plan.listen')}</span>
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>{t('plan.completedProgress', { completed: completedCount, total: tasks.length })}</span>
        <span className="text-emerald-700 font-bold">{t('plan.percentDone', { percent: Math.round((completedCount / tasks.length) * 100) })}</span>
      </div>

      {/* Task Cards */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
              task.completed
                ? 'bg-stone-50 border-stone-200 opacity-60'
                : 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300'
            }`}
          >
            <div className="mt-0.5 text-emerald-700">
              {task.completed ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5 text-stone-400" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  {t(`plan.times.${task.time}`, { defaultValue: task.time })}
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border border-stone-200 text-stone-600 font-semibold">
                  {t(`plan.categories.${task.category}`, { defaultValue: task.category })}
                </span>
              </div>
              <p
                className={`text-sm leading-snug font-medium ${
                  task.completed ? 'line-through text-stone-400' : 'text-stone-800'
                }`}
              >
                {task.task}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
