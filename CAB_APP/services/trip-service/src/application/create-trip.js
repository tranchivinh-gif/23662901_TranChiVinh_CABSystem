'use strict';
const crypto=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createTripService(pool,identity,customer) {
  return async(request,context)=>{
    if(!uuid.test(request.bookingId) || !uuid.test(request.customerId) || request.driverId)throw {code:3};
    const actor=await identity.authorize('booking:create','',context);
    if(actor.accountId!==context.accountId || actor.role!=='CUSTOMER')throw {code:7};
    const profile=await customer(actor.accountId,context);
    if(profile.customerId!==request.customerId || profile.status!=='ACTIVE')throw {code:7};
    let fare;try{fare=JSON.parse(request.fareSnapshotJson);}catch{throw {code:3};}
    if(!fare || !uuid.test(fare.fareRuleId) || !/^\d+$/.test(fare.fareRuleVersion) || Number(fare.fareRuleVersion)<1 || fare.total?.currency!=='VND' || fare.estimated!==true ||
      ['baseFare','pricePerKm','surcharge','distanceKm'].some(key=>!/^\d+(\.\d+)?$/.test(String(fare[key]))) || !/^\d+(\.\d{1,2})?$/.test(String(fare.total.amount)))throw {code:3};
    const db=await pool.connect();
    try {
      await db.query('BEGIN');await db.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='400ms'");
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,9))',[request.bookingId]);
      let row=(await db.query('SELECT * FROM trips WHERE booking_id=$1',[request.bookingId])).rows[0];
      if(row){const snapshot=(await db.query('SELECT rule_snapshot FROM trip_fare_snapshot WHERE trip_id=$1',[row.trip_id])).rows[0];
        if(row.customer_id!==request.customerId || (request.paymentMethod && row.payment_method!==request.paymentMethod) || (request.serviceType && row.service_type!==request.serviceType) || !isDeepStrictEqual(snapshot.rule_snapshot,fare))throw {code:6};
      } else {
        context.assertActive();const id=crypto.randomUUID();
        if(request.serviceType && !['MOTORBIKE','CAR_4_SEATS'].includes(request.serviceType))throw {code:3};
        if(request.paymentMethod && !['Cash','Electronic'].includes(request.paymentMethod))throw {code:3};
        row=(await db.query('INSERT INTO trips (trip_id,booking_id,customer_id,service_type,payment_method) VALUES ($1,$2,$3,$4,$5) RETURNING *',[id,request.bookingId,request.customerId,request.serviceType || 'UNKNOWN',request.paymentMethod || 'UNKNOWN'])).rows[0];
        await db.query(`INSERT INTO trip_fare_snapshot (trip_id,fare_rule_id,rule_version,base_fare,price_per_km,surcharge,distance_km,final_fare,estimated,rule_snapshot)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,$9)`,[id,fare.fareRuleId,Number(fare.fareRuleVersion),fare.baseFare,fare.pricePerKm,fare.surcharge,fare.distanceKm,fare.total.amount,fare]);
        await db.query("INSERT INTO trip_status_history (history_id,trip_id,to_state,actor_id,correlation_id) VALUES ($1,$2,'Searching',$3,$4)",[crypto.randomUUID(),id,actor.accountId,context.correlationId]);
      }
      await db.query('COMMIT');return {tripId:row.trip_id,bookingId:row.booking_id,status:row.state.toUpperCase()};
    }catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}
  };
}
module.exports={createTripService};
