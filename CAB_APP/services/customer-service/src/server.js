'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const { createPii } = require('./infrastructure/security/pii');
const { createProfileService } = require('./application/create-profile');
const { createProfileHandler } = require('./api/create-profile');
const { createIdentityClient } = require('./infrastructure/identity-client');
const { createLookup } = require('./application/lookup');
const { createLookupHandler } = require('./api/lookup');
const { createByAccount } = require('./application/by-account');
const {createEventsRuntime}=require('../../../lib/events/runtime');
const {eventMetrics}=require('../../../lib/events/health');
async function start(config = getConfig(), options = {}) {
  const contracts = loadContracts(config.protoRoot);
  const pool = options.isReady ? null : createPool(options.env || process.env);
  pool?.on('error', () => {});
  const isReady = options.isReady || createReadinessProbe(pool);
  const server = new grpc.Server();
  let events;
  server.addService(contracts.health.service, { check: createHealthHandler(config.name, isReady),eventMetrics:eventMetrics(()=>events) });
  const handlers = Object.fromEntries(Object.values(contracts.business.service).map((method) => [method.originalName, (_call, callback) => {
    callback({ code: grpc.status.UNIMPLEMENTED, details: 'Business RPC is scheduled for a later checkpoint' });
  }]));
  let identity;
  try {
    if (pool) {
      const env = options.env || process.env, pii = createPii(env);
      handlers.createProfile = createProfileHandler(createProfileService(pool, pii), env);
      identity = createIdentityClient(config, env);
      handlers.resolveAccount=createLookupHandler(require("./application/resolve-account").createResolveAccount(pool,require("../../../lib/events/service-token").createResolverVerifier(env)));
      handlers.getCustomer = createLookupHandler(createLookup(pool, pii, identity));
      handlers.getByAccount = createLookupHandler(createByAccount(pool, identity));
    }
  } catch(error) {identity?.close();await pool?.end();throw error;}
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown(); identity?.close(); await pool?.end(); throw error; }
  if(pool){events=createEventsRuntime({pool,service:'customer-service',env:options.env || process.env,afterPublish:options.afterPublish});events?.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    if (!closing) closing = new Promise((resolve) => {
      const timer = setTimeout(() => { server.forceShutdown(); resolve(); }, 1000);
      timer.unref();
      server.tryShutdown(() => { clearTimeout(timer); resolve(); });
    }).then(stopEvents).then(() => { identity?.close(); return pool?.end(); });
    return closing;
  }
  return { events, server, port, address: config.host + ':' + port, stop };
}
module.exports = { start };
