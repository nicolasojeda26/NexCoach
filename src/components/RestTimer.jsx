import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Volume2, Plus, Minus, Bell } from 'lucide-react';

function playBeep(freq = 880, duration = 0.2) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context not allowed without interaction", e);
  }
}

export default function RestTimer() {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [initialDuration, setInitialDuration] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            // Play completion chime
            playBeep(880, 0.2);
            setTimeout(() => playBeep(1174, 0.4), 250);
            return 0;
          }
          if (prev === 4 || prev === 3 || prev === 2) {
            playBeep(659, 0.1);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, secondsLeft]);

  const handleStart = () => {
    if (secondsLeft === 0) setSecondsLeft(initialDuration);
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = (newSec = initialDuration) => {
    setIsRunning(false);
    setSecondsLeft(newSec);
    setInitialDuration(newSec);
  };

  const adjustSeconds = (delta) => {
    setSecondsLeft(prev => Math.max(5, prev + delta));
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const presets = [30, 60, 90, 120];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl border font-bold text-sm transition-all ${
            isRunning
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse'
              : 'bg-slate-900/95 text-emerald-400 border-slate-700 hover:border-emerald-500/50'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{formatTime(secondsLeft)}</span>
        </button>
      ) : (
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md w-72 text-slate-100 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Timer className="w-4 h-4" />
              <span>Cronómetro de Descanso</span>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              Minimizar
            </button>
          </div>

          {/* Time display */}
          <div className="flex items-center justify-center py-2 relative">
            <button
              onClick={() => adjustSeconds(-15)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="-15s"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className={`text-4xl font-extrabold font-mono tracking-tight mx-4 ${
              secondsLeft === 0 ? 'text-amber-400 animate-bounce' : isRunning ? 'text-emerald-400' : 'text-slate-200'
            }`}>
              {formatTime(secondsLeft)}
            </div>
            <button
              onClick={() => adjustSeconds(15)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              title="+15s"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                Pausar
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Iniciar
              </button>
            )}
            <button
              onClick={() => handleReset()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {presets.map(p => (
              <button
                key={p}
                onClick={() => handleReset(p)}
                className={`py-1 rounded-lg text-xs font-medium transition-colors ${
                  initialDuration === p
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}s
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
