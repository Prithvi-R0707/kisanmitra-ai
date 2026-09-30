import express from 'express';
import Farmer from '../models/Farmer.js';
import Farm from '../models/Farm.js';
import Soil from '../models/Soil.js';
import { getSuggestedLanguages } from '../utils/languageHelper.js';
import { isDbConnected } from '../config/db.js';

const router = express.Router();

// In-memory fallback stores when MongoDB is offline
const memoryStore = {
  farmers: new Map(),
  farms: new Map(),
  soils: new Map(),
};

// 1. Check phone number (login or prompt registration)
router.post('/check-phone', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    }

    const cleanPhone = phoneNumber.trim().slice(-10);

    if (isDbConnected) {
      let farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
      if (farmer && farmer.isRegistered) {
        const farm = await Farm.findOne({ farmerId: farmer._id });
        const suggestedLanguages = getSuggestedLanguages(farmer.state);
        return res.json({
          isRegistered: true,
          farmer,
          farm,
          suggestedLanguages,
        });
      }
      return res.json({
        isRegistered: false,
        phoneNumber: cleanPhone,
        suggestedLanguages: getSuggestedLanguages(),
      });
    } else {
      // Memory fallback
      const farmer = memoryStore.farmers.get(cleanPhone);
      if (farmer && farmer.isRegistered) {
        const farm = memoryStore.farms.get(cleanPhone);
        return res.json({
          isRegistered: true,
          farmer,
          farm,
          suggestedLanguages: getSuggestedLanguages(farmer.state),
        });
      }
      return res.json({
        isRegistered: false,
        phoneNumber: cleanPhone,
        suggestedLanguages: getSuggestedLanguages(),
      });
    }
  } catch (err) {
    console.error('check-phone error:', err);
    res.status(500).json({ error: 'Unable to check phone number. Please try again.' });
  }
});

// 2. Register new farmer
router.post('/register', async (req, res) => {
  try {
    const { phoneNumber, name, village, district, state, selectedLanguage } = req.body;

    if (!phoneNumber || !name || !village || !district || !state) {
      return res.status(400).json({ error: 'Please fill in all registration details' });
    }

    const cleanPhone = phoneNumber.trim().slice(-10);
    const suggestedLanguages = getSuggestedLanguages(state);
    const chosenLang = selectedLanguage || suggestedLanguages[0];

    if (isDbConnected) {
      let farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
      if (!farmer) {
        farmer = new Farmer({
          phoneNumber: cleanPhone,
          name,
          village,
          district,
          state,
          selectedLanguage: chosenLang,
          isRegistered: true,
        });
      } else {
        farmer.name = name;
        farmer.village = village;
        farmer.district = district;
        farmer.state = state;
        farmer.selectedLanguage = chosenLang;
        farmer.isRegistered = true;
      }
      await farmer.save();

      let farm = await Farm.findOne({ farmerId: farmer._id });
      if (!farm) {
        farm = await Farm.create({ farmerId: farmer._id, totalAcreage: 2, currentSeason: 'Kharif' });
      }

      let soil = await Soil.findOne({ farmerId: farmer._id });
      if (!soil) {
        soil = await Soil.create({ farmerId: farmer._id });
      }

      return res.status(201).json({
        success: true,
        farmer,
        farm,
        soil,
        suggestedLanguages,
      });
    } else {
      // Memory fallback
      const farmer = {
        _id: 'mem_' + cleanPhone,
        phoneNumber: cleanPhone,
        name,
        village,
        district,
        state,
        selectedLanguage: chosenLang,
        isRegistered: true,
        createdAt: new Date(),
      };
      memoryStore.farmers.set(cleanPhone, farmer);

      const farm = {
        _id: 'farm_' + cleanPhone,
        farmerId: farmer._id,
        totalAcreage: 2,
        currentSeason: 'Kharif',
      };
      memoryStore.farms.set(cleanPhone, farm);

      return res.status(201).json({
        success: true,
        farmer,
        farm,
        suggestedLanguages,
      });
    }
  } catch (err) {
    console.error('register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// 3. Update Language Preference
router.post('/language', async (req, res) => {
  try {
    const { phoneNumber, language } = req.body;
    if (!phoneNumber || !language) {
      return res.status(400).json({ error: 'Phone number and language are required' });
    }
    const cleanPhone = phoneNumber.trim().slice(-10);

    if (isDbConnected) {
      const farmer = await Farmer.findOneAndUpdate(
        { phoneNumber: cleanPhone },
        { selectedLanguage: language },
        { new: true }
      );
      if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });
      return res.json({ success: true, farmer });
    } else {
      const farmer = memoryStore.farmers.get(cleanPhone);
      if (!farmer) return res.status(404).json({ error: 'Farmer profile not found' });
      farmer.selectedLanguage = language;
      memoryStore.farmers.set(cleanPhone, farmer);
      return res.json({ success: true, farmer });
    }
  } catch (err) {
    console.error('language update error:', err);
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// 4. Get suggested languages by state
router.get('/languages', (req, res) => {
  const { state } = req.query;
  const languages = getSuggestedLanguages(state);
  res.json({ languages });
});

export default router;
