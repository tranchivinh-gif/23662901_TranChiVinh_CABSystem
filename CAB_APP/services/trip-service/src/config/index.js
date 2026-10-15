'use strict';
const path = require('node:path');
function getConfig(env = process.env) {
  const port = Number(env.TRIP_GRPC_PORT ?? 9095);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid TRIP_GRPC_PORT');
  return { name: 'trip-service', host: env.GRPC_BIND_HOST || '127.0.0.1', port, protoRoot: path.resolve(__dirname, '../../../../contracts/proto') };
}
module.exports = { getConfig };
