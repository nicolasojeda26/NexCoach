import React from 'react';
import { X, ExternalLink, Play, Lightbulb } from 'lucide-react';

export default function VideoModal({ video, onClose }) {
  if (!video) return null;

  // Transform YouTube watch or shorts URL to embed URL
  let embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Play className="w-4 h-4 fill-emerald-400" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{video.name}</h3>
              <span className="text-xs text-emerald-400 font-medium">{video.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-[9/16] max-h-[500px] w-full bg-black flex items-center justify-center overflow-hidden">
          <iframe
            src={embedUrl}
            title={video.name}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Footer with Cue */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-2">
          {video.cue && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">Técnica clave del Profe: </span>
                {video.cue}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-xs">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <span>Abrir en YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
            >
              Cerrar video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
