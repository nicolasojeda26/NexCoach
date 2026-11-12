import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Scale,
  Activity,
  HeartPulse,
  CreditCard,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { todayISO, addDaysISO, formatDate } from '../utils/helpers';
import Avatar from '../components/Avatar';
import { useEscape } from '../hooks/useEscape';

export default function StudentsView({ appState, onAddStudent, onUpdateStudent, onAddWeight, activeStudentId, onSelectStudent, createInvite, mode, notify }) {
  // La ficha abierta es la del alumno activo (se comparte con el selector de arriba).
  const selectedStudentId = activeStudentId;
  const setSelectedStudentId = onSelectStudent;
  const [editingId, setEditingId] = useState(null); // null = alta nueva
  const [showInactive, setShowInactive] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [inviteBusy, setInviteBusy] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'overdue'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Student Form State
  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    age: 22,
    gender: 'Femenino',
    height: 165,
    currentWeight: 60,
    targetWeight: 63,
    planId: appState.plans[0]?.id || 'plan-1',
    notes: ''
  };
  const [formData, setFormData] = useState(emptyForm);
  const openNewStudentModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };
  const openEditModal = (st) => {
    setEditingId(st.id);
    setFormData({
      name: st.name, email: st.email || '', phone: st.phone || '', age: st.age, gender: st.gender,
      height: st.height, currentWeight: st.currentWeight, targetWeight: st.targetWeight, planId: st.planId, notes: st.notes || ''
    });
    setIsModalOpen(true);
  };
  useEscape(isModalOpen, () => setIsModalOpen(false));

  const selectedStudent = appState.students.find(s => s.id === selectedStudentId) || appState.students[0];
  const weightHistory = (appState.weightHistory || []).filter(w => w.studentId === selectedStudent?.id);
  const inactiveCount = appState.students.filter(s => s.status === 'inactive').length;
  const studentLogs = (appState.workoutLogs || []).filter(l => l.studentId === selectedStudent?.id && l.date >= addDaysISO(todayISO(), -27));
  const recentSessions = studentLogs.length;
  const avgRpe = studentLogs.length ? (studentLogs.reduce((acc, l) => acc + (Number(l.rpe) || 0), 0) / studentLogs.length).toFixed(1) : '—';

  const filteredStudents = appState.students.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(term) || (s.email || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || s.paymentStatus === statusFilter;
    const matchesActive = showInactive || s.status !== 'inactive';
    return matchesSearch && matchesStatus && matchesActive;
  });

  const handleToggleActive = (st) => {
    const deactivate = st.status !== 'inactive';
    if (deactivate && !window.confirm(`¿Dar de baja a ${st.name}? Deja de generar cuotas, pero se conserva su historial.`)) return;
    onUpdateStudent({ ...st, status: deactivate ? 'inactive' : 'active' });
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    const w = Number(weightInput);
    if (!selectedStudent || !(w > 20 && w < 300)) return;
    const h = selectedStudent.height / 100;
    const imc = Number((w / (h * h)).toFixed(1));
    const d = new Date();
    const label = `${['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][d.getMonth()]} ${d.getFullYear()}`;
    onAddWeight({ studentId: selectedStudent.id, date: label, isoDate: todayISO(), weight: w, imc });
    onUpdateStudent({ ...selectedStudent, currentWeight: w, currentIMC: imc });
    setWeightInput('');
  };

  const handleInvite = async () => {
    if (!selectedStudent) return;
    setInviteBusy(true);
    try {
      const code = selectedStudent.inviteCode || await createInvite(selectedStudent);
      const link = `${window.location.origin}/?invite=${code}`;
      const msg = encodeURIComponent(
        `Hola ${selectedStudent.name}! 👋 Te invito a la app de entrenamiento.\n\n` +
        `Entrá a ${link} y creá tu cuenta con este código: *${code}*\n\nAhí vas a ver tu rutina, tu cuota y tu progreso. 💪`
      );
      window.open(`https://wa.me/${(selectedStudent.phone || '').replace(/[^0-9]/g, '')}?text=${msg}`, '_blank', 'noopener');
    } catch (err) {
      notify?.(err.message, 'error');
    } finally {
      setInviteBusy(false);
    }
  };

  const calculateIMC = (weight, heightCm) => {
    const h = heightCm / 100;
    return (weight / (h * h)).toFixed(1);
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    const imc = Number(calculateIMC(formData.currentWeight, formData.height));
    const targetImc = Number(calculateIMC(formData.targetWeight, formData.height));

    if (editingId) {
      const current = appState.students.find(s => s.id === editingId);
      onUpdateStudent({
        ...current,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        currentWeight: Number(formData.currentWeight),
        targetWeight: Number(formData.targetWeight),
        currentIMC: imc,
        targetIMC: targetImc,
        planId: formData.planId,
        notes: formData.notes
      });
      setIsModalOpen(false);
      return;
    }

    const today = todayISO();
    const newStudent = {
      id: `std-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      age: Number(formData.age),
      gender: formData.gender,
      height: Number(formData.height),
      currentWeight: Number(formData.currentWeight),
      targetWeight: Number(formData.targetWeight),
      currentIMC: imc,
      targetIMC: targetImc,
      avatar: null,
      planId: formData.planId,
      status: "active",
      startDate: today,
      notes: formData.notes || "Objetivo de acondicionamiento físico.",
      // Alumno nuevo: queda con su primera cuota pendiente (se genera automáticamente)
      paymentStatus: "pending",
      lastPaymentDate: null,
      nextDueDate: addDaysISO(today, 7)
    };

    onAddStudent(newStudent);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-volt/20 bg-gradient-to-br from-obsidian-card via-obsidian to-obsidian-surface shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>ROSTER DE ATLETAS & BIOMETRÍA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Gestión Integral de Alumnos
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Fichas médicas, objetivos corporales, IMC, estados de suscripción y comunicación directa por WhatsApp.
            </p>
          </div>

          <button
            onClick={openNewStudentModal}
            className="btn-volt flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-volt/20 hover:scale-[1.02] transition-all self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4 stroke-[3]" />
            <span>NUEVO ALUMNO</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Student List vs Student Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student List */}
        <div className="space-y-3">
          {/* Search bar & filter pills */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar alumno o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-obsidian-surface border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-volt"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'paid', label: 'Al Día' },
                { id: 'pending', label: 'Pendientes' },
                { id: 'overdue', label: 'Vencidos' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-xl transition-all ${
                    statusFilter === f.id
                      ? 'bg-volt text-obsidian font-black'
                      : 'bg-obsidian-surface text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Students List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredStudents.map(student => {
              const isSelected = student.id === selectedStudentId;
              const plan = appState.plans.find(p => p.id === student.planId);

              return (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  aria-pressed={isSelected}
                  className={`w-full text-left p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${student.status === 'inactive' ? 'opacity-50 ' : ''}${
                    isSelected
                      ? 'bg-obsidian-surface border-volt/60 shadow-lg shadow-volt/10 scale-[1.01]'
                      : 'bg-obsidian-card/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar student={student} className={`w-11 h-11 rounded-2xl ring-2 ${isSelected ? 'ring-volt' : 'ring-slate-700'}`} />
                      <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-obsidian ${
                        student.paymentStatus === 'paid' ? 'bg-volt' : student.paymentStatus === 'pending' ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{student.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {student.age}a • {student.currentWeight}kg • IMC {student.currentIMC}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {student.paymentStatus === 'paid' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-volt font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Al día
                      </span>
                    )}
                    {student.paymentStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-mono font-bold">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </span>
                    )}
                    {student.paymentStatus === 'overdue' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-mono font-bold">
                        <AlertTriangle className="w-3 h-3" />
                        Vencido
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {plan?.name.split(' ')[0] || 'Plan'}
                    </span>
                  </div>
                </button>
              );
            })}
            {filteredStudents.length === 0 && (
              <p className="p-4 text-xs text-slate-400 text-center border border-dashed border-slate-800 rounded-2xl">
                {appState.students.length ? 'Ningún alumno coincide con la búsqueda.' : 'Todavía no hay alumnos. Creá el primero con "Nuevo alumno".'}
              </p>
            )}
          </div>
          {inactiveCount > 0 && (
            <label className="flex items-center gap-2 text-[11px] text-slate-400 px-1">
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="accent-emerald-500" />
              Mostrar dados de baja ({inactiveCount})
            </label>
          )}
        </div>

        {/* Right Column: Detailed Student Profile Card */}
        <div className="lg:col-span-2">
          {selectedStudent && (
            <div className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-sm">
              {/* Header profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar student={selectedStudent} className="w-16 h-16 rounded-2xl ring-2 ring-volt/60 shadow-lg shadow-volt/10" textClass="text-lg" />
                    <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-obsidian border border-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-volt" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      {selectedStudent.name}
                      {selectedStudent.status === 'inactive' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">De baja</span>}
                    </h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {selectedStudent.gender} • {selectedStudent.age} años • Ingreso: {formatDate(selectedStudent.startDate)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={`https://wa.me/${(selectedStudent.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${selectedStudent.name}, te escribo del equipo de NexCoach para tu plan de entrenamiento!`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-volt/10 hover:bg-volt/20 text-volt text-xs font-mono font-bold border border-volt/30 transition-all hover:scale-[1.02]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Directo</span>
                      </a>
                      {selectedStudent.email && <a
                        href={`mailto:${selectedStudent.email}`}
                        className="p-1.5 rounded-xl bg-obsidian-surface hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors"
                        title="Enviar correo"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800 sm:text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">PLAN ASIGNADO</span>
                  <span className="text-xs font-black text-white block mt-0.5">
                    {appState.plans.find(p => p.id === selectedStudent.planId)?.name || 'Plan Personalizado'}
                  </span>
                  <span className="text-sm font-black text-volt font-mono block mt-1">
                    ${(appState.plans.find(p => p.id === selectedStudent.planId)?.price || 0).toLocaleString('es-AR')} / mes
                  </span>
                </div>
              </div>

              {/* Biometrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800">
                  <span className="text-slate-400 text-[11px] font-mono block">ALTURA</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{selectedStudent.height} cm</span>
                  <span className="text-[10px] text-slate-500 font-mono">Talla oficial</span>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800">
                  <span className="text-slate-400 text-[11px] font-mono block">PESO ACTUAL</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{selectedStudent.currentWeight} kg</span>
                  <span className="text-[10px] text-volt font-mono font-bold">Meta: {selectedStudent.targetWeight} kg</span>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800">
                  <span className="text-slate-400 text-[11px] font-mono block">IMC ACTUAL</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{selectedStudent.currentIMC}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Meta: {selectedStudent.targetIMC}</span>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800">
                  <span className="text-slate-400 text-[11px] font-mono block">ÚLTIMAS 4 SEMANAS</span>
                  <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">{recentSessions} ses.</span>
                  <span className="text-[10px] text-slate-500 font-mono">RPE medio {avgRpe}</span>
                </div>
              </div>

              {/* Trainer Notes */}
              <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800 space-y-1.5">
                <span className="text-xs font-mono font-bold text-volt uppercase tracking-wider block">
                  OBJETIVO & DIAGNÓSTICO DEL ENTRENADOR:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedStudent.notes}
                </p>
              </div>

              {/* Acciones de la ficha */}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEditModal(selectedStudent)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-obsidian-surface border border-slate-700 hover:border-volt/50 text-xs font-bold text-slate-200">
                  <Edit2 className="w-3.5 h-3.5" aria-hidden="true" /> Editar datos
                </button>
                <button type="button" onClick={handleInvite} disabled={inviteBusy || mode !== 'cloud'}
                  title={mode !== 'cloud' ? 'Disponible con la app conectada a la nube' : undefined}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-volt/10 border border-volt/30 text-volt text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed">
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  {selectedStudent.inviteCode ? `Reenviar invitación (${selectedStudent.inviteCode})` : 'Invitar a la app por WhatsApp'}
                </button>
                <button type="button" onClick={() => handleToggleActive(selectedStudent)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 border border-slate-800">
                  {selectedStudent.status === 'inactive' ? 'Reactivar alumno' : 'Dar de baja'}
                </button>
              </div>
              {mode !== 'cloud' && (
                <p className="text-[11px] text-slate-500 -mt-3">La invitación para que el alumno use la app con su cuenta funciona con la app conectada a la nube.</p>
              )}

              {/* Evolución de peso del alumno */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-volt" aria-hidden="true" />
                    <span>Evolución de peso</span>
                    <span className="text-[10px] font-mono text-volt">({weightHistory.length} controles)</span>
                  </span>
                  <form onSubmit={handleAddWeight} className="flex items-center gap-1.5">
                    <label className="sr-only" htmlFor="peso-hoy">Peso de hoy en kg</label>
                    <input id="peso-hoy" type="number" step="0.1" min="20" max="300" inputMode="decimal" value={weightInput}
                      onChange={(e) => setWeightInput(e.target.value)} placeholder="Peso hoy (kg)"
                      className="w-32 px-2.5 py-1.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-volt" />
                    <button type="submit" className="px-3 py-1.5 rounded-xl bg-volt text-obsidian text-xs font-black">Registrar</button>
                  </form>
                </div>
                {weightHistory.length ? (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    {weightHistory.slice(-12).map(w => (
                      <div key={w.id} className="p-3 rounded-2xl bg-obsidian-surface border border-slate-800 font-mono">
                        <span className="text-[10px] text-slate-400 block">{w.date}</span>
                        <strong className="text-sm font-black text-white mt-1 block">{w.weight} kg</strong>
                        <span className="text-[10px] text-volt block mt-0.5">IMC {w.imc}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Todavía no hay pesajes registrados.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Añadir Alumno */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleCreateStudent}
            className="bg-obsidian-card border border-volt/30 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-volt/10 text-volt">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">{editingId ? 'Editar alumno' : 'Añadir nuevo alumno'}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Carolina Díaz"
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white focus:outline-none focus:border-volt"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+54911..."
                    inputMode="tel"
                    pattern="\+?[\d\s\-]{8,}"
                    title="Ingresá el número con código de área, ej: +5491155443322"
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white focus:outline-none focus:border-volt"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email (opcional):</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alumno@email.com"
                  className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white focus:outline-none focus:border-volt"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Edad:</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="10" max="100"
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Sexo:</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Altura (cm):</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    min="100" max="230"
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Peso (kg):</label>
                  <input
                    type="number"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                    min="25" max="250" step="0.1"
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Peso objetivo (kg):</label>
                  <input
                    type="number"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                    min="25" max="250" step="0.1"
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
                <div className="flex items-end text-[11px] text-slate-400 pb-2">
                  IMC estimado: {formData.height > 0 ? calculateIMC(formData.currentWeight, formData.height) : '—'}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Plan de Entrenamiento:</label>
                <select
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white"
                >
                  {appState.plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.price.toLocaleString('es-AR')}/mes</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Objetivos & Observaciones:</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ej: Acondicionamiento físico, hipertrofia de glúteos..."
                  className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white focus:outline-none focus:border-volt"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-volt px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-volt/20 hover:scale-[1.02] transition-transform"
              >
                {editingId ? 'Guardar cambios' : 'Crear Alumno'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
