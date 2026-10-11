import React, { useState } from 'react';
import {
  Video,
  Play,
  Search,
  Filter,
  Lightbulb,
  ExternalLink,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function VideoLibraryView({ appState, setSelectedVideo }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'Todos los videos' },
    { id: 'Tren Inferior', label: 'Tren Inferior' },
    { id: 'Glúteos & Cadera', label: 'Glúteos & Cadera' },
    { id: 'Glúteos', label: 'Glúteos' },
    { id: 'Tren Superior', label: 'Tren Superior' },
    { id: 'Hombros', label: 'Hombros' },
    { id: 'Pecho & Tríceps', label: 'Pecho & Tríceps' },
    { id: 'Movilidad', label: 'Movilidad' }
  ];

  const filteredVideos = appState.videoLibrary.filter(v => {
    const matchesCategory = activeCategory === 'all' || v.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.cue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 md:p-8 border border-volt/20 bg-gradient-to-br from-obsidian-card via-obsidian to-obsidian-surface shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold">
              <Video className="w-3.5 h-3.5" />
              <span>VIDEOTECA OFICIAL • PF NICOLÁS LARROCA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Técnica & Ejecución en Video
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-xl">
              Demostraciones técnicas en YouTube Shorts grabadas directamente por el preparador físico para garantizar biomecánica óptima y prevención de lesiones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-obsidian-surface border border-slate-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 block">TOTAL CLIPS</span>
              <span className="text-xl font-black text-volt">{appState.videoLibrary.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-obsidian-surface border border-slate-800 text-center font-mono">
              <span className="text-[10px] text-slate-400 block">FORMATO</span>
              <span className="text-xl font-black text-white">Shorts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-w-full">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === c.id
                  ? 'bg-volt text-obsidian shadow-lg shadow-volt/20 font-black'
                  : 'bg-obsidian-card text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por ejercicio o cue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-obsidian-surface border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-volt"
          />
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVideos.map(video => {
          const thumbnail = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

          return (
            <div
              key={video.id}
              className="bg-obsidian-card/90 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-volt/50 transition-all group shadow-xl hover:shadow-2xl hover:shadow-volt/10"
            >
              {/* Thumbnail with Play Overlay */}
              <div
                onClick={() => setSelectedVideo(video)}
                className="relative aspect-video bg-black cursor-pointer overflow-hidden"
              >
                <img
                  src={thumbnail}
                  alt={video.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-obsidian/40 flex items-center justify-center group-hover:bg-obsidian/10 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-volt text-obsidian flex items-center justify-center shadow-lg shadow-volt/30 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-obsidian ml-0.5" />
                  </div>
                </div>

                <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-obsidian/90 text-[10px] text-volt font-mono font-bold backdrop-blur-md border border-volt/20">
                  {video.category}
                </span>
              </div>

              {/* Video Info */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-volt transition-colors leading-snug">
                    {video.name}
                  </h3>

                  {video.cue && (
                    <div className="p-2.5 mt-2 rounded-xl bg-obsidian-surface border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-300 leading-relaxed">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{video.cue}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => setSelectedVideo(video)}
                    className="text-volt hover:text-emerald-300 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>VER VIDEO</span>
                    <Play className="w-3 h-3 fill-volt" />
                  </button>

                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    title="Abrir en YouTube"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
