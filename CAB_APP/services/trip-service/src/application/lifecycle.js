'use strict';
const crypto=require('node:crypto');
const domain=require('../domain/lifecycle');
function createLifecycle({pool,clients}){
  let timer,stopping=false,ticking;
  async function transaction(action){const db=await pool.connect();try{await db.query('BEGIN');await db.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='400ms'");const result=await action(db);await db.query('COMMIT');return result;}catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}}
  async function event(db,type,row,context,extra={}){
    await db.query('INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),type,row.trip_id,context.correlationId,{tripId:row.trip_id,bookingId:row.booking_id,customerId:row.customer_id,...(row.driver_id?{driverId:row.driver_id}:{}),...extra}]);
  }
  async function settings(db){const row=(await db.query("SELECT * FROM trip_policies WHERE policy_key='lifecycle' AND effective_from<=now() ORDER BY effective_from DESC,version DESC LIMIT 1")).rows[0];if(!row)domain.fail(9);domain.policy(row.policy);return row;}
  async function access(request,permission,context){
    const id=request.tripId || request.id;if(!domain.uuid.test(id || ''))domain.fail();
    const actor=await clients.authorize(permission,id,context);
    if(actor.role==='CUSTOMER'){const profile=await clients.customer(actor.accountId,context);if(profile.status!=='ACTIVE')domain.fail(7);actor.customerId=profile.customerId;}
    if(actor.role==='DRIVER')actor.driverId=(await clients.driver(actor.accountId,context)).driverId;
    return {id,actor};
  }
  async function load(db,id,actor,lock=false){
    const row=(await db.query('SELECT * FROM trips WHERE trip_id=$1'+(lock?' FOR UPDATE':''),[id])).rows[0];
    if(!row)domain.fail(5);
    if((actor.role==='CUSTOMER' && row.customer_id!==actor.customerId) || (actor.role==='DRIVER' && row.driver_id!==actor.driverId))domain.fail(7);
    return row;
  }
  async function view(db,row){
    const fare=(await db.query('SELECT * FROM trip_fare_snapshot WHERE trip_id=$1',[row.trip_id])).rows[0];
    return {tripId:row.trip_id,bookingId:row.booking_id,driverId:row.driver_id || '',customerId:row.customer_id,serviceType:row.service_type,paymentMethod:row.payment_method,status:domain.states[row.state],fareJson:JSON.stringify({currency:'VND',baseFare:Number(fare.base_fare),pricePerKm:Number(fare.price_per_km),surcharge:Number(fare.surcharge),distanceKm:Number(fare.distance_km),finalFare:Number(fare.final_fare),ruleVersion:String(fare.rule_version),estimated:fare.estimated})};
  }
  async function record(db,row,previous,actor,context,type,extra={}){
    await db.query('INSERT INTO trip_status_history(history_id,trip_id,from_state,to_state,actor_id,correlation_id) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),row.trip_id,previous,row.state,actor.accountId,context.correlationId]);
    await db.query('INSERT INTO trip_audit_events(audit_id,trip_id,actor_id,command,before_state,after_state,correlation_id) VALUES($1,$2,$3,$4,$5,$6,$7)',[crypto.randomUUID(),row.trip_id,actor.accountId,type,previous,row.state,context.correlationId]);
    if(type==='TripCompleted'){const fare=(await db.query('SELECT final_fare FROM trip_fare_snapshot WHERE trip_id=$1',[row.trip_id])).rows[0];extra={...extra,paymentMethod:row.payment_method,currency:'VND',amount:Number(fare.final_fare)};}
    await event(db,type,row,context,extra);await event(db,'NotificationRequested',row,context,{templateCode:type});
    if(['Completed','Cancelled'].includes(row.state))await db.query('INSERT INTO trip_terminal_jobs(trip_id,correlation_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[row.trip_id,context.correlationId]);
  }
  async function reconcile(id,deadline){
    const row=(await pool.query('SELECT t.*,j.correlation_id,j.done FROM trips t JOIN trip_terminal_jobs j USING(trip_id) WHERE trip_id=$1',[id])).rows[0];
    if(!row || row.done)return;
    try{const context=await clients.systemContext(row.correlation_id,deadline);await clients.finalize({tripId:id,bookingId:row.booking_id,state:row.state},context);await pool.query('UPDATE trip_terminal_jobs SET done=true,safe_error_code=NULL WHERE trip_id=$1',[id]);}
    catch(error){await pool.query("UPDATE trip_terminal_jobs SET attempts=attempts+1,next_attempt_at=now()+interval '1 second',safe_error_code='DEPENDENCY_UNAVAILABLE' WHERE trip_id=$1 AND NOT done",[id]).catch(()=>{});throw error;}
  }
  async function getTrip(request,context){const {id,actor}=await access(request,'trip:read',context);return view(pool,await load(pool,id,actor));}
  async function transition(request,context){
    const {id,actor}=await access(request,'trip:transition',context);if(actor.role!=='DRIVER')domain.fail(7);
    const target=request.targetStatus,key=request.idempotencyKey;
    if(typeof key!=='string' || !key.trim() || key.length>200)domain.fail();
    const hash=domain.fingerprint({target});
    const result=await transaction(async db=>{
      let row=await load(db,id,actor,true);
      const saved=(await db.query('SELECT * FROM trip_commands WHERE actor_id=$1 AND trip_id=$2 AND command=$3 AND idempotency_key=$4',[actor.accountId,id,'transition',key])).rows[0];
      if(saved && saved.expires_at.getTime()>Date.now()){if(!saved.request_hash.equals(hash))domain.fail(6);return saved.response;}
      if(domain.transition(row.state,target)){
        context.assertActive();const previous=row.state;
        if(target==='Completed'){
          const system=await clients.systemContext(context.correlationId,context.deadline);
          const fare=await clients.fare({bookingId:row.booking_id,driverId:row.driver_id,startedAt:row.started_at.toISOString(),endedAt:new Date().toISOString()},system);
          await db.query('UPDATE trip_fare_snapshot SET distance_km=$2,final_fare=$3,estimated=$4 WHERE trip_id=$1',[id,fare.distanceKm,fare.total.amount,fare.estimated]);
        }
        row=(await db.query("UPDATE trips SET state=$2::varchar,arrived_at=CASE WHEN $2::varchar='DriverArrived' THEN now() ELSE arrived_at END,started_at=CASE WHEN $2::varchar='InProgress' THEN now() ELSE started_at END,completed_at=CASE WHEN $2::varchar='Completed' THEN now() ELSE completed_at END,version=version+1,updated_at=now() WHERE trip_id=$1 RETURNING *",[id,target])).rows[0];
        await record(db,row,previous,actor,context,{DriverArrived:'DriverArrived',PickedUp:'TripPickedUp',InProgress:'TripInProgress',Completed:'TripCompleted'}[target]);
      }
      const value=await view(db,row);
      await db.query("INSERT INTO trip_commands(actor_id,trip_id,command,idempotency_key,request_hash,response,expires_at) VALUES($1,$2,'transition',$3,$4,$5,now()+interval '24 hours') ON CONFLICT(actor_id,trip_id,command,idempotency_key) DO UPDATE SET request_hash=EXCLUDED.request_hash,response=EXCLUDED.response,expires_at=EXCLUDED.expires_at",[actor.accountId,id,key,hash,value]);
      context.assertActive();return value;
    });
    if(target==='Completed')await reconcile(id,context.deadline-30);return result;
  }
  async function cancelTrip(request,context){
    const {id,actor}=await access(request,'trip:cancel',context),why=domain.reason(request.reason);
    const result=await transaction(async db=>{
      let row=await load(db,id,actor,true);
      if(row.state==='Cancelled'){
        const saved=(await db.query('SELECT * FROM trip_cancellations WHERE trip_id=$1',[id])).rows[0];
        const normalized=actor.role==='DRIVER' && why==='CustomerNoShow'?'NO_SHOW':why;
        if(saved.actor_id!==actor.accountId || saved.reason!==normalized)domain.fail(9);
        return {...await view(db,row),cancellationFeeVnd:Number(saved.cancellation_fee)};
      }
      const rule=await settings(db),value=domain.cancellation(row,actor,why,rule.policy,Date.now());context.assertActive();const previous=row.state;
      await db.query('INSERT INTO trip_cancellations(cancellation_id,trip_id,actor_id,reason,policy_version,cancellation_fee) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),id,actor.accountId,value.reason,rule.version,value.fee]);
      row=(await db.query("UPDATE trips SET state='Cancelled',version=version+1,updated_at=now() WHERE trip_id=$1 RETURNING *",[id])).rows[0];
      await record(db,row,previous,actor,context,'TripCancelled',{reasonCode:value.reason==='NO_SHOW'?'NO_SHOW':'CUSTOMER_OR_OPERATOR',cancellationFeeVnd:value.fee,policyVersion:rule.version});
      return {...await view(db,row),cancellationFeeVnd:value.fee};
    });
    await reconcile(id,context.deadline-30);return result;
  }
  async function rateTrip(request,context){
    const {id,actor}=await access(request,'trip:rate',context);if(actor.role!=='CUSTOMER')domain.fail(7);
    return transaction(async db=>{
      const row=await load(db,id,actor,true),rule=await settings(db);
      domain.rating(row,request.score,request.comment,rule.policy,Date.now());
      if((await db.query('SELECT 1 FROM ratings WHERE trip_id=$1',[id])).rowCount)domain.fail(9);context.assertActive();
      const ratingId=crypto.randomUUID();
      await db.query('INSERT INTO ratings(rating_id,trip_id,customer_id,driver_id,stars,comment) VALUES($1,$2,$3,$4,$5,$6)',[ratingId,id,row.customer_id,row.driver_id,request.score,request.comment || null]);
      await event(db,'TripRated',row,context,{ratingId,stars:request.score});
      return {ratingId,tripId:id,score:request.score};
    });
  }
  async function tick(){if(ticking)return ticking;ticking=(async()=>{const rows=(await pool.query('SELECT trip_id FROM trip_terminal_jobs WHERE NOT done AND next_attempt_at<=now() ORDER BY next_attempt_at LIMIT 10')).rows;for(const row of rows){if(stopping)break;await reconcile(row.trip_id).catch(()=>{});}})().finally(()=>{ticking=undefined;});return ticking;}
  return {getTrip,transition,cancelTrip,rateTrip,reconcile,tick,start(){timer=setInterval(()=>tick().catch(()=>{}),1000);timer.unref();},async stop(){stopping=true;clearInterval(timer);await ticking?.catch(()=>{});}};
}
module.exports={createLifecycle};
