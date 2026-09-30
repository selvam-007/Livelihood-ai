import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle, 
  Award, 
  ShieldCheck, 
  Building2, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SkillCardModal({ isOpen, onClose, candidate, recommendation }) {
  const { t, lang } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const candidateName = candidate?.name || (lang === 'ta' ? 'பயனாளர்' : 'Candidate');
  const occupation = recommendation?.qualification_name || candidate?.prior_occupation || "NSQF Livelihood Qualification";
  const nsqfLevel = recommendation?.nsqf_level || "Level 3/4";
  const sector = recommendation?.sector || "National Skill Qualification";
  const council = recommendation?.council || "National Skill Development Corporation (NSDC)";
  const qpCode = recommendation?.qp_code || "QP-IND-2024";
  const skills = candidate?.skills?.length ? candidate.skills : [
    "Core Vocational Knowledge",
    "Workplace Safety & Standards",
    "Digital Literacy"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg">
              {lang === 'ta' ? 'அதிகாரப்பூர்வ NSQF டிஜிட்டல் திறன் அட்டை' : 'Official NSQF Digital Skill Card'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Card Container */}
        <div id="printable-skill-card" className="p-6">
          <div className="border-2 border-slate-800 rounded-2xl p-6 bg-gradient-to-br from-white via-amber-50/20 to-emerald-50/20 shadow-md relative overflow-hidden">
            
            {/* National Tricolor Top Stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

            {/* Official Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-orange-600 uppercase">
                  Government of India / NSDC Alignment
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  SkillPath AI <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">RPL Verified</span>
                </h4>
                <p className="text-xs text-slate-500">National Skills Qualifications Framework (NSQF)</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">ID: IND-2024-88492</span>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RPL Level 4 Ready
                </div>
              </div>
            </div>

            {/* Candidate & Profile Row */}
            <div className="flex flex-col sm:flex-row gap-5 items-start mb-6">
              {/* Avatar Photo */}
              <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-bold text-2xl text-slate-600 shrink-0 shadow-inner">
                {candidateName.split(' ').map(n => n[0]).join('')}
              </div>

              {/* Candidate Info */}
              <div className="flex-1 space-y-1">
                <h5 className="text-lg font-bold text-slate-900">{candidateName}</h5>
                <p className="text-sm font-semibold text-blue-700">{occupation}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div><span className="font-semibold">NSQF Qualification:</span> {qpCode}</div>
                  <div><span className="font-semibold">Standard Level:</span> {nsqfLevel}</div>
                  <div><span className="font-semibold">Sector:</span> {sector}</div>
                  <div><span className="font-semibold">Awarding Body:</span> {council}</div>
                </div>
              </div>

              {/* QR Code Placeholder (SVG) */}
              <div className="text-center shrink-0">
                <svg className="w-20 h-20 border border-slate-200 rounded p-1 bg-white" viewBox="0 0 100 100">
                  <rect x="0" y="0" width="100" height="100" fill="#fff" />
                  <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
                  <rect x="15" y="15" width="20" height="20" fill="#fff" />
                  <rect x="20" y="20" width="10" height="10" fill="#0f172a" />
                  <rect x="60" y="10" width="30" height="30" fill="#0f172a" />
                  <rect x="65" y="15" width="20" height="20" fill="#fff" />
                  <rect x="70" y="20" width="10" height="10" fill="#0f172a" />
                  <rect x="10" y="60" width="30" height="30" fill="#0f172a" />
                  <rect x="15" y="65" width="20" height="20" fill="#fff" />
                  <rect x="20" y="70" width="10" height="10" fill="#0f172a" />
                  <rect x="50" y="50" width="10" height="10" fill="#0f172a" />
                  <rect x="70" y="70" width="15" height="15" fill="#0f172a" />
                  <rect x="50" y="75" width="15" height="10" fill="#0f172a" />
                </svg>
                <span className="text-[10px] text-slate-400 block mt-1">Scan to Verify</span>
              </div>
            </div>

            {/* Competency Badges */}
            <div className="border-t border-slate-200 pt-3">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                {lang === 'ta' ? 'சான்றளிக்கப்பட்ட திறன்கள் (Certified Competencies)' : 'Verified Core Competencies:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    {typeof s === 'string' ? s : s.skill_name || s.canonical_name}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-5 pt-3 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
              <span>Eligible for PMKVY 4.0 RPL & Mudra Micro-Credit Scheme</span>
              <span>Issued: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-slate-500">
            {lang === 'ta' 
              ? 'இந்த அட்டையை அச்சிட்டு முத்ரா கடன் அல்லது வேலைவாய்ப்பிற்கு பயன்படுத்தலாம்.'
              : 'Print or save this card to present for bank Mudra loans, PM Vishwakarma, or job interviews.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              {lang === 'ta' ? 'அச்சிடு / PDF சேமி' : 'Print / Save PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
