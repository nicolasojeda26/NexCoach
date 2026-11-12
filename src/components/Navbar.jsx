import React from 'react';
import Logo from './Logo';
import { UserCheck, ShieldCheck, Flame, RotateCcw, LogOut, Cloud } from 'lucide-react';

export default function Navbar({
  currentRole, setCurrentRole, appState, onResetData, onOpenBadges,
  activeStudentId, onChangeStudent, mode, user, onSignOut, onExitDemo
}) {
  const pendingPayments = appState.payments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const streak = appState.progress?.streakWeeks || 0;
  const roleBtn = (active) => `flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-[11px] sm:text-xs transition-all ${
    active ? 'bg-gradient-to-r from-volt-neon to-emerald-400 text-slate-950 shadow-lg shadow-volt-glow/25' : 'text-slate-400 hover:text-slate-200'
  }`;

  return (
    <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-2xl border-b border-slate-800/80 px-3.5 sm:px-6 py-2.5">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        <Logo variant="full" />

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Racha real: semanas seguidas con al menos un entrenamiento */}
          {appState.activeStudent && (
            <button
              onClick={onOpenBadges}
              aria-label={`Racha de ${streak} semanas. Ver medallas y récords`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-300 text-xs font-black hover:border-amber-400/50 transition-all active:scale-95 shadow-sm"
            >
              <Flame className={`w-3.5 h-3.5 fill-amber-400 text-amber-400 ${streak > 0 ? 'motion-safe:animate-bounce' : ''}`} aria-hidden="true" />
              <span>{streak} {streak === 1 ? 'SEMANA' : 'SEMANAS'} EN RACHA</span>
            </button>
          )}

          {/* Selector de alumno (profe o demo) */}
          {onChangeStudent && appState.students.length > 0 && (
            <label className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="sr-only lg:not-sr-only">Alumno:</span>
              <select
                value={activeStudentId || ''}
                onChange={(e) => onChangeStudent(e.target.value)}
                aria-label="Alumno activo"
                className="max-w-[11rem] px-2 py-1.5 rounded-xl bg-dark-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-volt-neon"
              >
                {appState.students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
          )}

          {/* Cambio de vista Profe/Alumno: solo en la demo */}
          {setCurrentRole && (
            <div className="flex items-center bg-dark-900/90 p-1 rounded-2xl border border-slate-800 shadow-inner" role="group" aria-label="Ver la app como">
              <button onClick={() => setCurrentRole('coach')} aria-pressed={currentRole === 'coach'} className={roleBtn(currentRole === 'coach')}>
                <ShieldCheck className="w-3.5 h-3.5 hidden sm:block" aria-hidden="true" />
                <span>Profe</span>
              </button>
              <button onClick={() => setCurrentRole('student')} aria-pressed={currentRole === 'student'} className={roleBtn(currentRole === 'student')}>
                <UserCheck className="w-3.5 h-3.5 hidden sm:block" aria-hidden="true" />
                <span>Alumno</span>
              </button>
            </div>
          )}

          {mode === 'cloud' && (
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 max-w-[12rem] truncate" title={user?.email}>
              <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
              {user?.email}
            </span>
          )}

          {currentRole === 'coach' && pendingPayments.length > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-rose-500 motion-safe:animate-ping" aria-hidden="true" />
              <span>{pendingPayments.length} pendientes</span>
            </div>
          )}

          {onExitDemo && (
            <button onClick={onExitDemo} className="hidden sm:block px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10">
              Iniciar sesión
            </button>
          )}

          {onResetData && (
            <button
              onClick={onResetData}
              aria-label="Restablecer datos de la demo"
              title="Restablecer datos de la demo"
              className="p-2 rounded-xl text-slate-400 hover:text-volt-neon hover:bg-dark-900 border border-slate-800 transition-colors active:scale-95"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {onSignOut && (
            <button
              onClick={onSignOut}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-dark-900 border border-slate-800 transition-colors active:scale-95"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Selector de alumno en celular */}
      {onChangeStudent && appState.students.length > 0 && (
        <div className="md:hidden max-w-7xl mx-auto mt-2">
          <select
            value={activeStudentId || ''}
            onChange={(e) => onChangeStudent(e.target.value)}
            aria-label="Alumno activo"
            className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-slate-800 text-white text-xs font-bold focus:outline-none focus:border-volt-neon"
          >
            {appState.students.map(s => <option key={s.id} value={s.id}>Alumno: {s.name}</option>)}
          </select>
        </div>
      )}
    </header>
  );
}
