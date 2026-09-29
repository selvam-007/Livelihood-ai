import React, { useState, useMemo } from 'react';
import { 
  Landmark, 
  Calculator, 
  BadgePercent, 
  HelpCircle, 
  ArrowUpRight, 
  CheckCircle2,
  TrendingDown,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SchemeLoanCalculator({ occupation, defaultCost = 60000 }) {
  const { lang } = useLanguage();

  const [projectCost, setProjectCost] = useState(defaultCost);
  const [category, setCategory] = useState('women'); // 'women', 'sc_st', 'obc', 'general'
  const [location, setLocation] = useState('rural'); // 'rural', 'urban'
  const [tenureYears, setTenureYears] = useState(3); // 1 to 5 years

  // Calculate government subsidy percentage based on PMEGP / PM Vishwakarma guidelines
  const subsidyPercent = useMemo(() => {
    if (category === 'women' || category === 'sc_st' || category === 'obc') {
      return location === 'rural' ? 35 : 25;
    }
    return location === 'rural' ? 25 : 15;
  }, [category, location]);

  // Beneficiary own margin money (5% for special categories, 10% for general)
  const marginPercent = (category === 'general') ? 10 : 5;
  
  const marginMoney = Math.round(projectCost * (marginPercent / 100));
  const subsidyAmount = Math.round(projectCost * (subsidyPercent / 100));
  const netLoanAmount = Math.max(0, projectCost - marginMoney - subsidyAmount);

  // Subsidized interest rate (PM Vishwakarma / Mudra concession ~ 5% to 7%)
  const annualInterestRate = 0.05; // 5% p.a.
  const monthlyInterestRate = annualInterestRate / 12;
  const totalMonths = tenureYears * 12;

  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const monthlyEMI = useMemo(() => {
    if (netLoanAmount <= 0) return 0;
    const r = monthlyInterestRate;
    const n = totalMonths;
    const emi = (netLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [netLoanAmount, monthlyInterestRate, totalMonths]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Title & Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">
              {lang === 'ta' ? 'அரசு மானியம் & முத்ரா கடன் கணக்கீடு' : 'Govt Scheme & Micro-Loan Subsidy Calculator'}
            </h4>
            <p className="text-xs text-slate-500">
              {lang === 'ta' 
                ? 'PM விஸ்வகர்மா & முத்ரா திட்டத்தின் கீழ் உங்களின் மானியக் கணக்கீடு' 
                : 'PM Vishwakarma & PMEGP / Mudra Scheme Financing for ' + (occupation || 'Self-Employment')}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <BadgePercent className="w-3.5 h-3.5" />
          {subsidyPercent}% {lang === 'ta' ? 'அரசு மானியம்' : 'Govt Subsidy'}
        </span>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Project Cost Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
            <span>{lang === 'ta' ? 'தொழில் முதலீடு செலவு' : 'Total Project Cost'}</span>
            <span className="text-blue-600 font-bold text-sm">₹{projectCost.toLocaleString('en-IN')}</span>
          </div>
          <input 
            type="range" 
            min="10000" 
            max="300000" 
            step="5000"
            value={projectCost} 
            onChange={(e) => setProjectCost(Number(e.target.value))}
            className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>₹10,000 (Toolkit)</span>
            <span>₹3,00,000 (Micro Setup)</span>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            {lang === 'ta' ? 'பிரிவு (Category)' : 'Beneficiary Category'}
          </label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="women">Women Beneficiary (35% Subsidy)</option>
            <option value="sc_st">SC / ST / Divyang (35% Subsidy)</option>
            <option value="obc">OBC / Minority (35% Subsidy)</option>
            <option value="general">General (25% Subsidy)</option>
          </select>
        </div>

        {/* Location & Tenure */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 block">
            {lang === 'ta' ? 'பகுதி & திருப்பிச் செலுத்தும் காலம்' : 'Location & Loan Tenure'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700"
            >
              <option value="rural">Rural (35%)</option>
              <option value="urban">Urban (25%)</option>
            </select>
            <select 
              value={tenureYears} 
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700"
            >
              <option value={1}>1 Year</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
              <option value={5}>5 Years</option>
            </select>
          </div>
        </div>
      </div>

      {/* Financial Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <span className="text-[11px] text-slate-500 block">
            {lang === 'ta' ? 'உங்கள் பங்களிப்பு' : 'Own Contribution (' + marginPercent + '%)'}
          </span>
          <span className="text-sm font-bold text-slate-800">₹{marginMoney.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-[11px] text-emerald-700 font-medium block">
            {lang === 'ta' ? 'அரசு மானியம்' : 'Govt Subsidy (' + subsidyPercent + '%)'}
          </span>
          <span className="text-sm font-bold text-emerald-600">₹{subsidyAmount.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-[11px] text-blue-700 font-medium block">
            {lang === 'ta' ? 'வங்கி கடன் தொகை' : 'Net Bank Loan'}
          </span>
          <span className="text-sm font-bold text-blue-700">₹{netLoanAmount.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-[11px] text-purple-700 font-medium block">
            {lang === 'ta' ? 'மாதாந்திர தவணை (EMI)' : 'Monthly EMI (@5%)'}
          </span>
          <span className="text-base font-extrabold text-purple-700">₹{monthlyEMI.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/mo</span></span>
        </div>
      </div>

      {/* Official Government Schemes List */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          {lang === 'ta' ? 'பொருந்தக்கூடிய மத்திய அரசு திட்டங்கள்:' : 'Directly Applicable Central Schemes:'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a 
            href="https://pmvishwakarma.gov.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition group"
          >
            <div>
              <span className="font-bold text-slate-800 group-hover:text-blue-700">PM Vishwakarma Scheme</span>
              <p className="text-[10px] text-slate-500">₹15,000 Tool Voucher + 5% Collateral-Free Credit</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </a>
          <a 
            href="https://www.udyamimitra.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/30 transition group"
          >
            <div>
              <span className="font-bold text-slate-800 group-hover:text-emerald-700">PM Mudra Yojana (Shishu)</span>
              <p className="text-[10px] text-slate-500">Up to ₹50,000 for equipment purchase without security</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
          </a>
        </div>
      </div>
    </div>
  );
}
