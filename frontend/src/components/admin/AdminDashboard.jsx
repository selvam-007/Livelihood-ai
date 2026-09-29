import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mic, 
  Award, 
  AlertTriangle, 
  BarChart3, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Layers,
  CheckCircle2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';
import apiClient from '../../utils/apiClient';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';

export default function AdminDashboard() {
  const { lang, t } = useLanguage();
  const [adminSubTab, setAdminSubTab] = useState('analytics'); // 'analytics' or 'audit_logs'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccessMessage, setSeedSuccessMessage] = useState(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditRoleFilter, setAuditRoleFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAdminAnalytics();
      if (data?.data) {
        setAnalyticsData(data.data);
      }
    } catch (err) {
      console.warn('Admin analytics fetch failed:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const res = await apiClient.getAdminAuditLogs({
        actor_role: auditRoleFilter || undefined,
        action: auditActionFilter || undefined,
        limit: 100
      });
      setAuditLogs(res.data?.logs || []);
    } catch (err) {
      console.error('Audit logs fetch failed:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (adminSubTab === 'audit_logs') {
      fetchAuditLogs();
    }
  }, [adminSubTab, auditRoleFilter, auditActionFilter]);

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedSuccessMessage(null);
    try {
      const data = await apiClient.seedSyntheticData();
      const count = data?.data?.seeded_count || data?.data?.records_created || 0;
      setSeedSuccessMessage(
        lang === 'en'
          ? `Seeded ${count} synthetic candidate profiles successfully!`
          : 'மாதிரி தரவுத்தளம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'
      );
      fetchAnalytics();
      setTimeout(() => setSeedSuccessMessage(null), 4000);
    } catch (err) {
      console.warn('Seeding failed:', err);
    } finally {
      setSeeding(false);
    }
  };

  const isEmptyState = analyticsData?.is_empty_state === true;

  const kpis = analyticsData?.kpis || null;
  const skillDemandData = analyticsData?.skill_demand || [];
  const competencyGaps = analyticsData?.competency_gaps || [];
  const topPathways = analyticsData?.top_pathways || [];
  const regionalDistribution = analyticsData?.regional_distribution || [];

  const [selectedSectorFilter, setSelectedSectorFilter] = useState('all');

  const districtHeatmapData = [
    {
      district: 'Madurai District',
      sector: 'Apparel',
      demand: 820,
      supply: 310,
      gapPercent: -62,
      riskLevel: 'High',
      recommendation: 'Expand PM Vishwakarma & Apparel Sewing Hubs'
    },
    {
      district: 'Coimbatore District',
      sector: 'Electronics',
      demand: 950,
      supply: 580,
      gapPercent: -39,
      riskLevel: 'Medium',
      recommendation: 'Scale Domestic Wireman & Industrial Robotics batches'
    },
    {
      district: 'Tirunelveli District',
      sector: 'Green Jobs',
      demand: 640,
      supply: 190,
      gapPercent: -70,
      riskLevel: 'Severe',
      recommendation: 'Launch Suryamitra Solar Rooftop Fast-Track Centers'
    },
    {
      district: 'Salem District',
      sector: 'Automotive',
      demand: 520,
      supply: 340,
      gapPercent: -35,
      riskLevel: 'Medium',
      recommendation: 'EV Two-Wheeler Servicing & Battery Tech labs'
    },
    {
      district: 'Chennai Metropolitan',
      sector: 'IT-ITeS',
      demand: 1420,
      supply: 1100,
      gapPercent: -22,
      riskLevel: 'Low',
      recommendation: 'AI Data Operations & Cloud Support apprenticeships'
    },
    {
      district: 'Tiruchirappalli District',
      sector: 'Manufacturing',
      demand: 480,
      supply: 220,
      gapPercent: -54,
      riskLevel: 'High',
      recommendation: 'Welding & Heavy Fabrication RPL mobilization'
    }
  ];

  const filteredHeatmap = selectedSectorFilter === 'all'
    ? districtHeatmapData
    : districtHeatmapData.filter(d => d.sector.toLowerCase() === selectedSectorFilter.toLowerCase());

  return (
    <div className="space-y-8 bg-slate-950 text-slate-100 p-6 sm:p-8 rounded-3xl border border-purple-900/40 shadow-2xl animate-in fade-in duration-300 relative overflow-hidden">
      {/* Background Subtle Mesh Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Title & Privacy Banner */}
      <div className="space-y-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Administrative State Portal' : 'மாநில நிர்வாக தளம்'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.admin.title}
            </h2>
            <p className="text-sm text-slate-400">
              {t.admin.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-900/30 transition disabled:opacity-50"
              title="Seed 100+ demographic candidates for presentation"
            >
              {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{lang === 'en' ? '⚡ Seed Presentation Data' : 'மாதிரி தரவுகளை புதுப்பி'}</span>
            </button>

            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
              <span>{lang === 'en' ? 'Refresh' : 'புதுப்பி'}</span>
            </button>
          </div>
        </div>

        {seedSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{seedSuccessMessage}</span>
          </div>
        )}

        {/* Privacy Guard Notice */}
        <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>{t.admin.privacyNotice}</span>
        </div>

        {/* Sub-Tab Navigation: Analytics vs Audit Logs */}
        <div className="flex p-1 bg-slate-900/90 border border-slate-800 rounded-2xl max-w-md">
          <button
            type="button"
            onClick={() => setAdminSubTab('analytics')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              adminSubTab === 'analytics'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Skilling Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminSubTab('audit_logs')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              adminSubTab === 'audit_logs'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Logs & Security</span>
          </button>
        </div>
      </div>

      {adminSubTab === 'audit_logs' ? (
        /* AUDIT LOGS INSPECTOR */
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Immutable Audit Trail</h3>
                <p className="text-xs text-slate-400">
                  Comprehensive audit logs tracking admin, field agent, and training provider actions on candidate data.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Role Filter */}
                <select
                  value={auditRoleFilter}
                  onChange={(e) => setAuditRoleFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="field_agent">Field Agent</option>
                  <option value="training_provider">Training Provider</option>
                  <option value="candidate">Candidate</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={fetchAuditLogs}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {auditLoading ? (
              <LoadingState message="Loading audit logs..." height="h-64" />
            ) : auditLogs.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs">
                No audit events matching current filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-bold">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor & Role</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Target Candidate</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white">#{log.actor_id}</span>{' '}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.actor_role === 'admin'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50'
                              : log.actor_role === 'field_agent'
                              ? 'bg-teal-950/80 text-teal-300 border border-teal-800/50'
                              : log.actor_role === 'training_provider'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {log.actor_role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {log.action}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {log.target_user_id ? `User #${log.target_user_id}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {log.ip_address || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* SKILLING ANALYTICS (ORIGINAL VIEW) */
        <>

      {/* Error state */}
      {error && !analyticsData && (
        <ErrorState
          title="Failed to retrieve administrative analytics"
          message={error}
          onRetry={fetchAnalytics}
        />
      )}

      {/* Empty state banner */}
      {isEmptyState && !loading && (
        <EmptyState
          icon={AlertTriangle}
          title={lang === 'en' ? 'No real candidate data yet' : 'இன்னும் நேரடி தரவு இல்லை'}
          description={analyticsData?.data_note || 'Seed presentation data to populate the administrative dashboard for live demonstration.'}
          actionLabel={lang === 'en' ? 'Seed Demo Data' : 'மாதிரி தரவுகளை புதுப்பி'}
          onAction={handleSeedData}
          className="border-amber-800/40 bg-amber-950/20 text-amber-200"
        />
      )}

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.admin.kpis.totalCandidates}</span>
            <Users className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {kpis ? kpis.total_candidates.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            {kpis?.total_candidates > 0 ? <><TrendingUp className="w-3 h-3" /> Live count</> : <span className="text-slate-500">No data yet</span>}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.admin.kpis.voiceAssessments}</span>
            <Mic className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {kpis ? kpis.completed_voice_assessments.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-cyan-400">
            {kpis?.completed_voice_assessments > 0
              ? `${lang === 'en' ? 'Profiles ≥80% complete' : '80%+ முழு சுயவிவரங்கள்'}`
              : <span className="text-slate-500">{lang === 'en' ? 'No data yet' : 'தரவு இல்லை'}</span>}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.admin.kpis.activeRoadmaps}</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {kpis?.active_livelihood_roadmaps != null ? kpis.active_livelihood_roadmaps.toLocaleString() : '—'}
          </div>
          <div className="text-[11px] text-slate-400">
            {kpis?.active_livelihood_roadmaps != null
              ? lang === 'en' ? 'Across NSQF Qualification Packs' : 'NSQF தகுதித் தொகுப்புகளில்'
              : <span className="text-slate-500">{lang === 'en' ? 'Tracking not yet implemented' : 'கண்காணிப்பு இல்லை'}</span>}
          </div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.admin.kpis.identifiedGaps}</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {kpis ? kpis.total_skills_logged?.toLocaleString() ?? '—' : '—'}
          </div>
          <div className="text-[11px] text-rose-400">
            {lang === 'en' ? 'Requires bridge program funding' : 'பயிற்சி நிதி ஒதுக்கீடு தேவை'}
          </div>
        </div>
      </div>

      {/* Aggregate Charts & Skill Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aggregate Skill Demand Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-400" />
                {t.admin.skillDemandTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.admin.skillDemandSubtitle}
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
              N = {kpis.total_candidates.toLocaleString()}
            </span>
          </div>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillDemandData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {skillDemandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequently Missing Competencies */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                {t.admin.gapDemandTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.admin.gapDemandSubtitle}
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-1 rounded border border-amber-800/60">
              High Priority
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {competencyGaps.map((gap, index) => (
              <div key={index} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-slate-200">{gap.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Sector: {gap.sector}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-white">{gap.count}</div>
                    <div className="text-[10px] text-slate-400">candidates</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-rose-950/80 text-rose-300 border border-rose-800/60">
                    {gap.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Recommended NSQF Pathways Grid */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-400" />
              {t.admin.pathwaysTitle}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en' ? 'Most frequently matched Qualification Packs by the AI Recommendation Engine' : 'AI பரிந்துரை இயந்திரத்தால் அதிகம் பரிந்துரைக்கப்பட்ட தொழில் தகுதிகள்'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {topPathways.map((path, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-brand-400 font-semibold">{path.qp_code}</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  {path.demand_trend}
                </span>
              </div>
              <div className="text-xs font-bold text-white leading-snug">{path.title}</div>
              <div className="text-[10px] text-slate-400">{path.council}</div>
              <div className="text-[11px] font-mono text-slate-300 pt-1">
                {path.candidates} {lang === 'en' ? 'Candidates Matched' : 'பயனாளர்கள்'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* State Policy & District Skill Gap Heatmap */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>State Intelligence Heatmap</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              {lang === 'en' ? 'District-Wise Skill Gap & Workforce Heatmap' : 'மாவட்ட அளவிலான திறன் இடைவெளி வரைபடம்'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'en' 
                ? 'Compares live industry hiring demand vs certified workforce supply to detect macro-economic deficit.' 
                : 'தொழில்துறை வேலை வாய்ப்புகள் மற்றும் பயிற்சி பெற்ற தொழிலாளர்களின் ஒப்பீடு.'}
            </p>
          </div>

          {/* Sector Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['all', 'Apparel', 'Electronics', 'Green Jobs', 'Automotive', 'IT-ITeS'].map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSectorFilter(sec)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedSectorFilter.toLowerCase() === sec.toLowerCase()
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {sec === 'all' ? (lang === 'en' ? 'All Sectors' : 'அனைத்து துறைகளும்') : sec}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHeatmap.map((item, idx) => {
            const isSevere = item.gapPercent <= -60;
            const isHigh = item.gapPercent > -60 && item.gapPercent <= -40;
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all ${
                  isSevere 
                    ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-600' 
                    : isHigh 
                    ? 'bg-amber-950/20 border-amber-800/50 hover:border-amber-600' 
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.district}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Sector: {item.sector}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSevere 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : isHigh 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {item.gapPercent}% Gap
                  </span>
                </div>

                {/* Demand vs Supply Visual Bar */}
                <div className="py-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Industry Demand: <strong className="text-white">{item.demand}</strong></span>
                    <span className="text-slate-400">Trained Supply: <strong className="text-cyan-400">{item.supply}</strong></span>
                  </div>

                  {/* Dual Bar */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((item.supply / item.demand) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Supply Fulfillment: {Math.round((item.supply / item.demand) * 100)}%</span>
                    <span>Deficit: {item.demand - item.supply} roles</span>
                  </div>
                </div>

                {/* Actionable Policy Recommendation */}
                <div className="pt-2 border-t border-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Policy Intervention:</span>
                  <p className="text-xs text-slate-200 leading-snug">{item.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
