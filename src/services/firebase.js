// Integración con Firebase: login, sincronización en tiempo real, invitaciones y archivos.
// Se carga solo si hay claves en las variables de entorno VITE_FIREBASE_* (si no, la app usa el modo demo local).
import { COLLECTIONS, STUDENT_SCOPED, DEFAULT_COACH, migrateState } from '../domain/model';
import { INITIAL_DATA } from '../data/initialData';

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};
export const FUNCTIONS_REGION = env.VITE_FIREBASE_FUNCTIONS_REGION || 'southamerica-east1';

export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let fb = null; // módulos + instancias, cargados una sola vez

export async function loadFirebase() {
  if (fb) return fb;
  const [appMod, authMod, fsMod, stMod, fnMod] = await Promise.all([
    import('firebase/app'),
    import('firebase/auth'),
    import('firebase/firestore'),
    import('firebase/storage'),
    import('firebase/functions')
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  let db;
  try {
    // Caché local persistente: la app sigue andando sin señal en el gimnasio y sincroniza después.
    db = fsMod.initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: fsMod.persistentLocalCache({ tabManager: fsMod.persistentMultipleTabManager() })
    });
  } catch (e) {
    db = fsMod.getFirestore(app);
  }
  // Desarrollo / tests: VITE_USE_EMULATORS=1 conecta con los emuladores locales de Firebase.
  if (env.VITE_USE_EMULATORS === '1') {
    const host = env.VITE_EMULATOR_HOST || '127.0.0.1';
    authMod.connectAuthEmulator(authMod.getAuth(app), `http://${host}:9099`, { disableWarnings: true });
    fsMod.connectFirestoreEmulator(db, host, 8080);
    stMod.connectStorageEmulator(stMod.getStorage(app), host, 9199);
    fnMod.connectFunctionsEmulator(fnMod.getFunctions(app, FUNCTIONS_REGION), host, 5001);
  }
  fb = {
    ...authMod, ...fsMod, ...stMod, ...fnMod,
    app,
    auth: authMod.getAuth(app),
    db,
    storage: stMod.getStorage(app),
    functions: fnMod.getFunctions(app, FUNCTIONS_REGION)
  };
  return fb;
}

// ---------------------------------------------------------------- Auth

const AUTH_ERRORS = {
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email. Iniciá sesión.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en unos minutos.',
  'auth/network-request-failed': 'Sin conexión. Revisá tu internet.'
};
export const authErrorMessage = (e) => AUTH_ERRORS[e?.code] || e?.message || 'Ocurrió un error.';

export async function onAuthChange(cb) {
  const f = await loadFirebase();
  return f.onAuthStateChanged(f.auth, cb);
}

export async function signIn(email, password) {
  const f = await loadFirebase();
  return f.signInWithEmailAndPassword(f.auth, email.trim(), password);
}

export async function signOut() {
  const f = await loadFirebase();
  return f.signOut(f.auth);
}

export async function resetPassword(email) {
  const f = await loadFirebase();
  return f.sendPasswordResetEmail(f.auth, email.trim());
}

// Escucha el perfil del usuario: al crear la cuenta, el perfil se guarda un instante después del login.
export async function watchProfile(uid, cb, onError) {
  const f = await loadFirebase();
  // Solo se toma el perfil confirmado por el servidor: si se usa la copia local (todavía sin guardar),
  // las reglas de seguridad rechazan las lecturas y los listeners se cortan.
  return f.onSnapshot(f.doc(f.db, 'users', uid), { includeMetadataChanges: true }, s => {
    if (s.metadata.hasPendingWrites) return;
    cb(s.exists() ? s.data() : null);
  }, onError);
}

export async function getProfile(uid) {
  const f = await loadFirebase();
  const snap = await f.getDoc(f.doc(f.db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// Alta de profe: crea su espacio con planes, videoteca y plantillas iniciales (sin alumnos de demo).
export async function signUpCoach({ name, email, password, phone }) {
  const f = await loadFirebase();
  const cred = await f.createUserWithEmailAndPassword(f.auth, email.trim(), password);
  const uid = cred.user.uid;
  await createCoachSpace(uid, { name, email: email.trim(), phone });
  return cred.user;
}

export async function createCoachSpace(uid, { name, email, phone }) {
  const f = await loadFirebase();
  const seed = migrateState(INITIAL_DATA);
  const batch = f.writeBatch(f.db);
  batch.set(f.doc(f.db, 'users', uid), { role: 'coach', coachId: uid, email, createdAt: f.serverTimestamp() });
  batch.set(f.doc(f.db, 'coaches', uid), {
    ...DEFAULT_COACH,
    name: name || '',
    email: email || '',
    phone: phone || '',
    createdAt: f.serverTimestamp()
  });
  ['plans', 'videoLibrary', 'routineTemplates'].forEach(col => {
    seed[col].forEach(d => batch.set(f.doc(f.db, 'coaches', uid, col, d.id), d));
  });
  await batch.commit();
}

// Alta de alumno con el código de invitación que le pasó el profe.
export async function signUpStudent({ email, password, code }) {
  const f = await loadFirebase();
  const cleanCode = code.trim().toUpperCase();
  const cred = await f.createUserWithEmailAndPassword(f.auth, email.trim(), password);
  try {
    const inviteRef = f.doc(f.db, 'invites', cleanCode);
    const invite = await f.getDoc(inviteRef);
    if (!invite.exists()) throw Object.assign(new Error('El código de invitación no existe.'), { code: 'invite/not-found' });
    const data = invite.data();
    if (data.usedBy) throw Object.assign(new Error('Ese código ya fue usado. Pedile uno nuevo a tu profe.'), { code: 'invite/used' });
    const batch = f.writeBatch(f.db);
    batch.update(inviteRef, { usedBy: cred.user.uid, usedAt: f.serverTimestamp() });
    batch.set(f.doc(f.db, 'users', cred.user.uid), {
      role: 'student', coachId: data.coachId, studentId: data.studentId, inviteCode: cleanCode,
      email: email.trim(), createdAt: f.serverTimestamp()
    });
    await batch.commit();
    return cred.user;
  } catch (e) {
    await cred.user.delete().catch(() => {});
    throw e;
  }
}

// Código de 8 caracteres sin letras/números que se confunden (0/O, 1/I).
function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, n => chars[n % chars.length]).join('');
}

export async function createInvite(coachId, student) {
  const f = await loadFirebase();
  const code = randomCode();
  await f.setDoc(f.doc(f.db, 'invites', code), {
    coachId, studentId: student.id, studentName: student.name, usedBy: null, createdAt: f.serverTimestamp()
  });
  await f.setDoc(f.doc(f.db, 'coaches', coachId, 'students', student.id), { inviteCode: code }, { merge: true });
  return code;
}

// ---------------------------------------------------------------- Datos en tiempo real

const stripMeta = (snap) => ({ ...snap.data(), id: snap.id });

// Escucha todo lo que el usuario puede ver y arma el estado con la misma forma que el modo local.
export async function subscribeState(profile, onState, onError) {
  const f = await loadFirebase();
  const { coachId, role, studentId } = profile;
  const parts = { coach: null };
  COLLECTIONS.forEach(c => { parts[c] = []; });
  const loaded = new Set();
  const expected = 1 + COLLECTIONS.length;
  const emit = () => {
    if (loaded.size < expected) return;
    onState({ version: 2, ...parts, coach: { ...DEFAULT_COACH, ...(parts.coach || {}) } });
  };
  const unsubs = [];
  const mark = (key) => { loaded.add(key); emit(); };
  const err = (key) => (e) => { console.error(`Firestore ${key}:`, e); onError?.(e); mark(key); };

  unsubs.push(f.onSnapshot(f.doc(f.db, 'coaches', coachId), s => {
    parts.coach = s.exists() ? s.data() : null; mark('coach');
  }, err('coach')));

  COLLECTIONS.forEach(col => {
    const ref = f.collection(f.db, 'coaches', coachId, col);
    if (role === 'student' && col === 'students') {
      unsubs.push(f.onSnapshot(f.doc(ref, studentId), s => {
        parts.students = s.exists() ? [stripMeta(s)] : []; mark(col);
      }, err(col)));
      return;
    }
    if (role === 'student' && col === 'routineTemplates') { mark(col); return; }
    const q = role === 'student' && STUDENT_SCOPED.includes(col)
      ? f.query(ref, f.where('studentId', '==', studentId))
      : ref;
    unsubs.push(f.onSnapshot(q, s => {
      parts[col] = s.docs.map(stripMeta); mark(col);
    }, err(col)));
  });

  return () => unsubs.forEach(u => u());
}

export async function upsertDocs(coachId, col, docs) {
  const f = await loadFirebase();
  const list = Array.isArray(docs) ? docs : [docs];
  // Lotes de hasta 400 escrituras (límite de Firestore: 500).
  for (let i = 0; i < list.length; i += 400) {
    const batch = f.writeBatch(f.db);
    list.slice(i, i + 400).forEach(d => batch.set(f.doc(f.db, 'coaches', coachId, col, d.id), d));
    await batch.commit();
  }
}

export async function removeDoc(coachId, col, id) {
  const f = await loadFirebase();
  await f.deleteDoc(f.doc(f.db, 'coaches', coachId, col, id));
}

export async function updateCoachDoc(coachId, patch) {
  const f = await loadFirebase();
  await f.setDoc(f.doc(f.db, 'coaches', coachId), patch, { merge: true });
}

// ---------------------------------------------------------------- Archivos

export async function uploadStudentFile(coachId, studentId, kind, file, onProgress) {
  const f = await loadFirebase();
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-60);
  const path = `coaches/${coachId}/students/${studentId}/${kind}/${Date.now()}-${safe}`;
  const ref = f.ref(f.storage, path);
  const task = f.uploadBytesResumable(ref, file, { contentType: file.type });
  await new Promise((resolve, reject) => {
    task.on('state_changed',
      s => onProgress?.(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
      reject,
      resolve);
  });
  const url = await f.getDownloadURL(ref);
  return { url, path };
}

// ---------------------------------------------------------------- Mercado Pago

export async function createMercadoPagoLink(paymentId) {
  const f = await loadFirebase();
  const call = f.httpsCallable(f.functions, 'createPaymentLink');
  const res = await call({ paymentId });
  return res.data; // { initPoint }
}
