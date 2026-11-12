import React, { useState } from 'react';
import {
  Calendar,
  Dumbbell,
  Play,
  Flame,
  CheckCircle,
  Plus,
  Layers,
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
  Activity,
  Video,
  Edit2,
  Copy,
  Trash2,
  BookmarkPlus
} from 'lucide-react';
import RoutineEditor from '../components/RoutineEditor';
import { cloneDays, newId } from '../domain/model';

export default function RoutinesView({ appState, currentRole, setSelectedVideo, onStartWorkout, onSaveMesocycle, onDeleteMesocycle, onSaveTemplate, onGoToTemplates }) {
  const mesocycles = appState.scoped.mesocycles;
  const isCoach = currentRole === 'coach';
  const [selectedMesoId, setSelectedMesoId] = useState(mesocycles[mesocycles.length - 1]?.id || null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [editor, setEditor] = useState(null); // { initial } | null

  const handleSaveFromEditor = async (meso) => {
    const ok = await onSaveMesocycle(meso);
    if (ok !== false) { setSelectedMesoId(meso.id); setSelectedDayIndex(0); setEditor(null); }
  };

  const editorModal = editor && (
    <RoutineEditor kind="meso" initial={editor.initial} videoLibrary={appState.videoLibrary}
      onSave={handleSaveFromEditor} onClose={() => setEditor(null)} />
  );

  const activeMesocycle = mesocycles.find(m => m.id === selectedMesoId) || mesocycles[mesocycles.length - 1];
  if (!activeMesocycle) {
    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="p-6 rounded-3xl bg-obsidian-card/90 border border-slate-800 space-y-3">
          <h1 className="text-xl font-black text-white">Sin rutina asignada</h1>
          <p className="text-sm text-slate-400">
            {isCoach
              ? `${appState.activeStudent?.name || 'Este alumno'} todavía no tiene mesociclos. Asignale una plantilla o armá una rutina desde cero.`
              : 'Tu profe todavía no te asignó una rutina.'}
          </p>
          {isCoach && (
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setEditor({ initial: null })} className="btn-volt px-4 py-2.5 rounded-xl text-xs font-black">Armar rutina nueva</button>
              <button onClick={onGoToTemplates} className="px-4 py-2.5 rounded-xl text-xs font-bold text-volt border border-volt/30">Usar una plantilla</button>
            </div>
          )}
        </div>
        {editorModal}
      </div>
    );
  }
  const activeDay = activeMesocycle.days[selectedDayIndex] || activeMesocycle.days[0] || { name: '', focus: '', blocks: [] };

  // Calculate day stats
  const totalExercises = activeDay.blocks.reduce((acc, b) => acc + b.exercises.length, 0);
  const totalRounds = activeDay.blocks.reduce((acc, b) => acc + (b.rounds || 3), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-volt/20 bg-gradient-to-br from-obsidian-card via-obsidian to-obsidian-surface shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>PLANIFICADOR DE ENTRENAMIENTO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Mesociclos, Bloques & Rutinas
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Estructura periodizada por bloques de activación, fuerza principal y superseries metabólicas.
            </p>
          </div>

          {/* Mesocycle switcher buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {mesocycles.map(meso => (
              <button
                key={meso.id}
                onClick={() => {
                  setSelectedMesoId(meso.id);
                  setSelectedDayIndex(0);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all ${
                  selectedMesoId === meso.id
                    ? 'bg-volt text-obsidian shadow-lg shadow-volt/20 scale-[1.02]'
                    : 'bg-obsidian-surface text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                {meso.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mesocycle Focus & Quick Action Bar */}
      <div className="p-5 rounded-3xl bg-obsidian-card/90 border border-slate-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-volt/10 text-volt border border-volt/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-volt font-black font-mono uppercase tracking-wider">
                {activeMesocycle.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {activeMesocycle.studentName ? `ASIGNADO A ${activeMesocycle.studentName.toUpperCase()}` : 'FASE ACTIVA'}
              </span>
            </div>
            <span className="text-sm md:text-base font-bold text-white block mt-0.5">
              Enfoque: {activeMesocycle.focus}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCoach && (
            <>
              <button onClick={() => setEditor({ initial: activeMesocycle })} className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-200 border border-slate-700 hover:border-volt/50">
                <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />Editar
              </button>
              <button
                onClick={() => setEditor({ initial: { ...activeMesocycle, id: newId('meso'), name: `${activeMesocycle.name} (copia)`, days: cloneDays(activeMesocycle.days) } })}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-200 border border-slate-700 hover:border-volt/50"
                title="Crear el próximo mesociclo a partir de este"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />Duplicar
              </button>
              <button
                onClick={() => onSaveTemplate({
                  id: newId('tmpl'), name: activeMesocycle.name.split('(')[0].split('—')[0].trim() || 'Plantilla',
                  category: 'Personalizada', level: 'A medida', durationWeeks: 4,
                  description: activeMesocycle.focus || '', days: cloneDays(activeMesocycle.days),
                  daysCount: activeMesocycle.days.length,
                  totalExercises: activeMesocycle.days.reduce((a, d) => a + d.blocks.reduce((x, b) => x + b.exercises.length, 0), 0)
                })}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-200 border border-slate-700 hover:border-volt/50"
              >
                <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />Guardar como plantilla
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar "${activeMesocycle.name}"? No se puede deshacer.`)) {
                    onDeleteMesocycle(activeMesocycle.id);
                    setSelectedMesoId(null);
                  }
                }}
                className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-400 border border-slate-800"
                aria-label="Eliminar mesociclo"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button onClick={() => setEditor({ initial: null })} className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-volt border border-volt/30">
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />Nueva
              </button>
            </>
          )}
          <button
            onClick={() => onStartWorkout(activeDay, activeMesocycle.name)}
            className="btn-volt flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-black shadow-lg shadow-volt/25 hover:scale-[1.02] transition-transform"
          >
            <Dumbbell className="w-4 h-4 stroke-[3]" aria-hidden="true" />
            <span>INICIAR ESTE DÍA EN VIVO</span>
          </button>
        </div>
      </div>

      {/* Days of Week Tab Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activeMesocycle.days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const dayExerciseCount = day.blocks.reduce((acc, b) => acc + b.exercises.length, 0);

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-obsidian-surface border-volt/60 shadow-lg shadow-volt/10 scale-[1.02]'
                  : 'bg-obsidian-card/80 border-slate-800/80 hover:border-slate-700 text-slate-400'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-volt/10 rounded-full blur-xl pointer-events-none" />
              )}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-black ${isSelected ? 'text-volt' : 'text-slate-400'}`}>
                  DÍA {idx + 1}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {dayExerciseCount} EJER.
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                {day.name}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {day.focus}
              </p>
            </button>
          );
        })}
      </div>

      {/* Selected Day Content */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>{activeDay.name}</span>
              <span className="text-xs text-slate-400 font-normal">({activeDay.focus})</span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
              <span>{activeDay.blocks.length} Bloques</span>
              <span>•</span>
              <span>{totalExercises} Ejercicios</span>
              <span>•</span>
              <span className="text-volt">~55-65 min</span>
            </div>
          </div>

          <button
            onClick={() => onStartWorkout(activeDay, activeMesocycle.name)}
            className="sm:hidden btn-volt flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Entrenar</span>
          </button>
        </div>

        {/* Blocks rendering */}
        <div className="space-y-4">
          {activeDay.blocks.map((block, bIdx) => (
            <div
              key={block.id}
              className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl p-5 space-y-4 shadow-xl backdrop-blur-sm"
            >
              {/* Block Header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-volt/10 text-volt flex items-center justify-center text-xs font-mono font-black border border-volt/20">
                    B{bIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-white">{block.title}</h3>
                    <span className="text-[11px] text-slate-400">
                      {block.exercises.length} movimientos estructurados
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-900 text-volt border border-slate-800">
                  {block.rounds} Rondas / Series
                </span>
              </div>

              {/* Exercises in this block */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {block.exercises.map((ex, eIdx) => {
                  const video = appState.videoLibrary.find(v => v.id === ex.videoId);
                  return (
                    <div
                      key={ex.id}
                      className="p-4 rounded-2xl bg-obsidian-surface border border-slate-800/90 flex flex-col justify-between gap-3.5 hover:border-slate-700 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                            {eIdx + 1}.
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-volt transition-colors">
                              {ex.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono text-slate-400">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-volt border border-volt/20">
                                {ex.setsReps}
                              </span>
                              <span>•</span>
                              <span className="text-slate-300">
                                Carga: <strong className="text-white">{ex.defaultWeight}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Video Button & Cue */}
                      {video && (
                        <div className="pt-3 border-t border-slate-900/90 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={video.cue}>
                            {video.cue}
                          </span>
                          <button
                            onClick={() => setSelectedVideo(video)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-volt/10 hover:bg-volt/20 text-volt text-xs font-mono font-bold border border-volt/25 transition-all shrink-0 hover:scale-[1.02]"
                          >
                            <Play className="w-3 h-3 fill-volt" />
                            <span>Técnica Profe</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {editorModal}
    </div>
  );
}
