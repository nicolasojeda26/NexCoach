import React, { useRef } from 'react';
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

export default function ReportModal({ isOpen, onClose, appState }) {
  if (!isOpen) return null;

  const student = appState.students[0]; // Agostina Baju
  const coach = appState.coach;
  const anthropometry = appState.anthropometry;
  const firstMeso = anthropometry[0];
  const lastMeso = anthropometry[anthropometry.length - 1];
  const strengthLogs = appState.strengthProgression;
  const firstLog = strengthLogs[0];
  const latestLog = strengthLogs[strengthLogs.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Dialog container */}
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
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
              <div><strong>Período evaluado:</strong> Febrero - Octubre 2026</div>
              <div><strong>Fecha de emisión:</strong> {new Date().toLocaleDateString('es-AR')}</div>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h2 className="text-lg font-black text-white print:text-black">{student.name}</h2>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {student.age} años • {student.gender} • Altura: {student.height} cm • Peso Actual: <strong>{student.currentWeight} kg</strong>
                  </p>
                  <p className="text-[11px] text-emerald-400 print:text-emerald-700 font-semibold mt-0.5">
                    Objetivo: Hipertrofia tren inferior, ganancia de fuerza e IMC meta de {student.targetIMC}
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
                  <span className="text-sm font-black text-white print:text-black">95%</span>
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
                  <tr className="bg-emerald-500/10 print:bg-emerald-50 font-black text-emerald-400 print:text-emerald-800">
                    <td className="py-2 px-3">VARIACIÓN (Δ)</td>
                    <td className="py-2 px-3">{(lastMeso.gemelos - firstMeso.gemelos).toFixed(1)} cm</td>
                    <td className="py-2 px-3">+{(lastMeso.muslos - firstMeso.muslos).toFixed(1)} cm</td>
                    <td className="py-2 px-3">{(lastMeso.gluteos - firstMeso.gluteos).toFixed(1)} cm</td>
                    <td className="py-2 px-3">{(lastMeso.abdomen - firstMeso.abdomen).toFixed(1)} cm</td>
                    <td className="py-2 px-3">{(lastMeso.hombros - firstMeso.hombros).toFixed(1)} cm</td>
                    <td className="py-2 px-3">{(lastMeso.biceps - firstMeso.biceps).toFixed(1)} cm</td>
                    <td className="py-2 px-3">{(lastMeso.pecho - firstMeso.pecho).toFixed(1)} cm</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Strength Progression & Kilos Movidos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>2. Sobrecarga Progresiva & RMs (Kilos Movidos: +48%)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Sentadilla Profunda</span>
                <span className="text-base font-black text-white print:text-black">55 kg ➔ 67.5 kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">+22.7% de ganancia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Peso Muerto</span>
                <span className="text-base font-black text-white print:text-black">40 kg ➔ 52.5 kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">+31.2% de ganancia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Banco Plano</span>
                <span className="text-base font-black text-white print:text-black">34.5 kg ➔ 42.5 kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">+23.1% de ganancia</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-200">
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Volumen Total</span>
                <span className="text-base font-black text-emerald-400 print:text-emerald-700">219 kg ➔ 324 kg</span>
                <span className="text-[10px] text-emerald-400 print:text-emerald-700 font-bold block">+105 kg movidos</span>
              </div>
            </div>
          </div>

          {/* Section 3: Coach Evaluation & Signature */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 print:bg-slate-50 print:border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider block">
              3. Dictamen y Conclusiones del Preparador Físico:
            </span>
            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
              "Agostina ha demostrado una adherencia sobresaliente al plan de entrenamiento. Se evidencia una reducción de abdomen bajo (-11 cm respecto al inicio) acompañada de hipertrofia notable en cuádriceps (+3 cm en muslos) y estabilización de glúteos en 96 cm. La fuerza en levantamientos compuestos creció un 48% con técnica validada mediante video. Se recomienda continuar con el Mesociclo 7 enfocado en hipertrofia avanzada."
            </p>

            <div className="pt-4 flex items-center justify-between border-t border-slate-800/80 print:border-slate-300 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Firma Digital Registrada:</span>
                <strong className="text-emerald-400 print:text-emerald-800">Prof. Nicolás Larroca</strong>
                <span className="text-[10px] text-slate-400 print:text-slate-500 block">Preparador Físico & Director NexCoach</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 print:text-emerald-800 font-bold text-[10px] border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Certificado Aprobado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
