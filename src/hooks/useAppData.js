// Un único punto de acceso a los datos, igual para el modo demo (navegador) y el modo nube (Firebase).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadAppState, saveAppState, resetAppState } from '../data/storage';
import {
  isFirebaseConfigured, onAuthChange, watchProfile, subscribeState, upsertDocs, removeDoc,
  updateCoachDoc, uploadStudentFile, createInvite as fbCreateInvite, createMercadoPagoLink,
  signIn, signOut, signUpCoach, signUpStudent, resetPassword, createCoachSpace
} from '../services/firebase';
import { compressImage, fileToDataURL, MAX_VIDEO_MB } from '../utils/media';

const DEMO_FLAG = 'nexcoach_demo';
const readDemoFlag = () => { try { return sessionStorage.getItem(DEMO_FLAG) === '1'; } catch (e) { return false; } };

const mergeById = (arr = [], docs = []) => {
  const map = new Map(arr.map(x => [x.id, x]));
  docs.forEach(d => map.set(d.id, d));
  return [...map.values()];
};

export function useAppData() {
  const cloudAvailable = isFirebaseConfigured();
  const [mode, setMode] = useState(() => (cloudAvailable && !readDemoFlag() ? 'cloud' : 'local'));

  // ---------- Modo demo (local)
  const [localState, setLocalState] = useState(() => (mode === 'local' ? loadAppState() : null));
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    if (mode === 'local' && localState) setStorageWarning(!saveAppState(localState));
  }, [mode, localState]);

  // ---------- Modo nube
  const [status, setStatus] = useState(mode === 'cloud' ? 'loading' : 'ready');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cloudState, setCloudState] = useState(null);
  const [cloudError, setCloudError] = useState(null);

  useEffect(() => {
    if (mode !== 'cloud') return undefined;
    let unsubAuth = () => {};
    let unsubProfile = () => {};
    let unsubData = () => {};
    let graceTimer = null;
    let cancelled = false;
    setStatus('loading');
    const stopUser = () => { unsubProfile(); unsubData(); clearTimeout(graceTimer); unsubProfile = () => {}; unsubData = () => {}; };

    onAuthChange(async (u) => {
      stopUser();
      setUser(u);
      setCloudState(null);
      setProfile(null);
      if (!u) { setStatus('signedOut'); return; }
      setStatus('loading');
      let subscribedFor = null;
      // Si recién se creó la cuenta, el perfil aparece unos instantes después: se espera antes de pedir completarlo.
      graceTimer = setTimeout(() => { if (!cancelled && !subscribedFor) setStatus(s => (s === 'loading' ? 'needsProfile' : s)); }, 6000);
      try {
        unsubProfile = await watchProfile(u.uid, async (p) => {
          if (cancelled || !p) return;
          const key = `${p.role}:${p.coachId}:${p.studentId || ''}`;
          if (subscribedFor === key) return;
          subscribedFor = key;
          clearTimeout(graceTimer);
          unsubData();
          setProfile(p);
          unsubData = await subscribeState(p, (st) => { setCloudState(st); setStatus('ready'); }, (e) => setCloudError(e.message));
        }, (e) => { setCloudError(e.message); setStatus('error'); });
      } catch (e) {
        setCloudError(e.message);
        setStatus('error');
      }
    }).then(fn => { unsubAuth = fn; });
    return () => { cancelled = true; unsubAuth(); stopUser(); };
  }, [mode]);

  const state = mode === 'local' ? localState : cloudState;
  const coachId = profile?.coachId;

  // ---------- Acciones (misma API en ambos modos)
  const upsert = useCallback(async (col, docs) => {
    const list = (Array.isArray(docs) ? docs : [docs]).filter(Boolean);
    if (!list.length) return;
    if (mode === 'local') {
      setLocalState(prev => ({ ...prev, [col]: mergeById(prev[col], list) }));
    } else {
      await upsertDocs(coachId, col, list);
    }
  }, [mode, coachId]);

  const remove = useCallback(async (col, id) => {
    if (mode === 'local') {
      setLocalState(prev => ({ ...prev, [col]: (prev[col] || []).filter(x => x.id !== id) }));
    } else {
      await removeDoc(coachId, col, id);
    }
  }, [mode, coachId]);

  const updateCoach = useCallback(async (patch) => {
    if (mode === 'local') {
      setLocalState(prev => ({ ...prev, coach: { ...prev.coach, ...patch } }));
    } else {
      await updateCoachDoc(coachId, patch);
    }
  }, [mode, coachId]);

  const reset = useCallback(() => {
    if (mode === 'local') setLocalState(resetAppState());
  }, [mode]);

  // Sube una foto (comprimida) o un video. En modo demo solo fotos, guardadas en el navegador.
  const uploadFile = useCallback(async (kind, studentId, file, onProgress) => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) throw new Error('Solo se pueden subir fotos o videos.');
    if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
      throw new Error(`El video supera los ${MAX_VIDEO_MB} MB. Recortalo o subilo a YouTube/Drive y pegá el link.`);
    }
    const toSend = isImage ? await compressImage(file, kind === 'meals' ? { maxSide: 900, quality: 0.72 } : {}) : file;
    if (mode === 'local') {
      if (isVideo) throw new Error('En la demo los videos se comparten por link (YouTube, Drive o Loom).');
      onProgress?.(100);
      return { url: await fileToDataURL(toSend), path: null };
    }
    return uploadStudentFile(coachId, studentId, kind, toSend, onProgress);
  }, [mode, coachId]);

  const createInvite = useCallback(async (student) => {
    if (mode !== 'cloud') throw new Error('Las invitaciones funcionan con la app conectada a la nube.');
    return fbCreateInvite(coachId, student);
  }, [mode, coachId]);

  const mercadoPagoLink = useCallback(async (paymentId) => {
    if (mode !== 'cloud') throw new Error('El cobro con Mercado Pago funciona con la app conectada a la nube.');
    return createMercadoPagoLink(paymentId);
  }, [mode]);

  const actions = useMemo(() => ({ upsert, remove, updateCoach, reset, uploadFile, createInvite, mercadoPagoLink }),
    [upsert, remove, updateCoach, reset, uploadFile, createInvite, mercadoPagoLink]);

  const auth = useMemo(() => ({
    signIn, signOut, signUpCoach, signUpStudent, resetPassword,
    completeCoachProfile: async (data) => {
      setStatus('loading');
      await createCoachSpace(user.uid, { ...data, email: user.email });
    }
  }), [user]);

  const enterDemo = useCallback(() => {
    try { sessionStorage.setItem(DEMO_FLAG, '1'); } catch (e) { /* noop */ }
    setLocalState(loadAppState());
    setStatus('ready');
    setMode('local');
  }, []);

  const exitDemo = useCallback(() => {
    try { sessionStorage.removeItem(DEMO_FLAG); } catch (e) { /* noop */ }
    setMode('cloud');
  }, []);

  return {
    mode, cloudAvailable, status: mode === 'local' ? 'ready' : status,
    user, profile, state, actions, auth, enterDemo, exitDemo,
    error: cloudError, storageWarning
  };
}
