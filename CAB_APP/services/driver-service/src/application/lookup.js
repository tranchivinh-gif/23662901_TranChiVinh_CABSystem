'use strict';
const grpc = require('@grpc/grpc-js');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createLookup(pool, pii, identity) {
  return async (request, context) => {
    if (!uuid.test(request.id || '')) throw { code: grpc.status.INVALID_ARGUMENT };
    const actor = await identity.authorize('driver:read', request.id, context);
    if (!['DRIVER', 'STAFF', 'ADMIN'].includes(actor.role)) throw { code: grpc.status.PERMISSION_DENIED };
    const row = (await pool.query({ text: `SELECT d.*, a.availability_status FROM drivers d
      LEFT JOIN driver_availability a ON a.driver_id=d.driver_id
      WHERE d.driver_id=$1 AND ($2::uuid IS NULL OR d.account_id=$2)`,
      values: [request.id, actor.role === 'DRIVER' ? actor.accountId : null], query_timeout: 350 })).rows[0];
    if (!row) throw { code: grpc.status.NOT_FOUND };
    context.assertActive();
    const value = JSON.parse(pii.decrypt({ ciphertext: row.profile_ciphertext, keyId: row.profile_key_id, iv: row.profile_iv, tag: row.profile_tag }, 'drivers:' + row.driver_id + ':profile'));
    const full = actor.role === 'DRIVER' || (actor.role === 'ADMIN' && actor.sensitive);
    return { driverId: row.driver_id, fullName: value.fullName,
      phoneNumber: full ? value.phone : '******' + value.phone.slice(-4), status: row.approval_status.toUpperCase(),
      availability: { Available: 'ONLINE', Offline: 'OFFLINE', Busy: 'BUSY' }[row.availability_status || 'Offline'] };
  };
}
module.exports = { createLookup };
