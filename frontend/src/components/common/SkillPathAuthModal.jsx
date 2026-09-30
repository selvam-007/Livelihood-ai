import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mic, 
  Sparkles, 
  Award, 
  Target, 
  TrendingUp, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  Phone,
  KeyRound,
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Building2,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthHeroIllustration } from './HeroIllustrations';
import apiClient from '../../utils/apiClient';

export default function SkillPathAuthModal({ isOpen, onClose, initialMode = 'otp' }) {
  const { loginWithCredentials, loginWithPhoneOtp, registerWithCredentials, setCurrentRole } = useAuth();

  const [authType, setAuthType] = useState('otp'); // 'otp' or 'password'
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // OTP Flow State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Email/Password Flow State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    if (initialMode === 'login' || initialMode === 'register') {
      setAuthType('password');
      setMode(initialMode);
      setIsAdminMode(false);
    } else {
      setAuthType('otp');
      setIsAdminMode(false);
    }
    setError(null);
    setSuccessMsg(null);
    setOtpSent(false);
  }, [initialMode, isOpen]);

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.sendPhoneOtp(phoneNumber);
      setOtpSent(true);
      setOtpCountdown(60);
      setSuccessMsg(res.message || 'OTP sent successfully to your mobile number.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!otpCode || otpCode.length < 4) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      await loginWithPhoneOtp(phoneNumber, otpCode, {
        full_name: fullName || undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const cleanIdentifier = (emailOrPhone || '').trim();
      const isEmail = cleanIdentifier.includes('@');
      if (mode === 'login') {
        await loginWithCredentials(cleanIdentifier, password);
      } else {
        await registerWithCredentials({
          email: isEmail ? cleanIdentifier : undefined,
          phone: !isEmail ? cleanIdentifier : undefined,
          password: password,
          full_name: fullName || 'Candidate User',
          role: 'candidate'
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo 1-Click Login Helper for each role
  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const credentials = {
        candidate: { email: 'selvamc01@gmail.com', password: 'CandidatePass123!' },
        field_agent: { email: 'agent.kumar@livelihood.ai', password: 'AgentSecurePass123!' },
        training_provider: { email: 'provider.tn@livelihood.ai', password: 'ProviderSecurePass123!' }
      };
      const cred = credentials[role];
      if (cred) {
        await loginWithCredentials(cred.email, cred.password);
        onClose();
      }
    } catch (err) {
      setError(`Demo login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border border-slate-200/80 max-h-[94vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Hero Side */}
        <div className="hidden md:flex md:w-5/12 bg-[#0c102a] text-white p-7 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Tagline */}
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                SkillPath <span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Your Voice • Your Skills • Your Future
            </p>
          </div>

          {/* Center Heading & Illustration */}
          <div className="relative z-10 my-3 space-y-2">
            <h2 className="text-xl font-black leading-tight tracking-tight">
              From your voice <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">
                to a certified livelihood
              </span>
            </h2>

            <p className="text-[11px] text-slate-300 leading-relaxed font-light">
              AI-driven skill diagnosis, multilingual voice pathways, and real-world multi-role workflows.
            </p>

            <div className="w-full h-32 rounded-xl overflow-hidden pt-1">
              <AuthHeroIllustration className="w-full h-full" />
            </div>
          </div>

          {/* Demo Role Fast-Switch */}
          <div className="relative z-10 pt-3 border-t border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Demo Access
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('candidate')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-slate-200 flex items-center justify-center gap-1.5 transition text-center"
              >
                <Users className="w-3 h-3 text-blue-400" />
                <span>Candidate</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('field_agent')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-slate-200 flex items-center justify-center gap-1.5 transition text-center"
              >
                <Smartphone className="w-3 h-3 text-teal-400" />
                <span>Field Agent</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('training_provider')}
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-medium text-slate-200 flex items-center justify-center gap-1.5 transition text-center"
              >
                <Building2 className="w-3 h-3 text-amber-400" />
                <span>Provider</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Auth Type Tabs: Mobile OTP vs Email/Password */}
            <div className="flex p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => { setAuthType('otp'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  authType === 'otp'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Mobile OTP (Candidate)</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthType('password'); setError(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                  authType === 'password'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Email & Password</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FLOW 1: MOBILE OTP AUTH */}
            {authType === 'otp' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Phone OTP Login
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fast, passwordless login for candidates and beneficiaries.
                  </p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Mobile Number (India)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">+91</span>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="9876543210"
                          maxLength={15}
                          className="w-full pl-12 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-900 font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        In development mode, OTP is logged to console and defaults to 123456.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all shadow-blue-500/20"
                    >
                      {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-900">Sent to: {phoneNumber}</span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-blue-700 font-bold hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">6-Digit OTP Code</label>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full p-2.5 text-center text-lg font-bold tracking-widest rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px]">
                        {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Did not receive code?'}
                      </span>
                      {otpCountdown === 0 && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="text-blue-600 font-semibold hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all shadow-blue-500/20"
                    >
                      {loading ? 'Verifying...' : 'Verify & Enter Platform'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* FLOW 2: EMAIL / PASSWORD AUTH */}
            {authType === 'password' && (
              <div>
                <div className="space-y-1 mb-4">
                  {isAdminMode && (
                    <div className="mb-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Administrative Portal Verification:</span>
                        <p className="text-[11px] text-purple-700">Please authenticate with administrative credentials to access the state intelligence portal.</p>
                      </div>
                    </div>
                  )}
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {isAdminMode ? 'Admin Authentication' : mode === 'login' ? 'Sign In with Password' : 'Create Account'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAdminMode ? 'Enter administrator email and password' : mode === 'login' ? 'Enter your credentials to access your portal' : 'Register a new candidate profile'}
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Candidate Name"
                        className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Email Address or Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="user@livelihood.ai or 9876543210"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 focus:bg-white text-slate-900"
                    />
                  </div>

                  {mode === 'login' && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => alert('Demo password reset link simulated.')}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all shadow-blue-500/20"
                  >
                    {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                <div className="text-center mt-3 text-xs text-slate-500">
                  {mode === 'login' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        onClick={() => setMode('register')}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      Already registered?{' '}
                      <button
                        onClick={() => setMode('login')}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
