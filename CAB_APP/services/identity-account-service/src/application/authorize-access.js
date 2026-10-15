'use strict';
const crypto = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const { AuthError } = require('../domain/auth');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createAuthorizeAccess(pool, tokens) {
  return async (request, context) => {
    let claims;
    try { claims = tokens.verify(context.authorization); }
    catch { throw new AuthError('UNAUTHENTICATED', grpc.status.UNAUTHENTICATED); }
    context.assertActive();
    const roles = {
      'notification:read': ['CUSTOMER','DRIVER','STAFF','ADMIN'],
      'customer:read': ['CUSTOMER', 'STAFF', 'ADMIN'], 'driver:read': ['DRIVER', 'STAFF', 'ADMIN'],
      'driver:availability': ['DRIVER'], 'driver:location': ['DRIVER'],
      'driver:nearby': ['STAFF', 'ADMIN'], 'driver:approve': ['STAFF', 'ADMIN'],
      'booking:types': ['CUSTOMER','DRIVER','STAFF','ADMIN'], 'booking:estimate': ['CUSTOMER'],
      'booking:create': ['CUSTOMER'], 'booking:list': ['CUSTOMER','STAFF','ADMIN'],
      'driver:offer': ['DRIVER'],
      'trip:read': ['CUSTOMER','DRIVER','STAFF','ADMIN'], 'trip:transition': ['DRIVER'],
      'trip:cancel': ['CUSTOMER','DRIVER','STAFF','ADMIN'], 'trip:rate': ['CUSTOMER'],
      'payment:read': ['CUSTOMER','DRIVER','STAFF','ADMIN'], 'payment:initiate': ['CUSTOMER'], 'payment:retry': ['CUSTOMER'], 'payment:cash': ['DRIVER'],
    };
    if (!Object.hasOwn(roles, request.permission) ||
        (request.resourceId && !uuid.test(request.resourceId))) throw new AuthError('INVALID_ARGUMENT');
    const result = await pool.query({
      text: `SELECT a.role_code, a.status,
        EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_code=a.role_code AND rp.permission_code=$2) AS allowed,
        EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_code=a.role_code AND rp.permission_code='profile:sensitive:read') AS sensitive
        FROM accounts a WHERE a.account_id=$1`,
      values: [claims.sub, request.permission], query_timeout: 350,
    });
    const account = result.rows[0];
    const pendingSelf = account && claims.role === 'DRIVER' && ['driver:read','notification:read'].includes(request.permission) && ['Pending', 'Rejected'].includes(account.status);
    if (!account || (account.status !== 'Active' && !pendingSelf) || account.role_code !== claims.role || !account.allowed || !roles[request.permission].includes(claims.role)) {
      throw new AuthError('FORBIDDEN', grpc.status.PERMISSION_DENIED);
    }
    const sensitive = account.role_code === 'ADMIN' && account.sensitive;
    if (sensitive && request.resourceId && ['customer:read','driver:read'].includes(request.permission)) {
      // Persist before disclosure. An audit failure closes the read; no PII is logged.
      await pool.query({
        text: `INSERT INTO audit_events (audit_id,actor_id,event_type,aggregate_id,correlation_id,safe_metadata)
          VALUES ($1,$2,'SensitiveProfileAccessAuthorized',$3,$4,$5)`,
        values: [crypto.randomUUID(), claims.sub, request.resourceId, context.correlationId,
          { permission: request.permission, resourceType: request.permission.split(':')[0] }], query_timeout: 350,
      });
    }
    context.assertActive();
    return { accountId: claims.sub, role: account.role_code, sensitive, status: account.status.toUpperCase(),
      ...(request.permission === 'booking:create' && request.resourceId ? { tripCreateToken: tokens.tripCreateToken(claims.sub, request.resourceId) } : {}) };
  };
}
module.exports = { createAuthorizeAccess };
