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

export default function StudentsView({ appState, onAddStudent }) {
  const [selectedStudentId, setSelectedStudentId] = useState(appState.students[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'overdue'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: 22,
    gender: 'Femenino',
    height: 165,
    currentWeight: 60,
    targetWeight: 63,
    planId: 'plan-2',
    notes: ''
  });

  const selectedStudent = appState.students.find(s => s.id === selectedStudentId) || appState.students[0];

  const filteredStudents = appState.students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const calculateIMC = (weight, heightCm) => {
    const h = heightCm / 100;
    return (weight / (h * h)).toFixed(1);
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    const imc = Number(calculateIMC(formData.currentWeight, formData.height));
    const targetImc = Number(calculateIMC(formData.targetWeight, formData.height));

    const newStudent = {
      id: `std-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '+5491100000000',
      age: Number(formData.age),
      gender: formData.gender,
      height: Number(formData.height),
      currentWeight: Number(formData.currentWeight),
      targetWeight: Number(formData.targetWeight),
      currentIMC: imc,
      targetIMC: targetImc,
      avatar: formData.gender === 'Femenino'
        ? "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
        : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      planId: formData.planId,
      status: "active",
      startDate: new Date().toISOString().split('T')[0],
      notes: formData.notes || "Objetivo de acondicionamiento físico.",
      avgFatigue: 7.0,
      weeklyHours: 5.0,
      monthlyHours: 20,
      paymentStatus: "paid",
      lastPaymentDate: new Date().toISOString().split('T')[0],
      nextDueDate: "2026-11-05"
    };

    onAddStudent(newStudent);
    setSelectedStudentId(newStudent.id);
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
            onClick={() => setIsModalOpen(true)}
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
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-obsidian-surface border-volt/60 shadow-lg shadow-volt/10 scale-[1.01]'
                      : 'bg-obsidian-card/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className={`w-11 h-11 rounded-2xl object-cover ring-2 ${
                          isSelected ? 'ring-volt' : 'ring-slate-700'
                        }`}
                      />
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Student Profile Card */}
        <div className="lg:col-span-2">
          {selectedStudent && (
            <div className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-2xl backdrop-blur-sm">
              {/* Header profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={selectedStudent.avatar}
                      alt={selectedStudent.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-volt/60 shadow-lg shadow-volt/10"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 p-1 rounded-full bg-obsidian border border-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-volt" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{selectedStudent.name}</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {selectedStudent.gender} • {selectedStudent.age} años • Ingreso: {selectedStudent.startDate}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(selectedStudent.name)},%20te%20escribo%20del%20equipo%20de%20NexCoach%20para%20tu%20plan%20de%20entrenamiento!`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-volt/10 hover:bg-volt/20 text-volt text-xs font-mono font-bold border border-volt/30 transition-all hover:scale-[1.02]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Directo</span>
                      </a>
                      <a
                        href={`mailto:${selectedStudent.email}`}
                        className="p-1.5 rounded-xl bg-obsidian-surface hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition-colors"
                        title="Enviar correo"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800 sm:text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">PLAN ASIGNADO</span>
                  <span className="text-xs font-black text-white block mt-0.5">
                    {appState.plans.find(p => p.id === selectedStudent.planId)?.name || 'Plan Personalizado'}
                  </span>
                  <span className="text-sm font-black text-volt font-mono block mt-1">
                    ${appState.plans.find(p => p.id === selectedStudent.planId)?.price.toLocaleString('es-AR')} / mes
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
                  <span className="text-slate-400 text-[11px] font-mono block">RPE / FATIGA</span>
                  <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">{selectedStudent.avgFatigue} / 10</span>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedStudent.weeklyHours} hs / semana</span>
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

              {/* Weight Evolution for Agostina Baju */}
              {selectedStudent.id === 'std-1' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-volt" />
                      <span>Evolución Ponderal (Plan 2026 Agostina):</span>
                    </span>
                    <span className="text-[10px] font-mono text-volt">6 Controles</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    {appState.weightHistory.map(w => (
                      <div key={w.date} className="p-3 rounded-2xl bg-obsidian-surface border border-slate-800 font-mono">
                        <span className="text-[10px] text-slate-400 block">{w.date}</span>
                        <strong className="text-sm font-black text-white mt-1 block">{w.weight} kg</strong>
                        <span className="text-[10px] text-volt block mt-0.5">IMC {w.imc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <h3 className="text-base font-black text-white">Añadir Nuevo Atleta</h3>
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
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white focus:outline-none focus:border-volt"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Edad:</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
                    className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono"
                    required
                  />
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
                Crear Alumno
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
