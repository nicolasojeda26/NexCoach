import React from 'react';
import Logo from './Logo';
import {
  UserCheck,
  ShieldCheck,
  Flame,
  RotateCcw,
  Sparkles,
  Zap,
  Bell
} from 'lucide-react';

export default function Navbar({ currentRole, setCurrentRole, appState, onResetData, onOpenBadges }) {
  const pendingPayments = appState.payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const student = appState.students[0]; // Agostina Baju

  return (
    <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-2xl border-b border-slate-800/80 px-3.5 sm:px-6 py-2.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand with New Custom Logo */}
        <Logo variant="full" />

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Athlete Streak Indicator */}
          <button
            onClick={onOpenBadges}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 text-xs font-black hover:border-amber-400/50 transition-all active:scale-95 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
            <span>18 DÍAS EN RACHA</span>
          </button>

          {/* Futuristic Role Switcher Pill */}
          <div className="flex items-center bg-dark-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setCurrentRole('coach')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] sm:text-xs transition-all ${
                currentRole === 'coach'
                  ? 'bg-gradient-to-r from-volt-neon to-emerald-400 text-slate-950 shadow-lg shadow-volt-glow/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Profe</span>
            </button>
            <button
              onClick={() => setCurrentRole('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[11px] sm:text-xs transition-all ${
                currentRole === 'student'
                  ? 'bg-gradient-to-r from-volt-neon to-emerald-400 text-slate-950 shadow-lg shadow-volt-glow/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Alumna</span>
            </button>
          </div>

          {/* Coach pending payments pill */}
          {currentRole === 'coach' && pendingPayments.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{pendingPayments.length} pendientes</span>
            </div>
          )}

          {/* Reset Demo Data button */}
          <button
            onClick={onResetData}
            title="Restablecer datos originales de la planilla"
            className="p-2 rounded-xl text-slate-400 hover:text-volt-neon hover:bg-dark-900 border border-slate-800 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
