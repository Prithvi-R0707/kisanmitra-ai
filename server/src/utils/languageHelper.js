// Mapping Indian states and regions to up to 6 relevant languages
const STATE_LANGUAGES = {
  'Tamil Nadu': [
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ],
  'Karnataka': [
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ],
  'Andhra Pradesh': [
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ],
  'Telangana': [
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  ],
  'Kerala': [
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  ],
  'Maharashtra': [
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  ],
  'Gujarat': [
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  ],
  'Punjab': [
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ],
  'Uttar Pradesh': [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
  ],
  'Bihar': [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी' },
    { code: 'mag', name: 'Magahi', nativeName: 'मगही' },
    { code: 'mai', name: 'Maithili', nativeName: 'मैथिली' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ],
  'West Bengal': [
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  ],
  'Odisha': [
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ],
  'Madhya Pradesh': [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ],
  'Rajasthan': [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'raj', name: 'Rajasthani', nativeName: 'राजस्थानी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  ],
  'Haryana': [
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ]
};

const DEFAULT_LANGUAGES = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
];

export function getSuggestedLanguages(state) {
  if (!state) return DEFAULT_LANGUAGES;
  const match = Object.keys(STATE_LANGUAGES).find(
    (s) => s.toLowerCase() === state.trim().toLowerCase()
  );
  return (match ? STATE_LANGUAGES[match] : DEFAULT_LANGUAGES).slice(0, 6);
}

const ALL_LANGUAGES_MAP = {
  en: 'English',
  hi: 'Hindi',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  ml: 'Malayalam',
  mr: 'Marathi',
  bn: 'Bengali',
  gu: 'Gujarati',
  pa: 'Punjabi',
  or: 'Odia',
};

export function getLanguageName(code) {
  const clean = (code || 'en').toLowerCase().slice(0, 2);
  return ALL_LANGUAGES_MAP[clean] || 'English';
}

