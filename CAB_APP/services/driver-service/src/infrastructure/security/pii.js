'use strict';
const crypto = require('node:crypto');
function createPii(env = process.env) {
  const keyId = env.CAB_PII_ACTIVE_KEY_ID || 'v1';
  const keys = { [keyId]: env['CAB_PII_KEY_' + keyId.toUpperCase()], ...JSON.parse(env.CAB_PII_KEYRING || '{}') };
  const decode = value => { if (!/^[a-f0-9]{64}$/i.test(value || '')) throw new Error('Invalid PII key'); return Buffer.from(value,'hex'); };
  const encryptionKey = decode(keys[keyId]);
  const lookupKey = decode(env.CAB_PII_LOOKUP_HMAC_KEY);
  function hmac(value) { return crypto.createHmac('sha256', lookupKey).update(value).digest(); }
  function encrypt(value, associatedData) {
    const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    cipher.setAAD(Buffer.from(associatedData));
    const ciphertext = Buffer.concat([cipher.update(value,'utf8'),cipher.final()]).toString('base64');
    return { ciphertext, keyId, iv, tag: cipher.getAuthTag() };
  }
  function decrypt(record, associatedData) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', decode(keys[record.keyId]), record.iv);
    decipher.setAAD(Buffer.from(associatedData)); decipher.setAuthTag(record.tag);
    return Buffer.concat([decipher.update(Buffer.from(record.ciphertext,'base64')),decipher.final()]).toString('utf8');
  }
  return { hmac, encrypt, decrypt };
}
module.exports = { createPii };
