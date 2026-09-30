import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

function getMarketData() {
  const possiblePaths = [
    path.resolve(process.cwd(), 'data/market.json'),
    path.resolve(process.cwd(), 'server/src/data/market.json'),
    new URL('../data/market.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  ];

  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        const raw = fs.readFileSync(p, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      // try next
    }
  }

  // Fallback in-memory data
  return {
    crops: [
      {
        id: 'Paddy',
        cropKey: 'crops.names.Paddy',
        defaultName: 'Paddy',
        benchmarkPrice: 2300,
        mandis: [
          { name: 'Nagpur APMC', district: 'Nagpur', districtKey: 'Nagpur', state: 'Maharashtra', stateKey: 'Maharashtra', price: 2420, trend: 'up', time: '10:30 AM', updated: 'Today, 10:30 AM' },
          { name: 'Amravati APMC', district: 'Amravati', districtKey: 'Amravati', state: 'Maharashtra', stateKey: 'Maharashtra', price: 2350, trend: 'up', time: '11:00 AM', updated: 'Today, 11:00 AM' },
          { name: 'Wardha APMC', district: 'Wardha', districtKey: 'Wardha', state: 'Maharashtra', stateKey: 'Maharashtra', price: 2280, trend: 'down', time: '09:45 AM', updated: 'Today, 09:45 AM' },
        ],
      },
    ],
  };
}

// GET /api/market?crop=
router.get('/', (req, res) => {
  try {
    const marketData = getMarketData();
    const allCrops = marketData.crops.map((c) => ({
      id: c.id,
      cropKey: c.cropKey,
      defaultName: c.defaultName,
    }));

    const requestedCrop = (req.query.crop || '').trim().toLowerCase();
    let cropItem = marketData.crops.find(
      (c) => c.id.toLowerCase() === requestedCrop || c.defaultName.toLowerCase() === requestedCrop
    );

    if (!cropItem) {
      cropItem = marketData.crops[0];
    }

    const mandis = [...cropItem.mandis];
    // Best mandi is the one with highest price today
    const sorted = [...mandis].sort((a, b) => b.price - a.price);
    const bestMandi = sorted[0];

    // Rule-based sell / hold hint
    let hint = 'sell';
    let hintKey = 'market.hints.sellGood';

    if (bestMandi.price >= cropItem.benchmarkPrice && bestMandi.trend === 'up') {
      hint = 'sell';
      hintKey = 'market.hints.sellGood';
    } else if (bestMandi.trend === 'down' && bestMandi.price < cropItem.benchmarkPrice) {
      hint = 'hold';
      hintKey = 'market.hints.holdWait';
    } else if (bestMandi.trend === 'up' && bestMandi.price < cropItem.benchmarkPrice) {
      hint = 'hold';
      hintKey = 'market.hints.holdRising';
    } else {
      hint = 'sell';
      hintKey = 'market.hints.sellStable';
    }

    return res.json({
      crop: cropItem.id,
      cropKey: cropItem.cropKey,
      benchmarkPrice: cropItem.benchmarkPrice,
      mandis,
      bestMandi,
      hint,
      hintKey,
      isDemoData: true,
      allCrops,
    });
  } catch (err) {
    console.error('Market API error:', err);
    res.status(500).json({ error: 'Failed to retrieve market prices' });
  }
});

export default router;
