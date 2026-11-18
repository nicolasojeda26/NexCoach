// Funciones que se comportan distinto en el APK de Android (Capacitor) y en el navegador / PWA.
import { Capacitor } from '@capacitor/core';

export const isNative = () => Capacitor.isNativePlatform();
export const platform = () => Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

export const isStandalonePWA = () => {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  } catch (e) { return false; }
};

// ---------------------------------------------------------------- Vibración
export async function vibrate(pattern = 'light') {
  try {
    if (isNative()) {
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
      if (pattern === 'success') await Haptics.notification({ type: NotificationType.Success });
      else if (pattern === 'warning') await Haptics.notification({ type: NotificationType.Warning });
      else await Haptics.impact({ style: pattern === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Light });
      return;
    }
    if (navigator.vibrate) {
      const map = { light: 15, heavy: 40, success: [80, 60, 80], warning: [200, 100, 200] };
      navigator.vibrate(map[pattern] ?? pattern);
    }
  } catch (e) { /* sin vibración */ }
}

// ---------------------------------------------------------------- Pantalla encendida
// Durante el entrenamiento la pantalla no se apaga (en el APK y en Chrome).
let wakeLock = null;
let wantAwake = false;

async function requestWebWakeLock() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener?.('release', () => { wakeLock = null; });
    }
  } catch (e) { wakeLock = null; }
}

if (typeof document !== 'undefined') {
  // El navegador suelta el bloqueo al minimizar: se vuelve a pedir al volver.
  document.addEventListener('visibilitychange', () => {
    if (wantAwake && !isNative() && document.visibilityState === 'visible' && !wakeLock) requestWebWakeLock();
  });
}

export async function keepScreenOn(on) {
  wantAwake = on;
  try {
    if (isNative()) {
      const { KeepAwake } = await import('@capacitor-community/keep-awake');
      if (on) await KeepAwake.keepAwake(); else await KeepAwake.allowSleep();
      return;
    }
    if (on) await requestWebWakeLock();
    else if (wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) { /* no soportado */ }
}

// ---------------------------------------------------------------- Links externos
// WhatsApp, Mercado Pago, mailto y tel: en el APK se abren en la app correspondiente.
export function openExternal(url) {
  if (!url) return;
  if (isNative()) {
    // WhatsApp, Mercado Pago, mail y teléfono: Android abre la app correspondiente.
    if (!/^https?:/i.test(url) || /wa\.me|whatsapp\.com|mercadopago|mpago\.la/i.test(url)) {
      launchIntent(url);
      return;
    }
    import('@capacitor/browser').then(({ Browser }) => Browser.open({ url, toolbarColor: '#04070e' }));
    return;
  }
  nativeWindowOpen(url, '_blank', 'noopener');
}

// En el APK, navegar a otro dominio hace que Capacitor abra la app/navegador del sistema.
function launchIntent(url) {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  a.dataset.internal = '1'; // que no lo vuelva a interceptar patchExternalLinks
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const nativeWindowOpen = typeof window !== 'undefined' ? window.open.bind(window) : () => null;

// En el APK, window.open y los links target="_blank" no hacen nada por defecto: se redirigen.
export function patchExternalLinks() {
  if (!isNative()) return;
  window.open = (url) => { openExternal(String(url)); return null; };
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    const external = a.target === '_blank' || (/^(mailto:|tel:|https?:\/\/)/i.test(href) && !href.startsWith(window.location.origin));
    if (!external || a.dataset.internal) return;
    e.preventDefault();
    openExternal(a.href);
  }, true);
}
