import React, { useState, useEffect } from 'react';
import { Sprout, CheckCircle, ChevronRight, Loader2, Sparkles, Droplets, Clock } from 'lucide-react';
import { getCropRecommendations, selectCrop } from '../api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export default function CropRecommendationCard({
  farmer,
  soilType = 'loamy',
  selectedCrop,
  onCropSelected,
}) {
  const { t } = useTranslation();
  const { currentLanguage, languageConfig } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [activeCrop, setActiveCrop] = useState(selectedCrop || '');
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (!farmer) return;
    setLoading(true);
    getCropRecommendations(
      farmer.phoneNumber,
      soilType,
      farmer.district || '',
      languageConfig?.name || currentLanguage
    )
      .then((res) => {
        setData(res);
        if (!activeCrop && res.crops && res.crops.length > 0) {
          setActiveCrop(res.crops[0].name);
        }
      })
      .catch((err) => console.error('Failed to load crop recommendations', err))
      .finally(() => setLoading(false));
  }, [farmer?.phoneNumber, soilType, currentLanguage]);

  const handlePickCrop = async (cropName) => {
    setActiveCrop(cropName);
    setSelecting(true);
    try {
      await selectCrop(farmer.phoneNumber, cropName);
      if (onCropSelected) {
        onCropSelected(cropName);
      }
    } catch (e) {
      console.warn('Crop pick error:', e);
    } finally {
      setSelecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center space-y-2">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-semibold text-stone-600">
          {t('crops.loading')}
        </p>
      </div>
    );
  }

  if (!data || !data.crops) return null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl text-lg">🌾</span>
          <div>
            <h3 className="font-bold text-base text-stone-900 leading-tight">
              {t('crops.title')}
            </h3>
            <p className="text-xs text-stone-500">
              {t('crops.seasonLabel')}: <strong className="text-emerald-800">{t(`crops.seasons.${data.season?.id}`, { defaultValue: data.season?.name })}</strong> • {t('crops.soilLabel')}: <strong className="capitalize text-emerald-800">{t(`soil.types.${data.soilType}.name`, { defaultValue: data.soilType })}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Gemini 2-sentence explanation */}
      {data.explanation && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-950 font-medium leading-relaxed">
            {data.explanation}
          </p>
        </div>
      )}

      {/* Top 3 Crops List */}
      <div className="space-y-2.5">
        {data.crops.map((crop) => {
          const isChosen = activeCrop === crop.name;
          return (
            <div
              key={crop.name}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                isChosen
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                  : 'border-stone-200 bg-stone-50/50 hover:bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{crop.icon}</span>
                  <div>
                    <h4 className="font-black text-base text-stone-900">
                      {t(`crops.names.${crop.name}`, { defaultValue: crop.name })}
                    </h4>
                    <span className="text-xs text-stone-500 font-medium">{t('crops.estYield', { yield: crop.yield })}</span>
                  </div>
                </div>

                {isChosen && (
                  <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> {t('common.selected')}
                  </span>
                )}
              </div>

              {/* Crop Stats */}
              <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-200/60">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{crop.duration}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t('crops.waterNeed', { water: t(`crops.waterLevels.${crop.water}`, { defaultValue: crop.water }) })}</span>
                  </span>
                </div>

                {!isChosen && (
                  <button
                    type="button"
                    onClick={() => handlePickCrop(crop.name)}
                    disabled={selecting}
                    className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs"
                  >
                    {t('crops.pickBtn')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
