// Hábitos diarios: el registro "today" se reinicia cada día y el día anterior pasa al historial.
import { todayISO, addDaysISO } from '../utils/helpers';
import { emptyHabits } from './model';

export function dayCompliance(doc, day) {
  if (!doc || !day) return 0;
  const parts = [
    Math.min(1, (day.water || 0) / (doc.waterTarget || 1)),
    Math.min(1, (day.protein || 0) / (doc.proteinTarget || 1)),
    Math.min(1, (day.steps || 0) / (doc.stepsTarget || 1)),
    Math.min(1, (day.sleep || 0) / (doc.sleepTarget || 1)),
    (doc.checklistItems || []).length ? (day.done || []).length / doc.checklistItems.length : 0
  ];
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}

// Devuelve el documento con "today" correspondiente a hoy (sin escribir nada).
export function resolveHabits(doc, studentId, today = todayISO()) {
  const base = doc || emptyHabits(studentId);
  if (base.today?.date === today) return base;
  const history = [...(base.history || [])];
  if (base.today?.date) {
    history.unshift({ date: base.today.date, compliance: dayCompliance(base, base.today) });
  }
  return {
    ...base,
    today: { date: today, water: 0, protein: 0, steps: 0, sleep: 0, done: [] },
    history: history.slice(0, 30)
  };
}

// % promedio de cumplimiento de los últimos 7 días (incluye hoy).
export function weeklyCompliance(doc, today = todayISO()) {
  if (!doc) return 0;
  const from = addDaysISO(today, -6);
  const values = [dayCompliance(doc, doc.today), ...(doc.history || []).filter(h => h.date >= from && h.date < today).map(h => h.compliance)];
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}
