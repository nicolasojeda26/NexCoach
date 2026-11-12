// Modo demo / sin nube: el estado completo se guarda en el navegador.
import { INITIAL_DATA } from './initialData';
import { migrateState } from '../domain/model';

const STORAGE_KEY = 'nexcoach_app_state_v1';

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = migrateState(INITIAL_DATA, { seedDemo: true });
      saveAppState(initial);
      return initial;
    }
    return migrateState(JSON.parse(raw));
  } catch (e) {
    console.error("Error loading app state from storage:", e);
    return migrateState(INITIAL_DATA, { seedDemo: true });
  }
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("Error saving app state to storage:", e);
    return false;
  }
}

export function resetAppState() {
  const initial = migrateState(INITIAL_DATA, { seedDemo: true });
  saveAppState(initial);
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('nexcoach_workout_'))
      .forEach(k => localStorage.removeItem(k));
  } catch (e) { /* sin acceso a storage */ }
  return initial;
}
