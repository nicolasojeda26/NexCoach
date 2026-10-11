import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Dumbbell,
  Ruler,
  TrendingUp,
  Video,
  CreditCard,
  Sparkles,
  MessageSquare,
  Droplets,
  Layers,
  Award,
  Printer
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, currentRole, appState, onOpenReport, onOpenBadges }) {
  const pendingCount = appState.payments.filter(p => p.status === 'overdue' || p.status === 'pending').length;
  const pendingReviews = (appState.techniqueSubmissions || []).filter(s => s.status === 'pending').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['coach', 'student']
    },
    {
      id: 'workout',
      label: 'Entrenar Hoy',
      icon: Dumbbell,
      highlight: true,
      roles: ['coach', 'student']
    },
    {
      id: 'routines',
      label: 'Rutinas & Mesociclos',
      icon: CalendarDays,
      roles: ['coach', 'student']
    },
    {
      id: 'feedback',
      label: 'Corrección de Video',
      icon: MessageSquare,
      badge: currentRole === 'coach' && pendingReviews > 0 ? pendingReviews : null,
      roles: ['coach', 'student']
    },
    {
      id: 'habits',
      label: 'Hábitos & Nutrición',
      icon: Droplets,
      roles: ['coach', 'student']
    },
    {
      id: 'templates',
      label: 'Plantillas de Rutina',
      icon: Layers,
      roles: ['coach']
    },
    {
      id: 'students',
      label: 'Fichas de Alumnos',
      icon: Users,
      roles: ['coach']
    },
    {
      id: 'anthropometry',
      label: 'Medidas Corporales',
      icon: Ruler,
      roles: ['coach', 'student']
    },
    {
      id: 'strength',
      label: 'Fuerza & Kilos Movidos',
      icon: TrendingUp,
      roles: ['coach', 'student']
    },
    {
      id: 'videos',
      label: 'Videoteca de Técnica',
      icon: Video,
      roles: ['coach', 'student']
    },
    {
      id: 'payments',
      label: 'Control de Pagos',
      icon: CreditCard,
      badge: currentRole === 'coach' && pendingCount > 0 ? pendingCount : null,
      roles: ['coach', 'student']
    }
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside className="w-full md:w-64 bg-obsidian-card/70 md:border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between backdrop-blur-md">
      <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {visibleItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-xs md:text-sm whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-volt text-obsidian font-black shadow-lg shadow-volt/20 scale-[1.02]'
                  : item.highlight
                  ? 'bg-volt/10 text-volt hover:bg-volt/20 border border-volt/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'text-obsidian' : item.highlight ? 'text-volt' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  isActive ? 'bg-obsidian text-volt' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Action Badges / Report triggers */}
      <div className="hidden md:flex flex-col gap-2 pt-4 border-t border-slate-800/80 mt-4">
        <button
          onClick={onOpenReport}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-obsidian-surface hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all border border-slate-800 hover:border-slate-700"
        >
          <Printer className="w-4 h-4 text-volt" />
          <span>Informe PDF Mensual</span>
        </button>

        <button
          onClick={onOpenBadges}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all border border-cyan-500/25"
        >
          <Award className="w-4 h-4 text-cyan-400" />
          <span>Récords (PRs) & Medallas</span>
        </button>
      </div>
    </aside>
  );
}
