import React, { useState, useEffect } from 'react';
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
      
      const nextStudents = prev.students.map(s => {
        if (s.id === updatedPayment.studentId && updatedPayment.monthPeriod.includes('Octubre')) {
          return {
            ...s,
            paymentStatus: updatedPayment.status,
            lastPaymentDate: updatedPayment.paidDate || s.lastPaymentDate
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

  // Student handler
  const handleAddStudent = (newStudent) => {
    setAppState(prev => ({
      ...prev,
      students: [newStudent, ...prev.students]
    }));
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
      const clonedDays = (prev.mesocycles[0]?.days || []).map(d => ({
        ...d,
        id: `day-${Date.now()}-${Math.random()}`
      }));

      const newMeso = {
        id: `meso-${Date.now()}`,
        name: mesoName,
        focus: `Plan basado en plantilla ${templateId}`,
        days: clonedDays
      };

      return {
        ...prev,
        mesocycles: [...prev.mesocycles, newMeso]
      };
    });
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
        appState={appState}
        onResetData={handleResetData}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            currentRole={currentRole}
            appState={appState}
            onOpenReport={() => setIsReportModalOpen(true)}
            onOpenBadges={() => setIsBadgesModalOpen(true)}
          />
        </div>

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              appState={appState}
              setCurrentTab={setCurrentTab}
              setSelectedVideo={setSelectedVideo}
              currentRole={currentRole}
              onOpenReport={() => setIsReportModalOpen(true)}
              onOpenBadges={() => setIsBadgesModalOpen(true)}
            />
          )}

          {currentTab === 'workout' && (
            <WorkoutView
              appState={appState}
              setSelectedVideo={setSelectedVideo}
              activeWorkoutDay={activeWorkoutDay}
              mesoName={activeMesoName}
            />
          )}

          {currentTab === 'routines' && (
            <RoutinesView
              appState={appState}
              setSelectedVideo={setSelectedVideo}
              onStartWorkout={handleStartWorkout}
            />
          )}

          {currentTab === 'feedback' && (
            <TechniqueFeedbackView
              appState={appState}
              currentRole={currentRole}
              onAddSubmission={handleAddSubmission}
              onReviewSubmission={handleReviewSubmission}
              setSelectedVideo={setSelectedVideo}
            />
          )}

          {currentTab === 'habits' && (
            <HabitsNutritionView
              appState={appState}
              currentRole={currentRole}
            />
          )}

          {currentTab === 'templates' && (
            <RoutineTemplatesView
              appState={appState}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {currentTab === 'students' && (
            <StudentsView
              appState={appState}
              onAddStudent={handleAddStudent}
            />
          )}

          {currentTab === 'anthropometry' && (
            <AnthropometryView
              appState={appState}
              onAddMeasurement={handleAddMeasurement}
            />
          )}

          {currentTab === 'strength' && (
            <StrengthProgressView
              appState={appState}
              onAddStrengthLog={handleAddStrengthLog}
            />
          )}

          {currentTab === 'videos' && (
            <VideoLibraryView
              appState={appState}
              setSelectedVideo={setSelectedVideo}
            />
          )}

          {currentTab === 'payments' && (
            <PaymentsView
              appState={appState}
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
        appState={appState}
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
        appState={appState}
      />

      {/* Gamification & PR Badges Modal */}
      <PRBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        appState={appState}
      />
    </div>
  );
}
