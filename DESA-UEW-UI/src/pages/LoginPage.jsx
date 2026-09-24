import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { validateLogin } from '../data/authUtils';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const result = validateLogin(email.trim(), password);
    if (result.success) {
      login(result.user);
      navigate('/admin');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F7FB] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-uew-red via-[#C52227] to-uew-red" />
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-uew-gold via-amber-300 to-uew-gold" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-uew-red/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-uew-navy/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-dot-pattern opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-uew-navy transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-uew-navy mb-4 shadow-lg">
              <ShieldCheck className="w-7 h-7 text-uew-red" />
            </div>
            <h1 className="text-xl font-black text-uew-navy font-serif">DESA Admin Portal</h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              University of Education, Winneba
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Sign in with your staff email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@uew.edu.gh"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red focus:bg-white transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-uew-red/20 focus:border-uew-red focus:bg-white transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-uew-red hover:bg-uew-redHover text-white text-sm font-extrabold tracking-wide uppercase transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Demo credentials */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@uew.edu.gh');
                    setPassword('admin123');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-uew-red/40 hover:bg-red-50 hover:text-uew-red transition-all cursor-pointer text-left"
                >
                  <span className="block font-bold">Admin</span>
                  <span className="text-slate-400">admin@uew.edu.gh</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('staff@uew.edu.gh');
                    setPassword('staff123');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-uew-red/40 hover:bg-red-50 hover:text-uew-red transition-all cursor-pointer text-left"
                >
                  <span className="block font-bold">Staff</span>
                  <span className="text-slate-400">staff@uew.edu.gh</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        <p className="mt-6 text-center text-[11px] text-slate-400 font-medium">
          Education for Service • UEW Distance Learning
        </p>
      </div>
    </div>
  );
}
