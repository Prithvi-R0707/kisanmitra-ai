import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Farmer from '../models/Farmer.js';
import Farm from '../models/Farm.js';
import Soil from '../models/Soil.js';
import Expense from '../models/Expense.js';
import History from '../models/History.js';

dotenv.config();

const DEMO_PHONE = '9876543210';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function seedDatabase() {
  console.log('🌱 Starting KisanMitraAI Demo Farmer Seed...');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kisanmitra';
  let mongoConnected = false;

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 });
    mongoConnected = true;
    console.log('📦 Connected to MongoDB, seeding persistent collections...');

    // Upsert Farmer
    let farmer = await Farmer.findOneAndUpdate(
      { phoneNumber: DEMO_PHONE },
      {
        phoneNumber: DEMO_PHONE,
        name: 'Ramesh Kumar',
        village: 'Kaveripattinam',
        district: 'Krishnagiri',
        state: 'Tamil Nadu',
        selectedLanguage: {
          code: 'ta',
          name: 'Tamil',
          nativeName: 'தமிழ்',
        },
        isRegistered: true,
      },
      { upsert: true, new: true }
    );

    // Upsert Farm & Budget
    const farmBudget = {
      crop: 'Paddy',
      acres: 3,
      seeds: 3600,
      fertilizer: 10500,
      labor: 12000,
      water: 4500,
      other: 3000,
      total: 33600,
    };

    let farm = await Farm.findOneAndUpdate(
      { farmerId: farmer._id },
      {
        farmerId: farmer._id,
        totalAcreage: 3,
        primaryCrop: 'Paddy',
        currentSeason: 'Kharif',
        irrigationType: 'Borewell',
        budget: farmBudget,
      },
      { upsert: true, new: true }
    );

    // Upsert Soil
    await Soil.findOneAndUpdate(
      { farmerId: farmer._id },
      {
        farmerId: farmer._id,
        color: 'brown',
        soilType: 'alluvial',
        texture: 'smooth',
        waterHolding: 'high',
        notes: 'Fertile river silt with high moisture retention',
      },
      { upsert: true, new: true }
    );

    // Seed Expenses
    await Expense.deleteMany({ phoneNumber: DEMO_PHONE });
    const seedExpenses = [
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        category: 'seeds',
        amount: 3600,
        description: 'Certified CO-51 Paddy Seeds (30 kg)',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        category: 'fertilizer',
        amount: 5200,
        description: 'DAP & Potash basal application for 3 acres',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        category: 'labor',
        amount: 4000,
        description: 'Field preparation and transplanting labor',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
    await Expense.insertMany(seedExpenses);

    // Seed History Entries
    await History.deleteMany({ phoneNumber: DEMO_PHONE });
    const seedHistory = [
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        action: 'sowing',
        crop: 'Paddy',
        details: 'Nursery sowing completed with CO-51 variety',
        type: 'activity',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        action: 'expense',
        crop: 'Paddy',
        details: 'Seeds purchase: Certified CO-51 Paddy Seeds',
        amount: 3600,
        type: 'expense',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        action: 'watering',
        crop: 'Paddy',
        details: 'Field flooded to 5cm standing water level',
        type: 'activity',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        action: 'fertilizer',
        crop: 'Paddy',
        details: 'Basal dose DAP & Potash broadcasted',
        type: 'activity',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        action: 'expense',
        crop: 'Paddy',
        details: 'Fertilizer purchase: DAP & Potash',
        amount: 5200,
        type: 'expense',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        farmerId: farmer._id,
        phoneNumber: DEMO_PHONE,
        action: 'spray',
        crop: 'Paddy',
        details: 'Bio-neem oil preventive pest spray applied early morning',
        type: 'activity',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];
    await History.insertMany(seedHistory);

    console.log('✅ MongoDB demo farmer seeded successfully!');
  } catch (err) {
    console.warn('⚠️ MongoDB connection skipped or unavailable:', err.message);
  } finally {
    if (mongoConnected) {
      await mongoose.disconnect();
    }
  }

  // Also seed into the running backend via HTTP API (in case in-memory store is active)
  try {
    console.log(`🌐 Syncing demo farmer to running backend (${BACKEND_URL})...`);
    
    // 1. Register farmer
    const regRes = await fetch(`${BACKEND_URL}/api/farmers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: DEMO_PHONE,
        name: 'Ramesh Kumar',
        village: 'Kaveripattinam',
        district: 'Krishnagiri',
        state: 'Tamil Nadu',
        selectedLanguage: {
          code: 'ta',
          name: 'Tamil',
          nativeName: 'தமிழ்',
        },
      }),
    });
    if (regRes.ok) {
      console.log('✅ Registered demo farmer in running backend API');
    }

    // 2. Set Budget
    await fetch(`${BACKEND_URL}/api/records/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: DEMO_PHONE,
        crop: 'Paddy',
        acres: 3,
      }),
    });

    // 3. Add Expenses
    const expensesToAdd = [
      { category: 'seeds', amount: 3600, description: 'Certified CO-51 Paddy Seeds' },
      { category: 'fertilizer', amount: 5200, description: 'DAP & Potash basal application' },
      { category: 'labor', amount: 4000, description: 'Transplanting labor' },
    ];
    for (const exp of expensesToAdd) {
      await fetch(`${BACKEND_URL}/api/records/expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: DEMO_PHONE, ...exp }),
      });
    }

    // 4. Add History
    const historyToAdd = [
      { action: 'sowing', crop: 'Paddy', details: 'Nursery sowing completed with CO-51' },
      { action: 'watering', crop: 'Paddy', details: 'Canal irrigation applied to nursery' },
      { action: 'spray', crop: 'Paddy', details: 'Bio-neem oil preventive spray' },
    ];
    for (const hist of historyToAdd) {
      await fetch(`${BACKEND_URL}/api/records/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: DEMO_PHONE, ...hist }),
      });
    }

    console.log('✅ Running backend memory store synced with demo farmer!');
  } catch (err) {
    console.log('ℹ️ Running backend API not reachable (seed recorded in MongoDB if connected).');
  }

  console.log('\n🌾 Demo Farmer Ready!');
  console.log(`📱 Mobile Number: ${DEMO_PHONE}`);
  console.log('👤 Name: Ramesh Kumar (Tamil Nadu, 3 Acres Paddy)');
  console.log('🗣️ Language: Tamil (தமிழ்)\n');
}

seedDatabase();
