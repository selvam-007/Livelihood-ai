import React from 'react';
import { ShieldCheck, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-auto text-xs text-slate-500 py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-center sm:text-left">
          <Award className="w-4 h-4 text-brand-400" />
          <span>
            {t.appTitle} — {t.initiative}
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Privacy Protected PII</span>
          </span>
          <span>•</span>
          <span>SIH 2024 Grid</span>
        </div>
      </div>
    </footer>
  );
}
