import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import VideoModal from './components/VideoModal';
import RestTimer from './components/RestTimer';
import ReportModal from './components/ReportModal';
import PRBadgesModal from './components/PRBadgesModal';
import PWAInstallBanner from './components/PWAInstallBanner';

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

import { loadAppState, saveAppState, resetAppState } from './data/storage';
import { effectiveStatus, periodKey, todayISO, monthLabel, addMonthsISO } from './utils/helpers';

export default function App() {
  const [appState, setAppState] = useState(loadAppState);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState('coach'); // 'coach' | 'student'
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(null);
  const [activeMesoName, setActiveMesoName] = useState(null);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Estado derivado: las cuotas pendientes con vencimiento pasado se muestran como vencidas,
  // y el estado de pago de cada alumno se calcula a partir de su cuota más reciente.
  const viewState = useMemo(() => {
    const today = todayISO();
    const payments = appState.payments.map(p => ({ ...p, status: effectiveStatus(p, today) }));
    const students = appState.students.map(s => {
      const latest = payments
        .filter(p => p.studentId === s.id)
        .sort((a, b) => periodKey(b.monthPeriod) - periodKey(a.monthPeriod))[0];
      return latest ? { ...s, paymentStatus: latest.status, nextDueDate: latest.status === 'paid' ? s.nextDueDate : latest.dueDate } : s;
    });
    return { ...appState, payments, students };
  }, [appState]);

  // Role change logic
  const handleRoleChange = (role) => {
    setCurrentRole(role);
    if (role === 'student' && (currentTab === 'students' || currentTab === 'templates')) {
      setCurrentTab('workout');
    }
  };

  // Payment handlers
  const handleUpdatePayment = (updatedPayment) => {
    setAppState(prev => {
      const nextPayments = prev.payments.map(p => p.id === updatedPayment.id ? updatedPayment : p);
      
      // El estado de pago del alumno se deriva de sus cuotas (ver viewState);
      // acá solo se registra la fecha del último pago.
      const nextStudents = prev.students.map(s => {
        if (s.id === updatedPayment.studentId && updatedPayment.status === 'paid') {
          return {
            ...s,
            lastPaymentDate: updatedPayment.paidDate || s.lastPaymentDate,
            nextDueDate: addMonthsISO(updatedPayment.dueDate || todayISO(), 1)
          };
        }
        return s;
      });

      return {
        ...prev,
        payments: nextPayments,
        students: nextStudents
      };
    });
  };

  const handleAddPayment = (newPayment) => {
    setAppState(prev => ({
      ...prev,
      payments: [newPayment, ...prev.payments]
    }));
  };

  const handleUpdateCoachInfo = (bankInfo) => {
    setAppState(prev => ({
      ...prev,
      coach: {
        ...prev.coach,
        ...bankInfo
      }
    }));
  };

  // Student handler: se agrega al final (el primer alumno es el que usa el Portal del Alumno)
  // y se genera automáticamente su primera cuota pendiente.
  const handleAddStudent = (newStudent) => {
    setAppState(prev => {
      const plan = prev.plans.find(p => p.id === newStudent.planId);
      const firstCharge = {
        id: `pay-${Date.now()}`,
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
      };
      return {
        ...prev,
        students: [...prev.students, newStudent],
        payments: [firstCharge, ...prev.payments]
      };
    });
  };

  // Anthropometry handler
  const handleAddMeasurement = (newMeso) => {
    setAppState(prev => ({
      ...prev,
      anthropometry: [...prev.anthropometry, newMeso]
    }));
  };

  // Strength log handler
  const handleAddStrengthLog = (newLog) => {
    setAppState(prev => ({
      ...prev,
      strengthProgression: [...prev.strengthProgression, newLog]
    }));
  };

  // Technique Feedback Handlers
  const handleAddSubmission = (newSub) => {
    setAppState(prev => ({
      ...prev,
      techniqueSubmissions: [newSub, ...(prev.techniqueSubmissions || [])]
    }));
  };

  const handleReviewSubmission = (subId, reviewData) => {
    setAppState(prev => ({
      ...prev,
      techniqueSubmissions: (prev.techniqueSubmissions || []).map(s =>
        s.id === subId ? { ...s, ...reviewData } : s
      )
    }));
  };

  // Routine Templates Handler
  const handleApplyTemplate = ({ templateId, studentId, mesoName }) => {
    setAppState(prev => {
      const template = (prev.routineTemplates || []).find(t => t.id === templateId);
      const student = prev.students.find(s => s.id === studentId);
      const stamp = Date.now();
      // Clonado profundo con IDs nuevos para que el mesociclo copiado sea independiente.
      const clonedDays = (prev.mesocycles[0]?.days || []).map((d, dIdx) => ({
        ...d,
        id: `day-${stamp}-${dIdx}`,
        blocks: d.blocks.map((b, bIdx) => ({
          ...b,
          id: `b-${stamp}-${dIdx}-${bIdx}`,
          exercises: b.exercises.map((e, eIdx) => ({ ...e, id: `e-${stamp}-${dIdx}-${bIdx}-${eIdx}` }))
        }))
      }));

      const newMeso = {
        id: `meso-${stamp}`,
        name: mesoName,
        focus: template ? `${template.name} — ${template.description}` : 'Plan basado en plantilla',
        templateId,
        studentId,
        studentName: student?.name || null,
        days: clonedDays
      };

      return {
        ...prev,
        mesocycles: [...prev.mesocycles, newMeso]
      };
    });
  };

  // Hábitos del alumno (agua, proteína, checklist) persistidos
  const handleUpdateHabits = (patch) => {
    setAppState(prev => ({
      ...prev,
      habitsData: { ...prev.habitsData, ...patch }
    }));
  };

  // Registro de sesiones de entrenamiento finalizadas
  const handleSaveWorkoutSession = (session) => {
    setAppState(prev => ({
      ...prev,
      workoutLogs: [session, ...(prev.workoutLogs || [])]
    }));
  };

  // Reset demo data handler
  const handleResetData = () => {
    if (window.confirm("¿Deseas restablecer todos los datos originales de la planilla de Google Sheets?")) {
      const fresh = resetAppState();
      setAppState(fresh);
    }
  };

  // Switch to workout view from routines
  const handleStartWorkout = (day, mesoName) => {
    setActiveWorkoutDay(day);
    setActiveMesoName(mesoName);
    setCurrentTab('workout');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Top Header */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        appState={viewState}
        onResetData={handleResetData}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            currentRole={currentRole}
            appState={viewState}
            onOpenReport={() => setIsReportModalOpen(true)}
            onOpenBadges={() => setIsBadgesModalOpen(true)}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              appState={viewState}
              setCurrentTab={setCurrentTab}
              setSelectedVideo={setSelectedVideo}
              currentRole={currentRole}
              onOpenReport={() => setIsReportModalOpen(true)}
              onOpenBadges={() => setIsBadgesModalOpen(true)}
            />
          )}

          {currentTab === 'workout' && (
            <WorkoutView
              appState={viewState}
              setSelectedVideo={setSelectedVideo}
              activeWorkoutDay={activeWorkoutDay}
              mesoName={activeMesoName}
              onSaveSession={handleSaveWorkoutSession}
              onExit={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'routines' && (
            <RoutinesView
              appState={viewState}
              setSelectedVideo={setSelectedVideo}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {currentTab === 'feedback' && (
            <TechniqueFeedbackView
              appState={viewState}
              currentRole={currentRole}
              onAddSubmission={handleAddSubmission}
              onReviewSubmission={handleReviewSubmission}
              setSelectedVideo={setSelectedVideo}
            />
          )}

          {currentTab === 'habits' && (
            <HabitsNutritionView
              appState={viewState}
              currentRole={currentRole}
              onUpdateHabits={handleUpdateHabits}
            />
          )}

          {currentTab === 'templates' && (
            <RoutineTemplatesView
              appState={viewState}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              appState={viewState}
              onAddStudent={handleAddStudent}
            />
          )}

          {currentTab === 'anthropometry' && (
            <AnthropometryView
              appState={viewState}
              onAddMeasurement={handleAddMeasurement}
            />
          )}

          {currentTab === 'strength' && (
            <StrengthProgressView
              appState={viewState}
              onAddStrengthLog={handleAddStrengthLog}
            />
          )}

          {currentTab === 'videos' && (
            <VideoLibraryView
              appState={viewState}
              setSelectedVideo={setSelectedVideo}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              appState={viewState}
              onUpdatePayment={handleUpdatePayment}
              onAddPayment={handleAddPayment}
              onUpdateCoachInfo={handleUpdateCoachInfo}
              currentRole={currentRole}
            />
          )}
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentRole={currentRole}
        appState={viewState}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
      />

      {/* Video Modal (Popup player for YouTube Shorts) */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />

      {/* Rest Timer Floating Component */}
      <RestTimer />

      {/* Monthly Report PDF Printable Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        appState={viewState}
      />

      {/* Gamification & PR Badges Modal */}
      <PRBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        appState={viewState}
      />
    </div>
  );
}
