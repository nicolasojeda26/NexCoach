import React, { useState } from 'react';
import {
  Droplets,
  Utensils,
  Footprints,
  Moon,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Camera,
  Flame,
  Sparkles,
  Award
} from 'lucide-react';

export default function HabitsNutritionView({ appState, currentRole, onUpdateHabits }) {
  const habits = appState.habitsData || {
    waterLiters: 2.5,
    waterTarget: 3.0,
    proteinGrams: 105,
    proteinTarget: 120,
    dailySteps: 9200,
    stepsTarget: 10000,
    sleepHours: 7.5,
    sleepTarget: 8.0,
    weeklyCompliance: 89,
    checklist: []
  };

  // Los valores se guardan en el estado global (antes se perdían al cambiar de pestaña).
  const water = habits.waterLiters;
  const protein = habits.proteinGrams;
  const steps = habits.dailySteps;
  const sleep = habits.sleepHours;
  const checklist = habits.checklist || [];
  const isStudent = currentRole === 'student';

  const toggleCheck = (id) => {
    if (!isStudent) return; // el profe solo supervisa
    onUpdateHabits?.({ checklist: checklist.map(item => item.id === id ? { ...item, done: !item.done } : item) });
  };

  const addWater = (delta) => {
    onUpdateHabits?.({ waterLiters: Math.max(0, Math.round((water + delta) * 100) / 100) });
  };

  const addProtein = (delta) => {
    onUpdateHabits?.({ proteinGrams: Math.max(0, protein + delta) });
  };

  const sleepPercent = Math.min(100, Math.round((sleep / (habits.sleepTarget || 8)) * 100));
  const sleepLabel = sleep >= (habits.sleepTarget || 8) ? 'Óptimo' : sleep >= 7 ? 'Bueno' : 'Insuficiente';

  const waterPercent = Math.min(100, Math.round((water / habits.waterTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((protein / habits.proteinTarget) * 100));
  const stepsPercent = Math.min(100, Math.round((steps / habits.stepsTarget) * 100));

  return (
    <div className="space-y-6 animate-fadeIn pb-24 safe-area-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Hábitos Diarios & Nutrición
            </h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {habits.weeklyCompliance}% Adherencia
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {currentRole === 'coach'
              ? 'Supervisión de hidratación, proteína diaria y recuperación del alumno.'
              : 'Registra tu agua, proteína, pasos y descanso para maximizar tus resultados.'}
          </p>
        </div>
      </div>

      {/* Main Pillars Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Agua */}
        <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <Droplets className="w-4 h-4" />
              Agua
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{waterPercent}%</span>
          </div>

          <div>
            <div className="text-2xl font-black text-white">{water} <span className="text-sm font-normal text-slate-400">/ {habits.waterTarget} L</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: `${waterPercent}%` }} />
            </div>
          </div>

          {currentRole === 'student' && (
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => addWater(0.25)}
                className="flex-1 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-xs font-bold active:scale-95 transition-all"
              >
                +250 ml
              </button>
              <button
                onClick={() => addWater(0.5)}
                className="flex-1 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold active:scale-95 transition-all"
              >
                +500 ml
              </button>
            </div>
          )}
        </div>

        {/* 2. Proteína */}
        <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Utensils className="w-4 h-4" />
              Proteína
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{proteinPercent}%</span>
          </div>

          <div>
            <div className="text-2xl font-black text-white">{protein} <span className="text-sm font-normal text-slate-400">/ {habits.proteinTarget} g</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${proteinPercent}%` }} />
            </div>
          </div>

          {currentRole === 'student' && (
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => addProtein(15)}
                className="flex-1 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 text-xs font-bold active:scale-95 transition-all"
              >
                +15g
              </button>
              <button
                onClick={() => addProtein(30)}
                className="flex-1 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold active:scale-95 transition-all"
              >
                +30g
              </button>
            </div>
          )}
        </div>

        {/* 3. Pasos Diarios */}
        <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Footprints className="w-4 h-4" />
              Pasos
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{stepsPercent}%</span>
          </div>

          <div>
            <div className="text-2xl font-black text-white">{steps.toLocaleString('es-AR')} <span className="text-sm font-normal text-slate-400">/ {(habits.stepsTarget / 1000).toLocaleString('es-AR')}k</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${stepsPercent}%` }} />
            </div>
          </div>

          <span className="text-[10px] text-slate-500 block pt-1">Actividad NEAT activa</span>
        </div>

        {/* 4. Sueño & Descanso */}
        <div className="p-4 rounded-3xl bg-slate-900/85 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
              <Moon className="w-4 h-4" />
              Descanso
            </span>
            <span className={`text-[10px] font-bold ${sleepLabel === 'Insuficiente' ? 'text-rose-400' : 'text-emerald-400'}`}>{sleepLabel}</span>
          </div>

          <div>
            <div className="text-2xl font-black text-white">{sleep} <span className="text-sm font-normal text-slate-400">/ {habits.sleepTarget} hs</span></div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-purple-400 h-full rounded-full transition-all" style={{ width: `${sleepPercent}%` }} />
            </div>
          </div>

          <span className="text-[10px] text-slate-500 block pt-1">Recuperación muscular alta</span>
        </div>
      </div>

      {/* Checklist Diaria de Hábitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Checklist de Hábitos Diarios</span>
            </h3>
            <span className="text-xs text-slate-400">
              {checklist.filter(c => c.done).length} de {checklist.length} listos
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map(item => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                disabled={!isStudent}
                aria-pressed={item.done}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${isStudent ? 'active:scale-[0.98]' : 'cursor-default'} ${
                  item.done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400'
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                )}
                <span className={`text-xs font-semibold ${item.done ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Registro Fotográfico de Comidas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Diario de Comidas Registradas</span>
            </h3>
            {currentRole === 'student' && (
              <button
                disabled
                title="Próximamente: subir fotos requiere almacenamiento en la nube"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
              >
                + Subir Foto (pronto)
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {habits.mealsPhotos?.map(meal => (
              <div key={meal.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  <Utensils className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs text-white">{meal.title}</strong>
                    <span className="text-[10px] text-slate-500">{meal.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{meal.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
