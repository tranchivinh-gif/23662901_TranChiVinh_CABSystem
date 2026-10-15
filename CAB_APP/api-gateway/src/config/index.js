'use strict';
function getConfig(env = process.env) {
  const port = Number(env.GATEWAY_PORT ?? 8080);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid GATEWAY_PORT');
  return { host: env.GATEWAY_HOST || '127.0.0.1', port };
}
module.exports = { getConfig };
