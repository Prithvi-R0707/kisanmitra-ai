import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  isAppOnline,
  isSimulatedOffline,
  setSimulatedOffline,
  getPendingEntries,
  syncPendingEntries,
} from '../utils/offlineSync';

export default function NetworkStatusBar({ phoneNumber, onSynced }) {
  const { t } = useTranslation();
  const [online, setOnline] = useState(() => isAppOnline());
  const [simulated, setSimulated] = useState(() => isSimulatedOffline());
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncedBanner, setSyncedBanner] = useState(false);

  const refreshStatus = async () => {
    const isOnlineNow = isAppOnline();
    setOnline(isOnlineNow);
    setSimulated(isSimulatedOffline());
    if (phoneNumber) {
      const pending = await getPendingEntries(phoneNumber);
      setPendingCount(pending.length);
    }
  };

  useEffect(() => {
    refreshStatus();

    const handleOnline = async () => {
      refreshStatus();
      if (phoneNumber) {
        setSyncing(true);
        const res = await syncPendingEntries(phoneNumber);
        setSyncing(false);
        refreshStatus();
        if (res.synced > 0) {
          setSyncedBanner(true);
          setTimeout(() => setSyncedBanner(false), 3000);
          if (onSynced) onSynced();
        }
      }
    };

    const handleOffline = () => {
      refreshStatus();
    };

    const handleNetworkChange = () => {
      refreshStatus();
    };

    const handleQueueUpdate = () => {
      refreshStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('kisanmitra_network_change', handleNetworkChange);
    window.addEventListener('kisanmitra_queue_updated', handleQueueUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('kisanmitra_network_change', handleNetworkChange);
      window.removeEventListener('kisanmitra_queue_updated', handleQueueUpdate);
    };
  }, [phoneNumber]);

  const handleToggleSimulated = async () => {
    const nextState = !simulated;
    setSimulatedOffline(nextState);
    setSimulated(nextState);
    const isOnlineNow = !nextState && navigator.onLine;
    setOnline(isOnlineNow);

    if (isOnlineNow && phoneNumber) {
      setSyncing(true);
      const res = await syncPendingEntries(phoneNumber);
      setSyncing(false);
      refreshStatus();
      if (res.synced > 0) {
        setSyncedBanner(true);
        setTimeout(() => setSyncedBanner(false), 3000);
        if (onSynced) onSynced();
      }
    }
  };

  const handleManualSync = async () => {
    if (!online || syncing || !phoneNumber) return;
    setSyncing(true);
    const res = await syncPendingEntries(phoneNumber);
    setSyncing(false);
    refreshStatus();
    if (res.synced > 0) {
      setSyncedBanner(true);
      setTimeout(() => setSyncedBanner(false), 3000);
      if (onSynced) onSynced();
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="bg-stone-50 border border-stone-200/80 rounded-2xl px-3 py-2 flex items-center justify-between text-xs shadow-2xs">
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="font-bold text-stone-800 flex items-center gap-1.5">
            {online ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('common.online')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>{t('common.offline')}</span>
              </>
            )}
          </span>

          {/* Pending Counter */}
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
              <Clock className="w-2.5 h-2.5" />
              <span>{t('common.pendingCount', { count: pendingCount })}</span>
            </span>
          )}
        </div>

        {/* Actions: Simulate Toggle & Sync Button */}
        <div className="flex items-center gap-1.5">
          {pendingCount > 0 && online && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncing}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-xs flex items-center gap-1 active:scale-95 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? t('common.syncing') : t('common.syncNow')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSimulated}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
              simulated
                ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
          >
            <span>{t('common.simOffline')}</span>
          </button>
        </div>
      </div>

      {/* Sync Success Toast Banner */}
      {syncedBanner && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{t('common.syncedSuccess')}</span>
        </div>
      )}
    </div>
  );
}
