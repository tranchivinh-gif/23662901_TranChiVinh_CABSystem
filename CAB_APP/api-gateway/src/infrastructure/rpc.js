'use strict';
const grpc = require('@grpc/grpc-js');
function unary(client, method, payload, correlationId, timeoutMs, accessToken) {
  const metadata = new grpc.Metadata();
  metadata.set('x-correlation-id', correlationId);
  if (accessToken) metadata.set('authorization','Bearer '+accessToken);
  return new Promise((resolve, reject) => client[method](payload, metadata, { deadline: Date.now() + timeoutMs },
    (error, result) => error ? reject(error) : resolve(result)));
}
module.exports = { unary };
