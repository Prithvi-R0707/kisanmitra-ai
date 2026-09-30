import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Volume2, Globe } from 'lucide-react';
import { LANGUAGES } from '../config/languages';
import { useLanguage } from '../context/LanguageContext';

import { switchLanguage } from '../i18n';
import i18n from 'i18next';

export default function LanguageSelector({ languages, selectedLanguage, onSelect, onClose, isModal = false }) {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  const activeLangList = languages && languages.length > 0 ? languages : LANGUAGES;

  const handleSelect = async (lang) => {
    // 1. Ensure i18n bundle is loaded for the target language
    await switchLanguage(lang.code);

    // 2. Obtain localized notice in the target language directly
    const notice = i18n.t('language.selectedNotice', { lng: lang.code }) || 'Language selected.';

    // 3. Voice confirmation strictly in the target language
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `${lang.nativeName}. ${notice}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang.speechCode || 'en-IN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Safe fallback
      }
    }

    // 4. Update app state / farmer profile
    if (onSelect) {
      await onSelect(lang);
    } else {
      await changeLanguage(lang.code);
    }
  };

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-700 shrink-0" />
          <h3 className="font-bold text-lg text-stone-800 break-words">
            {t('language.title')}
          </h3>
        </div>
        {isModal && onClose && (
          <button
            onClick={onClose}
            aria-label={t('common.close')}
            className="text-stone-400 hover:text-stone-700 text-sm font-semibold px-2 py-1 rounded"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs text-stone-600 leading-relaxed">
        {t('language.subtitle')}
      </p>

      {/* Suggested Languages Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {activeLangList.map((lang) => {
          const isSelected = (selectedLanguage?.code || currentLanguage) === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang)}
              className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all active:scale-95 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-stone-50 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold break-words">{lang.nativeName}</span>
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <Volume2 className="w-4 h-4 text-stone-400 opacity-60 shrink-0" />
                )}
              </div>
              <span className="text-xs text-stone-500 mt-1 font-medium">{lang.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
          {content}
          <div className="mt-5 pt-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-sm transition-all"
            >
              {t('language.confirmBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
      {content}
    </div>
  );
}
