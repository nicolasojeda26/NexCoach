// Modelo de datos v2: todo lo que es "del alumno" lleva studentId.
// migrateState() convierte cualquier estado anterior (o los datos semilla) al formato v2.
import { todayISO, addDaysISO } from '../utils/helpers';

export const STATE_VERSION = 2;

// Colecciones que se guardan como documentos sueltos (en Firestore: una colección cada una).
export const COLLECTIONS = [
  'students', 'plans', 'payments', 'mesocycles', 'routineTemplates', 'techniqueSubmissions',
  'workoutLogs', 'anthropometry', 'strengthProgression', 'weightHistory', 'habits', 'videoLibrary'
];

// Colecciones privadas de cada alumno (el alumno solo lee las suyas).
export const STUDENT_SCOPED = [
  'payments', 'mesocycles', 'techniqueSubmissions', 'workoutLogs',
  'anthropometry', 'strengthProgression', 'weightHistory', 'habits'
];

export const DEFAULT_COACH = {
  name: '',
  role: 'Preparador Físico & Entrenador Personal',
  alias: '',
  cbu: '',
  bank: '',
  phone: '',
  email: '',
  currency: 'ARS',
  currencySymbol: '$',
  mpCheckoutLink: '',
  mpEnabled: false,
  billingDay: 10
};

export const DEFAULT_CHECKLIST = [
  { id: 'h1', label: 'Tomar 3 litros de agua' },
  { id: 'h2', label: 'Consumir al menos 110g de proteína' },
  { id: 'h3', label: 'Dormir al menos 7.5 horas' },
  { id: 'h4', label: 'Completar 10.000 pasos diarios' },
  { id: 'h5', label: 'Suplementación (Creatina + Multivitamínico)' }
];

export const SESSIONS_PER_WEEK_BY_PLAN = { 'plan-1': 3, 'plan-2': 5, 'plan-3': 3 };

const clone = (x) => JSON.parse(JSON.stringify(x));
let uidCounter = 0;
export function newId(prefix) {
  uidCounter = (uidCounter + 1) % 1000;
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}${uidCounter}`;
}

// Copia profunda de los días de una rutina con IDs nuevos (para clonar plantillas o mesociclos).
export function cloneDays(days = [], seed = newId('c')) {
  return clone(days).map((d, di) => ({
    ...d,
    id: `day-${seed}-${di}`,
    blocks: (d.blocks || []).map((b, bi) => ({
      ...b,
      id: `b-${seed}-${di}-${bi}`,
      exercises: (b.exercises || []).map((e, ei) => ({ ...e, id: `e-${seed}-${di}-${bi}-${ei}` }))
    }))
  }));
}

export function countExercises(days = []) {
  return days.reduce((acc, d) => acc + (d.blocks || []).reduce((a, b) => a + (b.exercises || []).length, 0), 0);
}

// Documento de hábitos vacío para un alumno.
export function emptyHabits(studentId) {
  return {
    id: studentId,
    studentId,
    waterTarget: 3.0,
    proteinTarget: 120,
    stepsTarget: 10000,
    sleepTarget: 8.0,
    checklistItems: clone(DEFAULT_CHECKLIST),
    today: { date: todayISO(), water: 0, protein: 0, steps: 0, sleep: 0, done: [] },
    history: [],
    meals: []
  };
}

// Historial de sesiones de ejemplo para la demo (fechas relativas a hoy).
function demoWorkoutLogs(studentId, meso) {
  const days = meso?.days || [];
  if (!days.length) return [];
  const logs = [];
  const today = todayISO();
  // Entrena lunes a viernes las últimas 6 semanas (salteando algunos días), sin contar hoy.
  for (let back = 42; back >= 1; back--) {
    const date = addDaysISO(today, -back);
    const dow = new Date(`${date}T12:00:00`).getDay(); // 0 domingo
    if (dow === 0 || dow === 6) continue;
    if (back % 9 === 0) continue; // algún día perdido
    const day = days[(dow - 1) % days.length];
    const total = (day.blocks || []).reduce((a, b) => a + (b.exercises || []).length * (b.rounds || 3), 0);
    logs.push({
      id: `session-demo-${date}`,
      date,
      studentId,
      mesoName: meso.name,
      dayName: day.name,
      focus: day.focus,
      durationSeconds: 3300 + ((back * 137) % 900),
      completedSets: Math.max(1, total - (back % 4)),
      totalSets: total,
      rpe: 6 + (back % 4),
      loads: {}
    });
  }
  return logs.reverse();
}

// Normaliza cualquier estado (v1 de la demo, v2, parcial) al formato v2.
export function migrateState(raw, { seedDemo = false } = {}) {
  const src = raw && typeof raw === 'object' ? clone(raw) : {};
  const students = Array.isArray(src.students) ? src.students : [];
  const primaryId = students[0]?.id || null;
  const isV1 = src.version !== STATE_VERSION;

  const out = {
    version: STATE_VERSION,
    coach: { ...DEFAULT_COACH, ...(src.coach || {}) },
    students,
    plans: (src.plans || []).map(p => ({
      sessionsPerWeek: SESSIONS_PER_WEEK_BY_PLAN[p.id] || 3,
      ...p
    })),
    payments: src.payments || [],
    mesocycles: (src.mesocycles || []).map(m => ({ ...m, studentId: m.studentId || primaryId })),
    routineTemplates: [],
    techniqueSubmissions: src.techniqueSubmissions || [],
    workoutLogs: src.workoutLogs || [],
    anthropometry: (src.anthropometry || []).map((a, i) => ({ id: a.id || `anth-${i + 1}`, studentId: a.studentId || primaryId, ...a })),
    strengthProgression: (src.strengthProgression || []).map((s, i) => ({ id: s.id || `str-${i + 1}`, studentId: s.studentId || primaryId, ...s })),
    weightHistory: (src.weightHistory || []).map((w, i) => ({ id: w.id || `wt-${i + 1}`, studentId: w.studentId || primaryId, ...w })),
    habits: Array.isArray(src.habits) ? src.habits : [],
    videoLibrary: src.videoLibrary || []
  };

  // Plantillas: ahora guardan su estructura de días. Las viejas toman la del primer mesociclo.
  const baseDays = out.mesocycles[0]?.days || [];
  out.routineTemplates = (src.routineTemplates || []).map(t => {
    if (Array.isArray(t.days) && t.days.length) return t;
    const n = t.daysCount || baseDays.length;
    return { ...t, days: cloneDays(baseDays.slice(0, n), t.id) };
  });

  // Hábitos v1 (un solo objeto) -> un documento por alumno.
  if (!out.habits.length && src.habitsData) {
    const h = src.habitsData;
    const sid = h.studentId || primaryId;
    if (sid) {
      const doc = emptyHabits(sid);
      doc.waterTarget = h.waterTarget ?? doc.waterTarget;
      doc.proteinTarget = h.proteinTarget ?? doc.proteinTarget;
      doc.stepsTarget = h.stepsTarget ?? doc.stepsTarget;
      doc.sleepTarget = h.sleepTarget ?? doc.sleepTarget;
      if (Array.isArray(h.checklist) && h.checklist.length) {
        doc.checklistItems = h.checklist.map(c => ({ id: c.id, label: c.label }));
      }
      doc.today = {
        date: todayISO(),
        water: h.waterLiters ?? 0,
        protein: h.proteinGrams ?? 0,
        steps: h.dailySteps ?? 0,
        sleep: h.sleepHours ?? 0,
        done: (h.checklist || []).filter(c => c.done).map(c => c.id)
      };
      // Historial de cumplimiento de los 6 días anteriores, a partir del % semanal guardado.
      const pct = h.weeklyCompliance ?? 0;
      doc.history = Array.from({ length: 6 }, (_, i) => ({ date: addDaysISO(todayISO(), -(i + 1)), compliance: pct }));
      doc.meals = (h.mealsPhotos || []).map(m => ({ ...m, date: todayISO(), photoUrl: m.photoUrl || null }));
      out.habits = [doc];
    }
  }

  // La demo arranca con historial de entrenamientos para que racha y asistencia tengan datos reales.
  if ((seedDemo || (isV1 && src.gamification)) && !out.workoutLogs.length && primaryId) {
    out.workoutLogs = demoWorkoutLogs(primaryId, out.mesocycles.find(m => m.studentId === primaryId));
  }

  return out;
}

// Vista de los datos de UN alumno con la misma forma que usan las pantallas.
export function scopeToStudent(state, studentId) {
  const byStudent = (arr) => (arr || []).filter(x => x.studentId === studentId);
  return {
    mesocycles: byStudent(state.mesocycles),
    anthropometry: byStudent(state.anthropometry),
    strengthProgression: byStudent(state.strengthProgression),
    weightHistory: byStudent(state.weightHistory),
    workoutLogs: byStudent(state.workoutLogs),
    techniqueSubmissions: byStudent(state.techniqueSubmissions),
    payments: byStudent(state.payments),
    habits: (state.habits || []).find(h => h.studentId === studentId) || null
  };
}
