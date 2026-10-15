'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const {createClients}=require('./infrastructure/clients');
const {createProvider}=require('./infrastructure/provider');
const {createOperations}=require('./application/operations');
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
  let clients;
  try { if(pool){const env=options.env || process.env;if(!options.provider && (env.CAB_PROFILE!=='demo-test' || env.NODE_ENV==='production'))throw new Error('Configure a payment provider adapter for this deployment');clients=createClients(config,env);const operations=createOperations({pool,clients,provider:options.provider || createProvider(pool),secret:env.CAB_PAYMENT_WEBHOOK_SECRET});for(const method of Object.keys(operations))handlers[method]=handler(operations[method],method==='handleCallback');} }
  catch(error){clients?.close();await pool?.end();throw error;}
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown(); clients?.close();await pool?.end(); throw error; }
  if(pool){events=createEventsRuntime({pool,service:'payment-service',env:options.env || process.env,topics:["cab.trip.events.v1"],handle:require("./application/events").createCompletedConsumer(),afterPublish:options.afterPublish});events?.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    if (!closing) closing = new Promise((resolve) => {
      const timer = setTimeout(() => { server.forceShutdown(); resolve(); }, 1000);
      timer.unref();
      server.tryShutdown(() => { clearTimeout(timer); resolve(); });
    }).then(stopEvents).then(() => {clients?.close();return pool?.end();});
    return closing;
  }
  return { events, server, port, address: config.host + ':' + port, stop };
}
module.exports = { start };
