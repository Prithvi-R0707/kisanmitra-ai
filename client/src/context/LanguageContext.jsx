import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { switchLanguage } from '../i18n';
import { LANGUAGES, getLanguageConfig } from '../config/languages';
import { updateFarmerLanguage } from '../api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children, farmer, onFarmerUpdated }) {
  const { i18n } = useTranslation();
  const [currentCode, setCurrentCode] = useState(() => {
    return localStorage.getItem('kisanmitra_lang') || i18n.language || 'en';
  });

  // Ensure i18n matches stored language on initial load
  useEffect(() => {
    const saved = localStorage.getItem('kisanmitra_lang');
    if (saved && saved !== i18n.language) {
      switchLanguage(saved).then(() => {
        setCurrentCode(saved);
      });
    }
  }, []);

  // Sync language when farmer profile loads or changes
  useEffect(() => {
    const profileLang = farmer?.selectedLanguage?.code;
    if (profileLang && profileLang !== currentCode) {
      changeLanguage(profileLang, false);
    }
  }, [farmer?.selectedLanguage?.code]);

  const changeLanguage = async (newCode, phoneOrSync = false) => {
    const clean = (newCode || 'en').toLowerCase().slice(0, 2);
    await switchLanguage(clean);
    setCurrentCode(clean);
    localStorage.setItem('kisanmitra_lang', clean);

    const config = getLanguageConfig(clean);
    const phone = typeof phoneOrSync === 'string' ? phoneOrSync : (farmer?.phoneNumber);

    if (phone && phoneOrSync) {
      try {
        const res = await updateFarmerLanguage(phone, {
          code: config.code,
          name: config.name,
          nativeName: config.nativeName,
        });
        if (res.farmer && onFarmerUpdated) {
          onFarmerUpdated(res.farmer);
        }
      } catch (err) {
        console.warn('Failed to update language on server:', err);
      }
    }

    return config;
  };

  // Intl helper formatters
  const formatters = useMemo(() => {
    const localeMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      mr: 'mr-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      pa: 'pa-IN',
      or: 'or-IN',
    };
    const activeLocale = localeMap[currentCode] || 'en-IN';

    return {
      formatCurrency: (amount) => {
        try {
          return new Intl.NumberFormat(activeLocale, {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(amount || 0);
        } catch (e) {
          return `₹${amount}`;
        }
      },
      formatNumber: (num) => {
        try {
          return new Intl.NumberFormat(activeLocale).format(num || 0);
        } catch (e) {
          return `${num}`;
        }
      },
      formatDate: (dateInput) => {
        try {
          const date = new Date(dateInput);
          return new Intl.DateTimeFormat(activeLocale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }).format(date);
        } catch (e) {
          return new Date(dateInput).toLocaleDateString();
        }
      },
    };
  }, [currentCode]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage: currentCode,
        languageConfig: getLanguageConfig(currentCode),
        languages: LANGUAGES,
        changeLanguage,
        ...formatters,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
