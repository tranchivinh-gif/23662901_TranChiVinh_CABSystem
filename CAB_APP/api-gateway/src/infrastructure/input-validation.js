'use strict';

function normalizeString(value, { field = 'value', maxLength = 512, allowEmpty = false } = {}) {
  if (typeof value !== 'string') throw new Error(`${field}:INVALID_ARGUMENT`);
  const trimmed = value.trim();
  if (!allowEmpty && !trimmed) throw new Error(`${field}:INVALID_ARGUMENT`);
  if (trimmed.length > maxLength) throw new Error(`${field}:INVALID_ARGUMENT`);
  if (/\0/.test(trimmed) || /<\s*(script|iframe|object|embed|svg|img|audio|video)\b/i.test(trimmed) || /(?:on\w+|javascript:|vbscript:|data:\s*text\/html)\s*:/i.test(trimmed)) {
    throw new Error(`${field}:INVALID_ARGUMENT`);
  }
  return trimmed;
}

function normalizeText(value, options = {}) {
  return normalizeString(value, options);
}

function normalizeEmail(value) {
  const email = normalizeString(value, { field: 'email', maxLength: 254, allowEmpty: true });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('email:INVALID_ARGUMENT');
  return email;
}

function normalizeServiceType(value) {
  const normalized = normalizeString(value, { field: 'serviceType', maxLength: 64 });
  if (!/^[A-Za-z0-9_\- ]+$/.test(normalized)) throw new Error('serviceType:INVALID_ARGUMENT');
  return normalized;
}

module.exports = { normalizeString, normalizeText, normalizeEmail, normalizeServiceType };
