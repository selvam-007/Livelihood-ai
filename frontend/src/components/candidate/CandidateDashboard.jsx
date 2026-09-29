import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Award, 
  TrendingUp, 
  Briefcase, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  ExternalLink,
  Target,
  Wrench,
  Clock,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';

const DASH_STRINGS = {
  voiceDerived: { en: 'Voice-Derived Active Profile', hi: 'आवाज़-आधारित सक्रिय प्रोफ़ाइल', ta: 'குரல் வழி சுயவிவரம்', te: 'వాయిస్ ఆధారిత ప్రొఫైల్', kn: 'ಧ್ವನಿ ಆಧಾರಿತ ಪ್ರೊಫೈಲ್', ml: 'വോയ്‌സ് അടിസ്ഥാന പ്രൊഫൈൽ', mr: 'व्हॉइस-आधारित सक्रिय प्रोफाइल', bn: 'ভয়েস-ভিত্তিক সক্রিয় প্রোফাইল', gu: 'વોઇસ-આધારિત સક્રિય પ્રોફાઇલ', pa: 'ਵਾਇਸ-ਅਧਾਰਿਤ ਸਰਗਰਮ ਪ੍ਰੋਫਾਈਲ', or: 'ଭଏସ୍-ଆଧାରିତ ସକ୍ରିୟ ପ୍ରୋଫାଇଲ୍' },
  tapToSpeak: { en: 'Tap to speak your answers', hi: 'बोलकर उत्तर देने के लिए टैप करें', ta: 'பேசி மதிப்பீடு செய்ய தட்டவும்', te: 'సమాధానాలు చెప్పడానికి తాకండి', kn: 'ಉತ್ತರಿಸಲು ಧ್ವನಿ ಬಳಸಿ', ml: 'സംസാരിച്ച് ഉത്തരം നൽകുക', mr: 'बोलून उत्तरे देण्यासाठी टॅप करा', bn: 'কথা বলে উত্তর দিতে ট্যাপ করুন', gu: 'બોલીને જવાબ આપવા ટેપ કરો', pa: 'ਬੋਲ ਕੇ ਜਵਾਬ ਦੇਣ ਲਈ ਟੈਪ ਕਰੋ', or: 'କହିକି ଉତ୍ତର ଦେବା ପାଇଁ ଟ୍ୟାପ୍ କରନ୍ତୁ' },
  voiceVerified: { en: 'Voice verified', hi: 'आवाज़ द्वारा सत्यापित', ta: 'குரல் மூலம் சரிபார்க்கப்பட்டது', te: 'వాయిస్ ద్వారా ధృవీకరించబడింది', kn: 'ಧ್ವನಿಯ ಮೂಲಕ ಪರಿಶೀಲಿಸಲಾಗಿದೆ', ml: 'വോയ്‌സ് വഴി സ്ഥിരീകരിച്ചു', mr: 'आवाजाद्वारे पडताळलेले', bn: 'কণ্ঠস্বর দ্বারা যাচাইকৃত', gu: 'અવાજ દ્વારા ચકાસાયેલ', pa: 'ਆਵਾਜ਼ ਰਾਹੀਂ ਪ੍ਰਮਾਣਿਤ', or: 'ଭଏସ୍ ଦ୍ୱାରା ଯାଞ୍ଚ ହୋଇଛି' },
  competencies: { en: 'competencies', hi: 'कौशल क्षमताएं', ta: 'திறன்கள்', te: 'నైపుణ్యాలు', kn: 'ಸಾಮರ್ಥ್ಯಗಳು', ml: 'ശേഷികൾ', mr: 'कौशल्ये', bn: 'দক্ষতাসমূহ', gu: 'ક્ષમતાઓ', pa: 'ਸਮਰੱਥਾਵਾਂ', or: 'ଦକ୍ଷତା' },
  extractedExp: { en: 'Extracted from spoken experience', hi: 'बोले गए अनुभव से निष्कर्षित', ta: 'அனுபவத்திலிருந்து கண்டறியப்பட்டது', te: 'అనుభవం నుండి గుర్తించబడింది', kn: 'ಅನುಭವದಿಂದ ಪಡೆಯಲಾಗಿದೆ', ml: 'പരിചയത്തിൽ നിന്ന് ശേഖരിച്ചത്', mr: 'कामाच्या अनुभवातून काढलेले', bn: 'কাজের অভিজ্ঞতা থেকে সংগৃহীত', gu: 'અનુભવમાંથી મેળવેલ', pa: 'ਤਜ਼ਰਬੇ ਤੋਂ ਪ੍ਰਾਪਤ', or: 'ଅଭିଜ୍ଞତାରୁ ନିର୍ଣ୍ଣୟ କରାଯାଇଛି' },
  modulesNeeded: { en: 'modules needed', hi: 'प्रशिक्षण मॉड्यूल आवश्यक', ta: 'தேவைப்படும் தொகுதிகள்', te: 'అవసరమైన మాడ్యూల్స్', kn: 'ಅಗತ್ಯವಿರುವ ಮಾಡ್ಯೂಲ್‌ಗಳು', ml: 'ആവശ്യമായ മൊഡ്യൂളുകൾ', mr: 'आवश्यक मॉड्यूल्स', bn: 'প্রয়োজনীয় মডিউল', gu: 'જરૂરી મોડ્યુલ્સ', pa: 'ਲੋੜੀਂਦੇ ਮੋਡੀਊਲ', or: 'ଆବଶ୍ୟକୀୟ ମଡ୍ୟୁଲ୍' },
  addressableBridge: { en: 'Addressable via short-term bridge', hi: 'अल्पकालिक ब्रिज कोर्स द्वारा पूर्ण करने योग्य', ta: 'குறுகிய கால பயிற்சியில் கற்கலாம்', te: 'స్వల్పకాలిక బ్రిడ్జి కోర్సు ద్వారా నేర్చుకోవచ్చు', kn: 'ಅಲ್ಪಾವಧಿ ತರಬೇತಿಯ ಮೂಲಕ ಕಲಿಯಬಹುದು', ml: 'ഹ്രസ്വകാല പരിശീലനം വഴി പരിഹരിക്കാം', mr: 'अल्पकालीन ब्रिज कोर्सद्वारे शिकता येईल', bn: 'স্বল্পমেয়াদী কোর্সের মাধ্যমে সমাধানযোগ্য', gu: 'ટૂંકા ગાળાના બ્રિજ કોર્સ દ્વારા શીખી શકાય', pa: 'ਥੋੜ੍ਹੇ ਸਮੇਂ ਦੇ ਕੋਰਸ ਰਾਹੀਂ ਹੱਲ ਯੋਗ', or: 'ସ୍ୱଳ୍ପକାଳୀନ କୋର୍ସ ଦ୍ୱାରା ଶିଖିପାରିବେ' },
  detected: { en: 'Detected', hi: 'पहचाने गए', ta: 'கண்டறியப்பட்டது', te: 'గుర్తించినవి', kn: 'ಗುರುತಿಸಲಾಗಿದೆ', ml: 'കണ്ടെത്തി', mr: 'आढळले', bn: 'শনাক্ত', gu: 'શોધાયેલ', pa: 'ਪਛਾਣੇ ਗਏ', or: 'ଚିହ୍ନଟ' },
  mapped: { en: 'Mapped', hi: 'संरेखित', ta: 'பொருந்தியது', te: 'సరిపోలింది', kn: 'ಹೊಂದಿಸಲಾಗಿದೆ', ml: 'ചേർത്തു', mr: 'मॅप केलेले', bn: 'সংযুক্ত', gu: 'મેપ કરેલ', pa: 'ਮੈਪ ਕੀਤਾ', or: 'ସଂଲଗ୍ନ' },
  toAcquire: { en: 'To Acquire', hi: 'सीखने योग्य', ta: 'கற்க வேண்டியவை', te: 'నేర్చుకోవలసినవి', kn: 'ಕಲಿಯಬೇಕಾದದ್ದು', ml: 'നേടേണ്ടവ', mr: 'शिकायचे', bn: 'অর্জন করতে হবে', gu: 'શીખવા જેવું', pa: 'ਸਿੱਖਣ ਯੋਗ', or: 'ହାସଲ କରିବାକୁ ଥିବା' },
  priority: { en: 'Priority', hi: 'प्राथमिकता', ta: 'முன்னுரிமை', te: 'ప్రాధాన్యత', kn: 'ಆದ್ಯತೆ', ml: 'മുൻഗണന', mr: 'प्राधान्य', bn: 'অগ্রাধিকার', gu: 'પ્રાથમિકતા', pa: 'ਤਰਜੀਹ', or: 'ଅଗ୍ରାଧିକାର' },
  bridgeCourse: { en: 'Targeted Competency Bridge', hi: 'लक्षित कौशल ब्रिज प्रशिक्षण', ta: 'இலக்கு திறன் பயிற்சி', te: 'లక్ష్యిత నైపుణ్యాల శిక్షణ', kn: 'ಗುರಿ ಕೌಶಲ್ಯ ತರಬೇತಿ', ml: 'നൈപുണ്യ പരിശീലനം', mr: 'लक्षित कौशल्य प्रशिक्षण', bn: 'লক্ষ্যভিত্তিক দক্ষতা প্রশিক্ষণ', gu: 'લક્ષિત કૌશલ્ય તાલીમ', pa: 'ਨਿਸ਼ਾਨਾਬੱਧ ਹੁਨਰ ਸਿਖਲਾਈ', or: 'ଲକ୍ଷ୍ୟଭିତ୍ତିକ ଦକ୍ଷତା ପ୍ରଶିକ୍ଷଣ' },
  bridgeSub: { en: 'Addressing these gaps converts your current prototype heuristic match into full NSQF Level 4 certification readiness.', hi: 'इन अंतरालों को पूरा करने से आप सीधे NSQF लेवल 4 प्रमाणन के लिए योग्य हो जाएंगे।', ta: 'இவற்றைக் கற்றுக்கொள்வதன் மூலம் முழுமையான NSQF நிலை 4 சான்றிதழ் தகுதியைப் பெறலாம்.', te: 'ఈ అంతరాలను పూరించడం ద్వారా NSQF సర్టిఫికేషన్ అర్హత పొందవచ్చు.', kn: 'ಈ ಅಂತರಗಳನ್ನು ಸರಿದೂಗಿಸಿ NSQF ಹಂತ 4 ಪ್ರಮಾಣಪತ್ರ ಪಡೆಯಿರಿ.', ml: 'ഈ വിടവുകൾ നികത്തുന്നത് വഴി NSQF യോഗ്യത നേടാം.', mr: 'हे अंतर भरून काढल्यास पूर्ण NSQF प्रमाणपत्र मिळते.', bn: 'এই ব্যবধান পূরণ করলে NSQF সার্টিফিকেশনের যোগ্যতা অর্জিত হবে।', gu: 'આ ગેપ્સ પૂરા કરવાથી NSQF લેવલ 4 સર્ટિફિકેટ મેળવી શકાય છે.', pa: 'ਇਹ ਪਾੜਾ ਪੂਰਾ ਕਰਨ ਨਾਲ NSQF ਸਰਟੀਫਿਕੇਸ਼ਨ ਮਿਲਦੀ ਹੈ।', or: 'ଏହି ଗ୍ୟାପ୍ ପୂରଣ କଲେ NSQF ସାର୍ଟିଫିକେଟ୍ ମିଳିବ।' },
  currentProfile: { en: 'Current Profile', hi: 'वर्तमान प्रोफ़ाइल', ta: 'தற்போதைய நிலை', te: 'ప్రస్తుత స్థితి', kn: 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ', ml: 'നിലവിലെ അവസ്ഥ', mr: 'सद्य प्रोफाइल', bn: 'বর্তমান প্রোফাইল', gu: 'વર્તમાન સ્થિતિ', pa: 'ਮੌਜੂਦਾ ਸਥਿਤੀ', or: 'ବର୍ତ୍ତମାନର ସ୍ଥିତି' },
  voiceAssessment: { en: 'Voice Assessment', hi: 'वॉयस मूल्यांकन', ta: 'குரல் மதிப்பீடு', te: 'వాయిస్ అసెస్‌మెంట్', kn: 'ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ', ml: 'വോയ്‌സ് വിലയിരുത്തൽ', mr: 'व्हॉइस मूल्यांकन', bn: 'ভয়েস মূল্যায়ন', gu: 'વોઇસ મૂલ્યાંકન', pa: 'ਵਾਇਸ ਮੁਲਾਂਕਣ', or: 'ଭଏସ୍ ଆକଳନ' },
  competencyBridge: { en: 'Competency Bridge', hi: 'कौशल सेतु (ब्रिज)', ta: 'திறன் பாலம்', te: 'నైపుణ్య వారధి', kn: 'ಕೌಶಲ್ಯ ಸೇತು', ml: 'നൈപുണ്യ പാലം', mr: 'कौशल्य सेतू', bn: 'দক্ষতা সেতু', gu: 'કૌશલ્ય સેતુ', pa: 'ਹੁਨਰ ਪੁਲ', or: 'ଦକ୍ଷତା ସେତୁ' },
  nsqfCert: { en: 'NSQF Certification', hi: 'NSQF प्रमाणन', ta: 'சான்றிதழ்', te: 'సర్టిఫికేషన్', kn: 'ಪ್ರಮಾಣಪತ್ರ', ml: 'സർട്ടിഫിക്കറ്റ്', mr: 'प्रमाणपत्र', bn: 'শংসাপত্র', gu: 'પ્રમાણપત્ર', pa: 'ਸਰਟੀਫਿਕੇਟ', or: 'ପ୍ରମାଣପତ୍ର' },
  enrollViewCenters: { en: 'Enroll / View Centers', hi: 'प्रशिक्षण केंद्र देखें / नामांकन करें', ta: 'மையங்களைப் பார்க்க', te: 'కేంద్రాలను చూడండి / నమోదు చేసుకోండి', kn: 'ಕೇಂದ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ / ನೋಂದಾಯಿಸಿ', ml: 'കേന്ദ്രങ്ങൾ കാണുക / ചേരുക', mr: 'केंद्रे पहा / नावनोंदणी करा', bn: 'প্রশিক্ষণ কেন্দ্র দেখুন / ভর্তি হন', gu: 'કેન્દ્રો જુઓ / નોંધણી કરો', pa: 'ਕੇਂਦਰ ਵੇਖੋ / ਦਾਖਲਾ ਲਓ', or: 'କେନ୍ଦ୍ର ଦେଖନ୍ତୁ / ନାମ ଲେଖାନ୍ତୁ' },
  aiExplanation: { en: 'Transparent AI Explanation', hi: 'पारदर्शी AI कारण व्याख्या', ta: 'வெளிப்படையான AI விளக்கம்', te: 'పారదర్శక AI వివరణ', kn: 'ಪಾರದರ್ಶಕ AI ವಿವರಣೆ', ml: 'സുതാര്യമായ AI വിശദീകരണം', mr: 'पारदर्शक AI स्पष्टीकरण', bn: 'স্বচ্ছ AI ব্যাখ্যা', gu: 'પારદર્શક AI સમજૂતી', pa: 'ਪਾਰਦਰਸ਼ੀ AI ਵਿਆਖਿਆ', or: 'ସ୍ୱଚ୍ଛ AI ବ୍ୟାଖ୍ୟା' },
  reasoningBreakdown: { en: 'Reasoning Breakdown:', hi: 'सिफारिश का मुख्य आधार:', ta: 'காரண விளக்கம்:', te: 'సిఫార్సు వివరణ:', kn: 'ಕಾರಣಗಳ ವಿವರಣೆ:', ml: 'കാരണങ്ങൾ:', mr: 'शिफारसीचा आधार:', bn: 'যৌক্তিক কারণ:', gu: 'ભલામણના કારણો:', pa: 'ਸਿਫਾਰਸ਼ ਦਾ ਆਧਾਰ:', or: 'କାରଣ ବିବରଣୀ:' },
  immediateLearning: { en: 'Recommended Immediate Learning:', hi: 'सर्वप्रथम सीखने की सिफारिश:', ta: 'முதலில் கற்க வேண்டியவை:', te: 'మొదట నేర్చుకోవలసినవి:', kn: 'ಮೊದಲು ಕಲಿಯಲು ಶಿಫಾರಸು:', ml: 'ഉടൻ പഠിക്കേണ്ടത്:', mr: 'प्रथम शिकण्याची शिफारस:', bn: 'প্রথমে শেখার সুপারিশ:', gu: 'સૌ પ્રથમ શીખવાની ભલામણ:', pa: 'ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਸਿੱਖਣ ਦੀ ਸਿਫਾਰਸ਼:', or: 'ତୁରନ୍ତ ଶିଖିବାକୁ ସୁପାରିଶ:' }
};

function getDashStr(key, lang) {
  const dict = DASH_STRINGS[key];
  if (!dict) return '';
  return dict[lang] || dict.en || '';
}

export default function CandidateDashboard({ onOpenVoiceModal }) {
  const { lang, t } = useLanguage();
  const { activeProfile, currentUser, token } = useAuth();

  const [expandedExplanation, setExpandedExplanation] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [liveProfile, setLiveProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (token && currentUser) {
      apiClient.getMyProfile()
        .then(data => {
          if (isMounted && data?.data) {
            setLiveProfile(data.data);
          }
        })
        .catch(err => console.warn('Could not sync live profile:', err));
    } else {
      setLiveProfile(null);
    }
    return () => { isMounted = false; };
  }, [token, currentUser]);

  const candidateName = currentUser?.full_name || activeProfile.name;
  const completionPercentage = liveProfile?.completion_percentage || 80;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome & Primary Voice CTA */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getDashStr('voiceDerived', lang)}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.candidate.welcome}, <span className="text-brand-400">{candidateName}</span>!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t.candidate.subheading}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                {activeProfile.education}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-brand-400" />
                {activeProfile.goal}
              </span>
              <span>•</span>
              <span>{activeProfile.location}</span>
            </div>
          </div>

          {/* Primary Main Voice CTA Button */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenVoiceModal}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-emerald-500 to-teal-400 hover:from-brand-500 hover:to-teal-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-brand-500/25 transition-all transform active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-950/20 flex items-center justify-center group-hover:scale-110 transition">
                <Mic className="w-5 h-5 text-slate-950" />
              </div>
              <div className="text-left">
                <div>{t.candidate.startAssessmentCta}</div>
                <div className="text-[11px] font-normal text-slate-900/80">
                  {getDashStr('tapToSpeak', lang)}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Readiness & High-level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.quickStats.profileCompletion}</span>
            <span className="font-bold text-brand-400">{completionPercentage}%</span>
          </div>
          <div className="my-3">
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            {getDashStr('voiceVerified', lang)}
          </span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.quickStats.verifiedSkills}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-white">{activeProfile.currentSkills.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">{getDashStr('competencies', lang)}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {getDashStr('extractedExp', lang)}
          </span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.quickStats.competencyGaps}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-amber-400">{activeProfile.missingCompetencies.length}</span>
            <span className="text-xs text-slate-400 ml-1.5">{getDashStr('modulesNeeded', lang)}</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {getDashStr('addressableBridge', lang)}
          </span>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.quickStats.targetPathway}</span>
            <Award className="w-4 h-4 text-brand-400" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-black text-brand-400">{activeProfile.targetPathway.matchScore}%</span>
            <span className="text-xs text-slate-400 ml-1.5">{activeProfile.targetPathway.nsqfLevel}</span>
          </div>
          <span className="text-[11px] text-slate-500 truncate" title={activeProfile.targetPathway.title}>
            {activeProfile.targetPathway.title}
          </span>
        </div>
      </div>

      {/* Main Dual-Column Section: Skills vs Competency Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identified Skills Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                {t.candidate.skillsSectionTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.candidate.skillsSectionSubtitle}
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
              {activeProfile.currentSkills.length} {getDashStr('detected', lang)}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {activeProfile.currentSkills.map((skill, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">{skill.name}</span>
                    <span className="text-[10px] text-slate-500">{skill.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                    {skill.level}
                  </span>
                  {skill.verified && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                      NSQF {getDashStr('mapped', lang)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* User's Available Tools & Resources */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-brand-400" />
              {t.candidate.toolsResources}
            </span>
            <div className="flex flex-wrap gap-2">
              {activeProfile.resources.map((item, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Competency Gap Analysis Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {t.candidate.competencyGapTitle}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.candidate.competencyGapSubtitle}
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
              {activeProfile.missingCompetencies.length} {getDashStr('toAcquire', lang)}
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {activeProfile.missingCompetencies.map((gap, index) => (
              <div 
                key={index}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-xs font-semibold text-slate-200">{gap.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    gap.urgency === 'High' 
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' 
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  }`}>
                    {gap.urgency} {getDashStr('priority', lang)}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 pl-4">
                  Module: <span className="text-slate-400">{gap.module}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bridge Training Recommendation Banner */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900/40 to-slate-900/40 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300 block mb-0.5">
                {getDashStr('bridgeCourse', lang)}
              </span>
              <span>
                {getDashStr('bridgeSub', lang)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top NSQF Pathway & Roadmap Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {activeProfile.targetPathway.nsqfLevel}
              </span>
              <span className="text-xs font-mono text-slate-400">
                QP Code: {activeProfile.targetPathway.qpCode}
              </span>
            </div>
            <h3 className="text-xl font-bold text-white">
              {activeProfile.targetPathway.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {activeProfile.targetPathway.council}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">{t.candidate.employmentModel}</div>
              <div className="text-sm font-bold text-emerald-400">{activeProfile.targetPathway.type}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-brand-400">{activeProfile.targetPathway.matchScore}%</span>
              <span className="text-[9px] text-slate-500">{t.candidate.matchScore}</span>
            </div>
          </div>
        </div>

        {/* 5-Stage Visual Progression Roadmap */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {t.candidate.trainingProgression}
            </span>
            <span className="text-[11px] text-slate-500">
              Estimated Outcome: <strong className="text-brand-300">{activeProfile.targetPathway.potentialIncome}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-brand-950/30 border border-brand-500/30 text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 1 • Completed</span>
              <div className="font-semibold text-slate-200">{getDashStr('currentProfile', lang)}</div>
              <div className="text-[11px] text-slate-400">{activeProfile.priorOccupation}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-brand-950/30 border border-brand-500/30 text-xs space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Step 2 • Completed</span>
              <div className="font-semibold text-slate-200">{getDashStr('voiceAssessment', lang)}</div>
              <div className="text-[11px] text-slate-400">{activeProfile.currentSkills.length} skills identified</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-1 ring-1 ring-amber-500/20">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Step 3 • Active Action</span>
              <div className="font-semibold text-white">{getDashStr('competencyBridge', lang)}</div>
              <div className="text-[11px] text-slate-300">Short-term training</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 4 • Upcoming</span>
              <div className="font-semibold text-slate-300">{getDashStr('nsqfCert', lang)}</div>
              <div className="text-[11px] text-slate-500">RPL / QP Assessment</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Step 5 • Livelihood</span>
              <div className="font-semibold text-slate-300">{activeProfile.targetPathway.type}</div>
              <div className="text-[11px] text-slate-500">{activeProfile.targetPathway.potentialIncome}</div>
            </div>
          </div>
        </div>

        {/* Immediate Next Action Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-brand-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
              {t.candidate.nextAction}:
            </span>
            <div className="text-sm font-semibold text-white">
              {activeProfile.targetPathway.nextAction}
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs transition shadow-md shadow-brand-500/20 whitespace-nowrap">
            <span>{getDashStr('enrollViewCenters', lang)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* AI Explainability Section */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedExplanation(!expandedExplanation)}>
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              {getDashStr('aiExplanation', lang)}
            </span>
            <button className="text-slate-400 hover:text-white p-1">
              {expandedExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expandedExplanation && (
            <div className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-3">
              <p className="text-slate-300 leading-relaxed">
                "{activeProfile.targetPathway.explanation}"
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setActiveQuestion(activeQuestion === 'why' ? null : 'why')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                >
                  💡 {t.candidate.askAiWhy}
                </button>
                <button
                  onClick={() => setActiveQuestion(activeQuestion === 'learnFirst' ? null : 'learnFirst')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition"
                >
                  🎯 {t.candidate.askAiLearnFirst}
                </button>
              </div>

              {activeQuestion === 'why' && (
                <div className="p-3 rounded-lg bg-brand-950/30 border border-brand-500/30 text-emerald-300 animate-in fade-in">
                  <strong>{getDashStr('reasoningBreakdown', lang)}</strong>
                  <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-300">
                    <li>High affinity with your identified skills & experience.</li>
                    <li>Matches your stated livelihood goal and available equipment.</li>
                    <li>Verified NSQF Qualification Pack exists with recognized assessment centers.</li>
                  </ul>
                </div>
              )}

              {activeQuestion === 'learnFirst' && (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 animate-in fade-in">
                  <strong>{getDashStr('immediateLearning', lang)}</strong>
                  <p className="mt-1 text-slate-300">
                    {activeProfile.missingCompetencies[0]?.name} ({activeProfile.missingCompetencies[0]?.module}) — closes your primary competency gap.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
