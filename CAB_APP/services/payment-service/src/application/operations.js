'use strict';
const crypto=require('node:crypto'),domain=require('../domain/payment');
function createOperations({pool,clients,provider,secret}){
  if(!/^[a-f0-9]{64}$/i.test(secret || ''))throw new Error('Payment webhook key must be configured');
  async function transaction(action){const db=await pool.connect();try{await db.query('BEGIN');await db.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='600ms'");const result=await action(db);await db.query('COMMIT');return result;}catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}}
  async function audit(db,type,id,context,actor){await db.query('INSERT INTO payment_audit_events(audit_id,payment_id,actor_id,event_type,correlation_id) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),id || null,actor || null,type,context.correlationId]);}
  async function event(db,type,row,context){await db.query('INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),type,row.payment_id,context.correlationId,{paymentId:row.payment_id,tripId:row.trip_id,customerId:row.customer_id,driverId:row.driver_id,amount:Number(row.amount),currency:'VND',method:row.method,...(type==='NotificationRequested'?{templateCode:row.status==='Succeeded'?'PaymentSucceeded':'PaymentFailed'}:{})}]);}
  async function latest(db,id){return (await db.query('SELECT * FROM payment_attempts WHERE payment_id=$1 ORDER BY attempt_no DESC LIMIT 1',[id])).rows[0];}
  async function access(id,permission,context){if(!domain.uuid.test(id || ''))domain.fail();const actor=await clients.authorize(permission,id,context);const trip=await clients.trip(id,context);if(trip.status!=='COMPLETED')domain.fail('TRIP_NOT_COMPLETED',9);if(!['Cash','Electronic'].includes(trip.paymentMethod))domain.fail('PAYMENT_METHOD_UNAVAILABLE',9);let fare;try{fare=JSON.parse(trip.fareJson);}catch{domain.fail('PAYMENT_AMOUNT_UNAVAILABLE',14);}if(!Number.isSafeInteger(fare.finalFare) || fare.finalFare<0)domain.fail('PAYMENT_AMOUNT_UNAVAILABLE',9);return {actor,trip,amount:fare.finalFare};}
  async function ensure(db,value,context){const {trip,amount}=value;await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,12))',[trip.tripId]);let row=(await db.query('SELECT * FROM payments WHERE trip_id=$1 FOR UPDATE',[trip.tripId])).rows[0];if(!row){context.assertActive();row=(await db.query('INSERT INTO payments(payment_id,trip_id,method,amount,customer_id,driver_id) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[crypto.randomUUID(),trip.tripId,trip.paymentMethod,amount,trip.customerId,trip.driverId])).rows[0];await audit(db,'PaymentCreated',row.payment_id,context,value.actor.accountId);}if(Number(row.amount)!==amount || row.method!==trip.paymentMethod)domain.fail('PAYMENT_CALLBACK_MISMATCH',9);return row;}
  async function keyed(db,actor,route,key,payload,action){domain.key(key);await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,13))',[actor+':'+route+':'+key]);const hash=domain.fingerprint(payload);const saved=(await db.query('SELECT *,expires_at<=now() AS expired FROM idempotency_keys WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3',[actor,route,key])).rows[0];if(saved && !saved.expired){if(!saved.request_hash.equals(hash))domain.fail('IDEMPOTENCY_KEY_REUSED',6);return saved.response_body;}const value=await action();await db.query("INSERT INTO idempotency_keys(actor_id,route,idempotency_key,request_hash,response_body,expires_at) VALUES($1,$2,$3,$4,$5,now()+interval '24 hours') ON CONFLICT(actor_id,route,idempotency_key) DO UPDATE SET request_hash=EXCLUDED.request_hash,response_body=EXCLUDED.response_body,created_at=now(),expires_at=EXCLUDED.expires_at",[actor,route,key,hash,value]);return value;}
  async function initiate(request,context,isRetry=false){
    const resource=isRetry?request.paymentId:request.tripId;if(!domain.uuid.test(resource || ''))domain.fail();domain.key(request.idempotencyKey);
    let tripId=resource;if(isRetry){const found=(await pool.query('SELECT trip_id FROM payments WHERE payment_id=$1',[resource])).rows[0];if(!found)domain.fail('NOT_FOUND',5);tripId=found.trip_id;}
    const value=await access(tripId,isRetry?'payment:retry':'payment:initiate',context);if(value.actor.role!=='CUSTOMER')domain.fail('FORBIDDEN',7);if(value.trip.paymentMethod!=='Electronic' || (!isRetry && request.method!=='Electronic'))domain.fail('PAYMENT_METHOD_MISMATCH',9);
    const intent=await transaction(db=>keyed(db,value.actor.accountId,isRetry?'retry':'initiate',request.idempotencyKey,{resource,method:request.method || 'Electronic'},async()=>{
      let row=await ensure(db,value,context),attempt=await latest(db,row.payment_id);
      if(isRetry){try{domain.retry(row,attempt);}catch(error){if(error.businessCode!=='PAYMENT_RETRY_LIMIT_REACHED')throw error;if(!row.staff_handling_requested){await db.query('UPDATE payments SET staff_handling_requested=true WHERE payment_id=$1',[row.payment_id]);await event(db,'PaymentStaffHandlingRequested',row,context);await audit(db,'PaymentRetryLimitReached',row.payment_id,context,value.actor.accountId);}return {paymentId:row.payment_id,denied:error.businessCode};}}else if(row.status!=='Pending')domain.fail('PAYMENT_NOT_RETRYABLE',9);
      if(!attempt || isRetry){const id=crypto.randomUUID();context.assertActive();attempt=(await db.query("INSERT INTO payment_attempts(attempt_id,payment_id,attempt_no,retry_window_start,provider,provider_reference) VALUES($1,$2,$3,$4,'mock',$5) RETURNING *",[id,row.payment_id,(attempt?.attempt_no || 0)+1,row.created_at,'mock_'+id])).rows[0];await db.query("UPDATE payments SET status='Pending',version=version+1,updated_at=now() WHERE payment_id=$1",[row.payment_id]);await audit(db,'PaymentInitiated',row.payment_id,context,value.actor.accountId);}
      return {paymentId:row.payment_id,attemptId:attempt.attempt_id};
    }));
    if(intent.denied)domain.fail(intent.denied,9);
    if(intent.response)return intent.response;
    let attempt=(await pool.query('SELECT * FROM payment_attempts WHERE attempt_id=$1',[intent.attemptId])).rows[0];
    if(!attempt.checkout_token && ['Pending','TimedOut'].includes(attempt.status)){
      try{context.assertActive();const checkout=await provider.initiate(attempt,value.amount);await pool.query("UPDATE payment_attempts SET checkout_token=$2,status=CASE WHEN status='TimedOut' THEN 'Pending' ELSE status END,safe_error_code=NULL WHERE attempt_id=$1",[attempt.attempt_id,checkout.checkoutToken]);}
      catch{await pool.query("UPDATE payment_attempts SET status='TimedOut',safe_error_code='PROVIDER_TIMEOUT' WHERE attempt_id=$1 AND status='Pending'",[attempt.attempt_id]);domain.fail('PAYMENT_PROVIDER_UNAVAILABLE',14);}
      attempt=(await pool.query('SELECT * FROM payment_attempts WHERE attempt_id=$1',[intent.attemptId])).rows[0];
    }
    if(attempt.status==='Pending'){
      await transaction(async db=>{
        let row=(await db.query('SELECT * FROM payments WHERE payment_id=$1 FOR UPDATE',[intent.paymentId])).rows[0];
        const current=await latest(db,row.payment_id);
        if(row.status==='Succeeded' || current.attempt_id!==attempt.attempt_id)return;
        context.assertActive();
        attempt=(await db.query("UPDATE payment_attempts SET status='Succeeded',completed_at=now() WHERE attempt_id=$1 RETURNING *",[attempt.attempt_id])).rows[0];
        row=(await db.query("UPDATE payments SET status='Succeeded',completed_at=now(),version=version+1,updated_at=now() WHERE payment_id=$1 RETURNING *",[row.payment_id])).rows[0];
        await audit(db,'PaymentSucceeded',row.payment_id,context,value.actor.accountId);
        await event(db,'PaymentSucceeded',row,context);
        await event(db,'NotificationRequested',row,context);
      });
    }
    const row=(await pool.query('SELECT * FROM payments WHERE payment_id=$1',[intent.paymentId])).rows[0],response=domain.summary(row,await latest(pool,row.payment_id));
    return transaction(async db=>{const route=isRetry?'retry':'initiate',saved=(await db.query('SELECT response_body FROM idempotency_keys WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3 FOR UPDATE',[value.actor.accountId,route,request.idempotencyKey])).rows[0];if(saved.response_body.response)return saved.response_body.response;context.assertActive();await db.query('UPDATE idempotency_keys SET response_status=201,response_body=$4 WHERE actor_id=$1 AND route=$2 AND idempotency_key=$3',[value.actor.accountId,route,request.idempotencyKey,{...intent,response}]);return response;});
  }
  return {
    async getPayment(request,context){const value=await access(request.id,'payment:read',context);return transaction(async db=>{const row=await ensure(db,value,context);return domain.summary(row,await latest(db,row.payment_id));});},
    initiatePayment:(request,context)=>initiate(request,context),retryPayment:(request,context)=>initiate(request,context,true),
    async confirmCash(request,context){if(!domain.uuid.test(request.id || ''))domain.fail();domain.key(request.idempotencyKey);const found=(await pool.query('SELECT trip_id FROM payments WHERE payment_id=$1',[request.id])).rows[0];if(!found)domain.fail('NOT_FOUND',5);const value=await access(found.trip_id,'payment:cash',context);if(value.actor.role!=='DRIVER' || value.trip.paymentMethod!=='Cash')domain.fail('PAYMENT_METHOD_MISMATCH',9);return transaction(db=>keyed(db,value.actor.accountId,'cash',request.idempotencyKey,{paymentId:request.id},async()=>{let row=await ensure(db,value,context);if(row.status!=='Succeeded'){context.assertActive();row=(await db.query("UPDATE payments SET status='Succeeded',completed_at=now(),version=version+1,updated_at=now() WHERE payment_id=$1 RETURNING *",[row.payment_id])).rows[0];await audit(db,'CashConfirmed',row.payment_id,context,value.actor.accountId);await event(db,'PaymentSucceeded',row,context);await event(db,'NotificationRequested',row,context);}return domain.summary(row);}));},
    async handleCallback(request,context){
      let parsed;try{parsed=domain.callback(request,secret);}catch(error){await audit(pool,error.businessCode || 'InvalidCallback',null,context);throw error;}
      return transaction(async db=>{
        const reference=(await db.query('SELECT payment_id FROM payment_attempts WHERE provider=$1 AND provider_reference=$2',[request.provider,request.providerReference])).rows[0];if(!reference)domain.fail('PAYMENT_CALLBACK_MISMATCH',9);
        let row=(await db.query('SELECT * FROM payments WHERE payment_id=$1 FOR UPDATE',[reference.payment_id])).rows[0],attempt=await latest(db,row.payment_id);
        if(Number(row.amount)!==parsed.amount || row.method!=='Electronic')domain.fail('PAYMENT_CALLBACK_MISMATCH',9);
        const saved=(await db.query('SELECT 1 FROM provider_callbacks WHERE provider=$1 AND provider_event_id=$2',[request.provider,parsed.eventId])).rowCount;
        if(saved)return {...domain.summary(row,attempt),callbackAccepted:true};
        if(attempt.provider_reference!==request.providerReference || ['Succeeded','Failed'].includes(attempt.status) || row.status==='Succeeded')domain.fail('PAYMENT_CALLBACK_MISMATCH',9);
        context.assertActive();
        await db.query('INSERT INTO provider_callbacks(callback_id,payment_id,provider,provider_event_id,provider_reference,amount,status,signature_hash,provider_timestamp,processed_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,now())',[crypto.randomUUID(),row.payment_id,request.provider,parsed.eventId,request.providerReference,parsed.amount,parsed.status,domain.fingerprint(request.signature),new Date(parsed.timestamp*1000)]);
        attempt=(await db.query('UPDATE payment_attempts SET status=$2,completed_at=now() WHERE attempt_id=$1 RETURNING *',[attempt.attempt_id,parsed.status])).rows[0];
        row=(await db.query("UPDATE payments SET status=$2::varchar,completed_at=CASE WHEN $2::varchar='Succeeded' THEN now() ELSE completed_at END,version=version+1,updated_at=now() WHERE payment_id=$1 RETURNING *",[row.payment_id,parsed.status])).rows[0];
        await audit(db,parsed.status==='Succeeded'?'PaymentSucceeded':'PaymentFailed',row.payment_id,context);await event(db,parsed.status==='Succeeded'?'PaymentSucceeded':'PaymentFailed',row,context);await event(db,'NotificationRequested',row,context);
        if(parsed.status==='Failed' && attempt.attempt_no===3 && !row.staff_handling_requested){await db.query('UPDATE payments SET staff_handling_requested=true WHERE payment_id=$1',[row.payment_id]);await event(db,'PaymentStaffHandlingRequested',row,context);}
        return {...domain.summary(row,attempt),callbackAccepted:true};
      });
    },
  };
}
module.exports={createOperations};
