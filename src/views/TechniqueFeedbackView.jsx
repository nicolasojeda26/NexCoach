import React, { useState } from 'react';
import {
  Video,
  Upload,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send,
  Plus,
  Star,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { getYouTubeId, todayISO } from '../utils/helpers';
import { useEscape } from '../hooks/useEscape';

export default function TechniqueFeedbackView({ appState, currentRole, onAddSubmission, onReviewSubmission, setSelectedVideo, uploadFile, mode }) {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadPct, setUploadPct] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const coachLabel = appState.coach.name ? `el Prof. ${appState.coach.name}` : 'tu profe';
  const student = appState.activeStudent;
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  useEscape(isSubmitModalOpen, () => setIsSubmitModalOpen(false));
  useEscape(Boolean(selectedReviewItem), () => setSelectedReviewItem(null));

  // Student upload form
  const [exerciseName, setExerciseName] = useState('Sentadilla Profunda');
  const [videoUrl, setVideoUrl] = useState('');
  const [studentNotes, setStudentNotes] = useState('');

  // Coach review form
  const [coachNotes, setCoachNotes] = useState('');
  const [coachRating, setCoachRating] = useState('Excelente');

  const submissions = appState.techniqueSubmissions || [];

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if ((!videoUrl && !videoFile) || !student) return;
    setSubmitError(null);

    // Video subido desde el celular (modo nube) o link de YouTube/Drive/Loom.
    let finalUrl = videoUrl;
    let videoFileUrl = null;
    let storagePath = null;
    if (videoFile) {
      try {
        setUploadPct(0);
        const res = await uploadFile('technique', student.id, videoFile, setUploadPct);
        finalUrl = res.url; videoFileUrl = res.url; storagePath = res.path;
      } catch (err) {
        setSubmitError(err.message);
        setUploadPct(null);
        return;
      }
      setUploadPct(null);
    }
    const youtubeId = videoFileUrl ? null : getYouTubeId(finalUrl);

    const newSub = {
      id: `tech-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      exerciseName,
      submittedDate: todayISO(),
      videoUrl: finalUrl,
      videoFileUrl,
      storagePath,
      youtubeId,
      studentNotes,
      status: "pending",
      rating: null,
      coachFeedback: null,
      reviewedAt: null
    };

    onAddSubmission(newSub);
    setIsSubmitModalOpen(false);
    setVideoUrl('');
    setVideoFile(null);
    setStudentNotes('');
  };

  const handleCoachSubmitReview = (subId) => {
    onReviewSubmission(subId, {
      coachFeedback: coachNotes || "¡Excelente ejecución! Sigue así.",
      rating: coachRating,
      status: "reviewed",
      reviewedAt: todayISO()
    });
    setSelectedReviewItem(null);
    setCoachNotes('');
    setCoachRating('Excelente');
  };

  const handleShareCorrectionOnWhatsApp = (sub) => {
    const student = appState.students.find(s => s.id === sub.studentId);
    const phone = student?.phone?.replace(/[^0-9]/g, '') || '5491100000000';
    const msg = encodeURIComponent(
      `Hola ${sub.studentName}! 👋 Ya revisé tu video de técnica en *${sub.exerciseName}*.\n\n` +
      `⭐ Calificación: *${sub.rating}*\n` +
      `📝 Mi devolución: "${sub.coachFeedback}"\n\n` +
      `¡Buenísimo trabajo! Puedes verlo detallado en NexCoach. 💪`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24 safe-area-bottom">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Corrección de Técnica por Video
            </h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Corrección del profe
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {currentRole === 'coach'
              ? 'Revisa las ejecuciones enviadas por los alumnos y devuelve correcciones con marcas de tiempo.'
              : `Grabá tu serie, mandá el video y recibí la corrección de ${coachLabel}.`}
          </p>
        </div>

        {currentRole === 'student' && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Enviar Video de Técnica</span>
          </button>
        )}
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.map(sub => {
          const isPending = sub.status === 'pending';
          const isSelectedForReview = selectedReviewItem?.id === sub.id;

          return (
            <div
              key={sub.id}
              className="bg-slate-900/85 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl"
            >
              {/* Submission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{sub.exerciseName}</h3>
                    <span className="text-[11px] text-slate-400">
                      Alumno: <strong className="text-slate-200">{sub.studentName}</strong> • Enviado: {sub.submittedDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isPending ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 font-bold text-[10px]">
                      <Clock className="w-3 h-3" />
                      Pendiente de Corrección
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Revisado ({sub.rating})
                    </span>
                  )}
                </div>
              </div>

              {/* Video Preview & Student Doubt */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Video Player Box */}
                <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center group">
                  {sub.videoFileUrl ? (
                    <video src={sub.videoFileUrl} controls playsInline preload="metadata" className="w-full h-full object-contain bg-black" aria-label={sub.exerciseName} />
                  ) : sub.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${sub.youtubeId}?autoplay=0`}
                      title={sub.exerciseName}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <a
                      href={sub.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 text-xs font-bold text-emerald-400 hover:underline p-4 text-center"
                    >
                      <span className="text-2xl">▶</span>
                      <span>Abrir video (Drive / Loom / otro)</span>
                    </a>
                  )}
                </div>

                {/* Student's note & Coach feedback */}
                <div className="md:col-span-2 space-y-3 flex flex-col justify-between">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Duda / Sensación del Alumno:
                    </span>
                    <p className="text-slate-300 italic">"{sub.studentNotes}"</p>
                  </div>

                  {/* Coach Feedback Section */}
                  {sub.coachFeedback ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Devolución de {appState.coach.name ? `Prof. ${appState.coach.name}` : 'tu profe'}:
                        </span>
                        <span className="text-[10px] text-slate-400">Revisado: {sub.reviewedAt}</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed font-medium">"{sub.coachFeedback}"</p>

                      {currentRole === 'coach' && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => handleShareCorrectionOnWhatsApp(sub)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar por WhatsApp</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : currentRole === 'coach' ? (
                    /* Coach Review Actions */
                    <div className="space-y-2 pt-1">
                      {isSelectedForReview ? (
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">Calificación Técnica:</span>
                            <select
                              value={coachRating}
                              onChange={(e) => setCoachRating(e.target.value)}
                              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs"
                            >
                              <option value="Excelente">Excelente</option>
                              <option value="Muy Buena">Muy Buena</option>
                              <option value="A Corregir">A Corregir (Ajustes necesarios)</option>
                            </select>
                          </div>

                          <textarea
                            value={coachNotes}
                            onChange={(e) => setCoachNotes(e.target.value)}
                            placeholder="Escribe la corrección: apertura de rodillas, profundidad, ritmo excéntrico..."
                            className="w-full h-20 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReviewItem(null)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleCoachSubmitReview(sub.id)}
                              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                            >
                              Guardar Devolución
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReviewItem(sub)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Escribir Devolución de Técnica</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-400 italic">
                      ⏳ Tu video está en la bandeja de revisión del profesor. Te notificará en cuanto lo evalúe.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Subir Video de Técnica (Alumno) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <form onSubmit={handleStudentSubmit} className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Enviar Video de Técnica al Profe</h3>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ejercicio Realizado:</label>
                <input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Ej: Sentadilla Profunda (Serie 4 a 60kg)"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                {mode === 'cloud' && (
                  <div className="mb-3">
                    <label className="block text-slate-300 font-semibold mb-1" htmlFor="video-file">Subí el video desde tu celular (hasta 50 MB):</label>
                    <input id="video-file" type="file" accept="video/*" capture="environment"
                      onChange={(e) => { setVideoFile(e.target.files?.[0] || null); if (e.target.files?.[0]) setVideoUrl(''); }}
                      className="w-full text-[11px] text-slate-300 file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-emerald-500 file:text-slate-950 file:font-bold" />
                    <span className="block text-center text-[10px] text-slate-500 mt-2">o pegá un link</span>
                  </div>
                )}
                <label className="block text-slate-300 font-semibold mb-1" htmlFor="video-url">Enlace del Video (YouTube / Shorts / Drive / Loom):</label>
                <input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => { setVideoUrl(e.target.value); if (e.target.value) setVideoFile(null); }}
                  placeholder="https://www.youtube.com/shorts/..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required={!videoFile}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">¿Qué sentiste o qué quieres que mire el profe?:</label>
                <textarea
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Ej: Sentí que me costaba mantener el pecho arriba en la subida..."
                  className="w-full h-24 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {submitError && <p role="alert" className="text-xs text-rose-400 font-semibold">{submitError}</p>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={uploadPct !== null}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-60"
              >
                {uploadPct !== null ? `Subiendo ${uploadPct}%` : 'Enviar al Profesor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
