'use strict';
const crypto = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createLookupHandler(action) {
  return async (call, callback) => {
    try {
      const authorization = call.metadata.get('authorization'), ids = call.metadata.get('x-correlation-id');
      if (authorization.length !== 1 || !/^Bearer [^\s]+$/i.test(authorization[0]) || authorization[0].length > 8200) throw { code: grpc.status.UNAUTHENTICATED };
      if (ids.length > 1 || (ids.length === 1 && !uuid.test(ids[0]))) throw { code: grpc.status.INVALID_ARGUMENT };
      const context = { token: authorization[0].slice(7), correlationId: ids[0] || crypto.randomUUID(), deadline: Number(call.getDeadline()),
        assertActive() { if (call.cancelled || Date.now() >= this.deadline) throw { code: grpc.status.DEADLINE_EXCEEDED }; } };
      context.assertActive();
      const result = await action(call.request, context);
      context.assertActive();
      const metadata = new grpc.Metadata(); metadata.set('x-correlation-id', context.correlationId); call.sendMetadata(metadata);
      callback(null, result);
    } catch (error) {
      callback({ code: [3, 4, 5, 6, 7, 9, 10, 16].includes(error.code) ? error.code : error.code==='23505'?grpc.status.ALREADY_EXISTS:grpc.status.UNAVAILABLE, details: 'Driver operation could not complete' });
    }
  };
}
module.exports = { createLookupHandler };
