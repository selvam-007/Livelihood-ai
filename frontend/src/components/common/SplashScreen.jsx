import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  Award, 
  Compass, 
  Landmark, 
  ShieldCheck, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Globe, 
  CheckCircle2, 
  X,
  Volume2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SplashScreen({ onExplore, onOpenAuth }) {
  const { lang, t, supportedLanguages, setLang, currentLanguage } = useLanguage();
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features = [
    {
      icon: Mic,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      title: lang === 'ta' ? '11 இந்திய மொழிகளில் குரல் வழி மதிப்பீடு' : 'Multilingual Indic Voice AI',
      desc: lang === 'ta' 
        ? 'எழுதப்படிக்கத் தெரியாதவர்களுக்கும் உதவும் வகையில் தமிழ், இந்தி உள்ளிட்ட 11 மொழிகளில் பேசி உங்கள் திறன்களைப் பதிவு செய்யலாம்.' 
        : 'Speak naturally in 11 Indian languages (Tamil, Hindi, Telugu, Kannada, etc.). Our LLM extracts your genuine competencies without requiring a written resume.',
      badge: 'Zero Resume Barrier'
    },
    {
      icon: Award,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      title: lang === 'ta' ? 'அரசு NSQF தகுதித் தொகுப்பு' : 'Direct NSQF & NCVET Alignment',
      desc: lang === 'ta' 
        ? 'மத்திய அரசின் தேசிய திறன் தகுதி கட்டமைப்பின் (NSQF) படி உண்மையான வேலைப் பாத்திரங்களுடன் துல்லியமாக இணைக்கப்படுகிறது.' 
        : 'Strict, zero-hallucination mapping to 2,400+ official Qualification Packs (QP) and National Occupational Standards (NOS) from Level 1 to Level 6+.',
      badge: 'Verified Standards'
    },
    {
      icon: Compass,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      title: lang === 'ta' ? 'முந்தைய அனுபவ அங்கீகாரம் (RPL) & வரைபடம்' : 'RPL & Bridge Training Roadmaps',
      desc: lang === 'ta' 
        ? 'உங்கள் பல வருட முறைசாரா அனுபவத்தை அங்கீகரித்து அரசு சான்றிதழ் பெற தேவையான பாக்கி பயிற்சிகளை மட்டும் வழிகாட்டுகிறது.' 
        : 'Recognition of Prior Learning (RPL) converts informal workshop experience into formal credentials with targeted competency bridge courses.',
      badge: 'Fast-Track Cert'
    },
    {
      icon: Landmark,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      title: lang === 'ta' ? 'அரசு நிதி உதவி மற்றும் பயிற்சி மையங்கள்' : 'Govt Schemes, Subsidies & Centres',
      desc: lang === 'ta' 
        ? 'PMKVY, PM விஸ்வகர்மா போன்ற திட்டங்கள் மற்றும் உங்கள் பகுதியிலுள்ள அருகாமை பயிற்சி மையங்களின் நேரடி இணைப்பு.' 
        : 'Matches eligible welfare schemes (PMKVY, PM Vishwakarma, NAPS stipends) and pinpoints accredited training centres within your radius.',
      badge: '100% Subsidized'
    }
  ];

  // Auto rotate feature highlights
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureIndex((prev) => (prev + 1) % features.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [features.length]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#070b16] text-white flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/15 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      {/* Top Header of Splash */}
      <header className="relative z-10 px-6 sm:px-12 py-5 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md bg-[#070b16]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              SkillPath <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">AI</span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-widest font-semibold uppercase block">
              National Skilling Grid
            </span>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Language Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 shadow-sm">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Select Platform Language"
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.nativeName || l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* Top Login / Register Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onOpenAuth('login')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800/80 border border-slate-700/80 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Direct Skip into website */}
          <button
            onClick={onExplore}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition"
            title="Enter Website"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Showcase Hero Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8 sm:py-12 my-auto flex flex-col items-center text-center space-y-8">
        {/* National Initiative Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold shadow-inner animate-in fade-in zoom-in-95">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Government of India • Ministry of Skill Development & Entrepreneurship (MSDE) Grid</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Empowering Every Indian’s Livelihood with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-400">
              Voice AI & NSQF Standards
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {lang === 'ta'
              ? 'உங்கள் தாய்மொழியில் பேசி திறன் மதிப்பீடு பெறுங்கள். முறைசாரா அனுபவத்தை அரசு NSQF சான்றிதழாக மாற்றவும், இலவச பயிற்சிகள் மற்றும் வேலைவாய்ப்புகளை உடனடியாக அறியவும்.'
              : 'Discover personalized career roadmaps, bridge competency gaps, and unlock government subsidies without typing a single word. Speak freely in your native dialect.'}
          </p>
        </div>

        {/* Action Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-2">
          <button
            onClick={onExplore}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-500/30 transform active:scale-95 transition group ring-2 ring-blue-400/30"
          >
            <span>Explore Platform</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/80 shadow-md transition"
          >
            <LogIn className="w-4 h-4 text-blue-400" />
            <span>Sign In / Register</span>
          </button>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left pt-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            const isHighlighted = idx === activeFeatureIndex;
            return (
              <div
                key={idx}
                onClick={() => setActiveFeatureIndex(idx)}
                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isHighlighted 
                    ? 'bg-slate-900/90 border-blue-500/60 shadow-xl shadow-blue-500/15 ring-1 ring-blue-400/40 transform -translate-y-1' 
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.bgColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-semibold text-blue-400">
                  <span>Learn More</span>
                  <span className="text-xs">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Details */}
      <footer className="relative z-10 px-6 sm:px-12 py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-[#070b16]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Server: NSQF Live Engine • 11 Vernacular Models Active</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <button onClick={() => onOpenAuth('login')} className="hover:text-white transition">
            Login
          </button>
          <span>•</span>
          <button onClick={() => onOpenAuth('register')} className="hover:text-white transition">
            Create Free Account
          </button>
          <span>•</span>
          <button onClick={onExplore} className="text-blue-400 font-semibold hover:underline">
            Continue as Guest ➔
          </button>
        </div>
      </footer>
    </div>
  );
}
