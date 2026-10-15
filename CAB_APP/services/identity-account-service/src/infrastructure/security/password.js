'use strict';
const crypto = require('node:crypto');
const argon2 = require('argon2');
const parameters = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1, hashLength: 32 };
function hash(password) { return argon2.hash(password, { ...parameters, salt: crypto.randomBytes(16) }); }
async function verify(encoded, password) { try { return await argon2.verify(encoded, password); } catch { return false; } }
module.exports = { hash, verify, parameters };
