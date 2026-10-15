'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const { createPii } = require('./infrastructure/security/pii');
const { createIdentityClient } = require('./infrastructure/identity-client');
const { createLookup } = require('./application/lookup');
const { createLookupHandler } = require('./api/lookup');
const { createServiceVerifier } = require('./infrastructure/security/service-token');
const { createProfile } = require('./application/profile');
const { createOperations } = require('./application/operations');
const { createAssignment } = require('./application/assignment');
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
  let identity, heartbeatTimer, sweep;
  try {
    if (pool) {
      const env = options.env || process.env;
      identity = createIdentityClient(config, env);
      handlers.resolveAccount=createLookupHandler(require("./application/resolve-account").createResolveAccount(pool,require("../../../lib/events/service-token").createResolverVerifier(env)));
      const pii=createPii(env),verify=createServiceVerifier(env),operations=createOperations(pool,pii,identity,verify);
      Object.assign(operations,createAssignment(pool,identity,verify));
      handlers.getDriver = createLookupHandler(createLookup(pool, pii, identity));
      handlers.getProfileByAccount = createLookupHandler(require('./application/profile-by-account').createProfileByAccount(pool, identity));
      handlers.createProfile = createLookupHandler(createProfile(pool,pii,verify));
      for(const [method,action] of Object.entries(operations).filter(([method])=>method!=='expireHeartbeats')) handlers[method]=createLookupHandler(action);
      handlers.approveDriver=createLookupHandler((request,context)=>operations.decideDriver({driverId:request.id,decision:'APPROVE'},context));
      handlers.updateLocation=createLookupHandler(async(request,context)=>{await operations.heartbeat(request,context);return {};});
      sweep=()=>operations.expireHeartbeats().catch(()=>{});
    }
  } catch (error) { identity?.close(); await pool?.end(); throw error; }
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown(); identity?.close(); await pool?.end(); throw error; }
  if(sweep) {
    let pending=false;
    heartbeatTimer=setInterval(async()=>{if(pending)return;pending=true;try{await sweep();}finally{pending=false;}},1000);
    heartbeatTimer.unref();
  }
  if(pool){events=createEventsRuntime({pool,service:'driver-service',env:options.env || process.env,afterPublish:options.afterPublish});events?.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    clearInterval(heartbeatTimer);
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
