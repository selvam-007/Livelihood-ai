import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Languages, 
  Users, 
  Shield, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';
import SihDemoGuideModal from './SihDemoGuideModal';

export default function Header({ backendHealth, loadingHealth, onTriggerVoiceModal }) {
  const { lang, setLang, supportedLanguages, currentLanguage, t } = useLanguage();
  const { 
    currentUser, 
    currentRole, 
    toggleRole, 
    activeProfileKey, 
    setActiveProfileKey, 
    logout 
  } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        {/* Top National DPI Banner */}
        <div className="bg-slate-950/90 border-b border-slate-800/80 text-[11px] py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-saffron-500 animate-pulse"></span>
              <span className="font-semibold text-amber-400 tracking-wide">
                SMART INDIA HACKATHON 2024
              </span>
              <span className="text-slate-600">|</span>
              <span className="hidden sm:inline text-slate-300">
                {t.initiative}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 hidden md:inline">NSQF / MSDE Grid Aligned</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800 font-mono">
                SIH-READY
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-white/20">
              <Compass className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Livelihood<span className="text-brand-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Voice-First
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Action Controls & Role Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Persona Switcher (For testing Candidate Backgrounds) */}
            {currentRole === 'candidate' && (
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-slate-400 hidden sm:inline">Profile:</span>
                <select
                  value={activeProfileKey}
                  onChange={(e) => setActiveProfileKey(e.target.value)}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
                  title="Select sample profile"
                >
                  <option value="tailor" className="bg-slate-900 text-slate-200">
                    Lakshmi (Tailoring & Home Business)
                  </option>
                  <option value="electrician" className="bg-slate-900 text-slate-200">
                    Karthik (Electrician Helper)
                  </option>
                  <option value="it" className="bg-slate-900 text-slate-200">
                    Meena (IT & Data Operations)
                  </option>
                </select>
              </div>
            )}

            {/* Role Toggle Button */}
            <button
              onClick={toggleRole}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                currentRole === 'admin'
                  ? 'bg-purple-950/80 text-purple-200 border-purple-600/60 shadow-lg shadow-purple-900/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Toggle between Candidate view and Admin Analytics"
            >
              {currentRole === 'admin' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.adminRole}</span>
                </>
              ) : (
                <>
                  <Users className="w-3.5 h-3.5 text-brand-400" />
                  <span>{t.candidateRole}</span>
                </>
              )}
              <span className="text-[10px] text-slate-400 border-l border-slate-600 pl-1.5 ml-0.5">
                {currentRole === 'candidate' ? 'Admin ➔' : 'Candidate ➔'}
              </span>
            </button>

            {/* SIH Demo Guide Button */}
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition"
              title="Open SIH 2024 Demonstration Step-by-Step Flow"
            >
              <span className="text-amber-400">⚡</span>
              <span className="hidden sm:inline">SIH Demo Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>

            {/* Multi-Lingual Indian Language Selector Dropdown */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition shadow-sm"
                title="Select Indian Language (11 Languages)"
              >
                <Languages className="w-3.5 h-3.5 text-brand-400" />
                <span className="font-semibold text-brand-300">{currentLanguage.nativeName}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">({currentLanguage.label})</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Select Indian Language</span>
                    <span className="text-brand-400 font-mono">11 Locales</span>
                  </div>
                  <div className="py-1">
                    {supportedLanguages.map((l) => {
                      const isSelected = l.code === lang;
                      return (
                        <button
                          key={l.code}
                          onClick={() => {
                            setLang(l.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                            isSelected 
                              ? 'bg-brand-500/15 text-brand-300 font-bold' 
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{l.nativeName}</span>
                            <span className="text-[11px] text-slate-400">({l.label})</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-500 font-mono">{l.bcp47}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Button / User Profile Pill */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/90 pl-2.5 pr-1.5 py-1 rounded-lg border border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-200 font-medium max-w-[100px] truncate" title={currentUser.full_name}>
                  {currentUser.full_name}
                </span>
                <button
                  onClick={logout}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-950" />
                <span>{t.common?.signIn || 'Sign In'}</span>
              </button>
            )}

            {/* Backend Status Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
              {loadingHealth ? (
                <Activity className="w-3 h-3 text-amber-400 animate-spin" />
              ) : backendHealth?.data?.database_connected ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-rose-400" />
              )}
              <span className="text-slate-400">API:</span>
              <span className={backendHealth?.data?.database_connected ? 'text-emerald-400 font-mono' : 'text-rose-400 font-mono'}>
                {backendHealth?.data?.database_connected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* SIH Demo Guide Modal */}
      <SihDemoGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onTriggerVoiceModal={onTriggerVoiceModal}
      />
    </>
  );
}
