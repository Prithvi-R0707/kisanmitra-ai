import express from 'express';
import Farmer from '../models/Farmer.js';
import Farm from '../models/Farm.js';
import Soil from '../models/Soil.js';
import DailyPlan from '../models/DailyPlan.js';
import TranslationCache from '../models/TranslationCache.js';
import History from '../models/History.js';
import { memoryHistory } from './recordsRoutes.js';
import { getLanguageName } from '../utils/languageHelper.js';
import { getFallbackDiagnosis } from '../utils/multilingualReplies.js';
import {
  ENGLISH_SOIL_QUESTIONS,
  STATIC_SOIL_TRANSLATIONS,
  evaluateSoilType,
  getCurrentSeason,
  getTopCrops,
} from '../utils/farmIntelligence.js';
import { isDbConnected } from '../config/db.js';

const router = express.Router();

// Memory caches
const weatherCache = new Map(); // key: district.toLowerCase(), value: { data, expiresAt }
const memorySoilStore = new Map();
const memoryDailyPlans = new Map();
const memoryTranslations = new Map();

// Helper: Open-Meteo weather code to farmer friendly description + icon
function parseWeatherCode(code) {
  if (code === 0) return { conditionKey: 'Clear Sky', label: 'Clear Sky', icon: '☀️' };
  if (code === 1 || code === 2) return { conditionKey: 'Partly Cloudy', label: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { conditionKey: 'Overcast', label: 'Overcast', icon: '☁️' };
  if ([51, 53, 55, 61, 63].includes(code)) return { conditionKey: 'Light Showers', label: 'Light Showers', icon: '🌦️' };
  if ([65, 80, 81, 82].includes(code)) return { conditionKey: 'Heavy Rain', label: 'Heavy Rain', icon: '🌧️' };
  if ([95, 96, 99].includes(code)) return { conditionKey: 'Thunderstorm', label: 'Thunderstorm', icon: '⛈️' };
  return { conditionKey: 'Pleasant', label: 'Pleasant', icon: '🌤️' };
}

// 1. Soil Questions (with translation caching)
router.get('/soil-questions', async (req, res) => {
  try {
    const lang = (req.query.lang || 'en').toLowerCase().slice(0, 2);

    if (lang === 'en') {
      return res.json({ questions: ENGLISH_SOIL_QUESTIONS });
    }

    // Check DB or memory cache
    if (isDbConnected) {
      const cached = await TranslationCache.findOne({ key: 'soil_questions', language: lang }).lean();
      if (cached && cached.data) {
        return res.json({ questions: cached.data });
      }
    } else {
      const mem = memoryTranslations.get(`soil_questions_${lang}`);
      if (mem) return res.json({ questions: mem });
    }

    // Check static translations
    if (STATIC_SOIL_TRANSLATIONS[lang]) {
      const translated = STATIC_SOIL_TRANSLATIONS[lang];
      if (isDbConnected) {
        await TranslationCache.create({ key: 'soil_questions', language: lang, data: translated }).catch(() => {});
      } else {
        memoryTranslations.set(`soil_questions_${lang}`, translated);
      }
      return res.json({ questions: translated });
    }

    // Attempt Gemini translation once if API key is set
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (apiKey) {
      try {
        const prompt = `Translate the following farming questions JSON to language code "${lang}". Keep JSON structure identical. Only translate title, subtitle, and option labels into simple farmer-friendly words:\n${JSON.stringify(ENGLISH_SOIL_QUESTIONS)}`;
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(rawText);
          if (Array.isArray(parsed) && parsed.length === 5) {
            if (isDbConnected) {
              await TranslationCache.create({ key: 'soil_questions', language: lang, data: parsed }).catch(() => {});
            } else {
              memoryTranslations.set(`soil_questions_${lang}`, parsed);
            }
            return res.json({ questions: parsed });
          }
        }
      } catch (e) {
        console.warn('Gemini soil questions translation error:', e.message);
      }
    }

    // Fallback to English
    return res.json({ questions: ENGLISH_SOIL_QUESTIONS });
  } catch (err) {
    res.json({ questions: ENGLISH_SOIL_QUESTIONS });
  }
});

// 2. Submit Soil Profile
router.post('/soil-profile', async (req, res) => {
  try {
    const { phone, answers } = req.body;
    if (!phone || !answers) {
      return res.status(400).json({ error: 'Phone and answers are required' });
    }
    const cleanPhone = phone.trim().slice(-10);
    const { soilType, details } = evaluateSoilType(answers);

    if (isDbConnected) {
      const farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
      if (farmer) {
        await Soil.findOneAndUpdate(
          { farmerId: farmer._id },
          {
            color: answers.colour || '',
            texture: answers.texture || '',
            waterHolding: answers.waterHolding || '',
            soilType,
            notes: details.name,
          },
          { upsert: true, new: true }
        );
      }
    } else {
      memorySoilStore.set(cleanPhone, { soilType, details, answers });
    }

    return res.json({
      success: true,
      soilType,
      details,
    });
  } catch (err) {
    console.error('soil-profile error:', err);
    res.status(500).json({ error: 'Failed to evaluate soil' });
  }
});

// 3. Weather API with 1-hour cache
router.get('/weather', async (req, res) => {
  try {
    const district = (req.query.district || 'Nagpur').trim();
    const cacheKey = district.toLowerCase();

    // Check cache
    const cached = weatherCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return res.json(cached.data);
    }

    // Geocode district via Open-Meteo
    let lat = 21.1458;
    let lon = 79.0882;
    let locationName = district;

    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district)}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results[0]) {
          lat = geoData.results[0].latitude;
          lon = geoData.results[0].longitude;
          locationName = geoData.results[0].name;
        }
      }
    } catch (e) {
      console.warn('Geocoding error, using default coordinates');
    }

    // Fetch forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=3`;
    const fRes = await fetch(forecastUrl);
    if (!fRes.ok) throw new Error('Weather service unavailable');
    const fData = await fRes.json();

    const currentWeatherCode = fData.current?.weather_code ?? 0;
    const currentMeta = parseWeatherCode(currentWeatherCode);

    const dailyForecast = [];
    const days = ['Today', 'Tomorrow', 'Day 3'];
    const dayKeys = ['today', 'tomorrow', 'day3'];
    if (fData.daily && fData.daily.time) {
      for (let i = 0; i < Math.min(3, fData.daily.time.length); i++) {
        const code = fData.daily.weather_code?.[i] ?? 0;
        dailyForecast.push({
          day: days[i] || `Day ${i + 1}`,
          dayKey: dayKeys[i] || `day_${i + 1}`,
          date: fData.daily.time[i],
          maxTemp: Math.round(fData.daily.temperature_2m_max?.[i] ?? 30),
          minTemp: Math.round(fData.daily.temperature_2m_min?.[i] ?? 20),
          rainChance: fData.daily.precipitation_probability_max?.[i] ?? 0,
          ...parseWeatherCode(code),
        });
      }
    }

    const result = {
      district: locationName,
      current: {
        temp: Math.round(fData.current?.temperature_2m ?? 28),
        humidity: fData.current?.relative_humidity_2m ?? 50,
        precipitation: fData.current?.precipitation ?? 0,
        conditionKey: currentMeta.conditionKey,
        label: currentMeta.label,
        icon: currentMeta.icon,
      },
      forecast: dailyForecast,
    };

    // Cache for 1 hour
    weatherCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });

    return res.json(result);
  } catch (err) {
    console.error('weather error:', err);
    // Graceful offline fallback
    res.json({
      district: req.query.district || 'Farm Area',
      current: { temp: 29, humidity: 55, precipitation: 0, conditionKey: 'Partly Cloudy', label: 'Partly Cloudy', icon: '⛅' },
      forecast: [
        { day: 'Today', dayKey: 'today', maxTemp: 31, minTemp: 21, rainChance: 15, conditionKey: 'Partly Cloudy', label: 'Partly Cloudy', icon: '⛅' },
        { day: 'Tomorrow', dayKey: 'tomorrow', maxTemp: 32, minTemp: 22, rainChance: 10, conditionKey: 'Clear Sky', label: 'Clear Sky', icon: '☀️' },
        { day: 'Day 3', dayKey: 'day3', maxTemp: 30, minTemp: 21, rainChance: 25, conditionKey: 'Light Showers', label: 'Light Showers', icon: '🌦️' },
      ],
    });
  }
});

// 4. Crop Recommendations (Rule-based top 3 + Gemini 2-sentence explanation)
router.post('/crop-recommendations', async (req, res) => {
  try {
    const { phone, soilType = 'loamy', district = '', language } = req.body;
    const cleanPhone = (phone || '').trim().slice(-10);

    let farmer = null;
    if (isDbConnected && cleanPhone) {
      farmer = await Farmer.findOne({ phoneNumber: cleanPhone }).lean();
    }
    const farmerName = farmer?.name || 'Kisan';
    
    // Resolve farmer language name and code
    let langCode = 'en';
    let farmerLang = 'English';
    const langParam = language || farmer?.selectedLanguage?.code || farmer?.selectedLanguage?.name;
    const LANG_MAP = [
      { code: 'ta', name: 'Tamil' },
      { code: 'hi', name: 'Hindi' },
      { code: 'te', name: 'Telugu' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'mr', name: 'Marathi' },
      { code: 'bn', name: 'Bengali' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'or', name: 'Odia' },
      { code: 'en', name: 'English' },
    ];
    if (langParam) {
      const match = LANG_MAP.find(
        (l) => l.code === langParam.toLowerCase().slice(0, 2) || l.name.toLowerCase() === langParam.toLowerCase()
      );
      if (match) {
        langCode = match.code;
        farmerLang = match.name;
      }
    }

    const season = getCurrentSeason();
    const crops = getTopCrops(soilType, season.id);

    let explanation = '';
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (apiKey) {
      try {
        const cropNames = crops.map((c) => c.name).join(', ');
        const prompt = `You are KisanMitra. In exactly 2 short sentences in ${farmerLang}, explain to farmer ${farmerName} why ${cropNames} are best suited for their ${soilType} soil in ${season.name} season. No technical terms, keep words simple.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          explanation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (e) {
        console.warn('Gemini crop explanation failed:', e.message);
      }
    }

    if (!explanation) {
      const FALLBACK_EXPLANATIONS = {
        ta: `${farmerName}, உங்கள் ${soilType} மண்ணிற்கும் தற்போதைய பருவத்திற்கும் இந்த பயிர்கள் மிகவும் ஏற்றவை. நல்ல மகசூல் கிடைக்கும்.`,
        hi: `${farmerName} जी, आपकी ${soilType} मिट्टी और इस मौसम के लिए ये फसलें सबसे उपयुक्त हैं। इनमें अच्छी पैदावार मिलेगी।`,
        te: `${farmerName} గారూ, మీ ${soilType} నేలకు మరియు ఈ కాలానికి ఈ పంటలు చాలా అనుకూలమైనవి. మంచి దిగుబడి వస్తుంది.`,
        kn: `${farmerName} ಅವರೇ, ನಿಮ್ಮ ${soilType} ಮಣ್ಣಿಗೆ ಮತ್ತು ಈ ಋತುವಿಗೆ ಈ ಬೆಳೆಗಳು ಅತ್ಯಂತ ಸೂಕ್ತವಾಗಿವೆ. ಉತ್ತಮ ಇಳುವರಿ ಸಿಗುತ್ತದೆ.`,
        ml: `${farmerName}, നിങ്ങളുടെ ${soilType} മണ്ണിനും ഈ കാലാവസ്ഥയ്ക്കും ഈ വിളകൾ വളരെ അനുയോജ്യമാണ്. നല്ല വിളവ് ലഭിക്കും.`,
        mr: `${farmerName} जी, तुमच्या ${soilType} मातीसाठी आणि या हंगामासाठी ही पिके उत्तम आहेत. चांगले उत्पादन मिळेल.`,
        bn: `${farmerName}, আপনার ${soilType} মাটি এবং এই মরসুমের জন্য এই ফসলগুলি সবচেয়ে উপযুক্ত। ভালো ফলন পাবেন।`,
        gu: `${farmerName} ભાઈ, તમારી ${soilType} જમીન અને આ ઋતુ માટે આ પાક સૌથી શ્રેષ્ઠ છે. સારો પાક મળશે.`,
        pa: `${farmerName} ਜੀ, ਤੁਹਾਡੀ ${soilType} ਜ਼ਮੀਨ ਅਤੇ ਇਸ ਮੌਸਮ ਲਈ ਇਹ ਫ਼ਸਲਾਂ ਬਹੁਤ ਵਧੀਆ ਹਨ। ਚੰਗਾ ਝਾੜ ਮਿਲੇਗਾ।`,
        or: `${farmerName} ବାବୁ, ଆପଣଙ୍କ ${soilType} ଜମି ଏବଂ ଏହି ଋତୁ ପାଇଁ ଏହି ଫସଲଗୁଡ଼ିକ ଖୁବ୍ ଉପଯୁକ୍ତ। ଭଲ ଅମଳ ମିଳିବ।`,
        en: `Hello ${farmerName}, these crops are naturally suited for your ${soilType} soil in this season. They will give good yield with regular care.`,
      };
      explanation = FALLBACK_EXPLANATIONS[langCode] || FALLBACK_EXPLANATIONS.en;
    }

    return res.json({
      season,
      soilType,
      crops,
      explanation,
    });
  } catch (err) {
    console.error('crop-recommendations error:', err);
    res.status(500).json({ error: 'Failed to generate crop recommendations' });
  }
});

// 5. Select Crop
router.post('/select-crop', async (req, res) => {
  try {
    const { phone, crop } = req.body;
    if (!phone || !crop) return res.status(400).json({ error: 'Phone and crop are required' });
    const cleanPhone = phone.trim().slice(-10);

    if (isDbConnected) {
      const farmer = await Farmer.findOne({ phoneNumber: cleanPhone });
      if (farmer) {
        await Farm.findOneAndUpdate(
          { farmerId: farmer._id },
          { primaryCrop: crop },
          { upsert: true, new: true }
        );
      }
    }
    return res.json({ success: true, crop });
  } catch (err) {
    res.status(500).json({ error: 'Failed to select crop' });
  }
});

// 6. Daily Farm Plan (1 Gemini call cached per farmer per day per language)
router.post('/daily-plan', async (req, res) => {
  try {
    const { phone, crop = 'Paddy', daysSinceSowing = 15, weatherSummary = 'Sunny 30°C', language } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    const cleanPhone = phone.trim().slice(-10);

    const todayDateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Load farmer details
    let farmer = null;
    if (isDbConnected) {
      farmer = await Farmer.findOne({ phoneNumber: cleanPhone }).lean();
    }
    const farmerName = farmer?.name || 'Farmer';

    const LANG_MAP = [
      { code: 'ta', name: 'Tamil' },
      { code: 'hi', name: 'Hindi' },
      { code: 'te', name: 'Telugu' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'mr', name: 'Marathi' },
      { code: 'bn', name: 'Bengali' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'or', name: 'Odia' },
      { code: 'en', name: 'English' },
    ];
    const langParam = language || farmer?.selectedLanguage?.code || farmer?.selectedLanguage?.name || 'en';
    const match = LANG_MAP.find(
      (l) => l.code === langParam.toLowerCase().slice(0, 2) || l.name.toLowerCase() === langParam.toLowerCase()
    );
    const farmerLangCode = match ? match.code : 'en';
    const farmerLangName = match ? match.name : 'English';

    // Check if already generated today for this farmer in this language
    if (isDbConnected) {
      const existing = await DailyPlan.findOne({
        phoneNumber: cleanPhone,
        dateKey: todayDateKey,
        language: farmerLangCode,
      }).lean();
      if (existing && existing.tasks && existing.tasks.length > 0) {
        return res.json({
          dateKey: todayDateKey,
          crop: existing.crop,
          tasks: existing.tasks,
          isCached: true,
        });
      }
    } else {
      const mem = memoryDailyPlans.get(`${cleanPhone}_${todayDateKey}_${farmerLangCode}`);
      if (mem) {
        return res.json({
          dateKey: todayDateKey,
          crop: mem.crop,
          tasks: mem.tasks,
          isCached: true,
        });
      }
    }

    // Generate with Gemini
    let tasks = [];
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (apiKey) {
      try {
        const prompt = `You are KisanMitra. Generate 3 to 4 simple, practical daily farm tasks for farmer ${farmerName} growing ${crop} (Day ${daysSinceSowing} after sowing). Weather today: ${weatherSummary}. Reply ONLY with valid JSON array of objects with structure: [{"id": 1, "task": "...", "time": "Morning/Afternoon/Evening", "category": "Watering/Fertilizer/Field Check"}]. Tasks MUST be written in ${farmerLangName}, max 1 short sentence each. No other text or markdown.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            tasks = parsed.map((t, idx) => ({
              id: t.id || idx + 1,
              task: t.task,
              time: t.time || 'Morning',
              category: t.category || 'Field Check',
              completed: false,
            }));
          }
        }
      } catch (e) {
        console.warn('Gemini daily plan failed:', e.message);
      }
    }

    // Localized fallback tasks if Gemini fails or no key
    if (!tasks || tasks.length === 0) {
      const FALLBACK_TASKS = {
        ta: [
          { id: 1, task: 'காலையில் வயலின் ஈரப்பதத்தை சரிபார்த்து மிதமான தண்ணீர் பாய்ச்சவும்.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'பயிர்களின் இலைகளில் பூச்சி அல்லது புழு தாக்குதல் உள்ளதா என கவனிக்கவும்.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'வரப்புகளில் உள்ள தேவையற்ற களைகளை அகற்றவும்.', time: 'Evening', category: 'Weeding', completed: false },
        ],
        hi: [
          { id: 1, task: 'सुबह खेत में नमी देखकर हल्की सिंचाई करें।', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'दोपहर में पत्तियों पर किसी कीट या बीमारी के लक्षण जांचें।', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'शाम को क्यारियों से खरपतवार हटाएं।', time: 'Evening', category: 'Weeding', completed: false },
        ],
        te: [
          { id: 1, task: 'ఉదయాన్నే పొలంలో తేమను చూసి తగినంత నీరు పెట్టండి.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'మధ్యాహ్నం ఆకులపై ఏవైనా తెగుళ్లు ఉన్నాయేమో పరిశీలించండి.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'సాయంత్రం కలుపు మొక్కలను తొలగించండి.', time: 'Evening', category: 'Weeding', completed: false },
        ],
        kn: [
          { id: 1, task: 'ಬೆಳಿಗ್ಗೆ ಹೊಲದಲ್ಲಿ ತೇವಾಂಶ ನೋಡಿ ಹಗುರವಾದ ನೀರು ಹಾಯಿಸಿ.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'ಮಧ್ಯಾಹ್ನ ಎಲೆಗಳ ಮೇಲೆ ಕೀಟಬಾಧೆ ಇದೆಯೇ ಎಂದು ಪರೀಕ್ಷಿಸಿ.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'ಸಂಜೆ ಹೊಲದಲ್ಲಿರುವ ಕಳೆಗಳನ್ನು ತೆಗೆಯಿರಿ.', time: 'Evening', category: 'Weeding', completed: false },
        ],
        ml: [
          { id: 1, task: 'രാവിലെ നിലത്തെ ഈർപ്പം പരിശോധിച്ച് ആവശ്യത്തിന് നനയ്ക്കുക.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'ഉച്ചയ്ക്ക് ഇലകളിൽ കീടബാധയുണ്ടോ എന്ന് പരിശോധിക്കുക.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'വൈകുന്നേരം കളകൾ പറിച്ച് മാറ്റുക.', time: 'Evening', category: 'Weeding', completed: false },
        ],
        mr: [
          { id: 1, task: 'सकाळी शेतातील ओलावा तपासून हलके पाणी द्या.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'दुपारी पानांवर कीड किंवा रोगाची लक्षणे तपासा.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'संध्याकाळी शेतातील तण काढून टाका.', time: 'Evening', category: 'Weeding', completed: false },
        ],
        bn: [
          { id: 1, task: 'সকালে জমির আর্দ্রতা দেখে হালকা সেচ দিন।', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'দুপুরে পাতার ওপর কোনো পোকার আক্রমণ আছে কিনা দেখুন।', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'বিকেলে আগাছা পরিষ্কার করুন।', time: 'Evening', category: 'Weeding', completed: false },
        ],
        gu: [
          { id: 1, task: 'સવારે ખેતરમાં ભેજ જોઈને હળવું પાણી આપો.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'બપોરે પાંદડા પર જીવાત કે રોગના ચિહ્નો તપાસો.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'સાંજે ખેતરમાંથી નિંદામણ દૂર કરો.', time: 'Evening', category: 'Weeding', completed: false },
        ],
        pa: [
          { id: 1, task: 'ਸਵੇਰੇ ਖੇਤ ਵਿੱਚ ਨਮੀ ਵੇਖ ਕੇ ਹਲਕੀ ਸਿੰਚਾਈ ਕਰੋ।', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'ਦੁਪਹਿਰੇ ਪੱਤਿਆਂ ਉੱਤੇ ਕੀੜਿਆਂ ਜਾਂ ਬਿਮਾਰੀ ਦੇ ਲੱਛਣ ਜਾਂਚੋ।', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'ਸ਼ਾਮ ਨੂੰ ਖੇਤ ਵਿੱਚੋਂ ਨਦੀਨ ਕੱਢੋ।', time: 'Evening', category: 'Weeding', completed: false },
        ],
        or: [
          { id: 1, task: 'ସକାଳେ ଜମିରେ ଆର୍ଦ୍ରତା ଦେଖି ହାଲୁକା ପାଣି ମଡ଼ାନ୍ତୁ।', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'ମଧ୍ୟାହ୍ନରେ ପତ୍ରରେ କୌଣସି ପୋକ ଲାଗିଛି କି ନାହିଁ ଦେଖନ୍ତୁ।', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'ସନ୍ଧ୍ୟାରେ ଘାସ ବାଛନ୍ତୁ।', time: 'Evening', category: 'Weeding', completed: false },
        ],
        en: [
          { id: 1, task: 'Check soil moisture in the morning and irrigate lightly if dry.', time: 'Morning', category: 'Watering', completed: false },
          { id: 2, task: 'Inspect crop leaves in the afternoon for any signs of pest infestation.', time: 'Afternoon', category: 'Field Check', completed: false },
          { id: 3, task: 'Remove weeds around field borders in the evening.', time: 'Evening', category: 'Weeding', completed: false },
        ],
      };
      tasks = FALLBACK_TASKS[farmerLangCode] || FALLBACK_TASKS.en;
    }

    // Save so only ONE call is made per day per farmer per language
    if (isDbConnected && farmer) {
      await DailyPlan.create({
        farmerId: farmer._id,
        phoneNumber: cleanPhone,
        dateKey: todayDateKey,
        language: farmerLangCode,
        crop,
        daysSinceSowing,
        weatherSummary,
        tasks,
      }).catch(() => {});
    } else {
      memoryDailyPlans.set(`${cleanPhone}_${todayDateKey}_${farmerLangCode}`, { crop, tasks });
    }

    return res.json({
      dateKey: todayDateKey,
      crop,
      tasks,
      isCached: false,
    });
  } catch (err) {
    console.error('daily-plan error:', err);
    res.status(500).json({ error: 'Failed to generate daily plan' });
  }
});

// 5. Crop Photo Analysis (Gemini Vision)
router.post('/crop-diagnosis', async (req, res) => {
  try {
    const { phone, imageBase64, mimeType = 'image/jpeg', crop = '', language = '' } = req.body;
    if (!phone || !imageBase64) {
      return res.status(400).json({ error: 'Phone and image are required' });
    }

    const cleanPhone = phone.trim().slice(-10);
    let farmer = null;
    if (isDbConnected) {
      farmer = await Farmer.findOne({ phoneNumber: cleanPhone }).lean();
    }

    const farmerName = farmer?.name || 'Farmer';
    const langCode = (language || farmer?.selectedLanguage?.code || 'en').toLowerCase().slice(0, 2);
    const farmerLangName = (language && getLanguageName(language)) || farmer?.selectedLanguage?.name || getLanguageName(langCode);

    // Clean base64 string
    let rawBase64 = imageBase64;
    let actualMime = mimeType;
    if (rawBase64.includes(';base64,')) {
      const parts = rawBase64.split(';base64,');
      actualMime = parts[0].replace('data:', '') || mimeType;
      rawBase64 = parts[1];
    }

    let diagnosis = null;
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    if (apiKey && rawBase64) {
      try {
        const prompt = `You are KisanMitra, an expert plant pathologist and farming advisor.
Analyze this crop/plant photograph taken by farmer ${farmerName} (crop: ${crop || 'field crop'}).
Identify any crop disease, pest infestation, nutrient deficiency, or physiological issue visible on the leaves, stem, or plant.
Provide practical, immediate farming advice and indicate whether an agricultural specialist or Krishi Vigyan Kendra must be consulted.
You MUST reply ONLY with a valid JSON object with this exact structure:
{
  "problem": "<short specific name of the problem or 'Healthy Crop' in ${farmerLangName}>",
  "severity": "low" | "medium" | "high",
  "advice": "<2 short practical sentences of advice in ${farmerLangName}>",
  "see_expert": true | false
}
Do not include markdown or backticks.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        mimeType: actualMime,
                        data: rawBase64,
                      },
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          raw = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(raw);
          if (parsed && parsed.problem && parsed.advice) {
            diagnosis = {
              problem: parsed.problem,
              severity: ['low', 'medium', 'high'].includes(parsed.severity?.toLowerCase())
                ? parsed.severity.toLowerCase()
                : 'low',
              advice: parsed.advice,
              see_expert: Boolean(parsed.see_expert),
            };
          }
        }
      } catch (err) {
        console.warn('Gemini vision diagnosis error:', err.message);
      }
    }

    // Localized rule-based fallback if Gemini fails or no API key
    if (!diagnosis) {
      diagnosis = getFallbackDiagnosis(langCode, farmerName, crop);
    }

    // Save diagnosis to History
    const histItem = {
      phoneNumber: cleanPhone,
      action: 'diagnosis',
      type: 'activity',
      crop: crop || '',
      details: `${diagnosis.problem} (${diagnosis.severity}): ${diagnosis.advice}`,
      date: new Date(),
    };

    if (isDbConnected) {
      await History.create(histItem).catch((e) => console.warn('Save history error:', e));
    } else {
      histItem._id = 'mem_hist_' + Date.now();
      const list = memoryHistory.get(cleanPhone) || [];
      list.unshift(histItem);
      memoryHistory.set(cleanPhone, list);
    }

    return res.json({
      success: true,
      diagnosis: {
        problem: diagnosis.problem,
        severity: diagnosis.severity,
        advice: diagnosis.advice,
        see_expert: diagnosis.see_expert,
        disclaimer: 'This is guidance, not a final diagnosis.',
      },
      savedRecord: histItem,
    });
  } catch (err) {
    console.error('crop-diagnosis error:', err);
    res.status(500).json({ error: 'Failed to analyze crop photo' });
  }
});

export default router;
