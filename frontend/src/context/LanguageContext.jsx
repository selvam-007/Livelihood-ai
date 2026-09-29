import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import enLocale from '../i18n/locales/en.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', name: 'English', nativeName: 'English', native: 'English', bcp47: 'en-IN', region: 'Pan-India', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', name: 'Hindi', nativeName: 'हिन्दी', native: 'हिन्दी', bcp47: 'hi-IN', region: 'North / Central', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', name: 'Tamil', nativeName: 'தமிழ்', native: 'தமிழ்', bcp47: 'ta-IN', region: 'Tamil Nadu', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', name: 'Telugu', nativeName: 'తెలుగు', native: 'తెలుగు', bcp47: 'te-IN', region: 'AP & Telangana', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ', native: 'ಕನ್ನಡ', bcp47: 'kn-IN', region: 'Karnataka', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', name: 'Malayalam', nativeName: 'മലയാളം', native: 'മലയാളം', bcp47: 'ml-IN', region: 'Kerala', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', name: 'Marathi', nativeName: 'मराठी', native: 'मराठी', bcp47: 'mr-IN', region: 'Maharashtra', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', name: 'Bengali', nativeName: 'বাংলা', native: 'বাংলা', bcp47: 'bn-IN', region: 'West Bengal', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી', native: 'ગુજરાતી', bcp47: 'gu-IN', region: 'Gujarat', flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', native: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN', region: 'Punjab', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', native: 'ଓଡ଼ିଆ', bcp47: 'or-IN', region: 'Odisha', flag: '🇮🇳' },
];

export function getLanguageBcp47(langCode) {
  const match = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  return match ? match.bcp47 : 'en-IN';
}

const LOCALE_LOADERS = {
  en: () => Promise.resolve({ default: enLocale }),
  hi: () => import('../i18n/locales/hi.js'),
  ta: () => import('../i18n/locales/ta.js'),
  te: () => import('../i18n/locales/te.js'),
  kn: () => import('../i18n/locales/kn.js'),
  ml: () => import('../i18n/locales/ml.js'),
  mr: () => import('../i18n/locales/mr.js'),
  bn: () => import('../i18n/locales/bn.js'),
  gu: () => import('../i18n/locales/gu.js'),
  pa: () => import('../i18n/locales/pa.js'),
  or: () => import('../i18n/locales/or.js'),
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('livelihood_lang');
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved;
      }
    } catch {
      // Ignore localStorage failure in restricted contexts
    }
    return 'en';
  });

  // In-memory cache of loaded locale modules
  const [loadedLocales, setLoadedLocales] = useState(() => ({
    en: enLocale
  }));
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false);

  // Dynamic on-demand loader for the selected language
  const loadLanguage = useCallback(async (targetLang) => {
    if (loadedLocales[targetLang]) {
      return;
    }
    const loader = LOCALE_LOADERS[targetLang];
    if (!loader) return;

    setIsLoadingLanguage(true);
    try {
      const module = await loader();
      const localeData = module.default || module;
      setLoadedLocales(prev => ({
        ...prev,
        [targetLang]: localeData
      }));
    } catch (err) {
      console.warn(`Failed to dynamically load locale "${targetLang}", falling back to English:`, err);
    } finally {
      setIsLoadingLanguage(false);
    }
  }, [loadedLocales]);

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.some(l => l.code === newLang)) return;
    setLangState(newLang);
    try {
      localStorage.setItem('livelihood_lang', newLang);
    } catch (e) {
      console.warn(e);
    }
    loadLanguage(newLang);
  }, [loadLanguage]);

  // Load language when current lang changes or on mount if non-English
  useEffect(() => {
    if (lang && lang !== 'en' && !loadedLocales[lang]) {
      loadLanguage(lang);
    }
  }, [lang, loadLanguage, loadedLocales]);

  // Backward-compatible toggle cycles through supported languages
  const toggleLanguage = useCallback(() => {
    const idx = SUPPORTED_LANGUAGES.findIndex(l => l.code === lang);
    const nextIdx = (idx + 1) % SUPPORTED_LANGUAGES.length;
    setLang(SUPPORTED_LANGUAGES[nextIdx].code);
  }, [lang, setLang]);

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
  }, [lang]);

  // Build merged translations with English fallback
  const t = useMemo(() => {
    const activeLocale = loadedLocales[lang] || loadedLocales.en;
    const baseTranslations = loadedLocales.en.translations || {};
    const baseUi = loadedLocales.en.ui || {};

    const activeTranslations = activeLocale.translations || {};
    const activeUi = activeLocale.ui || {};

    const mergedTranslations = (lang === 'en') ? baseTranslations : {
      ...baseTranslations,
      ...activeTranslations,
      quickStats: { ...(baseTranslations.quickStats || {}), ...(activeTranslations.quickStats || {}) },
      nav: { ...(baseTranslations.nav || {}), ...(activeTranslations.nav || {}) },
      candidate: { ...(baseTranslations.candidate || {}), ...(activeTranslations.candidate || {}) },
      admin: {
        ...(baseTranslations.admin || {}),
        ...(activeTranslations.admin || {}),
        kpis: { ...(baseTranslations.admin?.kpis || {}), ...(activeTranslations.admin?.kpis || {}) }
      },
      voiceModal: { ...(baseTranslations.voiceModal || {}), ...(activeTranslations.voiceModal || {}) },
      common: { ...(baseTranslations.common || {}), ...(activeTranslations.common || {}) },
    };

    const mergedUi = (lang === 'en') ? baseUi : {
      ...baseUi,
      ...activeUi,
      sidebar: { ...(baseUi.sidebar || {}), ...(activeUi.sidebar || {}) },
      mobileNav: { ...(baseUi.mobileNav || {}), ...(activeUi.mobileNav || {}) },
      topNavbar: { ...(baseUi.topNavbar || {}), ...(activeUi.topNavbar || {}) },
      home: { ...(baseUi.home || {}), ...(activeUi.home || {}) },
      voice: { ...(baseUi.voice || {}), ...(activeUi.voice || {}) },
      profile: { ...(baseUi.profile || {}), ...(activeUi.profile || {}) },
      recommendations: { ...(baseUi.recommendations || {}), ...(activeUi.recommendations || {}) },
      nsqf: { ...(baseUi.nsqf || {}), ...(activeUi.nsqf || {}) },
      progress: { ...(baseUi.progress || {}), ...(activeUi.progress || {}) },
      settings: { ...(baseUi.settings || {}), ...(activeUi.settings || {}) },
    };

    return {
      ...mergedTranslations,
      ui: mergedUi,
      sidebar: mergedUi.sidebar || {},
      mobileNav: mergedUi.mobileNav || {},
      topNavbar: mergedUi.topNavbar || {},
      home: mergedUi.home || {},
      voice: mergedUi.voice || {},
      profile: mergedUi.profile || {},
      recommendations: mergedUi.recommendations || {},
      nsqf: mergedUi.nsqf || {},
      progress: mergedUi.progress || {},
      settings: mergedUi.settings || {},
    };
  }, [lang, loadedLocales]);

  const ui = useMemo(() => t.ui, [t]);

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      toggleLanguage,
      t,
      ui,
      currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
      getLanguageBcp47,
      isLoadingLanguage,
    }}>
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
