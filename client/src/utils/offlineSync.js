import { get, set, del } from 'idb-keyval';
import { syncOfflineEntries } from '../api';

const SIM_OFFLINE_KEY = 'kisanmitra_sim_offline';

/**
 * Check if the user has manually turned on "Simulate Offline"
 */
export function isSimulatedOffline() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIM_OFFLINE_KEY) === 'true';
}

/**
 * Toggle or set simulated offline mode
 */
export function setSimulatedOffline(value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIM_OFFLINE_KEY, value ? 'true' : 'false');
  window.dispatchEvent(new Event('kisanmitra_network_change'));
}

/**
 * Single source of truth for online/offline status
 */
export function isAppOnline() {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine && !isSimulatedOffline();
}

/**
 * Save data to IndexedDB cache
 */
export async function cacheData(key, value) {
  try {
    await set(key, {
      data: value,
      cachedAt: Date.now(),
    });
  } catch (err) {
    console.warn(`Failed to cache ${key} in idb:`, err);
  }
}

/**
 * Retrieve data from IndexedDB cache
 */
export async function getCachedData(key) {
  try {
    const item = await get(key);
    return item?.data || null;
  } catch (err) {
    console.warn(`Failed to read ${key} from idb:`, err);
    return null;
  }
}

/**
 * Queue a new offline expense or farm history entry
 */
export async function queueOfflineEntry(phoneNumber, entry) {
  if (!phoneNumber) return entry;
  const cleanPhone = phoneNumber.slice(-10);
  const queueKey = `km_pending_${cleanPhone}`;

  const id = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const item = {
    ...entry,
    id,
    status: 'pending',
    timestamp: Date.now(),
  };

  try {
    const existing = (await get(queueKey)) || [];
    existing.push(item);
    await set(queueKey, existing);
    window.dispatchEvent(new CustomEvent('kisanmitra_queue_updated', { detail: { phone: cleanPhone, count: existing.length } }));
  } catch (err) {
    console.warn('Failed to queue offline entry in idb:', err);
  }

  return item;
}

/**
 * Get all pending entries for a farmer
 */
export async function getPendingEntries(phoneNumber) {
  if (!phoneNumber) return [];
  const cleanPhone = phoneNumber.slice(-10);
  const queueKey = `km_pending_${cleanPhone}`;
  try {
    return (await get(queueKey)) || [];
  } catch (err) {
    return [];
  }
}

/**
 * Sync all pending offline entries to the backend
 */
export async function syncPendingEntries(phoneNumber) {
  if (!phoneNumber || !isAppOnline()) return { synced: 0, pending: 0 };
  const cleanPhone = phoneNumber.slice(-10);
  const queueKey = `km_pending_${cleanPhone}`;

  try {
    const pending = (await get(queueKey)) || [];
    if (pending.length === 0) return { synced: 0, pending: 0 };

    const res = await syncOfflineEntries(cleanPhone, pending);
    if (res?.success && Array.isArray(res.syncedIds)) {
      const remaining = pending.filter((item) => !res.syncedIds.includes(item.id));
      await set(queueKey, remaining);

      window.dispatchEvent(
        new CustomEvent('kisanmitra_synced', {
          detail: {
            syncedCount: res.syncedCount,
            syncedIds: res.syncedIds,
            remainingCount: remaining.length,
          },
        })
      );

      return { synced: res.syncedCount, pending: remaining.length };
    }
  } catch (err) {
    console.warn('Sync failed:', err);
  }

  return { synced: 0, pending: 0 };
}
