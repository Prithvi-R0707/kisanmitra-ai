import React from 'react';
import { CloudRain, Droplets, MapPin, Wind } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WeatherCard({ weather, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm animate-pulse space-y-3">
        <div className="h-4 bg-stone-200 rounded w-1/3"></div>
        <div className="h-10 bg-stone-200 rounded w-1/2"></div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-16 bg-stone-100 rounded-2xl"></div>
          <div className="h-16 bg-stone-100 rounded-2xl"></div>
          <div className="h-16 bg-stone-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!weather || !weather.current) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-semibold">
          <MapPin className="w-3.5 h-3.5 text-emerald-300" />
          <span>{t('weather.title', { district: weather.district })}</span>
        </div>
        <span className="text-[11px] bg-emerald-700/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-emerald-200">
          Open-Meteo • {t('weather.live')}
        </span>
      </div>

      {/* Main Temperature & Condition */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl filter drop-shadow-sm">{weather.current.icon}</span>
          <div>
            <div className="text-3xl font-black tracking-tight flex items-baseline gap-1">
              <span>{weather.current.temp}°C</span>
            </div>
            <p className="text-xs text-emerald-200 font-medium">
              {t(`weather.conditions.${weather.current.conditionKey || weather.current.label}`, { defaultValue: weather.current.label })}
            </p>
          </div>
        </div>

        {/* Humidity & Rain */}
        <div className="space-y-1 text-right text-xs text-emerald-200">
          <div className="flex items-center justify-end gap-1">
            <Droplets className="w-3.5 h-3.5 text-sky-300" />
            <span>{t('weather.humidity', { humidity: weather.current.humidity })}</span>
          </div>
          {weather.current.precipitation > 0 && (
            <div className="flex items-center justify-end gap-1 text-sky-200">
              <CloudRain className="w-3.5 h-3.5" />
              <span>{weather.current.precipitation} mm</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Day Forecast Pills */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-700/50">
          {weather.forecast.map((day, idx) => {
            const dayKey = day.dayKey || (idx === 0 ? 'today' : idx === 1 ? 'tomorrow' : 'day3');
            return (
              <div
                key={idx}
                className="bg-emerald-950/40 rounded-2xl p-2.5 text-center border border-emerald-600/30"
              >
                <p className="text-[11px] font-bold text-emerald-300 uppercase">
                  {t(`weather.${dayKey}`, { defaultValue: day.day })}
                </p>
                <div className="text-xl my-1">{day.icon}</div>
                <p className="text-xs font-bold text-white">{day.maxTemp}° / {day.minTemp}°</p>
                <p className="text-[10px] text-sky-300 flex items-center justify-center gap-0.5 mt-0.5">
                  <CloudRain className="w-2.5 h-2.5 inline" /> {day.rainChance}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
