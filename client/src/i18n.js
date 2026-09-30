import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';
import { DEFAULT_LANGUAGE, getLanguageConfig } from './config/languages';

// Static preloaded critical locales for instant start
const initialResources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
};

// Map of lazy-loadable locales
const LOCALE_LOADERS = {
  te: () => import('./locales/te.json'),
  kn: () => import('./locales/kn.json'),
  ml: () => import('./locales/ml.json'),
  mr: () => import('./locales/mr.json'),
  bn: () => import('./locales/bn.json'),
  gu: () => import('./locales/gu.json'),
  pa: () => import('./locales/pa.json'),
  or: () => import('./locales/or.json'),
};

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('kisanmitra_lang') : null;
const initialLng = (savedLanguage && initialResources[savedLanguage])
  ? savedLanguage
  : DEFAULT_LANGUAGE;

i18n.use(initReactI18next).init({
  resources: initialResources,
  lng: initialLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false,
  },
  returnEmptyString: false,
});

// Switch language with lazy loading of locale file and document attributes
export async function switchLanguage(code) {
  const cleanCode = (code || 'en').toLowerCase().slice(0, 2);

  // If locale bundle not yet loaded in i18next, load it dynamically
  if (!i18n.hasResourceBundle(cleanCode, 'translation') && LOCALE_LOADERS[cleanCode]) {
    try {
      const module = await LOCALE_LOADERS[cleanCode]();
      i18n.addResourceBundle(cleanCode, 'translation', module.default || module, true, true);
    } catch (err) {
      console.warn(`Could not load locale file for ${cleanCode}, falling back to English.`, err);
    }
  }

  await i18n.changeLanguage(cleanCode);

  // Update HTML tag attributes and font
  if (typeof document !== 'undefined') {
    document.documentElement.lang = cleanCode;
    const config = getLanguageConfig(cleanCode);
    document.body.style.fontFamily = config.font;
  }
}

export default i18n;
