import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, LogOut, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ farmer, onOpenCall, onOpenLanguage, onLogout }) {
  const { t } = useTranslation();
  const { languageConfig } = useLanguage();

  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-xl shadow-inner border border-emerald-400 shrink-0">
            🌾
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              {t('common.appTitle')}
            </h1>
            <p className="text-xs text-emerald-200 break-words">
              {farmer
                ? `${farmer.name} • ${languageConfig.nativeName}`
                : t('common.appSubtitle')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Simulated Helpline Call Button */}
          <button
            onClick={onOpenCall}
            aria-label={t('common.callHelpline')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all border border-emerald-400/40"
          >
            <PhoneCall className="w-4 h-4 text-emerald-100 animate-pulse shrink-0" />
            <span className="hidden sm:inline">{t('common.callHelpline')}</span>
            <span className="sm:hidden">{t('common.call')}</span>
          </button>

          {/* Language Switch Button */}
          <button
            onClick={onOpenLanguage}
            aria-label={t('language.title')}
            className="flex items-center gap-1 bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-white px-2.5 py-2 rounded-xl text-xs font-medium shadow-sm transition-all"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">{languageConfig.nativeName}</span>
          </button>

          {/* Logout / Switch Farmer */}
          {farmer && (
            <button
              onClick={onLogout}
              title={t('common.switchAccount')}
              aria-label={t('common.switchAccount')}
              className="p-2 rounded-xl bg-emerald-900/60 hover:bg-red-800 active:scale-95 text-emerald-200 hover:text-white transition-all shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
