'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const {createClients}=require('./infrastructure/clients');
const {createPii}=require('./infrastructure/pii');
const {createRead}=require('./application/read');
const {createDelivery}=require('./application/delivery');
const {createPush}=require('./infrastructure/push');
const {createNotificationConsumer}=require('./application/consume');
const {handler:createLookupHandler}=require('./api/operations');
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
  let clients,delivery,consume;
  try{if(pool){const env=options.env || process.env;if(!options.provider && (env.CAB_PROFILE!=='demo-test' || env.NODE_ENV==='production'))throw new Error('Configure a Push provider adapter for this deployment');
    clients=createClients(config,env);const pii=createPii(env);
    for(const [name,action] of Object.entries(createRead({pool,clients,pii})))handlers[name]=createLookupHandler(action);
    consume=createNotificationConsumer({clients,pii});delivery=createDelivery({pool,provider:options.provider || createPush(pool),pii});
  }}catch(error){clients?.close();await pool?.end();throw error;}
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown(); clients?.close();await pool?.end(); throw error; }
  if(pool){events=createEventsRuntime({pool,service:'notification-service',env:options.env || process.env,topics:require('../../../lib/events/config').topics.filter(topic=>topic!=='cab.audit.events.v1'),handle:consume,afterPublish:options.afterPublish});events?.start();if(options.delivery!==false)delivery.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    if (!closing) closing = new Promise((resolve) => {
      const timer = setTimeout(() => { server.forceShutdown(); resolve(); }, 1000);
      timer.unref();
      server.tryShutdown(() => { clearTimeout(timer); resolve(); });
    }).then(stopEvents).then(async() => {await delivery?.stop();clients?.close();await pool?.end();});
    return closing;
  }
  return { events, delivery, server, port, address: config.host + ':' + port, stop };
}
module.exports = { start };
