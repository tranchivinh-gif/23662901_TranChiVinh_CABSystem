'use strict';
const routes = require('./routes.json');
const { sendError, rpcError } = require('./errors');
const { routeAllowed } = require('./authorization');
function registerRoutes(app, dependencies) {
  for (const route of routes.filter(item => !['getCustomerById', 'getDriverById'].includes(item.operationId))) app[route.method](route.path, async (req, res) => {
    const deadline = Date.now() + 1800;
    // Authenticate and apply route roles before returning deferred-operation responses.
    if (!route.public && dependencies.auth) {
      try { req.actor=dependencies.auth.verify(req); }
      catch { return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required'); }
      if (!routeAllowed(route.operationId, req.actor.role)) return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
    }
    // Public Identity operations need a checkpoint-specific wire adapter before they can be enabled.
    if (dependencies.auth && route.public && route.owner==='identity-account-service') return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Operation is scheduled for a later checkpoint');
    if (!route.public || !route.rpc) return sendError(res, req.correlationId, 501, 'NOT_IMPLEMENTED', 'Operation is scheduled for a later checkpoint');
    const health = await dependencies.serviceHealth(route.owner, req.correlationId);
    if (!health.ready) return sendError(res, req.correlationId, 503, 'SERVICE_UNAVAILABLE', 'Required service is unavailable');
    const payload = { ...(req.body || {}) };
    if (route.rpc === 'requestOtp') payload.purpose = route.operationId.includes('Driver') ? 'DRIVER_REGISTRATION' : 'CUSTOMER_REGISTRATION';
    if (route.operationId === 'paymentWebhook') payload.provider = req.params.provider;
    try {
      await dependencies.invoke(route.owner, route.rpc, payload, req.correlationId, Math.min(1500, Math.max(1, deadline - Date.now())));
      // A transport success cannot stand in for future business/wire contract implementation.
      return sendError(res, req.correlationId, 501, 'NOT_IMPLEMENTED', 'Operation is scheduled for a later checkpoint');
    } catch (error) { return rpcError(res, req.correlationId, error); }
  });
}
module.exports = { routes, registerRoutes };
