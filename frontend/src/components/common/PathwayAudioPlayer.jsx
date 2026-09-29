import React, { useState, useEffect } from 'react';
import { Volume2, Square, VolumeX, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/textToSpeech';
import { useLanguage } from '../../context/LanguageContext';

export default function PathwayAudioPlayer({
  pathway,
  className = '',
  buttonSize = 'default', // 'large' | 'default' | 'compact'
}) {
  const { lang, currentLanguage, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setHasSpeechSupport(false);
    }
  }, []);

  // Stop playback when language changes or unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [lang]);

  if (!hasSpeechSupport || !pathway) return null;

  // Build natural vernacular script for the pathway
  const buildPathwaySpeechScript = () => {
    const title = pathway.title || pathway.job_role || 'Recommended Career Pathway';
    const nsqf = pathway.nsqf_level || pathway.nsqfLevel || 'NSQF Level 5';
    const match = pathway.match_score || pathway.matchScore || 88;
    const council = pathway.council || pathway.sector || '';
    const action = pathway.next_action || pathway.nextAction || pathway.action || 'Enroll in foundational training';

    if (lang === 'hi') {
      return `आपकी अनुशंसित आजीविका राह है: ${title}। यह ${nsqf} स्तर की योग्यता है, जिसका मिलान स्कोर ${match} प्रतिशत है। ${council ? `कौशल परिषद: ${council}।` : ''} आपका अगला अनुशंसित कदम है: ${action}।`;
    }
    if (lang === 'ta') {
      return `உங்களுக்கான பரிந்துரைக்கப்பட்ட தொழில் பாதை: ${title}. இது ${nsqf} தகுதி நிலை மற்றும் ${match} சதவீத பொருத்தம் கொண்டது. ${council ? `துறை: ${council}.` : ''} உங்கள் அடுத்த உடனடி நடவடிக்கை: ${action}.`;
    }
    if (lang === 'te') {
      return `మీకు సిఫార్సు చేయబడిన జీవనోపాధి మార్గం: ${title}. ఇది ${nsqf} మరియు ${match} శాతం సరిపోతుంది. తదుపరి చర్య: ${action}.`;
    }
    if (lang === 'kn') {
      return `ನಿಮ್ಮ ಶಿಫಾರಸು ಮಾಡಿದ ವೃತ್ತಿ ಮಾರ್ಗ: ${title}. ಇದು ${nsqf} ಅರ್ಹತೆ ಮತ್ತು ${match} ಪ್ರತಿಶತ ಹೊಂದಾಣಿಕೆ ಹೊಂದಿದೆ. ಮುಂದಿನ ಕ್ರಮ: ${action}.`;
    }
    if (lang === 'ml') {
      return `നിങ്ങൾക്കായി ശുപാർശ ചെയ്ത കരിയർ പാത: ${title}. ഇത് ${nsqf} നിലവാരവും ${match} ശതമാനം പൊരുത്തവുമുള്ളതാണ്. അടുത്ത ഘട്ടം: ${action}.`;
    }
    if (lang === 'mr') {
      return `तुमचा शिफारस केलेला उपजीविका मार्ग: ${title}. ही ${nsqf} पात्रता असून ${match} टक्के सुसंगत आहे. पुढील पाऊल: ${action}.`;
    }
    if (lang === 'bn') {
      return `আপনার প্রস্তাবিত ক্যারিয়ার পথ: ${title}। এটি ${nsqf} এবং ${match} শতাংশ উপযুক্ত। পরবর্তী পদক্ষেপ: ${action}।`;
    }
    if (lang === 'gu') {
      return `તમારો ભલામણ કરેલ કારકિર્દી માર્ગ: ${title}. આ ${nsqf} અને ${match} ટકા સુસંગત છે. આગળનું પગલું: ${action}.`;
    }
    if (lang === 'pa') {
      return `ਤੁਹਾਡਾ ਸਿਫਾਰਸ਼ ਕੀਤਾ ਕਰੀਅਰ ਮਾਰਗ: ${title}। ਇਹ ${nsqf} ਯੋਗਤਾ ਅਤੇ ${match} ਪ੍ਰਤੀਸ਼ਤ ਅਨੁਕੂਲ ਹੈ। ਅਗਲਾ ਕਦਮ: ${action}।`;
    }
    if (lang === 'or') {
      return `ଆପଣଙ୍କ ସୁପାରିଶ କରାଯାଇଥିବା କ୍ୟାରିୟର ପଥ: ${title} | ଏହା ${nsqf} ଏବଂ ${match} ପ୍ରତିଶତ ଉପଯୁକ୍ତ | ପରବର୍ତ୍ତୀ ପଦକ୍ଷେପ: ${action} |`;
    }

    // Default English
    return `Your top recommended NSQF livelihood pathway is: ${title}. This is a ${nsqf} qualification with a match fit score of ${match} percent. ${council ? `Accredited by ${council}.` : ''} Your recommended next action is: ${action}.`;
  };

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const script = buildPathwaySpeechScript();
      speakText(script, lang, () => {
        setIsPlaying(false);
      });
    }
  };

  const isLarge = buttonSize === 'large';
  const isCompact = buttonSize === 'compact';

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        aria-label={isPlaying ? 'Stop Audio' : `Listen (${currentLanguage?.nativeName || 'Voice'})`}
        className={`group relative flex items-center justify-center font-bold rounded-2xl transition-all duration-200 active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-blue-500/30 ${
          isPlaying
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25'
        } ${
          isLarge
            ? 'px-5 py-3.5 min-h-[52px] min-w-[52px] text-sm'
            : isCompact
            ? 'p-2.5 min-h-[44px] min-w-[44px] text-xs'
            : 'px-4 py-2.5 min-h-[48px] min-w-[48px] text-xs'
        }`}
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-3 w-3 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <Square className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'} mr-1.5 fill-current`} />
            <span>Stop Audio</span>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center mr-2 w-6 h-6 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
              <Volume2 className={`${isLarge ? 'w-5 h-5' : 'w-4 h-4'}`} />
            </div>
            {!isCompact && (
              <span className="flex items-center gap-1.5 font-semibold">
                <span>Listen ({currentLanguage?.nativeName || 'Voice'})</span>
              </span>
            )}
          </>
        )}
      </button>

      {/* Visual audio pulse bar when playing */}
      {isPlaying && (
        <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 animate-in fade-in">
          <span className="w-1 h-3 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1 h-4 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" />
          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 ml-1">
            Speaking in {currentLanguage?.name || 'native tongue'}...
          </span>
        </div>
      )}
    </div>
  );
}
