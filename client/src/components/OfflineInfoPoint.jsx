import React from 'react';
import {
  BookOpen,
  MapPin,
  CheckCircle,
  ShieldAlert,
  Droplets,
  Sprout,
  Bug,
  HelpCircle,
  WifiOff,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function OfflineInfoPoint() {
  const { t } = useTranslation();

  const TIPS = [
    {
      id: 1,
      icon: Droplets,
      color: 'bg-sky-100 text-sky-800 border-sky-300',
      titleKey: 'infoPoint.tip1Title',
      descKey: 'infoPoint.tip1Desc',
    },
    {
      id: 2,
      icon: Bug,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      titleKey: 'infoPoint.tip2Title',
      descKey: 'infoPoint.tip2Desc',
    },
    {
      id: 3,
      icon: Sprout,
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      titleKey: 'infoPoint.tip3Title',
      descKey: 'infoPoint.tip3Desc',
    },
    {
      id: 4,
      icon: HelpCircle,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      titleKey: 'infoPoint.tip4Title',
      descKey: 'infoPoint.tip4Desc',
    },
    {
      id: 5,
      icon: CheckCircle,
      color: 'bg-teal-100 text-teal-800 border-teal-300',
      titleKey: 'infoPoint.tip5Title',
      descKey: 'infoPoint.tip5Desc',
    },
    {
      id: 6,
      icon: ShieldAlert,
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      titleKey: 'infoPoint.tip6Title',
      descKey: 'infoPoint.tip6Desc',
    },
  ];

  const KIOSKS = [
    { id: 1, nameKey: 'infoPoint.kiosk1Name', locKey: 'infoPoint.kiosk1Loc' },
    { id: 2, nameKey: 'infoPoint.kiosk2Name', locKey: 'infoPoint.kiosk2Loc' },
    { id: 3, nameKey: 'infoPoint.kiosk3Name', locKey: 'infoPoint.kiosk3Loc' },
    { id: 4, nameKey: 'infoPoint.kiosk4Name', locKey: 'infoPoint.kiosk4Loc' },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl shadow-xs">
            ℹ️
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              {t('infoPoint.title')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('infoPoint.subtitle')}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-300 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
          <WifiOff className="w-3 h-3 text-teal-600" />
          <span>{t('infoPoint.offlineNotice')}</span>
        </span>
      </div>

      {/* 6 Field-Tested Agriculture Tips */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t('infoPoint.tipsTitle')}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div
                key={tip.id}
                className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 space-y-1.5 transition-all hover:border-emerald-300"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs border ${tip.color} shrink-0`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <h5 className="font-bold text-stone-900 text-xs leading-snug">
                    {t(tip.titleKey)}
                  </h5>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {t(tip.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Kiosks / Local Points */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-700" />
          <span>{t('infoPoint.kiosksTitle')}</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {KIOSKS.map((kiosk) => (
            <div
              key={kiosk.id}
              className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3 flex items-start gap-2 text-xs"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                📍
              </div>
              <div className="space-y-0.5">
                <h6 className="font-bold text-stone-900 leading-tight">
                  {t(kiosk.nameKey)}
                </h6>
                <p className="text-[11px] text-emerald-800 font-medium">
                  {t(kiosk.locKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
