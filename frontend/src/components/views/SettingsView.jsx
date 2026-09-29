import React from 'react';
import { 
  Globe, 
  User, 
  Volume2, 
  ShieldCheck, 
  Sliders, 
  Check,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsView() {
  const { lang, setLang, supportedLanguages, t } = useLanguage();
  const set = t.settings || {};
  const { activeProfileKey, setActiveProfileKey, profiles, currentRole, toggleRole } = useAuth();

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {set.title || 'Settings & Preferences'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {set.subtitle || 'Customize your SkillPath AI language, persona, and accessibility options'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{set.languageSection || 'Preferred Language'}</h3>
              <p className="text-xs text-slate-400">{set.languageSectionSub || 'Choose your mother tongue for voice and text'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {supportedLanguages.map((l) => {
              const isSelected = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-sm ring-1 ring-blue-500/20'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base select-none">{l.flag || '🇮🇳'}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {l.nativeName || l.native}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {l.label || l.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Account & Platform Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{set.notifications || 'Account & Identity'}</h3>
              <p className="text-xs text-slate-400">{set.notificationsSub || 'Profile settings and regional access'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Voice AI Model</span>
                <span className="text-slate-500">Multilingual 11-Language Indic Speech Engine</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">{set.offlineMode || 'Offline Caching (PWA)'}</span>
                <span className="text-slate-500">{set.offlineModeSub || 'Local offline storage for low-connectivity rural areas'}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Portal View Mode Switch */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Portal Role Switcher</h3>
            <p className="text-xs text-slate-500">Switch between real-world role perspectives</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { id: 'candidate', label: 'Candidate' },
              { id: 'field_agent', label: 'Field Agent' },
              { id: 'training_provider', label: 'Provider' },
              { id: 'admin', label: 'Admin' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => {
                  useAuth().setCurrentRole(r.id);
                  localStorage.setItem('livelihood_role', r.id);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  currentRole === r.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Standards & Privacy Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 card-shadow space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DPDP & NSQF Compliance</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All AI curriculum mappings comply with NCVET & MSDE specifications. All candidate data conforms to India's Digital Personal Data Protection (DPDP) Act.
          </p>
        </div>
      </div>

      {/* Data Subject Rights & Audio Retention (DPDP Act) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 card-shadow space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Personal Data Protection (DPDP) Rights</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">Your Data, Your Ownership</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Access, download, or permanently purge your voice recordings, verified competencies, and personal profile data at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Export Data */}
          <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-xs text-blue-900">Right to Data Portability</h3>
              <p className="text-[11px] text-blue-700/80 leading-relaxed">
                Download a complete, machine-readable JSON archive containing all your skills, voice sessions, courses, and certifications.
              </p>
            </div>
            <button
              onClick={async () => {
                try {
                  const data = await import('../../utils/apiClient').then(m => m.default.exportMyData());
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `skillpath_my_data_${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  alert(`Export error: ${err.message}`);
                }
              }}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
            >
              Export My Data (JSON)
            </button>
          </div>

          {/* Audio Retention Policy */}
          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-2">
            <h3 className="font-bold text-xs text-emerald-900">Audio Retention Policy</h3>
            <p className="text-[11px] text-emerald-700/80 leading-relaxed">
              <strong>Auto-Purge Active:</strong> All raw voice audio recordings are instantly purged from the server memory/storage after transcription. Only structured transcripts and extracted skills are retained.
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3 text-emerald-600" /> Zero Audio Residue
              </span>
            </div>
          </div>

          {/* Delete Account */}
          <div className="p-4 rounded-2xl border border-rose-100 bg-rose-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-xs text-rose-900">Right to Erasure</h3>
              <p className="text-[11px] text-rose-700/80 leading-relaxed">
                Permanently erase your account, verified skill credentials, voice logs, and progress history from all databases.
              </p>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.')) {
                  try {
                    await import('../../utils/apiClient').then(m => m.default.deleteMyAccount());
                    alert('Your account and all associated data have been permanently deleted.');
                    window.location.reload();
                  } catch (err) {
                    alert(`Deletion error: ${err.message}`);
                  }
                }
              }}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition"
            >
              Delete Account & Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
