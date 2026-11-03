'use strict';
const grpc = require('@grpc/grpc-js');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createLookup(pool, pii, identity) {
  return async (request, context) => {
    if (!uuid.test(request.id || '')) throw { code: grpc.status.INVALID_ARGUMENT };
    const actor = await identity.authorize('driver:read', request.id, context);
    if (!['DRIVER', 'STAFF', 'ADMIN'].includes(actor.role)) throw { code: grpc.status.PERMISSION_DENIED };
    const row = (await pool.query({ text: `SELECT d.*, a.availability_status,
      v.vehicle_id, v.service_type, v.plate_ciphertext, v.plate_key_id, v.plate_iv, v.plate_tag,
      v.make, v.model, v.color, v.active, v.seat_count
      FROM drivers d
      LEFT JOIN driver_availability a ON a.driver_id=d.driver_id
      LEFT JOIN LATERAL (
        SELECT * FROM vehicles WHERE driver_id=d.driver_id AND active ORDER BY created_at DESC,vehicle_id LIMIT 1
      ) v ON true
      WHERE d.driver_id=$1 AND ($2::uuid IS NULL OR d.account_id=$2)`,
      values: [request.id, actor.role === 'DRIVER' ? actor.accountId : null], query_timeout: 350 })).rows[0];
    if (!row) throw { code: grpc.status.NOT_FOUND };
    context.assertActive();
    const value = JSON.parse(pii.decrypt({ ciphertext: row.profile_ciphertext, keyId: row.profile_key_id, iv: row.profile_iv, tag: row.profile_tag }, 'drivers:' + row.driver_id + ':profile'));
    const full = actor.role === 'DRIVER' || (actor.role === 'ADMIN' && actor.sensitive);
    const vehiclePlate = row.vehicle_id
      ? pii.decrypt({ciphertext:row.plate_ciphertext,keyId:row.plate_key_id,iv:row.plate_iv,tag:row.plate_tag},'vehicles:'+row.vehicle_id+':plate')
      : null;
    return { driverId: row.driver_id, fullName: value.fullName,
      phoneNumber: full ? value.phone : '******' + value.phone.slice(-4), status: row.approval_status.toUpperCase(),
      availability: { Available: 'ONLINE', Offline: 'OFFLINE', Busy: 'BUSY' }[row.availability_status || 'Offline'],
      ...(vehiclePlate !== null ? { vehicle: {
        vehicleId: row.vehicle_id,
        licensePlate: full ? vehiclePlate : '******' + vehiclePlate.slice(-4),
        serviceType: row.service_type,
        make: row.make || '',
        model: row.model || '',
        color: row.color || '',
        active: row.active,
        seatCount: row.seat_count || 0,
      } } : {}) };
  };
}
module.exports = { createLookup };
