import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Play,
  Timer,
  Flame,
  Award,
  RotateCcw,
  Sparkles,
  ChevronRight,
  HeartPulse,
  Plus,
  Minus,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WorkoutView({ appState, setSelectedVideo, activeWorkoutDay, mesoName }) {
  const currentMeso = appState.mesocycles[0];
  const currentDay = activeWorkoutDay || currentMeso.days[0];

  // State of completed sets: key: "exId-roundIndex", val: boolean
  const [completedSets, setCompletedSets] = useState({});
  const [weightsUsed, setWeightsUsed] = useState({});
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [rpeScore, setRpeScore] = useState(7);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculations
  const totalRounds = currentDay.blocks.reduce((acc, b) => acc + (b.exercises.length * b.rounds), 0);
  const completedCount = Object.values(completedSets).filter(Boolean).length;
  const progressPercent = totalRounds > 0 ? Math.round((completedCount / totalRounds) * 100) : 0;

  const toggleSet = (key) => {
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getWeightNumber = (ex) => {
    const custom = weightsUsed[ex.id];
    if (custom !== undefined) return custom;
    // parse initial weight from string like "40 kg"
    const match = String(ex.defaultWeight).match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 20;
  };

  const adjustWeight = (exId, delta, currentVal) => {
    const next = Math.max(0, currentVal + delta);
    setWeightsUsed(prev => ({
      ...prev,
      [exId]: next
    }));
  };

  const handleFinishWorkout = () => {
    setWorkoutFinished(true);
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn("Confetti error", e);
    }
  };

  const handleResetWorkout = () => {
    setCompletedSets({});
    setWorkoutFinished(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24 safe-area-bottom">
      {/* Mobile-First Header Bar with Live Workout Timer */}
      <div className="relative overflow-hidden p-5 sm:p-7 rounded-3xl bg-dark-900 border border-volt-neon/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-volt-glow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[11px] font-black text-volt-neon uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-volt-neon" />
            <span>SESIÓN EN VIVO • {mesoName || currentMeso.name}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white mt-1 uppercase tracking-tight font-display">
            {currentDay.name} — <span className="text-gradient-volt">{currentDay.focus}</span>
          </h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-volt-neon font-black">
              <Clock className="w-3.5 h-3.5" />
              {formatElapsed(elapsedSeconds)} de entreno
            </span>
            <span>•</span>
            <span className="text-slate-400">{completedCount} de {totalRounds} series completadas</span>
          </div>
        </div>

        {/* Circular Progress Wheel with Neon Glow */}
        <div className="relative z-10 flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <div className="sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Progreso Total</span>
            <span className="text-xl font-black text-volt-neon">{progressPercent}%</span>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-slate-800 flex items-center justify-center relative shrink-0 shadow-lg shadow-volt-glow/15">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                className="text-volt-neon transition-all duration-300"
                fill="transparent"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (125.6 * progressPercent) / 100}
              />
            </svg>
            <span className="absolute text-xs font-black text-white">{completedCount}</span>
          </div>
        </div>
      </div>

      {/* Finished Workout Card */}
      {workoutFinished && (
        <div className="p-5 sm:p-6 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-3.5 animate-fadeIn shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-emerald-500/25 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">¡Entrenamiento del Día Finalizado! 💪🎉</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Completaste la sesión en <strong>{formatElapsed(elapsedSeconds)}</strong>. Registra tu escala de fatiga (RPE) para el Prof. Nicolás Larroca.
          </p>

          {/* RPE Touch Slider */}
          <div className="max-w-xs mx-auto space-y-2 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Cansancio / RPE:</span>
              <span className="font-extrabold text-sm text-emerald-400">{rpeScore} / 10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={rpeScore}
              onChange={(e) => setRpeScore(Number(e.target.value))}
              className="w-full h-2 rounded-lg bg-slate-800 accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>Ligero (1)</span>
              <span>Intenso (7)</span>
              <span>Al Fallo (10)</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-2.5">
            <button
              onClick={() => alert(`¡Sesión guardada con éxito! RPE: ${rpeScore}. El profesor ya puede ver tu asistencia en el dashboard.`)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Guardar y Salir
            </button>
            <button
              onClick={handleResetWorkout}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Reiniciar
            </button>
          </div>
        </div>
      )}

      {/* Blocks of Exercises */}
      <div className="space-y-4">
        {currentDay.blocks.map((block, bIdx) => (
          <div key={block.id} className="bg-slate-900/80 border border-slate-800/90 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xl">
            {/* Block Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                  {bIdx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">{block.title}</h3>
                  <span className="text-[10px] text-slate-400 block">{block.rounds} rondas totales</span>
                </div>
              </div>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                X {block.rounds} SERIES
              </span>
            </div>

            {/* Exercise Mobile Cards */}
            <div className="space-y-3">
              {block.exercises.map((ex, eIdx) => {
                const video = appState.videoLibrary.find(v => v.id === ex.videoId);
                const currentWeight = getWeightNumber(ex);

                return (
                  <div
                    key={ex.id}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col gap-3 shadow-md"
                  >
                    {/* Header with Title and Video Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400">#{eIdx + 1}</span>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">{ex.name}</h4>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Repeticiones: <span className="text-emerald-400 font-bold">{ex.setsReps}</span>
                        </div>
                      </div>

                      {video && (
                        <button
                          onClick={() => setSelectedVideo(video)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all shrink-0"
                          title="Ver técnica del profesor"
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-400" />
                          <span className="hidden sm:inline">Técnica</span>
                        </button>
                      )}
                    </div>

                    {/* Mobile Weight Stepper: [-5] [-1] [XX kg] [+1] [+5] */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-semibold">Carga:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => adjustWeight(ex.id, -5, currentWeight)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold active:scale-90 text-[10px]"
                          title="-5 kg"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => adjustWeight(ex.id, -1, currentWeight)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold active:scale-90 text-[10px]"
                          title="-1 kg"
                        >
                          -1
                        </button>
                        <span className="min-w-[64px] text-center font-black text-xs sm:text-sm text-emerald-400 px-1">
                          {currentWeight} kg
                        </span>
                        <button
                          onClick={() => adjustWeight(ex.id, 1, currentWeight)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold active:scale-90 text-[10px]"
                          title="+1 kg"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => adjustWeight(ex.id, 5, currentWeight)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 font-bold active:scale-90 text-[10px]"
                          title="+5 kg"
                        >
                          +5
                        </button>
                      </div>
                    </div>

                    {/* Series Touch Targets */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Series Realizadas:
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {Array.from({ length: block.rounds }).map((_, rIdx) => {
                          const key = `${ex.id}-${rIdx}`;
                          const isDone = !!completedSets[key];

                          return (
                            <button
                              key={rIdx}
                              onClick={() => toggleSet(key)}
                              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                                isDone
                                  ? 'bg-gradient-to-r from-volt-neon to-emerald-400 text-slate-950 shadow-volt-md ring-2 ring-volt-neon'
                                  : 'bg-dark-950 hover:bg-dark-900 text-slate-300 border border-slate-800'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 fill-slate-950 text-volt-neon" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600" />
                              )}
                              <span>Ronda {rIdx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Finish Button */}
      {!workoutFinished && (
        <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
          <button
            onClick={handleFinishWorkout}
            disabled={completedCount === 0}
            className={`pointer-events-auto flex items-center gap-2.5 px-8 py-3.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-2xl transition-all active:scale-95 ${
              completedCount > 0
                ? 'btn-volt shadow-volt-lg cursor-pointer'
                : 'bg-dark-900/90 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Award className="w-4 h-4 fill-slate-950" />
            <span>Finalizar Sesión ({completedCount}/{totalRounds})</span>
          </button>
        </div>
      )}
    </div>
  );
}
