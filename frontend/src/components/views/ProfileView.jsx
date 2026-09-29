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
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import SkillCardModal from '../candidate/SkillCardModal';

export default function ProfileView({ onNavigate }) {
  const { currentUser, activeProfile } = useAuth();

  const [skills, setSkills] = useState(
    activeProfile?.currentSkills || [
      { name: 'Python', level: 'Intermediate', percentage: 70 },
      { name: 'HTML', level: 'Intermediate', percentage: 65 },
      { name: 'C', level: 'Beginner', percentage: 40 },
      { name: 'AI', level: 'Intermediate', percentage: 75 },
      { name: 'Unity', level: 'Beginner', percentage: 45 },
    ]
  );

  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSkillCardOpen, setIsSkillCardOpen] = useState(false);
  const { lang, t } = useLanguage();
  const p = t.profile || {};

  const [profileData, setProfileData] = useState({
    name: currentUser?.full_name || activeProfile?.name || 'Selvam C.',
    education: activeProfile?.education || 'B.Tech (1st Year)',
    experience: activeProfile?.experience || '2 years (Personal Projects)',
    interests: activeProfile?.interests || 'AI, Data Science, Game Development',
    careerGoal: activeProfile?.goal || 'AI Engineer'
  });

  // Sync state whenever active demo persona or user changes
  useEffect(() => {
    if (activeProfile) {
      setSkills(activeProfile.currentSkills || []);
      setProfileData({
        name: currentUser?.full_name || activeProfile.name || 'Candidate',
        education: activeProfile.education || '',
        experience: activeProfile.experience || (activeProfile.experienceYears ? `${activeProfile.experienceYears} years experience` : ''),
        interests: activeProfile.interests || '',
        careerGoal: activeProfile.goal || ''
      });
    }
  }, [activeProfile, currentUser]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      { name: newSkillName.trim(), level: 'Intermediate', percentage: 60 }
    ]);
    setNewSkillName('');
    setShowAddSkill(false);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {p.title || 'Your Profile'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {p.subtitle || 'Review and manage your voice-extracted skilling identity'}
        </p>
      </div>

      {/* Voice Input Summary Card matching Panel 4 */}
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
                {p.skillsSubtitle || 'Based on your voice input, we have extracted the following information.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsSkillCardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-600 to-emerald-600 text-white text-xs font-bold shadow-xs hover:opacity-95 transition"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{p.skillCardButton || 'NSQF Skill Card'}</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
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
            <span className="text-xs font-semibold text-slate-400 block">{p.fullName || 'Name'}</span>
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full p-2 text-xs border rounded-lg"
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
                className="w-full p-2 text-xs border rounded-lg"
              />
            ) : (
              <span className="text-slate-900 font-semibold">{profileData.education}</span>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <span className="text-xs font-semibold text-slate-400 block">{p.skillsTitle || 'Skills'}</span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold shadow-2xs"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">{p.workExperience || 'Experience'}</span>
            <span className="text-slate-900 font-semibold">{profileData.experience}</span>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 block">{p.interests || 'Interests'}</span>
            <span className="text-slate-900 font-semibold">{profileData.interests}</span>
          </div>

          <div className="space-y-1 md:col-span-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 block">{p.careerGoal || 'Career Goal'}</span>
            <span className="text-blue-600 font-bold text-base flex items-center gap-1.5">
              <Target className="w-4 h-4 text-blue-600" />
              {profileData.careerGoal}
            </span>
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

          <div className="space-y-4 pt-2">
            {skills.map((skill, index) => {
              const percentage = skill.percentage || (skill.level === 'Intermediate' ? 70 : skill.level === 'Advanced' ? 85 : 45);
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{skill.name}</span>
                    <span className="text-slate-500 text-[11px] font-medium">
                      {skill.level} ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(skill.name, index)} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tools & Resources */}
          {activeProfile.resources && (
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

        {/* Quick Actions (1 col) matching Panel 4 */}
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
                  <div className="text-[11px] text-slate-400 font-normal">Adjust NSQF target qualification</div>
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
                    placeholder="e.g. PyTorch, Docker, React"
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
              <span>Retake Voice Assessment</span>
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
          education: profileData.education,
          skills: skills.map(s => s.name)
        }}
        recommendation={{
          qualification_name: profileData.careerGoal,
          nsqf_level: 'NSQF Level 4/5',
          sector: 'National Occupational Standards',
          council: 'National Skill Development Corporation (NSDC)',
          qp_code: 'QP-IND-2024'
        }}
      />
    </div>
  );
}
