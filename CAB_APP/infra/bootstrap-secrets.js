'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const shared = '/run/cab-secrets', privateDir = '/run/cab-private';
const config = path.join(shared, 'config.env');
const publicKey = path.join(shared, 'jwt-public.pem');
const privateKey = path.join(privateDir, 'jwt-private.pem');
const prefixes = ['IDENTITY_ACCOUNT','CUSTOMER','DRIVER','BOOKING','TRIP','PAYMENT','NOTIFICATION'];
const secretNames = ['REDIS_PASSWORD', ...prefixes.flatMap(prefix => [
  `${prefix}_DB_ADMIN_PASSWORD`, `${prefix}_DB_PASSWORD`, `${prefix}_DB_MIGRATION_PASSWORD`]),
  'CAB_PII_KEY_V1','CAB_PII_LOOKUP_HMAC_KEY','CAB_AUTH_RATE_KEY',
  'CAB_BOOKING_SERVICE_SECRET','CAB_TRIP_SERVICE_SECRET',
  'CAB_PAYMENT_WEBHOOK_SECRET','CAB_NOTIFICATION_SERVICE_SECRET'];
fs.mkdirSync(shared, { recursive: true });
fs.mkdirSync(privateDir, { recursive: true });
const existing = [config, publicKey, privateKey].map(file => fs.existsSync(file));
if (existing.every(Boolean)) {
  const lines = fs.readFileSync(config, 'utf8');
  for (const name of secretNames) if (!new RegExp(`^export ${name}=[a-f0-9]{64}$`, 'm').test(lines))
    throw new Error('Invalid persisted demo secrets: ' + name);
  const derived = crypto.createPublicKey(fs.readFileSync(privateKey)).export({type:'spki',format:'pem'});
  if (derived !== fs.readFileSync(publicKey, 'utf8')) throw new Error('Persisted JWT key pair mismatch');
  console.log('Existing demo secrets validated and preserved.');
  process.exit(0);
}
if (existing.some(Boolean)) throw new Error('Incomplete secret volume; repair it before startup');
const pair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }, publicKeyEncoding: { type: 'spki', format: 'pem' } });
fs.writeFileSync(privateKey, pair.privateKey, { flag: 'wx', mode: 0o644 });
fs.writeFileSync(publicKey, pair.publicKey, { flag: 'wx', mode: 0o644 });
const lines = secretNames.map(name => `export ${name}=${crypto.randomBytes(32).toString('hex')}`);
fs.writeFileSync(config, lines.join('\n') + '\n', { flag: 'wx', mode: 0o644 });
console.log('Generated per-database credentials, application keys and local JWT pair in Docker volumes.');
