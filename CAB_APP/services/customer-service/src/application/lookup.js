'use strict';
const grpc = require('@grpc/grpc-js');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createLookup(pool, pii, identity) {
  return async (request, context) => {
    if (!uuid.test(request.id || '')) throw { code: grpc.status.INVALID_ARGUMENT };
    const actor = await identity.authorize('customer:read', request.id, context);
    if (!['CUSTOMER', 'STAFF', 'ADMIN'].includes(actor.role)) throw { code: grpc.status.PERMISSION_DENIED };
    // Owner filter is part of the query: foreign IDs and absent IDs both return 404.
    const row = (await pool.query({ text: 'SELECT * FROM customers WHERE customer_id=$1 AND ($2::uuid IS NULL OR account_id=$2)',
      values: [request.id, actor.role === 'CUSTOMER' ? actor.accountId : null], query_timeout: 350 })).rows[0];
    if (!row) throw { code: grpc.status.NOT_FOUND };
    context.assertActive();
    const value = JSON.parse(pii.decrypt({ ciphertext: row.profile_ciphertext, keyId: row.profile_key_id, iv: row.profile_iv, tag: row.profile_tag }, 'customers:' + row.customer_id + ':profile'));
    const full = actor.role === 'CUSTOMER' || (actor.role === 'ADMIN' && actor.sensitive);
    return { customerId: row.customer_id, fullName: value.fullName,
      ...(value.phone?{phoneNumber:full ? value.phone : '******' + value.phone.slice(-4)}:{}), ...(full && value.email ? { email: value.email } : {}) };
  };
}
module.exports = { createLookup };
