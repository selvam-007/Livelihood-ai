import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Star, 
  Target, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../utils/apiClient';

export default function ProgressView({ onNavigate }) {
  const { activeProfile } = useAuth();
  const { lang, t } = useLanguage();
  const pr = t.progress || {};

  const [progressItems, setProgressItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [lastRecomputedScore, setLastRecomputedScore] = useState(null);

  useEffect(() => {
    fetchProgress();
  }, [activeProfile]);

  async function fetchProgress() {
    setLoading(true);
    try {
      const res = await apiClient.getProgress();
      if (res?.data && res.data.length > 0) {
        setProgressItems(res.data);
      } else {
        // Fallback default active progression based on candidate goal
        const defaultQp = activeProfile?.goal?.toLowerCase().includes('tailor') || activeProfile?.priorOccupation?.toLowerCase().includes('tailor')
          ? {
              id: 'demo-prog-1',
              qp_code: 'AMH/Q1947',
              qualification_name: 'Self Employed Tailor',
              sector: 'Apparel, Made-Ups & Home Furnishing',
              training_mode: 'RPL',
              status: 'in_training',
              enrolled_centre_name: 'PMKK Skill Development Centre - Guindy',
              completed_nos_codes: ['AMH/N1947'],
              active_nos_codes: ['AMH/N1948', 'MEPSC/N0102'],
              bridge_hours_completed: 25,
              total_bridge_hours: 60,
              progress_percent: 41.7
            }
          : {
              id: 'demo-prog-2',
              qp_code: 'ELE/Q6001',
              qualification_name: 'Domestic Electrician',
              sector: 'Electrical & Power',
              training_mode: 'STT',
              status: 'in_training',
              enrolled_centre_name: 'Government ITI & Vocational Hub',
              completed_nos_codes: ['ELE/N6001'],
              active_nos_codes: ['ELE/N6002', 'ELE/N6003'],
              bridge_hours_completed: 40,
              total_bridge_hours: 90,
              progress_percent: 44.4
            };
        setProgressItems([defaultQp]);
      }
    } catch (err) {
      console.error('Error fetching candidate progress:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCompleteModule = async (qpCode, nosCode) => {
    setRecomputing(true);
    try {
      const res = await apiClient.completeNosModule({
        qp_code: qpCode,
        nos_code: nosCode,
        hours_logged: 15
      });
      if (res?.data) {
        setLastRecomputedScore(res.data.recomputed_match_score);
        // Refresh local list
        setProgressItems(prev => prev.map(p => {
          if (p.qp_code === qpCode) {
            const completed = [...(p.completed_nos_codes || [])];
            if (!completed.includes(nosCode)) completed.push(nosCode);
            const newHours = Math.min(p.total_bridge_hours, (p.bridge_hours_completed || 0) + 15);
            return {
              ...p,
              completed_nos_codes: completed,
              bridge_hours_completed: newHours,
              progress_percent: Math.round((newHours / p.total_bridge_hours) * 100),
              status: res.data.status
            };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Error completing module:', err);
    } finally {
      setRecomputing(false);
    }
  };

  const currentProgram = progressItems[0];
  const totalCompletedModules = progressItems.reduce((acc, p) => acc + (p.completed_nos_codes?.length || 0), 0);
  const totalBridgeHours = progressItems.reduce((acc, p) => acc + (p.bridge_hours_completed || 0), 0);

  const metrics = [
    {
      title: pr.enrolledCourses || 'Enrolled Pathways',
      value: `${progressItems.length}`,
      icon: BookOpen,
      iconColor: 'bg-blue-50 text-blue-600 border border-blue-200',
    },
    {
      title: pr.completedModules || 'Mastered Competencies',
      value: `${totalCompletedModules}`,
      icon: CheckCircle2,
      iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    },
    {
      title: pr.readinessScore || 'Bridge Hours Logged',
      value: `${totalBridgeHours}h`,
      icon: Clock,
      iconColor: 'bg-purple-50 text-purple-600 border border-purple-200',
    },
    {
      title: t.profile?.careerGoal || 'Target Livelihood',
      value: activeProfile?.goal || 'Self-Employed Tailor',
      isText: true,
      icon: Target,
      iconColor: 'bg-amber-50 text-amber-600 border border-amber-200',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {pr.title || 'Candidate Progress & Skilling Journey'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pr.subtitle || 'Track active NOS module completions, log bridge training hours, and dynamically re-calculate certification readiness.'}
          </p>
        </div>

        <button
          onClick={fetchProgress}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Progress</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 card-shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className={`font-black text-slate-900 ${m.isText ? 'text-base sm:text-lg truncate' : 'text-2xl sm:text-3xl'}`}>
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Recomputed Notification Banner */}
      {lastRecomputedScore !== null && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-4 text-xs animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-emerald-900 block text-sm">Competency Module Mastered!</span>
              <span className="text-emerald-700">Your live NSQF gap analysis score automatically increased to <strong>{lastRecomputedScore}%</strong>.</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('recommendations')}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition"
          >
            View Recommendations →
          </button>
        </div>
      )}

      {/* Active Enrolled Pathways */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Active Skilling Cohort</span>
        </h2>

        {progressItems.map((item) => (
          <div key={item.id || item.qp_code} className="bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    {item.training_mode === 'RPL' ? 'RPL Fast-Track' : 'STT Regular Training'}
                  </span>
                  <span className="text-xs font-mono text-slate-500">[{item.qp_code}]</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    item.status === 'certified' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'certified' ? '✓ Certified Credential Ready' : 'In Training'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {item.qualification_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Center: {item.enrolled_centre_name || 'Authorized PMKK Kaushal Kendra'} • Sector: {item.sector}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block font-medium">Cohort Completion</span>
                <span className="text-2xl font-black text-blue-600">{item.progress_percent || 0}%</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Bridge Training Hours: {item.bridge_hours_completed || 0} / {item.total_bridge_hours || 60}h</span>
                <span>{item.completed_nos_codes?.length || 0} Modules Completed</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, item.progress_percent || 0)}%` }}
                />
              </div>
            </div>

            {/* Interactive Module Checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                National Occupational Standards (NOS) Module Progression:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { nos: 'AMH/N1947', title: 'Pattern drafting, garment marking, and precision cutting', hours: 20 },
                  { nos: 'AMH/N1948', title: 'Bespoke stitching, garment assembly, and neckline finishing', hours: 25 },
                  { nos: 'MEPSC/N0102', title: 'Calculate micro-enterprise unit pricing and client costing', hours: 15 },
                  { nos: 'DGT/VSQ/N0102', title: 'Digital payments, UPI transactions, and customer bookkeeping', hours: 10 }
                ].map((mod) => {
                  const isDone = (item.completed_nos_codes || []).includes(mod.nos);
                  return (
                    <div 
                      key={mod.nos}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                        isDone 
                          ? 'bg-emerald-50/60 border-emerald-200 text-slate-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className={isDone ? 'text-emerald-700 font-mono' : 'text-slate-500 font-mono'}>
                            {mod.nos}
                          </span>
                          {isDone && <span className="text-[10px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Passed</span>}
                        </div>
                        <p className="text-slate-600 leading-tight">{mod.title}</p>
                        <span className="text-[11px] text-slate-400 block">{mod.hours} Training Hours</span>
                      </div>

                      <button
                        onClick={() => handleCompleteModule(item.qp_code, mod.nos)}
                        disabled={isDone || recomputing}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex-shrink-0 ${
                          isDone 
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isDone ? '✓ Completed' : 'Complete NOS'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Certificate Ready Card if 100% or certified */}
            {item.status === 'certified' && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm">NCVET Digital Certificate Issued</span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    Credential ID: {item.certificate_id || 'NCVET-SID-2024-AMH1947'} • Skill India Digital Portal
                  </p>
                </div>

                <a
                  href={item.certificate_url || 'https://skillindiadigital.gov.in'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Credential</span>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
