// Lógica pura de Mercado Pago (sin Firebase) para poder testearla.
const crypto = require('crypto');

const MP_API = 'https://api.mercadopago.com';

// "coachId|paymentId" -> { coachId, paymentId }
function parseExternalReference(ref) {
  if (typeof ref !== 'string') return null;
  const [coachId, paymentId] = ref.split('|');
  if (!coachId || !paymentId) return null;
  return { coachId, paymentId };
}

// Valida la firma x-signature que manda Mercado Pago en cada notificación.
// Formato: "ts=1704908010,v1=618c8534..."  ->  HMAC-SHA256 de "id:{dataId};request-id:{xRequestId};ts:{ts};"
function isValidSignature({ signatureHeader, requestId, dataId, secret }) {
  if (!secret) return true; // sin secreto configurado no se valida (igual se re-consulta el pago a MP)
  if (!signatureHeader || !dataId) return false;
  const parts = {};
  String(signatureHeader).split(',').forEach(p => {
    const [k, v] = p.split('=').map(x => (x || '').trim());
    if (k) parts[k] = v;
  });
  if (!parts.ts || !parts.v1) return false;
  let manifest = `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(parts.v1, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function buildPreference({ coachId, paymentId, payment, coachName, appUrl, notificationUrl }) {
  return {
    items: [{
      id: paymentId,
      title: `Cuota ${payment.monthPeriod}${coachName ? ` - Prof. ${coachName}` : ''}`,
      quantity: 1,
      unit_price: Number(payment.amount),
      currency_id: 'ARS'
    }],
    external_reference: `${coachId}|${paymentId}`,
    notification_url: notificationUrl,
    back_urls: {
      success: `${appUrl}/?mp=ok`,
      pending: `${appUrl}/?mp=pending`,
      failure: `${appUrl}/?mp=error`
    },
    auto_return: 'approved',
    statement_descriptor: 'CUOTA ENTRENAMIENTO'
  };
}

// Fecha YYYY-MM-DD en hora de Argentina.
function argentinaDate(iso) {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(d);
}

async function mpFetch(path, token, options = {}) {
  const res = await fetch(`${MP_API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Mercado Pago respondió ${res.status}: ${body.message || 'error'}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

module.exports = { parseExternalReference, isValidSignature, buildPreference, argentinaDate, mpFetch };
