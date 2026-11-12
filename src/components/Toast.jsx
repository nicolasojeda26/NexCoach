import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

// Aviso breve abajo de la pantalla (reemplaza los alert() del navegador).
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onClose, toast.kind === 'error' ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  const isError = toast.kind === 'error';
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[9rem] md:bottom-8 z-[60] w-[min(92vw,26rem)]" role={isError ? 'alert' : 'status'} aria-live="polite">
      <div className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold animate-fadeIn ${
        isError ? 'bg-rose-950 border-rose-500/50 text-rose-100' : 'bg-slate-900 border-emerald-500/40 text-emerald-100'
      }`}>
        {isError ? <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
        <span className="flex-1">{toast.message}</span>
        <button onClick={onClose} aria-label="Cerrar aviso" className="text-slate-400 hover:text-white"><X className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}
