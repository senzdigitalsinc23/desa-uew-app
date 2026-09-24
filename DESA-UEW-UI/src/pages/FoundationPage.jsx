import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function FoundationPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden relative">
      {/* Gradient Background — white at top fading to blue at bottom */}
      <div className="absolute inset-0 bg-desa-gradient pointer-events-none" />
      {/* Red glow overlay at bottom */}
      <div className="absolute inset-0 desa-gradient-red-glow pointer-events-none" />

      {/* UEW Accent Bar */}
      <div className="w-full h-1.5 bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#ef4444]" />

      {/* Top Nav */}
      <header className="sticky top-0 z-30 shadow-sm bg-gradient-to-r from-[#1e3a8a] via-[#3b82f6] to-[#ef4444]">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logos — LEFT side, clickable */}
          <div className="flex items-center gap-3">
            <a href="https://uew.edu.gh" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1.5 shadow-sm shrink-0">
                <img src="/images/uew logo.webp" alt="UEW" className="w-full h-full object-contain" />
              </div>
            </a>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1.5 shadow-sm shrink-0">
                <img src="/images/DESA Logo.webp" alt="DESA" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col items-start border-l border-white/20 pl-2 sm:pl-3 min-w-0">
                <span className="text-[7px] sm:text-[8px] md:text-[9px] font-extrabold text-white uppercase tracking-tight leading-tight truncate">
                  Distance Education Students Association
                </span>
                <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black text-red-300 uppercase tracking-wider leading-tight">
                  DESA · UEW
                </span>
                <span className="text-[6px] sm:text-[7px] md:text-[8px] text-white/70 font-semibold uppercase tracking-wide leading-tight truncate">
                  University of Education, Winneba
                </span>
              </div>
            </button>
          </div>

          {/* Auth buttons — RIGHT side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 border border-slate-200">
                  <div className="w-5 h-5 rounded-full bg-uew-red flex items-center justify-center text-white text-[9px] font-black">
                    {user.name?.charAt(0) || 'A'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 max-w-[80px] truncate">{user.name}</span>
                </div>
                <button onClick={() => navigate('/admin')} className="px-2.5 py-1.5 rounded-lg bg-uew-navy text-white text-[10px] font-bold hover:bg-uew-red transition-colors cursor-pointer">
                  Admin
                </button>
                <button onClick={logout} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-red-50 hover:text-uew-red transition-colors cursor-pointer">
                  Out
                </button>
              </>
            ) : (
              <button onClick={() => navigate('/login')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-uew-navy text-[10px] font-bold hover:border-uew-red hover:text-uew-red transition-all cursor-pointer">
                <UserCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero — Founder centered, large */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg flex flex-col items-center text-center"
        >
          {/* Large Founder Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-5"
          >
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-uew-red via-red-700 to-uew-red rounded-full opacity-25 blur-2xl animate-pulse-slow" />
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 xl:w-[28rem] xl:h-[28rem] rounded-full p-3 sm:p-3.5 md:p-4 bg-gradient-to-b from-uew-red via-[#881014] to-[#600A0D] shadow-2xl portrait-glow">
                <div className="w-full h-full rounded-full overflow-hidden bg-uew-navy border-4 border-white shadow-inner">
                  <img
                    src="/images/Founder.webp"
                    alt="Founder"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: '50% 15%' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                    loading="eager"
                  />
                </div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-uew-navy border-2 border-uew-red text-white text-xs font-extrabold uppercase tracking-wider whitespace-nowrap shadow-xl">
                Founder
              </div>
            </div>
          </motion.div>

          {/* Name & Title — white card for readability on blue bg */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-6 w-full max-w-lg"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-uew-navy font-serif leading-tight">
                H.E Abdul Salam Alhasan
              </h1>
              <p className="text-[10px] sm:text-xs text-uew-red font-bold uppercase tracking-widest mt-1">
                National President · 2019
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 font-medium">
                Founder · Distance Learning Students Association
              </p>
            </div>
          </motion.div>

          {/* SEEK Button — larger & longer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="w-full max-w-xl"
          >
            <button
              onClick={() => navigate('/seek')}
              className="btn-seek relative group inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl text-white text-sm sm:text-base font-extrabold tracking-widest uppercase shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border-2 border-white/30 overflow-hidden cursor-pointer w-full sm:w-auto"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform group-hover:rotate-12 duration-300" />
              <span className="font-black tracking-widest text-white drop-shadow-sm">
                SEEK
              </span>
            </button>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-5 text-xs text-slate-400 font-medium"
          >
            University of Education, Winneba · CoDeL
          </motion.p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center bg-gradient-to-r from-[#dc2626] via-[#ef4444] to-[#3b82f6] z-20 relative">
        <p className="text-[10px] text-white font-bold">
          DESA UEW — A project Of Evans Koomson (Aspiring President)
        </p>
      </footer>
    </div>
  );
}
