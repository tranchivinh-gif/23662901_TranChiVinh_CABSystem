'use strict';
// Prints one signed sandbox callback for manual use in Postman.
const { signature } = require('../services/payment-service/src/domain/payment');
const reference = process.argv[2], amount = Number(process.argv[3]), status = process.argv[4] || 'COMPLETED';
if (!/^mock_[0-9a-f-]{36}$/.test(reference || '') || !Number.isSafeInteger(amount) || amount < 0 || !['COMPLETED','FAILED'].includes(status)) {
  console.error('Usage: manual-webhook-sign.js <providerReference> <integerAmount> [COMPLETED|FAILED]');
  process.exit(1);
}
const timestamp = Math.floor(Date.now() / 1000);
console.log(JSON.stringify({
  url: 'http://localhost:8080/api/v1/webhooks/payment/mock',
  headers: { 'Content-Type': 'application/json', 'X-CAB-Timestamp': String(timestamp),
    'X-CAB-Signature': signature(process.env.CAB_PAYMENT_WEBHOOK_SECRET, timestamp, reference, amount, status) },
  body: { providerReference: reference, amount, status },
}, null, 2));
