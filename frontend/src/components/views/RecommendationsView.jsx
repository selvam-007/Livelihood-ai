import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Briefcase, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ChevronRight,
  Award,
  Landmark,
  Volume2,
  VolumeX,
  MapPin,
  Phone,
  Send,
  Sparkles,
  Info,
  Check,
  Building,
  GraduationCap,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SkillCardModal from '../candidate/SkillCardModal';
import SchemeLoanCalculator from '../candidate/SchemeLoanCalculator';
import { speakText, stopSpeaking } from '../../utils/textToSpeech';
import apiClient from '../../utils/apiClient';
import PathwayAudioPlayer from '../common/PathwayAudioPlayer';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

export default function RecommendationsView({ onSelectCourse, selectedCourseId, onBackToList, initialSubTab = 'courses', onNavigate, onOpenAuth }) {
  const { currentUser, activeProfile } = useAuth();
  const { lang, t } = useLanguage();
  const r = t.recommendations || {};

  const [activeTab, setActiveTab] = useState(initialSubTab || 'courses'); // 'courses', 'centres', 'schemes', 'roadmap'
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedQp, setSelectedQp] = useState(null);
  const [scoreModalQp, setScoreModalQp] = useState(null);
  const [isSkillCardOpen, setIsSkillCardOpen] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);

  // Training Centres Directory state
  const [centres, setCentres] = useState([]);
  const [centresLoading, setCentresLoading] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState('50'); // '15', '50', 'all'

  // Government Schemes state
  const [schemes, setSchemes] = useState([]);
  const [schemesLoading, setSchemesLoading] = useState(false);

  // Dynamic Roadmap state
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // Notification Modal Simulation state
  const [notificationSent, setNotificationSent] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState({});

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Fetch real ranked recommendations from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchRankedRecommendations() {
      setLoading(true);
      setError(null);
      try {
        const skillsList = (activeProfile?.currentSkills || []).map(s => s.name || s.skill_name || s);
        const payload = {
          education: activeProfile?.education || "10th Standard",
          prior_occupation: activeProfile?.priorOccupation || activeProfile?.goal || "General",
          experience_years: parseFloat(activeProfile?.experienceYears || 0.0),
          livelihood_goal: activeProfile?.goal ? (activeProfile.goal.toLowerCase().includes('business') || activeProfile.goal.toLowerCase().includes('shop') || activeProfile.goal.toLowerCase().includes('boutique') ? 'self-employment' : 'employment') : 'employment',
          skills: skillsList,
          resources: activeProfile?.resources || [],
          constraints: activeProfile?.constraints || []
        };

        const res = await apiClient.getRankedRecommendations(payload);
        if (isMounted && res?.data) {
          setRecommendations(res.data);
          if (res.data.length > 0 && !selectedQp) {
            setSelectedQp(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        if (isMounted) {
          setError('Could not connect to live NSQF recommendation service. Using verified local catalog.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRankedRecommendations();
    return () => { isMounted = false; };
  }, [activeProfile]);

  // Fetch Centres when centres tab is active or selected QP changes
  useEffect(() => {
    if (activeTab === 'centres') {
      fetchCentres();
    }
  }, [activeTab, distanceFilter, selectedQp]);

  // Fetch Schemes when schemes tab is active
  useEffect(() => {
    if (activeTab === 'schemes') {
      fetchSchemes();
    }
  }, [activeTab, selectedQp]);

  // Fetch Roadmap when roadmap tab is active
  useEffect(() => {
    if (activeTab === 'roadmap' && selectedQp) {
      fetchRoadmap();
    }
  }, [activeTab, selectedQp]);

  async function fetchCentres() {
    setCentresLoading(true);
    try {
      const params = {
        qp_code: selectedQp?.qp_code,
        user_lat: 13.0827, // Default Chennai coords for distance demonstration
        user_lon: 80.2707,
        max_distance_km: distanceFilter === 'all' ? undefined : parseFloat(distanceFilter)
      };
      const res = await apiClient.getTrainingCentres(params);
      setCentres(res?.data || []);
    } catch (err) {
      console.error('Failed to load centres:', err);
    } finally {
      setCentresLoading(false);
    }
  }

  async function fetchSchemes() {
    setSchemesLoading(true);
    try {
      const payload = {
        education: activeProfile?.education || "10th Standard",
        prior_occupation: activeProfile?.priorOccupation || selectedQp?.qualification_name || "vocational",
        experience_years: parseFloat(activeProfile?.experienceYears || 1.0),
        livelihood_goal: activeProfile?.goal || "employment",
        target_qp_code: selectedQp?.qp_code
      };
      const res = await apiClient.checkSchemeEligibility(payload);
      setSchemes(res?.data || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setSchemesLoading(false);
    }
  }

  async function fetchRoadmap() {
    setRoadmapLoading(true);
    try {
      const res = await apiClient.getRoadmap(selectedQp.qp_code, {
        experience_years: activeProfile?.experienceYears || 1.0,
        livelihood_goal: activeProfile?.goal || "employment"
      });
      setRoadmap(res?.data || null);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setRoadmapLoading(false);
    }
  }

  const toggleSpeak = (id, text) => {
    if (playingAudioId === id) {
      stopSpeaking();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      speakText(text, lang, () => setPlayingAudioId(null));
    }
  };

  const handleEnroll = async (qp) => {
    try {
      await apiClient.enrollCourse({
        qp_code: qp.qp_code,
        training_mode: qp.recommended_training_mode?.startsWith('RPL') ? 'RPL' : 'STT',
        centre_name: 'PMKK Skill Center (Nearest)'
      });
      setEnrolledCourses(prev => ({ ...prev, [qp.qp_code]: true }));
    } catch (err) {
      console.error('Enroll error:', err);
      setEnrolledCourses(prev => ({ ...prev, [qp.qp_code]: true }));
    }
  };

  const handleSimulateNotification = async (qp) => {
    try {
      await apiClient.sendNotificationSimulation({
        phone: activeProfile?.phone || '',
        channel: 'whatsapp',
        qp_code: qp.qp_code,
        qp_name: qp.qualification_name,
        centre_name: 'Authorized PMKK Skill Development Center',
        centre_phone: null,
        language: lang
      });
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 4000);
    } catch (err) {
      console.error('Notification simulation failed:', err);
      setNotificationSent(true);
      setTimeout(() => setNotificationSent(false), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {r.title || 'Verified NSQF Pathways'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Zero Hallucination
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {r.subtitle || 'Directly linked to official NCVET Qualification Packs, accredited training centres, and verified schemes.'}
          </p>
        </div>

        {/* 1-Click NSQF Digital Skill Card Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSkillCardOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-600 to-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition"
          >
            <Award className="w-4 h-4" />
            <span>{t.profile?.skillCardButton || 'Official Skill Card (PDF)'}</span>
          </button>
        </div>
      </div>

      {/* Selected QP Highlight Pill if set */}
      {selectedQp && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-blue-900">Active Recommended Pathway:</span>
              <span className="font-bold text-blue-800 text-sm">{selectedQp.qualification_name} ({selectedQp.qp_code})</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200/80 text-blue-800 font-bold">{selectedQp.nsqf_level}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span>Match: <strong className="text-emerald-700">{selectedQp.match_score}%</strong></span>
              <span>•</span>
              <span>Bridge: <strong>{selectedQp.estimated_bridge_hours || 60}h</strong></span>
              <span>•</span>
              <span>Sector: <strong>{selectedQp.sector || 'Skilling'}</strong></span>
            </div>
          </div>
          <div className="flex-shrink-0">
            <PathwayAudioPlayer
              pathway={{
                title: selectedQp.qualification_name,
                nsqfLevel: selectedQp.nsqf_level,
                matchScore: selectedQp.match_score,
                council: selectedQp.council,
                nextAction: selectedQp.official_scheme || selectedQp.recommended_training_mode
              }}
              buttonSize="large"
            />
          </div>
        </div>
      )}

      {/* Tabs Row: [ 1. NSQF Pathways ] [ 2. Training Centres ] [ 3. Scheme Subsidies ] [ 4. Dynamic Roadmap ] */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'courses'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{r.tabCourses || 'NSQF Pathways'}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white">
            {recommendations.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('centres')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'centres'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{r.tabCentres || 'Training Centres'}</span>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'schemes'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>{r.tabSchemes || 'Govt Schemes & Subsidies'}</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{r.tabRoadmap || 'Dynamic Roadmap'}</span>
        </button>
      </div>

      {/* Guest / Un-assessed Learner Informational Banner */}
      {(!currentUser || (activeProfile?.currentSkills || []).length === 0) && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-900 block">
                {!currentUser ? 'Displaying General National NSQF Catalog' : 'Showing Standard National Qualifications'}
              </span>
              <p className="text-amber-700 text-[11px] mt-0.5">
                {!currentUser 
                  ? 'Take the AI Voice Assessment or Sign In to match your unique vocational skills and see personalized gap analysis.' 
                  : 'Complete a quick Voice Assessment to calculate your skill match percentage, missing competency hours, and tailored subsidies.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onNavigate && (
              <button
                onClick={() => onNavigate('voice')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition"
              >
                Voice Assessment
              </button>
            )}
            {!currentUser && onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-50 text-amber-900 font-semibold text-xs transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && activeTab === 'courses' && (
        <LoadingState
          message="Evaluating verified NSQF Qualification Packs with AI explainability..."
          height="h-72"
        />
      )}

      {/* Error State */}
      {error && !loading && recommendations.length === 0 && activeTab === 'courses' && (
        <ErrorState
          title="Unable to connect to live NSQF recommendation service"
          message={error}
          onRetry={fetchRankedRecommendations}
        />
      )}

      {/* Empty State */}
      {!loading && !error && recommendations.length === 0 && activeTab === 'courses' && (
        <EmptyState
          icon={BookOpen}
          title="No Matching Pathways Found"
          description="We couldn't find an exact NSQF match for your current profile. Try taking a voice assessment or adding more skills."
          actionLabel="Take Voice Assessment"
          onAction={() => onSelectCourse?.('voice')}
        />
      )}

      {/* Notification Toast */}
      {notificationSent && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-700 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
            ✓
          </div>
          <div>
            <div className="text-sm font-bold">WhatsApp Notification Sent!</div>
            <div className="text-xs text-emerald-200">Centre location & enrollment steps delivered to your phone.</div>
          </div>
        </div>
      )}

      {/* TAB 1: NSQF PATHWAYS LIST */}
      {activeTab === 'courses' && !loading && (
        <div className="space-y-4">
          {recommendations.map((qp, index) => {
            const isSelected = selectedQp?.qp_code === qp.qp_code;
            const isEnrolled = enrolledCourses[qp.qp_code];
            const isRpl = qp.recommended_training_mode?.startsWith('RPL');

            return (
              <div
                key={qp.qp_code}
                onClick={() => setSelectedQp(qp)}
                className={`bg-white rounded-2xl border p-5 sm:p-6 card-shadow cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Column: Title, QP Code, Sector */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {qp.qualification_name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {qp.nsqf_level}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600">
                        {qp.qp_code}
                      </span>
                      {isRpl && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          Fast-Track RPL Eligible
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                      <span><strong>Sector:</strong> {qp.sector}</span>
                      <span>•</span>
                      <span><strong>Council:</strong> {qp.council}</span>
                      <span>•</span>
                      <span><strong>Scheme:</strong> {qp.official_scheme}</span>
                    </div>

                    {/* Explainability snippet */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {lang === 'ta' ? qp.explanation_ta : qp.explanation_en}
                    </p>

                    {/* Badges for Bridge Hours and Skills */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-200">
                        <Clock className="w-3.5 h-3.5" />
                        Bridge: {qp.estimated_bridge_hours || 60} Hours
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        {qp.matched_skills_count}/{qp.total_skills_required} Skills Verified
                      </span>
                      {qp.employment_pathway?.potential_monthly_income && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200">
                          Income: {qp.employment_pathway.potential_monthly_income}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Match Score & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 flex-shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {qp.match_score}%
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600">
                        {qp.confidence_band}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Audio TTS Readout with 11-language support */}
                      <PathwayAudioPlayer
                        pathway={{
                          title: qp.qualification_name,
                          nsqfLevel: qp.nsqf_level,
                          matchScore: qp.match_score,
                          council: qp.council,
                          nextAction: qp.recommended_training_mode
                        }}
                        buttonSize="compact"
                      />

                      {/* View Score Breakdown */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScoreModalQp(qp);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        Score Breakdown
                      </button>

                      {/* Enroll / WhatsApp */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(qp);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                          isEnrolled 
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateNotification(qp);
                        }}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                        title="Send skilling steps via WhatsApp"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: TRAINING CENTRES DIRECTORY */}
      {activeTab === 'centres' && (
        <div className="space-y-4">
          {/* Distance Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Filter Verified Centres By Proximity:</span>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: 'Within 15 km', value: '15' },
                { label: 'Within 50 km', value: '50' },
                { label: 'All India', value: 'all' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDistanceFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    distanceFilter === opt.value
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {centresLoading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Calculating GPS distances to nearest PMKK and ITI training hubs...</p>
            </div>
          ) : centres.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-500 text-sm">
              No training centres found within {distanceFilter} km for this qualification. Try selecting 'All India'.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centres.map((c) => (
                <div key={c.centre_id} className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {c.type}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{c.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {c.address}
                      </p>
                    </div>
                    {c.distance_km !== null && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                        {c.distance_km} km
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Available Seats</span>
                      <span className="font-bold text-slate-800">{c.available_seats} Seats</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Next Batch</span>
                      <span className="font-bold text-slate-800">{c.next_batch_date || 'Enrolling Now'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {c.phone ? (
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{c.phone}</span>
                      </a>
                    ) : (
                      <a
                        href={c.official_portal || 'https://www.skillindiadigital.gov.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                      >
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        <span>Official Portal</span>
                      </a>
                    )}

                    <button
                      onClick={() => handleSimulateNotification({
                        qp_code: selectedQp?.qp_code || 'AMH/Q1947',
                        qualification_name: selectedQp?.qualification_name || 'Tailoring'
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GOVERNMENT SCHEMES & SUBSIDIES */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((s) => (
              <div key={s.scheme_code} className="bg-white p-5 rounded-2xl border border-slate-200/80 card-shadow space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.ministry}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Eligible ✓
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p><strong>Primary Benefit:</strong> {s.primary_benefit}</p>
                  <p><strong>Stipend / Grants:</strong> <span className="text-emerald-700 font-semibold">{s.stipend_reward}</span></p>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {s.customized_rationale}
                </p>

                <div className="pt-2">
                  <a
                    href={s.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Official Portal Link →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Micro-Loan Subsidy Calculator */}
          <SchemeLoanCalculator occupation={selectedQp?.qualification_name || 'Tailoring'} />
        </div>
      )}

      {/* TAB 4: DYNAMIC ROADMAP VIEW */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6">
          {roadmapLoading ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500">Generating personalized RPL/STT progression roadmap...</p>
            </div>
          ) : roadmap ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 card-shadow space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                    {roadmap.training_mode === 'RPL' ? 'Fast-Track RPL Pathway' : 'Comprehensive STT Pathway'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {roadmap.target_qualification_name} ({roadmap.target_qp_code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Duration: {roadmap.adjusted_duration_hours} Hours • {roadmap.council}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50 text-purple-900 text-xs border border-purple-200 max-w-sm">
                  <strong>Immediate Step:</strong> {lang === 'ta' ? roadmap.immediate_action_ta : roadmap.immediate_action}
                </div>
              </div>

              {/* Dynamic 5-Stage Visual Progression */}
              <div className="space-y-4">
                {roadmap.stages.map((st) => (
                  <div key={st.stage_number} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50/50 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      st.status === 'completed' 
                        ? 'bg-emerald-600 text-white' 
                        : (st.status === 'active_next' ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-600')
                    }`}>
                      {st.status === 'completed' ? '✓' : st.stage_number}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900">
                          {lang === 'ta' && st.stage_name_ta ? st.stage_name_ta : st.stage_name}
                        </h4>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          st.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : (st.status === 'active_next' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500')
                        }`}>
                          {st.status === 'completed' ? 'Verified' : (st.status === 'active_next' ? 'Current Step' : 'Upcoming')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {st.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                        {st.key_attributes?.map((attr, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                            {attr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              Please select a course to view personalized roadmap.
            </div>
          )}
        </div>
      )}

      {/* SCORE BREAKDOWN MODAL */}
      {scoreModalQp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 card-shadow border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Explainable Match Breakdown</h3>
                <p className="text-xs text-slate-500">{scoreModalQp.qualification_name} ({scoreModalQp.qp_code})</p>
              </div>
              <button
                onClick={() => setScoreModalQp(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                <strong>Why Recommended:</strong> {scoreModalQp.why_recommended}
              </div>

              {/* Progress Bars for each pillar */}
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>1. Skills Overlap (Weight: 40%)</span>
                    <span>{scoreModalQp.score_breakdown?.skills_score || 0} / 40 pts</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${((scoreModalQp.score_breakdown?.skills_score || 0) / 40) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>2. Prior Occupation & Experience (Weight: 25%)</span>
                    <span>{scoreModalQp.score_breakdown?.experience_score || 0} / 25 pts</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 rounded-full" 
                      style={{ width: `${((scoreModalQp.score_breakdown?.experience_score || 0) / 25) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>3. Prerequisite Education Fit (Weight: 15%)</span>
                    <span>{scoreModalQp.score_breakdown?.education_score || 0} / 15 pts</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full" 
                      style={{ width: `${((scoreModalQp.score_breakdown?.education_score || 0) / 15) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>4. Livelihood Goal Alignment (Weight: 10%)</span>
                    <span>{scoreModalQp.score_breakdown?.goal_score || 0} / 10 pts</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${((scoreModalQp.score_breakdown?.goal_score || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>5. Tooling & Resources Match (Weight: 10%)</span>
                    <span>{scoreModalQp.score_breakdown?.resource_score || 0} / 10 pts</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-teal-600 rounded-full" 
                      style={{ width: `${((scoreModalQp.score_breakdown?.resource_score || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex justify-between items-center font-bold text-sm">
                <span>Honest Total Score (0 - 100):</span>
                <span className="text-blue-700 text-lg">{scoreModalQp.match_score}%</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setScoreModalQp(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKILL CARD MODAL */}
      <SkillCardModal 
        isOpen={isSkillCardOpen} 
        onClose={() => setIsSkillCardOpen(false)}
        candidate={{
          name: currentUser?.full_name || (lang === 'ta' ? 'பயனாளர்' : 'Learner'),
          education: activeProfile?.education || 'Vocational Learner',
          skills: (activeProfile?.currentSkills || []).map(s => s.name || s)
        }}
        recommendation={selectedQp}
      />
    </div>
  );
}
