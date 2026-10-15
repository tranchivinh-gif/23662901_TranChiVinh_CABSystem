'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const { createIdentityClient } = require('./infrastructure/identity-client');
const { createCustomerClient } = require('./infrastructure/customer-client');
const { createTripHandler } = require('./api/create-trip');
const { createTripService } = require('./application/create-trip');
const { createMatchingVerifier } = require('./infrastructure/matching-token');
const { matchingHandler } = require('./api/matching');
const { createMatching } = require('./application/matching');
const {createLifecycleClients}=require('./infrastructure/lifecycle-clients');
const {createLifecycle}=require('./application/lifecycle');
const {handler}=require('./api/operations');
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
  let identity,customer,clients,lifecycle;
  try{if(pool){const env=options.env || process.env;identity=createIdentityClient(config,env);customer=createCustomerClient(config,env);
    handlers.createTrip=createTripHandler(createTripService(pool,identity,customer.get),env);
    handlers.applyMatching=matchingHandler(createMatching(pool),createMatchingVerifier(env));
    clients=createLifecycleClients(config,env);lifecycle=createLifecycle({pool,clients});
    for(const method of ['getTrip','transition','cancelTrip','rateTrip'])handlers[method]=handler(lifecycle[method]);
  }}catch(error){identity?.close();customer?.close();clients?.close();await pool?.end();throw error;}
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown();identity?.close();customer?.close();clients?.close();await pool?.end();throw error; }
  if(lifecycle && options.lifecycle!==false)lifecycle.start();
  if(pool){events=createEventsRuntime({pool,service:'trip-service',env:options.env || process.env,afterPublish:options.afterPublish});events?.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    if (!closing) closing = new Promise((resolve) => {
      const timer = setTimeout(() => { server.forceShutdown(); resolve(); }, 1000);
      timer.unref();
      server.tryShutdown(() => { clearTimeout(timer); resolve(); });
    }).then(stopEvents).then(async() => {await lifecycle?.stop();identity?.close();customer?.close();clients?.close();return pool?.end();});
    return closing;
  }
  return { events, server, port, address: config.host + ':' + port, stop, lifecycle };
}
module.exports = { start };
