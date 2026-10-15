'use strict';
const { sendError, rpcError } = require('./errors');
const { routeAllowed } = require('./authorization');
function registerLookupRoutes(app, runtime) {
  app.get('/drivers/me', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!runtime.auth) return sendError(res, req.correlationId, 501, 'NOT_IMPLEMENTED', 'Authentication is not configured');
    let actor;
    try { actor = runtime.auth.verify(req); }
    catch { return sendError(res, req.correlationId, 401, 'UNAUTHENTICATED', 'Authentication required'); }
    if (actor.role !== 'DRIVER') return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
    try {
      const deadline = Date.now() + 1800;
      const decision = await runtime.invoke('identity-account-service', 'authorizeAccess', { permission: 'driver:read' }, req.correlationId, 700, actor.token);
      if (decision.accountId !== actor.sub || decision.role !== actor.role) return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
      if (!(await runtime.serviceHealth('driver-service', req.correlationId)).ready) return sendError(res, req.correlationId, 503, 'SERVICE_UNAVAILABLE', 'Required service is unavailable');
      const profile = await runtime.invoke('driver-service', 'getProfileByAccount', { id: actor.sub }, req.correlationId, Math.min(500, Math.max(1, deadline - Date.now())), actor.token);
      const value = await runtime.invoke('driver-service', 'getDriver', { id: profile.driverId }, req.correlationId, Math.min(800, Math.max(1, deadline - Date.now())), actor.token);
      return res.json({ driverId: value.driverId, fullName: value.fullName, phoneNumber: value.phoneNumber, approvalStatus: value.status, availability: value.availability });
    } catch (error) { return rpcError(res, req.correlationId, error); }
  });
  app.get('/customers/me', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!runtime.auth) return sendError(res, req.correlationId, 501, 'NOT_IMPLEMENTED', 'Authentication is not configured');
    let actor;
    try { actor = runtime.auth.verify(req); }
    catch { return sendError(res, req.correlationId, 401, 'UNAUTHENTICATED', 'Authentication required'); }
    if (actor.role !== 'CUSTOMER') return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
    try {
      const deadline = Date.now() + 1800;
      const decision = await runtime.invoke('identity-account-service', 'authorizeAccess', { permission: 'customer:read' }, req.correlationId, 700, actor.token);
      if (decision.accountId !== actor.sub || decision.role !== actor.role) return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
      if (!(await runtime.serviceHealth('customer-service', req.correlationId)).ready) return sendError(res, req.correlationId, 503, 'SERVICE_UNAVAILABLE', 'Required service is unavailable');
      const profile = await runtime.invoke('customer-service', 'getByAccount', { id: actor.sub }, req.correlationId, Math.min(500, Math.max(1, deadline - Date.now())), actor.token);
      const value = await runtime.invoke('customer-service', 'getCustomer', { id: profile.customerId }, req.correlationId, Math.min(800, Math.max(1, deadline - Date.now())), actor.token);
      return res.json({ customerId: value.customerId, fullName: value.fullName, ...(value.phoneNumber?{phoneNumber:value.phoneNumber}:{}), ...(value.email ? { email: value.email } : {}) });
    } catch (error) { return rpcError(res, req.correlationId, error); }
  });
  for (const [path, parameter, owner, method, permission, operation] of [
    ['/customers/:customerId', 'customerId', 'customer-service', 'getCustomer', 'customer:read', 'getCustomerById'],
    ['/drivers/:driverId', 'driverId', 'driver-service', 'getDriver', 'driver:read', 'getDriverById'],
  ]) {
    app.get(path, async (req, res) => {
      res.set('Cache-Control', 'no-store');
      if (!runtime.auth) return sendError(res, req.correlationId, 501, 'NOT_IMPLEMENTED', 'Authentication is not configured');
      let actor;
      try { actor = runtime.auth.verify(req); }
      catch { return sendError(res, req.correlationId, 401, 'UNAUTHENTICATED', 'Authentication required'); }
      if (!routeAllowed(operation, actor.role)) return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
      try {
        const deadline = Date.now() + 1800;
        const decision = await runtime.invoke('identity-account-service', 'authorizeAccess', { permission }, req.correlationId, 700, actor.token);
        if (decision.accountId !== actor.sub || decision.role !== actor.role) return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
        if (!(await runtime.serviceHealth(owner, req.correlationId)).ready) return sendError(res, req.correlationId, 503, 'SERVICE_UNAVAILABLE', 'Required service is unavailable');
        const value = await runtime.invoke(owner, method, { id: req.params[parameter] }, req.correlationId, Math.min(1000, Math.max(1, deadline - Date.now())), actor.token);
        const body = parameter === 'customerId'
          ? { customerId: value.customerId, fullName: value.fullName, ...(value.phoneNumber?{phoneNumber:value.phoneNumber}:{}), ...(value.email ? { email: value.email } : {}) }
          : { driverId: value.driverId, fullName: value.fullName, phoneNumber: value.phoneNumber, approvalStatus: value.status, availability: value.availability };
        return res.json(body);
      } catch (error) { return rpcError(res, req.correlationId, error); }
    });
  }
}
module.exports = { registerLookupRoutes };
