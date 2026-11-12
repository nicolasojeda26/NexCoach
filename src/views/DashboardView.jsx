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
import { latestPeriod, formatDate, addDaysISO, todayISO } from '../utils/helpers';
import Avatar from '../components/Avatar';

export default function DashboardView({ appState, setCurrentTab, setSelectedVideo, currentRole, onOpenReport, onOpenBadges }) {
  const currentStudent = appState.activeStudent;
  const scoped = appState.scoped;
  const progress = appState.progress;
  const totalStudents = appState.students.filter(s => s.status !== 'inactive').length;

  // Caja del período más reciente con cuotas cargadas (antes estaba fijo en "Octubre").
  const activePeriod = latestPeriod(appState.payments);
  const activeMonthName = activePeriod.split(' ')[0];

  const totalCollected = appState.payments
    .filter(p => p.status === 'paid' && p.monthPeriod === activePeriod)
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = appState.payments
    .filter(p => (p.status === 'pending' || p.status === 'overdue') && p.monthPeriod === activePeriod)
    .reduce((acc, p) => acc + p.amount, 0);

  const overdueCount = appState.payments.filter(p => p.status === 'overdue').length;

  // Estado de cuota de la alumna del portal
  const studentUnpaid = appState.payments
    .filter(p => p.studentId === currentStudent?.id && p.status !== 'paid')
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))[0];
  const studentLastPaid = appState.payments
    .filter(p => p.studentId === currentStudent?.id && p.status === 'paid')
    .sort((a, b) => (b.paidDate || '').localeCompare(a.paidDate || ''))[0];

  const sessionsDesc = [...(scoped.workoutLogs || [])].sort((a, b) => b.date.localeCompare(a.date));
  const recentSessions = sessionsDesc.slice(0, 3);

  // Datos reales del alumno activo (antes había valores escritos a mano).
  const latestMeso = scoped.mesocycles[scoped.mesocycles.length - 1] || null;
  const dow = (new Date().getDay() + 6) % 7; // 0 = lunes
  const isWeekend = dow > 4;
  const todayDay = latestMeso?.days?.length ? latestMeso.days[isWeekend ? 0 : dow % latestMeso.days.length] : null;
  const spotlightBlock = todayDay?.blocks?.[0] || null;
  const strengthLogs = scoped.strengthProgression || [];
  const firstKg = strengthLogs[0]?.totalKilos || 0;
  const lastKg = strengthLogs[strengthLogs.length - 1]?.totalKilos || 0;
  const kgPct = firstKg > 0 ? Math.round(((lastKg - firstKg) / firstKg) * 100) : 0;
  const lastRpes = sessionsDesc.slice(0, 10).map(l => Number(l.rpe)).filter(Boolean);
  const avgRpe = lastRpes.length ? (lastRpes.reduce((a, b) => a + b, 0) / lastRpes.length).toFixed(1) : '—';
  const weekAgo = addDaysISO(todayISO(), -6);
  const weeklyHours = (sessionsDesc.filter(l => l.date >= weekAgo).reduce((a, l) => a + (l.durationSeconds || 0), 0) / 3600).toFixed(1);
  const coachShortName = (appState.coach.name || 'PROFE').split(' ').slice(-1)[0].toUpperCase();
  const usedPlans = [...new Set(appState.students.map(s => appState.plans.find(pl => pl.id === s.planId)?.sessionsPerWeek).filter(Boolean))].sort();

  if (!currentStudent) {
    return (
      <div className="space-y-6 animate-fadeIn pb-24">
        <div className="rounded-3xl border border-volt-neon/30 bg-dark-900 p-6 sm:p-10 space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase">Hola{appState.coach.name ? `, ${appState.coach.name.split(' ')[0]}` : ''}</h1>
          <p className="text-sm text-slate-300 max-w-xl">
            {currentRole === 'coach'
              ? 'Todavía no cargaste alumnos. Empezá por crear el primero: se le genera su cuota y podés invitarlo a la app.'
              : 'Tu profe todavía no terminó de configurar tu cuenta.'}
          </p>
          {currentRole === 'coach' && (
            <button onClick={() => setCurrentTab('students')} className="btn-volt px-5 py-3 rounded-2xl text-xs font-black uppercase">Crear mi primer alumno</button>
          )}
        </div>
      </div>
    );
  }

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
                <>CENTRO DE COMANDO <span className="text-gradient-volt">PF {coachShortName}</span></>
              ) : (
                <>HOLA, <span className="text-gradient-volt">{currentStudent.name.toUpperCase()}</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-xl leading-relaxed">
              {currentRole === 'coach'
                ? `Tenés ${totalStudents} ${totalStudents === 1 ? 'alumno activo' : 'alumnos activos'}. Abajo ves los datos de ${currentStudent.name}; cambiá de alumno con el selector de arriba.`
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
            <strong className="text-white font-black text-sm">{latestMeso ? latestMeso.name : 'Sin rutina'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Kilos Movidos</span>
            <strong className="text-volt-neon font-black text-sm">{lastKg ? `${lastKg} kg (${kgPct >= 0 ? '+' : ''}${kgPct}%)` : 'Sin registros'}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Adherencia</span>
            <strong className="text-white font-black text-sm">{progress.attendancePct}% asistencia</strong>
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Estado de Cuota</span>
            <strong className={`font-black text-sm ${!studentUnpaid ? 'text-emerald-400' : studentUnpaid.status === 'overdue' ? 'text-rose-400' : 'text-amber-400'}`}>
              {!studentUnpaid ? 'Al Día' : studentUnpaid.status === 'overdue' ? 'Vencida' : `Pendiente (${studentUnpaid.monthPeriod.split(' ')[0]})`}
            </strong>
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
              {currentRole === 'coach' ? `${totalStudents} Alumnos` : `${weeklyHours} hs/sem`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-volt-neon inline-block" />
              {currentRole === 'coach'
                ? (usedPlans.length ? `Planes de ${usedPlans.join('x, ')}x por semana` : 'Sin planes asignados')
                : `Asistencia últimas 4 semanas: ${progress.attendancePct}%`}
            </p>
          </div>
        </div>

        {/* KPI 2: Recaudación o Cuota */}
        <div className="p-4 sm:p-5 rounded-3xl bg-dark-900/90 border border-slate-800/90 border-glow-hover flex flex-col justify-between shadow-xl group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentRole === 'coach' ? `Caja ${activeMonthName}` : `Cuota ${(studentUnpaid || studentLastPaid)?.monthPeriod.split(' ')[0] || ''}`}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${
              currentRole === 'coach' || !studentUnpaid ? 'text-emerald-400' : studentUnpaid.status === 'overdue' ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {currentRole === 'coach'
                ? `$${totalCollected.toLocaleString('es-AR')}`
                : !studentUnpaid ? 'Al Día' : studentUnpaid.status === 'overdue' ? 'Vencida' : 'Pendiente'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {currentRole === 'coach'
                ? `Por cobrar: $${totalPending.toLocaleString('es-AR')}`
                : studentUnpaid
                  ? `$${studentUnpaid.amount.toLocaleString('es-AR')} • vence ${formatDate(studentUnpaid.dueDate)}`
                  : studentLastPaid ? `Abonado vía ${studentLastPaid.method}` : 'Sin cuotas registradas'}
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
              {avgRpe} / 10
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {lastRpes.length ? `Promedio de las últimas ${lastRpes.length} sesiones` : 'Sin sesiones registradas'}
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
              {lastKg ? `${lastKg} kg` : '—'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-semibold text-emerald-400">
              <span>{strengthLogs.length > 1 ? `${kgPct >= 0 ? '+' : ''}${kgPct}% vs ${strengthLogs[0].mes}` : 'Cargá registros en Fuerza'}</span>
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
                <span>{isWeekend ? 'Próxima sesión' : 'Rutina de hoy'}{todayDay ? ` • ${todayDay.name}` : ''}</span>
                {latestMeso && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-volt-neon/15 text-volt-neon font-black uppercase">
                    {latestMeso.name.split('(')[0].split('—')[0].trim()}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">{todayDay ? `Enfoque: ${todayDay.focus}` : 'Todavía no hay una rutina asignada.'}</p>
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
                {spotlightBlock ? `${spotlightBlock.title} (X ${spotlightBlock.rounds} series)` : 'Sin ejercicios cargados'}
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-volt-neon/15 text-volt-neon border border-volt-neon/30">
                {spotlightBlock?.exercises?.length || 0} Ejercicios
              </span>
            </div>

            <div className="space-y-2">
              {!spotlightBlock && (
                <p className="text-xs text-slate-400 p-3">
                  {currentRole === 'coach' ? 'Asignale una plantilla o armá su rutina en "Rutinas & Mesociclos".' : 'Tu profe todavía no te asignó una rutina.'}
                </p>
              )}
              {(spotlightBlock?.exercises || []).map((ex, idx) => {
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
                <Avatar student={currentStudent} className="w-14 h-14 rounded-2xl ring-2 ring-volt-neon/40 shadow-lg" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-900" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{currentStudent.name}</h3>
                <p className="text-xs text-slate-400">{currentStudent.age} años • {currentStudent.height} cm • {currentStudent.gender}</p>
                <span className="text-[10px] text-volt-neon font-black block mt-0.5 uppercase">
                  {appState.plans.find(pl => pl.id === currentStudent.planId)?.name || 'Plan personalizado'}
                </span>
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
                {currentRole === 'coach' ? (
                <button
                  onClick={() => setCurrentTab('templates')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  📚 Plantillas 1-Clic
                </button>
                ) : (
                <button
                  onClick={() => setCurrentTab('strength')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  🏋️ Mi Fuerza
                </button>
                )}
                <button
                  onClick={() => setCurrentTab('payments')}
                  className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 hover:border-volt-neon/40 text-left font-bold text-slate-200 hover:text-volt-neon transition-colors"
                >
                  {currentRole === 'coach' ? '💳 Control de Caja' : '💳 Mi Cuota'}
                </button>
              </div>
            </div>

            {/* Últimas sesiones registradas desde "Entrenar Hoy" */}
            {recentSessions.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Últimas sesiones registradas:</span>
                {recentSessions.map(ses => (
                  <div key={ses.id} className="p-2.5 rounded-xl bg-dark-950 border border-slate-800 text-[11px] flex items-center justify-between gap-2">
                    <div>
                      <strong className="text-white block">{ses.dayName} • {formatDate(ses.date)}</strong>
                      <span className="text-slate-400">{ses.completedSets}/{ses.totalSets} series • {Math.round(ses.durationSeconds / 60)} min</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-volt-neon/10 text-volt-neon border border-volt-neon/30 font-black shrink-0">RPE {ses.rpe}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
