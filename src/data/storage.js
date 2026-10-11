import { INITIAL_DATA } from './initialData';

const STORAGE_KEY = 'nexcoach_app_state_v1';

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(INITIAL_DATA);
      return INITIAL_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error loading app state from storage:", e);
    return INITIAL_DATA;
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
  saveAppState(INITIAL_DATA);
  return INITIAL_DATA;
}
