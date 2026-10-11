import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  const handleInstallClick = () => {
    alert("Para instalar NexCoach en tu celular:\n\n• En iPhone (Safari): Toca el botón 'Compartir' (cuadrado con flecha) y selecciona 'Agregar a pantalla de inicio'.\n• En Android (Chrome): Toca los 3 puntos superiores y selecciona 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-b border-emerald-500/20 px-3 py-2 text-xs flex items-center justify-between gap-2 shadow-md">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
          <Smartphone className="w-3.5 h-3.5" />
        </span>
        <span className="text-[11px] text-slate-300 truncate">
          <strong className="text-white font-bold">Instala NexCoach</strong> en tu celular para acceder sin conexión y entrenar más cómodo.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] active:scale-95 transition-all shadow-md shadow-emerald-500/20"
        >
          <Download className="w-3 h-3" />
          <span>Instalar</span>
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 text-slate-500 hover:text-slate-300"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
