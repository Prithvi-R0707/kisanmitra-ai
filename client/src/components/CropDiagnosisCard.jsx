import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  Volume2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { analyzeCropPhoto } from '../api';
import { resizeImageToMax800 } from '../utils/imageUtils';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

const SPEECH_LANG_MAP = {
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
  en: 'en-IN',
};

export default function CropDiagnosisCard({ farmer, crop = 'Paddy', onDiagnosisSaved }) {
  const { t } = useTranslation();
  const { currentLanguage, languageConfig } = useLanguage();

  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const langCode = (currentLanguage || 'en').toLowerCase().slice(0, 2);
  const speechLang = languageConfig?.speechCode || SPEECH_LANG_MAP[langCode] || 'en-IN';

  const speakResult = (textToSpeak) => {
    if (!('speechSynthesis' in window) || !textToSpeak) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = speechLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsSpeaking(false);
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setDiagnosis(null);
    try {
      const resizedBase64 = await resizeImageToMax800(file);
      setImagePreview(resizedBase64);
      runDiagnosis(resizedBase64);
    } catch (err) {
      setErrorMsg(t('diagnosis.uploadFailed'));
    } finally {
      // Clear file input so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const runDiagnosis = async (base64Data) => {
    if (!base64Data || analyzing) return;
    setAnalyzing(true);
    setErrorMsg('');

    try {
      const phone = farmer?.phoneNumber || '9876543210';
      const lang = currentLanguage || farmer?.selectedLanguage?.code || 'en';
      const res = await analyzeCropPhoto(phone, base64Data, crop, lang, 'image/jpeg');

      if (res.diagnosis) {
        setDiagnosis(res.diagnosis);
        // Automatically speak aloud in farmer's language
        const toSpeak = `${res.diagnosis.problem}. ${res.diagnosis.advice}`;
        speakResult(toSpeak);

        if (onDiagnosisSaved) {
          onDiagnosisSaved(res.savedRecord);
        }
      } else {
        setErrorMsg(t('diagnosis.uploadFailed'));
      }
    } catch (err) {
      console.warn('Diagnosis analysis failed:', err);
      setErrorMsg(t('diagnosis.uploadFailed'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setImagePreview(null);
    setDiagnosis(null);
    setErrorMsg('');
    setIsSpeaking(false);
  };

  const getSeverityBadge = (severity) => {
    const s = (severity || 'low').toLowerCase();
    if (s === 'high') {
      return {
        bg: 'bg-red-100 text-red-800 border-red-300',
        label: t('diagnosis.severityHigh'),
        icon: AlertCircle,
        dot: 'bg-red-500',
      };
    }
    if (s === 'medium') {
      return {
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        label: t('diagnosis.severityMedium'),
        icon: AlertTriangle,
        dot: 'bg-amber-500',
      };
    }
    return {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      label: t('diagnosis.severityLow'),
      icon: CheckCircle2,
      dot: 'bg-emerald-500',
    };
  };

  const severityBadge = diagnosis ? getSeverityBadge(diagnosis.severity) : null;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl shadow-xs">
            🔬
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-base leading-tight">
              {t('diagnosis.cardTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('diagnosis.cardSubtitle')}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full">
          AI Vision
        </span>
      </div>

      {/* Hidden File Inputs (Camera & Gallery) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelected}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Upload Buttons when no image selected */}
      {!imagePreview && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 active:scale-95 border-2 border-dashed border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span>{t('diagnosis.takePhoto')}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-stone-50 hover:bg-stone-100 active:scale-95 border-2 border-dashed border-stone-300 rounded-2xl text-stone-800 font-bold text-xs transition-all shadow-xs"
          >
            <div className="w-10 h-10 rounded-full bg-stone-700 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <span>{t('diagnosis.uploadGallery')}</span>
          </button>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analyzing Loader */}
      {analyzing && (
        <div className="p-6 bg-teal-50/60 border border-teal-200 rounded-2xl text-center space-y-3 animate-pulse">
          {imagePreview && (
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-teal-300 shadow-xs">
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <Loader2 className="w-8 h-8 text-teal-700 animate-spin mx-auto" />
          <div>
            <h4 className="font-bold text-sm text-teal-950">
              {t('diagnosis.analyzing')}
            </h4>
            <p className="text-xs text-teal-700 mt-0.5">
              {t('diagnosis.analyzingSubtitle')}
            </p>
          </div>
        </div>
      )}

      {/* Diagnosis Results Card */}
      {diagnosis && !analyzing && (
        <div className="space-y-3.5 pt-1">
          {/* Photo Preview & Problem Badge */}
          <div className="flex gap-3 items-start bg-stone-50 p-3 rounded-2xl border border-stone-200">
            {imagePreview && (
              <img
                src={imagePreview}
                alt=""
                className="w-20 h-20 rounded-xl object-cover border border-stone-300 shrink-0 shadow-xs"
              />
            )}
            <div className="flex-1 space-y-1.5 min-w-0">
              {severityBadge && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${severityBadge.bg}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${severityBadge.dot}`}></span>
                    <span>{severityBadge.label}</span>
                  </span>

                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{t('diagnosis.savedToHistory')}</span>
                  </span>
                </div>
              )}

              <h4 className="font-black text-stone-900 text-sm leading-snug break-words">
                {diagnosis.problem}
              </h4>
            </div>
          </div>

          {/* Practical Advice Section */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('diagnosis.adviceTitle')}</span>
              </span>

              {/* Speak Aloud Button */}
              <button
                type="button"
                onClick={() => speakResult(`${diagnosis.problem}. ${diagnosis.advice}`)}
                title={t('diagnosis.speakAdvice')}
                className={`p-1.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1 text-xs font-semibold ${
                  isSpeaking
                    ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                    : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t('diagnosis.speakAdvice')}</span>
              </button>
            </div>

            <p className="text-xs text-stone-800 leading-relaxed font-medium">
              {diagnosis.advice}
            </p>
          </div>

          {/* Expert Alert if see_expert is true */}
          {diagnosis.see_expert && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2 text-amber-900 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <p className="font-semibold leading-relaxed">
                {t('diagnosis.seeExpertAlert')}
              </p>
            </div>
          )}

          {/* Note: "This is guidance, not a final diagnosis." */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
            <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="italic">{t('diagnosis.disclaimerNotice')}</span>
          </div>

          {/* Action to check another plant */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('diagnosis.checkAnother')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
