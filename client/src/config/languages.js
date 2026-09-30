// Single source of truth for languages across UI, i18n, voice, and font styles
export const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-IN',
    font: "'Inter', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    font: "'Noto Sans Devanagari', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    font: "'Noto Sans Tamil', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    font: "'Noto Sans Telugu', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    font: "'Noto Sans Kannada', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    font: "'Noto Sans Malayalam', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    font: "'Noto Sans Devanagari', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    font: "'Noto Sans Bengali', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    font: "'Noto Sans Gujarati', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    font: "'Noto Sans Gurmukhi', sans-serif",
    dir: 'ltr',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    font: "'Noto Sans Oriya', sans-serif",
    dir: 'ltr',
  },
];

export const DEFAULT_LANGUAGE = 'en';

export function getLanguageConfig(code) {
  if (!code) return LANGUAGES[0];
  const clean = code.toLowerCase().slice(0, 2);
  return LANGUAGES.find((l) => l.code === clean) || LANGUAGES[0];
}

export function getSpeechCode(code) {
  return getLanguageConfig(code).speechCode;
}
