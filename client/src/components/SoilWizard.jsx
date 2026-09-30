import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, ChevronLeft, Sparkles, Sprout, Loader2 } from 'lucide-react';
import { getSoilQuestions, submitSoilProfile } from '../api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export default function SoilWizard({ farmer, existingSoil, onSoilDetermined }) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [soilResult, setSoilResult] = useState(existingSoil || null);

  const langCode = (currentLanguage || farmer?.selectedLanguage?.code || 'en').toLowerCase().slice(0, 2);

  useEffect(() => {
    setLoading(true);
    getSoilQuestions(langCode)
      .then((res) => {
        if (res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        }
      })
      .finally(() => setLoading(false));
  }, [langCode]);

  const handleSelectOption = (questionId, optionId) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all 5 questions
      handleSubmit(updated);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const res = await submitSoilProfile(farmer.phoneNumber, finalAnswers);
      setSoilResult(res);
      if (onSoilDetermined) {
        onSoilDetermined(res);
      }
    } catch (err) {
      console.error('Soil submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200 text-center space-y-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-semibold text-stone-600">{t('soil.loading')}</p>
      </div>
    );
  }

  // If soil is already determined
  if (soilResult && soilResult.soilType) {
    return (
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-900 text-xl">🌱</span>
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
                {t('soil.badge')}
              </span>
              <h3 className="text-xl font-bold text-stone-900 capitalize">
                {t(`soil.types.${soilResult.soilType}.name`, { defaultValue: soilResult.details?.name || `${soilResult.soilType} Soil` })}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSoilResult(null);
              setCurrentIndex(0);
              setAnswers({});
            }}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
          >
            {t('soil.retest')}
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-2xl border border-stone-200/70">
          {t(`soil.types.${soilResult.soilType}.desc`, { defaultValue: soilResult.details?.description || 'Your soil is mapped and saved to your farm profile.' })}
        </p>
      </div>
    );
  }

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
      {/* Progress & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>{t('soil.knowYourSoil')} ({t('soil.questionProgress', { current: currentIndex + 1, total: questions.length })})</span>
        </div>
        <span className="text-xs font-semibold text-stone-400">
          {Math.round(((currentIndex + 1) / questions.length) * 100)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Title & Subtitle */}
      <div>
        <h3 className="text-lg font-bold text-stone-900 leading-snug">
          {currentQ.title}
        </h3>
        {currentQ.subtitle && (
          <p className="text-xs text-stone-500 mt-1">{currentQ.subtitle}</p>
        )}
      </div>

      {/* 4 Large Icon-Based Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentQ.options.map((opt) => {
          const isSelected = answers[currentQ.id] === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectOption(currentQ.id, opt.id)}
              disabled={submitting}
              className={`p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all active:scale-95 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                  : 'border-stone-200 bg-stone-50/60 hover:bg-white hover:border-emerald-300 text-stone-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <span className="text-sm font-bold">{opt.label}</span>
              </div>
              {isSelected && <Check className="w-4 h-4 text-emerald-700" />}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-1">
        {currentIndex > 0 ? (
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => prev - 1)}
            className="flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-stone-800 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('common.previous')}</span>
          </button>
        ) : <div></div>}

        {submitting && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('soil.evaluating')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
