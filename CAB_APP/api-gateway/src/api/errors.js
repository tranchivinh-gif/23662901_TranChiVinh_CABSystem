'use strict';
const grpc = require('@grpc/grpc-js');
const errors = new Map([
  [grpc.status.INVALID_ARGUMENT, [400, 'INVALID_ARGUMENT', 'Invalid request']],
  [grpc.status.UNAUTHENTICATED, [401, 'UNAUTHENTICATED', 'Authentication required']],
  [grpc.status.PERMISSION_DENIED, [403, 'FORBIDDEN', 'Permission denied']],
  [grpc.status.NOT_FOUND, [404, 'NOT_FOUND', 'Resource not found']],
  [grpc.status.ALREADY_EXISTS, [409, 'CONFLICT', 'Resource already exists']],
  [grpc.status.FAILED_PRECONDITION, [409, 'FAILED_PRECONDITION', 'Operation is not allowed in the current state']],
  [grpc.status.ABORTED, [409, 'CONFLICT', 'Concurrent operation conflict']],
  [grpc.status.RESOURCE_EXHAUSTED, [429, 'RESOURCE_EXHAUSTED', 'Too many requests']],
  [grpc.status.UNIMPLEMENTED, [501, 'NOT_IMPLEMENTED', 'Operation is scheduled for a later checkpoint']],
  [grpc.status.UNAVAILABLE, [503, 'SERVICE_UNAVAILABLE', 'Required service is unavailable']],
  [grpc.status.DEADLINE_EXCEEDED, [504, 'DEADLINE_EXCEEDED', 'Required service timed out']],
]);
function sendError(res, correlationId, status, code, message, details) {
  return res.status(status).json({ code, message, correlationId, ...(details ? { details } : {}) });
}
function rpcError(res, correlationId, error) {
  const [status, fallback, message] = errors.get(error.code) || [500, 'INTERNAL_ERROR', 'Internal server error'];
  const supplied=error.metadata?.get('cab-error-code')?.[0];
  const allowed=['INVALID_PHONE_NUMBER','INVALID_OTP_PURPOSE','OTP_INVALID','OTP_EXPIRED','OTP_ATTEMPTS_EXCEEDED','REGISTRATION_CONTEXT_REQUIRED','REGISTRATION_CONTEXT_INVALID','PHONE_NUMBER_ALREADY_EXISTS','INVALID_CREDENTIALS','ACCOUNT_NOT_ACTIVE','REFRESH_TOKEN_INVALID'];
  allowed.push('INVALID_SERVICE_TYPE','SERVICE_TYPE_DISABLED','IDEMPOTENCY_KEY_REUSED','FARE_RULE_UNAVAILABLE','MAP_PROVIDER_UNAVAILABLE','FARE_OUT_OF_RANGE','TRIP_PROVISIONING_FAILED','OFFER_UNAVAILABLE','MATCHING_POLICY_INVALID','ASSIGNMENT_PENDING');
  allowed.push('INVALID_WEBHOOK_SIGNATURE','WEBHOOK_REPLAY_REJECTED','PAYMENT_CALLBACK_MISMATCH','PAYMENT_RETRY_LIMIT_REACHED','PAYMENT_NOT_RETRYABLE','PAYMENT_METHOD_MISMATCH','PAYMENT_METHOD_UNAVAILABLE','PAYMENT_AMOUNT_UNAVAILABLE','PAYMENT_PROVIDER_UNAVAILABLE','TRIP_NOT_COMPLETED');
  const code=allowed.includes(supplied)?supplied:fallback;
  if (status === 429) res.set('Retry-After', '1');
  return sendError(res, correlationId, status, code, message);
}
module.exports = { sendError, rpcError };
