import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, MapPin, Building, ChevronRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { checkPhone, registerFarmer, getLanguagesByState } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES } from '../config/languages';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Maharashtra',
  'Gujarat',
  'Punjab',
  'Uttar Pradesh',
  'Bihar',
  'Madhya Pradesh',
  'Rajasthan',
  'West Bengal',
  'Odisha',
  'Haryana',
];

export default function PhoneAuth({ onAuthSuccess, initialPhone = '' }) {
  const { t } = useTranslation();
  const { changeLanguage } = useLanguage();

  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [step, setStep] = useState('phone'); // 'phone' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Registration Fields
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [suggestedLanguages, setSuggestedLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  // 1. Submit Phone
  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorKey('');
    setSuccessMsg('');

    const clean = phoneNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setErrorKey('INVALID_PHONE');
      return;
    }

    setLoading(true);
    try {
      const res = await checkPhone(clean);
      if (res.isRegistered && res.farmer) {
        // Set language from profile
        if (res.farmer.selectedLanguage?.code) {
          await changeLanguage(res.farmer.selectedLanguage.code, false);
        }
        setSuccessMsg(t('auth.welcomeBack', { name: res.farmer.name }));
        setTimeout(() => {
          onAuthSuccess(res.farmer, res.farm, res.suggestedLanguages);
        }, 800);
      } else {
        // First login -> Show registration
        setStep('register');
        const langRes = await getLanguagesByState(state);
        const langs = langRes.languages?.length ? langRes.languages : res.suggestedLanguages || LANGUAGES.slice(0, 6);
        setSuggestedLanguages(langs);
        if (langs && langs.length > 0) {
          setSelectedLanguage(langs[0]);
          await changeLanguage(langs[0].code, false);
        }
      }
    } catch (err) {
      setErrorKey(err.message === 'Failed to verify phone number' ? 'NETWORK_ERROR' : 'GENERIC_ERROR');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle State Change -> Re-fetch / Suggest languages
  const handleStateChange = async (newState) => {
    setState(newState);
    try {
      const res = await getLanguagesByState(newState);
      if (res.languages && res.languages.length > 0) {
        setSuggestedLanguages(res.languages);
        setSelectedLanguage(res.languages[0]);
        await changeLanguage(res.languages[0].code, false);
      }
    } catch (err) {
      console.warn('Failed to update languages for state', err);
    }
  };

  const handleSelectLanguage = async (lang) => {
    setSelectedLanguage(lang);
    await changeLanguage(lang.code, false);
  };

  // 3. Submit Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorKey('');

    if (!name.trim()) return setErrorKey('ENTER_NAME');
    if (!village.trim()) return setErrorKey('ENTER_VILLAGE');
    if (!district.trim()) return setErrorKey('ENTER_DISTRICT');

    setLoading(true);
    try {
      const clean = phoneNumber.replace(/\D/g, '').slice(-10);
      const chosenLang = selectedLanguage || suggestedLanguages[0] || { code: 'en', name: 'English', nativeName: 'English' };

      const res = await registerFarmer({
        phoneNumber: clean,
        name: name.trim(),
        village: village.trim(),
        district: district.trim(),
        state,
        selectedLanguage: chosenLang,
      });

      await changeLanguage(chosenLang.code, false);
      setSuccessMsg(t('auth.registrationSuccess'));
      setTimeout(() => {
        onAuthSuccess(res.farmer, res.farm, suggestedLanguages);
      }, 700);
    } catch (err) {
      setErrorKey('REGISTRATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-lg border border-stone-200 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-6 text-white text-center">
        <div className="inline-flex p-3 bg-emerald-600/60 rounded-2xl mb-2 text-2xl shadow-inner border border-emerald-400/40">
          🌾
        </div>
        <h2 className="text-2xl font-black tracking-tight">{t('common.appTitle')}</h2>
        <p className="text-emerald-100 text-sm mt-1 font-medium leading-relaxed">
          {t('common.tagline')}
        </p>
      </div>

      <div className="p-6">
        {/* Error message banner */}
        {errorKey && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span className="break-words">{t(`errors.${errorKey}`, { defaultValue: t('errors.GENERIC_ERROR') })}</span>
          </div>
        )}

        {/* Success message banner */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-sm font-semibold animate-pulse">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="break-words">{successMsg}</span>
          </div>
        )}

        {step === 'phone' ? (
          /* STEP 1: Phone Login / Identity */
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-stone-700 font-bold text-sm mb-1.5">
                {t('auth.phoneLabel')}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-stone-500 font-bold text-base pl-1">
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder={t('auth.phonePlaceholder')}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-16 pr-4 py-3.5 bg-stone-50 border-2 border-stone-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-xl font-bold tracking-wider text-stone-900 outline-none transition-all placeholder:text-stone-400 placeholder:font-normal"
                />
              </div>
              <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                {t('auth.phoneNotice')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 disabled:opacity-60 text-white font-bold rounded-2xl text-base shadow-md flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('auth.checkingPhone')}</span>
                </>
              ) : (
                <>
                  <span>{t('common.continue')}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: One-time Registration */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800">
                {t('auth.newFarmerTitle')}
              </span>
              <span className="text-xs text-stone-500 font-mono">+91 {phoneNumber}</span>
            </div>

            {/* Farmer Name */}
            <div>
              <label className="block text-stone-700 font-bold text-xs uppercase mb-1">
                {t('auth.nameLabel')} *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder={t('auth.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-base font-semibold text-stone-900 outline-none transition-all"
                />
              </div>
            </div>

            {/* Village & District */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-stone-700 font-bold text-xs uppercase mb-1">
                  {t('auth.villageLabel')} *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder={t('auth.villagePlaceholder')}
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold text-xs uppercase mb-1">
                  {t('auth.districtLabel')} *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder={t('auth.districtPlaceholder')}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* State dropdown */}
            <div>
              <label className="block text-stone-700 font-bold text-xs uppercase mb-1">
                {t('auth.stateLabel')} *
              </label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-3 bg-stone-50 border border-stone-300 focus:border-emerald-600 focus:bg-white rounded-2xl text-sm font-semibold text-stone-900 outline-none transition-all"
              >
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selection Suggested for this location */}
            <LanguageSelector
              languages={suggestedLanguages}
              selectedLanguage={selectedLanguage}
              onSelect={handleSelectLanguage}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 disabled:opacity-60 text-white font-bold rounded-2xl text-base shadow-md flex items-center justify-center gap-2 transition-all mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('auth.savingProfile')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.saveRegisterBtn')}</span>
                  <CheckCircle2 className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs font-semibold text-stone-500 hover:text-stone-800 py-1"
            >
              ← {t('auth.backToPhone')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
