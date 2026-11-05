import { INITIAL_DATA } from './initialData';

const STORAGE_KEY = 'nexcoach_app_state_v1';

// Copia profunda para que los datos de demo originales nunca se muten.
const freshInitial = () => JSON.parse(JSON.stringify(INITIAL_DATA));

// Completa con valores por defecto las claves que falten en un estado guardado por
// una versión anterior de la app (evita pantallas rotas al agregar módulos nuevos).
function withDefaults(saved) {
  const base = freshInitial();
  if (!saved || typeof saved !== 'object') return base;
  const merged = { ...base, ...saved };
  merged.coach = { ...base.coach, ...(saved.coach || {}) };
  merged.habitsData = { ...base.habitsData, ...(saved.habitsData || {}) };
  merged.gamification = { ...base.gamification, ...(saved.gamification || {}) };
  if (!Array.isArray(merged.workoutLogs)) merged.workoutLogs = [];
  ['students', 'payments', 'mesocycles', 'videoLibrary', 'anthropometry', 'strengthProgression', 'plans']
    .forEach(k => { if (!Array.isArray(merged[k]) || merged[k].length === 0) merged[k] = base[k]; });
  return merged;
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = withDefaults(null);
      saveAppState(initial);
      return initial;
    }
    return withDefaults(JSON.parse(raw));
  } catch (e) {
    console.error("Error loading app state from storage:", e);
    return withDefaults(null);
  }
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Error saving app state to storage:", e);
  }
}

export function resetAppState() {
  const initial = withDefaults(null);
  saveAppState(initial);
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('nexcoach_workout_'))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* sin acceso a storage */ }
  return initial;
}
