import React from 'react';
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  Award, 
  Briefcase, 
  GraduationCap, 
  TrendingUp, 
  CheckCircle2, 
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TravelerHeroIllustration } from '../common/HeroIllustrations';
import PathwayAudioPlayer from '../common/PathwayAudioPlayer';

export default function HomeView({ onNavigate, onOpenVoiceModal }) {
  const { currentUser, activeProfile } = useAuth();
  const { t, lang } = useLanguage();
  const h = t.home || {};

  const candidateName = currentUser?.full_name || (currentUser?.email ? currentUser.email.split('@')[0] : (lang === 'ta' ? 'நண்பரே' : 'Learner'));

  const quickActionCards = [
    {
      id: 'nsqf',
      title: h.quickNsqfTitle || 'Explore NSQF Levels',
      subtitle: h.quickNsqfSub || 'Learn about skill levels and qualifications',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs',
      badgeColor: 'text-emerald-600',
      icon: Layers,
      onClick: () => onNavigate('nsqf'),
    },
    {
      id: 'courses',
      title: h.quickCoursesTitle || 'Recommended Courses',
      subtitle: h.quickCoursesSub || 'Find the best government-subsidized courses',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs',
      badgeColor: 'text-blue-600',
      icon: GraduationCap,
      onClick: () => onNavigate('courses'),
    },
    {
      id: 'jobs',
      title: h.quickJobsTitle || 'Job Opportunities',
      subtitle: h.quickJobsSub || 'Discover matching wage & self-employment roles',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/80 shadow-xs',
      badgeColor: 'text-amber-600',
      icon: Briefcase,
      onClick: () => onNavigate('recommendations', 'jobs'),
    },
    {
      id: 'progress',
      title: h.quickProgressTitle || 'Track Skill Growth',
      subtitle: h.quickProgressSub || 'See your certifications and milestones',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/80 shadow-xs',
      badgeColor: 'text-purple-600',
      icon: TrendingUp,
      onClick: () => onNavigate('progress'),
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{h.greeting || 'Hello,'}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600">{candidateName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {h.greetingSub || "Let's build your livelihood roadmap with NSQF-aligned skills and opportunities."}
          </p>
        </div>

        {/* Right side verified status badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>NSQF Livelihood Grid</span>
          </span>
        </div>
      </div>

      {/* Hero Banner: Your Skills + AI = A Brighter Future */}
      <div className="relative rounded-3xl bg-gradient-to-br from-sky-100/90 via-teal-50 to-blue-100/90 border border-sky-200/80 p-6 sm:p-8 overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{h.heroBadge || 'AI-Powered NSQF Pathway Engine'}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {h.heroTitlePrefix || 'Your Skills + AI'} <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600">
              {h.heroTitleSuffix || '= A Certified Future'}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {h.heroDesc || 'Discover your true competency profile. Get personalized NSQF bridge courses. Unlock government subsidies and speak naturally in 11 Indian languages.'}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('voice')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all shadow-blue-500/25 transform active:scale-95 group"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <span>{h.startWithVoice || 'Start Voice Assessment'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right side Scenic Illustration (Traveler with backpack, hills & path) */}
        <div className="absolute -right-6 -bottom-6 w-72 sm:w-96 md:w-[420px] h-full pointer-events-none opacity-80 sm:opacity-100">
          <TravelerHeroIllustration className="w-full h-full" />
        </div>
      </div>

      {/* 4 Action / Quick Link Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActionCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={card.onClick}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 card-shadow card-hover text-left flex flex-col justify-between group transition-all"
            >
              <div className="space-y-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition">
                <span>{h.explore || 'Explore'}</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active NSQF Pathway & Top Recommendation Spotlight */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 card-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
                {activeProfile?.targetPathway?.nsqfLevel || 'NSQF National Grid'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {activeProfile?.targetPathway?.qpCode ? `QP: ${activeProfile.targetPathway.qpCode}` : 'Govt. of India Certified'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5">
              {activeProfile?.targetPathway?.title || 'Solar PV Project Helper & Installer (Suryamitra)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeProfile?.targetPathway?.council || 'Skill Council for Green Jobs (SCGJ)'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">{h.estimatedEarning || 'Estimated Earning'}</div>
              <div className="text-sm font-bold text-emerald-600 font-mono">
                {activeProfile?.targetPathway?.potentialIncome || '₹18,000 - ₹28,000 / mo'}
              </div>
            </div>
            {activeProfile?.targetPathway?.matchScore ? (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 flex flex-col items-center justify-center shadow-2xs">
                <span className="text-sm font-black text-blue-700">{activeProfile.targetPathway.matchScore}%</span>
                <span className="text-[9px] font-bold text-blue-500 uppercase">{h.fit || 'Fit'}</span>
              </div>
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col items-center justify-center shadow-2xs">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span className="text-[8px] font-bold text-emerald-600 uppercase mt-0.5">Featured</span>
              </div>
            )}
          </div>
        </div>

        {/* Immediate Action Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              {activeProfile?.targetPathway ? (h.spotlightBadge || 'Recommended Pathway Action:') : 'National NSQF Spotlight:'}
            </span>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              {activeProfile?.targetPathway?.nextAction || 'Explore accredited courses or take Voice Assessment to discover your personalized pathway'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeProfile?.targetPathway && (
              <PathwayAudioPlayer
                pathway={activeProfile.targetPathway}
                buttonSize="large"
              />
            )}
            <button
              onClick={() => onNavigate('courses')}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xs transition"
            >
              <span>{h.viewAllCourses || 'Explore NSQF Pathways'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
