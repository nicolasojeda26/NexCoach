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
import { latestPeriod, periodsList, monthLabel, todayISO, formatDate, copyToClipboard } from '../utils/helpers';

export default function PaymentsView({ appState, onUpdatePayment, onAddPayment, onUpdateCoachInfo, currentRole }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'overdue'
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [selectedMPPayment, setSelectedMPPayment] = useState(null);
  const [selectedPaymentForAction, setSelectedPaymentForAction] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [receiptPayment, setReceiptPayment] = useState(null);

  // Form states for registering a payment
  const [payMethod, setPayMethod] = useState('Transferencia Bancaria');
  const [payNotes, setPayNotes] = useState('');

  // Form states for new charge
  const planPriceFor = (studentId) => {
    const st = appState.students.find(s => s.id === studentId);
    return appState.plans.find(pl => pl.id === st?.planId)?.price || 0;
  };
  const [newStudentId, setNewStudentId] = useState(appState.students[0]?.id || '');
  const [newMonthPeriod, setNewMonthPeriod] = useState(monthLabel());
  const [newAmount, setNewAmount] = useState(() => planPriceFor(appState.students[0]?.id));
  const [newDueDate, setNewDueDate] = useState(todayISO());

  const openNewChargeModal = () => {
    const firstId = appState.students[0]?.id || '';
    setNewStudentId(firstId);
    setNewMonthPeriod(monthLabel());
    setNewAmount(planPriceFor(firstId));
    setNewDueDate(todayISO());
    setIsRegisterModalOpen(true);
  };

  const openBankSettings = () => {
    setCoachAlias(appState.coach.alias);
    setCoachCbu(appState.coach.cbu);
    setCoachBank(appState.coach.bank);
    setIsSettingsOpen(true);
  };

  // Coach bank data
  const [coachAlias, setCoachAlias] = useState(appState.coach.alias);
  const [coachCbu, setCoachCbu] = useState(appState.coach.cbu);
  const [coachBank, setCoachBank] = useState(appState.coach.bank);

  // Financial statistics: por defecto el período más reciente con cuotas cargadas
  const availablePeriods = periodsList(appState.payments);
  const [selectedPeriod, setSelectedPeriod] = useState(() => latestPeriod(appState.payments));
  const currentMonth = availablePeriods.includes(selectedPeriod) ? selectedPeriod : latestPeriod(appState.payments);
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

  const handleCopy = async (text, fieldName) => {
    const ok = await copyToClipboard(text);
    setCopiedField(ok ? fieldName : `${fieldName}-error`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendWhatsAppReminder = (payment) => {
    const student = appState.students.find(s => s.id === payment.studentId);
    const phone = student?.phone?.replace(/[^0-9]/g, '') || '5491100000000';
    
    const message = encodeURIComponent(
      `Hola ${payment.studentName}! 👋 Te escribo del entrenamiento personalizado con el Prof. ${appState.coach.name}.\n\n` +
      `Te recuerdo los datos para el abono de la cuota de *${payment.monthPeriod}* por *$${payment.amount.toLocaleString('es-AR')}*.\n` +
      `📅 Vencimiento: ${formatDate(payment.dueDate)}\n\n` +
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
      `Hola Prof. ${appState.coach.name}! 👋 Te envío este mensaje para avisarte que realicé la transferencia de la cuota de ${(studentDuePayment || latestStudentPayment)?.monthPeriod || currentMonth}. Adjunto el comprobante por acá. ¡Gracias!`
    );
    window.open(`https://wa.me/${coachPhone}?text=${message}`, '_blank');
  };

  const handleConfirmPayment = () => {
    if (!selectedPaymentForAction) return;

    onUpdatePayment({
      ...selectedPaymentForAction,
      status: 'paid',
      paidDate: todayISO(),
      method: payMethod,
      notes: payNotes || 'Abonado y verificado por el profesor.'
    });

    setSelectedPaymentForAction(null);
  };

  const handleSimulateMPApproval = (payment) => {
    onUpdatePayment({
      ...payment,
      status: 'paid',
      paidDate: todayISO(),
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

    if (Number(newAmount) <= 0) return;
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
      notes: 'Cuota generada manualmente por el profesor'
    };

    onAddPayment(newPayment);
    setSelectedPeriod(newMonthPeriod);
    setIsRegisterModalOpen(false);
  };

  const handleSaveBankSettings = (e) => {
    e.preventDefault();
    onUpdateCoachInfo({
      alias: coachAlias.trim().toUpperCase(),
      cbu: coachCbu.replace(/\s/g, ''),
      bank: coachBank.trim()
    });
    setIsSettingsOpen(false);
  };

  // Student perspective
  const currentStudent = appState.students[0]; // Alumna del portal (Agostina Baju)
  const studentPlan = appState.plans.find(pl => pl.id === currentStudent.planId);
  const studentPayments = appState.payments
    .filter(p => p.studentId === currentStudent.id)
    .sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
  const latestStudentPayment = studentPayments[0];
  // Cuota a pagar: la más vieja que siga impaga (si no hay, está al día).
  const studentDuePayment = [...studentPayments].reverse().find(p => p.status !== 'paid') || null;
  const studentStatusUI = {
    paid: { label: 'Al día', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
    pending: { label: 'Pendiente', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
    overdue: { label: 'Vencida', cls: 'bg-rose-500/20 text-rose-400 border-rose-500/40' }
  }[studentDuePayment ? studentDuePayment.status : 'paid'];

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
                ESTADO DE MI CUOTA • {(studentDuePayment || latestStudentPayment)?.monthPeriod || monthLabel()}
              </span>
              <span className={`px-3 py-1 rounded-full font-extrabold text-xs border ${studentStatusUI.cls}`}>
                {studentStatusUI.label}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              {currentStudent.name}
            </h1>
            <p className="text-xs text-slate-300">
              {studentPlan?.name || 'Plan personalizado'} • Cuota mensual de ${(studentPlan?.price || 0).toLocaleString('es-AR')} ARS
            </p>
            {studentDuePayment && (
              <p className="text-xs text-slate-300">
                Monto a abonar: <strong className="text-white">${studentDuePayment.amount.toLocaleString('es-AR')}</strong> • Vence el <strong className="text-white">{formatDate(studentDuePayment.dueDate)}</strong>
              </p>
            )}
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
                  <span>{copiedField === 'alias' ? 'Copiado' : copiedField === 'alias-error' ? 'No se pudo' : 'Copiar'}</span>
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
                  <span>{copiedField === 'cbu' ? 'Copiado' : copiedField === 'cbu-error' ? 'No se pudo' : 'Copiar'}</span>
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
              {studentDuePayment && (
              <button
                onClick={() => {
                  setSelectedMPPayment(studentDuePayment);
                  setIsMercadoPagoModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Pagar con Mercado Pago (Link / QR Inmediato)</span>
              </button>
              )}

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
            <h3 className="text-sm font-bold text-white">Mis Cuotas</h3>
            <div className="space-y-2">
              {studentPayments.map(pay => (
                <div key={pay.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{pay.monthPeriod}</span>
                    <span className="text-[10px] text-slate-400">
                      {pay.status === 'paid'
                        ? `Abonado el ${formatDate(pay.paidDate)} vía ${pay.method}`
                        : `Vence el ${formatDate(pay.dueDate)}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black text-sm block ${pay.status === 'paid' ? 'text-emerald-400' : pay.status === 'overdue' ? 'text-rose-400' : 'text-amber-400'}`}>${pay.amount.toLocaleString('es-AR')}</span>
                    <span className="text-[10px] text-slate-500">
                      {pay.status === 'paid' ? 'Pago verificado' : pay.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                    </span>
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
                <select
                  value={currentMonth}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  aria-label="Período de cobro"
                  className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 focus:outline-none"
                >
                  {availablePeriods.map(per => (
                    <option key={per} value={per} className="bg-slate-900 text-white">{per}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Gestión de cobros, recaudación y recordatorios automáticos por WhatsApp.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openBankSettings}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors"
              >
                <Building className="w-3.5 h-3.5 text-emerald-400" />
                <span>Alias/CBU</span>
              </button>
              <button
                onClick={openNewChargeModal}
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

          {/* Buscador */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por alumno o mes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
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
                        <span>Vence: {formatDate(p.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="sm:text-right">
                      <span className="text-base font-black text-white block">
                        ${p.amount.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {p.paidDate ? `Pagó: ${formatDate(p.paidDate)}` : p.method}
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
                            setPayMethod(['Transferencia Bancaria', 'Mercado Pago', 'Efectivo'].includes(p.method) ? p.method : 'Transferencia Bancaria');
                            setPayNotes('');
                          }}
                          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all"
                        >
                          Cobrar
                        </button>
                      ) : (
                        <button
                          onClick={() => setReceiptPayment(p)}
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
            {filteredPayments.length === 0 && (
              <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                No hay cuotas que coincidan con el filtro o la búsqueda.
              </div>
            )}
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
                  onChange={(e) => { setNewStudentId(e.target.value); setNewAmount(planPriceFor(e.target.value)); }}
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
                  min="1"
                  step="1"
                  inputMode="numeric"
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

      {/* Modal: Datos bancarios del profesor (Alias / CBU) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleSaveBankSettings} className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Datos para Cobrar (Alias / CBU)</h3>
              <button type="button" onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white" aria-label="Cerrar">✕</button>
            </div>
            <p className="text-[11px] text-slate-400">
              Estos datos se usan en los recordatorios por WhatsApp y en la pantalla "Mi Cuota" de los alumnos.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alias:</label>
                <input type="text" value={coachAlias} onChange={(e) => setCoachAlias(e.target.value)} required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono uppercase focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">CBU / CVU (22 dígitos):</label>
                <input type="text" inputMode="numeric" value={coachCbu} onChange={(e) => setCoachCbu(e.target.value)} required
                  pattern="\s*(\d\s*){22}" title="El CBU/CVU debe tener 22 dígitos"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Banco / Billetera:</label>
                <input type="text" value={coachBank} onChange={(e) => setCoachBank(e.target.value)} required
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold">Guardar Datos</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Recibo de pago */}
      {receiptPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setReceiptPayment(null)}>
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2"><Receipt className="w-4 h-4 text-emerald-400" /> Recibo de Pago</h3>
              <button type="button" onClick={() => setReceiptPayment(null)} className="text-slate-400 hover:text-white" aria-label="Cerrar">✕</button>
            </div>
            <div className="text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Alumno</span><strong className="text-white">{receiptPayment.studentName}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Período</span><strong className="text-white">{receiptPayment.monthPeriod}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Monto</span><strong className="text-emerald-400">${receiptPayment.amount.toLocaleString('es-AR')}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Medio</span><strong className="text-white">{receiptPayment.method}</strong></div>
              <div className="flex justify-between"><span className="text-slate-400">Fecha de pago</span><strong className="text-white">{formatDate(receiptPayment.paidDate)}</strong></div>
              {receiptPayment.notes && <p className="pt-2 border-t border-slate-800 text-slate-400">{receiptPayment.notes}</p>}
            </div>
            <button type="button" onClick={() => setReceiptPayment(null)} className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold">Cerrar</button>
          </div>
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
                ${(selectedMPPayment?.amount || 0).toLocaleString('es-AR')} ARS
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
                onClick={() => selectedMPPayment?.id && handleSimulateMPApproval(selectedMPPayment)}
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
