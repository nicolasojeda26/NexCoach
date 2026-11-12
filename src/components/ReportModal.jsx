import React, { useState, useEffect } from 'react';
import Avatar from './Avatar';
import { useEscape } from '../hooks/useEscape';
import {
  X,
  Printer,
  Download,
  Dumbbell,
  Award,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Sparkles,
  HeartPulse,
  Ruler
} from 'lucide-react';

// Conclusión armada con los datos reales; el profe la puede editar antes de imprimir.
function buildConclusion(student, anthropometry, strengthLogs, progress) {
  if (!student) return '';
  const parts = [`${student.name.split(' ')[0]} registró ${progress.sessionsCount} sesiones, con ${progress.attendancePct}% de asistencia en las últimas 4 semanas.`];
  if (anthropometry.length > 1) {
    const a = anthropometry[0]; const b = anthropometry[anthropometry.length - 1];
    const d = (k) => Math.round((b[k] - a[k]) * 10) / 10;
    const fmt = (v) => `${v > 0 ? '+' : ''}${v} cm`;
    parts.push(`Respecto a ${a.mesociclo}: abdomen ${fmt(d('abdomen'))}, muslos ${fmt(d('muslos'))} y glúteos ${fmt(d('gluteos'))}.`);
  }
  if (strengthLogs.length > 1) {
    const a = strengthLogs[0].totalKilos; const b = strengthLogs[strengthLogs.length - 1].totalKilos;
    if (a > 0) parts.push(`El volumen en los levantamientos principales pasó de ${a} kg a ${b} kg (${Math.round(((b - a) / a) * 100)}%).`);
  }
  parts.push('Se recomienda continuar con el próximo mesociclo según los objetivos acordados.');
  return parts.join(' ');
}

const signed = (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}`;

export default function ReportModal({ isOpen, onClose, appState }) {
  const student = appState.activeStudent;
  const [conclusion, setConclusion] = useState('');
  useEffect(() => {
    if (isOpen) setConclusion(buildConclusion(student, appState.scoped.anthropometry, appState.scoped.strengthProgression, appState.progress));
  }, [isOpen, student?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEscape(isOpen, onClose);
  if (!isOpen) return null;
  if (!student) return null;

  const coach = appState.coach;
  const anthropometry = appState.scoped.anthropometry;
  const firstMeso = anthropometry[0];
  const lastMeso = anthropometry[anthropometry.length - 1];
  const strengthLogs = appState.scoped.strengthProgression;
  const firstLog = strengthLogs[0];
  const latestLog = strengthLogs[strengthLogs.length - 1];

  // Ganancias calculadas desde los registros (antes estaban escritas a mano y no
  // se actualizaban al cargar un mes nuevo de fuerza).
  const gain = (key) => {
    const a = Number(firstLog?.[key]) || 0;
    const b = Number(latestLog?.[key]) || 0;
    return { a, b, pct: a > 0 ? (((b - a) / a) * 100).toFixed(1) : '0.0' };
  };
  const squat = gain('sentadillaProfunda');
  const deadlift = gain('pesoMuerto');
  const bench = gain('pressPlano');
  const volume = gain('totalKilos');
  const volumePct = Math.round(Number(volume.pct));
  const periodLabel = `${firstLog?.mes || ''} – ${latestLog?.mes || ''}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="report-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Dialog container */}
      <div className="report-dialog bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Informe Mensual de Evolución Física</h3>
              <span className="text-[11px] text-slate-400">Listo para imprimir o exportar a PDF</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-900 text-slate-100 space-y-6 print:bg-white print:text-black print:p-8" id="printable-report">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 print:border-black/20 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
                <Dumbbell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white print:text-black tracking-tight">NexCoach</h1>
                <p className="text-xs text-emerald-400 print:text-emerald-700 font-bold uppercase tracking-wider">
                  Informe de Rendimiento & Biometría
                </p>
              </div>
            </div>

            <div className="sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
              <div><strong>Preparador Físico:</strong> Prof. {coach.name}</div>
              <div><strong>Período evaluado:</strong> {periodLabel} • {firstMeso?.mesociclo} a {lastMeso?.mesociclo}</div>
              <div><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar student={student} className="w-14 h-14 rounded-2xl ring-2 ring-emerald-500/30" />
                <div>
                  <h2 className="text-lg font-black text-white print:text-black">{student.name}</h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {student.age} años • {student.gender} • Altura: {student.height} cm • Peso Actual: <strong>{student.currentWeight} kg</strong>
                  </p>
                  <p className="text-[11px] text-emerald-400 print:text-emerald-700 font-semibold mt-0.5">
                    Objetivo: {student.notes || 'Acondicionamiento físico'} • IMC meta {student.targetIMC}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 print:bg-white print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block">IMC Actual</span>
                  <span className="text-sm font-black text-emerald-400 print:text-emerald-700">{student.currentIMC}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 print:bg-white print:border-slate-300">
                  <span className="text-[10px] text-slate-400 print:text-slate-500 block">Asistencia</span>
                  <span className="text-sm font-black text-white print:text-black">{appState.progress.attendancePct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Anthropometric Evolution (Mesociclos 1-6) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider">
              <Ruler className="w-4 h-4" />
              <span>1. Evolución de Perímetros Corporales (en centímetros)</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-slate-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 print:bg-slate-100 text-slate-400 print:text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Mesociclo</th>
                    <th className="py-2.5 px-3">Gemelos</th>
                    <th className="py-2.5 px-3">Muslos</th>
                    <th className="py-2.5 px-3">Glúteos</th>
                    <th className="py-2.5 px-3">Abdomen</th>
                    <th className="py-2.5 px-3">Hombros</th>
                    <th className="py-2.5 px-3">Bíceps</th>
                    <th className="py-2.5 px-3">Pecho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {anthropometry.map(row => (
                    <tr key={row.mesociclo} className="text-slate-300 print:text-slate-800">
                      <td className="py-2 px-3 font-bold text-white print:text-black">{row.mesociclo}</td>
                      <td className="py-2 px-3">{row.gemelos} cm</td>
                      <td className="py-2 px-3 font-semibold text-emerald-400 print:text-emerald-800">{row.muslos} cm</td>
                      <td className="py-2 px-3 font-black text-white print:text-black">{row.gluteos} cm</td>
                      <td className="py-2 px-3">{row.abdomen} cm</td>
                      <td className="py-2 px-3">{row.hombros} cm</td>
                      <td className="py-2 px-3">{row.biceps} cm</td>
                      <td className="py-2 px-3">{row.pecho} cm</td>
                    </tr>
                  ))}
                  {/* Delta row */}
                  {lastMeso && anthropometry.length > 1 && (
                  <tr className="bg-emerald-500/10 print:bg-emerald-50 font-black text-emerald-400 print:text-emerald-800">
                    <td className="py-2 px-3">VARIACIÓN (Δ)</td>
                    <td className="py-2 px-3">{signed(lastMeso.gemelos - firstMeso.gemelos)} cm</td>
                    <td className="py-2 px-3">{signed(lastMeso.muslos - firstMeso.muslos)} cm</td>
                    <td className="py-2 px-3">{signed(lastMeso.gluteos - firstMeso.gluteos)} cm</td>
                    <td className="py-2 px-3">{signed(lastMeso.abdomen - firstMeso.abdomen)} cm</td>
                    <td className="py-2 px-3">{signed(lastMeso.hombros - firstMeso.hombros)} cm</td>
                    <td className="py-2 px-3">{signed(lastMeso.biceps - firstMeso.biceps)} cm</td>
                    <td className="py-2 px-3">{signed(lastMeso.pecho - firstMeso.pecho)} cm</td>
                  </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Strength Progression & Kilos Movidos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>2. Sobrecarga Progresiva & RMs (Kilos Movidos: {volumePct >= 0 ? '+' : ''}{volumePct}%)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Sentadilla Profunda</span>
                <span className="text-base font-black text-white print:text-black">{squat.a} kg ➔ {squat.b} kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">{squat.pct}% de ganancia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Peso Muerto</span>
                <span className="text-base font-black text-white print:text-black">{deadlift.a} kg ➔ {deadlift.b} kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">{deadlift.pct}% de ganancia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Banco Plano</span>
                <span className="text-base font-black text-white print:text-black">{bench.a} kg ➔ {bench.b} kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">{bench.pct}% de ganancia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Volumen Total</span>
                <span className="text-base font-black text-emerald-400 print:text-emerald-700">{volume.a} kg ➔ {volume.b} kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">{volume.b - volume.a >= 0 ? '+' : ''}{Math.round((volume.b - volume.a) * 10) / 10} kg movidos</span>
              </div>
            </div>
          </div>

          {/* Section 3: Coach Evaluation & Signature */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-slate-50 print:border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider block">
              3. Dictamen y Conclusiones del Preparador Físico:
            </span>
            <label className="sr-only" htmlFor="report-conclusion">Conclusión del informe</label>
            <textarea id="report-conclusion" rows="4" value={conclusion} onChange={(e) => setConclusion(e.target.value)}
              className="print:hidden w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500" />
            <p className="hidden print:block text-xs text-slate-700 leading-relaxed">"{conclusion}"</p>
            <p className="print:hidden text-[10px] text-slate-500">Podés editar este texto antes de imprimir.</p>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 print:border-slate-300 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Firma Digital Registrada:</span>
                <strong className="text-emerald-400 print:text-emerald-800">Prof. {coach.name}</strong>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">{coach.role}</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 print:text-emerald-800 font-bold text-[10px] border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Informe verificado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
