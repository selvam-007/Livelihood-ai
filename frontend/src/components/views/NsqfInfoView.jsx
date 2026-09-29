import React, { useState } from 'react';
import { 
  Award, 
  Layers, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function NsqfInfoView() {
  const [expandedLearnMore, setExpandedLearnMore] = useState(false);
  const { t } = useLanguage();
  const n = t.nsqf || {};

  const nsqfLevels = [
    { level: 'Level 1', title: n.level1Title || 'Basic skills', color: 'bg-slate-400', desc: n.level1Desc || 'Pre-vocational, basic cognitive capability and foundational tasks.' },
    { level: 'Level 2', title: n.level2Title || 'Elementary job skills', color: 'bg-emerald-500', desc: n.level2Desc || 'Entry-level work with defined manual tasks and basic tool handling.' },
    { level: 'Level 3', title: n.level3Title || 'Skilled work with some independence', color: 'bg-blue-500', desc: n.level3Desc || 'Practical trade work with job safety compliance and routine decision making.' },
    { level: 'Level 4', title: n.level4Title || 'Work and learning with clear guidelines', color: 'bg-indigo-500', desc: n.level4Desc || 'Advanced craft & technician roles with specialized equipment operations.' },
    { level: 'Level 5', title: n.level5Title || 'Higher technical / supervisory skills', color: 'bg-purple-600', desc: n.level5Desc || 'Supervisory, technical associate, software and specialized trade engineering.' },
    { level: 'Level 6+', title: n.level6Title || 'Advanced professional skills', color: 'bg-rose-500', desc: n.level6Desc || 'Complex problem solving, engineering leadership, and strategic execution.' },
  ];

  const benefitCards = [
    {
      title: 'Standardized qualification system',
      desc: 'Nationally unified competency framework recognized by MSDE, NCVET, and industry bodies.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600 border-blue-200'
    },
    {
      title: 'Better job opportunities',
      desc: 'Wage premiums and employer recognition for formal RPL & QP verified competencies.',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Bridges skill gaps with training',
      desc: 'Targeted short-term bridge courses save time by teaching only missing competency modules.',
      icon: GraduationCap,
      color: 'bg-purple-50 text-purple-600 border-purple-200'
    },
    {
      title: 'Recognized across industries',
      desc: 'National credit framework mobility allowing progression from informal work to formal degrees.',
      icon: Globe,
      color: 'bg-amber-50 text-amber-600 border-amber-200'
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {n.title || 'NSQF Information'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {n.subtitle || 'Understanding the National Skills Qualifications Framework'}
        </p>
      </div>

      {/* Top Card: What is NSQF? matching Panel 7 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 card-shadow space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {n.title || 'What is NSQF?'}
            </h2>
            <p className="text-xs text-slate-500">
              National Skills Qualifications Framework
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-4xl">
          The National Skills Qualifications Framework (NSQF) is a competency-based framework that organizes qualifications according to a series of levels of knowledge, skills, and aptitude. These levels are defined in terms of learning outcomes which the learner must possess regardless of whether they were acquired through formal, non-formal, or informal learning.
        </p>

        <div>
          <button
            onClick={() => setExpandedLearnMore(!expandedLearnMore)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <span>{expandedLearnMore ? 'Show Less' : (n.learnMore || 'Learn More')}</span>
            {expandedLearnMore ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {expandedLearnMore && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 animate-in fade-in">
            <p>
              <strong>Key Principles of NSQF in SkillPath AI:</strong>
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>RPL (Recognition of Prior Learning):</strong> Converts uncertified experience into formal government certification without repeating full courses.</li>
              <li><strong>NOS (National Occupational Standards):</strong> Specific benchmarks for tasks performed in real Indian workplaces.</li>
              <li><strong>Credit Accumulation & Transfer:</strong> Move fluidly between vocational skilling, diploma, and degree pathways.</li>
            </ul>
          </div>
        )}
      </div>

      {/* NSQF Levels List matching Panel 7 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 card-shadow space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          {n.levelsTitle || 'NSQF Levels'}
        </h3>

        <div className="space-y-3">
          {nsqfLevels.map((lvl, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-blue-50/40 transition gap-2"
            >
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${lvl.color} flex-shrink-0 ring-2 ring-white shadow-2xs`} />
                <span className="text-xs font-bold text-slate-900 w-24">
                  {lvl.level}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {lvl.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 sm:text-right pl-6 sm:pl-0 max-w-md">
                {lvl.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How it helps you (4 Feature Cards matching Panel 7) */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          How it helps you
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefitCards.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 card-shadow flex flex-col justify-between space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${b.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
