import React, { useState, useEffect } from 'react';
import {
  Phone,
  MapPin,
  Globe,
  CheckCircle2,
  Sprout,
  PhoneCall,
  Sparkles,
  Mic,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import WeatherCard from './WeatherCard';
import SoilWizard from './SoilWizard';
import CropRecommendationCard from './CropRecommendationCard';
import DailyPlanCard from './DailyPlanCard';
import RecordsTracker from './RecordsTracker';
import CropDiagnosisCard from './CropDiagnosisCard';
import MarketCard from './MarketCard';
import NetworkStatusBar from './NetworkStatusBar';
import OfflineInfoPoint from './OfflineInfoPoint';
import SmsSimulationPanel from './SmsSimulationPanel';
import { getWeather } from '../api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { isAppOnline, cacheData, getCachedData } from '../utils/offlineSync';

export default function FarmerProfileCard({ farmer, farm, onOpenCall, onOpenLanguage, onLogout }) {
  const { t } = useTranslation();
  const { currentLanguage, languageConfig } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [soilData, setSoilData] = useState(farm?.soil || null);
  const [selectedCrop, setSelectedCrop] = useState(farm?.primaryCrop || 'Paddy');
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // Load and cache weather for farmer's district
  const loadWeather = async () => {
    if (!farmer?.district) return;
    const cleanDistrict = (farmer.district || '').toLowerCase().trim();
    const cacheKey = `km_weather_${cleanDistrict}`;

    if (!isAppOnline()) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        setWeather(cached);
        return;
      }
    }

    setWeatherLoading(true);
    try {
      const data = await getWeather(farmer.district, farmer.state);
      if (data) {
        setWeather(data);
        await cacheData(cacheKey, data);
      }
    } catch (err) {
      console.warn('Weather network error, fallback to cache:', err);
      const cached = await getCachedData(cacheKey);
      if (cached) setWeather(cached);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();

    if (farmer?.phoneNumber) {
      cacheData(`km_profile_${farmer.phoneNumber}`, farmer);
    }

    const handleNet = () => loadWeather();
    window.addEventListener('kisanmitra_network_change', handleNet);
    window.addEventListener('online', handleNet);

    return () => {
      window.removeEventListener('kisanmitra_network_change', handleNet);
      window.removeEventListener('online', handleNet);
    };
  }, [farmer?.district, farmer?.state, farmer?.phoneNumber]);

  if (!farmer) return null;

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Offline Mode Network Status Bar */}
      <NetworkStatusBar
        phoneNumber={farmer.phoneNumber}
        onSynced={() => setHistoryRefreshKey((prev) => prev + 1)}
      />

      {/* 2. Principle Banner & Farmer Greeting (360px mobile responsive) */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-3xl p-5 shadow-sm border border-emerald-700/60 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/90 flex items-center justify-center text-2xl shadow-inner border border-emerald-500/40">
              🌾
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold block">
                {t('common.tagline')}
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                {t('dashboard.greeting', { name: farmer.name })}
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                {t('dashboard.welcomeFrom', { village: farmer.village, district: farmer.district })}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 bg-emerald-700/70 text-emerald-100 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('common.active')}</span>
          </span>
        </div>

        {/* Location & Language Pill Row */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-700/50">
          <div className="bg-emerald-800/40 rounded-2xl p-2.5 border border-emerald-700/50 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-emerald-300 font-semibold block">{t('dashboard.location')}</span>
              <p className="text-xs font-bold text-white truncate">
                {farmer.village}, {farmer.district}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLanguage}
            className="bg-emerald-800/40 hover:bg-emerald-800/80 transition-colors rounded-2xl p-2.5 border border-emerald-700/50 flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-emerald-300 shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-300 font-semibold block">{t('dashboard.voiceLanguage')}</span>
                <p className="text-xs font-bold text-white truncate">
                  {languageConfig?.nativeName || farmer.selectedLanguage?.nativeName || 'English'}
                </p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-300 underline font-bold group-hover:text-white shrink-0 ml-1">
              {t('common.edit')}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Large Hero Mic Button (Must fit 360px mobile screen) */}
      <button
        type="button"
        onClick={onOpenCall}
        className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.98] text-white p-4 rounded-3xl shadow-sm border border-emerald-500/50 flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-inner group-hover:scale-105 transition-transform shrink-0">
            <Mic className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h3 className="font-black text-sm sm:text-base text-white leading-tight">
              {t('dashboard.tapMicHero')}
            </h3>
            <p className="text-[11px] text-emerald-100 mt-0.5 line-clamp-1">
              {t('dashboard.tapMicSubtitle')}
            </p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white shrink-0 ml-2 group-hover:translate-x-1 transition-transform">
          <PhoneCall className="w-4 h-4 text-emerald-200" />
        </div>
      </button>

      {/* 4. Big Action Tiles (Soil, Crops, Budget, Photo, Market, Info Point, SMS) */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
          {t('dashboard.tilesTitle')}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Soil Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-soil')}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition-all active:scale-95 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
              🧪
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t('dashboard.tileSoil')}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {t('dashboard.tileSoilDesc')}
              </p>
            </div>
          </button>

          {/* Crops Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-crops')}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition-all active:scale-95 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
              🌾
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t('dashboard.tileCrops')}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {t('dashboard.tileCropsDesc')}
              </p>
            </div>
          </button>

          {/* Budget Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-budget')}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition-all active:scale-95 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
              💰
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t('dashboard.tileBudget')}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {t('dashboard.tileBudgetDesc')}
              </p>
            </div>
          </button>

          {/* Photo Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-photo')}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition-all active:scale-95 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
              📷
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t('dashboard.tilePhoto')}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {t('dashboard.tilePhotoDesc')}
              </p>
            </div>
          </button>

          {/* Market Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-market')}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition-all active:scale-95 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
              🏪
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t('dashboard.tileMarket')}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {t('dashboard.tileMarketDesc')}
              </p>
            </div>
          </button>

          {/* Info Point Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-info')}
            className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 hover:shadow-xs text-left transition-all active:scale-95 group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-lg mb-2 group-hover:scale-105 transition-transform">
              📖
            </div>
            <div>
              <h5 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t('dashboard.tileInfo')}
              </h5>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {t('dashboard.tileInfoDesc')}
              </p>
            </div>
          </button>

          {/* SMS Simulation Tile */}
          <button
            type="button"
            onClick={() => scrollToSection('section-sms')}
            className="col-span-2 sm:col-span-3 flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/80 hover:border-purple-400 hover:shadow-xs text-left transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-lg shrink-0">
                💬
              </div>
              <div>
                <h5 className="font-bold text-xs text-purple-950">
                  {t('dashboard.tileSms')}
                </h5>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  {t('dashboard.tileSmsDesc')}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </button>
        </div>
      </div>

      {/* 5. Weather Card (Live & Geocoded Open-Meteo, Cached in IDB) */}
      <WeatherCard weather={weather} loading={weatherLoading} />

      {/* 6. Today's Farm Plan (Cached in IDB) */}
      <DailyPlanCard
        farmer={farmer}
        crop={selectedCrop}
        weather={weather}
      />

      {/* 7. Money & Farm Diary (Budget Tracker, Progress Bar with 80% warning, Timeline, Natural Updates) */}
      <div id="section-budget" className="scroll-mt-4">
        <RecordsTracker
          key={`records_${historyRefreshKey}`}
          farmer={farmer}
          onCropUpdated={(crop) => setSelectedCrop(crop)}
        />
      </div>

      {/* 8. Soil Health Wizard */}
      <div id="section-soil" className="scroll-mt-4">
        <SoilWizard
          farmer={farmer}
          existingSoil={soilData}
          onSoilDetermined={(res) => setSoilData(res)}
        />
      </div>

      {/* 9. Crop Recommendations (Top 3 rule-based + Gemini explanation) */}
      <div id="section-crops" className="scroll-mt-4">
        <CropRecommendationCard
          farmer={farmer}
          soilType={soilData?.soilType || 'loamy'}
          selectedCrop={selectedCrop}
          onCropSelected={(crop) => setSelectedCrop(crop)}
        />
      </div>

      {/* 10. Crop Photo Diagnosis Doctor */}
      <div id="section-photo" className="scroll-mt-4">
        <CropDiagnosisCard
          farmer={farmer}
          crop={selectedCrop}
          onDiagnosisSaved={() => setHistoryRefreshKey((prev) => prev + 1)}
        />
      </div>

      {/* 11. Mandi Market Rates */}
      <div id="section-market" className="scroll-mt-4">
        <MarketCard
          key={`market_${currentLanguage}_${selectedCrop}`}
          initialCrop={selectedCrop}
        />
      </div>

      {/* 12. Offline Farm Information Point */}
      <div id="section-info" className="scroll-mt-4">
        <OfflineInfoPoint />
      </div>

      {/* 13. SMS Simulation Panel */}
      <div id="section-sms" className="scroll-mt-4">
        <SmsSimulationPanel
          farmer={farmer}
          weather={weather}
          crop={selectedCrop}
        />
      </div>

      {/* 14. Switch Account footer */}
      <div className="text-center pt-2">
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-red-700 font-bold underline text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('common.switchPhone')}</span>
        </button>
      </div>
    </div>
  );
}
