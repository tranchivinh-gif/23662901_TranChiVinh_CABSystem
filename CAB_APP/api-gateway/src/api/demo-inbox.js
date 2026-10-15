'use strict';
const { sendError, rpcError } = require('./errors');

function registerDemoInboxRoutes(app, runtime) {
  for (const [path, role, owner, method] of [
    ['/driver-offers', 'DRIVER', 'booking-service', 'getDriverOffers'],
    ['/notifications', null, 'notification-service', 'listNotifications'],
  ]) app.get(path, async (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (!runtime.auth) return sendError(res, req.correlationId, 501, 'NOT_IMPLEMENTED', 'Authentication is not configured');
    let actor;
    try { actor = runtime.auth.verify(req); }
    catch { return sendError(res, req.correlationId, 401, 'UNAUTHENTICATED', 'Authentication required'); }
    if (role && actor.role !== role) return sendError(res, req.correlationId, 403, 'FORBIDDEN', 'Permission denied');
    const query = req.query;
    if (path === '/driver-offers' && Object.keys(query).length) return sendError(res, req.correlationId, 400, 'INVALID_ARGUMENT', 'Unexpected query');
    let page = 0, limit = 10;
    if (path === '/notifications') {
      if (Object.keys(query).some(key => !['page', 'limit'].includes(key)) ||
          ['page', 'limit'].some(key => query[key] !== undefined &&
            (typeof query[key] !== 'string' || !/^\d+$/.test(query[key]))))
        return sendError(res, req.correlationId, 400, 'INVALID_ARGUMENT', 'Invalid pagination');
      page = query.page === undefined ? 0 : Number(query.page);
      limit = query.limit === undefined ? 10 : Number(query.limit);
      if (!Number.isSafeInteger(page) || page > 2147483647 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100)
        return sendError(res, req.correlationId, 400, 'INVALID_ARGUMENT', 'Invalid pagination');
    }
    try {
      if (!(await runtime.serviceHealth(owner, req.correlationId)).ready)
        return sendError(res, req.correlationId, 503, 'SERVICE_UNAVAILABLE', 'Required service is unavailable');
      const result = await runtime.invoke(owner, method,
        path === '/notifications' ? { pagination: { page, limit } } : {}, req.correlationId, 1200, actor.token);
      if (path === '/driver-offers') return res.json({ items: result.items });
      const items = result.items.map(item => ({
        notificationId: item.notificationId, status: item.status, templateCode: item.templateCode,
        title: item.title, body: item.body, createdAt: item.createdAt,
        content: JSON.parse(item.contentJson),
      }));
      const totalItems = Number(result.meta.totalItems);
      return res.json({ items, page, limit, totalItems,
        totalPages: Number(result.meta.totalPages) });
    } catch (error) { return rpcError(res, req.correlationId, error); }
  });
}
module.exports = { registerDemoInboxRoutes };
