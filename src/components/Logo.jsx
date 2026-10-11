import React from 'react';

export default function Logo({ variant = 'full', className = '' }) {
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 drop-shadow-[0_0_12px_rgba(16,245,155,0.4)]"
        >
          <defs>
            <linearGradient id="logo-volt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10f59b" />
              <stop offset="60%" stopColor="#00d980" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
            <linearGradient id="logo-dark-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0a0f1d" />
            </linearGradient>
          </defs>

          {/* Hexagon Outer Shield */}
          <polygon
            points="24,2 44,13.5 44,34.5 24,46 4,34.5 4,13.5"
            fill="url(#logo-dark-grad)"
            stroke="url(#logo-volt-grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Core Glow Vertex */}
          <polygon
            points="24,6 40,15 40,33 24,42 8,33 8,15"
            fill="#090f1d"
            opacity="0.9"
          />

          {/* Stylized Geometric 'N' with Athletic Bolt */}
          <path
            d="M15 32V16L25 28V16M33 16V32M25 28L33 32"
            stroke="url(#logo-volt-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Core Energy Bolt Accent */}
          <path
            d="M26 13L21 24H27L22 35"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon Emblem */}
      <div className="relative group cursor-pointer">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-volt-neon/40 to-cyber-glow/30 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
        <div className="relative w-11 h-11 rounded-2xl bg-dark-900 border border-volt-neon/30 flex items-center justify-center shadow-lg shadow-volt-glow/20">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7"
          >
            <defs>
              <linearGradient id="logo-emblem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10f59b" />
                <stop offset="100%" stopColor="#00e5ff" />
              </linearGradient>
            </defs>
            <polygon
              points="24,3 43,14 43,34 24,45 5,34 5,14"
              fill="#090f1d"
              stroke="url(#logo-emblem-grad)"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            <path
              d="M16 32V16L26 28V16M32 16V32"
              stroke="url(#logo-emblem-grad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="24" r="3" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-black tracking-tighter text-white uppercase font-display leading-none">
            NEX<span className="text-volt-neon">COACH</span>
          </span>
          <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-volt-neon/15 text-volt-neon border border-volt-neon/30 uppercase leading-none">
            ELITE
          </span>
        </div>
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-0.5">
          PF LARROCA • 2026
        </span>
      </div>
    </div>
  );
}
