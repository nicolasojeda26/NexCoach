import React from 'react';
import {
  X,
  Award,
  Crown,
  Flame,
  Sparkles,
  Zap,
  CheckCircle2,
  TrendingUp,
  Dumbbell
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEscape } from '../hooks/useEscape';

export default function PRBadgesModal({ isOpen, onClose, appState }) {
  useEscape(isOpen, onClose);
  if (!isOpen) return null;

  // Todo calculado con los datos del alumno activo (sesiones, fuerza, videos, medidas).
  const gamification = appState.progress;

  const handleCelebrate = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti", e);
    }
  };

  const iconMap = {
    Crown: Crown,
    Flame: Flame,
    Award: Award,
    Sparkles: Sparkles,
    Zap: Zap
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Récords y Medallas{appState.activeStudent ? ` • ${appState.activeStudent.name}` : ''}</h3>
              <span className="text-[11px] text-emerald-400 font-bold">Nivel {gamification.level} • {gamification.levelTitle}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level XP Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-emerald-950/40 border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Puntos de Experiencia</span>
            <span className="text-2xl font-black text-white">{gamification.totalXP} XP</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Próximo nivel en {gamification.nextLevelXP - gamification.totalXP} XP • {gamification.streakWeeks} semanas en racha • {gamification.attendancePct}% asistencia
            </span>
          </div>
          <button
            onClick={handleCelebrate}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Celebrar Logros</span>
          </button>
        </div>

        {/* Unlocked Badges */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Medallas ({gamification.badges.filter(b => b.unlocked).length} de {gamification.badges.length} desbloqueadas):
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {gamification.badges.map(b => {
              const Icon = iconMap[b.icon] || Award;
              return (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3 hover:border-amber-500/40 transition-colors ${b.unlocked ? '' : 'opacity-45 grayscale'}`}
                >
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{b.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{b.desc}</p>
                    <span className={`text-[9px] font-semibold block mt-1 ${b.unlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {b.unlocked ? 'Desbloqueada' : `Bloqueada${b.progress ? ` • ${b.progress}` : ''}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PR History Table */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Marcas Personales Actuales:
          </span>

          <div className="space-y-1.5">
            {gamification.personalRecords.length === 0 && (
              <p className="text-xs text-slate-500">Todavía no hay registros de fuerza.</p>
            )}
            {gamification.personalRecords.map((pr, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold text-slate-200">{pr.exercise}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 line-through text-[11px]">{pr.previous} kg</span>
                  <span className="font-black text-emerald-400 text-sm">➔ {pr.weight} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
