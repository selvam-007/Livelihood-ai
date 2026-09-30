import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Globe, 
  ChevronDown, 
  Check, 
  LogIn, 
  LogOut, 
  ShieldCheck,
  Sparkles,
  UserPlus,
  Lock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function TopNavbar({ 
  onOpenMobileSidebar, 
  onOpenAuthModal, 
  onOpenSplashScreen,
  searchQuery, 
  setSearchQuery,
  onTriggerSearch 
}) {
  const { lang, setLang, supportedLanguages, currentLanguage, t } = useLanguage();
  const n = t.topNavbar || {};
  const { currentUser, currentRole, toggleRole, logout, activeProfile } = useAuth();
  
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  const langRef = useRef(null);
  const userMenuRef = useRef(null);

  const isAdminUser = currentUser?.role === 'admin';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setIsLangOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const candidateName = currentUser?.full_name || activeProfile?.name || 'Selvam C.';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 py-2.5 transition-all shadow-xs">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & Search input */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar with subtle gradient border */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onTriggerSearch) onTriggerSearch();
              }}
              placeholder={n.searchPlaceholder || "Search NSQF courses, job roles, skills..."}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Online / Offline Network Status Indicator */}
          {isOnline ? (
            <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{n.online || "Live Grid"}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>{n.offline || "Offline"}</span>
            </span>
          )}

          {/* NSQF Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-semibold text-blue-800 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>NSQF Aligned</span>
          </div>

          {/* Language Selector Dropdown - Clean and Reliable Popover */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-xs hover:border-slate-300 group"
              title="Select Language (11 Indian Languages)"
            >
              <div className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-baseline gap-1 text-left">
                <span className="font-bold text-slate-800 text-xs">
                  {currentLanguage.nativeName || currentLanguage.native || 'English'}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  ({currentLanguage.label || currentLanguage.name || 'EN'})
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-300 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/10">
                <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center justify-between rounded-t-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Select Language / மொழி தேர்வு</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    11 Indic Models
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto py-1.5 space-y-1 mt-1 pr-1 custom-scroll bg-white">
                  {supportedLanguages.map((l) => {
                    const isSelected = lang === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLang(l.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md'
                            : 'text-slate-800 bg-white hover:bg-slate-100 hover:text-slate-950 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm select-none">{l.flag || '🇮🇳'}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {l.nativeName || l.native}
                              </span>
                              <span className={`text-[11px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                ({l.label || l.name})
                              </span>
                            </div>
                            <span className={`text-[10px] block ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                              {l.region}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Role Access / Admin Button (Credential-Guarded — Only visible for verified Admin users) */}
          {isAdminUser && (
            <button
              onClick={toggleRole}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                currentRole === 'admin'
                  ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-purple-500/20 hover:from-purple-600 hover:to-indigo-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Toggle between Candidate & Admin View"
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentRole === 'admin' ? 'text-amber-300' : 'text-purple-600'}`} />
              <span className="hidden sm:inline">
                {currentRole === 'admin' ? 'Switch to Candidate' : 'Admin Portal ➔'}
              </span>
              <span className="sm:hidden">
                {currentRole === 'admin' ? 'Candidate' : 'Admin'}
              </span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            onClick={() => setHasUnreadNotifs(false)}
            className="relative p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadNotifs && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* User Profile Avatar / Auth Trigger */}
          <div className="relative" ref={userMenuRef}>
            {currentUser ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User account menu"
                className={`w-9 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center shadow-sm transition ring-2 ${
                  isAdminUser
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 ring-purple-500/30'
                    : 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-blue-500/30'
                }`}
              >
                {candidateName.charAt(0).toUpperCase()}
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  title="Log In to your account"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>{n.login || "Log In"}</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-blue-500/20 transition"
                  title="Create a new account"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}

            {isUserMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                    <span>{candidateName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      isAdminUser ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {currentUser.role || 'Candidate'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email || currentUser.phone}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{n.logout || "Sign Out"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
