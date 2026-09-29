/**
 * Multilingual Text-to-Speech (TTS) Utility for Indian Vernacular Languages
 * Supports all 11 Indian languages with automatic BCP-47 mapping & voice discovery.
 */

const LANG_BCP47_MAP = {
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

let currentUtterance = null;

export function getBcp47(langCode) {
  return LANG_BCP47_MAP[langCode] || 'en-IN';
}

export function speakText(text, language = 'en', onEndCallback = null) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this environment.');
    if (onEndCallback) onEndCallback();
    return null;
  }

  // Cancel any active speech
  stopSpeaking();

  if (!text || !text.trim()) {
    if (onEndCallback) onEndCallback();
    return null;
  }

  const langCode = getBcp47(language);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.92; // Slightly paced for optimal rural/candidate comprehension
  utterance.pitch = 1.0;

  // Find native voice match
  const voices = window.speechSynthesis.getVoices();
  const directMatch = voices.find(v => 
    v.lang === langCode || 
    v.lang.replace('_', '-') === langCode ||
    v.lang.startsWith(langCode)
  );

  const fallbackLanguageMatch = !directMatch && voices.find(v => 
    v.lang.startsWith(language)
  );

  if (directMatch) {
    utterance.voice = directMatch;
  } else if (fallbackLanguageMatch) {
    utterance.voice = fallbackLanguageMatch;
  }

  const handleEnd = () => {
    currentUtterance = null;
    if (onEndCallback) onEndCallback();
  };

  utterance.onend = handleEnd;
  utterance.onerror = (err) => {
    console.warn('Speech synthesis error/cancelled:', err);
    handleEnd();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn(e);
    }
    currentUtterance = null;
  }
}

export function isSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
