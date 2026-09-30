import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Globe,
  Sparkles,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { sendMessage, getChatHistory, undoRecord } from '../api';
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

export default function CallScreen({
  farmer,
  onClose,
  onQuickLogin,
  onOpenLanguage,
  suggestedLanguages = []
}) {
  const { t } = useTranslation();
  const { currentLanguage, languageConfig } = useLanguage();
  const [callDuration, setCallDuration] = useState(0);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const [dialInput, setDialInput] = useState(farmer?.phoneNumber || '');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const langCode = (currentLanguage || 'en').toLowerCase().slice(0, 2);
  const speechLang = languageConfig?.speechCode || SPEECH_LANG_MAP[langCode] || 'en-IN';

  // 1. Check Voice and Mic capability
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasMicSupport(false);
    }
    if (!('speechSynthesis' in window)) {
      setHasVoiceSupport(false);
    }
  }, []);

  // 2. Timer and Initial Welcome
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // Initial greeting in farmer's language
    const welcome = farmer
      ? t('call.welcomeFarmer', { name: farmer.name, defaultValue: `Hello ${farmer.name}! How may I help your farm today?` })
      : t('call.welcomeGeneral', { defaultValue: 'Hello! Welcome to KisanMitra Helpline.' });

    setMessages([
      {
        role: 'assistant',
        text: welcome,
      },
    ]);

    // Speak welcome if speaker is enabled
    speakReply(welcome, speechLang);

    // Load recent chat history if logged in
    if (farmer?.phoneNumber) {
      getChatHistory(farmer.phoneNumber).then((res) => {
        if (res.messages && res.messages.length > 0) {
          setMessages(res.messages);
        }
      }).catch(() => {});
    }

    return () => {
      clearInterval(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, [farmer?.phoneNumber]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isListening]);

  // Speak AI reply
  const speakReply = (text, lang) => {
    if (!('speechSynthesis' in window) || !speakerOn) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang || speechLang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
    }
  };

  // Mic recognition handler
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasMicSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = speechLang;
      recognition.interimResults = false;
      recognition.continuous = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    if (event.results[i].isFinal) {
      const transcript = event.results[i][0].transcript.trim();

      if (transcript) {
        handleSend(transcript);
      }
    }
  }
};

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start failed', err);
      setIsListening(false);
    }
  };

  // Send message
  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || isLoading) return;

    const userMessage = { role: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const phone = farmer?.phoneNumber || '9876543210';
      const lang = currentLanguage || farmer?.selectedLanguage?.code || 'en';
      const res = await sendMessage(phone, text.trim(), lang);
      const aiReply = res.reply;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: aiReply,
          savedRecord: res.savedRecord || null,
        },
      ]);

      speakReply(aiReply, speechLang);
    } catch (err) {
      const fallback = t('call.networkFallback', { defaultValue: 'Connection is slow. Please ask your question again.' });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: fallback },
      ]);
      speakReply(fallback, speechLang);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUndo = async (record, msgIndex) => {
    try {
      const phone = farmer?.phoneNumber || '9876543210';
      await undoRecord(phone, record.id, record.type);
      setMessages((prev) =>
        prev.map((m, idx) => (idx === msgIndex ? { ...m, savedRecord: null, undone: true } : m))
      );
    } catch (e) {
      console.warn('Undo error:', e);
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleDialNumber = (digit) => {
    if (dialInput.length < 10) setDialInput((prev) => prev + digit);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col justify-between backdrop-blur-md text-white select-none">
      {/* 1. In-Call Header */}
      <div className="bg-stone-900/90 border-b border-stone-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-emerald-700/80 border border-emerald-400/40 flex items-center justify-center text-xl">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-stone-100 leading-none">
                {farmer ? farmer.name : t('call.helplineTitle')}
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-emerald-400 font-mono mt-0.5">
              {formatTimer(callDuration)} • {languageConfig?.nativeName || farmer?.selectedLanguage?.nativeName || 'English'}
            </p>
          </div>
        </div>

        {/* Top Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Button */}
          <button
            onClick={onOpenLanguage}
            title={t('language.title')}
            className="flex items-center gap-1 bg-amber-600/80 hover:bg-amber-500 active:scale-95 text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{languageConfig?.nativeName || farmer?.selectedLanguage?.nativeName || t('language.title')}</span>
          </button>

          {/* Speaker Mute/Unmute */}
          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            title={speakerOn ? t('call.muteVoice') : t('call.unmuteVoice')}
            className={`p-2 rounded-xl border text-xs ${
              speakerOn
                ? 'bg-emerald-800/60 border-emerald-500/40 text-emerald-300'
                : 'bg-stone-800 border-stone-700 text-stone-500'
            }`}
          >
            {speakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            title={t('call.endCall')}
            className="bg-red-600 hover:bg-red-500 active:scale-90 text-white p-2 rounded-xl shadow-md transition-all"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Chat Conversation View inside Call */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 max-w-xl w-full mx-auto">
        {!farmer && (
          <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-4 text-center space-y-2 mb-2">
            <p className="text-sm font-semibold text-emerald-300">
              {t('call.enterNumberNotice')}:
            </p>
            <div className="flex items-center justify-center gap-1 font-mono text-xl font-bold text-white bg-stone-950 py-2 rounded-xl border border-stone-800">
              <span>+91</span>
              <span>{dialInput || '__________'}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 max-w-[200px] mx-auto py-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDialNumber(d.toString())}
                  className={`py-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-sm font-bold ${
                    d === 0 ? 'col-start-2' : ''
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {dialInput.length === 10 && (
              <button
                onClick={() => {
                  onQuickLogin(dialInput);
                  onClose();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                {t('call.connectBtn')}
              </button>
            )}
          </div>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-xs'
                  : 'bg-stone-800/95 text-stone-100 border border-stone-700/80 rounded-tl-xs'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mb-1">
                  <span>🌾 KisanMitra</span>
                  {speakerOn && (
                    <Volume2 className="w-3 h-3 text-stone-400 inline cursor-pointer" onClick={() => speakReply(m.text, speechLang)} />
                  )}
                </div>
              )}
              <p className="text-sm">{m.text}</p>
              {m.savedRecord && (
                <div className="mt-2 pt-2 border-t border-stone-700 flex items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    ✓ {t('call.savedNotice', { defaultValue: 'Entry saved' })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUndo(m.savedRecord, idx)}
                    className="text-amber-400 hover:text-amber-300 font-bold underline px-1 py-0.5 active:scale-95 transition-all"
                  >
                    {t('common.undo', { defaultValue: 'Undo' })}
                  </button>
                </div>
              )}
              {m.undone && (
                <div className="mt-2 pt-2 border-t border-stone-700 text-xs text-stone-400 italic">
                  {t('call.undoneNotice', { defaultValue: 'Entry removed' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Loading State */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-stone-800/90 border border-stone-700/60 rounded-2xl px-4 py-2.5 text-xs text-stone-300 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>{t('call.aiThinking')}</span>
            </div>
          </div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <div className="flex justify-center my-2">
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-300 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span>{t('call.listeningPrompt', { language: languageConfig?.nativeName || farmer?.selectedLanguage?.nativeName || 'your language' })}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input & Voice Controls Bottom Bar */}
      <div className="bg-stone-900 border-t border-stone-800 p-3 max-w-xl w-full mx-auto">
        {/* Notice if mic or voice is unsupported */}
        {(!hasMicSupport || !hasVoiceSupport) && (
          <p className="text-[11px] text-amber-300/80 text-center mb-2 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {t('call.voiceUnsupportedNotice')}
          </p>
        )}

        <div className="flex items-center gap-2">
          {/* Big Voice Mic Button */}
          {hasMicSupport && (
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? t('call.stopListening') : t('call.tapToSpeak')}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-lg ${
                isListening
                  ? 'bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          )}

          {/* Text input fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                hasMicSupport
                  ? t('call.inputOrTypePlaceholder')
                  : t('call.inputPlaceholder')
              }
              className="flex-1 bg-stone-950 border border-stone-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-12 h-12 rounded-2xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-stone-500 mt-2">
          {t('call.tapMicToTalk')}
        </p>
      </div>
    </div>
  );
}
