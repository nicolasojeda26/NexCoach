// Botón "Atrás" de Android: primero cierra el modal/menú que esté abierto, después vuelve
// al inicio y recién ahí sale de la app. Funciona en el APK y en la app instalada desde Chrome.
import { isNative, isStandalonePWA } from './native';

const stack = []; // handlers de cierre, el último es el de arriba
let rootHandler = null; // ej. "volver al Dashboard"; devuelve true si hizo algo

export function pushBackHandler(fn) {
  const entry = { fn };
  stack.push(entry);
  return () => {
    const i = stack.indexOf(entry);
    if (i !== -1) stack.splice(i, 1);
  };
}

export function setRootBackHandler(fn) {
  rootHandler = fn;
  return () => { if (rootHandler === fn) rootHandler = null; };
}

// Devuelve true si el "atrás" se consumió dentro de la app.
export function handleBack() {
  const top = stack[stack.length - 1];
  if (top) { top.fn(); return true; }
  if (rootHandler && rootHandler()) return true;
  return false;
}

export async function initBackButton() {
  if (isNative()) {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', () => {
      if (!handleBack()) App.minimizeApp();
    });
    return;
  }
  // App instalada desde Chrome: se usa el historial para atrapar el gesto/botón atrás.
  if (!isStandalonePWA()) return;
  const GUARD = { nexcoachGuard: true };
  history.replaceState({ nexcoachBase: true }, '');
  history.pushState(GUARD, '');
  window.addEventListener('popstate', () => {
    if (handleBack()) history.pushState(GUARD, '');
    else history.back(); // nada más que cerrar: sale de la app
  });
}
