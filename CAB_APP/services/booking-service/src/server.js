'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const { createClients } = require('./infrastructure/clients');
const { createPii } = require('./infrastructure/pii');
const { createGeoProvider } = require('./infrastructure/providers/geo');
const { createOperations } = require('./application/operations');
const { handler } = require('./api/operations');
const { createMatching } = require('./application/matching');
const {createTripOperations}=require('./application/trip');
const {createTripVerifier}=require('./infrastructure/trip-token');
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
  let clients,matching;
  try {
    if(pool){const env=options.env || process.env;clients=createClients(config,env);
      const pii=createPii(env);matching=createMatching({pool,clients,pii});
      const operations=createOperations({pool,clients,pii,geo:options.geo || createGeoProvider(env),matching});
      operations.actOnOffer=matching.actOnOffer;operations.getDriverOffers=matching.getDriverOffers;
      Object.assign(operations,createTripOperations({pool,clients,matching,verify:createTripVerifier(env)}));
      operations.acceptOffer=async(request,context)=>{const value=await matching.actOnOffer({...request,decision:'ACCEPT'},context);return {bookingId:value.bookingId,driverId:value.driverId,tripId:value.tripId,status:'ASSIGNED'};};
      operations.rejectOffer=async(request,context)=>{await matching.actOnOffer({...request,decision:'REJECT'},context);return {};};
      Object.assign(handlers,Object.fromEntries(Object.entries(operations).map(([name,action])=>[name,handler(action)])));
    }
  } catch(error){clients?.close();await pool?.end();throw error;}
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown(); clients?.close(); await pool?.end(); throw error; }
  if(matching && options.matching!==false)matching.start();
  if(pool){events=createEventsRuntime({pool,service:'booking-service',env:options.env || process.env,afterPublish:options.afterPublish});events?.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    if (!closing) closing = new Promise((resolve) => {
      const timer = setTimeout(() => { server.forceShutdown(); resolve(); }, 1000);
      timer.unref();
      server.tryShutdown(() => { clearTimeout(timer); resolve(); });
    }).then(stopEvents).then(async() => {await matching?.stop();clients?.close();return pool?.end();});
    return closing;
  }
  return { events, server, port, address: config.host + ':' + port, matching, stop };
}
module.exports = { start };
