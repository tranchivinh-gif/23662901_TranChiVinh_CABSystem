'use strict';
const crypto = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const allowedFields = new Set(['fullName', 'email', 'avatar']);

function createProfileUpdate(pool, pii, identity) {
  return async (request, context) => {
    if (!uuid.test(request.accountId || '') || !Array.isArray(request.fields) ||
        request.fields.length === 0 || request.fields.some((field) => !allowedFields.has(field)) ||
        new Set(request.fields).size !== request.fields.length) {
      throw { code: grpc.status.INVALID_ARGUMENT };
    }
    const actor = await identity.authorize('customer:update', request.accountId, context);
    if (actor.role !== 'CUSTOMER' || actor.accountId !== request.accountId) {
      throw { code: grpc.status.PERMISSION_DENIED };
    }

    const changes = {};
    for (const field of request.fields) {
      const value = request[field === 'fullName' ? 'fullName' : field];
      if (typeof value !== 'string') throw { code: grpc.status.INVALID_ARGUMENT };
      if (field === 'fullName') {
        if (!value.trim()) throw { code: grpc.status.INVALID_ARGUMENT };
        changes.fullName = value.trim();
      } else if (field === 'email') {
        const email = value.trim().toLowerCase();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw { code: grpc.status.INVALID_ARGUMENT };
        changes.email = email;
      } else {
        changes.avatar = value.trim();
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='400ms'");
      const row = (await client.query('SELECT * FROM customers WHERE account_id=$1 FOR UPDATE', [request.accountId])).rows[0];
      if (!row) throw { code: grpc.status.NOT_FOUND };
      const profile = JSON.parse(pii.decrypt({
        ciphertext: row.profile_ciphertext, keyId: row.profile_key_id, iv: row.profile_iv, tag: row.profile_tag,
      }, 'customers:' + row.customer_id + ':profile'));
      Object.assign(profile, changes);
      if (profile.email === '') delete profile.email;
      if (profile.avatar === '') delete profile.avatar;

      const encrypted = pii.encrypt(JSON.stringify(profile), 'customers:' + row.customer_id + ':profile');
      const updated = (await client.query(
        'UPDATE customers SET profile_ciphertext=$2,profile_key_id=$3,profile_iv=$4,profile_tag=$5,version=version+1,updated_at=now() WHERE customer_id=$1 RETURNING version,status',
        [row.customer_id, encrypted.ciphertext, encrypted.keyId, encrypted.iv, encrypted.tag],
      )).rows[0];
      await client.query(
        'INSERT INTO customer_profile_history (history_id,customer_id,version,profile_ciphertext,profile_key_id,profile_iv,profile_tag,changed_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [crypto.randomUUID(), row.customer_id, updated.version, encrypted.ciphertext, encrypted.keyId, encrypted.iv, encrypted.tag, actor.accountId],
      );
      await client.query(
        "INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES($1,'CustomerProfileUpdated',$2,$3,$4)",
        [crypto.randomUUID(), row.customer_id, context.correlationId, { customerId: row.customer_id, accountId: row.account_id, version: updated.version }],
      );
      await client.query('COMMIT');
      return {
        customerId: row.customer_id,
        accountId: row.account_id,
        fullName: profile.fullName,
        status: updated.status.toUpperCase(),
        ...(profile.phone ? { phoneNumber: profile.phone } : {}),
        ...(profile.email ? { email: profile.email } : {}),
        ...(profile.avatar ? { avatar: profile.avatar } : {}),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  };
}

module.exports = { createProfileUpdate };
