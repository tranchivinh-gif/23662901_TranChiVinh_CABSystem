'use strict';
const crypto=require('node:crypto');
const {uuid,fail,route,fingerprint,calculate,pagination}=require('../domain/booking');
const {policy}=require('../domain/matching');
const {transaction}=require('../infrastructure/database/transaction');
function createOperations({pool,clients,geo,pii,matching}) {
  async function estimate(value,db=pool) {
    const type=(await db.query('SELECT active FROM service_types WHERE service_type=$1',[value.serviceType])).rows[0];
    if(!type)fail('INVALID_SERVICE_TYPE');if(!type.active)fail('SERVICE_TYPE_DISABLED',9);
    const rule=(await db.query(`SELECT * FROM fare_rules WHERE service_type=$1 AND effective_from<=now()
      AND (effective_until IS NULL OR effective_until>now()) ORDER BY effective_from DESC,version DESC LIMIT 1`,[value.serviceType])).rows[0];
    if(!rule)fail('FARE_RULE_UNAVAILABLE',14);
    let distance;try{distance=await geo.route(value);}catch{fail('MAP_PROVIDER_UNAVAILABLE',14);}
    return calculate(rule,distance.distanceKm,distance.etaMinutes);
  }
  function summary(row) {
    // OpenAPI 1.0.4 BookingSummary is the creation summary (SEARCHING); Trip owns the current lifecycle.
    return {bookingId:row.booking_id,customerId:row.customer_id,status:'SEARCHING',tripId:row.trip_id || '',
      serviceType:row.service_type,paymentMethod:row.payment_method.toUpperCase(),fare:{total:{amount:row.final_fare,currency:'VND'},distanceKm:row.distance_km,
        fareRuleVersion:String(row.rule_version),baseFare:row.base_fare,pricePerKm:row.price_per_km,surcharge:row.surcharge,estimated:true,fareRuleId:row.fare_rule_id}};
  }
  return {
    async getServiceTypes(_request,context){await clients.authorize('booking:types','',context);return {items:(await pool.query('SELECT service_type AS code,active FROM service_types WHERE active ORDER BY service_type')).rows};},
    async estimateFare(request,context){await clients.authorize('booking:estimate','',context);return estimate(route(request));},
    async createBooking(request,context) {
      const actor=await clients.authorize('booking:create','',context);
      const customer=await clients.customer(actor.accountId,context);
      if(customer.status!=='ACTIVE')fail('FORBIDDEN',7);
      if(request.customerId && request.customerId!==customer.customerId)fail('FORBIDDEN',7);
      let payload;try{payload=JSON.parse(request.payloadJson);}catch{fail();}
      if(!payload || Array.isArray(payload) || typeof payload!=='object')fail();
      const value=route(payload);
      if(!['Cash','Electronic'].includes(payload.paymentMethod) || typeof request.idempotencyKey!=='string' || !request.idempotencyKey.trim())fail();
      const hash=fingerprint(payload);
      const matchingRule=(await pool.query("SELECT policy FROM booking_policies WHERE policy_key='matching' AND effective_from<=now() ORDER BY effective_from DESC,version DESC LIMIT 1")).rows[0];
      if(!matchingRule)fail('MATCHING_POLICY_INVALID',9);
      const searchTimeoutSeconds=policy(matchingRule.policy).searchTimeoutSeconds;
      // Commit a durable intent before the cross-service command. Retries resume this exact booking.
      const intent=await transaction(pool,async db=>{
        await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,9))',[actor.accountId+':POST /bookings:'+request.idempotencyKey]);
        let key=(await db.query("SELECT *,expires_at<=now() AS expired FROM idempotency_keys WHERE actor_id=$1 AND route='POST /bookings' AND idempotency_key=$2 FOR UPDATE",[actor.accountId,request.idempotencyKey])).rows[0];
        if(key?.expired && key.response_status===201){await db.query("DELETE FROM idempotency_keys WHERE actor_id=$1 AND route='POST /bookings' AND idempotency_key=$2",[actor.accountId,request.idempotencyKey]);key=null;}
        if(key){if(!key.request_hash.equals(hash))fail('IDEMPOTENCY_KEY_REUSED',6);return key.response_status===201?{response:key.response_body}:{bookingId:key.response_body.bookingId};}
        const fare=await estimate(value,db),id=crypto.randomUUID();context.assertActive();
        const encrypted=pii.encrypt(JSON.stringify(value),'bookings:'+id+':route');
        await db.query(`INSERT INTO bookings (booking_id,customer_id,service_type,payment_method,pickup_lat,pickup_lng,destination_lat,destination_lng,search_deadline_at,route_ciphertext,route_key_id,route_iv,route_tag)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now()+($13*interval '1 second'),$9,$10,$11,$12)`,[id,customer.customerId,value.serviceType,payload.paymentMethod,value.pickup.lat,value.pickup.lng,value.destination.lat,value.destination.lng,encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag,searchTimeoutSeconds]);
        await db.query(`INSERT INTO fare_calculations (fare_calculation_id,booking_id,fare_rule_id,rule_version,distance_km,base_fare,price_per_km,surcharge,final_fare,estimated)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true)`,[crypto.randomUUID(),id,fare.fareRuleId,Number(fare.fareRuleVersion),fare.distanceKm,fare.baseFare,fare.pricePerKm,fare.surcharge,fare.total.amount]);
        await db.query(`INSERT INTO idempotency_keys (actor_id,route,idempotency_key,request_hash,response_body,expires_at)
          VALUES ($1,'POST /bookings',$2,$3,$4,now()+interval '24 hours')`,[actor.accountId,request.idempotencyKey,hash,{bookingId:id}]);
        return {bookingId:id};
      });
      if(intent.response)return intent.response;
      const row=(await pool.query('SELECT b.*,f.* FROM bookings b JOIN fare_calculations f USING(booking_id) WHERE b.booking_id=$1 AND f.estimated',[intent.bookingId])).rows[0];
      const valueSummary=summary(row);
      const capability=await clients.authorize('booking:create',intent.bookingId,context);
      const trip=await clients.trip({bookingId:intent.bookingId,customerId:customer.customerId,serviceType:valueSummary.serviceType,paymentMethod:row.payment_method,fareSnapshotJson:JSON.stringify(valueSummary.fare)},context,capability.tripCreateToken);
      if(!uuid.test(trip.tripId) || trip.bookingId!==intent.bookingId)fail('TRIP_PROVISIONING_FAILED',14);
      return transaction(pool,async db=>{
        const key=(await db.query("SELECT * FROM idempotency_keys WHERE actor_id=$1 AND route='POST /bookings' AND idempotency_key=$2 FOR UPDATE",[actor.accountId,request.idempotencyKey])).rows[0];
        if(key.response_status===201)return key.response_body;
        context.assertActive();
        const response={...valueSummary,tripId:trip.tripId};
        await db.query("UPDATE bookings SET trip_id=$2,provisioning_status='Completed',search_started_at=now(),search_deadline_at=now()+($3*interval '1 second'),updated_at=now() WHERE booking_id=$1",[intent.bookingId,trip.tripId,searchTimeoutSeconds]);
        await db.query("UPDATE idempotency_keys SET response_status=201,response_body=$3,expires_at=now()+interval '24 hours' WHERE actor_id=$1 AND route='POST /bookings' AND idempotency_key=$2",[actor.accountId,request.idempotencyKey,response]);
        await db.query("INSERT INTO outbox_events (event_id,event_type,aggregate_id,correlation_id,payload) VALUES ($1,'BookingCreated',$2,$3,$4)",[crypto.randomUUID(),intent.bookingId,context.correlationId,{bookingId:intent.bookingId,tripId:trip.tripId,customerId:customer.customerId,serviceType:row.service_type,state:'SEARCHING'}]);
        await db.query("INSERT INTO outbox_events (event_id,event_type,aggregate_id,correlation_id,payload) VALUES ($1,'NotificationRequested',$2,$3,$4)",[crypto.randomUUID(),intent.bookingId,context.correlationId,{bookingId:intent.bookingId,tripId:trip.tripId,customerId:customer.customerId,serviceType:row.service_type,templateCode:'BookingCreated'}]);
        await matching.enqueue(db,{...row,trip_id:trip.tripId},context.correlationId);
        return response;
      });
    },
    async listCustomerBookings(request,context) {
      if(!uuid.test(request.customerId || ''))fail();const {page,limit}=pagination(request.pagination);
      const actor=await clients.authorize('booking:list',request.customerId,context);
      if(actor.role==='CUSTOMER') {const customer=await clients.customer(actor.accountId,context);if(customer.customerId!==request.customerId)fail('FORBIDDEN',7);}
      return transaction(pool,async db=>{
        const total=Number((await db.query("SELECT count(*) FROM bookings WHERE customer_id=$1 AND provisioning_status='Completed'",[request.customerId])).rows[0].count);
        const rows=(await db.query(`SELECT b.*,f.* FROM bookings b JOIN fare_calculations f USING(booking_id) WHERE b.customer_id=$1 AND b.provisioning_status='Completed' AND f.estimated ORDER BY b.created_at DESC,b.booking_id DESC LIMIT $2 OFFSET $3`,[request.customerId,limit,page*limit])).rows;
        return {items:rows.map(summary),meta:{page,limit,totalItems:total,totalPages:Math.ceil(total/limit)}};
      },true);
    },
  };
}
module.exports={createOperations};
