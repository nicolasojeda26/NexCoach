// Cloud Functions de NexCoach: cobro de cuotas con Mercado Pago.
//
// createPaymentLink (callable): genera el link de pago de una cuota puntual.
// mpWebhook (HTTP): Mercado Pago avisa cada pago; si está aprobado, la cuota se marca pagada sola.
//
// Configuración (ver CONFIGURACION.md):
//   firebase functions:secrets:set MP_ACCESS_TOKEN      -> Access Token de producción de la cuenta del profe
//   firebase functions:secrets:set MP_WEBHOOK_SECRET    -> "Clave secreta" de Webhooks en Mercado Pago Developers
//   functions/.env  -> APP_URL=https://tu-app.vercel.app   MP_COACH_ID=<uid del profe>
const { onCall, onRequest, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { parseExternalReference, isValidSignature, buildPreference, argentinaDate, mpFetch } = require('./mp');

initializeApp();
const db = getFirestore();

const REGION = 'southamerica-east1';
const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN');
const MP_WEBHOOK_SECRET = defineSecret('MP_WEBHOOK_SECRET');
const APP_URL = defineString('APP_URL');
// Uid del profe dueño de la cuenta de Mercado Pago (el token cobra a su nombre).
const MP_COACH_ID = defineString('MP_COACH_ID', { default: '' });

const webhookUrl = () => `https://${REGION}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/mpWebhook`;

exports.createPaymentLink = onCall({ region: REGION, secrets: [MP_ACCESS_TOKEN] }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Iniciá sesión para pagar.');
  const paymentId = String(request.data?.paymentId || '');
  if (!paymentId) throw new HttpsError('invalid-argument', 'Falta la cuota a pagar.');

  const userSnap = await db.doc(`users/${request.auth.uid}`).get();
  if (!userSnap.exists) throw new HttpsError('permission-denied', 'Tu cuenta no está vinculada.');
  const profile = userSnap.data();
  const coachId = profile.coachId;
  if (MP_COACH_ID.value() && coachId !== MP_COACH_ID.value()) {
    throw new HttpsError('failed-precondition', 'El cobro con Mercado Pago no está habilitado para este profe.');
  }

  const [coachSnap, paymentSnap] = await Promise.all([
    db.doc(`coaches/${coachId}`).get(),
    db.doc(`coaches/${coachId}/payments/${paymentId}`).get()
  ]);
  if (!coachSnap.exists || !coachSnap.data().mpEnabled) {
    throw new HttpsError('failed-precondition', 'El profe no tiene activado el cobro con Mercado Pago.');
  }
  if (!paymentSnap.exists) throw new HttpsError('not-found', 'No se encontró la cuota.');
  const payment = paymentSnap.data();
  if (profile.role === 'student' && payment.studentId !== profile.studentId) {
    throw new HttpsError('permission-denied', 'Esa cuota no es tuya.');
  }
  if (payment.status === 'paid') throw new HttpsError('failed-precondition', 'Esa cuota ya está pagada.');
  if (!(Number(payment.amount) > 0)) throw new HttpsError('failed-precondition', 'La cuota no tiene monto.');

  const preference = buildPreference({
    coachId, paymentId, payment,
    coachName: coachSnap.data().name,
    appUrl: APP_URL.value().replace(/\/$/, ''),
    notificationUrl: webhookUrl()
  });

  try {
    const pref = await mpFetch('/checkout/preferences', MP_ACCESS_TOKEN.value(), {
      method: 'POST',
      body: JSON.stringify(preference)
    });
    await paymentSnap.ref.update({ mpPreferenceId: pref.id, mpLinkCreatedAt: FieldValue.serverTimestamp() });
    return { initPoint: pref.init_point };
  } catch (e) {
    logger.error('Error creando preferencia MP', e);
    throw new HttpsError('unavailable', 'Mercado Pago no respondió. Probá de nuevo o pagá por transferencia.');
  }
});

exports.mpWebhook = onRequest({ region: REGION, secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET] }, async (req, res) => {
  const type = req.query.type || req.query.topic || req.body?.type;
  const dataId = req.query['data.id'] || req.body?.data?.id || req.query.id;
  if (type !== 'payment' || !dataId) {
    res.status(200).send('ignored');
    return;
  }

  if (!isValidSignature({
    signatureHeader: req.get('x-signature'),
    requestId: req.get('x-request-id'),
    dataId,
    secret: MP_WEBHOOK_SECRET.value()
  })) {
    logger.warn('Firma de Mercado Pago inválida', { dataId });
    res.status(401).send('invalid signature');
    return;
  }

  try {
    // Nunca se confía en el cuerpo de la notificación: se consulta el pago a Mercado Pago.
    const mpPayment = await mpFetch(`/v1/payments/${encodeURIComponent(dataId)}`, MP_ACCESS_TOKEN.value());
    const ref = parseExternalReference(mpPayment.external_reference);
    if (!ref) {
      res.status(200).send('no reference');
      return;
    }
    const paymentRef = db.doc(`coaches/${ref.coachId}/payments/${ref.paymentId}`);
    const snap = await paymentRef.get();
    if (!snap.exists) {
      res.status(200).send('unknown payment');
      return;
    }
    const payment = snap.data();

    if (mpPayment.status !== 'approved') {
      await paymentRef.update({ mpStatus: mpPayment.status, mpPaymentId: String(mpPayment.id) });
      res.status(200).send('not approved');
      return;
    }
    if (payment.status === 'paid') {
      res.status(200).send('already paid');
      return;
    }
    if (Number(mpPayment.transaction_amount) + 0.01 < Number(payment.amount)) {
      await paymentRef.update({ mpStatus: 'amount_mismatch', mpPaymentId: String(mpPayment.id) });
      logger.warn('Monto pagado menor a la cuota', { paymentId: ref.paymentId, paid: mpPayment.transaction_amount });
      res.status(200).send('amount mismatch');
      return;
    }

    const paidDate = argentinaDate(mpPayment.date_approved);
    await paymentRef.update({
      status: 'paid',
      paidDate,
      method: 'Mercado Pago',
      mpStatus: 'approved',
      mpPaymentId: String(mpPayment.id),
      receiptUrl: null,
      notes: `Pago acreditado automáticamente por Mercado Pago (operación ${mpPayment.id}).`
    });
    if (payment.studentId) {
      await db.doc(`coaches/${ref.coachId}/students/${payment.studentId}`)
        .set({ lastPaymentDate: paidDate }, { merge: true });
    }
    res.status(200).send('ok');
  } catch (e) {
    logger.error('Error procesando webhook MP', e);
    // 500 para que Mercado Pago reintente la notificación.
    res.status(500).send('error');
  }
});
