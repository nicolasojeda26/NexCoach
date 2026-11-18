import { useEffect, useRef } from 'react';
import { pushBackHandler } from '../platform/backStack';

// Cierra un modal o menú con la tecla Escape y con el botón "Atrás" de Android
// mientras está abierto (el último abierto es el primero que se cierra).
export function useEscape(active, onEscape) {
  const ref = useRef(onEscape);
  ref.current = onEscape;
  useEffect(() => {
    if (!active) return undefined;
    const close = () => ref.current?.();
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    const unregister = pushBackHandler(close);
    return () => { window.removeEventListener('keydown', onKey); unregister(); };
  }, [active]);
}
