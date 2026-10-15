'use strict';
const { createClient } = require('redis');
const { createGrpcClients, targets } = require('./grpc-clients');
const { unary } = require('./rpc');
const { createAuthentication } = require('./authentication');
function createDependencies(env = process.env) {
  const runtime = createGrpcClients(env);
  const port = Number(env.REDIS_PORT ?? 6379);
  if (!Number.isInteger(port) || port < 1 || port > 65535) { runtime.close(); throw new Error('Invalid REDIS_PORT'); }
  if (!env.REDIS_PASSWORD || env.REDIS_PASSWORD === 'CHANGE_ME') { runtime.close(); throw new Error('Missing Redis credential'); }
  const redis = createClient({ password: env.REDIS_PASSWORD, disableOfflineQueue: true,
    socket: { host: env.REDIS_HOST || 'redis', port, connectTimeout: 400,
      reconnectStrategy: () => 250 } });
  // Connectivity errors are reflected in readiness; raw errors may contain internal details.
  redis.on('error', () => {});
  let auth;
  try { auth=env.CAB_JWT_PUBLIC_KEY_PATH?createAuthentication(env,redis):null; }
  catch(error) {runtime.close();throw error;}
  void redis.connect().catch(() => {});
  async function redisHealth() {
    if (!redis.isReady) return { name: 'redis', status: 'UNAVAILABLE', ready: false };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 500);
    try {
      const pong = await redis.withCommandOptions({ abortSignal: controller.signal }).ping();
      return { name: 'redis', status: pong === 'PONG' ? 'SERVING' : 'UNAVAILABLE', ready: pong === 'PONG' };
    } catch { return { name: 'redis', status: 'UNAVAILABLE', ready: false }; }
    finally { clearTimeout(timer); }
  }
  async function serviceHealth(name, correlationId) {
    try {
      const response = await unary(runtime.clients[name].health, 'check', {}, correlationId, 500);
      if (response.name !== name || response.correlationId !== correlationId || response.status !== 'SERVING') {
        return { name, status: 'UNAVAILABLE', ready: false };
      }
      return { name, status: response.ready ? 'SERVING' : 'NOT_READY', ready: response.ready === true };
    } catch { return { name, status: 'UNAVAILABLE', ready: false }; }
  }
  async function snapshot(correlationId) {
    const dependencies = await Promise.all([...targets.map(target => serviceHealth(target.name, correlationId)), redisHealth()]);
    return { ready: dependencies.every(item => item.ready), dependencies };
  }
  return { snapshot, serviceHealth, auth,
    invoke: (name, method, payload, correlationId, timeoutMs, accessToken) => unary(runtime.clients[name].business, method, payload, correlationId, timeoutMs, accessToken),
    close() { runtime.close(); if (redis.isOpen) redis.destroy(); } };
}
module.exports = { createDependencies };
