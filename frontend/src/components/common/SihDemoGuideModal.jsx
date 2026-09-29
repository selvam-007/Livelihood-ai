import React from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  Mic, 
  Languages, 
  Cpu, 
  Compass, 
  Bot, 
  ShieldCheck, 
  BarChart3,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function SihDemoGuideModal({ isOpen, onClose, onTriggerVoiceModal }) {
  const { lang, toggleLanguage } = useLanguage();
  const { currentRole, toggleRole } = useAuth();

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "Open Application & DPI Layout",
      desc: "Platform initializes with National Skilling Grid banner, high accessibility contrast, and dual persona portals."
    },
    {
      step: 2,
      title: "Select Preferred Indian Language (11 Languages)",
      desc: "Dropdown in header supports Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, and English. Voice pipeline & UI instantly switch seamlessly."
    },
    {
      step: 3,
      title: "Click '🎙️ Start Voice Assessment'",
      desc: "Prominent CTA opens speech recognition with animated waveform visualizer."
    },
    {
      step: 4,
      title: "Candidate Speaks Naturally (Voice Input)",
      desc: "E.g., 'I completed 12th standard and worked in tailoring for 2 years. I have a sewing machine at home. I want to earn from home.'"
    },
    {
      step: 5,
      title: "AI Profile Extraction Engine",
      desc: "FastAPI NLP engine parses education (12th Standard), duration (2.0 yrs), tools (sewing machine), and goal (self-employment) without hallucinating."
    },
    {
      step: 6,
      title: "Skill Extraction & Canonicalization",
      desc: "Normalizes phrases into canonical NSQF standards (e.g. 'Basic Machine Stitching')."
    },
    {
      step: 7,
      title: "Competency Gap Analysis",
      desc: "Compares candidate against target QP, classifying skills into Matched vs Gaps requiring bridge training."
    },
    {
      step: 8,
      title: "NSQF Pathway Recommendation",
      desc: "Multi-factor recommendation engine ranks AMH/Q1947 Self Employed Tailor at 88% match."
    },
    {
      step: 9,
      title: "Personalized 5-Stage Roadmap",
      desc: "Sequential progression from baseline profile to accredited bridge training, RPL assessment, and micro-enterprise launch."
    },
    {
      step: 10,
      title: "Ask: 'Why was this recommended?'",
      desc: "Click AI Career Counselor widget or ask in the transparent reasoning card."
    },
    {
      step: 11,
      title: "Explainable AI Response with TTS",
      desc: "AI gives grounded multi-factor reasoning and speaks aloud using speech synthesis."
    },
    {
      step: 12,
      title: "State Admin Intelligence Dashboard",
      desc: "Switch to Admin view to inspect aggregate skill demand charts, high-priority gaps, and regional district analytics."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-brand-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>SIH 2024 Demonstration Flow (3–5 Minutes)</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Section 29 Flow
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end evaluation scenario from voice input to administrative intelligence.
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

        {/* 12 Steps List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {steps.map((s) => (
              <div 
                key={s.step}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-mono font-bold text-[11px] flex items-center justify-center border border-brand-500/30">
                    {s.step}
                  </span>
                  <span className="text-xs font-bold text-slate-200">{s.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Demo Triggers */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                toggleLanguage();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Languages className="w-3.5 h-3.5 text-brand-400" />
              <span>Toggle Language (Current: {lang.toUpperCase()})</span>
            </button>

            <button
              onClick={() => {
                toggleRole();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Switch Portal View ({currentRole === 'candidate' ? 'To Admin' : 'To Candidate'})</span>
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onTriggerVoiceModal) onTriggerVoiceModal();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition"
          >
            <Mic className="w-4 h-4 text-slate-950" />
            <span>Start Voice Demo Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
