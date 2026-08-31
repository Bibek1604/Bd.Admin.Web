import React, { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from '../../../components/BrandLogo';
import Input from '../../../components/ui/Input';

const EMAIL_RE = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading, error } = useAuth();
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const hasDanglingToken = !!localStorage.getItem('adminToken');
    if (hasDanglingToken && !isAuthenticated) {
      logout();
    }
  }, [isAuthenticated, logout]);

  const validate = (): boolean => {
    let valid = true;
    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const ok = await login(email.trim(), password);
    if (ok) {
      navigate('/', { replace: true });
    }
  };

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4 md:p-8 font-poppins font-light selection:bg-brand-100 selection:text-brand-900 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-surface-100 bg-white shadow-2xl shadow-slate-200 md:rounded-[3.5rem] lg:min-h-150 lg:flex-row md:lg:min-h-187.5"
      >
        <div className="hidden h-64 overflow-hidden sm:block lg:h-auto lg:flex-1 relative">
          <img
            src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=2070&auto=format&fit=crop"
            alt="Insurance Professional Office"
            className="absolute inset-0 w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 z-10 flex flex-col justify-center bg-linear-to-br from-brand-600/90 via-brand-700/80 to-brand-800/80 p-10 text-white backdrop-blur-[2px] lg:p-16">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 mb-10 shadow-2xl"
            >
              <ShieldCheck size={44} className="text-white" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl lg:text-4xl font-black tracking-tighter mb-5 leading-tight max-w-md"
            >
              LIC Intelligence <br />System Access
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-base lg:text-lg font-medium text-brand-50/80 max-w-xs leading-relaxed"
            >
              Sign in to the admin panel.
            </motion.p>
          </div>

          <div className="absolute bottom-10 left-10 lg:left-16 z-10 flex gap-4">
            <div className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md">
              v1.4 Enterprise
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/90 backdrop-blur-md">
              E2E Encrypted
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative">
          <div className="w-full max-w-md space-y-10 relative z-10">
            <div className="space-y-3">
              <div className="sm:hidden mb-6 inline-flex items-center rounded-2xl bg-white px-3 py-2 shadow-sm ring-1 ring-slate-100">
                <BrandLogo className="h-16 w-auto" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter">Welcome Back</h2>
              <p className="text-sm font-bold text-slate-400">Please sign in to continue.</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold border border-rose-100 flex items-center gap-3 overflow-hidden matte-shadow"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">!</div>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400 ml-1">Email</label>
                <div className={`group flex h-16 items-center rounded-3xl border-2 bg-surface-50 px-5 py-4 shadow-inner transition-all focus-within:bg-white ${emailError ? 'border-rose-400/60' : 'border-transparent focus-within:border-brand-500/20'}`}>
                  <Mail size={18} className="text-slate-300 group-focus-within:text-brand-500 transition-colors shrink-0" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="flex-1 bg-transparent border-none px-4"
                  />
                </div>
                {emailError && <p className="text-xs font-medium text-rose-600 pl-2 tracking-tight">{emailError}</p>}
              </div>

              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">Password</label>
                </div>
                <div className={`group flex h-16 items-center rounded-3xl border-2 bg-surface-50 px-5 py-4 shadow-inner transition-all focus-within:bg-white ${passwordError ? 'border-rose-400/60' : 'border-transparent focus-within:border-brand-500/20'}`}>
                  <Lock size={18} className="text-slate-300 group-focus-within:text-brand-500 transition-colors shrink-0" />
                  <Input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="flex-1 bg-transparent border-none px-4"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    className="shrink-0 text-slate-300 transition-colors hover:text-brand-500"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <p className="text-xs font-medium text-rose-600 pl-2 tracking-tight">{passwordError}</p>}
              </div>

              <div className="flex items-center gap-3 py-2">
                <input id="rem" type="checkbox" className="w-5 h-5 rounded-lg border-surface-200 text-brand-600 focus:ring-brand-500/20 cursor-pointer transition-all" />
                <label htmlFor="rem" className="text-sm font-bold text-slate-500 cursor-pointer hover:text-slate-700 select-none">Remember this device</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 text-sm font-extrabold tracking-tight text-white shadow-xl shadow-brand-200 transition-all hover:scale-105 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-10 text-center">
              <p className="mx-auto max-w-50 text-[10px] font-black uppercase tracking-widest text-slate-300 leading-relaxed">
                Compliance ID: LIC-GLOBAL-77 <br />
                © 2026 Life Insurance Corporation <br />
                Developed by Keen Tech Solution
              </p>
            </div>
          </div>

          <div className="absolute top-20 -right-20 w-80 h-80 bg-brand-50 rounded-full blur-[100px] opacity-40 pointer-events-none" />
          <div className="absolute bottom-20 -left-20 w-80 h-80 bg-blue-50 rounded-full blur-[100px] opacity-40 pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
