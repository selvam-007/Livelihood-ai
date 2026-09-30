import React, { useState, useEffect } from 'react';
import { 
  User, 
  Edit3, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Plus, 
  Target, 
  Wrench,
  CheckCircle2,
  X,
  LogIn,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SkillCardModal from '../candidate/SkillCardModal';

export default function ProfileView({ onNavigate, onOpenAuth }) {
  const { currentUser, activeProfile, updateActiveProfile } = useAuth();
  const { lang, t } = useLanguage();
  const p = t.profile || {};

  const [skills, setSkills] = useState(
    currentUser && activeProfile?.currentSkills?.length ? activeProfile.currentSkills : []
  );

  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSkillCardOpen, setIsSkillCardOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.full_name || (currentUser?.email ? currentUser.email.split('@')[0] : 'Guest Candidate'),
    education: activeProfile?.education || '',
    experience: activeProfile?.experience || '',
    interests: activeProfile?.interests || '',
    careerGoal: activeProfile?.goal || ''
  });

  // Sync state whenever authenticated user or backend profile changes
  useEffect(() => {
    if (currentUser && activeProfile) {
      setSkills(activeProfile.currentSkills || []);
      setProfileData({
        name: currentUser.full_name || activeProfile.name || (currentUser.email ? currentUser.email.split('@')[0] : 'Candidate'),
        education: activeProfile.education || '',
        experience: activeProfile.experience || (activeProfile.experienceYears ? `${activeProfile.experienceYears} years experience` : ''),
        interests: activeProfile.interests || '',
        careerGoal: activeProfile.goal || ''
      });
    } else if (!currentUser) {
      setSkills([]);
      setProfileData({
        name: 'Guest Candidate',
        education: '',
        experience: '',
        interests: '',
        careerGoal: ''
      });
    }
  }, [activeProfile, currentUser]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const updatedSkills = [
      ...skills,
      { name: newSkillName.trim(), level: 'Intermediate', percentage: 60 }
    ];
    setSkills(updatedSkills);
    setNewSkillName('');
    setShowAddSkill(false);

    if (currentUser && updateActiveProfile) {
      updateActiveProfile({
        skills: updatedSkills.map(s => s.name || s)
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsEditing(false);
    if (currentUser && updateActiveProfile) {
      try {
        await updateActiveProfile({
          full_name: profileData.name,
          education_level: profileData.education,
          prior_occupation: profileData.experience,
          livelihood_goal: profileData.careerGoal,
          skills: skills.map(s => s.name || s)
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (err) {
        console.error('Failed to save profile:', err);
      }
    }
  };

  const getProgressColor = (name, index) => {
    const colors = [
      'from-blue-600 to-indigo-600',
      'from-emerald-500 to-teal-500',
      'from-amber-500 to-orange-500',
      'from-purple-600 to-pink-600',
      'from-cyan-500 to-blue-500'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {p.title || 'My Profile'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {p.subtitle || 'Verified Candidate Profile & Competency Matrix'}
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile saved successfully</span>
          </div>
        )}
      </div>

      {/* Guest Mode Notice Banner when not authenticated */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 card-shadow">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Browsing as Guest Learner</h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                You are currently in guest mode. Sign In or Register to save your verified competencies, track your NSQF qualifications, and generate your official digital Skill Card.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('voice')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-semibold transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Voice Assessment</span>
            </button>
          </div>
        </div>
      )}

      {/* Candidate Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 card-shadow space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {p.personalInfo || 'Candidate Details'}
              </h2>
              <p className="text-xs text-slate-500">
                {p.skillsSubtitle || 'Skills extracted from your voice and matched with NSQF standards'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsSkillCardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-600 to-emerald-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{p.skillCardButton || 'View NSQF Skill Card'}</span>
            </button>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>{isEditing ? (p.saveChanges || 'Save Changes') : (p.editProfile || 'Edit Profile')}</span>
            </button>
          </div>
        </div>

        {/* Profile Attributes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">{p.fullName || 'Full Name'}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-slate-900 font-semibold">{profileData.name}</span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">{p.education || 'Education'}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.education}
                onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                placeholder="e.g. 10th Standard, ITI, Diploma"
                className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-slate-900 font-semibold">
                {profileData.education || <span className="text-slate-400 font-normal italic">Not specified</span>}
              </span>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-400 block">{p.skillsTitle || 'Verified Skills & Competencies'}</span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold shadow-2xs"
                  >
                    {skill.name || skill}
                  </span>
                ))
              ) : (
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 w-full">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {currentUser 
                      ? 'No verified skills recorded yet. Complete Voice Assessment or click "Add New Skill".' 
                      : 'No skills recorded in Guest mode. Complete a Voice Assessment or Sign In to record your competencies.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">{p.workExperience || 'Work Experience'}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.experience}
                onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                placeholder="e.g. 1 year practical helper"
                className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-slate-900 font-semibold">
                {profileData.experience || <span className="text-slate-400 font-normal italic">Not specified</span>}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">{p.interests || 'Interests & Domain'}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.interests}
                onChange={(e) => setProfileData({ ...profileData, interests: e.target.value })}
                placeholder="e.g. Electrical, Healthcare, Green Energy"
                className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-slate-900 font-semibold">
                {profileData.interests || <span className="text-slate-400 font-normal italic">Not specified</span>}
              </span>
            )}
          </div>

          <div className="space-y-1 md:col-span-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 block">{p.careerGoal || 'Target Career Goal'}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.careerGoal}
                onChange={(e) => setProfileData({ ...profileData, careerGoal: e.target.value })}
                placeholder="e.g. Certified Wireman, General Duty Assistant"
                className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-blue-600 font-bold text-base flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                {profileData.careerGoal || <span className="text-slate-400 font-normal text-xs italic">Explore NSQF Opportunities</span>}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom 2-Column Section: Skill Level Analysis & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Level Analysis (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Skill Level Analysis
              </h3>
              <p className="text-xs text-slate-500">
                NSQF competency estimation based on hands-on practical experience
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {skills.length} Skills
            </span>
          </div>

          {skills.length > 0 ? (
            <div className="space-y-4 pt-2">
              {skills.map((skill, index) => {
                const percentage = skill.percentage || (skill.level === 'Intermediate' ? 70 : skill.level === 'Advanced' ? 85 : 45);
                const skillName = skill.name || skill;
                const skillLevel = skill.level || 'Intermediate';
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{skillName}</span>
                      <span className="text-slate-500 text-[11px] font-medium">
                        {skillLevel} ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(skillName, index)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 my-2">
              <TrendingUp className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-slate-700">No Skill Competencies to Analyze</h4>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Speak naturally in your local language during Voice Assessment to automatically identify your practical skills and NSQF levels.
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => onNavigate('voice')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Voice Assessment</span>
                </button>
              </div>
            </div>
          )}

          {/* Tools & Resources */}
          {activeProfile?.resources && activeProfile.resources.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                Available Equipment & Hardware
              </span>
              <div className="flex flex-wrap gap-2">
                {activeProfile.resources.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Quick Actions
            </h3>

            <div className="space-y-2.5 pt-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs border border-slate-200/70 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-900 font-bold group-hover:text-blue-700">Update Profile</div>
                  <div className="text-[11px] text-slate-400 font-normal">Edit personal & academic details</div>
                </div>
              </button>

              <button
                onClick={() => setShowAddSkill(!showAddSkill)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-xs border border-slate-200/70 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-900 font-bold group-hover:text-emerald-700">Add New Skill</div>
                  <div className="text-[11px] text-slate-400 font-normal">Include certifications or tools</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate('recommendations')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-purple-50 hover:text-purple-700 text-slate-700 font-semibold text-xs border border-slate-200/70 transition text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-slate-900 font-bold group-hover:text-purple-700">Set Career Goals</div>
                  <div className="text-[11px] text-slate-400 font-normal">Explore NSQF target pathways</div>
                </div>
              </button>
            </div>

            {/* Interactive Add Skill Box */}
            {showAddSkill && (
              <form onSubmit={handleAddSkill} className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in">
                <div className="text-xs font-semibold text-slate-700">Add Custom Skill</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. Conduit Wiring, Tally, Solar Installation"
                    className="flex-1 p-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('voice')}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 font-semibold text-xs transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Voice Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official NSQF Digital Skill Card Modal */}
      <SkillCardModal
        isOpen={isSkillCardOpen}
        onClose={() => setIsSkillCardOpen(false)}
        candidate={{
          name: profileData.name,
          education: profileData.education || 'Vocational Learner',
          skills: skills.map(s => s.name || s)
        }}
        recommendation={{
          qualification_name: profileData.careerGoal || 'National Skill Pathway',
          nsqf_level: 'NSQF Level 3/4',
          sector: 'National Occupational Standards',
          council: 'National Skill Development Corporation (NSDC)',
          qp_code: 'QP-IND-2024'
        }}
      />
    </div>
  );
}
