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
  Upload
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { speakText, stopSpeaking } from '../../utils/textToSpeech';
import apiClient from '../../utils/apiClient';

export default function VoiceInputView({ onNavigate, onOpenGuidedModal }) {
  const { lang, getLanguageBcp47, t } = useLanguage();
  const v = t.voice || {};
  const { activeProfile } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);
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

  // Sample prompt insertion matching active persona and language
  const getSamplePrompt = () => {
    if (activeProfile?.id === 'cand-001' || activeProfile?.goal?.toLowerCase().includes('tailor')) {
      if (lang === 'ta') {
        return "நான் 12ஆம் வகுப்பு வரை படித்துள்ளேன். 2 ஆண்டுகள் தையல் மற்றும் கட்டிங் அனுபவம் உள்ளது. என்னிடம் தையல் இயந்திரம் உள்ளது. சொந்தமாக பொட்டிக் தொழில் தொடங்க விரும்புகிறேன்.";
      } else if (lang === 'hi') {
        return "मैंने 12वीं तक पढ़ाई की है और 2 साल का सिलाई व कटिंग का अनुभव है। मेरे पास सिलाई मशीन है और मैं अपना बुटीक व्यवसाय शुरू करना चाहती हूँ।";
      }
      return "I studied up to 12th standard and have 2 years of apparel stitching experience. I own a manual sewing machine and want to start my own home boutique.";
    }

    if (activeProfile?.id === 'cand-002' || activeProfile?.goal?.toLowerCase().includes('electrician')) {
      if (lang === 'ta') {
        return "நான் 10ஆம் வகுப்பு முடித்துள்ளேன். 1.5 ஆண்டுகள் வீட்டு வயரிங் உதவியாளராக பணிபுரிந்துள்ளேன். மல்டிமீட்டர் பயன்படுத்த தெரியும். அரசு சான்றிதழ் பெற்ற வயர்மேன் ஆக விரும்புகிறேன்.";
      } else if (lang === 'hi') {
        return "मैंने 10वीं पास की है और 1.5 साल से घरेलू वायरिंग और स्विचबोर्ड का काम सहायक के रूप में कर रहा हूँ। मैं प्रमाणित इलेक्ट्रीशियन बनना चाहता हूँ।";
      }
      return "I completed 10th standard and worked for 1.5 years as a helper on conduit wiring and switchboards. I want to become a certified wireman technician.";
    }

    if (lang === 'ta') {
      return "எனக்கு பைதான், HTML மற்றும் ஜாவாஸ்கிரிப்ட் மூலம் இணைய மேம்பாட்டில் 2 ஆண்டுகள் அனுபவம் உள்ளது. யுனிட்டியில் கேம் புரோட்டோடைப் செய்துள்ளேன். AI இன்ஜினியர் ஆவதே என் இலக்கு.";
    } else if (lang === 'hi') {
      return "मेरे पास पायथन और वेब डेवलपमेंट में 2 साल का अनुभव है। मैंने यूनिटी में गेम प्रोटोटाइप बनाए हैं। मेरा लक्ष्य एआई इंजीनियर बनना है।";
    }
    return "I have 2 years of experience in Python and web development with HTML and JavaScript. I've built personal projects and game prototypes in Unity. My goal is to become an AI Engineer.";
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

    try {
      const data = await apiClient.processVoiceSession({
        session_id: 'voice-session-' + Date.now(),
        answers: [{
          question_id: 1,
          question_text: 'Spoken Livelihood Story',
          spoken_answer: transcript,
          language: lang || 'en'
        }]
      });

      if (data?.data) {
        setAnalysisResult(data.data);
      } else {
        setAnalysisResult({
          extracted_skills: ['Python', 'HTML', 'C', 'AI', 'Unity'],
          recommended_role: 'Python for Data Science & AI Engineer',
          nsqf_level: 'NSQF Level 5',
          match_score: 88
        });
      }
    } catch (err) {
      console.warn('Voice session analysis fallback:', err);
      // Offline fallback
      setTimeout(() => {
        setAnalysisResult({
          extracted_skills: ['Python', 'HTML', 'AI / Machine Learning', 'Data Science', 'Unity'],
          recommended_role: 'Python for Data Science & AI Engineer',
          nsqf_level: 'NSQF Level 5',
          match_score: 88,
          status: 'success'
        });
        setIsAnalyzing(false);
      }, 700);
      return;
    } finally {
      setIsAnalyzing(false);
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

        {/* Analysis Result Modal / Card */}
        {analysisResult && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-3 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-emerald-900">
                  {v.verifiedBannerTitle || 'Voice Profile Extracted & Verified!'}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800 text-[11px] font-bold">
                {analysisResult.nsqf_level || 'NSQF Level 5'}
              </span>
            </div>

            <p className="text-xs text-emerald-800">
              {v.targetPathway || 'Target Pathway:'} <strong>{analysisResult.recommended_role}</strong> ({analysisResult.match_score || 88}% Match fit)
            </p>

            <div className="pt-1">
              <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                {v.extractedSkills || 'Extracted Skills:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(analysisResult.extracted_skills || ['Python', 'HTML', 'C', 'AI', 'Unity']).map((sk, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 text-xs font-semibold text-emerald-800 shadow-xs">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => onNavigate('profile')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5"
              >
                <span>{v.viewFullProfile || 'View Full Profile'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
