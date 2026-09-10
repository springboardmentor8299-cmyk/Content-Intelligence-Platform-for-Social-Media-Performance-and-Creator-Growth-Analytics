import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  User,
  AtSign,
  Tag,
  X,
  KeyRound,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ParticleBackground } from '../components/common/ParticleBackground';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('mistercat@creatoriq.app');
  const [password, setPassword] = useState('••••••••••••');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regNiche, setRegNiche] = useState('Tech & Creative Coding');

  const { login, googleLogin, registerAccount } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    navigate('/');
  };

  const handleGoogleAuth = () => {
    googleLogin();
    navigate('/');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    registerAccount({
      name: regName || 'Creator Boss',
      email: regEmail,
      password: regPassword,
      handle: regHandle || '@creator_boss',
      niche: regNiche,
    });
    navigate('/');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2500);
  };

  const handleQuickDemo = () => {
    login('mistercat@creatoriq.app', 'demo123');
    navigate('/');
  };

  // 6 Specified Features with Professional Titles & Descriptions
  const keyFeatures = [
    {
      emoji: '🚀',
      title: '10-Second Health Rule',
      desc: 'Instant visual health score and channel performance metrics',
    },
    {
      emoji: '🔗',
      title: 'Multi-Platform Sync',
      desc: 'Direct OAuth 2.0 connection for YouTube, IG, FB, X & LinkedIn',
    },
    {
      emoji: '💰',
      title: 'Sponsorship Pipeline',
      desc: 'Track brand deals, deliverable milestones & revenue payouts',
    },
    {
      emoji: '📊',
      title: 'Real-Time Analytics',
      desc: 'Live telemetry engine with zero-latency metric updates',
    },
    {
      emoji: '👥',
      title: 'Audience Insights',
      desc: 'Comprehensive demographic breakdown, peak hours & regional reach',
    },
    {
      emoji: '📈',
      title: 'Growth Forecasting',
      desc: 'Predictive AI algorithms for subscriber & revenue trajectory',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FC] dark:bg-[#0A0E1A] text-slate-900 dark:text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans selection:bg-[#4A7CF7] selection:text-white transition-colors duration-300">
      {/* Animated Background */}
      <ParticleBackground />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center z-10 my-6">
        {/* ================= LEFT COLUMN (50%) ================= */}
        <div className="space-y-6 flex flex-col justify-center">
          {/* Main Headline */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4A7CF7]/15 border border-[#4A7CF7]/30 text-[#4A7CF7] dark:text-[#00D4FF] text-xs font-mono font-semibold">
              <Sparkles size={14} />
              <span>Enterprise Creator Intelligence</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Master Your Creator Empire with{' '}
              <span className="bg-gradient-to-r from-[#4A7CF7] via-[#00D4FF] to-[#7C5CFC] bg-clip-text text-transparent animate-gradient-shift">
                Real-Time Analytics
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-[#8B9BB5] leading-relaxed font-normal">
              Consolidate views, engagement velocity, audience demographics, and multi-channel revenue streams across YouTube, Instagram, Facebook, X, and LinkedIn into a unified performance dashboard.
            </p>
          </div>

          {/* 6 Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {keyFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#1A2233] hover:bg-slate-50 dark:hover:bg-[#1F2840] p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex items-start gap-3.5 transition-all duration-200 shadow-sm group"
              >
                <div className="text-xl sm:text-2xl shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group-hover:scale-105 transition-transform">
                  {feature.emoji}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#8B9BB5] leading-normal mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Tagline Card */}
          <div className="bg-white dark:bg-[#1A2233] p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 text-center shadow-sm">
            <p className="text-sm sm:text-base font-bold tracking-wider bg-gradient-to-r from-[#00D4FF] via-[#7C5CFC] to-[#FF6B9D] bg-clip-text text-transparent italic">
              "Your complete creator empire, visualized in real-time."
            </p>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (50%) ================= */}
        <div className="space-y-6 flex flex-col justify-center">
          {/* CreatorIQ Logo */}
          <div className="flex items-center justify-center sm:justify-start gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#1A2233] border border-slate-200 dark:border-white/10 max-w-xs mx-auto sm:mx-0 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#4A7CF7] via-[#00D4FF] to-[#7C5CFC] flex items-center justify-center shadow-md shrink-0">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                CreatorIQ
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00C897]/15 text-[#00C897] font-mono border border-[#00C897]/40 font-bold">
                  PRO
                </span>
              </h2>
              <p className="text-[11px] text-[#4A7CF7] dark:text-[#00D4FF] font-mono uppercase tracking-widest font-semibold">
                Creator Intelligence OS
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-[#1A2233] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-lg relative">
            {/* Card Header & Tab Toggle */}
            <div className="mb-6">
              <div className="flex items-center p-1.5 bg-slate-100 dark:bg-[#0D1421] rounded-2xl border border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'login'
                      ? 'bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white shadow-md border border-white/20'
                      : 'text-slate-500 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'register'
                      ? 'bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white shadow-md border border-white/20'
                      : 'text-slate-500 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* "Continue with Google" Button */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-[#131929] hover:bg-slate-200 dark:hover:bg-[#1F2840] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-semibold text-xs transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                {/* Google G Logo SVG */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.37 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                </div>
                <span className="relative bg-white dark:bg-[#1A2233] px-3 text-[10px] font-mono text-slate-400 dark:text-[#6B7B95] uppercase">
                  Or with email credentials
                </span>
              </div>
            </div>

            {/* TAB 1: SIGN IN FORM */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1.5 uppercase font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="mistercat@creatoriq.app"
                      className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] uppercase font-mono">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-[#4A7CF7] dark:text-[#00D4FF] hover:underline font-mono"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* "Sign In" Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] hover:opacity-95 text-white font-bold text-xs tracking-wide transition-all shadow-md border border-white/20 flex items-center justify-center gap-2 group mt-2"
                >
                  <span>Sign In</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* "Create New Account" Link */}
                <div className="text-center pt-3 border-t border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-[#8B9BB5]">Don't have an account? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-xs font-bold text-[#4A7CF7] dark:text-[#00D4FF] hover:underline font-mono"
                  >
                    Create New Account
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: CREATE NEW ACCOUNT FORM */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1 uppercase font-mono">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Mister Cat"
                        className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1 uppercase font-mono">
                      Handle
                    </label>
                    <div className="relative">
                      <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                      <input
                        type="text"
                        value={regHandle}
                        onChange={(e) => setRegHandle(e.target.value)}
                        placeholder="@cat_boss"
                        className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7]"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1 uppercase font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="creator@domain.com"
                      className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1 uppercase font-mono">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1 uppercase font-mono">
                      Niche / Category
                    </label>
                    <div className="relative">
                      <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                      <input
                        type="text"
                        value={regNiche}
                        onChange={(e) => setRegNiche(e.target.value)}
                        placeholder="AI & Creative Coding"
                        className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] hover:opacity-95 text-white font-bold text-xs tracking-wide transition-all shadow-md border border-white/20 flex items-center justify-center gap-2 group mt-2"
                >
                  <span>Create Account & Launch Dashboard</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="text-center pt-2 border-t border-slate-200 dark:border-white/10">
                  <span className="text-xs text-slate-500 dark:text-[#8B9BB5]">Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-bold text-[#4A7CF7] dark:text-[#00D4FF] hover:underline font-mono"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Footer Action */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500 dark:text-[#8B9BB5] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#00C897]" />
                OAuth 2.0 Security Standard
              </span>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-[11px] text-[#4A7CF7] dark:text-[#00D4FF] hover:underline font-semibold flex items-center gap-1 transition-colors font-mono"
              >
                <Sparkles size={12} />
                Quick Demo as @cat_boss
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="w-full max-w-md bg-white dark:bg-[#1A2233] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white relative shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4A7CF7]/15 border border-[#4A7CF7]/30 flex items-center justify-center text-[#4A7CF7] dark:text-[#00D4FF]">
                  <KeyRound size={18} />
                </div>
                <h3 className="text-base font-bold">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#00C897]/15 text-[#00C897] border border-[#00C897]/30 flex items-center justify-center mx-auto">
                  <Check size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reset Link Dispatched!</h4>
                <p className="text-xs text-slate-500 dark:text-[#8B9BB5]">
                  We sent password reset instructions to <span className="text-[#4A7CF7] dark:text-[#00D4FF]">{forgotEmail || 'your email'}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="py-4 space-y-4">
                <p className="text-xs text-slate-500 dark:text-[#8B9BB5] leading-relaxed">
                  Enter your registered work email address below and we'll send you a password reset link.
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-[#8B9BB5] mb-1.5 uppercase font-mono">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8B9BB5]" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="mistercat@creatoriq.app"
                      className="w-full bg-slate-100 dark:bg-[#131929] border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#6B7B95] focus:outline-none focus:border-[#4A7CF7]"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-[#8B9BB5] hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#4A7CF7] to-[#00D4FF] text-white font-bold text-xs shadow-md"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
