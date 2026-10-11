import React, { useState } from 'react';
import {
  TrendingUp,
  Dumbbell,
  Calculator,
  Plus,
  Flame,
  Award,
  Layers,
  ArrowUpRight,
  Zap,
  Target,
  Sparkles,
  BarChart3,
  LineChart
} from 'lucide-react';

export default function StrengthProgressView({ appState, onAddStrengthLog }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExerciseFilter, setSelectedExerciseFilter] = useState('totalKilos');

  // 1RM calculator state
  const [calcWeight, setCalcWeight] = useState(55);
  const [calcReps, setCalcReps] = useState(6);

  // Epley formula: 1RM = Weight * (1 + Reps / 30)
  const estimated1RM = Math.round(calcWeight * (1 + calcReps / 30));

  const strengthLogs = appState.strengthProgression;
  const firstLog = strengthLogs[0];
  const latestLog = strengthLogs[strengthLogs.length - 1];

  const totalGain = latestLog.totalKilos - firstLog.totalKilos;
  const percentGain = Math.round((totalGain / firstLog.totalKilos) * 100);

  // Form state
  const [newMonthName, setNewMonthName] = useState(`Mes ${strengthLogs.length + 1}`);
  const [formStrength, setFormStrength] = useState({
    pressPlano: 44,
    remoBarra: 40,
    sentadillaProfunda: 70,
    pesoMuerto: 55,
    despegueHex: 45,
    sentadillaMedia: 82
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const total = Number(formStrength.pressPlano) +
                  Number(formStrength.remoBarra) +
                  Number(formStrength.sentadillaProfunda) +
                  Number(formStrength.pesoMuerto) +
                  Number(formStrength.despegueHex) +
                  Number(formStrength.sentadillaMedia);

    onAddStrengthLog({
      mes: newMonthName,
      pressPlano: Number(formStrength.pressPlano),
      remoBarra: Number(formStrength.remoBarra),
      sentadillaProfunda: Number(formStrength.sentadillaProfunda),
      pesoMuerto: Number(formStrength.pesoMuerto),
      despegueHex: Number(formStrength.despegueHex),
      sentadillaMedia: Number(formStrength.sentadillaMedia),
      totalKilos: total
    });
    setIsModalOpen(false);
  };

  const exerciseOptions = [
    { key: 'totalKilos', label: 'Total Acumulado', color: '#10f59b' },
    { key: 'sentadillaProfunda', label: 'Sentadilla Profunda', color: '#00e5ff' },
    { key: 'sentadillaMedia', label: 'Sentadilla Media', color: '#38bdf8' },
    { key: 'pesoMuerto', label: 'Peso Muerto', color: '#a855f7' },
    { key: 'pressPlano', label: 'Press Banco Plano', color: '#f43f5e' },
    { key: 'remoBarra', label: 'Remo con Barra', color: '#f59e0b' },
    { key: 'despegueHex', label: 'Despegue Hex.', color: '#14b8a6' }
  ];

  const exercises = [
    { key: 'sentadillaProfunda', label: 'Sentadilla Profunda', start: firstLog.sentadillaProfunda, current: latestLog.sentadillaProfunda },
    { key: 'sentadillaMedia', label: 'Sentadilla Media', start: firstLog.sentadillaMedia, current: latestLog.sentadillaMedia },
    { key: 'pesoMuerto', label: 'Peso Muerto', start: firstLog.pesoMuerto, current: latestLog.pesoMuerto },
    { key: 'pressPlano', label: 'Press Banco Plano', start: firstLog.pressPlano, current: latestLog.pressPlano },
    { key: 'remoBarra', label: 'Remo con Barra', start: firstLog.remoBarra, current: latestLog.remoBarra },
    { key: 'despegueHex', label: 'Despegue Hexagonal', start: firstLog.despegueHex, current: latestLog.despegueHex }
  ];

  // SVG Chart calculation
  const values = strengthLogs.map(log => log[selectedExerciseFilter] || 0);
  const minVal = Math.min(...values) * 0.92;
  const maxVal = Math.max(...values) * 1.05;
  const range = maxVal - minVal || 1;

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1 || 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((val - minVal) / range) * (svgHeight - paddingY * 2);
    return { x, y, val, mes: strengthLogs[idx].mes };
  });

  const createSmoothPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  const activeColor = exerciseOptions.find(o => o.key === selectedExerciseFilter)?.color || '#10f59b';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-volt/20 bg-gradient-to-br from-obsidian-card via-obsidian to-obsidian-surface shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>SOBRECARGA PROGRESIVA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Fuerza, Marcas & Kilos Movidos
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Monitoreo objetivo de ganancias de fuerza máxima y tensión mecánica acumulada a lo largo de las fases de entrenamiento.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-volt flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-volt/20 hover:scale-[1.02] transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>NUEVO TEST DE FUERZA</span>
          </button>
        </div>
      </div>

      {/* Main Stats Banner & 1RM Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Stats Box */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-obsidian-card/90 border border-slate-800/80 shadow-2xl flex flex-col justify-between gap-6 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-volt uppercase tracking-wider font-mono">
                SOBRECARGA PROGRESIVA TOTAL (TODOS LOS LEVANTAMIENTOS)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-volt/10 text-volt border border-volt/30">
                +12 MESOCICLOS
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                {latestLog.totalKilos}
              </span>
              <span className="text-xl font-bold text-slate-400">kg</span>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-volt/10 text-volt border border-volt/20 text-xs font-bold font-mono">
                <ArrowUpRight className="w-4 h-4" />
                <span>+{totalGain} kg (+{percentGain}%)</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3 max-w-md">
              Evolución desde <strong className="text-white">{firstLog.totalKilos} kg</strong> iniciales en el Mes 1. Gran incremento en miembros inferiores y tracciones del Prof. Larroca.
            </p>
          </div>

          {/* Quick Progress Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-obsidian-surface border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">SENTADILLA TOTAL</span>
              <span className="text-lg font-black text-cyan-400 font-mono">
                {latestLog.sentadillaProfunda + latestLog.sentadillaMedia} kg
              </span>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-surface border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">EMPUJE + TRACCIÓN</span>
              <span className="text-lg font-black text-volt font-mono">
                {latestLog.pressPlano + latestLog.remoBarra} kg
              </span>
            </div>
            <div className="p-3 rounded-xl bg-obsidian-surface border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-mono">PESO MUERTO & HEX</span>
              <span className="text-lg font-black text-purple-400 font-mono">
                {latestLog.pesoMuerto + latestLog.despegueHex} kg
              </span>
            </div>
          </div>
        </div>

        {/* 1RM Interactive Calculator */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-obsidian-card to-obsidian-surface border border-cyan-500/30 shadow-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">Calculadora de 1RM (Epley)</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">INTERACTIVA</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <span className="text-slate-400 text-[10px] font-mono">CARGA LEVANTADA (KG):</span>
                <input
                  type="number"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full mt-1 p-2 rounded-xl bg-obsidian border border-slate-700 text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-mono">REPETICIONES (REPS):</span>
                <input
                  type="number"
                  value={calcReps}
                  onChange={(e) => setCalcReps(Number(e.target.value))}
                  className="w-full mt-1 p-2 rounded-xl bg-obsidian border border-slate-700 text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Result callout */}
            <div className="mt-4 p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-semibold">1RM ESTIMADO:</span>
              <span className="text-2xl font-black text-cyan-400 font-mono tracking-tight">
                {estimated1RM} kg
              </span>
            </div>
          </div>

          {/* Zones Breakdown */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono">
            <span className="text-[10px] text-slate-500 font-bold block mb-1">ZONAS DE INTENSIDAD RECOMENDADAS:</span>
            <div className="flex justify-between text-slate-300">
              <span className="text-rose-400">90% (Fuerza Pura 3-4 reps):</span>
              <strong className="text-white">{Math.round(estimated1RM * 0.9)} kg</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-volt">80% (Hipertrofia 6-8 reps):</span>
              <strong className="text-white">{Math.round(estimated1RM * 0.8)} kg</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-cyan-400">70% (Volumen 10-12 reps):</span>
              <strong className="text-white">{Math.round(estimated1RM * 0.7)} kg</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Progression SVG Chart */}
      <div className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-volt/10 text-volt border border-volt/20">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Curva de Rendimiento: {exerciseOptions.find(o => o.key === selectedExerciseFilter)?.label}
              </h2>
              <p className="text-xs text-slate-400">
                Visualización de incrementos de tonelaje mes a mes.
              </p>
            </div>
          </div>

          {/* Exercise switcher pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {exerciseOptions.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSelectedExerciseFilter(opt.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedExerciseFilter === opt.key
                    ? 'bg-volt text-obsidian shadow-lg shadow-volt/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Curve */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
              <defs>
                <linearGradient id="strengthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#04070e" stopOpacity="0" />
                </linearGradient>
                <filter id="strengthGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid lines */}
              {[0, 0.33, 0.66, 1].map((pct, idx) => {
                const y = paddingY + pct * (svgHeight - paddingY * 2);
                const labelVal = Math.round(maxVal - pct * range);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="10"
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {labelVal} kg
                    </text>
                  </g>
                );
              })}

              {/* Area */}
              <path d={areaPath} fill="url(#strengthAreaGrad)" />

              {/* Line */}
              <path
                d={linePath}
                fill="none"
                stroke={activeColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#strengthGlow)"
              />

              {/* Points */}
              {points.map((pt, idx) => {
                const isLatest = idx === points.length - 1;
                return (
                  <g key={idx} className="cursor-pointer">
                    {isLatest && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill={activeColor}
                        fillOpacity="0.2"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isLatest ? 6 : 4.5}
                      fill={activeColor}
                      stroke="#04070e"
                      strokeWidth="2.5"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 12}
                      fill="#ffffff"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {pt.val} kg
                    </text>
                    <text
                      x={pt.x}
                      y={svgHeight - 10}
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      Mes {idx + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map(ex => {
          const diff = (ex.current - ex.start).toFixed(1);
          return (
            <div
              key={ex.key}
              onClick={() => setSelectedExerciseFilter(ex.key)}
              className={`p-5 rounded-2xl transition-all duration-300 cursor-pointer border flex flex-col justify-between gap-4 ${
                selectedExerciseFilter === ex.key
                  ? 'bg-obsidian-surface border-volt/60 shadow-lg shadow-volt/10'
                  : 'bg-obsidian-card/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">{ex.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    BÁSICO
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-white font-mono">{ex.current} kg</span>
                  <span className="text-xs font-black text-volt flex items-center font-mono">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +{diff} kg
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Marca inicial (Mes 1):</span>
                  <span className="text-slate-300 font-semibold">{ex.start} kg</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Marca actual (Mes 6):</span>
                  <span className="text-volt font-black">{ex.current} kg</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monthly Strength Progression Table */}
      <div className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-volt" />
            <h3 className="text-sm font-black text-white">Historial de Kilos Movidos por Mes (1 a 12)</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{strengthLogs.length} meses registrados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-surface border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Mes</th>
                <th className="py-3.5 px-4">Press Plano</th>
                <th className="py-3.5 px-4">Remo Barra</th>
                <th className="py-3.5 px-4">Sentadilla Prof.</th>
                <th className="py-3.5 px-4">Peso Muerto</th>
                <th className="py-3.5 px-4">Despegue Hex.</th>
                <th className="py-3.5 px-4">Sentadilla Med.</th>
                <th className="py-3.5 px-4 text-volt">Kilos Movidos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {strengthLogs.map((log, idx) => {
                const isLatest = idx === strengthLogs.length - 1;
                return (
                  <tr
                    key={log.mes}
                    className={`transition-colors ${
                      isLatest ? 'bg-volt/5 hover:bg-volt/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-volt">{log.mes}</span>
                      {isLatest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-volt text-obsidian font-black">
                          ACTUAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{log.pressPlano} kg</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.remoBarra} kg</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.sentadillaProfunda} kg</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.pesoMuerto} kg</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.despegueHex} kg</td>
                    <td className="py-3.5 px-4 text-slate-300">{log.sentadillaMedia} kg</td>
                    <td className="py-3.5 px-4 font-black text-volt text-sm">{log.totalKilos} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Nuevo Test Mensual */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleFormSubmit}
            className="bg-obsidian-card border border-volt/30 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-volt/10 text-volt">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Registrar Test de Cargas Mensual</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Nombre del Período:</label>
                <input
                  type="text"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono focus:outline-none focus:border-volt"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.keys(formStrength).map(key => (
                  <div key={key}>
                    <label className="block text-slate-300 font-semibold mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}:
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formStrength[key]}
                      onChange={(e) => setFormStrength({ ...formStrength, [key]: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono focus:outline-none focus:border-volt"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-volt px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-volt/20 hover:scale-[1.02] transition-transform"
              >
                Guardar Cargas
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
