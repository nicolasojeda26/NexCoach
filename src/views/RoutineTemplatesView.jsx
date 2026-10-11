import React, { useState } from 'react';
import {
  Layers,
  Copy,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Dumbbell,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function RoutineTemplatesView({ appState, onApplyTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(appState.students[0].id);
  const [mesoTargetName, setMesoTargetName] = useState('Mesociclo 8 (Noviembre)');

  const templates = appState.routineTemplates || [];

  const handleOpenAssign = (tmpl) => {
    setSelectedTemplate(tmpl);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    onApplyTemplate({
      templateId: selectedTemplate.id,
      studentId: selectedStudentId,
      mesoName: mesoTargetName
    });

    alert(`¡Plantilla "${selectedTemplate.name}" asignada con éxito a ${appState.students.find(s => s.id === selectedStudentId)?.name} para ${mesoTargetName}!`);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 safe-area-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Biblioteca de Plantillas de Rutinas
            </h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Clonador 1-Clic
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reutiliza y clona planificaciones completas estructuradas para asignarlas a cualquier alumno en segundos.
          </p>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(tmpl => (
          <div
            key={tmpl.id}
            className="bg-slate-900/85 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/25">
                  {tmpl.category}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{tmpl.level}</span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Días/Sem</span>
                  <strong className="text-white font-black">{tmpl.daysCount} días</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Duración</span>
                  <strong className="text-white font-black">{tmpl.durationWeeks} semanas</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Ejercicios</span>
                  <strong className="text-emerald-400 font-black">{tmpl.totalExercises} tot.</strong>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleOpenAssign(tmpl)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Asignar a un Alumno</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Asignar Plantilla a Alumno */}
      {isAssignModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleConfirmAssign} className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Clonar Plantilla de Entrenamiento</h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">Plantilla seleccionada:</span>
              <strong className="text-emerald-400 block text-sm mt-0.5">{selectedTemplate.name}</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Seleccionar Alumno Destino:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  {appState.students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Mesociclo Creado:</label>
                <input
                  type="text"
                  value={mesoTargetName}
                  onChange={(e) => setMesoTargetName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold"
              >
                Confirmar Asignación
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
