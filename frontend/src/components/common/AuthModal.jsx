import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  User, 
  AlertCircle, 
  Sparkles,
  Lock,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const AUTH_TEXTS = {
  signInTitle: { en: 'Sign In to LivelihoodAI', hi: 'आजीविकाAI में साइन इन करें', ta: 'உள்நுழைக', te: 'సైన్ ఇన్ చేయండి', kn: 'ಸೈನ್ ಇನ್ ಮಾಡಿ', ml: 'സൈൻ ഇൻ ചെയ്യുക', mr: 'साइन इन करा', bn: 'সাইন ইন করুন', gu: 'સાઇન ઇન કરો', pa: 'ਸਾਈਨ ਇਨ ਕਰੋ', or: 'ସାଇନ୍ ଇନ୍ କରନ୍ତୁ' },
  createAccount: { en: 'Create Candidate Account', hi: 'नया उम्मीदवार खाता बनाएं', ta: 'புதிய கணக்கு உருவாக்கு', te: 'కొత్త ఖాతా తెరవండి', kn: 'ಹೊಸ ಖಾತೆ ರಚಿಸಿ', ml: 'പുതിയ അക്കൗണ്ട് തുടങ്ങുക', mr: 'नवीन खाते उघडा', bn: 'নতুন অ্যাকাউন্ট তৈরি করুন', gu: 'નવું એકાઉન્ટ બનાવો', pa: 'ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ', or: 'ନୂତନ ଖାତା ଖୋଲନ୍ତୁ' },
  subTitle: { en: 'Access your personalized skilling roadmap', hi: 'अपने व्यक्तिगत कौशल रोडमैप तक पहुँचें', ta: 'உங்கள் தனிப்பயனாக்கப்பட்ட தொழில் பாதையை அணுகவும்', te: 'మీ కెరీర్ రోడ్‌మ్యాప్‌ను పొందండి', kn: 'ನಿಮ್ಮ ಕೌಶಲ್ಯ ಮಾರ್ಗಸೂಚಿಯನ್ನು ಪಡೆಯಿರಿ', ml: 'വ്യക്തിഗത കരിയർ റോഡ്‌മാപ്പ് കാണുക', mr: 'आपला करिअर रोडमॅप मिळवा', bn: 'আপনার ক্যারিয়ার রোডম্যাপ দেখুন', gu: 'તમારો કારકિર્દી રોડમેપ જુઓ', pa: 'ਆਪਣਾ ਕਰੀਅਰ ਰੋਡਮੈਪ ਵੇਖੋ', or: 'ଆପଣଙ୍କ କ୍ୟାରିଅର୍ ରୋଡମ୍ୟାପ୍ ଦେଖନ୍ତୁ' },
  fullName: { en: 'Full Name', hi: 'पूरा नाम', ta: 'முழு பெயர்', te: 'పూర్తి పేరు', kn: 'ಪೂರ್ಣ ಹೆಸರು', ml: 'പൂർണ്ണ നാമം', mr: 'पूर्ण नाव', bn: 'সম্পূর্ণ নাম', gu: 'પૂરું નામ', pa: 'ਪੂਰਾ ਨਾਮ', or: 'ପୂରା ନାମ' },
  phone: { en: 'Phone Number', hi: 'फ़ोन नंबर', ta: 'கைபேசி எண்', te: 'ఫోన్ నంబర్', kn: 'ದೂರವಾಣಿ ಸಂಖ್ಯೆ', ml: 'ഫോൺ നമ്പർ', mr: 'फोन नंबर', bn: 'ফোন নম্বর', gu: 'ફોન નંબર', pa: 'ਫ਼ੋਨ ਨੰਬਰ', or: 'ଫୋନ୍ ନମ୍ବର' },
  location: { en: 'Location / District', hi: 'स्थान / ज़िला', ta: 'மாவட்டம்', te: 'ప్రాంతం / జిల్లా', kn: 'ಸ್ಥಳ / ಜಿಲ್ಲೆ', ml: 'ജില്ല / സ്ഥലം', mr: 'जिल्हा / ठिकाण', bn: 'জেলা / স্থান', gu: 'જિલ્લો / સ્થળ', pa: 'ਜ਼ਿਲ੍ਹਾ / ਸਥਾਨ', or: 'ଜିଲ୍ଲା / ସ୍ଥାନ' },
  email: { en: 'Email Address', hi: 'ईमेल पता', ta: 'மின்னஞ்சல் முகவரி', te: 'ఈమెయిల్ చిరునామా', kn: 'ಇಮೇಲ್ ವಿಳಾಸ', ml: 'ഇമെയിൽ വിലാസം', mr: 'ईमेल पत्ता', bn: 'ইমেল ঠিকানা', gu: 'ઈમેલ સરનામું', pa: 'ਈਮੇਲ ਪਤਾ', or: 'ଇମେଲ୍ ଠିକଣା' },
  password: { en: 'Password', hi: 'पासवर्ड', ta: 'கடவுச்சொல்', te: 'పాస్‌వర్డ్', kn: 'ಪಾಸ್‌ವರ್ಡ್', ml: 'പാസ്‌വേഡ്', mr: 'पासवर्ड', bn: 'পাসওয়ার্ড', gu: 'પાસવર્ડ', pa: 'ਪਾਸਵਰਡ', or: 'ପାସୱାର୍ଡ' },
  authenticating: { en: 'Authenticating...', hi: 'सत्यापित कर रहा है...', ta: 'சரிபார்க்கிறது...', te: 'ధృవీకరిస్తోంది...', kn: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...', ml: 'പരിശോധിക്കുന്നു...', mr: 'पडताळणी चालू आहे...', bn: 'যাচাই করা হচ্ছে...', gu: 'ચકાસી રહ્યું છે...', pa: 'ਜਾਂਚ ਹੋ ਰਹੀ ਹੈ...', or: 'ଯାଞ୍ଚ ଚାଲିଛି...' },
  demoTitle: { en: '1-Click Demo Evaluation', hi: '1-क्लिक डेमो मूल्यांकन', ta: 'மாதிரி கணக்கில் நுழைக', te: '1-క్లిక్ డెమో లాగిన్', kn: '1-ಕ್ಲಿಕ್ ಡೆಮೊ ಲಾಗಿನ್', ml: '1-ക്ലിക്ക് ഡെമോ', mr: '१-क्लिक डेमो लॉगिन', bn: '১-ক্লিক ডেমো লগইন', gu: '1-ક્લિક ડેમો લૉગિન', pa: '1-ਕਲਿੱਕ ਡੈਮੋ', or: '୧-କ୍ଲିକ୍ ଡେମୋ ଲଗଇନ୍' }
};

function getAuthStr(key, lang) {
  const dict = AUTH_TEXTS[key];
  if (!dict) return '';
  return dict[lang] || dict.en || '';
}

export default function AuthModal({ isOpen, onClose }) {
  const { loginWithCredentials, registerWithCredentials } = useAuth();
  const { lang, t } = useLanguage();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('candidate');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithCredentials(email, password);
      } else {
        await registerWithCredentials({
          email,
          password,
          full_name: fullName,
          role,
          phone,
          location,
          preferred_language: lang
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setError(null);
    setLoading(true);
    try {
      await loginWithCredentials(demoEmail, demoPassword);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {mode === 'login' ? getAuthStr('signInTitle', lang) : getAuthStr('createAccount', lang)}
              </h3>
              <p className="text-xs text-slate-400">
                {getAuthStr('subTitle', lang)}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-xs text-slate-300 font-medium">
                  {getAuthStr('fullName', lang)} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Lakshmi Priya"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">
                    {getAuthStr('phone', lang)}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 font-medium">
                    {getAuthStr('location', lang)}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Madurai"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              {getAuthStr('email', lang)} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">
              {getAuthStr('password', lang)} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 disabled:opacity-50 transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                {getAuthStr('authenticating', lang)}
              </span>
            ) : mode === 'login' ? (
              t.common?.signIn || 'Sign In'
            ) : (
              t.common?.register || 'Register Account'
            )}
          </button>

          {/* Switch mode */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError(null);
              }}
              className="text-xs text-brand-400 hover:underline"
            >
              {mode === 'login'
                ? (lang === 'en' ? "Don't have an account? Register" : 'Create new candidate account')
                : (lang === 'en' ? 'Already have an account? Sign In' : 'Already registered? Sign In')}
            </button>
          </div>

          {/* 1-Click Demo Evaluation Credentials */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              ⚡ {getAuthStr('demoTitle', lang)}:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('candidate@livelihood.ai', 'Password123!')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-left border border-slate-700 transition flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-emerald-300">Candidate Demo</div>
                  <div className="text-[10px] text-slate-400">Lakshmi Priya</div>
                </div>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
