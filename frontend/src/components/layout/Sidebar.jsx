import React from 'react';
import { 
  Home, 
  Mic, 
  User, 
  Sparkles, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Settings,
  BarChart3,
  X,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Sidebar({ 
  activeTab, 
  onSelectTab, 
  onRequireAdminAuth,
  isMobileOpen, 
  onCloseMobile 
}) {
  const { currentUser, activeProfile, currentRole } = useAuth();
  const { t, lang } = useLanguage();
  const s = t.sidebar || {};

  const isAdminUser = currentUser?.role === 'admin';

  const candidateNavItems = [
    { id: 'home', label: s.home || 'Home', icon: Home },
    { id: 'voice', label: s.voice || 'Voice Assessment', icon: Mic, badge: 'Voice AI' },
    { id: 'profile', label: s.profile || 'My Profile', icon: User },
    { id: 'recommendations', label: s.recommendations || 'Recommendations', icon: Sparkles },
    { id: 'courses', label: s.courses || 'Training & Courses', icon: BookOpen },
    { id: 'nsqf', label: s.nsqf || 'NSQF Framework', icon: Award },
    { id: 'progress', label: s.progress || 'Skill Growth', icon: TrendingUp },
    { id: 'settings', label: s.settings || 'Settings', icon: Settings },
  ];

  const candidateName = currentUser?.full_name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Guest Candidate');
  const candidateEmail = currentUser?.email || currentUser?.phone || 'Sign In to save skills';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090d1a] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top Header / Brand Logo */}
        <div className="p-5 flex items-center justify-between border-b border-slate-800/70 bg-gradient-to-b from-slate-900/60 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>NSQF India Engine</span>
              </div>
            </div>
          </div>

          {/* Close mobile button */}
          <button 
            onClick={onCloseMobile}
            aria-label="Close navigation sidebar"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scroll">
          <div className="px-3 pb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {currentRole === 'admin' ? (s.adminSuite || 'Admin Portal') : (s.candidatePortal || 'Candidate Portal')}
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/50">
              {currentRole === 'admin' ? 'Admin Mode' : 'Learner Mode'}
            </span>
          </div>

          {candidateNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRole === 'candidate' && activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 ring-1 ring-blue-400/50' 
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />
                )}
              </button>
            );
          })}

          {/* Dedicated Protected Administrative Section - ONLY visible to verified Admin users */}
          {isAdminUser && (
            <div className="pt-4 mt-4 border-t border-slate-800/70 space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin & Evaluation</span>
              </div>

              <button
                onClick={() => {
                  onSelectTab('admin');
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left group border
                  ${currentRole === 'admin'
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold shadow-lg shadow-purple-600/30 ring-1 ring-purple-400/50 border-purple-500/50'
                    : 'bg-purple-950/20 text-purple-300 border-purple-900/40 hover:bg-purple-900/30 hover:text-white'
                  }
                `}
                title="Open Admin State Dashboard"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    currentRole === 'admin' ? 'bg-white/20 text-white' : 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20'
                  }`}>
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <span>{s.admin || 'Admin Intelligence'}</span>
                </div>

                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/80 text-purple-200 border border-purple-700">
                  Active
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* User Status / Account Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/70 m-2 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md ring-1 ring-white/20">
                {currentUser ? candidateName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-white" />}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#090d1a] ${
                isAdminUser ? 'bg-purple-500' : 'bg-emerald-500'
              }`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                <span>{candidateName}</span>
                {isAdminUser && (
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-purple-900 text-purple-200 rounded">Admin</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {candidateEmail}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
