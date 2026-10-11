import React, { useState } from 'react';
import {
  LayoutDashboard,
  Dumbbell,
  CalendarDays,
  Users,
  CreditCard,
  Ruler,
  TrendingUp,
  Video,
  MoreHorizontal,
  X,
  MessageSquare,
  Droplets,
  Layers,
  Printer,
  Award
} from 'lucide-react';

export default function BottomNav({ currentTab, setCurrentTab, currentRole, appState, onOpenReport, onOpenBadges }) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const pendingCount = appState.payments.filter(p => p.status === 'overdue' || p.status === 'pending').length;
  const pendingReviews = (appState.techniqueSubmissions || []).filter(s => s.status === 'pending').length;

  // Coach bottom nav items
  const coachItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'feedback', label: 'Videos', icon: MessageSquare, badge: pendingReviews > 0 ? pendingReviews : null },
    { id: 'routines', label: 'Rutinas', icon: CalendarDays },
    { id: 'payments', label: 'Pagos', icon: CreditCard, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'more', label: 'Más', icon: MoreHorizontal, isMore: true }
  ];

  // Student bottom nav items
  const studentItems = [
    { id: 'workout', label: 'Entrenar', icon: Dumbbell, highlight: true },
    { id: 'routines', label: 'Rutina', icon: CalendarDays },
    { id: 'habits', label: 'Hábitos', icon: Droplets },
    { id: 'payments', label: 'Mi Cuota', icon: CreditCard },
    { id: 'more', label: 'Más', icon: MoreHorizontal, isMore: true }
  ];

  const items = currentRole === 'coach' ? coachItems : studentItems;

  const handleItemClick = (item) => {
    if (item.isMore) {
      setShowMoreMenu(prev => !prev);
    } else {
      setShowMoreMenu(false);
      setCurrentTab(item.id);
    }
  };

  const moreSubItems = currentRole === 'coach' ? [
    { id: 'students', label: 'Fichas de Alumnos', icon: Users },
    { id: 'templates', label: 'Plantillas de Rutina', icon: Layers },
    { id: 'habits', label: 'Hábitos & Nutrición', icon: Droplets },
    { id: 'anthropometry', label: 'Medidas Corporales', icon: Ruler },
    { id: 'strength', label: 'Fuerza & Kilos Movidos', icon: TrendingUp },
    { id: 'videos', label: 'Videoteca de Técnica', icon: Video }
  ] : [
    { id: 'dashboard', label: 'Resumen General', icon: LayoutDashboard },
    { id: 'feedback', label: 'Corrección de Video', icon: MessageSquare },
    { id: 'anthropometry', label: 'Medidas (12 Mesociclos)', icon: Ruler },
    { id: 'strength', label: 'Fuerza & RMs', icon: TrendingUp },
    { id: 'videos', label: 'Videoteca de Técnica', icon: Video }
  ];

  return (
    <>
      {/* Mobile "Más" Bottom Sheet Modal */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/75 backdrop-blur-sm animate-fadeIn flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 pb-10 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-black text-white">Menú Completo NexCoach</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Special Modals */}
            <div className="grid grid-cols-2 gap-2 pb-2">
              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenReport();
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-volt/15 border border-volt/30 text-volt font-bold text-xs"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span>Informe PDF</span>
              </button>

              <button
                onClick={() => {
                  setShowMoreMenu(false);
                  onOpenBadges();
                }}
                className="flex items-center gap-2 p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-xs"
              >
                <Award className="w-4 h-4 shrink-0" />
                <span>Récords & PRs</span>
              </button>
            </div>

            {/* Secondary navigation items */}
            <div className="grid grid-cols-2 gap-2">
              {moreSubItems.map(sub => {
                const Icon = sub.icon;
                const isActive = currentTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setCurrentTab(sub.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-volt text-obsidian font-black border-volt shadow-lg shadow-volt/20'
                        : 'bg-obsidian-surface border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-obsidian' : 'text-volt'}`} />
                    <span className="text-xs font-semibold leading-tight">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/92 backdrop-blur-xl border-t border-slate-800/80 bottom-nav-safe">
        <div className="flex items-center justify-around px-2 py-1.5">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = !item.isMore && currentTab === item.id;
            const isMoreActive = item.isMore && showMoreMenu;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all ${
                  item.highlight
                    ? 'text-volt-neon'
                    : isActive || isMoreActive
                    ? 'text-volt-neon font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${
                  item.highlight
                    ? 'btn-volt shadow-volt-md scale-110 mb-0.5'
                    : isActive || isMoreActive
                    ? 'bg-volt-neon/15 text-volt-neon ring-1 ring-volt-neon/30'
                    : ''
                }`}>
                  <Icon className={`w-5 h-5 ${item.highlight ? 'text-slate-950 fill-slate-950' : ''}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-md">
                      {item.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive || isMoreActive ? 'font-black text-volt-neon' : 'font-semibold'
                }`}>
                  {item.label}
                </span>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-volt-neon mt-0.5 shadow-sm shadow-volt-neon" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
