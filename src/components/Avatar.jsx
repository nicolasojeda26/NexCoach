import React, { useState } from 'react';

// Foto del alumno o, si no tiene (o no carga), sus iniciales.
export default function Avatar({ student, className = 'w-10 h-10 rounded-xl', textClass = 'text-sm' }) {
  const [failed, setFailed] = useState(false);
  const name = student?.name || '?';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  if (student?.avatar && !failed) {
    return <img src={student.avatar} alt="" onError={() => setFailed(true)} className={`${className} object-cover shrink-0`} />;
  }
  return (
    <span aria-hidden="true" className={`${className} ${textClass} shrink-0 flex items-center justify-center font-black bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 text-emerald-200`}>
      {initials}
    </span>
  );
}
