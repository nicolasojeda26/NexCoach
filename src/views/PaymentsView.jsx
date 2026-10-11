import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  DollarSign,
  Receipt,
  Search,
  Filter,
  Building,
  Copy,
  Check,
  User,
  Calendar,
  Sparkles,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  QrCode,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentsView({ appState, onUpdatePayment, onAddPayment, onUpdateCoachInfo, currentRole }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'overdue'
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [selectedMPPayment, setSelectedMPPayment] = useState(null);
  const [selectedPaymentForAction, setSelectedPaymentForAction] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Form states for registering a payment
  const [payMethod, setPayMethod] = useState('Transferencia Bancaria');
  const [payNotes, setPayNotes] = useState('');

  // Form states for new charge
  const [newStudentId, setNewStudentId] = useState(appState.students[0]?.id || '');
  const [newMonthPeriod, setNewMonthPeriod] = useState('Noviembre 2026');
  const [newAmount, setNewAmount] = useState(46000);
  const [newDueDate, setNewDueDate] = useState('2026-11-05');

  // Coach bank data
  const [coachAlias, setCoachAlias] = useState(appState.coach.alias);
  const [coachCbu, setCoachCbu] = useState(appState.coach.cbu);
  const [coachBank, setCoachBank] = useState(appState.coach.bank);

  // Financial statistics
  const currentMonth = "Octubre 2026";
  const currentMonthPayments = appState.payments.filter(p => p.monthPeriod === currentMonth);

  const totalCollected = currentMonthPayments
    .filter(p => p.status === 'paid')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalPending = currentMonthPayments
    .filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalOverdue = currentMonthPayments
    .filter(p => p.status === 'overdue')
    .reduce((acc, p) => acc + p.amount, 0);

  const totalExpected = totalCollected + totalPending + totalOverdue;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Filtered payments list
  const filteredPayments = appState.payments.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch = p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.monthPeriod.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendWhatsAppReminder = (payment) => {
    const student = appState.students.find(s => s.id === payment.studentId);
    const phone = student?.phone?.replace(/[^0-9]/g, '') || '5491100000000';
    
    const message = encodeURIComponent(
      `Hola ${payment.studentName}! 👋 Te escribo del entrenamiento personalizado con el Prof. ${appState.coach.name}.\n\n` +
      `Te recuerdo los datos para el abono de la cuota de *${payment.monthPeriod}* por *$${payment.amount.toLocaleString('es-AR')}*.\n` +
      `📅 Vencimiento: ${payment.dueDate}\n\n` +
      `💳 Datos para transferencia:\n` +
      `• *Alias:* ${appState.coach.alias}\n` +
      `• *CBU:* ${appState.coach.cbu}\n` +
      `• *Banco:* ${appState.coach.bank}\n\n` +
      `Por favor envíame el comprobante cuando realices el pago. ¡Muchas gracias! 💪`
    );

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleNotifyPaymentFromStudent = () => {
    const coachPhone = appState.coach.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola Prof. ${appState.coach.name}! 👋 Te envío este mensaje para avisarte que realicé la transferencia de la cuota de ${currentMonth}. Adjunto el comprobante por acá. ¡Gracias!`
    );
    window.open(`https://wa.me/${coachPhone}?text=${message}`, '_blank');
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentForAction) return;

    onUpdatePayment({
      ...selectedPaymentForAction,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      method: payMethod,
      notes: payNotes || 'Abonado y verificado por el profesor.'
    });

    setSelectedPaymentForAction(null);
  };

  const handleSimulateMPApproval = (payment) => {
    onUpdatePayment({
      ...payment,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      method: 'Mercado Pago (Automático)',
      receiptUrl: `recibo_mp_${Date.now()}.pdf`,
      notes: 'Cobro automático procesado y acreditado con Mercado Pago.'
    });
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}
    setIsMercadoPagoModalOpen(false);
  };

  const handleCreateNewCharge = (e) => {
    e.preventDefault();
    const student = appState.students.find(s => s.id === newStudentId);
    if (!student) return;

    const newPayment = {
      id: `pay-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      monthPeriod: newMonthPeriod,
      amount: Number(newAmount),
      dueDate: newDueDate,
      paidDate: null,
      status: 'pending',
      method: 'Transferencia Bancaria',
      receiptUrl: null,
      notes: 'Cuota generada automáticamente'
    };

    onAddPayment(newPayment);
    setIsRegisterModalOpen(false);
  };

  const handleSaveBankSettings = (e) => {
    e.preventDefault();
    onUpdateCoachInfo({
      alias: coachAlias,
      cbu: coachCbu,
      bank: coachBank
    });
    setIsSettingsOpen(false);
  };

  // Student perspective
  const currentStudent = appState.students[0]; // Agostina Baju
  const studentPayments = appState.payments.filter(p => p.studentId === currentStudent.id);
  const latestStudentPayment = studentPayments[0];

  return (
    <div className="space-y-5 animate-fadeIn pb-24 safe-area-bottom">
      {/* ============================================================== */}
      {/* STUDENT VIEW PERSPECTIVE ("Mi Cuota") */}
      {/* ============================================================== */}
      {currentRole === 'student' ? (
        <div className="space-y-5">
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                ESTADO DE MI CUOTA • {currentMonth}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/40">
                Al día
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {currentStudent.name}
            </h1>
            <p className="text-xs text-slate-300">
              Plan Personalizado 5x Semana • Cuota mensual de $46.000 ARS
            </p>
          </div>

          {/* Professor Bank Details with 1-Tap Copy Buttons */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <Building className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Datos para Transferir al Profesor</h2>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Alias */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">ALIAS:</span>
                  <span className="text-sm font-mono font-black text-emerald-400">{appState.coach.alias}</span>
                </div>
                <button
                  onClick={() => handleCopy(appState.coach.alias, 'alias')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold active:scale-95 text-xs transition-colors"
                >
                  {copiedField === 'alias' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'alias' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* CBU */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">CBU:</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{appState.coach.cbu}</span>
                </div>
                <button
                  onClick={() => handleCopy(appState.coach.cbu, 'cbu')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold active:scale-95 text-xs transition-colors"
                >
                  {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              {/* Banco & Titular */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex justify-between items-center text-slate-300">
                <span>Banco: <strong>{appState.coach.bank}</strong></span>
                <span>Titular: <strong>{appState.coach.name}</strong></span>
              </div>
            </div>

            {/* Pay with Mercado Pago button & Notify WhatsApp */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setSelectedMPPayment(latestStudentPayment || { amount: 46000, monthPeriod: currentMonth });
                  setIsMercadoPagoModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Pagar con Mercado Pago (Link / QR Inmediato)</span>
              </button>

              <button
                onClick={handleNotifyPaymentFromStudent}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-bold text-xs border border-emerald-500/30 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Comprobante por WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Student Payment History */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white">Mis Pagos Anteriores</h3>
            <div className="space-y-2">
              {studentPayments.map(pay => (
                <div key={pay.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{pay.monthPeriod}</span>
                    <span className="text-[10px] text-slate-400">Abonado el {pay.paidDate || 'Fecha'} vía {pay.method}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-400 text-sm block">${pay.amount.toLocaleString('es-AR')}</span>
                    <span className="text-[10px] text-slate-500">Recibo verificado</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* COACH VIEW PERSPECTIVE (Gestión Integral de Pagos del Profe) */
        /* ============================================================== */
        <div className="space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Control de Pagos & Cuotas</h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {currentMonth}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestión de cobros, recaudación y recordatorios automáticos por WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors"
              >
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>Alias/CBU</span>
              </button>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Cuota</span>
              </button>
            </div>
          </div>

          {/* Financial Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Recaudado */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">Total Cobrado</span>
              <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-1">
                ${totalCollected.toLocaleString('es-AR')}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {currentMonthPayments.filter(p => p.status === 'paid').length} alumnos al día
              </span>
            </div>

            {/* Pendiente */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">Por Cobrar</span>
              <div className="text-lg sm:text-2xl font-black text-amber-400 mt-1">
                ${totalPending.toLocaleString('es-AR')}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {currentMonthPayments.filter(p => p.status === 'pending').length} dentro del plazo
              </span>
            </div>

            {/* Vencido */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">Vencido en Mora</span>
              <div className="text-lg sm:text-2xl font-black text-rose-400 mt-1">
                ${totalOverdue.toLocaleString('es-AR')}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {currentMonthPayments.filter(p => p.status === 'overdue').length} requieren aviso
              </span>
            </div>

            {/* Tasa */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 block">Efectividad</span>
              <div className="text-lg sm:text-2xl font-black text-white mt-1">
                {collectionRate}%
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
          </div>

          {/* Filter Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'paid', label: 'Al día' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'overdue', label: 'Vencidos' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Student Payment Cards for Mobile & Responsive Table for Desktop */}
          <div className="space-y-3">
            {filteredPayments.map(p => {
              const student = appState.students.find(s => s.id === p.studentId);
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={p.studentName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{p.studentName}</span>
                        {p.status === 'paid' && (
                          <span className="px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                            Al día
                          </span>
                        )}
                        {p.status === 'pending' && (
                          <span className="px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-black border border-amber-500/30">
                            Pendiente
                          </span>
                        )}
                        {p.status === 'overdue' && (
                          <span className="px-2 py-0.2 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-black border border-rose-500/30">
                            Vencido
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{p.monthPeriod}</span>
                        <span>•</span>
                        <span>Vence: {p.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="sm:text-right">
                      <span className="text-base font-black text-white block">
                        ${p.amount.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {p.paidDate ? `Pagó: ${p.paidDate}` : p.method}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* WhatsApp Reminder Button */}
                      <button
                        onClick={() => handleSendWhatsAppReminder(p)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-95 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all"
                        title="Enviar recordatorio de cobro por WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Avisar WhatsApp</span>
                      </button>

                      {/* Marcar Pagado Button */}
                      {p.status !== 'paid' ? (
                        <button
                          onClick={() => {
                            setSelectedPaymentForAction(p);
                            setPayNotes(p.notes || '');
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all"
                        >
                          Cobrar
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Recibo de pago registrado:\nAlumno: ${p.studentName}\nMes: ${p.monthPeriod}\nMedio: ${p.method}\nFecha: ${p.paidDate}`)}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                        >
                          Recibo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Marcar como Pagado */}
      {selectedPaymentForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Registrar Pago de Cuota</h3>
              <button
                onClick={() => setSelectedPaymentForAction(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div><span className="text-slate-400">Alumno:</span> <strong className="text-white">{selectedPaymentForAction.studentName}</strong></div>
              <div><span className="text-slate-400">Período:</span> <strong className="text-white">{selectedPaymentForAction.monthPeriod}</strong></div>
              <div><span className="text-slate-400">Monto:</span> <strong className="text-emerald-400 text-sm">${selectedPaymentForAction.amount.toLocaleString('es-AR')}</strong></div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Método de Pago:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Transferencia Bancaria">Transferencia Bancaria (Alias / CBU)</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notas / Comprobante:</label>
                <input
                  type="text"
                  placeholder="Ej: Transferencia enviada por el alumno vía banco"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedPaymentForAction(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generar Nueva Cuota */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleCreateNewCharge} className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Generar Nueva Cuota Mensual</h3>
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Seleccionar Alumno:</label>
                <select
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  {appState.students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mes / Período:</label>
                <input
                  type="text"
                  value={newMonthPeriod}
                  onChange={(e) => setNewMonthPeriod(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Monto ($ ARS):</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fecha de Vencimiento:</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Crear Cuota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Mercado Pago Checkout & Simulación de Webhook */}
      {isMercadoPagoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-sky-500/20 text-sky-400">
                  <Zap className="w-5 h-5 fill-sky-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Mercado Pago Checkout</h3>
                  <span className="text-[10px] text-sky-400 font-bold">Cobro Digital Inmediato</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMercadoPagoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <span className="text-[11px] text-slate-400 block font-semibold">Total a Abonar:</span>
              <div className="text-3xl font-black text-sky-400">
                ${(selectedMPPayment?.amount || 46000).toLocaleString('es-AR')} ARS
              </div>
              <span className="text-xs text-slate-300 font-medium block">
                Cuota {selectedMPPayment?.monthPeriod || currentMonth} • Prof. {appState.coach.name}
              </span>
            </div>

            {/* Simulated QR Code */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-slate-950 space-y-2">
              <div className="w-40 h-40 border-4 border-slate-950 rounded-xl p-2 flex items-center justify-center relative bg-white">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                Escanea con la App de Mercado Pago o tu Banco
              </span>
            </div>

            {/* Direct Link */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[200px]">{appState.coach.mpCheckoutLink}</span>
              <a
                href={appState.coach.mpCheckoutLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 font-bold hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Abrir Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Test Simulation Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSimulateMPApproval(selectedMPPayment || appState.payments[0])}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs shadow-xl active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simular Pago Aprobado (Webhook Inmediato)</span>
              </button>
              <span className="text-[10px] text-slate-500 text-center block mt-1.5">
                Al simularlo, el estado cambiará automáticamente a "Al día" en el sistema.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
