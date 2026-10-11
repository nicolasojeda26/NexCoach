import React from 'react';
import {
  Users,
  CreditCard,
  Dumbbell,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowRight,
  Play,
  HeartPulse,
  Sparkles,
  Zap,
  Award,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function DashboardView({ appState, setCurrentTab, setSelectedVideo, currentRole, onOpenReport, onOpenBadges }) {
  const currentStudent = appState.students[0]; // Agostina Baju
  const totalStudents = appState.students.length;

  const totalCollected = appState.payments
    .filter(p => p.status === 'paid' && p.monthPeriod.includes('Octubre'))
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = appState.payments
    .filter(p => (p.status === 'pending' || p.status === 'overdue') && p.monthPeriod.includes('Octubre'))
    .reduce((acc, p) => acc + p.amount, 0);

  const overdueCount = appState.payments.filter(p => p.status === 'overdue').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-24 safe-area-bottom">
      {/* ============================================================== */}
      {/* MEGAFACHERO HERO BANNER */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-volt-neon/30 bg-dark-900 shadow-2xl">
        {/* Background Image with Dark Mesh Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1600&auto=format&fit=crop&q=80')`
          }}
        />
        {/* Radial Neon Gradient Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/90 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-volt-glow/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-cyber-glow/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-dark-900/90 border border-volt-neon/40 text-volt-neon text-xs font-black shadow-lg shadow-volt-glow/15 tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 fill-volt-neon" />
            <span>SISTEMA DE PREPARACIÓN FÍSICA • 2026</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-none font-display">
              {currentRole === 'coach' ? (
                <>CENTRO DE COMANDO <span className="text-gradient-volt">PF LARROCA</span></>
              ) : (
                <>HOLA, <span className="text-gradient-volt">{currentStudent.name.toUpperCase()}</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-xl leading-relaxed">
              {currentRole === 'coach'
                ? `Tienes ${totalStudents} atletas activos bajo seguimiento. Control de sobrecarga, videoteca técnica y gestión de caja sincronizados.`
                : `Planificación activa de hipertrofia y fuerza. Peso actual: ${currentStudent.currentWeight} kg hacia la meta de ${currentStudent.targetWeight} kg.`}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('workout')}
              className="btn-volt flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider"
            >
              <Dumbbell className="w-4 h-4 fill-slate-950" />
              <span>Entrenar Hoy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-dark-900/90 hover:bg-dark-800 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700/80 transition-all active:scale-95 shadow-md"
            >
              <Award className="w-4 h-4 text-volt-neon" />
              <span>Informe PDF</span>
            </button>

            <button
              onClick={onOpenBadges}
              className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold border border-amber-500/30 transition-all active:scale-95"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>PRs & Medallas</span>
            </button>
          </div>
        </div>

        {/* Bottom Metrics Bar */}
        <div className="relative z-10 border-t border-slate-800/80 bg-dark-950/80 backdrop-blur-md px-6 sm:px-10 py-3 grid grid-cols-3 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Mesociclo</span>
            <strong className="text-white font-black text-sm">N° 1 (Febrero)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Kilos Movidos</span>
            <strong className="text-volt-neon font-black text-sm">324 kg (+48%)</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Adherencia</span>
            <strong className="text-white font-black text-sm">95% Cumplido</strong>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Estado de Cuota</span>
            <strong className="text-emerald-400 font-black text-sm">Al Día</strong>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4 CYBER KPI CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Alumnos o Asistencia */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-900/90 border border-slate-800/90 border-glow-hover flex flex-col justify-between shadow-xl group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentRole === 'coach' ? 'Atletas Activos' : 'Mi Asistencia'}
            </span>
            <div className="p-2 rounded-xl bg-volt-neon/10 text-volt-neon group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentRole === 'coach' ? `${totalStudents} Alumnos` : `${currentStudent.weeklyHours} hs/sem`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-volt-neon inline-block" />
              {currentRole === 'coach' ? 'Planes de 3x y 5x activos' : 'Cumplimiento semanal 95%'}
            </p>
          </div>
        </div>

        {/* KPI 2: Recaudación o Cuota */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-900/90 border border-slate-800/90 border-glow-hover flex flex-col justify-between shadow-xl group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentRole === 'coach' ? 'Caja Octubre' : 'Cuota Octubre'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">
              {currentRole === 'coach' ? `$${totalCollected.toLocaleString('es-AR')}` : 'Al Día'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {currentRole === 'coach' ? `Por cobrar: $${totalPending.toLocaleString('es-AR')}` : 'Abonado vía Transferencia'}
            </p>
          </div>
        </div>

        {/* KPI 3: Cansancio / RPE */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-900/90 border border-slate-800/90 border-glow-hover flex flex-col justify-between shadow-xl group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Fatiga / RPE
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight">
              {currentStudent.avgFatigue} / 10
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Esfuerzo medio supervisado
            </p>
          </div>
        </div>

        {/* KPI 4: Fuerza Total / Kilos Movidos */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-900/90 border border-slate-800/90 border-glow-hover flex flex-col justify-between shadow-xl group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sobrecarga Total
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
              324 kg
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-semibold text-emerald-400">
              <span>+48% vs Mesociclo 1</span>
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* WORKOUT SPOTLIGHT + ATHLETE CARD */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Routine Spotlight */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Rutina de Hoy • Lunes</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-volt-neon/15 text-volt-neon font-black">
                  MESOCICLO 1
                </span>
              </h2>
              <p className="text-xs text-slate-400">Enfoque: Movilidad, Cadena Posterior y Cuádriceps</p>
            </div>
            <button
              onClick={() => setCurrentTab('routines')}
              className="text-xs font-black text-volt-neon hover:underline flex items-center gap-1"
            >
              <span>Ver semana completa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-dark-900/85 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Bloque 1: Activación y Fuerza (X 3 SERIES)
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-volt-neon/15 text-volt-neon border border-volt-neon/30">
                4 Ejercicios
              </span>
            </div>

            <div className="space-y-2">
              {appState.mesocycles[0].days[0].blocks[0].exercises.map((ex, idx) => {
                const video = appState.videoLibrary.find(v => v.id === ex.videoId);
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-dark-950 border border-slate-800/80 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-volt-neon group-hover:text-slate-950 text-slate-300 flex items-center justify-center text-xs font-black transition-colors">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white group-hover:text-volt-neon transition-colors">
                          {ex.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Series: <strong className="text-emerald-400">{ex.setsReps}</strong> • Carga base: <strong className="text-slate-300">{ex.defaultWeight}</strong>
                        </div>
                      </div>
                    </div>

                    {video && (
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-volt-neon/15 hover:bg-volt-neon/25 text-volt-neon text-xs font-black border border-volt-neon/30 transition-all active:scale-95 shrink-0"
                      >
                        <Play className="w-3 h-3 fill-volt-neon" />
                        <span className="hidden sm:inline">Short</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setCurrentTab('workout')}
                className="btn-volt flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
              >
                <Dumbbell className="w-4 h-4 fill-slate-950" />
                <span>Abrir Sesión en Vivo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Athlete Card & Quick Shortcuts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Ficha del Atleta</h2>
            <button
              onClick={() => setCurrentTab('anthropometry')}
              className="text-xs font-bold text-volt-neon hover:underline"
            >
              Medidas
            </button>
          </div>

          <div className="bg-dark-900/85 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-3.5 pb-3 border-b border-slate-800">
              <div className="relative">
                <img
                  src={currentStudent.avatar}
                  alt={currentStudent.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-volt-neon/40 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-900" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{currentStudent.name}</h3>
                <p className="text-xs text-slate-400">{currentStudent.age} años • {currentStudent.height} cm • {currentStudent.gender}</p>
                <span className="text-[10px] text-volt-neon font-black block mt-0.5">PLAN 5X SEMANA FULL</span>
              </div>
            </div>

            {/* Metrics Dual Pill */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-dark-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Peso Actual</span>
                <span className="text-base font-black text-white mt-0.5 block">{currentStudent.currentWeight} kg</span>
                <span className="text-[10px] text-volt-neon">Meta: {currentStudent.targetWeight} kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-dark-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">IMC Corporal</span>
                <span className="text-base font-black text-white mt-0.5 block">{currentStudent.currentIMC}</span>
                <span className="text-[10px] text-volt-neon">Objetivo: {currentStudent.targetIMC}</span>
              </div>
            </div>

            {/* Coach Observation */}
            <div className="p-3.5 rounded-2xl bg-dark-950 border border-slate-800/80 text-xs space-y-1">
              <span className="text-[10px] font-black text-volt-neon uppercase tracking-wider block">
                Objetivo de Preparación Física:
              </span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {currentStudent.notes}
              </p>
            </div>

            {/* Quick Feature Launcher Pills */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Accesos Rápidos:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setCurrentTab('feedback')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  📹 Videos Alumnos
                </button>
                <button
                  onClick={() => setCurrentTab('habits')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  🥗 Hábitos & Agua
                </button>
                <button
                  onClick={() => setCurrentTab('templates')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  📚 Plantillas 1-Clic
                </button>
                <button
                  onClick={() => setCurrentTab('payments')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  💳 Control de Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
