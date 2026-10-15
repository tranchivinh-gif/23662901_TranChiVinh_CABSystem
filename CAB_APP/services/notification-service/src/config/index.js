'use strict';
const path = require('node:path');
function getConfig(env = process.env) {
  const port = Number(env.NOTIFICATION_GRPC_PORT ?? 9097);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid NOTIFICATION_GRPC_PORT');
  return { name: 'notification-service', host: env.GRPC_BIND_HOST || '127.0.0.1', port, protoRoot: path.resolve(__dirname, '../../../../contracts/proto') };
}
module.exports = { getConfig };
