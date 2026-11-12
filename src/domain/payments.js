// Reglas de cuotas: estado efectivo y generación automática de la cuota del mes.
import { MONTHS, todayISO, periodKey } from '../utils/helpers';

export { effectiveStatus } from '../utils/helpers';

// ID determinístico: si dos dispositivos generan la misma cuota, no se duplica.
export const monthlyPaymentId = (studentId, year, monthIdx) =>
  `pay-${studentId}-${year}-${String(monthIdx + 1).padStart(2, '0')}`;

// Devuelve las cuotas del mes actual que faltan crear para los alumnos activos.
// Solo genera desde el mes de alta del alumno y no toca meses anteriores.
export function missingMonthlyCharges(state, today = todayISO()) {
  const [y, m] = today.split('-').map(Number);
  const monthIdx = m - 1;
  const label = `${MONTHS[monthIdx]} ${y}`;
  const currentKey = y * 12 + monthIdx;
  const day = Math.min(28, Math.max(1, Number(state.coach?.billingDay) || 10));
  const dueDate = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (state.students || [])
    .filter(s => s.status !== 'inactive')
    .filter(s => {
      if (!s.startDate) return true;
      const [sy, sm] = s.startDate.split('-').map(Number);
      return sy * 12 + (sm - 1) <= currentKey;
    })
    .filter(s => !(state.payments || []).some(p => p.studentId === s.id && periodKey(p.monthPeriod) === currentKey))
    .map(s => {
      const plan = (state.plans || []).find(p => p.id === s.planId);
      return {
        id: monthlyPaymentId(s.id, y, monthIdx),
        studentId: s.id,
        studentName: s.name,
        monthPeriod: label,
        amount: plan?.price || 0,
        dueDate,
        paidDate: null,
        status: 'pending',
        method: 'Transferencia Bancaria',
        receiptUrl: null,
        notes: 'Cuota mensual generada automáticamente.'
      };
    });
}
