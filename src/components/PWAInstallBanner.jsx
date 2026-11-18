import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { isNative, isStandalonePWA } from '../platform/native';

const DISMISS_KEY = 'nexcoach_pwa_banner_dismissed_at';
const DISMISS_DAYS = 14;

// Botón "Instalar" real: en Android/Chrome abre el diálogo de instalación del sistema.
// En iPhone (no tiene ese diálogo) muestra cómo agregarla a la pantalla de inicio.
export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
      return Date.now() - at < DISMISS_DAYS * 864e5;
    } catch (e) { return false; }
  });
  const isIOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    const onInstalled = () => { setDeferredPrompt(null); setDismissed(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) { /* noop */ }
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
      setDeferredPrompt(null);
      if (outcome === 'accepted') setDismissed(true);
      return;
    }
    if (isIOS) setShowIOSHelp(true);
  };

  // Solo aparece cuando el navegador permite instalar (o en iPhone), nunca dentro de la app ya instalada.
  if (isNative() || isStandalonePWA() || dismissed || (!deferredPrompt && !isIOS)) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-500/20 px-3 py-2 text-xs shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
            <Smartphone className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
          <span className="text-[11px] text-slate-300 truncate">
            <strong className="text-white font-bold">Instalá NexCoach</strong> en tu celular: se abre como una app y funciona sin señal.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={install}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] active:scale-95 transition-all shadow-md shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Instalar</span>
          </button>
          <button onClick={dismiss} aria-label="Cerrar aviso de instalación" className="p-1.5 text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {showIOSHelp && (
        <p className="mt-2 text-[11px] text-slate-300">
          En iPhone: tocá <strong className="text-white">Compartir</strong> (el cuadrado con la flecha) y elegí
          <strong className="text-white"> "Agregar a pantalla de inicio"</strong>.
        </p>
      )}
    </div>
  );
}
