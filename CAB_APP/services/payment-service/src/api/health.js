'use strict';
const { randomUUID } = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function createHealthHandler(name, isReady = async () => false) {
  return async (call, callback) => {
    const values = call.metadata.get('x-correlation-id');
    if (values.length > 1 || (values.length === 1 && (typeof values[0] !== 'string' || !uuidPattern.test(values[0])))) {
      return callback({ code: grpc.status.INVALID_ARGUMENT, details: 'Invalid correlation ID' });
    }
    const correlationId = values[0] || randomUUID();
    const metadata = new grpc.Metadata();
    metadata.set('x-correlation-id', correlationId);
    call.sendMetadata(metadata);
    let ready = false;
    try { ready = await isReady(); } catch { /* Dependencies never break process liveness. */ }
    callback(null, { name, status: 'SERVING', ready: ready === true, correlationId });
  };
}
module.exports = { createHealthHandler };
