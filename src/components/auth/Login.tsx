import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@beemadiary.com');
  const [password, setPassword] = useState('admin123');
  const { login, loading, error } = useAuth();
  const { isAuthenticated } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F0F4F2] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-green-100/40 blur-[100px] rounded-full delay-1000" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-[2.5rem] overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white/40 relative z-10 animate-fade-in">
        
        {/* Left Side: Form Section */}
        <div className="p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-10 text-left">
             <div className="mb-8 inline-flex items-center rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
               <BrandLogo className="h-12 w-auto sm:h-14" />
             </div>
             
             <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">Admin Login</h2>
             <p className="text-slate-500 font-medium">Please enter your credentials to access the administrative panel.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-700 font-medium"
                  placeholder="admin@beemadiary.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-slate-700 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500 transition-all" />
                <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 leading-relaxed">
                Compliance ID: LIC-GLOBAL-77 <br />
                © 2026 Life Insurance Corporation <br />
                Developed by Keen Tech Solution
             </p>
          </div>
        </div>

        {/* Right Side: Identity Section (Exact Clone of User Panel) */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-[#16A34A] text-white relative">
          <div className="absolute inset-0 opacity-10 auth-pattern-overlay" />
          
          <div className="relative z-10">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md w-fit mb-12 shadow-inner border border-white/20">
              <ShieldCheck size={40} className="text-white" />
            </div>
            <h3 className="text-5xl font-black leading-tight tracking-tighter mb-6">
              Empowering <br/> Future-Proof <br/> Insurance.
            </h3>
            <p className="text-green-50/80 font-medium text-lg max-w-sm leading-relaxed">
              Your comprehensive platform for client management, policy tracking, and business growth.
            </p>
          </div>

          <div className="relative z-10">
             <div className="flex -space-x-4 mb-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#16A34A] bg-green-100 flex items-center justify-center text-[#16A34A] font-black text-xs overflow-hidden shadow-lg">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`} alt="avatar" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-2xl border-4 border-[#16A34A] bg-white text-[#16A34A] flex items-center justify-center font-black text-xs shadow-lg">
                  +12k
                </div>
             </div>
             <p className="text-sm font-bold text-green-100/70 uppercase tracking-widest">Trusted by over 12,000 agents globally</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
