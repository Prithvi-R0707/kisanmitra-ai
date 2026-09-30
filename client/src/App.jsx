import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import PhoneAuth from './components/PhoneAuth';
import FarmerProfileCard from './components/FarmerProfileCard';
import CallScreen from './components/CallScreen';
import LanguageSelector from './components/LanguageSelector';
import { checkPhone } from './api';
import { LANGUAGES } from './config/languages';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function AppContent() {
  const { t } = useTranslation();
  const { changeLanguage, currentLanguage, languageConfig } = useLanguage();

  const [farmer, setFarmer] = useState(null);
  const [farm, setFarm] = useState(null);
  const [suggestedLanguages, setSuggestedLanguages] = useState([]);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  // Load saved session if exists
  useEffect(() => {
    const savedPhone = localStorage.getItem('kisanmitra_phone');
    const savedLang = localStorage.getItem('kisanmitra_lang');
    if (savedLang) {
      changeLanguage(savedLang, false);
    }
    if (savedPhone) {
      setAppLoading(true);
      checkPhone(savedPhone)
        .then((res) => {
          if (res.isRegistered && res.farmer) {
            setFarmer(res.farmer);
            setFarm(res.farm);
            setSuggestedLanguages(res.suggestedLanguages || []);
            const targetLang = savedLang || res.farmer.selectedLanguage?.code;
            if (targetLang) {
              changeLanguage(targetLang, false);
            }
          } else {
            localStorage.removeItem('kisanmitra_phone');
          }
        })
        .catch(() => {
          localStorage.removeItem('kisanmitra_phone');
        })
        .finally(() => {
          setAppLoading(false);
        });
    }
  }, []);

  const handleAuthSuccess = (farmerData, farmData, languages) => {
    setFarmer(farmerData);
    setFarm(farmData);
    if (languages) setSuggestedLanguages(languages);
    localStorage.setItem('kisanmitra_phone', farmerData.phoneNumber);
    const langCode = farmerData.selectedLanguage?.code || currentLanguage;
    if (langCode) {
      localStorage.setItem('kisanmitra_lang', langCode);
      changeLanguage(langCode, false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kisanmitra_phone');
    setFarmer(null);
    setFarm(null);
  };

  const handleLanguageChange = async (selectedLang) => {
    const config = await changeLanguage(selectedLang.code, farmer?.phoneNumber);
    if (farmer) {
      setFarmer((prev) => (prev ? { ...prev, selectedLanguage: config } : prev));
    }
    setShowLanguageModal(false);
  };

  const handleQuickDialLogin = async (phone) => {
    try {
      const res = await checkPhone(phone);
      if (res.isRegistered && res.farmer) {
        handleAuthSuccess(res.farmer, res.farm, res.suggestedLanguages);
      }
    } catch (err) {
      console.warn('Quick dial check', err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* App Header */}
      <Header
        farmer={farmer}
        onOpenCall={() => setShowCallScreen(true)}
        onOpenLanguage={() => setShowLanguageModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-lg w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {appLoading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-stone-600 font-semibold text-sm">
              {t('common.loading')}
            </p>
          </div>
        ) : farmer ? (
          <FarmerProfileCard
            farmer={farmer}
            farm={farm}
            onOpenCall={() => setShowCallScreen(true)}
            onOpenLanguage={() => setShowLanguageModal(true)}
            onLogout={handleLogout}
          />
        ) : (
          <div className="space-y-4">
            <PhoneAuth onAuthSuccess={handleAuthSuccess} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 px-3 text-center text-xs text-stone-500 border-t border-stone-200 bg-stone-50">
        <p className="font-semibold text-stone-600">
          🌾 {t('common.appTitle')} • {t('common.appSubtitle')}
        </p>
        <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
          {t('common.footerNotice')}
        </p>
      </footer>

      {/* Simulated Phone Call Screen */}
      {showCallScreen && (
        <CallScreen
          farmer={farmer}
          onClose={() => setShowCallScreen(false)}
          onQuickLogin={handleQuickDialLogin}
          onOpenLanguage={() => setShowLanguageModal(true)}
          suggestedLanguages={suggestedLanguages}
        />
      )}

      {/* Language Change Modal */}
      {showLanguageModal && (
        <LanguageSelector
          isModal
          languages={LANGUAGES}
          selectedLanguage={languageConfig}
          onSelect={handleLanguageChange}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
