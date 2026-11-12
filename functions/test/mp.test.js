const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');
const { parseExternalReference, isValidSignature, buildPreference, argentinaDate } = require('../mp');

test('parseExternalReference', () => {
  assert.deepStrictEqual(parseExternalReference('abc|pay-1'), { coachId: 'abc', paymentId: 'pay-1' });
  assert.strictEqual(parseExternalReference('sin-separador'), null);
  assert.strictEqual(parseExternalReference(undefined), null);
});

test('isValidSignature acepta la firma correcta y rechaza la incorrecta', () => {
  const secret = 'clave-secreta';
  const ts = '1704908010';
  const manifest = `id:123456;request-id:req-1;ts:${ts};`;
  const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  assert.strictEqual(isValidSignature({ signatureHeader: `ts=${ts},v1=${v1}`, requestId: 'req-1', dataId: '123456', secret }), true);
  assert.strictEqual(isValidSignature({ signatureHeader: `ts=${ts},v1=${'0'.repeat(64)}`, requestId: 'req-1', dataId: '123456', secret }), false);
  assert.strictEqual(isValidSignature({ signatureHeader: '', requestId: 'req-1', dataId: '123456', secret }), false);
  assert.strictEqual(isValidSignature({ signatureHeader: '', dataId: '1', secret: '' }), true);
});

test('buildPreference arma la cuota en pesos con la referencia correcta', () => {
  const p = buildPreference({
    coachId: 'c1', paymentId: 'pay-1', payment: { monthPeriod: 'Noviembre 2026', amount: 46000 },
    coachName: 'Nicolás Larroca', appUrl: 'https://app.test', notificationUrl: 'https://hook.test'
  });
  assert.strictEqual(p.items[0].unit_price, 46000);
  assert.strictEqual(p.items[0].currency_id, 'ARS');
  assert.strictEqual(p.external_reference, 'c1|pay-1');
  assert.strictEqual(p.back_urls.success, 'https://app.test/?mp=ok');
});

test('argentinaDate usa la hora de Buenos Aires', () => {
  assert.strictEqual(argentinaDate('2026-11-06T01:30:00.000Z'), '2026-11-05');
});
