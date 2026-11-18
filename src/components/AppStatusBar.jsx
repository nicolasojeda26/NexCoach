import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { isNative } from '../platform/native';

// Avisos de la app instalada: "sin conexión" y "hay una versión nueva".
export default function AppStatusBar() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // Service worker (solo web/PWA; el APK trae los archivos adentro).
  useEffect(() => {
    if (isNative() || !('serviceWorker' in navigator) || import.meta.env.DEV) return undefined;
    let cancelled = false;
    let interval = null;
    import('virtual:pwa-register').then(({ registerSW }) => {
      if (cancelled) return;
      const update = registerSW({
        onNeedRefresh() { setNeedRefresh(true); },
        onRegisteredSW(_url, reg) {
          // Busca actualizaciones cada hora mientras la app está abierta.
          if (reg) interval = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
        }
      });
      setUpdateSW(() => update);
    }).catch(() => {});
    return () => { cancelled = true; if (interval) clearInterval(interval); };
  }, []);

  if (online && !needRefresh) return null;

  return (
    <div className="sticky top-0 z-40" role="status" aria-live="polite">
      {!online && (
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-[11px] font-semibold">
          <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sin conexión: podés seguir usando la app y los cambios se sincronizan al volver la señal.</span>
        </div>
      )}
      {needRefresh && (
        <div className="flex items-center justify-center gap-3 px-3 py-1.5 bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-200 text-[11px] font-semibold">
          <span>Hay una versión nueva de NexCoach.</span>
          <button
            onClick={() => updateSW?.(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px]"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />Actualizar
          </button>
        </div>
      )}
    </div>
  );
}
