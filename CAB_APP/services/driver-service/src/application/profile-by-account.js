'use strict';
const grpc = require('@grpc/grpc-js');
function createProfileByAccount(pool, identity) {
  return async (request, context) => {
    const actor = await identity.authorize('driver:read', '', context);
    if (actor.role !== 'DRIVER' || request.id !== actor.accountId) throw { code: grpc.status.PERMISSION_DENIED };
    const row = (await pool.query({ text: 'SELECT driver_id FROM drivers WHERE account_id=$1', values: [actor.accountId], query_timeout: 350 })).rows[0];
    if (!row) throw { code: grpc.status.NOT_FOUND };
    return { driverId: row.driver_id };
  };
}
module.exports = { createProfileByAccount };
