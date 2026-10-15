'use strict';
const path = require('node:path');
function getConfig(env = process.env) {
  const port = Number(env.CUSTOMER_GRPC_PORT ?? 9092);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid CUSTOMER_GRPC_PORT');
  return { name: 'customer-service', host: env.GRPC_BIND_HOST || '127.0.0.1', port, protoRoot: path.resolve(__dirname, '../../../../contracts/proto') };
}
module.exports = { getConfig };
