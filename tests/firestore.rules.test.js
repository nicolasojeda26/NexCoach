// Tests de las reglas de seguridad de Firestore. Correr con:
//   npm run test:rules   (levanta el emulador de Firestore; requiere Java)
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

let env;
const COACH = 'coach-1';
const OTHER_COACH = 'coach-2';

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-nexcoach',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') }
  });
});
after(async () => { await env.cleanup(); });

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users/coach-1'), { role: 'coach', coachId: COACH });
    await setDoc(doc(db, 'users/alu-a'), { role: 'student', coachId: COACH, studentId: 'std-a', inviteCode: 'AAAAAAAA' });
    await setDoc(doc(db, 'coaches/coach-1'), { name: 'Profe', alias: 'ALIAS' });
    await setDoc(doc(db, 'coaches/coach-1/students/std-a'), { name: 'Ana' });
    await setDoc(doc(db, 'coaches/coach-1/students/std-b'), { name: 'Beto' });
    await setDoc(doc(db, 'coaches/coach-1/payments/p-a'), { studentId: 'std-a', amount: 1000, status: 'pending' });
    await setDoc(doc(db, 'coaches/coach-1/payments/p-b'), { studentId: 'std-b', amount: 1000, status: 'pending' });
    await setDoc(doc(db, 'coaches/coach-1/plans/plan-1'), { name: 'Plan', price: 1000 });
    await setDoc(doc(db, 'coaches/coach-1/routineTemplates/t-1'), { name: 'Plantilla' });
    await setDoc(doc(db, 'invites/NEWCODE1'), { coachId: COACH, studentId: 'std-b', usedBy: null });
  });
});

const as = (uid) => env.authenticatedContext(uid).firestore();

test('el profe lee y escribe su espacio; otro profe no', async () => {
  await assertSucceeds(getDoc(doc(as(COACH), 'coaches/coach-1/payments/p-b')));
  await assertSucceeds(setDoc(doc(as(COACH), 'coaches/coach-1/payments/p-c'), { studentId: 'std-a', amount: 5 }));
  await assertFails(getDoc(doc(as(OTHER_COACH), 'coaches/coach-1/payments/p-a')));
  await assertFails(getDoc(doc(as(OTHER_COACH), 'coaches/coach-1')));
});

test('sin sesión no se lee nada', async () => {
  const anon = env.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anon, 'coaches/coach-1')));
  await assertFails(getDoc(doc(anon, 'invites/NEWCODE1')));
});

test('el alumno lee solo sus cuotas y no las puede modificar', async () => {
  const db = as('alu-a');
  await assertSucceeds(getDoc(doc(db, 'coaches/coach-1/payments/p-a')));
  await assertFails(getDoc(doc(db, 'coaches/coach-1/payments/p-b')));
  await assertSucceeds(getDocs(query(collection(db, 'coaches/coach-1/payments'), where('studentId', '==', 'std-a'))));
  await assertFails(getDocs(collection(db, 'coaches/coach-1/payments')));
  await assertFails(updateDoc(doc(db, 'coaches/coach-1/payments/p-a'), { status: 'paid' }));
});

test('el alumno ve los datos del profe, los planes y su ficha, pero no la de otros ni las plantillas', async () => {
  const db = as('alu-a');
  await assertSucceeds(getDoc(doc(db, 'coaches/coach-1')));
  await assertSucceeds(getDocs(collection(db, 'coaches/coach-1/plans')));
  await assertSucceeds(getDoc(doc(db, 'coaches/coach-1/students/std-a')));
  await assertFails(getDoc(doc(db, 'coaches/coach-1/students/std-b')));
  await assertFails(getDocs(collection(db, 'coaches/coach-1/routineTemplates')));
  await assertFails(setDoc(doc(db, 'coaches/coach-1'), { alias: 'HACK' }, { merge: true }));
});

test('el alumno registra sus sesiones y hábitos, no los de otro', async () => {
  const db = as('alu-a');
  await assertSucceeds(setDoc(doc(db, 'coaches/coach-1/workoutLogs/s1'), { studentId: 'std-a', rpe: 7 }));
  await assertFails(setDoc(doc(db, 'coaches/coach-1/workoutLogs/s2'), { studentId: 'std-b', rpe: 7 }));
  await assertFails(updateDoc(doc(db, 'coaches/coach-1/workoutLogs/s1'), { rpe: 2 }));
  await assertSucceeds(setDoc(doc(db, 'coaches/coach-1/habits/std-a'), { studentId: 'std-a', today: {} }));
  await assertFails(setDoc(doc(db, 'coaches/coach-1/habits/std-b'), { studentId: 'std-b', today: {} }));
  await assertFails(setDoc(doc(db, 'coaches/coach-1/habits/std-b'), { studentId: 'std-a', today: {} }));
});

test('el alumno envía videos pendientes pero no se autocalifica', async () => {
  const db = as('alu-a');
  await assertSucceeds(setDoc(doc(db, 'coaches/coach-1/techniqueSubmissions/v1'),
    { studentId: 'std-a', status: 'pending', rating: null, coachFeedback: null }));
  await assertFails(setDoc(doc(db, 'coaches/coach-1/techniqueSubmissions/v2'),
    { studentId: 'std-a', status: 'reviewed', rating: 'Excelente', coachFeedback: 'ok' }));
});

test('alta de alumno con código de invitación válido', async () => {
  const db = as('nuevo-b');
  const batch = writeBatch(db);
  batch.update(doc(db, 'invites/NEWCODE1'), { usedBy: 'nuevo-b' });
  batch.set(doc(db, 'users/nuevo-b'), { role: 'student', coachId: COACH, studentId: 'std-b', inviteCode: 'NEWCODE1' });
  await assertSucceeds(batch.commit());
  await assertSucceeds(getDoc(doc(db, 'coaches/coach-1/payments/p-b')));
  await assertFails(getDoc(doc(db, 'coaches/coach-1/payments/p-a')));
});

test('no se puede reusar un código ni vincularse a otro alumno', async () => {
  // Intento de vincularse a un alumno distinto del que figura en la invitación
  const db1 = as('tramposo');
  const b1 = writeBatch(db1);
  b1.update(doc(db1, 'invites/NEWCODE1'), { usedBy: 'tramposo' });
  b1.set(doc(db1, 'users/tramposo'), { role: 'student', coachId: COACH, studentId: 'std-a', inviteCode: 'NEWCODE1' });
  await assertFails(b1.commit());

  // Sin usar la invitación (usedBy no queda con su uid)
  await assertFails(setDoc(doc(db1, 'users/tramposo'), { role: 'student', coachId: COACH, studentId: 'std-b', inviteCode: 'NEWCODE1' }));

  // Código ya usado
  await env.withSecurityRulesDisabled(async (ctx) => {
    await updateDoc(doc(ctx.firestore(), 'invites/NEWCODE1'), { usedBy: 'alguien' });
  });
  const db2 = as('segundo');
  const b2 = writeBatch(db2);
  b2.update(doc(db2, 'invites/NEWCODE1'), { usedBy: 'segundo' });
  b2.set(doc(db2, 'users/segundo'), { role: 'student', coachId: COACH, studentId: 'std-b', inviteCode: 'NEWCODE1' });
  await assertFails(b2.commit());
});

test('un usuario no puede cambiar su rol ni hacerse profe de otro espacio', async () => {
  await assertFails(updateDoc(doc(as('alu-a'), 'users/alu-a'), { role: 'coach', coachId: 'alu-a' }));
  await assertFails(setDoc(doc(as('x'), 'users/x'), { role: 'coach', coachId: COACH }));
  await assertSucceeds(setDoc(doc(as('x'), 'users/x'), { role: 'coach', coachId: 'x' }));
});

test('solo el profe crea invitaciones para su espacio', async () => {
  await assertSucceeds(setDoc(doc(as(COACH), 'invites/ZZZZ2222'), { coachId: COACH, studentId: 'std-a', usedBy: null }));
  await assertFails(setDoc(doc(as('alu-a'), 'invites/YYYY2222'), { coachId: COACH, studentId: 'std-a', usedBy: null }));
});
