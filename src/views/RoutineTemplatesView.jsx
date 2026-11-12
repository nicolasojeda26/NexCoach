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
  BookOpen,
  Edit2,
  Trash2
} from 'lucide-react';
import RoutineEditor from '../components/RoutineEditor';
import { countExercises } from '../domain/model';
import { useEscape } from '../hooks/useEscape';

export default function RoutineTemplatesView({ appState, onApplyTemplate, onSaveTemplate, onDeleteTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editor, setEditor] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(appState.activeStudent?.id || appState.students[0]?.id || '');
  useEscape(isAssignModalOpen, () => setIsAssignModalOpen(false));
  const activeStudents = appState.students.filter(s => s.status !== 'inactive');
  const [mesoTargetName, setMesoTargetName] = useState('');
  const [assignedMessage, setAssignedMessage] = useState(null);

  const templates = appState.routineTemplates || [];

  const handleOpenAssign = (tmpl) => {
    setSelectedTemplate(tmpl);
    setSelectedStudentId(appState.activeStudent?.id || activeStudents[0]?.id || '');
    // Siguiente número de mesociclo según los existentes (ej: si hay un "Mesociclo 7", propone el 8)
    const target = appState.activeStudent?.id || activeStudents[0]?.id;
    const maxNum = appState.mesocycles.filter(m => m.studentId === target).reduce((max, m) => {
      const n = Number((m.name.match(/Mesociclo\s+(\d+)/i) || [])[1]);
      return n > max ? n : max;
    }, 0);
    setMesoTargetName(`Mesociclo ${maxNum + 1} — ${tmpl.name.split(' (')[0]}`);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedStudentId) return;

    const ok = await onApplyTemplate({
      templateId: selectedTemplate.id,
      studentId: selectedStudentId,
      mesoName: mesoTargetName
    });

    if (ok === false) return;
    setAssignedMessage(`Plantilla "${selectedTemplate.name}" asignada a ${appState.students.find(s => s.id === selectedStudentId)?.name} como "${mesoTargetName}". Ya la ves en Rutinas & Mesociclos.`);
    setTimeout(() => setAssignedMessage(null), 5000);
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
            Reutilizá planificaciones completas y asignalas a cualquier alumno en segundos. Cada plantilla tiene sus propios días y ejercicios.
          </p>
        </div>
        <button onClick={() => setEditor({ initial: null })} className="btn-volt flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black self-start">
          <Plus className="w-4 h-4" aria-hidden="true" />Nueva plantilla
        </button>
      </div>

      {assignedMessage && (
        <div role="status" className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{assignedMessage}</span>
        </div>
      )}

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
                  <strong className="text-white font-black">{tmpl.days?.length || tmpl.daysCount} días</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Duración</span>
                  <strong className="text-white font-black">{tmpl.durationWeeks} semanas</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Ejercicios</span>
                  <strong className="text-emerald-400 font-black">{countExercises(tmpl.days)} tot.</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button onClick={() => setEditor({ initial: tmpl })} aria-label={`Editar plantilla ${tmpl.name}`}
                className="p-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={() => window.confirm(`¿Eliminar la plantilla "${tmpl.name}"?`) && onDeleteTemplate(tmpl.id)} aria-label={`Eliminar plantilla ${tmpl.name}`}
                className="p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
              <button
                disabled={!tmpl.days?.length || !activeStudents.length}
                onClick={() => handleOpenAssign(tmpl)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-40"
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
                  {activeStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}{s.email ? ` (${s.email})` : ''}</option>
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
      {editor && (
        <RoutineEditor kind="template" initial={editor.initial} videoLibrary={appState.videoLibrary}
          onSave={async (t) => { const ok = await onSaveTemplate(t); if (ok !== false) setEditor(null); }}
          onClose={() => setEditor(null)} />
      )}
    </div>
  );
}
