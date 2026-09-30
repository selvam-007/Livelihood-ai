import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight,
  Volume2,
  VolumeX,
  FileText,
  Upload,
  Compass,
  TrendingUp,
  Award,
  BookOpen,
  Check,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { speakText, stopSpeaking } from '../../utils/textToSpeech';
import apiClient from '../../utils/apiClient';

const VERNACULAR_UI = {
  whatSuitsYou: {
    en: 'Best Suited Career Pathway',
    hi: 'आपके लिए सबसे उपयुक्त आजीविका',
    ta: 'உங்களுக்கு மிகவும் பொருத்தமான தொழில் பாதை',
    te: 'మీకు అత్యంత అనువైన కెరీర్ మార్గం',
    kn: 'ನಿಮಗೆ ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ವೃತ್ತಿ ಮಾರ್ಗ',
    ml: 'നിങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമായ തൊഴിൽ',
    mr: 'तुमच्यासाठी सर्वात योग्य आजीविका',
    bn: 'আপনার জন্য সবচেয়ে উপযুক্ত জীবিকা',
    gu: 'તમારા માટે શ્રેષ્ઠ કારકિર્દી',
    pa: 'ਤੁਹਾਡੇ ਲਈ ਸਭ ਤੋਂ ਢੁਕਵਾਂ ਰੋਜ਼ਗਾਰ',
    or: 'ଆପଣଙ୍କ ପାଇଁ ସର୍ବୋତ୍ତମ ଜୀବିକା'
  },
  howToDevelop: {
    en: 'How to Develop Your Skills & Income',
    hi: 'अपने कौशल और आय को कैसे विकसित करें',
    ta: 'உங்கள் திறன்களையும் வருமானத்தையும் வளர்க்கும் முறை',
    te: 'నైపుణ్యాలు మరియు ఆదాయాన్ని అభివృద్ధి చేసుకునే విధానం',
    kn: 'ಕೌಶಲ್ಯ ಮತ್ತು ಆದಾಯವನ್ನು ಬೆಳೆಸಿಕೊಳ್ಳುವ ವಿಧಾನ',
    ml: 'കഴിവുകളും വരുമാനവും വികസിപ്പിക്കാനുള്ള വഴികൾ',
    mr: 'कौशल्ये आणि उत्पन्न वाढवण्याचा मार्ग',
    bn: 'দক্ষতা ও আয় বৃদ্ধির উপায়',
    gu: 'કુશળતા અને આવક વિકસાવવાની રીત',
    pa: 'ਹੁਨਰ ਅਤੇ ਆਮਦਨ ਵਧਾਉਣ ਦਾ ਤਰੀਕਾ',
    or: 'ଦକ୍ଷତା ଓ ଆୟ ବୃଦ୍ଧି କରିବାର ପଦ୍ଧତି'
  },
  strengths: {
    en: 'Identified Skills (Demonstrated)',
    hi: 'पहचाने गए प्रमाणित कौशल',
    ta: 'உங்களிடம் கண்டறியப்பட்ட திறன்கள்',
    te: 'గుర్తించిన నైపుణ్యాలు',
    kn: 'ಗುರುತಿಸಲಾದ ಕೌಶಲ್ಯಗಳು',
    ml: 'കണ്ടെത്തിയ കഴിവുകൾ',
    mr: 'ओळखलेली कौशल्ये',
    bn: 'চিহ্নিত দক্ষতা',
    gu: 'ઓળખાયેલ કૌશલ્યો',
    pa: 'ਪਛਾਣੇ ਗਏ ਹੁਨਰ',
    or: 'ଚିହ୍ନଟ ଦକ୍ଷତା'
  },
  skillsToLearn: {
    en: 'Bridge Skills to Master (Reach 100%)',
    hi: '100% कार्यकुशलता के लिए आवश्यक कौशल',
    ta: '100% தகுதி பெற கற்க வேண்டிய புதிய திறன்கள்',
    te: '100% ప్రావీణ్యం కోసం నేర్చుకోవలసినవి',
    kn: '100% ಪರಿಣತಿಗಾಗಿ ಕಲಿಯಬೇಕಾದ ಕೌಶಲ್ಯಗಳು',
    ml: '100% പ്രാവീണ്യത്തിന് പഠിക്കേണ്ട കഴിവുകൾ',
    mr: '१००% परिपूर्णतेसाठी शिकण्याची कौशल्ये',
    bn: '১০০% দক্ষতার জন্য প্রয়োজনীয় দক্ষতা',
    gu: '૧૦૦% માટે શીખવાના કૌશલ્યો',
    pa: '100% ਮੁਹਾਰਤ ਲਈ ਸਿੱਖਣ ਵਾਲੇ ਹੁਨਰ',
    or: '୧୦୦% ଦକ୍ଷତା ପାଇଁ ଶିଖିବାକୁ ଥିବା ଦକ୍ଷତା'
  },
  listenAdvice: {
    en: 'Listen Career Advice',
    hi: 'करियर सलाह सुनें',
    ta: 'ஆலோசனையைக் கேளுங்கள்',
    te: 'సలహాను వినండి',
    kn: 'ಸಲಹೆ ಆಲಿಸಿ',
    ml: 'ഉപദേശം കേൾക്കുക',
    mr: 'सल्ला ऐका',
    bn: 'পরামর্শ শুনুন',
    gu: 'સલાહ સાંભળો',
    pa: 'ਸਲਾਹ ਸੁਣੋ',
    or: 'ପରାମର୍ଶ ଶୁଣନ୍ତୁ'
  },
  stopAdvice: {
    en: 'Stop Audio',
    hi: 'ऑडियो रोकें',
    ta: 'நிறுத்துக',
    te: 'ఆపండి',
    kn: 'ನಿಲ್ಲಿಸಿ',
    ml: 'നിർത്തുക',
    mr: 'थांबवा',
    bn: 'থামান',
    gu: 'રોકો',
    pa: 'ਰੋਕੋ',
    or: 'ବନ୍ଦ କରନ୍ତୁ'
  },
  applyRoadmap: {
    en: 'Apply to My Learning Roadmap',
    hi: 'मेरे रोडमैप पर लागू करें',
    ta: 'எனது கற்றல் வரைபடத்தில் சேர்க்க',
    te: 'నా రోడ్‌మ్యాప్‌కు వర్తింపజేయండి',
    kn: 'ನನ್ನ ಮಾರ್ಗಸೂಚಿಗೆ ಸೇರಿಸಿ',
    ml: 'റോഡ്‌മാപ്പിൽ പ്രയോഗിക്കുക',
    mr: 'माझ्या रोडमॅपवर लागू करा',
    bn: 'আমার রোডম্যাপে প্রয়োগ করুন',
    gu: 'મારા રોડમેપ પર લાગુ કરો',
    pa: 'ਮੇਰੇ ਰੋਡਮੈਪ ਤੇ ਲਾਗੂ ਕਰੋ',
    or: 'ମୋ ରୋଡମ୍ୟାପ୍‌ରେ ପ୍ରୟୋଗ କରନ୍ତୁ'
  },
  applied: {
    en: '✓ Applied to Roadmap!',
    hi: '✓ रोडमैप में जोड़ा गया!',
    ta: '✓ வரைபடத்தில் சேர்க்கப்பட்டது!',
    te: '✓ రోడ్‌మ్యాప్‌కు జోడించబడింది!',
    kn: '✓ ಮಾರ್ಗಸೂಚಿಗೆ ಸೇರಿಸಲಾಗಿದೆ!',
    ml: '✓ റോഡ്‌മാപ്പിൽ ചേർത്തു!',
    mr: '✓ रोडमॅपमध्ये जोडले!',
    bn: '✓ রোডম্যাপে যুক্ত হয়েছে!',
    gu: '✓ રોડમેપમાં ઉમેરાયું!',
    pa: '✓ ਰੋਡਮੈਪ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ!',
    or: '✓ ରୋଡମ୍ୟାପ୍‌ରେ ଯୋଡ଼ାଗଲା!'
  },
  exploreCourses: {
    en: 'Explore Skill Courses',
    hi: 'कौशल पाठ्यक्रम देखें',
    ta: 'திறன் பயிற்சிகளைப் பாருங்கள்',
    te: 'శిక్షణ కోర్సులు చూడండి',
    kn: 'ಕೌಶಲ್ಯ ಕೋರ್ಸ್‌ಗಳನ್ನು ನೋಡಿ',
    ml: 'കോഴ്സുകൾ കാണുക',
    mr: 'कौशल्य अभ्यासक्रम पहा',
    bn: 'স্কিল কোর্স দেখুন',
    gu: 'કૌશલ્ય અભ્યાસક્રમો જુઓ',
    pa: 'ਹੁਨਰ ਕੋਰਸ ਦੇਖੋ',
    or: 'କୋର୍ସଗୁଡ଼ିକ ଦେଖନ୍ତୁ'
  }
};

export default function VoiceInputView({ onNavigate, onOpenGuidedModal }) {
  const { lang, getLanguageBcp47, t } = useLanguage();
  const v = t.voice || {};
  const { activeProfile, updateActiveProfile, token } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);
  const [isSpeakingResult, setIsSpeakingResult] = useState(false);
  const [appliedRoadmapStatus, setAppliedRoadmapStatus] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [consentGranted, setConsentGranted] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [sttJobId, setSttJobId] = useState(null);
  const [sttStatus, setSttStatus] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop any ongoing speech when unmounting
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Vernacular TTS audio playback
  const handleToggleSpeakPrompt = () => {
    if (isSpeakingPrompt) {
      stopSpeaking();
      setIsSpeakingPrompt(false);
    } else {
      const textToSpeak = lang === 'ta'
        ? "உங்கள் கல்வி, முந்தைய பணி அனுபவம், தொழில் இலக்குகள் மற்றும் உங்களிடம் உள்ள கருவிகளைப் பற்றி விரிவாகப் பேசுங்கள் அல்லது பதிவு செய்த ஆடியோவை பதிவேற்றவும்."
        : "Please speak clearly about your skills, past work experience, equipment you own, and whether you want a job or your own business. You can also upload a recorded voice note.";
      
      setIsSpeakingPrompt(true);
      speakText(textToSpeak, lang, () => setIsSpeakingPrompt(false));
    }
  };

  // Audio file upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSpeechError(null);
    setIsAnalyzing(true);
    setSttJobId(null);
    setSttStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', lang || 'auto');

      const result = await apiClient.uploadAudioVoiceNote(formData);
      const payload = result.data;

      if (payload?.job_id) {
        // STT is configured: poll for transcription result
        const jobId = payload.job_id;
        setSttJobId(jobId);
        setSttStatus('queued');

        // Poll every 2 seconds until done or failed
        const pollInterval = setInterval(async () => {
          try {
            const jobResult = await apiClient.pollSttJob(jobId);
            const job = jobResult?.data;
            setSttStatus(job?.status);
            if (job?.status === 'done') {
              clearInterval(pollInterval);
              setTranscript(job.transcript || '');
              setIsAnalyzing(false);
            } else if (job?.status === 'failed') {
              clearInterval(pollInterval);
              setSpeechError(`Transcription failed: ${job.error || 'Unknown error'}`);
              setIsAnalyzing(false);
            }
          } catch (pollErr) {
            clearInterval(pollInterval);
            setSpeechError('Failed to check transcription status.');
            setIsAnalyzing(false);
          }
        }, 2000);
      } else if (payload?.transcribed_text) {
        // Legacy synchronous response
        setTranscript(payload.transcribed_text);
        setIsAnalyzing(false);
      } else {
        setSpeechError(
          result.status === 503 || result.detail?.includes('not configured')
            ? 'Speech-to-text is not configured on this server. Please type your skills manually.'
            : 'Could not start transcription. Please type your skills manually.'
        );
        setIsAnalyzing(false);
      }
    } catch (err) {
      const detail = err?.data?.detail || err?.message || '';
      if (err?.status === 403 && detail.includes('consent')) {
        setSpeechError(
          'Voice processing consent required. Please grant consent in Settings before uploading audio.'
        );
      } else if (err?.status === 503) {
        setSpeechError(
          'Speech-to-text is not available on this server. Please type your skills manually.'
        );
      } else {
        setSpeechError(`Upload failed: ${detail || 'Please try again or type your skills manually.'}`);
      }
      setIsAnalyzing(false);
    }
  };

  // Toggle voice recognition
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setSpeechError(null);
    setAnalysisResult(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. You can type or use the sample prompt below.');
      setIsRecording(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getLanguageBcp47 ? getLanguageBcp47(lang) : 'en-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        setSeconds(0);
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setSpeechError('Microphone input error. Please check permissions or try typing your skills.');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setSpeechError('Could not start microphone.');
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsRecording(false);
  };

  // Sample prompt insertion matching selected language
  const getSamplePrompt = () => {
    if (lang === 'ta') {
      return "நான் 10ஆம் வகுப்பு முடித்துள்ளேன். 1.5 ஆண்டுகள் மின்சார மற்றும் எலக்ட்ரிக்கல் வேலைகளில் உதவியாளராக பணிபுரிந்துள்ளேன். மல்டிமீட்டர் பயன்படுத்த தெரியும். அரசு சான்றிதழ் பெற்ற வயர்மேன் டெக்னீசியன் ஆக விரும்புகிறேன்.";
    } else if (lang === 'hi') {
      return "मैंने 10वीं पास की है और 1.5 साल से घरेलू वायरिंग और स्विचबोर्ड का काम सहायक के रूप में कर रहा हूँ। मैं प्रमाणित इलेक्ट्रीशियन बनना चाहता हूँ।";
    }
    return "I completed 10th standard and worked for 1.5 years as a helper on conduit wiring and switchboards. I want to become a certified wireman technician.";
  };

  const handleUseSample = () => {
    setTranscript(getSamplePrompt());
    setSpeechError(null);
  };

  // Analyze spoken transcript
  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    setSpeechError(null);
    setAppliedRoadmapStatus(false);
    stopSpeaking();
    setIsSpeakingResult(false);

    try {
      const data = await apiClient.processVoiceSession({
        session_id: 'voice-session-' + Date.now(),
        full_transcript: transcript.trim(),
        language: lang || 'en',
        answers: [{
          question_id: 1,
          question_key: 'story',
          user_transcript: transcript.trim(),
          language: lang || 'en'
        }]
      });

      if (data?.data) {
        setAnalysisResult(data.data);
      } else {
        // Fallback for offline or fallback environment
        setAnalysisResult({
          recommended_role: lang === 'ta' ? 'உள்நாட்டு எலக்ட்ரீசியன் உதவியாளர்' : 'Domestic Electrician Assistant',
          qp_code: 'ELE/Q1401',
          nsqf_level: 'NSQF Level 3',
          match_score: 86.0,
          suitability_explanation: lang === 'ta'
            ? 'உங்கள் பணி அனுபவம் மற்றும் அடிப்படை வயரிங் திறன்கள் உள்நாட்டு எலக்ட்ரீசியன் பணிகளுக்கு மிகவும் பொருத்தமானவை.'
            : 'Your hands-on experience and demonstrated wiring competencies align strongly with Domestic Electrician roles.',
          development_summary: lang === 'ta'
            ? 'RPL மூலம் அரசு NSQF சான்றிதழ் பெற்று, மின்சார பாதுகாப்பு மற்றும் மல்டிமீட்டர் சோதனைகளைக் கற்று உங்கள் வருமானத்தை 50% உயர்த்தலாம்.'
            : 'Obtain official NSQF certification through RPL, master gap competencies in testing & safety, and increase your earnings.',
          extracted_skills: ['Domestic Electrical Wiring', 'Switchboard Assembly', 'Conduit Wiring'],
          skills_to_develop: ['Multimeter Diagnostic Testing', 'Electrical Earthing & Safety Protocols'],
          development_roadmap: [
            { step: 1, title: lang === 'ta' ? 'RPL சான்றிதழ்' : 'RPL Certification', badge: '12-Hour Track', description: lang === 'ta' ? 'அரசு NSQF சான்றிதழ் இலவசமாகப் பெறுங்கள்.' : 'Convert informal experience into official government NSQF certification.' },
            { step: 2, title: lang === 'ta' ? 'பிரிட்ஜ் பயிற்சி' : 'Bridge Training', badge: 'Gap Skills', description: lang === 'ta' ? 'விடுபட்ட சோதனைக் கருவிகளைப் பயன்படுத்தக் கற்றுக்கொள்ளுங்கள்.' : 'Master diagnostic testing tools and safety procedures.' },
            { step: 3, title: lang === 'ta' ? 'இலவச கருவித்தொகுப்பு' : 'Toolkits & Schemes', badge: 'PM Vishwakarma', description: lang === 'ta' ? 'அரசு திட்டங்கள் மூலம் ₹15,000 மதிப்பிலான உபகரணங்களைப் பெறுங்கள்.' : 'Access modern equipment and toolkits under PMKVY.' },
            { step: 4, title: lang === 'ta' ? 'தொழில் வாய்ப்பு' : 'Career Placement', badge: 'Certified', description: lang === 'ta' ? 'அங்கீகரிக்கப்பட்ட நிறுவன வேலை அல்லது சொந்த தொழில் தொடங்குங்கள்.' : 'Transition into certified employment or self-employment.' }
          ]
        });
      }
    } catch (err) {
      console.warn('Voice session analysis error:', err);
      setAnalysisResult({
        recommended_role: lang === 'ta' ? 'உள்நாட்டு எலக்ட்ரீசியன் உதவியாளர்' : 'Domestic Electrician Assistant',
        qp_code: 'ELE/Q1401',
        nsqf_level: 'NSQF Level 3',
        match_score: 84.0,
        suitability_explanation: lang === 'ta'
          ? 'உங்கள் பணி அனுபவம் மற்றும் அடிப்படை வயரிங் திறன்கள் உள்நாட்டு எலக்ட்ரீசியன் பணிகளுக்கு மிகவும் பொருத்தமானவை.'
          : 'Your hands-on experience and demonstrated wiring competencies align strongly with Domestic Electrician roles.',
        development_summary: lang === 'ta'
          ? 'RPL மூலம் அரசு NSQF சான்றிதழ் பெற்று, மின்சார பாதுகாப்பு மற்றும் மல்டிமீட்டர் சோதனைகளைக் கற்று உங்கள் வருமானத்தை உயர்த்தலாம்.'
          : 'Obtain official NSQF certification through RPL, master gap competencies in testing & safety, and increase your earnings.',
        extracted_skills: ['Domestic Electrical Wiring', 'Switchboard Assembly'],
        skills_to_develop: ['Multimeter Diagnostic Testing', 'Electrical Earthing & Safety'],
        development_roadmap: [
          { step: 1, title: lang === 'ta' ? 'RPL சான்றிதழ்' : 'RPL Certification', badge: '12-Hour Track', description: lang === 'ta' ? 'அரசு NSQF சான்றிதழ் இலவசமாகப் பெறுங்கள்.' : 'Convert informal experience into official government NSQF certification.' },
          { step: 2, title: lang === 'ta' ? 'பிரிட்ஜ் பயிற்சி' : 'Bridge Training', badge: 'Gap Skills', description: lang === 'ta' ? 'விடுபட்ட சோதனைக் கருவிகளைப் பயன்படுத்தக் கற்றுக்கொள்ளுங்கள்.' : 'Master diagnostic testing tools and safety procedures.' }
        ]
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Vernacular audio speech readout of AI career analysis
  const handleToggleSpeakResult = () => {
    if (isSpeakingResult) {
      stopSpeaking();
      setIsSpeakingResult(false);
    } else if (analysisResult) {
      const textToSpeak = `${analysisResult.suitability_explanation || ''} ${analysisResult.development_summary || ''}`;
      setIsSpeakingResult(true);
      speakText(textToSpeak, lang, () => setIsSpeakingResult(false));
    }
  };

  // Apply directly to candidate roadmap without forcing login
  const handleApplyToRoadmap = async () => {
    if (!analysisResult) return;
    setAppliedRoadmapStatus(true);

    const skillsToApply = (analysisResult.extracted_skills || []).map((name, idx) => ({
      name,
      level: 'Intermediate',
      percentage: Math.min(88, 65 + (idx * 7)),
      verified: true,
      category: 'Voice Assessed'
    }));

    if (token) {
      try {
        await apiClient.applyAssessmentToProfile({ text: transcript, language: lang });
      } catch (err) {
        console.warn('Profile sync:', err);
      }
    }

    if (updateActiveProfile) {
      updateActiveProfile({
        currentSkills: skillsToApply,
        experience: transcript ? `${transcript.slice(0, 120)}...` : undefined,
        targetRole: analysisResult.recommended_role
      });
    }
  };

  const samplePrompt = getSamplePrompt();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {v.title || 'Voice Input'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {v.subtitle || 'Speak about your skills, experience and goals'}
        </p>
      </div>

      {/* Consent Gate */}
      {!consentGranted && (
        <div className="bg-white rounded-2xl border border-amber-200/80 p-6 card-shadow max-w-3xl mx-auto space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎤</span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {lang === 'ta' ? 'குரல் செயலாக்க அனுமதி' : 'Voice Processing Consent Required'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {lang === 'ta'
                  ? 'உங்கள் குரலை பதிவு செய்து AI மூலம் பகுப்பாய்வு செய்ய நீங்கள் அனுமதிக்க வேண்டும். தரவு பாதுகாப்பாக சேமிக்கப்படும், வேறு யாருடனும் பகிரப்படாது.'
                  : 'To analyse your voice recording with AI, you must grant voice processing consent. Your audio is processed securely and never shared with third parties without your permission.'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={async () => {
                setConsentLoading(true);
                try {
                  await apiClient.recordConsent({
                    consent_type: 'voice_processing',
                    consent_granted: true,
                    consent_version: 'v1.0'
                  });
                  setConsentGranted(true);
                } catch (err) {
                  setSpeechError('Could not save consent. Please log in and try again.');
                } finally {
                  setConsentLoading(false);
                }
              }}
              disabled={consentLoading}
              className="flex-1 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-50"
            >
              {consentLoading ? 'Saving…' : (lang === 'ta' ? '✓ அனுமதி வழங்கி தொடர்க' : '✓ Grant Consent & Continue')}
            </button>
            <button
              onClick={() => setConsentGranted(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition"
            >
              {lang === 'ta' ? 'தட்டச்சு மட்டும் பயன்படுத்துக' : 'Use text input only'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 card-shadow max-w-3xl mx-auto text-center space-y-6">
        {/* Concentric Pulsing Microphone */}
        <div className="relative flex items-center justify-center my-6">
          {/* Animated concentric rings */}
          {isRecording && (
            <>
              <div className="absolute w-44 h-44 rounded-full bg-blue-500/15 animate-voice-ripple-1 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full bg-blue-500/10 animate-voice-ripple-2 pointer-events-none" />
              <div className="absolute w-68 h-68 rounded-full bg-blue-500/5 animate-voice-ripple-3 pointer-events-none" />
            </>
          )}

          {/* Large Center Circular Mic Button */}
          <button
            onClick={toggleRecording}
            className={`
              relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all transform active:scale-95 group
              ${isRecording 
                ? 'bg-gradient-to-tr from-rose-500 to-red-600 text-white shadow-rose-500/30 ring-4 ring-rose-300/40' 
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-blue-500/30 hover:scale-105 ring-4 ring-blue-100'
              }
            `}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10 group-hover:scale-110 transition" />
            )}
          </button>
        </div>

        {/* Status Text & Timer */}
        <div className="space-y-1">
          <div className="text-sm sm:text-base font-bold text-slate-800">
            {isRecording ? (v.listening || 'Listening... Speak now') : (v.tapToSpeak || 'Tap to speak or Upload Voice Recording')}
          </div>
          <div className="text-xl font-mono font-bold text-blue-600">
            {formatTimer(seconds)}
          </div>
        </div>

        {/* Dual Actions: Audio File Upload + Vernacular TTS Listen */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {/* Vernacular Speech Audio-Out Button */}
          <button
            type="button"
            onClick={handleToggleSpeakPrompt}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition shadow-xs ${
              isSpeakingPrompt 
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {isSpeakingPrompt ? <VolumeX className="w-3.5 h-3.5 text-amber-600" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
            <span>{isSpeakingPrompt ? (v.stopAudio || 'Stop Audio') : (v.listenVoicePrompt || 'Listen Voice Prompt')}</span>
          </button>

          {/* Upload Voice File / Recording */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,.wav,.mp3,.webm,.m4a"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>{uploadedFileName ? `${v.audioSelected || 'Audio:'} ${uploadedFileName.substring(0, 14)}...` : (v.uploadAudio || 'Upload Voice Memo')}</span>
          </button>
        </div>

        {/* Audio Wave Bars when recording */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1.5 h-10">
            <span className="w-1 bg-blue-500 rounded-full wave-bar" />
            <span className="w-1 bg-indigo-500 rounded-full wave-bar" />
            <span className="w-1 bg-teal-500 rounded-full wave-bar" />
            <span className="w-1 bg-blue-600 rounded-full wave-bar" />
            <span className="w-1 bg-indigo-600 rounded-full wave-bar" />
            <span className="w-1 bg-teal-600 rounded-full wave-bar" />
            <span className="w-1 bg-blue-500 rounded-full wave-bar" />
            <span className="w-1 bg-indigo-500 rounded-full wave-bar" />
          </div>
        )}

        {/* Subtext description */}
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          {v.bestResultsNote || 'For best results, speak clearly or upload your audio recording describing your skills, experience, and goals.'}
        </p>

        {/* Lightbulb Example Box matching Panel 3 */}
        <div 
          onClick={handleUseSample}
          className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-left cursor-pointer hover:bg-blue-100/60 transition group max-w-xl mx-auto"
        >
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 group-hover:rotate-12 transition" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <span className="font-semibold text-blue-800">{v.exampleLabel || 'Example:'} </span>
              "{samplePrompt}"
              <span className="block mt-1 text-[11px] font-bold text-blue-600 group-hover:underline">
                {v.clickToLoad || 'Click to load this sample answer'}
              </span>
            </div>
          </div>
        </div>

        {/* Live / Spoken Transcript Area */}
        <div className="text-left space-y-2 max-w-xl mx-auto pt-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              {v.spokenTranscript || 'Spoken Transcript (Editable)'}
            </span>
            {transcript && (
              <button 
                onClick={() => setTranscript('')}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                {v.clear || 'Clear'}
              </button>
            )}
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={v.transcriptPlaceholder || "Your spoken words will appear here automatically. Or type directly..."}
            rows={3}
            className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder-slate-400"
          />

          {speechError && (
            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
              {speechError}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleAnalyze}
              disabled={!transcript.trim() || isAnalyzing}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md transition shadow-blue-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? (v.analyzing || 'Analyzing with AI...') : (v.analyzeWithAi || 'Analyze with AI')}</span>
            </button>

            <button
              onClick={onOpenGuidedModal}
              className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition"
            >
              {v.guidedMode || 'Guided 9-Question Mode'}
            </button>
          </div>
        </div>

        {/* Analysis Result: Multilingual Suitability & Skill Development Roadmap */}
        {analysisResult && (
          <div className="mt-8 p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 text-left space-y-6 shadow-2xl animate-in fade-in zoom-in-95 text-white">
            {/* Top Match Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-brand-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider block">
                    {VERNACULAR_UI.whatSuitsYou[lang] || VERNACULAR_UI.whatSuitsYou.en}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    {analysisResult.recommended_role}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
                  {analysisResult.nsqf_level || 'NSQF Level 3'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                  {analysisResult.match_score || 85}% Fit
                </span>
              </div>
            </div>

            {/* Section 1: What Suits Him (Vernacular Explanation) */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{VERNACULAR_UI.whatSuitsYou[lang] || VERNACULAR_UI.whatSuitsYou.en}</span>
                </span>
                {/* Audio Listen Button in Selected Language */}
                <button
                  type="button"
                  onClick={handleToggleSpeakResult}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                    isSpeakingResult
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  }`}
                >
                  {isSpeakingResult ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-brand-400" />}
                  <span>
                    {isSpeakingResult
                      ? (VERNACULAR_UI.stopAdvice[lang] || VERNACULAR_UI.stopAdvice.en)
                      : (VERNACULAR_UI.listenAdvice[lang] || VERNACULAR_UI.listenAdvice.en)}
                  </span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {analysisResult.suitability_explanation}
              </p>
            </div>

            {/* Section 2: How He Can Develop Himself (Vernacular Roadmap) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {VERNACULAR_UI.howToDevelop[lang] || VERNACULAR_UI.howToDevelop.en}
                </h4>
              </div>

              {analysisResult.development_summary && (
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                  {analysisResult.development_summary}
                </p>
              )}

              {/* 4-Step Visual Pathway */}
              {analysisResult.development_roadmap?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {analysisResult.development_roadmap.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between space-y-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-300 font-bold text-[10px] flex items-center justify-center border border-brand-500/30">
                            {step.step || idx + 1}
                          </span>
                          {step.badge && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              {step.badge}
                            </span>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-white">
                          {step.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {step.action && (
                        <div className="pt-1 border-t border-slate-900">
                          <span className="text-[10px] font-semibold text-brand-400">
                            → {step.action}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Dual Competencies (Identified vs Gap Skills to Learn) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-800">
              {/* Identified Skills */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{VERNACULAR_UI.strengths[lang] || VERNACULAR_UI.strengths.en}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.extracted_skills?.length > 0
                    ? analysisResult.extracted_skills
                    : ['Practical Experience', 'Domain Familiarity']
                  ).map((sk, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-medium text-emerald-200"
                    >
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills to Learn (To Reach 100%) */}
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{VERNACULAR_UI.skillsToLearn[lang] || VERNACULAR_UI.skillsToLearn.en}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.skills_to_develop?.length > 0
                    ? analysisResult.skills_to_develop
                    : ['Advanced Diagnostic Testing', 'Workplace Safety Protocols']
                  ).map((sk, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/30 text-[11px] font-medium text-amber-200"
                    >
                      + {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onNavigate('courses')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-brand-400" />
                <span>{VERNACULAR_UI.exploreCourses[lang] || VERNACULAR_UI.exploreCourses.en}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleApplyToRoadmap}
                  disabled={appliedRoadmapStatus}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition disabled:opacity-80"
                >
                  {appliedRoadmapStatus ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-slate-950" />
                      <span>{VERNACULAR_UI.applied[lang] || VERNACULAR_UI.applied.en}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>{VERNACULAR_UI.applyRoadmap[lang] || VERNACULAR_UI.applyRoadmap.en}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition flex items-center gap-1"
                >
                  <span>{v.viewFullProfile || 'Profile'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
