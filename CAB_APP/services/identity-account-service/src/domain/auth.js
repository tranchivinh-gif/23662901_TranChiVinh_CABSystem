'use strict';
const grpc = require('@grpc/grpc-js');
class AuthError extends Error {
  constructor(code, grpcCode = grpc.status.INVALID_ARGUMENT) { super(code); this.code = code; this.grpcCode = grpcCode; }
}
function fail(code, grpcCode) { throw new AuthError(code, grpcCode); }
function text(value, code = 'INVALID_ARGUMENT') {
  if (typeof value !== 'string' || !value.trim()) fail(code);
  return value;
}
function phone(value) {
  let normalized = text(value).replace(/[\s().-]/g, '');
  if (/^0\d{9}$/.test(normalized)) normalized = '+84' + normalized.slice(1);
  else if (/^84\d{9}$/.test(normalized)) normalized = '+' + normalized;
  else if (/^\d{6,15}$/.test(normalized)) normalized = '+' + normalized;
  if (!/^\+[1-9]\d{5,14}$/.test(normalized)) fail('INVALID_PHONE_NUMBER');
  return normalized;
}
function email(value) {
  const normalized=text(value).trim().toLowerCase();
  if(normalized.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) fail('INVALID_EMAIL');
  return normalized;
}
function purpose(value) {
  if (!['CUSTOMER_REGISTRATION', 'DRIVER_REGISTRATION'].includes(value)) fail('INVALID_OTP_PURPOSE');
  return value;
}
function registration(request) {
  const fullName = text(request.fullName).trim();
  const password = text(request.password);
  return { phone:phone(request.phone), fullName, password, email:email(request.email) };
}
module.exports = { AuthError, fail, text, phone, email, purpose, registration };
