import express from 'express';
import Expense from '../models/Expense.js';
import History from '../models/History.js';
import Farmer from '../models/Farmer.js';
import { isDbConnected } from '../config/db.js';
import { memoryExpenses, memoryHistory } from './recordsRoutes.js';

const router = express.Router();

// Track synced client IDs in-memory to guarantee idempotency
const syncedClientIds = new Set();

// POST /api/sync
router.post('/', async (req, res) => {
  try {
    const { phoneNumber, entries } = req.body;
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required for sync' });
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.json({ success: true, syncedCount: 0, syncedIds: [] });
    }

    const cleanPhone = phoneNumber.trim().slice(-10);
    let farmer = null;

    if (isDbConnected) {
      farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
    }

    const processedIds = [];
    const skippedIds = [];

    // Sort entries by timestamp (last-write-wins / chronological processing)
    const sortedEntries = [...entries].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    for (const item of sortedEntries) {
      const clientId = item.id || item.clientId || (item.timestamp ? `offline_${item.timestamp}` : null) || `offline_${Date.now()}`;
      if (syncedClientIds.has(clientId)) {
        skippedIds.push(clientId);
        continue;
      }

      if (item.type === 'expense' || item.category) {
        const expenseDoc = {
          farmerId: farmer?._id || null,
          phoneNumber: cleanPhone,
          category: item.category || 'other',
          amount: Number(item.amount) || 0,
          description: item.description || item.note || '',
          date: item.date ? new Date(item.date) : new Date(item.timestamp || Date.now()),
        };

        const historyDoc = {
          farmerId: farmer?._id || null,
          phoneNumber: cleanPhone,
          action: 'EXPENSE',
          crop: item.crop || '',
          details: `${item.category || 'Expense'}: ₹${item.amount}${item.description ? ' - ' + item.description : ''}`,
          amount: Number(item.amount) || 0,
          type: 'expense',
          date: expenseDoc.date,
        };

        if (isDbConnected) {
          await Expense.create(expenseDoc);
          await History.create(historyDoc);
        } else {
          const list = memoryExpenses.get(cleanPhone) || [];
          list.push({ ...expenseDoc, _id: clientId });
          memoryExpenses.set(cleanPhone, list);

          const hList = memoryHistory.get(cleanPhone) || [];
          hList.push({ ...historyDoc, _id: `${clientId}_hist` });
          memoryHistory.set(cleanPhone, hList);
        }
      } else {
        // General activity history entry
        const historyDoc = {
          farmerId: farmer?._id || null,
          phoneNumber: cleanPhone,
          action: (item.action || 'ACTIVITY').toUpperCase(),
          crop: item.crop || '',
          details: item.details || item.note || '',
          amount: item.amount ? Number(item.amount) : null,
          type: item.type || 'activity',
          date: item.date ? new Date(item.date) : new Date(item.timestamp || Date.now()),
        };

        if (isDbConnected) {
          await History.create(historyDoc);
        } else {
          const hList = memoryHistory.get(cleanPhone) || [];
          hList.push({ ...historyDoc, _id: clientId });
          memoryHistory.set(cleanPhone, hList);
        }
      }

      syncedClientIds.add(clientId);
      processedIds.push(clientId);
    }

    return res.json({
      success: true,
      syncedCount: processedIds.length,
      syncedIds: processedIds,
      skippedCount: skippedIds.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Offline sync error:', err);
    return res.status(500).json({ error: 'Failed to sync offline entries' });
  }
});

export default router;
