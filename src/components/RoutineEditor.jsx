import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, X, ArrowUp, ArrowDown } from 'lucide-react';
import { newId, countExercises } from '../domain/model';
import { useEscape } from '../hooks/useEscape';

const input = 'w-full px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500';
const iconBtn = 'p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30';

const blankExercise = () => ({ id: newId('e'), name: '', setsReps: '3x10', defaultWeight: '', videoId: '' });
const blankBlock = (n) => ({ id: newId('b'), title: `Bloque ${n}`, rounds: 3, exercises: [blankExercise()] });
const blankDay = (n) => ({ id: newId('day'), name: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][n - 1] || `Día ${n}`, focus: '', blocks: [blankBlock(1)] });

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

// Editor completo de una rutina: días → bloques → ejercicios. Sirve para mesociclos y plantillas.
export default function RoutineEditor({ kind = 'meso', initial, videoLibrary = [], onSave, onClose }) {
  const isTemplate = kind === 'template';
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(initial || {
    id: newId(isTemplate ? 'tmpl' : 'meso'),
    name: '',
    focus: '',
    category: '',
    level: 'Intermedio',
    durationWeeks: 4,
    description: '',
    days: [blankDay(1)]
  })));
  const [openDay, setOpenDay] = useState(draft.days[0]?.id || null);
  const [error, setError] = useState(null);
  useEscape(true, onClose);

  const set = (patch) => setDraft(d => ({ ...d, ...patch }));
  const setDays = (fn) => setDraft(d => ({ ...d, days: fn(d.days) }));
  const updDay = (di, patch) => setDays(days => days.map((x, i) => (i === di ? { ...x, ...patch } : x)));
  const updBlock = (di, bi, patch) => updDay(di, { blocks: draft.days[di].blocks.map((b, i) => (i === bi ? { ...b, ...patch } : b)) });
  const updEx = (di, bi, ei, patch) => updBlock(di, bi, {
    exercises: draft.days[di].blocks[bi].exercises.map((e, i) => (i === ei ? { ...e, ...patch } : e))
  });

  const save = (e) => {
    e.preventDefault();
    const days = draft.days
      .map(d => ({
        ...d,
        blocks: d.blocks
          .map(b => ({ ...b, rounds: Math.max(1, Number(b.rounds) || 1), exercises: b.exercises.filter(x => x.name.trim()).map(x => {
            const ex = { ...x, name: x.name.trim() };
            if (!ex.videoId) delete ex.videoId;
            return ex;
          }) }))
          .filter(b => b.exercises.length)
      }))
      .filter(d => d.blocks.length);
    if (!draft.name.trim()) { setError('Poné un nombre.'); return; }
    if (!days.length) { setError('Agregá al menos un ejercicio.'); return; }
    const out = { ...draft, name: draft.name.trim(), days };
    if (isTemplate) {
      out.daysCount = days.length;
      out.totalExercises = countExercises(days);
      out.durationWeeks = Number(out.durationWeeks) || 4;
    }
    onSave(out);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-label={isTemplate ? 'Editar plantilla' : 'Editar rutina'}>
      <form onSubmit={save} className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] my-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-base font-black text-white">{isTemplate ? 'Plantilla de rutina' : 'Rutina del mesociclo'}</h3>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Cerrar editor"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-3 text-[11px] text-slate-300 font-semibold">
            <label>Nombre<input className={`${input} mt-1`} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder={isTemplate ? 'Ej: Hipertrofia 4 días' : 'Ej: Mesociclo 8 (Noviembre)'} required /></label>
            {isTemplate ? (
              <label>Categoría<input className={`${input} mt-1`} value={draft.category || ''} onChange={(e) => set({ category: e.target.value })} placeholder="Ej: Fuerza & Rendimiento" /></label>
            ) : (
              <label>Enfoque<input className={`${input} mt-1`} value={draft.focus || ''} onChange={(e) => set({ focus: e.target.value })} placeholder="Ej: Hipertrofia de tren inferior" /></label>
            )}
            {isTemplate && (
              <>
                <label>Nivel<input className={`${input} mt-1`} value={draft.level || ''} onChange={(e) => set({ level: e.target.value })} /></label>
                <label>Duración (semanas)<input type="number" min="1" max="52" className={`${input} mt-1`} value={draft.durationWeeks || 4} onChange={(e) => set({ durationWeeks: e.target.value })} /></label>
                <label className="sm:col-span-2">Descripción<textarea rows="2" className={`${input} mt-1`} value={draft.description || ''} onChange={(e) => set({ description: e.target.value })} /></label>
              </>
            )}
          </div>

          {draft.days.map((day, di) => {
            const isOpen = openDay === day.id;
            return (
              <div key={day.id} className="rounded-xl border border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2 p-2.5">
                  <button type="button" onClick={() => setOpenDay(isOpen ? null : day.id)} className="flex-1 flex items-center gap-2 text-left" aria-expanded={isOpen}>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    <span className="text-xs font-black text-white">Día {di + 1}: {day.name || 'Sin nombre'}</span>
                    <span className="text-[10px] text-slate-500">{day.blocks.reduce((a, b) => a + b.exercises.length, 0)} ejercicios</span>
                  </button>
                  <button type="button" className={iconBtn} disabled={di === 0} onClick={() => setDays(d => move(d, di, -1))} aria-label={`Subir día ${di + 1}`}><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button type="button" className={iconBtn} disabled={di === draft.days.length - 1} onClick={() => setDays(d => move(d, di, 1))} aria-label={`Bajar día ${di + 1}`}><ArrowDown className="w-3.5 h-3.5" /></button>
                  <button type="button" className={iconBtn} disabled={draft.days.length === 1} onClick={() => setDays(d => d.filter((_, i) => i !== di))} aria-label={`Eliminar día ${di + 1}`}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>

                {isOpen && (
                  <div className="p-3 pt-0 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <label>Nombre del día<input className={`${input} mt-1`} value={day.name} onChange={(e) => updDay(di, { name: e.target.value })} /></label>
                      <label>Enfoque del día<input className={`${input} mt-1`} value={day.focus} onChange={(e) => updDay(di, { focus: e.target.value })} placeholder="Ej: Cadena posterior" /></label>
                    </div>

                    {day.blocks.map((block, bi) => (
                      <div key={block.id} className="rounded-lg border border-slate-800 p-2.5 space-y-2">
                        <div className="flex items-end gap-2">
                          <label className="flex-1 text-[11px] text-slate-400">Bloque
                            <input className={`${input} mt-1`} value={block.title} onChange={(e) => updBlock(di, bi, { title: e.target.value })} />
                          </label>
                          <label className="w-24 text-[11px] text-slate-400">Series
                            <input type="number" min="1" max="12" className={`${input} mt-1`} value={block.rounds} onChange={(e) => updBlock(di, bi, { rounds: e.target.value })} />
                          </label>
                          <button type="button" className={iconBtn} disabled={day.blocks.length === 1}
                            onClick={() => updDay(di, { blocks: day.blocks.filter((_, i) => i !== bi) })} aria-label="Eliminar bloque"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>

                        {block.exercises.map((ex, ei) => (
                          <div key={ex.id} className="grid grid-cols-12 gap-1.5 items-center">
                            <input className={`${input} col-span-12 sm:col-span-4`} value={ex.name} onChange={(e) => updEx(di, bi, ei, { name: e.target.value })} placeholder="Ejercicio" aria-label="Nombre del ejercicio" />
                            <input className={`${input} col-span-4 sm:col-span-2`} value={ex.setsReps} onChange={(e) => updEx(di, bi, ei, { setsReps: e.target.value })} placeholder="3x10" aria-label="Series y repeticiones" />
                            <input className={`${input} col-span-3 sm:col-span-2`} value={ex.defaultWeight} onChange={(e) => updEx(di, bi, ei, { defaultWeight: e.target.value })} placeholder="40 kg" aria-label="Carga sugerida" />
                            <select className={`${input} col-span-4 sm:col-span-3`} value={ex.videoId || ''} onChange={(e) => updEx(di, bi, ei, { videoId: e.target.value })} aria-label="Video de técnica">
                              <option value="">Sin video</option>
                              {videoLibrary.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                            <button type="button" className={`${iconBtn} col-span-1 justify-self-end`} disabled={block.exercises.length === 1}
                              onClick={() => updBlock(di, bi, { exercises: block.exercises.filter((_, i) => i !== ei) })} aria-label="Eliminar ejercicio"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                        <button type="button" onClick={() => updBlock(di, bi, { exercises: [...block.exercises, blankExercise()] })}
                          className="text-[11px] font-bold text-emerald-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Ejercicio</button>
                      </div>
                    ))}
                    <button type="button" onClick={() => updDay(di, { blocks: [...day.blocks, blankBlock(day.blocks.length + 1)] })}
                      className="text-[11px] font-bold text-emerald-400 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Bloque</button>
                  </div>
                )}
              </div>
            );
          })}

          <button type="button" onClick={() => { const d = blankDay(draft.days.length + 1); setDays(days => [...days, d]); setOpenDay(d.id); }}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-700 text-xs font-bold text-slate-300 hover:border-emerald-500/50 flex items-center justify-center gap-1.5">
            <Plus className="w-4 h-4" />Agregar día
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 p-4 border-t border-slate-800">
          <span role="alert" className="text-xs text-rose-400 font-semibold">{error}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold">Cancelar</button>
            <button type="submit" className="btn-volt px-5 py-2 rounded-xl text-xs font-black">Guardar</button>
          </div>
        </div>
      </form>
    </div>
  );
}
