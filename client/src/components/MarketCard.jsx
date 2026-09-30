import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
} from 'lucide-react';
import { getMarketPrices } from '../api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { isAppOnline, cacheData, getCachedData } from '../utils/offlineSync';

const CROPS_LIST = [
  { id: 'Paddy', cropKey: 'crops.names.Paddy', defaultName: 'Paddy' },
  { id: 'Wheat', cropKey: 'crops.names.Wheat', defaultName: 'Wheat' },
  { id: 'Cotton', cropKey: 'crops.names.Cotton', defaultName: 'Cotton' },
  { id: 'Soybean', cropKey: 'crops.names.Soybean', defaultName: 'Soybean' },
  { id: 'Groundnut', cropKey: 'crops.names.Groundnut', defaultName: 'Groundnut' },
];

export default function MarketCard({ initialCrop = 'Paddy' }) {
  const { t } = useTranslation();
  const { currentLanguage, formatCurrency, formatNumber } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(initialCrop || 'Paddy');
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialCrop) {
      setSelectedCrop(initialCrop);
    }
  }, [initialCrop]);

  const loadMarket = async () => {
    const cacheKey = `km_market_${selectedCrop}`;

    if (!isAppOnline()) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        setMarketData(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const data = await getMarketPrices(selectedCrop);
      if (data) {
        setMarketData(data);
        await cacheData(cacheKey, data);
      }
    } catch (err) {
      console.warn('Failed to load market data, checking cache:', err);
      const cached = await getCachedData(cacheKey);
      if (cached) setMarketData(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarket();

    const handleNet = () => loadMarket();
    window.addEventListener('kisanmitra_network_change', handleNet);
    window.addEventListener('online', handleNet);

    return () => {
      window.removeEventListener('kisanmitra_network_change', handleNet);
      window.removeEventListener('online', handleNet);
    };
  }, [selectedCrop, currentLanguage]);

  const bestMandi = marketData?.bestMandi;
  const hint = marketData?.hint || 'sell';
  const hintKey = marketData?.hintKey || 'market.hints.sellGood';

  const formatLocation = (district, state) => {
    const d = district ? t(`locations.districts.${district}`, { defaultValue: district }) : '';
    const s = state ? t(`locations.states.${state}`, { defaultValue: state }) : '';
    if (d && s) return `${d}, ${s}`;
    return d || s || '';
  };

  const formatTime = (mandiItem) => {
    const rawTime = mandiItem?.time || (mandiItem?.updated ? mandiItem.updated.replace(/^Today,\s*/i, '') : '');
    return t('market.updatedToday', { time: rawTime });
  };

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
      {/* Header with Demo Data Notice */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shadow-xs">
            🏪
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              {t('market.cardTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('market.cardSubtitle')}
            </p>
          </div>
        </div>

        {/* Clear Demo Data Tag */}
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
          <Info className="w-3 h-3 text-amber-600" />
          <span>{t('market.demoDataNotice')}</span>
        </span>
      </div>

      {/* 5 Crop Selection Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CROPS_LIST.map((c) => {
          const isSelected = selectedCrop.toLowerCase() === c.id.toLowerCase();
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCrop(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {t(c.cropKey, { defaultValue: c.defaultName })}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-8 text-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs text-stone-400 font-semibold">{t('common.loading')}</p>
        </div>
      ) : marketData ? (
        <div className="space-y-3.5">
          {/* 1. Best Mandi Today Highlight Card */}
          {bestMandi && (
            <div className="bg-gradient-to-br from-emerald-50 via-emerald-100/50 to-teal-50 border border-emerald-300/80 rounded-2xl p-4 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-white/80 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('market.bestMandiToday')}</span>
                </span>

                {/* Trend Arrow */}
                <span
                  className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-lg ${
                    bestMandi.trend === 'up'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {bestMandi.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{bestMandi.trend === 'up' ? t('market.trendUp') : t('market.trendDown')}</span>
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <h4 className="font-black text-stone-900 text-base leading-tight">
                    {bestMandi.name}
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {formatLocation(bestMandi.district, bestMandi.state)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-950">
                    {formatCurrency(bestMandi.price)}
                  </span>
                  <span className="text-[10px] text-stone-500 block font-semibold">
                    /{t('market.perQuintal')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Rule-Based Sell/Hold Hint Card */}
          <div
            className={`rounded-2xl p-3.5 border flex items-start gap-3 ${
              hint === 'sell'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                hint === 'sell' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {hint === 'sell' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  {t('market.sellHoldHint')}
                </span>
                <span
                  className={`text-[11px] font-black px-2 py-0.2 rounded-md ${
                    hint === 'sell'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {hint === 'sell' ? t('market.sellTitle') : t('market.holdTitle')}
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed">
                {t(hintKey, { defaultValue: t('market.hints.sellGood') })}
              </p>
            </div>
          </div>

          {/* 3. Mandi Comparison List */}
          <div className="space-y-2 pt-1">
            <h5 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('market.mandiListTitle')}
            </h5>

            <div className="space-y-2">
              {marketData.mandis?.map((mandi, idx) => {
                const isBest = bestMandi?.name === mandi.name;
                const isUp = mandi.trend === 'up';
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs transition-all ${
                      isBest
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/30'
                        : 'bg-stone-50 border-stone-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isUp
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isUp ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h6 className="font-bold text-stone-900 flex items-center gap-1.5">
                          <span>{mandi.name}</span>
                          {isBest && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                              ⭐
                            </span>
                          )}
                        </h6>
                        <p className="text-[11px] text-stone-500">
                          {formatLocation(mandi.district, mandi.state)} • {formatTime(mandi)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-stone-900 block">
                        {formatCurrency(mandi.price)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          isUp ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{isUp ? t('market.trendUp') : t('market.trendDown')}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
