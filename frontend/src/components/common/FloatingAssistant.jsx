import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Loader2,
  ChevronDown,
  Mic
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';

// ─── Multilingual Strings ────────────────────────────────────────────────────
const STR = {
  title: {
    en: 'AI Career Counselor', hi: 'AI करियर परामर्शदाता', ta: 'AI வாழ்வாதார வழிகாட்டி',
    te: 'AI కెరీర్ కౌన్సెలర్', kn: 'AI ವೃತ್ತಿ ಸಲಹೆಗಾರ', ml: 'AI കരിയർ കൗൺസിലർ',
    mr: 'AI करिअर समुपदेशक', bn: 'AI ক্যারিয়ার পরামর্শক', gu: 'AI કારકિર્દી સલાહકાર',
    pa: 'AI ਕਰੀਅਰ ਸਲਾਹਕਾਰ', or: 'AI କ୍ୟାରିଅର୍ ପରାମର୍ଶଦାତା'
  },
  subtitle: {
    en: 'NSQF · Schemes · Platform Help', hi: 'NSQF · योजनाएं · प्लेटफॉर्म सहायता',
    ta: 'NSQF · திட்டங்கள் · தள உதவி', te: 'NSQF · పథకాలు · సహాయం',
    kn: 'NSQF · ಯೋಜನೆಗಳು · ಸಹಾಯ', ml: 'NSQF · പദ്ധതികൾ · സഹായം',
    mr: 'NSQF · योजना · मदत', bn: 'NSQF · প্রকল্প · সহায়তা',
    gu: 'NSQF · યોજના · સહાય', pa: 'NSQF · ਸਕੀਮਾਂ · ਮਦਦ', or: 'NSQF · ଯୋଜନା · ସାହାଯ୍ୟ'
  },
  welcome: {
    en: "Hi! I'm SkillBot — your AI Counselor for NSQF, government schemes, and this platform. Ask me anything!",
    hi: 'नमस्ते! मैं SkillBot हूँ — NSQF, सरकारी योजनाएं और प्लेटफॉर्म के बारे में कुछ भी पूछें!',
    ta: 'வணக்கம்! நான் SkillBot — NSQF, அரசு திட்டங்கள் மற்றும் தளம் பற்றி எதையும் கேளுங்கள்!',
    te: 'నమస్కారం! నేను SkillBot — NSQF, ప్రభుత్వ పథకాలు మరియు ప్లాట్‌ఫారమ్ గురించి అడగండి!',
    kn: 'ನಮಸ್ಕಾರ! ನಾನು SkillBot — NSQF, ಯೋಜನೆಗಳು, ಮತ್ತು ವೇದಿಕೆಯ ಬಗ್ಗೆ ಕೇಳಿ!',
    ml: 'നമസ്കാരം! ഞാൻ SkillBot — NSQF, സർക്കാർ പദ്ധതികൾ, പ്ലാറ്റ്‌ഫോം ഉപഗ്രഹം!',
    mr: 'नमस्कार! मी SkillBot — NSQF, सरकारी योजना व प्लेटफॉर्मबद्दल विचारा!',
    bn: 'নমস্কার! আমি SkillBot — NSQF, সরকারি প্রকল্প ও প্ল্যাটফর্ম সম্পর্কে জিজ্ঞাসা করুন!',
    gu: 'નમસ્તે! હું SkillBot — NSQF, સરકારી યોજના અને પ્લેટફોર્મ વિશે પૂછો!',
    pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ SkillBot — NSQF, ਸਕੀਮਾਂ ਤੇ ਪਲੈਟਫਾਰਮ ਬਾਰੇ ਪੁੱਛੋ!',
    or: 'ନମସ୍କାର! ମୁଁ SkillBot — NSQF, ଯୋଜନା ଓ ପ୍ଲାଟଫର୍ମ ବିଷୟରେ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ!'
  },
  placeholder: {
    en: 'Ask about NSQF, RPL, schemes, or the platform…',
    hi: 'NSQF, RPL, योजना या प्लेटफॉर्म पूछें…',
    ta: 'NSQF, RPL, திட்டங்கள் அல்லது தளம் பற்றி கேளுங்கள்…',
    te: 'NSQF, RPL, పథకాలు లేదా ప్లాట్‌ఫారమ్ గురించి అడగండి…',
    kn: 'NSQF, RPL, ಯೋಜನೆ ಅಥವಾ ವೇದಿಕೆ ಬಗ್ಗೆ ಕೇಳಿ…',
    ml: 'NSQF, RPL, പദ്ധതി, ഉപഗ്രഹം ബഗ്ഗെ ചോദിക്കൂ…',
    mr: 'NSQF, RPL, योजना किंवा प्लेटफॉर्मबद्दल विचारा…',
    bn: 'NSQF, RPL, প্রকল্প বা প্ল্যাটফর্ম সম্পর্কে জিজ্ঞাসা করুন…',
    gu: 'NSQF, RPL, યોજના, અથવા પ્લેટફોર્મ વિશે પૂછો…',
    pa: 'NSQF, RPL, ਸਕੀਮਾਂ ਜਾਂ ਪਲੈਟਫਾਰਮ ਬਾਰੇ ਪੁੱਛੋ…',
    or: 'NSQF, RPL, ଯୋଜନା ବା ପ୍ଲାଟଫର୍ମ ବିଷୟରେ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ…'
  },
  thinking: {
    en: 'SkillBot is thinking…', hi: 'SkillBot सोच रहा है…', ta: 'SkillBot யோசிக்கிறது…',
    te: 'SkillBot ఆలోచిస్తోంది…', kn: 'SkillBot ಯೋಚಿಸುತ್ತಿದೆ…', ml: 'SkillBot ചിന്തിക്കുന്നു…',
    mr: 'SkillBot विचार करत आहे…', bn: 'SkillBot চিন্তা করছে…', gu: 'SkillBot વિચારી રહ્યો છે…',
    pa: 'SkillBot ਸੋਚ ਰਿਹਾ ਹੈ…', or: 'SkillBot ଭାବୁଛି…'
  },
  clearChat: {
    en: 'Clear chat', hi: 'चैट साफ़ करें', ta: 'அரட்டையை அழிக்கவும்',
    te: 'చాట్ క్లియర్', kn: 'ಚಾಟ್ ಅಳಿಸಿ', ml: 'ചാറ്റ് മായ്ക്കുക',
    mr: 'चॅट साफ करा', bn: 'চ্যাট মুছুন', gu: 'ચૅટ સાફ કરો',
    pa: 'ਚੈਟ ਸਾਫ਼ ਕਰੋ', or: 'ଚାଟ୍ ଖାଲି କରନ୍ତୁ'
  }
};

// ─── Quick Question Sets ──────────────────────────────────────────────────────
const QUICK_QUESTIONS = {
  en: [
    'What is NSQF and which level suits me?',
    'How does RPL certification work?',
    'What government schemes am I eligible for?',
    'How do I use this platform?',
    'What is PM Vishwakarma scheme?',
    'How to get a MUDRA loan?'
  ],
  hi: [
    'NSQF क्या है और मुझे कौन सा स्तर चाहिए?',
    'RPL प्रमाणीकरण कैसे काम करता है?',
    'कौन सी सरकारी योजनाएं मेरे लिए हैं?',
    'इस प्लेटफॉर्म का उपयोग कैसे करें?',
    'PM विश्वकर्मा योजना क्या है?',
    'मुद्रा लोन कैसे मिलेगा?'
  ],
  ta: [
    'NSQF என்னவென்று சொல்லுங்கள், எனக்கு எந்த நிலை பொருந்தும்?',
    'RPL சான்றிதழ் எவ்வாறு செயல்படுகிறது?',
    'நான் எந்த அரசு திட்டத்திற்கு தகுதியானவன்?',
    'இந்த தளத்தை எவ்வாறு பயன்படுத்துவது?',
    'PM விஸ்வகர்மா திட்டம் என்ன?',
    'முத்ரா கடன் எவ்வாறு பெறுவது?'
  ],
  te: [
    'NSQF అంటే ఏమిటి, నాకు ఏ స్థాయి సరిపోతుంది?',
    'RPL సర్టిఫికేషన్ ఎలా పని చేస్తుంది?',
    'నాకు ఏ ప్రభుత్వ పథకాలు అర్హత ఉన్నాయి?',
    'ఈ ప్లాట్‌ఫారమ్ ఎలా వాడాలి?',
    'PM విశ్వకర్మ పథకం ఏమిటి?',
    'ముద్రా లోన్ ఎలా పొందాలి?'
  ],
  kn: [
    'NSQF ಅಂದರೇನು, ನನಗೆ ಯಾವ ಮಟ್ಟ ಸೂಕ್ತ?',
    'RPL ಪ್ರಮಾಣೀಕರಣ ಹೇಗೆ ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತದೆ?',
    'ನನಗೆ ಯಾವ ಸರ್ಕಾರಿ ಯೋಜನೆ ಸಿಗುತ್ತದೆ?',
    'ಈ ವೇದಿಕೆ ಬಳಸುವುದು ಹೇಗೆ?'
  ],
  ml: [
    'NSQF എന്താണ്, എനിക്ക് ഏത് ലെവൽ?',
    'RPL സർട്ടിഫിക്കേഷൻ എങ്ങനെ?',
    'ഏത് സർക്കാർ പദ്ധതി?',
    'ഈ സൈറ്റ് ഉപയോഗം?'
  ],
  mr: [
    'NSQF म्हणजे काय?', 'RPL प्रमाणीकरण कसे होते?',
    'कोणत्या सरकारी योजना मिळतील?', 'वेबसाइट वापरणे कसे?'
  ],
  bn: [
    'NSQF কী?', 'RPL সার্টিফিকেশন কীভাবে?',
    'কোন সরকারি প্রকল্প পাবো?', 'প্ল্যাটফর্ম ব্যবহার?'
  ],
  gu: [
    'NSQF શું છે?', 'RPL પ્રમાણપત્ર?',
    'કઈ સરકારી યોજના?', 'ઉપયોગ?'
  ],
  pa: [
    'NSQF ਕੀ ਹੈ?', 'RPL ਸਰਟੀਫਿਕੇਟ?',
    'ਕਿਹੜੀ ਸਕੀਮ?', 'ਵਰਤੋਂ?'
  ],
  or: [
    'NSQF କ\'ଣ?', 'RPL ପ୍ରମାଣପତ୍ର?',
    'କେଉଁ ଯୋଜନା?', 'ବ୍ୟବହାର?'
  ]
};

function getStr(key, lang) {
  const d = STR[key];
  return d ? (d[lang] || d.en || '') : '';
}

function getQuickQs(lang) {
  return QUICK_QUESTIONS[lang] || QUICK_QUESTIONS.en;
}

// ─── Message Renderer ─────────────────────────────────────────────────────────
function MessageBubble({ msg, onSpeak, isSpeaking }) {
  const isAI = msg.sender === 'ai';
  const isLoading = msg.loading;

  // Convert markdown-like **bold** and bullet points to JSX
  const renderText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, i) => {
      const boldified = line.replace(/\*\*(.*?)\*\*/g, (_, m) =>
        `<strong style="color:#a3e635;">${m}</strong>`
      );
      const isBullet = /^[•\-\*]\s/.test(line.trimStart());
      return (
        <p
          key={i}
          className={isBullet ? 'ml-2' : ''}
          style={{ marginBottom: '2px' }}
          dangerouslySetInnerHTML={{ __html: boldified || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} mb-2`}>
      {isAI && (
        <div className="flex items-center gap-1 mb-1 ml-1">
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center">
            <Bot className="w-2.5 h-2.5 text-slate-950" />
          </div>
          <span className="text-[9px] font-bold text-lime-400 uppercase tracking-wider">SkillBot</span>
        </div>
      )}
      <div
        className={`px-3 py-2.5 rounded-xl max-w-[88%] text-[11.5px] leading-relaxed ${
          isAI
            ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/60 shadow-sm'
            : 'bg-gradient-to-br from-lime-500 to-emerald-500 text-slate-950 font-semibold rounded-tr-none'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin text-lime-400" />
            <span className="animate-pulse">{msg.text}</span>
          </div>
        ) : (
          <div>{renderText(msg.text)}</div>
        )}
      </div>
      {isAI && !isLoading && (
        <button
          onClick={() => onSpeak(msg.text)}
          className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-lime-400 mt-0.5 ml-1 transition-colors"
        >
          {isSpeaking ? (
            <VolumeX className="w-2.5 h-2.5 text-rose-400" />
          ) : (
            <Volume2 className="w-2.5 h-2.5" />
          )}
          <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FloatingAssistant() {
  const { lang, getLanguageBcp47 } = useLanguage();
  const { activeProfile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Welcome message when language changes
  useEffect(() => {
    setMessages([{ sender: 'ai', text: getStr('welcome', lang) }]);
  }, [lang]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build conversation history for the API (last 8 turns)
  const buildHistory = (msgs) => {
    return msgs
      .slice(-8)
      .filter((m) => !m.loading)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));
  };

  // Build user context from active profile
  const buildContext = () => {
    if (!activeProfile) return {};
    return {
      user_name: activeProfile.fullName || activeProfile.full_name,
      education: activeProfile.education,
      prior_occupation: activeProfile.priorOccupation,
      experience_years: activeProfile.experienceYears,
      goal: activeProfile.goal,
      location: activeProfile.location,
      target_pathway: activeProfile.targetPathway,
      missing_competencies: activeProfile.missingCompetencies
    };
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setShowQuick(false);

    const userMsg = { sender: 'user', text };
    const historyBeforeSend = buildHistory(messages);

    setMessages((prev) => [...prev, userMsg]);

    // Loading placeholder
    const loadingMsg = { sender: 'ai', text: getStr('thinking', lang), loading: true };
    setMessages((prev) => [...prev, loadingMsg]);
    setIsLoading(true);

    try {
      const res = await apiClient.askCounselor({
        query: text,
        language: lang,
        context: buildContext(),
        conversationHistory: historyBeforeSend
      });

      const answer =
        res?.data?.answer ||
        res?.data?.explanation_en ||
        "I'm sorry, I couldn't fetch an answer right now. Please try again.";

      setMessages((prev) => {
        const updated = [...prev];
        // Replace loading message
        const loadingIdx = updated.findLastIndex((m) => m.loading);
        if (loadingIdx !== -1) updated[loadingIdx] = { sender: 'ai', text: answer };
        return updated;
      });
    } catch (err) {
      console.error('Counselor API error:', err);
      // Fallback: remove loading, show error
      setMessages((prev) => {
        const updated = [...prev];
        const loadingIdx = updated.findLastIndex((m) => m.loading);
        if (loadingIdx !== -1) {
          updated[loadingIdx] = {
            sender: 'ai',
            text: lang === 'ta'
              ? 'மன்னிக்கவும், இப்போது பதில் கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : lang === 'hi'
              ? 'क्षमा करें, अभी उत्तर नहीं मिल सका। कृपया पुनः प्रयास करें।'
              : 'Sorry, I could not get a response right now. Please try again.'
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) { setIsSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageBcp47 ? getLanguageBcp47(lang) : 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleClear = () => {
    setMessages([{ sender: 'ai', text: getStr('welcome', lang) }]);
    setShowQuick(true);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const quickQs = getQuickQs(lang);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Button */}
      {!isOpen ? (
        <button
          id="floating-ai-counselor-btn"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-tr from-lime-500 to-emerald-500 text-slate-950 font-bold shadow-2xl shadow-lime-500/30 hover:scale-105 active:scale-95 transition-all"
          title="Open AI Counselor"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs hidden sm:inline font-black">{getStr('title', lang)}</span>
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping opacity-70" />
        </button>
      ) : (
        <div
          id="floating-ai-counselor-panel"
          className="bg-slate-900 border border-slate-700/60 rounded-2xl w-80 sm:w-[370px] shadow-2xl shadow-black/40 overflow-hidden flex flex-col"
          style={{ height: '520px' }}
        >
          {/* ── Header ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-950 to-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-500 flex items-center justify-center shadow-md shadow-lime-500/30">
                <Bot className="w-4.5 h-4.5 text-slate-950" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-white leading-tight">
                  {getStr('title', lang)}
                </h4>
                <span className="text-[9px] text-slate-400 leading-none">
                  {getStr('subtitle', lang)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Online
              </span>
              <button
                onClick={handleClear}
                title={getStr('clearChat', lang)}
                className="text-[9px] text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 hover:border-slate-600 transition ml-1"
              >
                {getStr('clearChat', lang)}
              </button>
              <button
                onClick={() => { setIsOpen(false); window.speechSynthesis?.cancel(); setIsSpeaking(false); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg ml-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Messages ───────────────────────────────── */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                msg={m}
                onSpeak={handleSpeak}
                isSpeaking={isSpeaking}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* ── Quick Questions (collapsible) ──────────── */}
          {showQuick && (
            <div className="px-2.5 py-1.5 bg-slate-950/70 border-t border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-lime-400" />
                  Quick Questions
                </span>
                <button
                  onClick={() => setShowQuick(false)}
                  className="text-slate-500 hover:text-slate-300 transition"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {quickQs.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    disabled={isLoading}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 hover:border-lime-500/50 transition disabled:opacity-40 max-w-[200px] truncate"
                    title={q}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Input Box ──────────────────────────────── */}
          <div className="px-2.5 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            {!showQuick && (
              <button
                onClick={() => setShowQuick(true)}
                title="Show suggestions"
                className="text-slate-500 hover:text-lime-400 transition p-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={getStr('placeholder', lang)}
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-lime-500/60 rounded-xl px-3 py-2 text-[11.5px] text-slate-200 placeholder-slate-500 focus:outline-none transition disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              className="p-2 rounded-xl bg-gradient-to-tr from-lime-500 to-emerald-500 text-slate-950 hover:opacity-90 disabled:opacity-40 transition shadow shadow-lime-500/20"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
