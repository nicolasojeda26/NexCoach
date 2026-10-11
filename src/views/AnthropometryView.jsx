import React, { useState } from 'react';
import {
  Ruler,
  TrendingDown,
  TrendingUp,
  Scale,
  Plus,
  Sparkles,
  BarChart3,
  LineChart,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function AnthropometryView({ appState, onAddMeasurement }) {
  const [selectedMetric, setSelectedMetric] = useState('gluteos');
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const metricsInfo = {
    gluteos: { label: 'Glúteos', color: '#10f59b', gradient: 'from-[#10f59b] to-[#00e5ff]', unit: 'cm' },
    muslos: { label: 'Muslos', color: '#00e5ff', gradient: 'from-[#00e5ff] to-[#3b82f6]', unit: 'cm' },
    abdomen: { label: 'Abdomen Bajo', color: '#f59e0b', gradient: 'from-amber-400 to-orange-500', unit: 'cm' },
    hombros: { label: 'Hombros', color: '#a855f7', gradient: 'from-purple-400 to-pink-500', unit: 'cm' },
    pecho: { label: 'Pecho', color: '#f43f5e', gradient: 'from-rose-500 to-red-400', unit: 'cm' },
    gemelos: { label: 'Gemelos', color: '#6366f1', gradient: 'from-indigo-500 to-cyan-400', unit: 'cm' },
    biceps: { label: 'Bíceps', color: '#14b8a6', gradient: 'from-teal-400 to-emerald-400', unit: 'cm' }
  };

  const anthropometry = appState.anthropometry;
  const firstMeso = anthropometry[0];
  const lastMeso = anthropometry[anthropometry.length - 1];

  // Form state
  const [newMesoName, setNewMesoName] = useState(`Mesociclo ${anthropometry.length + 1}`);
  const [formData, setFormData] = useState({
    gemelos: 34,
    muslos: 53,
    gluteos: 97,
    abdomen: 78,
    hombros: 101,
    biceps: 28.5,
    pecho: 91
  });

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onAddMeasurement({
      mesociclo: newMesoName,
      gemelos: Number(formData.gemelos),
      muslos: Number(formData.muslos),
      gluteos: Number(formData.gluteos),
      abdomen: Number(formData.abdomen),
      hombros: Number(formData.hombros),
      biceps: Number(formData.biceps),
      pecho: Number(formData.pecho)
    });
    setIsModalOpen(false);
  };

  const getDelta = (metric) => {
    if (!firstMeso || !lastMeso) return 0;
    return (lastMeso[metric] - firstMeso[metric]).toFixed(1);
  };

  // SVG Area Chart calculations
  const values = anthropometry.map(m => m[selectedMetric] || 0);
  const minVal = Math.min(...values) - 2;
  const maxVal = Math.max(...values) + 2;
  const range = maxVal - minVal || 1;

  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / (values.length - 1 || 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((val - minVal) / range) * (svgHeight - paddingY * 2);
    return { x, y, val, mesociclo: anthropometry[idx].mesociclo };
  });

  // Generate smooth SVG curve path using cubic bezier
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

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-volt/20 bg-gradient-to-br from-obsidian-card via-obsidian to-obsidian-surface shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold">
              <Ruler className="w-3.5 h-3.5" />
              <span>BIO-TRACKING CORPORAL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Antropometría & Progresión de Perímetros
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Registro longitudinal de centímetros (cm) a lo largo de los mesociclos para medir composición corporal e hipertrofia selectiva.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-volt flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-volt/20 hover:scale-[1.02] transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>NUEVO MESOCICLO</span>
          </button>
        </div>
      </div>

      {/* KPI Delta Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { key: 'gluteos', title: 'Glúteos', goal: 'Aumento' },
          { key: 'muslos', title: 'Muslos', goal: 'Aumento' },
          { key: 'abdomen', title: 'Abdomen Bajo', goal: 'Reducción' },
          { key: 'hombros', title: 'Hombros', goal: 'Amplitud' }
        ].map(item => {
          const delta = Number(getDelta(item.key));
          const isFavorable = item.key === 'abdomen' ? delta <= 0 : delta >= 0;
          return (
            <div
              key={item.key}
              onClick={() => setSelectedMetric(item.key)}
              className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border ${
                selectedMetric === item.key
                  ? 'bg-obsidian-surface border-volt/50 shadow-lg shadow-volt/10 scale-[1.02]'
                  : 'bg-obsidian-card/80 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {item.goal}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-black text-white">{lastMeso[item.key]}</span>
                <span className="text-xs font-bold text-slate-400">cm</span>
                <span className={`text-xs font-black flex items-center gap-0.5 ml-auto ${
                  isFavorable ? 'text-volt' : 'text-amber-400'
                }`}>
                  {delta > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {delta > 0 ? `+${delta}` : delta} cm
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Inicio: {firstMeso[item.key]} cm</span>
                <span className="text-volt/70">Meso 1 → 6</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart Card */}
      <div className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl backdrop-blur-sm">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-volt/10 text-volt border border-volt/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Evolución de {metricsInfo[selectedMetric].label}
              </h2>
              <p className="text-xs text-slate-400">
                Variación neta: <span className="font-bold text-volt">{getDelta(selectedMetric) > 0 ? `+${getDelta(selectedMetric)}` : getDelta(selectedMetric)} cm</span> desde el Mesociclo 1
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Chart type toggle */}
            <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  chartType === 'area' ? 'bg-volt text-obsidian shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Curva suave"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Curva</span>
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  chartType === 'bar' ? 'bg-volt text-obsidian shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Barras"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Barras</span>
              </button>
            </div>

            {/* Metric Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {Object.keys(metricsInfo).map(key => (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedMetric === key
                      ? 'bg-volt text-obsidian shadow-lg shadow-volt/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {metricsInfo[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Chart Area */}
        <div className="relative pt-2">
          {chartType === 'area' ? (
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px]">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-64 overflow-visible">
                  <defs>
                    <linearGradient id="cyberVoltAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10f59b" stopOpacity="0.35" />
                      <stop offset="60%" stopColor="#00e5ff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#04070e" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="cyberVoltStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10f59b" />
                      <stop offset="50%" stopColor="#00e5ff" />
                      <stop offset="100%" stopColor="#10f59b" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.33, 0.66, 1].map((pct, idx) => {
                    const y = paddingY + pct * (svgHeight - paddingY * 2);
                    const labelVal = (maxVal - pct * range).toFixed(0);
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
                          {labelVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Area fill */}
                  <path d={areaPath} fill="url(#cyberVoltAreaGrad)" />

                  {/* Line curve with glow */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="url(#cyberVoltStrokeGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#neonGlow)"
                  />

                  {/* Data Points */}
                  {points.map((pt, idx) => {
                    const isLatest = idx === points.length - 1;
                    const isHovered = hoveredPoint === idx;
                    return (
                      <g
                        key={idx}
                        className="cursor-pointer transition-transform"
                        onMouseEnter={() => setHoveredPoint(idx)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        {/* Outer pulse circle for latest */}
                        {isLatest && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="12"
                            fill="#10f59b"
                            fillOpacity="0.2"
                            className="animate-ping"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 7 : isLatest ? 6 : 4.5}
                          fill={isLatest ? '#10f59b' : '#00e5ff'}
                          stroke="#04070e"
                          strokeWidth="2.5"
                          className="transition-all duration-200"
                        />
                        {/* Value text */}
                        <text
                          x={pt.x}
                          y={pt.y - 12}
                          fill={isLatest ? '#10f59b' : '#e2e8f0'}
                          fontSize={isHovered ? '13' : '11'}
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {pt.val} cm
                        </text>
                        {/* Mesocycle label */}
                        <text
                          x={pt.x}
                          y={svgHeight - 10}
                          fill="#94a3b8"
                          fontSize="10"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          Meso {idx + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          ) : (
            /* Bar Chart alternative */
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-60 pt-6">
              {anthropometry.map((m, idx) => {
                const val = m[selectedMetric] || 0;
                const heightPct = Math.round((val / (maxVal * 1.05)) * 100);
                const isLatest = idx === anthropometry.length - 1;

                return (
                  <div key={m.mesociclo} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className={`text-[11px] sm:text-xs font-mono font-bold transition-transform group-hover:scale-110 ${
                      isLatest ? 'text-volt font-black' : 'text-slate-300'
                    }`}>
                      {val} cm
                    </span>
                    <div className="w-full max-w-[48px] bg-slate-950 rounded-t-xl overflow-hidden h-full flex items-end border border-slate-800">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isLatest
                            ? 'bg-gradient-to-t from-emerald-600 via-volt to-cyan-400 shadow-lg shadow-volt/20'
                            : 'bg-slate-700 group-hover:bg-slate-600'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold truncate max-w-full text-center">
                      Meso {idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-volt" />
            <h3 className="text-sm font-black text-white">Tabla Histórica Completa por Mesociclo</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{anthropometry.length} mesociclos computados</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-obsidian-surface border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Mesociclo</th>
                <th className="py-3.5 px-4">Gemelos</th>
                <th className="py-3.5 px-4">Muslos</th>
                <th className="py-3.5 px-4 text-volt">Glúteos</th>
                <th className="py-3.5 px-4">Abdomen</th>
                <th className="py-3.5 px-4">Hombros</th>
                <th className="py-3.5 px-4">Bíceps</th>
                <th className="py-3.5 px-4">Pecho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {anthropometry.map((row, idx) => {
                const isLatest = idx === anthropometry.length - 1;
                return (
                  <tr
                    key={row.mesociclo}
                    className={`transition-colors ${
                      isLatest ? 'bg-volt/5 hover:bg-volt/10' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-volt">{row.mesociclo}</span>
                      {isLatest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-volt text-obsidian font-black">
                          ACTUAL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{row.gemelos} cm</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.muslos} cm</td>
                    <td className="py-3.5 px-4 font-black text-volt">{row.gluteos} cm</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.abdomen} cm</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.hombros} cm</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.biceps} cm</td>
                    <td className="py-3.5 px-4 text-slate-300">{row.pecho} cm</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Nuevo Mesociclo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleFormSubmit}
            className="bg-obsidian-card border border-volt/30 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-volt/10 text-volt">
                  <Ruler className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">Registrar Nuevo Mesociclo</h3>
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
                <label className="block text-slate-300 font-bold mb-1.5">Nombre del Mesociclo:</label>
                <input
                  type="text"
                  value={newMesoName}
                  onChange={(e) => setNewMesoName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-obsidian-surface border border-slate-700 text-white font-mono focus:outline-none focus:border-volt"
                  required
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(metricsInfo).map(key => (
                  <div key={key}>
                    <label className="block text-slate-300 font-semibold mb-1 capitalize">
                      {metricsInfo[key].label} (cm):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
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
                Guardar Mediciones
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
