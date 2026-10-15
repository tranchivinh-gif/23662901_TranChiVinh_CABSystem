'use strict';
const grpc = require('@grpc/grpc-js');
const { getConfig } = require('./config');
const { loadContracts } = require('./infrastructure/contracts');
const { createHealthHandler } = require('./api/health');
const { createPool } = require('./infrastructure/database/pool');
const { createReadinessProbe } = require('./infrastructure/database/readiness');
const { createPii } = require('./infrastructure/security/pii');
const passwords = require('./infrastructure/security/password');
const { createTokens } = require('./infrastructure/security/tokens');
const { createOtpProvider } = require('./infrastructure/providers/otp');
const { createCustomerClient } = require('./infrastructure/customer-client');
const { createAuthService } = require('./application/auth-service');
const { createAuthHandlers } = require('./api/auth');
const { createAuthorizeAccess } = require('./application/authorize-access');
const { createDriverClient } = require('./infrastructure/driver-client');
const { createDriverRegistration } = require('./application/driver-registration');
const { createMatchingAccess } = require('./application/matching-access');
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
  let profiles, drivers;
  try {
    if (pool) {
      const env=options.env || process.env;
      const tokens=createTokens(env);
      profiles=createCustomerClient(config,tokens,env);
      Object.assign(handlers,createAuthHandlers(createAuthService({pool,pii:createPii(env),passwords,tokens,otpProvider:createOtpProvider(env),profiles})));
      const authorize = createAuthorizeAccess(pool,tokens);
      drivers = createDriverClient(config,tokens,env);
      Object.assign(handlers, createAuthHandlers({ authorizeAccess: authorize,
        ...createMatchingAccess(pool,tokens,env),
        ...require("./application/event-access").createEventAccess(pool,tokens,require("../../../lib/events/service-token").createResolverVerifier(env),env),
        ...createDriverRegistration({pool,pii:createPii(env),passwords,drivers,authorize,env}) }));
    }
  } catch(error) { profiles?.close();drivers?.close();await pool?.end();throw error; }
  server.addService(contracts.business.service, handlers);
  let port;
  try {
    port = await new Promise((resolve, reject) => server.bindAsync(
      config.host + ':' + config.port, grpc.ServerCredentials.createInsecure(),
      (error, boundPort) => error ? reject(error) : resolve(boundPort),
    ));
  } catch (error) { server.forceShutdown(); profiles?.close(); drivers?.close(); await pool?.end(); throw error; }
  if(pool){events=createEventsRuntime({pool,service:'identity-account-service',env:options.env || process.env,topics:["cab.audit.events.v1"],handle:require("./application/events").createAuditConsumer(),afterPublish:options.afterPublish});events?.start();}
  let closing;
  function stop() {
    const stopEvents=()=>events?.stop();
    if (!closing) closing = new Promise((resolve) => {
      const timer = setTimeout(() => { server.forceShutdown(); resolve(); }, 1000);
      timer.unref();
      server.tryShutdown(() => { clearTimeout(timer); resolve(); });
    }).then(stopEvents).then(async () => { profiles?.close(); drivers?.close(); await pool?.end(); });
    return closing;
  }
  return { events, server, port, address: config.host + ':' + port, stop };
}
module.exports = { start };
