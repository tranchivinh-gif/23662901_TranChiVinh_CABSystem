'use strict';
const crypto=require('node:crypto');
const {transaction}=require('../infrastructure/database/transaction');
const {uuid,fail,fingerprint}=require('../domain/booking');
const {policy,claim,offerAction}=require('../domain/matching');
function createMatching({pool,clients,pii}) {
  let timer,stopping=false,tickPromise;
  async function event(db,type,booking,correlationId,payload={}) {
    await db.query('INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES ($1,$2,$3,$4,$5)',
      [crypto.randomUUID(),type,booking.booking_id,correlationId,{bookingId:booking.booking_id,tripId:booking.trip_id,...payload}]);
  }
  async function withLock(id,action,wait=false) {
    const lease=await pool.connect();let locked=false;
    try {
      if(wait)await lease.query("SET statement_timeout='900ms'");
      const result=await lease.query(wait?'SELECT pg_advisory_lock(hashtextextended($1,10))':'SELECT pg_try_advisory_lock(hashtextextended($1,10)) AS locked',[id]);
      locked=wait || result.rows[0].locked;
      if(wait)await lease.query('RESET statement_timeout');
      if(!locked)return false;
      return await action();
    } finally {
      if(locked)await lease.query('SELECT pg_advisory_unlock(hashtextextended($1,10))',[id]).catch(()=>{});
      if(wait)await lease.query('RESET statement_timeout').catch(()=>{});
      lease.release();
    }
  }
  async function enqueue(db,booking,correlationId) {
    const rule=(await db.query("SELECT version,policy FROM booking_policies WHERE policy_key='matching' AND effective_from<=now() ORDER BY effective_from DESC,version DESC LIMIT 1")).rows[0];
    if(!rule)fail('MATCHING_POLICY_INVALID',9);policy(rule.policy);
    await db.query('INSERT INTO matching_jobs(booking_id,correlation_id,policy_version,policy) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',[booking.booking_id,correlationId,rule.version,rule.policy]);
  }
  async function closeOffer(offer,booking,job,status) {
    await transaction(pool,async db=>{
      const changed=await db.query("UPDATE driver_offers SET status=$2,responded_at=now() WHERE offer_id=$1 AND status='Pending' RETURNING offer_id",[offer.offer_id,status]);
      if(changed.rowCount)await event(db,status==='Expired'?'OfferExpired':'OfferCancelled',booking,job.correlation_id,{offerId:offer.offer_id,driverId:offer.driver_id});
    });
  }
  async function finishNoDriver(booking,job,context) {
    await clients.applyMatching({bookingId:booking.booking_id,tripId:booking.trip_id,targetState:'NoDriverFound'},context);
    await transaction(pool,async db=>{
      await db.query("UPDATE bookings SET status='NoDriverFound',version=version+1,updated_at=now() WHERE booking_id=$1 AND status='Searching'",[booking.booking_id]);
      await db.query("UPDATE matching_jobs SET stage='Done',safe_error_code=NULL,updated_at=now() WHERE booking_id=$1",[booking.booking_id]);
      await event(db,'NoDriverFound',booking,job.correlation_id);
      await event(db,'NotificationRequested',booking,job.correlation_id,{customerId:booking.customer_id,templateCode:'NoDriverFound'});
    });
  }
  async function completeAssignment(booking,job,context) {
    const offer=(await pool.query('SELECT * FROM driver_offers WHERE offer_id=$1',[job.accepted_offer_id])).rows[0];
    try {
      await clients.claim(claim(booking,offer.driver_id),context);
      await clients.applyMatching({bookingId:booking.booking_id,tripId:booking.trip_id,driverId:offer.driver_id,targetState:'DriverAssigned'},context);
    } catch(error) {
      // Transient failures retain the exclusive reservation and retry the same decision.
      if(![3,5,7,9].includes(error.code))throw error;
      await clients.release(claim(booking,offer.driver_id),context);
      await transaction(pool,async db=>{
        await db.query("UPDATE driver_offers SET status='Cancelled',responded_at=now() WHERE offer_id=$1",[offer.offer_id]);
        await db.query("UPDATE driver_reservations SET status='Released',released_at=now() WHERE booking_id=$1 AND status='Active'",[booking.booking_id]);
        await db.query("UPDATE bookings SET driver_id=NULL,updated_at=now() WHERE booking_id=$1 AND status='Searching'",[booking.booking_id]);
        await db.query("UPDATE matching_jobs SET stage='Searching',accepted_offer_id=NULL,accept_actor_id=NULL,accept_route=NULL,accept_key=NULL,next_attempt_at=now(),updated_at=now() WHERE booking_id=$1",[booking.booking_id]);
        await db.query('UPDATE idempotency_keys SET response_status=409,response_body=$4 WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3',[job.accept_actor_id,job.accept_route,job.accept_key,{code:'OFFER_UNAVAILABLE'}]);
        await event(db,'OfferCancelled',booking,job.correlation_id,{offerId:offer.offer_id,driverId:offer.driver_id});
      });
      return;
    }
    await transaction(pool,async db=>{
      const result=offerAction(offer,booking,true);
      await db.query("UPDATE bookings SET status='Assigned',driver_id=$2,version=version+1,updated_at=now() WHERE booking_id=$1 AND status='Searching'",[booking.booking_id,offer.driver_id]);
      await db.query("UPDATE driver_offers SET status='Accepted',responded_at=now() WHERE offer_id=$1",[offer.offer_id]);
      await db.query("UPDATE matching_jobs SET stage='Done',safe_error_code=NULL,updated_at=now() WHERE booking_id=$1",[booking.booking_id]);
      await db.query('UPDATE idempotency_keys SET response_status=200,response_body=$4,expires_at=now()+interval \'24 hours\' WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3',[job.accept_actor_id,job.accept_route,job.accept_key,result]);
      await event(db,'OfferAccepted',booking,job.correlation_id,{offerId:offer.offer_id,driverId:offer.driver_id});
      await event(db,'DriverAssigned',booking,job.correlation_id,{driverId:offer.driver_id,customerId:booking.customer_id});
      await event(db,'NotificationRequested',booking,job.correlation_id,{customerId:booking.customer_id,templateCode:'DriverAssigned',driverId:offer.driver_id});
    });
  }
  async function advance(id,deadline=Date.now()+3500) {
    const booking=(await pool.query('SELECT * FROM bookings WHERE booking_id=$1',[id])).rows[0];
    const job=(await pool.query('SELECT * FROM matching_jobs WHERE booking_id=$1',[id])).rows[0];
    if(!booking || !job || job.stage==='Done')return;
    const settings=policy(job.policy),context=await clients.systemContext(job.correlation_id,deadline);
    if(job.stage==='Assigning')return completeAssignment(booking,job,context);
    if(job.stage==='Finishing')return finishNoDriver(booking,job,context);
    const expired=Date.now()>=booking.search_deadline_at.getTime();
    let offer=(await pool.query("SELECT * FROM driver_offers WHERE booking_id=$1 AND status='Pending'",[id])).rows[0];
    if(offer) {
      if(expired || Date.now()>=offer.expires_at.getTime()){await closeOffer(offer,booking,job,'Expired');offer=null;}
      else {
        try{await clients.claim(claim(booking,offer.driver_id,true),context);return;}
        catch(error){if(![5,7,9].includes(error.code))throw error;await closeOffer(offer,booking,job,'Cancelled');offer=null;}
      }
    }
    if(expired){await pool.query("UPDATE matching_jobs SET stage='Finishing',updated_at=now() WHERE booking_id=$1",[id]);return finishNoDriver(booking,job,context);}
    if(!job.candidates_loaded) {
      const candidates=(await clients.eligible({pickup:{lat:Number(booking.pickup_lat),lng:Number(booking.pickup_lng)},serviceType:booking.service_type,radiusKm:settings.radiusKm,maxCandidates:settings.maxCandidates},context)).items;
      job.candidates=candidates.map(value=>({driverId:value.driverId,distanceKm:value.distanceKm}));job.candidates_loaded=true;
      await pool.query('UPDATE matching_jobs SET candidates=$2,candidates_loaded=true,updated_at=now() WHERE booking_id=$1',[id,JSON.stringify(job.candidates)]);
    }
    for(let cursor=job.candidate_cursor;cursor<job.candidates.length;cursor++) {
      const candidate=job.candidates[cursor];
      if((await pool.query("SELECT 1 FROM driver_reservations WHERE driver_id=$1 AND status='Active'",[candidate.driverId])).rowCount){await pool.query('UPDATE matching_jobs SET candidate_cursor=$2 WHERE booking_id=$1',[id,cursor+1]);continue;}
      try{await clients.claim(claim(booking,candidate.driverId,true),context);}catch(error){if(![5,7,9].includes(error.code))throw error;await pool.query('UPDATE matching_jobs SET candidate_cursor=$2 WHERE booking_id=$1',[id,cursor+1]);continue;}
      const inserted=await transaction(pool,async db=>{
        const row=(await db.query(`INSERT INTO driver_offers(offer_id,booking_id,driver_id,candidate_rank,expires_at)
          SELECT $1,$2,$3,$4,LEAST(now()+($5*interval '1 second'),search_deadline_at) FROM bookings WHERE booking_id=$2 AND search_deadline_at>now()
          ON CONFLICT DO NOTHING RETURNING *`,[crypto.randomUUID(),id,candidate.driverId,cursor+1,settings.offerTimeoutSeconds])).rows[0];
        await db.query('UPDATE matching_jobs SET candidate_cursor=$2,next_attempt_at=now()+interval \'1 second\',updated_at=now() WHERE booking_id=$1',[id,cursor+1]);
        if(row){await event(db,'DriverOfferCreated',booking,job.correlation_id,{offerId:row.offer_id,driverId:row.driver_id,expiresAt:row.expires_at.toISOString()});
          await event(db,'NotificationRequested',booking,job.correlation_id,{driverId:row.driver_id,offerId:row.offer_id,templateCode:'DriverOfferCreated',expiresAt:row.expires_at.toISOString()});}
        return !!row;
      });
      if(inserted)return;
    }
    await pool.query("UPDATE matching_jobs SET stage='Finishing',updated_at=now() WHERE booking_id=$1",[id]);
    return finishNoDriver(booking,job,context);
  }
  async function process(id,deadline) {
    return withLock(id,async()=>{
      try{return await advance(id,deadline);}catch(error){
        await pool.query("UPDATE matching_jobs SET next_attempt_at=now()+interval '1 second',attempts=attempts+1,safe_error_code=$2,updated_at=now() WHERE booking_id=$1 AND stage<>'Done'",[id,[3,4,5,7,9,14,16].includes(error.code)?'RPC_'+error.code:'DEPENDENCY_UNAVAILABLE']).catch(()=>{});
        throw error;
      }
    });
  }
  async function tick() {
    if(tickPromise)return tickPromise;
    tickPromise=(async()=>{
      const rows=(await pool.query("SELECT booking_id FROM matching_jobs WHERE stage<>'Done' AND next_attempt_at<=now() ORDER BY next_attempt_at,created_at LIMIT 10")).rows;
      for(const row of rows){if(stopping)break;await process(row.booking_id).catch(()=>{});}
    })().finally(()=>{tickPromise=undefined;});
    return tickPromise;
  }
  async function identity(request,context) {
    const actor=await clients.authorize('driver:offer','',context);
    const driver=await clients.driver(actor.accountId,context);
    if(actor.role!=='DRIVER' || (request.driverId && request.driverId!==driver.driverId))fail('FORBIDDEN',7);
    return {actor,driver};
  }
  async function getDriverOffers(request,context) {
    const {driver}=await identity(request,context);
    const rows=(await pool.query(`SELECT o.offer_id,o.booking_id,o.expires_at,b.trip_id FROM driver_offers o JOIN bookings b USING(booking_id)
      JOIN matching_jobs j USING(booking_id) WHERE o.driver_id=$1 AND o.status='Pending' AND o.expires_at>now() AND b.search_deadline_at>now() AND j.stage='Searching' ORDER BY o.created_at`,[driver.driverId])).rows;
    return {items:rows.map(row=>({offerId:row.offer_id,bookingId:row.booking_id,tripId:row.trip_id,expiresAt:row.expires_at.toISOString()}))};
  }
  async function actOnOffer(request,context) {
    if(!uuid.test(request.offerId || '') || !['ACCEPT','REJECT'].includes(request.decision) || (request.decision==='ACCEPT' && !request.idempotencyKey?.trim()) || typeof request.reason!=='string' || request.reason.length>500)fail();
    const {actor,driver}=await identity(request,context),accept=request.decision==='ACCEPT';
    const offer=(await pool.query('SELECT * FROM driver_offers WHERE offer_id=$1',[request.offerId])).rows[0];
    if(!offer)fail('NOT_FOUND',5);if(offer.driver_id!==driver.driverId)fail('FORBIDDEN',7);
    const route='POST /driver-offers/'+request.offerId+(accept?'/accept':'/reject');
    const hash=fingerprint({offerId:request.offerId,decision:request.decision,reason:request.reason});
    return withLock(offer.booking_id,async()=>{
      const result=await transaction(pool,async db=>{
        const key=request.idempotencyKey?(await db.query('SELECT * FROM idempotency_keys WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3 FOR UPDATE',[actor.accountId,route,request.idempotencyKey])).rows[0]:null;
        if(key){if(!key.request_hash.equals(hash))fail('IDEMPOTENCY_KEY_REUSED',6);if(key.response_status===200)return {response:key.response_body};if(key.response_status===409)fail('OFFER_UNAVAILABLE',9);return {resume:true};}
        const current=(await db.query('SELECT * FROM driver_offers WHERE offer_id=$1 FOR UPDATE',[offer.offer_id])).rows[0];
        const booking=(await db.query('SELECT * FROM bookings WHERE booking_id=$1 FOR UPDATE',[offer.booking_id])).rows[0];
        const job=(await db.query('SELECT * FROM matching_jobs WHERE booking_id=$1 FOR UPDATE',[offer.booking_id])).rows[0];
        if(current.status!=='Pending' || Date.now()>=current.expires_at.getTime() || Date.now()>=booking.search_deadline_at.getTime() || booking.status!=='Searching' || job.stage!=='Searching')fail('OFFER_UNAVAILABLE',9);
        context.assertActive();
        if(!accept){
          const sealed=request.reason?pii.encrypt(request.reason,'driver_offers:'+offer.offer_id+':reason'):null;
          await db.query("UPDATE driver_offers SET status='Rejected',responded_at=now(),rejection_reason_ciphertext=$2,rejection_reason_key_id=$3,rejection_reason_iv=$4,rejection_reason_tag=$5 WHERE offer_id=$1",[offer.offer_id,sealed?.ciphertext || null,sealed?.keyId || null,sealed?.iv || null,sealed?.tag || null]);
          await db.query('UPDATE matching_jobs SET next_attempt_at=now(),updated_at=now() WHERE booking_id=$1',[booking.booking_id]);
          await event(db,'OfferRejected',booking,context.correlationId,{offerId:offer.offer_id,driverId:driver.driverId});
          return {response:offerAction(offer,booking,false)};
        }
        await db.query('INSERT INTO driver_reservations(reservation_id,booking_id,driver_id,offer_id) VALUES ($1,$2,$3,$4)',[crypto.randomUUID(),booking.booking_id,driver.driverId,offer.offer_id]);
        await db.query("UPDATE matching_jobs SET stage='Assigning',accepted_offer_id=$2,accept_actor_id=$3,accept_route=$4,accept_key=$5,correlation_id=$6,next_attempt_at=now(),updated_at=now() WHERE booking_id=$1",[booking.booking_id,offer.offer_id,actor.accountId,route,request.idempotencyKey,context.correlationId]);
        await db.query("INSERT INTO idempotency_keys(actor_id,route,idempotency_key,request_hash,response_body,expires_at) VALUES ($1,$2,$3,$4,$5,now()+interval '24 hours')",[actor.accountId,route,request.idempotencyKey,hash,{offerId:offer.offer_id}]);
        return {resume:true};
      });
      if(result.response)return result.response;
      await advance(offer.booking_id,context.deadline-30);
      const key=(await pool.query('SELECT * FROM idempotency_keys WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3',[actor.accountId,route,request.idempotencyKey])).rows[0];
      if(key.response_status===200)return key.response_body;
      if(key.response_status===409)fail('OFFER_UNAVAILABLE',9);
      fail('ASSIGNMENT_PENDING',14);
    },true);
  }
  return {enqueue,process,tick,actOnOffer,getDriverOffers,withLock,
    start(){timer=setInterval(()=>tick().catch(()=>{}),1000);timer.unref();tick().catch(()=>{});},
    async stop(){stopping=true;clearInterval(timer);await tickPromise?.catch(()=>{});}};
}
module.exports={createMatching};
