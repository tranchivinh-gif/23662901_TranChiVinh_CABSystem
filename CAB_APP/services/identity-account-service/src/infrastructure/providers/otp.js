'use strict';
function createOtpProvider(env = process.env) {
  if (env.CAB_PROFILE !== 'demo-test' || env.NODE_ENV === 'production') throw new Error('MockOtpProvider requires non-production demo-test profile');
  return { async send() { return '123456'; }, ttlSeconds:300, maxWrongAttempts:5 };
}
module.exports = { createOtpProvider };
