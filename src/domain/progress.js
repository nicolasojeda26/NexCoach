// Racha, asistencia, récords, medallas y XP calculados a partir de los datos reales del alumno.
import { todayISO, addDaysISO, weekStartISO } from '../utils/helpers';

// Semanas consecutivas con al menos una sesión. La semana en curso cuenta si ya entrenó;
// si todavía no entrenó esta semana, la racha sigue viva desde la semana anterior.
export function streakWeeks(logs = [], today = todayISO()) {
  const weeks = new Set(logs.map(l => weekStartISO(l.date)));
  let cursor = weekStartISO(today);
  if (!weeks.has(cursor)) cursor = addDaysISO(cursor, -7);
  let count = 0;
  while (weeks.has(cursor)) {
    count += 1;
    cursor = addDaysISO(cursor, -7);
  }
  return count;
}

// % de asistencia de las últimas 4 semanas completas + la actual, según sesiones/semana del plan.
export function attendancePct(logs = [], sessionsPerWeek = 3, today = todayISO()) {
  const from = addDaysISO(today, -27);
  const days = new Set(logs.filter(l => l.date >= from && l.date <= today).map(l => l.date));
  const expected = Math.max(1, Math.round((sessionsPerWeek || 3) * 4));
  return Math.min(100, Math.round((days.size / expected) * 100));
}

export const STRENGTH_EXERCISES = [
  { key: 'sentadillaProfunda', label: 'Sentadilla Profunda' },
  { key: 'pesoMuerto', label: 'Peso Muerto' },
  { key: 'sentadillaMedia', label: 'Sentadilla Media' },
  { key: 'pressPlano', label: 'Press Banco Plano' },
  { key: 'remoBarra', label: 'Remo con Barra' },
  { key: 'despegueHex', label: 'Despegue Hexagonal' },
  { key: 'totalKilos', label: 'Kilos Movidos Totales' }
];

// Mejor marca de cada ejercicio vs. la primera registrada.
export function personalRecords(strengthLogs = []) {
  if (!strengthLogs.length) return [];
  const first = strengthLogs[0];
  return STRENGTH_EXERCISES.map(({ key, label }) => {
    let best = null;
    strengthLogs.forEach(l => {
      const v = Number(l[key]);
      if (!Number.isFinite(v)) return;
      if (!best || v > best.weight) best = { weight: v, date: l.mes };
    });
    if (!best) return null;
    const previous = Number(first[key]) || 0;
    return { exercise: label, weight: best.weight, previous, date: best.date, achieved: best.weight > previous };
  }).filter(Boolean);
}

const maxOf = (logs, key) => logs.reduce((m, l) => Math.max(m, Number(l[key]) || 0), 0);

// Definición de medallas: cada una con su condición sobre los datos.
export function computeBadges({ strengthLogs = [], workoutLogs = [], submissions = [], anthropometry = [], streak = 0, attendance = 0 }) {
  const excellent = submissions.filter(s => s.rating === 'Excelente').length;
  const firstDate = (arr) => arr.length ? arr[0].date : null;
  return [
    { id: 'badge-first', title: 'Primer Entrenamiento', desc: 'Completó su primera sesión en la app.', icon: 'Zap',
      unlocked: workoutLogs.length >= 1, date: firstDate(workoutLogs) },
    { id: 'badge-1', title: 'Reina de la Sentadilla', desc: 'Superó los 65 kg en Sentadilla Profunda.', icon: 'Crown',
      unlocked: maxOf(strengthLogs, 'sentadillaProfunda') >= 65, date: null },
    { id: 'badge-2', title: 'Club de los 300 Kilos', desc: 'Más de 300 kg de volumen total en levantamientos.', icon: 'Flame',
      unlocked: maxOf(strengthLogs, 'totalKilos') >= 300, date: null },
    { id: 'badge-streak', title: 'Constancia de Hierro', desc: '4 semanas seguidas entrenando.', icon: 'Flame',
      unlocked: streak >= 4, date: null },
    { id: 'badge-3', title: 'Disciplina Imparable', desc: '90% de asistencia en las últimas 4 semanas.', icon: 'Award',
      unlocked: attendance >= 90, date: null },
    { id: 'badge-4', title: 'Técnica Perfecta', desc: "5 videos de técnica calificados como 'Excelente'.", icon: 'Sparkles',
      unlocked: excellent >= 5, date: null, progress: `${Math.min(excellent, 5)}/5` },
    { id: 'badge-meso', title: 'Seis Mesociclos', desc: '6 controles de medidas registrados.', icon: 'Award',
      unlocked: anthropometry.length >= 6, date: null, progress: `${Math.min(anthropometry.length, 6)}/6` }
  ];
}

const LEVEL_TITLES = ['Atleta Inicial', 'Atleta en Progreso', 'Atleta Constante', 'Atleta Intermedio', 'Atleta Avanzado', 'Atleta de Élite'];

export function computeProgress({ studentPlan, scoped, today = todayISO() }) {
  const workoutLogs = [...(scoped.workoutLogs || [])].sort((a, b) => a.date.localeCompare(b.date));
  const strengthLogs = scoped.strengthProgression || [];
  const streak = streakWeeks(workoutLogs, today);
  const attendance = attendancePct(workoutLogs, studentPlan?.sessionsPerWeek, today);
  const prs = personalRecords(strengthLogs);
  const badges = computeBadges({
    strengthLogs, workoutLogs, submissions: scoped.techniqueSubmissions || [],
    anthropometry: scoped.anthropometry || [], streak, attendance
  });
  const unlocked = badges.filter(b => b.unlocked).length;
  const totalXP = workoutLogs.length * 50 + prs.filter(p => p.achieved).length * 100 + unlocked * 200;
  const level = Math.floor(totalXP / 500) + 1;
  return {
    streakWeeks: streak,
    attendancePct: attendance,
    sessionsCount: workoutLogs.length,
    personalRecords: prs,
    badges,
    totalXP,
    level,
    levelTitle: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, level - 1)],
    nextLevelXP: level * 500
  };
}
