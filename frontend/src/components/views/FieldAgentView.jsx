import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Mic, 
  CheckCircle, 
  Award, 
  Phone, 
  BookOpen, 
  Briefcase, 
  Target, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../utils/apiClient';
import LoadingState from '../common/LoadingState';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

export default function FieldAgentView() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVerifySkillOpen, setIsVerifySkillOpen] = useState(false);
  const [isVoiceInterviewOpen, setIsVoiceInterviewOpen] = useState(false);
  const [activeBeneficiary, setActiveBeneficiary] = useState(null);

  // Form states
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    phone: '',
    education: '10th Standard',
    prior_occupation: '',
    livelihood_goal: 'wage-employment',
    initial_skills: ''
  });

  const [verifyForm, setVerifyForm] = useState({
    skill_name: '',
    proficiency_level: 'intermediate',
    verification_notes: ''
  });

  const [interviewForm, setInterviewForm] = useState({
    extracted_skills: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchBeneficiaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAgentBeneficiaries();
      setBeneficiaries(res.data?.beneficiaries || []);
    } catch (err) {
      setError(err.message || 'Failed to load assigned beneficiaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionSuccess(null);
    try {
      const payload = {
        ...registerForm,
        initial_skills: registerForm.initial_skills
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };
      await apiClient.registerBeneficiary(payload);
      setActionSuccess('Beneficiary registered successfully!');
      setIsRegisterOpen(false);
      setRegisterForm({
        full_name: '',
        phone: '',
        education: '10th Standard',
        prior_occupation: '',
        livelihood_goal: 'wage-employment',
        initial_skills: ''
      });
      fetchBeneficiaries();
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySkill = async (e) => {
    e.preventDefault();
    if (!activeBeneficiary) return;
    setSubmitting(true);
    try {
      await apiClient.agentVerifySkill(activeBeneficiary.candidate_id, {
        skill_name: verifyForm.skill_name,
        proficiency_level: verifyForm.proficiency_level,
        is_verified: true,
        verification_notes: verifyForm.verification_notes
      });
      setActionSuccess(`Skill "${verifyForm.skill_name}" verified for ${activeBeneficiary.full_name}!`);
      setIsVerifySkillOpen(false);
      setVerifyForm({ skill_name: '', proficiency_level: 'intermediate', verification_notes: '' });
      fetchBeneficiaries();
    } catch (err) {
      alert(`Skill verification failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceInterview = async (e) => {
    e.preventDefault();
    if (!activeBeneficiary) return;
    setSubmitting(true);
    try {
      const skillsArray = interviewForm.extracted_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      await apiClient.agentAssistedInterview(activeBeneficiary.candidate_id, {
        extracted_skills: skillsArray,
        interview_notes: interviewForm.notes
      });
      setActionSuccess(`Voice interview submitted for ${activeBeneficiary.full_name}!`);
      setIsVoiceInterviewOpen(false);
      setInterviewForm({ extracted_skills: '', notes: '' });
      fetchBeneficiaries();
    } catch (err) {
      alert(`Interview submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(b => 
    b.full_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    b.phone?.includes(searchFilter) ||
    b.prior_occupation?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Field Agent Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Grassroots Beneficiary Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register rural candidates, conduct assisted voice assessments, and verify technical competencies on-the-ground.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 flex items-center gap-2 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Beneficiary</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, phone or occupation..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <button
          onClick={fetchBeneficiaries}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
          title="Refresh List"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingState message="Loading assigned beneficiaries..." height="h-64" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBeneficiaries} />
      ) : filteredBeneficiaries.length === 0 ? (
        <EmptyState
          title="No beneficiaries registered yet"
          description="Register candidates in your assigned village or district to kick off their NSQF-aligned skilling pathway."
          actionText="Register Beneficiary"
          onAction={() => setIsRegisterOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBeneficiaries.map((bene) => (
            <div
              key={bene.candidate_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{bene.full_name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{bene.phone}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                    {bene.livelihood_goal || 'Candidate'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-slate-600">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{bene.education || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{bene.prior_occupation || 'None'}</span>
                  </div>
                </div>

                {/* Skills badges */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Skills ({bene.skills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {bene.skills && bene.skills.length > 0 ? (
                      bene.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 ${
                            s.is_verified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {s.is_verified && <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />}
                          <span>{s.skill_name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No skills recorded yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setActiveBeneficiary(bene);
                    setIsVerifySkillOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/60 text-teal-800 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <Award className="w-3 h-3" />
                  <span>Verify Skill</span>
                </button>

                <button
                  onClick={() => {
                    setActiveBeneficiary(bene);
                    setIsVoiceInterviewOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 transition"
                >
                  <Mic className="w-3 h-3 text-teal-400" />
                  <span>Voice Assessment</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal 1: Register Beneficiary */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900">Register Grassroots Beneficiary</h2>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muthu Grassroots"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mobile Phone (+91) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+919876543210"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Education Level</label>
                  <select
                    value={registerForm.education}
                    onChange={(e) => setRegisterForm({ ...registerForm, education: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="No formal education">No formal education</option>
                    <option value="5th Standard">5th Standard</option>
                    <option value="8th Standard">8th Standard</option>
                    <option value="10th Standard">10th Standard (SSLC)</option>
                    <option value="12th Standard">12th Standard (HSC)</option>
                    <option value="Diploma / ITI">Diploma / ITI</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Livelihood Goal</label>
                  <select
                    value={registerForm.livelihood_goal}
                    onChange={(e) => setRegisterForm({ ...registerForm, livelihood_goal: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="wage-employment">Wage Employment</option>
                    <option value="self-employment">Self Employment / Micro-Enterprise</option>
                    <option value="upskilling">Skill Certification / RPL</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Prior Occupation / Trade</label>
                <input
                  type="text"
                  placeholder="e.g. Carpentry, Masonry Helper, Tailoring"
                  value={registerForm.prior_occupation}
                  onChange={(e) => setRegisterForm({ ...registerForm, prior_occupation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Initial Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Hand Plane Usage, Wood Joint Assembly, Measurements"
                  value={registerForm.initial_skills}
                  onChange={(e) => setRegisterForm({ ...registerForm, initial_skills: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-500/20"
                >
                  {submitting ? 'Registering...' : 'Register Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Verify Skill */}
      {isVerifySkillOpen && activeBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">Verify Competency</h2>
                <p className="text-[11px] text-slate-500">For {activeBeneficiary.full_name}</p>
              </div>
              <button onClick={() => setIsVerifySkillOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleVerifySkill} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Skill / Competency Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wood Joint Assembly"
                  value={verifyForm.skill_name}
                  onChange={(e) => setVerifyForm({ ...verifyForm, skill_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Observed Proficiency Level</label>
                <select
                  value={verifyForm.proficiency_level}
                  onChange={(e) => setVerifyForm({ ...verifyForm, proficiency_level: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                >
                  <option value="beginner">Beginner (Needs Supervision)</option>
                  <option value="intermediate">Intermediate (Autonomous)</option>
                  <option value="advanced">Advanced (Mastery / Instructs)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Verification Notes / Evidence</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Conducted physical test on mortise-and-tenon joint alignment."
                  value={verifyForm.verification_notes}
                  onChange={(e) => setVerifyForm({ ...verifyForm, verification_notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVerifySkillOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  {submitting ? 'Verifying...' : 'Confirm Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Assisted Voice Interview */}
      {isVoiceInterviewOpen && activeBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-teal-600" />
                <h2 className="text-base font-black text-slate-900">Assisted Voice Assessment</h2>
              </div>
              <button onClick={() => setIsVoiceInterviewOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Record interview insights on behalf of <strong className="text-slate-800">{activeBeneficiary.full_name}</strong>.
            </p>

            <form onSubmit={handleVoiceInterview} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Discovered Skills (Comma separated) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Measurement Accuracy, Safety Protocol, Power Drill Handling"
                  value={interviewForm.extracted_skills}
                  onChange={(e) => setInterviewForm({ ...interviewForm, extracted_skills: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Agent Field Observations</label>
                <textarea
                  rows={3}
                  placeholder="Candidate showed high enthusiasm for furniture assembly and expressed interest in micro-enterprise loans."
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsVoiceInterviewOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  {submitting ? 'Submitting...' : 'Save Voice Insights'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
