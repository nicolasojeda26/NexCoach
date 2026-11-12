import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import VideoModal from './components/VideoModal';
import RestTimer from './components/RestTimer';
import ReportModal from './components/ReportModal';
import PRBadgesModal from './components/PRBadgesModal';
import PWAInstallBanner from './components/PWAInstallBanner';
import AuthScreen from './components/AuthScreen';
import Toast from './components/Toast';

import DashboardView from './views/DashboardView';
import StudentsView from './views/StudentsView';
import RoutinesView from './views/RoutinesView';
import WorkoutView from './views/WorkoutView';
import AnthropometryView from './views/AnthropometryView';
import StrengthProgressView from './views/StrengthProgressView';
import VideoLibraryView from './views/VideoLibraryView';
import PaymentsView from './views/PaymentsView';
import TechniqueFeedbackView from './views/TechniqueFeedbackView';
import RoutineTemplatesView from './views/RoutineTemplatesView';
import HabitsNutritionView from './views/HabitsNutritionView';

import { useAppData } from './hooks/useAppData';
import { scopeToStudent, emptyHabits, cloneDays, newId } from './domain/model';
import { missingMonthlyCharges, monthlyPaymentId } from './domain/payments';
import { computeProgress } from './domain/progress';
import { resolveHabits } from './domain/habits';
import { effectiveStatus, periodKey, todayISO, monthLabel, addMonthsISO } from './utils/helpers';

const STUDENT_TABS = new Set(['dashboard', 'workout', 'routines', 'feedback', 'habits', 'anthropometry', 'strength', 'videos', 'payments']);

export default function App() {
  const data = useAppData();

  if (data.mode === 'cloud' && data.status !== 'ready') {
    return <AuthScreen data={data} />;
  }
  if (!data.state) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Cargando…</div>;
  }
  return <MainApp data={data} />;
}

function MainApp({ data }) {
  const { state, actions, mode, profile } = data;
  const isCloud = mode === 'cloud';
  const lockedRole = isCloud ? profile?.role : null; // en la nube el rol lo define la cuenta

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [demoRole, setDemoRole] = useState('coach');
  const currentRole = lockedRole || demoRole;
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(null);
  const [activeMesoName, setActiveMesoName] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, kind = 'ok') => setToast({ message, kind, at: Date.now() }), []);

  // Alumno activo: el propio (alumno en la nube) o el que elige el profe en el selector.
  const [pickedStudentId, setPickedStudentId] = useState(() => {
    try { return localStorage.getItem('nexcoach_active_student') || null; } catch (e) { return null; }
  });
  const activeStudentId = (lockedRole === 'student' ? profile.studentId : null)
    || (state.students.some(s => s.id === pickedStudentId) ? pickedStudentId : state.students[0]?.id)
    || null;
  const setActiveStudentId = (id) => {
    setPickedStudentId(id);
    setActiveWorkoutDay(null);
    try { localStorage.setItem('nexcoach_active_student', id); } catch (e) { /* noop */ }
  };

  // Acciones con aviso de error (en la nube puede fallar la conexión o un permiso).
  const run = useCallback(async (fn, okMsg) => {
    try {
      await fn();
      if (okMsg) notify(okMsg);
      return true;
    } catch (e) {
      console.error(e);
      notify(e.message || 'No se pudo guardar. Revisá la conexión.', 'error');
      return false;
    }
  }, [notify]);

  // Cuotas del mes: el profe las genera solas al abrir la app (IDs fijos, no se duplican).
  useEffect(() => {
    if (currentRole !== 'coach') return;
    const missing = missingMonthlyCharges(state);
    if (missing.length) run(() => actions.upsert('payments', missing));
  }, [state.students, state.payments, state.plans, state.coach?.billingDay, currentRole]); // eslint-disable-line react-hooks/exhaustive-deps

  // Estado derivado para las pantallas.
  const viewState = useMemo(() => {
    const today = todayISO();
    const payments = state.payments.map(p => ({ ...p, status: effectiveStatus(p, today) }));
    const students = state.students.map(s => {
      const latest = payments
        .filter(p => p.studentId === s.id)
        .sort((a, b) => periodKey(b.monthPeriod) - periodKey(a.monthPeriod))[0];
      return latest ? { ...s, paymentStatus: latest.status, nextDueDate: latest.status === 'paid' ? s.nextDueDate : latest.dueDate } : s;
    });
    const activeStudent = students.find(s => s.id === activeStudentId) || null;
    const scoped = activeStudent ? scopeToStudent({ ...state, payments }, activeStudent.id) : scopeToStudent({}, null);
    const studentPlan = state.plans.find(p => p.id === activeStudent?.planId);
    const habitsDoc = activeStudent ? resolveHabits(scoped.habits, activeStudent.id, today) : null;
    const progress = computeProgress({ studentPlan, scoped, today });
    // Para el alumno, las correcciones de técnica son solo las suyas.
    const techniqueSubmissions = currentRole === 'student' ? scoped.techniqueSubmissions : state.techniqueSubmissions;
    return { ...state, payments, students, techniqueSubmissions, activeStudent, scoped, studentPlan, habitsDoc, progress };
  }, [state, activeStudentId, currentRole]);

  const handleRoleChange = (role) => {
    setDemoRole(role);
    if (role === 'student' && !STUDENT_TABS.has(currentTab)) setCurrentTab('workout');
  };

  // ---------------------------------------------------------------- Pagos
  const handleUpdatePayment = (p) => run(async () => {
    await actions.upsert('payments', p);
    if (p.status === 'paid') {
      const s = state.students.find(x => x.id === p.studentId);
      if (s) await actions.upsert('students', { ...s, lastPaymentDate: p.paidDate || s.lastPaymentDate, nextDueDate: addMonthsISO(p.dueDate || todayISO(), 1) });
    }
  });
  const handleAddPayment = (p) => run(() => actions.upsert('payments', p), 'Cuota creada');
  const handleUpdateCoachInfo = (patch) => run(() => actions.updateCoach(patch), 'Datos guardados');

  // ---------------------------------------------------------------- Alumnos
  const handleAddStudent = (newStudent) => run(async () => {
    const plan = state.plans.find(p => p.id === newStudent.planId);
    const [y, m] = todayISO().split('-').map(Number);
    await actions.upsert('students', newStudent);
    await actions.upsert('payments', {
      id: monthlyPaymentId(newStudent.id, y, m - 1),
      studentId: newStudent.id,
      studentName: newStudent.name,
      monthPeriod: monthLabel(),
      amount: plan?.price || 0,
      dueDate: newStudent.nextDueDate,
      paidDate: null,
      status: 'pending',
      method: 'Transferencia Bancaria',
      receiptUrl: null,
      notes: 'Primera cuota generada al dar de alta al alumno.'
    });
    await actions.upsert('habits', emptyHabits(newStudent.id));
    setActiveStudentId(newStudent.id);
  }, 'Alumno creado');

  const handleUpdateStudent = (s) => run(async () => {
    await actions.upsert('students', s);
    // Si cambió el nombre, se actualiza en sus cuotas pendientes.
    const pend = state.payments.filter(p => p.studentId === s.id && p.status !== 'paid' && p.studentName !== s.name);
    if (pend.length) await actions.upsert('payments', pend.map(p => ({ ...p, studentName: s.name })));
  }, 'Alumno actualizado');

  // ---------------------------------------------------------------- Seguimiento
  const handleAddMeasurement = (m) => run(() => actions.upsert('anthropometry', { id: newId('anth'), studentId: activeStudentId, ...m }), 'Medidas guardadas');
  const handleAddStrengthLog = (l) => run(() => actions.upsert('strengthProgression', { id: newId('str'), studentId: activeStudentId, ...l }), 'Registro de fuerza guardado');
  const handleAddWeight = (w) => run(() => actions.upsert('weightHistory', { id: newId('wt'), studentId: w.studentId || activeStudentId, ...w }), 'Peso registrado');

  const handleAddSubmission = (sub) => run(() => actions.upsert('techniqueSubmissions', sub), 'Video enviado al profe');
  const handleReviewSubmission = (subId, review) => run(async () => {
    const sub = state.techniqueSubmissions.find(s => s.id === subId);
    if (sub) await actions.upsert('techniqueSubmissions', { ...sub, ...review });
  }, 'Corrección guardada');

  const handleUpdateHabits = (patch) => {
    if (!activeStudentId) return;
    const current = viewState.habitsDoc || emptyHabits(activeStudentId);
    run(() => actions.upsert('habits', { ...current, ...patch, id: activeStudentId, studentId: activeStudentId }));
  };

  const handleSaveWorkoutSession = (session) => run(() => actions.upsert('workoutLogs', { ...session, studentId: activeStudentId }), 'Sesión guardada');

  // ---------------------------------------------------------------- Rutinas y plantillas
  const handleSaveMesocycle = (meso) => run(() => actions.upsert('mesocycles', { ...meso, studentId: meso.studentId || activeStudentId }), 'Rutina guardada');
  const handleDeleteMesocycle = (id) => run(() => actions.remove('mesocycles', id), 'Mesociclo eliminado');
  const handleSaveTemplate = (tmpl) => run(() => actions.upsert('routineTemplates', tmpl), 'Plantilla guardada');
  const handleDeleteTemplate = (id) => run(() => actions.remove('routineTemplates', id), 'Plantilla eliminada');

  const handleApplyTemplate = ({ templateId, studentId, mesoName }) => {
    const template = state.routineTemplates.find(t => t.id === templateId);
    const student = state.students.find(s => s.id === studentId);
    if (!template) return Promise.resolve(false);
    return run(() => actions.upsert('mesocycles', {
      id: newId('meso'),
      name: mesoName,
      focus: `${template.name} — ${template.description}`,
      templateId,
      studentId,
      studentName: student?.name || null,
      createdAt: todayISO(),
      days: cloneDays(template.days)
    }));
  };

  const handleResetData = () => {
    if (window.confirm('¿Restablecer todos los datos de la demo? Se pierden los cambios hechos en este dispositivo.')) {
      actions.reset();
      notify('Datos de la demo restablecidos');
    }
  };

  const handleStartWorkout = (day, mesoName) => {
    setActiveWorkoutDay(day);
    setActiveMesoName(mesoName);
    setCurrentTab('workout');
  };

  const openReport = () => setIsReportModalOpen(true);
  const openBadges = () => setIsBadgesModalOpen(true);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-emerald-500 focus:text-slate-950 focus:font-bold">
        Saltar al contenido
      </a>
      <PWAInstallBanner />

      <Navbar
        currentRole={currentRole}
        setCurrentRole={lockedRole ? null : handleRoleChange}
        appState={viewState}
        onResetData={mode === 'local' ? handleResetData : null}
        onOpenBadges={openBadges}
        activeStudentId={activeStudentId}
        onChangeStudent={lockedRole === 'student' ? null : setActiveStudentId}
        mode={mode}
        user={data.user}
        onSignOut={isCloud ? () => data.auth.signOut() : null}
        onExitDemo={mode === 'local' && data.cloudAvailable ? data.exitDemo : null}
      />

      {data.storageWarning && (
        <div role="alert" className="bg-rose-950 border-b border-rose-500/40 text-rose-200 text-xs px-4 py-2">
          El navegador no tiene más espacio para guardar datos de la demo. Borrá fotos de comidas o restablecé la demo.
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <div className="hidden md:flex">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            currentRole={currentRole}
            appState={viewState}
            onOpenReport={openReport}
            onOpenBadges={openBadges}
          />
        </div>

        <main id="contenido" tabIndex={-1} className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8 focus:outline-none">
          {currentTab === 'dashboard' && (
            <DashboardView appState={viewState} setCurrentTab={setCurrentTab} setSelectedVideo={setSelectedVideo}
              currentRole={currentRole} onOpenReport={openReport} onOpenBadges={openBadges} />
          )}
          {currentTab === 'workout' && (
            <WorkoutView key={`${activeStudentId}-${activeWorkoutDay?.id || 'auto'}`} appState={viewState}
              setSelectedVideo={setSelectedVideo} activeWorkoutDay={activeWorkoutDay} mesoName={activeMesoName}
              onSaveSession={handleSaveWorkoutSession} onExit={() => setCurrentTab('dashboard')}
              onGoToRoutines={() => setCurrentTab('routines')} />
          )}
          {currentTab === 'routines' && (
            <RoutinesView key={activeStudentId} appState={viewState} currentRole={currentRole}
              setSelectedVideo={setSelectedVideo} onStartWorkout={handleStartWorkout}
              onSaveMesocycle={handleSaveMesocycle} onDeleteMesocycle={handleDeleteMesocycle}
              onSaveTemplate={handleSaveTemplate} onGoToTemplates={() => setCurrentTab('templates')} />
          )}
          {currentTab === 'feedback' && (
            <TechniqueFeedbackView appState={viewState} currentRole={currentRole}
              onAddSubmission={handleAddSubmission} onReviewSubmission={handleReviewSubmission}
              setSelectedVideo={setSelectedVideo} uploadFile={actions.uploadFile} mode={mode} />
          )}
          {currentTab === 'habits' && (
            <HabitsNutritionView appState={viewState} currentRole={currentRole}
              onUpdateHabits={handleUpdateHabits} uploadFile={actions.uploadFile} notify={notify} />
          )}
          {currentTab === 'templates' && currentRole === 'coach' && (
            <RoutineTemplatesView appState={viewState} onApplyTemplate={handleApplyTemplate}
              onSaveTemplate={handleSaveTemplate} onDeleteTemplate={handleDeleteTemplate} />
          )}
          {currentTab === 'students' && currentRole === 'coach' && (
            <StudentsView appState={viewState} onAddStudent={handleAddStudent} onUpdateStudent={handleUpdateStudent}
              onAddWeight={handleAddWeight} activeStudentId={activeStudentId} onSelectStudent={setActiveStudentId}
              createInvite={actions.createInvite} mode={mode} notify={notify} />
          )}
          {currentTab === 'anthropometry' && (
            <AnthropometryView key={activeStudentId} appState={viewState} currentRole={currentRole} onAddMeasurement={handleAddMeasurement} />
          )}
          {currentTab === 'strength' && (
            <StrengthProgressView key={activeStudentId} appState={viewState} currentRole={currentRole} onAddStrengthLog={handleAddStrengthLog} />
          )}
          {currentTab === 'videos' && (
            <VideoLibraryView appState={viewState} setSelectedVideo={setSelectedVideo} />
          )}
          {currentTab === 'payments' && (
            <PaymentsView appState={viewState} onUpdatePayment={handleUpdatePayment} onAddPayment={handleAddPayment}
              onUpdateCoachInfo={handleUpdateCoachInfo} currentRole={currentRole} mode={mode}
              mercadoPagoLink={actions.mercadoPagoLink} notify={notify} />
          )}
        </main>
      </div>

      <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} currentRole={currentRole}
        appState={viewState} onOpenReport={openReport} onOpenBadges={openBadges} />

      <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      <RestTimer />
      <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} appState={viewState} />
      <PRBadgesModal isOpen={isBadgesModalOpen} onClose={() => setIsBadgesModalOpen(false)} appState={viewState} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
