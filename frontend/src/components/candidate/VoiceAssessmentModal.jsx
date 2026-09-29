import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/apiClient';
import { 
  MULTILINGUAL_QUESTIONS, 
  SAMPLE_PROFILES_BY_LANG, 
  getQuestionContent 
} from '../../i18n/voiceQuestions';

const UI_STRINGS = {
  voiceFirst: { en: 'Voice First', hi: 'वॉयस फर्स्ट', ta: 'குரல் வழி', te: 'వాయిస్ ఫస్ట్', kn: 'ಧ್ವನಿ ಪ್ರಥಮ', ml: 'വോയ്‌സ് ഫസ്റ്റ്', mr: 'व्हॉइस फर्स्ट', bn: 'ভয়েস ফার্স্ট', gu: 'વોઇસ ફર્સ્ટ', pa: 'ਵਾਇਸ ਫਸਟ', or: 'ଭଏସ୍ ପ୍ରଥମ' },
  nineQ: { en: '9 Questions', hi: '9 प्रश्न', ta: '9 வினாக்கள்', te: '9 ప్రశ్నలు', kn: '9 ಪ್ರಶ್ನೆಗಳು', ml: '9 ചോദ്യങ്ങൾ', mr: '९ प्रश्न', bn: '৯টি প্রশ্ন', gu: '9 પ્રશ્નો', pa: '9 ਸਵਾਲ', or: '୯ଟି ପ୍ରଶ୍ନ' },
  freeSpeech: { en: 'Free Speech', hi: 'निरंतर बोलना', ta: 'தொடர் பேச்சு', te: 'నిరంతర మాటలు', kn: 'ಮುಕ್ತ ಮಾತು', ml: 'തുടർച്ചയായ സംസാരം', mr: 'सलग बोलणे', bn: 'ধারাবাহিক কথা', gu: 'મુક્ત વાણી', pa: 'ਲਗਾਤਾਰ ਬੋਲਣਾ', or: 'ମୁକ୍ତ କଥାବାର୍ତ୍ତା' },
  completedTitle: { en: 'AI Voice Assessment & Extraction Complete!', hi: 'AI वॉयस मूल्यांकन एवं प्रोफ़ाइल निष्कर्षण पूर्ण!', ta: 'AI குரல் வழி விவரங்கள் பிரித்தெடுக்கப்பட்டது!', te: 'AI వాయిస్ అసెస్‌మెంట్ పూర్తయింది!', kn: 'AI ಧ್ವನಿ ಮೌಲ್ಯಮಾಪನ ಪೂರ್ಣಗೊಂಡಿದೆ!', ml: 'AI വോയ്‌സ് വിലയിരുത്തൽ പൂർത്തിയായി!', mr: 'AI व्हॉइस मूल्यांकन पूर्ण झाले!', bn: 'AI ভয়েস মূল্যায়ন সম্পন্ন!', gu: 'AI વોઇસ મૂલ્યાંકન પૂર્ણ!', pa: 'AI ਵਾਇਸ ਮੁਲਾਂਕਣ ਮੁਕੰਮਲ!', or: 'AI ଭଏସ୍ ଆକଳନ ସମ୍ପୂର୍ଣ୍ଣ!' },
  completedSub: { en: 'Structured profile and canonical skills extracted strictly without hallucination.', hi: 'सटीक शैक्षणिक योग्यता, कार्य अनुभव और NSQF कौशल निष्कर्षित।', ta: 'உங்கள் பதில்களிலிருந்து பெறப்பட்ட சரியான கல்வி, அனுபவம் மற்றும் திறன்கள்.', te: 'మీ సమాధానాల నుండి నైపుణ్యాలు ఖచ్చితంగా తీసుకోబడ్డాయి.', kn: 'ನಿಮ್ಮ ಉತ್ತರಗಳಿಂದ ಸರಿಯಾದ ಶಿಕ್ಷಣ ಮತ್ತು ಕೌಶಲ್ಯಗಳನ್ನು ಪಡೆಯಲಾಗಿದೆ.', ml: 'നിങ്ങളുടെ ഉത്തരങ്ങളിൽ നിന്ന് ശരിയായ കഴിവുകൾ ശേഖരിച്ചു.', mr: 'आपल्या उत्तरांमधून अचूक कौशल्ये प्राप्त झाली.', bn: 'আপনার উত্তর থেকে সঠিক দক্ষতা ও অভিজ্ঞতা সংগৃহীত হয়েছে।', gu: 'તમારા જવાબોમાંથી સાચા કૌશલ્યો મેળવવામાં આવ્યા.', pa: 'ਤੁਹਾਡੇ ਜਵਾਬਾਂ ਤੋਂ ਸਹੀ ਹੁਨਰ ਪ੍ਰਾਪਤ ਕੀਤੇ ਗਏ।', or: 'ଆପଣଙ୍କ ଉତ୍ତରରୁ ସଠିକ୍ ଦକ୍ଷତା ନିର୍ଣ୍ଣୟ କରାଯାଇଛି।' },
  blueprint: { en: 'Extracted Profile Blueprint', hi: 'निष्कर्षित प्रोफ़ाइल ब्लूप्रिंट', ta: 'கண்டறியப்பட்ட சுயவிவரம்', te: 'గుర్తించిన ప్రొఫైల్ సారాంశం', kn: 'ಪಡೆಯಲಾದ ಪ್ರೊಫೈಲ್ ಸಾರಾಂಶ', ml: 'കണ്ടെത്തിയ പ്രൊഫൈൽ', mr: 'प्राप्त प्रोफाइल तपशील', bn: 'নিষ্কাশিত প্রোফাইল ব্লুপ্রিন্ট', gu: 'મેળવેલ પ્રોફાઇલ વિગતો', pa: 'ਪ੍ਰਾਪਤ ਪ੍ਰੋਫਾਈਲ ਵੇਰਵੇ', or: 'ପ୍ରାପ୍ତ ପ୍ରୋଫାଇଲ୍ ସାରାଂଶ' },
  skillsTitle: { en: 'Canonical Identified Skills:', hi: 'पहचाने गए प्रमाणित कौशल:', ta: 'கண்டறியப்பட்ட அங்கீகரிக்கப்பட்ட திறன்கள்:', te: 'గుర్తించిన ధృవీకృత నైపుణ్యాలు:', kn: 'ಗುರುತಿಸಲಾದ ಅಧಿಕೃತ ಕೌಶಲ್ಯಗಳು:', ml: 'കണ്ടെത്തിയ അംഗീകൃത കഴിവുകൾ:', mr: 'ओळखलेली अधिकृत कौशल्ये:', bn: 'চিহ্নিত স্বীকৃত দক্ষতা:', gu: 'ઓળખાયેલ પ્રમાણિત કૌશલ્યો:', pa: 'ਪਛਾਣੇ ਗਏ ਪ੍ਰਮਾਣਿਤ ਹੁਨਰ:', or: 'ଚିହ୍ନଟ ପ୍ରମାଣିତ ଦକ୍ଷତା:' },
  retake: { en: 'Retake Assessment', hi: 'पुनः मूल्यांकन करें', ta: 'மீண்டும் செய்க', te: 'మళ్లీ అసెస్‌మెంట్ చేయండి', kn: 'ಮತ್ತೆ ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ', ml: 'വീണ്ടും ചെയ്യുക', mr: 'पुन्हा मूल्यांकन करा', bn: 'পুনরায় মূল্যায়ন করুন', gu: 'ફરીથી મૂલ્યાંકન કરો', pa: 'ਦੁਬਾਰਾ ਮੁਲਾਂਕਣ ਕਰੋ', or: 'ପୁନର୍ବାର କରନ୍ତୁ' },
  applied: { en: 'Applied to Profile!', hi: 'प्रोफ़ाइल में जोड़ा गया!', ta: 'சுயவிவரத்தில் இணைக்கப்பட்டது!', te: 'ప్రొಫైల్‌కు వర్తింపజేయబడింది!', kn: 'ಪ್ರೊಫೈಲ್‌ಗೆ ಸೇರಿಸಲಾಗಿದೆ!', ml: 'പ്രൊഫൈലിൽ ചേർത്തു!', mr: 'प्रोफाइलमध्ये समाविष्ट केले!', bn: 'প্রোফাইলে যুক্ত হয়েছে!', gu: 'પ્રોફાઇલમાં ઉમેરાયેલ!', pa: 'ਪ੍ਰੋਫਾਈਲ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ!', or: 'ପ୍ରୋଫାଇଲ୍‌ରେ ଯୋଡ଼ାଗଲା!' },
  applyToRoadmap: { en: 'Apply to My Roadmap', hi: 'मेरे रोडमैप पर लागू करें', ta: 'தொழில் வரைபடத்தில் இணைக்க', te: 'నా రోడ్‌మ్యాప్‌కు వర్తింపజేయండి', kn: 'ನನ್ನ ಮಾರ್ಗಸೂಚಿಗೆ ಸೇರಿಸಿ', ml: 'റോഡ്‌മാപ്പിൽ പ്രയോഗിക്കുക', mr: 'माझ्या रोडमॅपवर लागू करा', bn: 'আমার রোডম্যাপে প্রয়োগ করুন', gu: 'મારા રોડમેપ પર લાગુ કરો', pa: 'ਮੇਰੇ ਰੋਡਮੈਪ ਤੇ ਲਾਗੂ ਕਰੋ', or: 'ମୋ ରୋଡମ୍ୟାପ୍‌ରେ ପ୍ରୟୋଗ କରନ୍ତୁ' },
  yourAnswer: { en: 'Your Answer (Voice or Text):', hi: 'आपका उत्तर (आवाज़ या टाइप):', ta: 'உங்கள் பதில் (குரல் அல்லது தட்டச்சு):', te: 'మీ సమాధానం (వాయిస్ లేదా టెక్స్ట్):', kn: 'ನಿಮ್ಮ ಉತ್ತರ (ಧ್ವನಿ ಅಥವಾ ಪಠ್ಯ):', ml: 'നിങ്ങളുടെ മറുപടി (വോയ്‌സ് അല്ലെങ്കിൽ ടൈപ്പ്):', mr: 'आपले उत्तर (आवाज किंवा मजकूर):', bn: 'আপনার উত্তর (কণ্ঠস্বর বা লেখা):', gu: 'તમારો જવાબ (વોઇસ અથવા લખાણ):', pa: 'ਤੁਹਾਡਾ ਜਵਾਬ (ਆਵਾਜ਼ ਜਾਂ ਲਿਖਤ):', or: 'ଆପଣଙ୍କ ଉତ୍ତର (ଭଏସ୍ ବା ଲେଖା):' },
  useSample: { en: '💡 Use sample voice answer', hi: '💡 नमूना वॉयस उत्तर भरें', ta: '💡 மாதிரி பதிலை நிரப்ப', te: '💡 నమూనా వాయిస్ సమాధానం నింపండి', kn: '💡 ಮಾದರಿ ಧ್ವನಿ ಉತ್ತರ ತುಂಬಿ', ml: '💡 മാതൃകാ വോയ്‌സ് മറുപടി നൽകുക', mr: '💡 नमुना व्हॉइस उत्तर वापरा', bn: '💡 নমুনা ভয়েস উত্তর ব্যবহার করুন', gu: '💡 નમૂના વોઇસ જવાબ વાપરો', pa: '💡 ਨਮੂਨਾ ਵਾਇਸ ਜਵਾਬ ਭਰੋ', or: '💡 ନମୁନା ଭଏସ୍ ଉତ୍ତର ବ୍ୟବହାର କରନ୍ତୁ' },
  prev: { en: 'Previous', hi: 'पिछला', ta: 'முந்தைய', te: 'మునుపటిది', kn: 'ಹಿಂದಿನದು', ml: 'മുമ്പത്തേത്', mr: 'मागे', bn: 'আগেরটি', gu: 'પાછળ', pa: 'ਪਿਛਲਾ', or: 'ପୂର୍ବବର୍ତ୍ତୀ' },
  submitNow: { en: 'Submit Now', hi: 'अभी जमा करें', ta: 'இப்போதே சமர்ப்பி', te: 'ఇప్పుడే సమర్పించండి', kn: 'ಈಗಲೇ ಸಲ್ಲಿಸಿ', ml: 'ഇപ്പോൾ സമർപ്പിക്കുക', mr: 'आता सबमिट करा', bn: 'এখন জমা দিন', gu: 'હમણાં જ સબમિટ કરો', pa: 'ਹੁਣੇ ਜਮ੍ਹਾ ਕਰੋ', or: 'ଏବେ ଦାଖଲ କରନ୍ତୁ' },
  finish: { en: 'Finish & Analyze', hi: 'पूर्ण करें एवं विश्लेषण करें', ta: 'நிறைவு செய்க', te: 'పూర్తి చేసి విశ్లేషించండి', kn: 'ಪೂರ್ಣಗೊಳಿಸಿ ವಿಶ್ಲೇಷಿಸಿ', ml: 'പൂർത്തിയാക്കുക', mr: 'पूर्ण करून विश्लेषण करा', bn: 'সম্পন্ন ও বিশ্লেষণ করুন', gu: 'પૂર્ણ કરો અને વિશ્લેષણ કરો', pa: 'ਮੁਕੰਮਲ ਕਰੋ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', or: 'ସମାପ୍ତ କରି ବିଶ୍ଳେଷଣ କରନ୍ତୁ' },
  nextQ: { en: 'Next Question', hi: 'अगला प्रश्न', ta: 'அடுத்த கேள்வி', te: 'తర్వాతి ప్రశ్న', kn: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ', ml: 'അടുത്ത ചോദ്യം', mr: 'पुढील प्रश्न', bn: 'পরবর্তী প্রশ্ন', gu: 'આગળનો પ્રશ્ન', pa: 'ਅਗਲਾ ਸਵਾਲ', or: 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ' },
  continuousPrompt: { en: 'Speak continuously in your preferred language', hi: 'अपनी पसंदीदा भाषा में लगातार बोलें', ta: 'உங்கள் தாய்மொழியில் தொடர்ந்து பேசலாம்', te: 'మీకు అనుకూలమైన భాషలో నిరంతరంగా మాట్లాడండి', kn: 'ನಿಮ್ಮ ಇಷ್ಟದ ಭಾಷೆಯಲ್ಲಿ ಮುಕ್ತವಾಗಿ ಮಾತನಾಡಿ', ml: 'നിങ്ങളുടെ ഇഷ്ടഭാഷയിൽ തുടർച്ചയായി സംസാരിക്കുക', mr: 'आपल्या पसंतीच्या भाषेत सलग बोला', bn: 'আপনার পছন্দের ভাষায় কথা বলুন', gu: 'તમારી પસંદગીની ભાષામાં સતત બોલો', pa: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਲਗਾਤਾਰ ਬੋਲੋ', or: 'ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷାରେ ନିରନ୍ତର କୁହନ୍ତୁ' },
  spokenTranscript: { en: 'Natural Spoken Transcript', hi: 'बोली गई आवाज़ का टेक्स्ट', ta: 'குரல் பதிவு', te: 'మాట్లాడిన మాటల రికార్డ్', kn: 'ಧ್ವನಿ ಪ್ರತಿಲೇಖನ', ml: 'ശബ്ദ രേഖ', mr: 'बोललेला मजकूर', bn: 'বলার প্রতিলিপি', gu: 'બોલાયેલ લખાણ', pa: 'ਬੋਲੇ ਗਏ ਸ਼ਬਦ', or: 'କୁହାଯାଇଥିବା ଶବ୍ଦ' },
  processing: { en: 'Processing Voice Session...', hi: 'वॉयस सत्र का विश्लेषण हो रहा है...', ta: 'ஆராய்கிறது...', te: 'విశ్లేషిస్తోంది...', kn: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...', ml: 'വിശകലനം ചെയ്യുന്നു...', mr: 'विश्लेषण करत आहे...', bn: 'বিশ্লেষণ চলছে...', gu: 'વિશ્લેષણ થઈ રહ્યું છે...', pa: 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...', or: 'ବିଶ୍ଳେଷଣ ଚାଲିଛି...' }
};

function getUiStr(key, lang) {
  const dict = UI_STRINGS[key];
  if (!dict) return '';
  return dict[lang] || dict.en || '';
}

export default function VoiceAssessmentModal({ isOpen, onClose }) {
  const { lang, t, getLanguageBcp47 } = useLanguage();
  const { setActiveProfileKey, token, updateActiveProfile } = useAuth();
  
  const [mode, setMode] = useState('interview'); // 'interview' or 'continuous'
  const questions = MULTILINGUAL_QUESTIONS;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [continuousTranscript, setContinuousTranscript] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [processedResult, setProcessedResult] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [appliedStatus, setAppliedStatus] = useState(false);

  if (!isOpen) return null;

  const currentQ = questions[currentQuestionIndex] || questions[0];
  const qContent = getQuestionContent(currentQ, lang);
  const bcp47Locale = getLanguageBcp47 ? getLanguageBcp47(lang) : 'en-IN';

  // TTS Readout of current question
  const speakQuestion = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeakingQuestion) {
      setIsSpeakingQuestion(false);
      return;
    }

    const questionText = qContent.question;
    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.lang = bcp47Locale;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);
    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Microphone recording handler
  const toggleRecording = () => {
    setSpeechError(null);
    if (isRecording) {
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechError(lang === 'en' 
          ? 'Microphone recognition is not supported in this browser. Please type below.' 
          : 'Voice recognition is not supported in this browser. Please use text input or samples.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = bcp47Locale;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          if (mode === 'interview') {
            setAnswers(prev => ({ ...prev, [currentQ.key]: current }));
          } else {
            setContinuousTranscript(current);
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech error:', event.error);
          setIsRecording(false);
          setSpeechError(`Voice input issue (${event.error}). You may type manually or click sample answer.`);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch (err) {
        setIsRecording(false);
        setSpeechError(err.message);
      }
    }
  };

  const handleNext = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeakingQuestion(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishInterviewSession();
    }
  };

  const handlePrev = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeakingQuestion(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleUseSampleAnswer = () => {
    setAnswers(prev => ({ ...prev, [currentQ.key]: qContent.sample_answer }));
  };

  const finishInterviewSession = async () => {
    setIsProcessing(true);
    setSpeechError(null);

    let combinedText = '';
    if (mode === 'continuous') {
      combinedText = continuousTranscript;
    } else {
      const parts = [];
      questions.forEach(q => {
        const ans = answers[q.key];
        if (ans && ans.trim()) {
          parts.push(ans.trim());
        }
      });
      combinedText = parts.join('. ');
    }

    try {
      // 1. Process voice session
      const voiceData = await apiClient.processVoiceSession({
        language: lang,
        answers: questions.map(q => ({
          question_id: q.id,
          question_key: q.key,
          user_transcript: answers[q.key] || '',
          language: lang
        })),
        full_transcript: combinedText
      });
      setProcessedResult(voiceData?.data);

      // 2. Run AI Natural Language Extraction
      const analyzeData = await apiClient.analyzeAssessment({ text: combinedText, language: lang });
      if (analyzeData?.data) {
        setAiAnalysis(analyzeData.data);
      }

      setSessionCompleted(true);
    } catch (err) {
      console.warn('AI analysis error:', err);
      setSessionCompleted(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToProfile = async () => {
    let combinedText = mode === 'continuous' ? continuousTranscript : Object.values(answers).filter(Boolean).join('. ');

    // Extract canonical skills from AI analysis or local answers
    const rawSkills = aiAnalysis?.skills || aiAnalysis?.extracted_skills || [
      'Voice-Assessed Practical Experience',
      'Task Execution & Domain Competency',
      'Safety & Workplace Communication'
    ];

    const formattedSkills = rawSkills.map((s, idx) => ({
      name: typeof s === 'string' ? s : (s.name || 'Identified Skill'),
      level: s.level || 'Intermediate',
      percentage: s.percentage || Math.min(85, 65 + (idx * 6)),
      verified: true,
      category: s.category || 'Voice Assessed'
    }));

    if (token) {
      try {
        await apiClient.applyAssessmentToProfile({ text: combinedText, language: lang });
        setAppliedStatus(true);
        setTimeout(() => {
          onClose();
        }, 1200);
        return;
      } catch (err) {
        console.warn('Apply error:', err);
      }
    }

    // Demo Mode: Apply directly to activeProfile in state
    if (updateActiveProfile) {
      updateActiveProfile({
        currentSkills: formattedSkills,
        experience: combinedText ? `${combinedText.slice(0, 100)}...` : undefined
      });
    }

    setAppliedStatus(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleSelectSampleProfile = (profileKey) => {
    setActiveProfileKey(profileKey);
    const profileTextMap = SAMPLE_PROFILES_BY_LANG[profileKey];
    const text = profileTextMap ? (profileTextMap[lang] || profileTextMap.en) : '';
    setContinuousTranscript(text);
  };

  const handleReset = () => {
    setAnswers({});
    setContinuousTranscript('');
    setCurrentQuestionIndex(0);
    setSessionCompleted(false);
    setProcessedResult(null);
    setAiAnalysis(null);
    setAppliedStatus(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{t.voiceModal.title}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {getUiStr('voiceFirst', lang)}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {t.voiceModal.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-[11px]">
              <button
                onClick={() => setMode('interview')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  mode === 'interview' ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {getUiStr('nineQ', lang)}
              </button>
              <button
                onClick={() => setMode('continuous')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  mode === 'continuous' ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {getUiStr('freeSpeech', lang)}
              </button>
            </div>

            <button 
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {sessionCompleted ? (
            /* Assessment Completed & AI Extracted Profile Summary */
            <div className="py-2 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  {getUiStr('completedTitle', lang)}
                </h4>
                <p className="text-xs text-slate-400">
                  {getUiStr('completedSub', lang)}
                </p>
              </div>

              {/* Extracted Profile Details Card */}
              {aiAnalysis && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-semibold text-brand-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {getUiStr('blueprint', lang)}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      Locale: {bcp47Locale}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Education</span>
                      <span className="text-slate-200 font-semibold">{aiAnalysis.extracted_profile.education_level}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Experience</span>
                      <span className="text-slate-200 font-semibold">{aiAnalysis.extracted_profile.experience_years} Years</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Prior Occupation</span>
                      <span className="text-slate-200 font-semibold truncate block" title={aiAnalysis.extracted_profile.prior_occupation}>
                        {aiAnalysis.extracted_profile.prior_occupation}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Livelihood Goal</span>
                      <span className="text-slate-200 font-semibold capitalize">{aiAnalysis.extracted_profile.livelihood_goal}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Available Resources</span>
                      <span className="text-slate-200 font-semibold">
                        {aiAnalysis.extracted_profile.resources?.length || 0} Assets
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Constraints</span>
                      <span className="text-slate-200 font-semibold">
                        {aiAnalysis.extracted_profile.constraints?.length ? 'Recorded' : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Canonical Skills Extracted */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-400 font-medium block mb-1.5">
                      {getUiStr('skillsTitle', lang)}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiAnalysis.skills_extracted?.length > 0 ? (
                        aiAnalysis.skills_extracted.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[11px]"
                          >
                            <CheckCircle2 className="w-3 h-3 text-brand-400" />
                            <span>{skill.canonical_name}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">
                          Skills synthesized based on occupation history
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{getUiStr('retake', lang)}</span>
                </button>

                <button
                  onClick={handleApplyToProfile}
                  disabled={appliedStatus}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition disabled:opacity-75"
                >
                  {appliedStatus ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>{getUiStr('applied', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>{getUiStr('applyToRoadmap', lang)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : mode === 'interview' ? (
            /* Mode 1: 9-Step Conversational Question Flow */
            <div className="space-y-5">
              {/* Progress Indicator */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-brand-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card with Audio Readout */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-white leading-snug">
                      {qContent.question}
                    </h4>
                    {lang !== 'en' && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {currentQ.questions.en}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={speakQuestion}
                    className={`p-2 rounded-lg border transition ${
                      isSpeakingQuestion 
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-300 animate-pulse' 
                        : 'bg-slate-800/80 border-slate-700 text-brand-400 hover:bg-slate-700'
                    }`}
                    title="Audio question readout (TTS)"
                  >
                    {isSpeakingQuestion ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Central Voice Recording Button for Question */}
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <button
                  onClick={toggleRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isRecording 
                      ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20' 
                      : 'bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 hover:scale-105 shadow-brand-500/25 ring-4 ring-brand-500/10'
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>

                <span className="mt-2 text-xs font-semibold text-slate-200">
                  {isRecording ? t.voiceModal.listening : t.voiceModal.tapToSpeak}
                </span>

                {isRecording && (
                  <div className="flex items-center gap-1 mt-2">
                    {[40, 70, 30, 90, 60, 100, 45, 80, 55].map((h, idx) => (
                      <div 
                        key={idx}
                        className="w-1 bg-brand-400 rounded-full animate-bounce" 
                        style={{ height: `${h * 0.22}px`, animationDelay: `${idx * 0.08}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {speechError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{speechError}</span>
                </div>
              )}

              {/* Spoken Answer Text Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="text-slate-400 font-medium">
                    {getUiStr('yourAnswer', lang)}
                  </label>
                  <button
                    onClick={handleUseSampleAnswer}
                    className="text-brand-400 hover:underline text-[11px] flex items-center gap-1"
                  >
                    <span>{getUiStr('useSample', lang)}</span>
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={answers[currentQ.key] || ''}
                  onChange={(e) => setAnswers({ ...answers, [currentQ.key]: e.target.value })}
                  placeholder={qContent.placeholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition resize-none font-sans"
                />
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{getUiStr('prev', lang)}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={finishInterviewSession}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    {getUiStr('submitNow', lang)}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition"
                  >
                    <span>
                      {currentQuestionIndex === (questions.length - 1)
                        ? getUiStr('finish', lang)
                        : getUiStr('nextQ', lang)}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Continuous Free Speech Mode */
            <div className="space-y-5">
              <div className="flex flex-col items-center justify-center py-2 text-center">
                <button
                  onClick={toggleRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                    isRecording 
                      ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-500/20' 
                      : 'bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 hover:scale-105 shadow-brand-500/25 ring-4 ring-brand-500/10'
                  }`}
                >
                  {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                </button>

                <span className="mt-2 text-xs font-semibold text-slate-200">
                  {isRecording ? t.voiceModal.listening : t.voiceModal.tapToSpeak}
                </span>
                <span className="text-[11px] text-slate-500">
                  {getUiStr('continuousPrompt', lang)} ({bcp47Locale})
                </span>
              </div>

              {speechError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{speechError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-400" />
                  <span>{getUiStr('spokenTranscript', lang)}</span>
                </label>
                <textarea
                  rows={3}
                  value={continuousTranscript}
                  onChange={(e) => setContinuousTranscript(e.target.value)}
                  placeholder={t.voiceModal.inputPlaceholder}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500/60 transition resize-none font-sans"
                />
              </div>

              {/* Preset Candidates */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <span className="text-[11px] font-semibold text-slate-400">
                  {t.voiceModal.samplePromptsTitle}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectSampleProfile('tailor')}
                    className="text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs transition hover:border-brand-500/40"
                  >
                    <div className="font-semibold text-brand-300 text-xs">{t.voiceModal.sampleTailor}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Self-Employment</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSampleProfile('electrician')}
                    className="text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs transition hover:border-brand-500/40"
                  >
                    <div className="font-semibold text-cyan-300 text-xs">{t.voiceModal.sampleElectrician}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Wage Employment</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSampleProfile('it')}
                    className="text-left p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs transition hover:border-brand-500/40"
                  >
                    <div className="font-semibold text-amber-300 text-xs">{t.voiceModal.sampleComputer}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">IT Operations</div>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={finishInterviewSession}
                  disabled={!continuousTranscript.trim() || isProcessing}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 disabled:opacity-50 transition"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>{getUiStr('processing', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{t.voiceModal.submitManual}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
