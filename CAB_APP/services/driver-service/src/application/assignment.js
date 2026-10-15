'use strict';
const crypto=require('node:crypto');
const {transaction}=require('../infrastructure/database/transaction');
const {uuid}=require('../domain/driver');
function createAssignment(pool,identity,verify) {
  function view(row){return {driverId:row.driver_id,accountId:row.account_id,status:row.approval_status.toUpperCase(),availability:{Busy:'BUSY',Available:'ONLINE',Offline:'OFFLINE'}[row.availability_status]};}
  async function getByAccount(request,context) {
    const actor=await identity.authorize('driver:offer','',context);
    if(actor.role!=='DRIVER' || request.id!==actor.accountId)throw {code:7};
    const row=(await pool.query('SELECT d.*,a.availability_status FROM drivers d JOIN driver_availability a USING(driver_id) WHERE d.account_id=$1',[actor.accountId])).rows[0];
    if(!row)throw {code:5};if(row.approval_status!=='Active')throw {code:7};return view(row);
  }
  async function change(request,context,release) {
    verify(context.token,'booking:matching');
    if(!uuid.test(request.driverId || '') || !uuid.test(request.bookingId || ''))throw {code:3};
    return transaction(pool,async db=>{
      const row=(await db.query('SELECT d.*,a.* FROM drivers d JOIN driver_availability a USING(driver_id) WHERE d.driver_id=$1 FOR UPDATE OF d,a',[request.driverId])).rows[0];
      if(!row)throw {code:5};
      if(!release && row.assigned_booking_id===request.bookingId)return view({...row,availability_status:'Busy'});
      if(release && row.assigned_booking_id!==request.bookingId)return view(row);
      if(row.assigned_booking_id && row.assigned_booking_id!==request.bookingId)throw {code:9};
      const active=(await identity.inspectAccounts([row.account_id],context)).includes(row.account_id);
      if(!release) {
        const point=request.pickup;
        if(!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180 || !['MOTORBIKE','CAR_4_SEATS'].includes(request.serviceType))throw {code:3};
        const fresh=(await db.query(`SELECT 1 FROM driver_current_location l WHERE l.driver_id=$1 AND l.observed_at>=now()-interval '30 seconds'
          AND l.observed_at<=now()+interval '5 seconds' AND ST_DWithin(l.current_location,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,5000)
          AND EXISTS(SELECT 1 FROM vehicles WHERE driver_id=$1 AND active AND service_type=$4)`,[row.driver_id,point.lng,point.lat,request.serviceType])).rowCount;
        if(!active || row.approval_status!=='Active' || row.availability_status!=='Available' || !row.last_heartbeat_at || Date.now()-row.last_heartbeat_at.getTime()>30000 || !fresh)throw {code:9};
      }
      context.assertActive();
      if(request.checkOnly && !release)return view(row);
      const available=release && active && row.approval_status==='Active' && row.last_heartbeat_at && Date.now()-row.last_heartbeat_at.getTime()<=30000;
      const status=release?(available?'Available':'Offline'):'Busy';
      await db.query('UPDATE driver_availability SET assigned_booking_id=$2,availability_status=$3::varchar,available_since=CASE WHEN $3::varchar=\'Available\' THEN now() ELSE NULL END,updated_at=now() WHERE driver_id=$1',[row.driver_id,release?null:request.bookingId,status]);
      await db.query('INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES ($1,$2,$3,$4,$5)',[crypto.randomUUID(),release?'DriverReservationReleased':'DriverReserved',row.driver_id,context.correlationId,{driverId:row.driver_id,bookingId:request.bookingId,availability:status}]);
      return view({...row,availability_status:status});
    });
  }
  async function getTravelDistance(request,context){
    verify(context.token,'booking:matching');
    const start=Date.parse(request.startedAt),end=Date.parse(request.endedAt);
    if(!uuid.test(request.driverId || '') || !Number.isFinite(start) || !Number.isFinite(end) || end<start || end>Date.now()+5000)throw {code:3};
    const row=(await pool.query(`WITH points AS (
      SELECT observed_at,current_location,lag(current_location) OVER(ORDER BY observed_at) AS previous,
        lag(observed_at) OVER(ORDER BY observed_at) AS previous_at
      FROM driver_location_history WHERE driver_id=$1 AND observed_at BETWEEN $2::timestamptz AND $3::timestamptz)
      SELECT count(*) AS samples,min(observed_at) AS first,max(observed_at) AS last,
        COALESCE(sum(ST_Distance(previous,current_location)),0)/1000 AS distance,
        COALESCE(max(extract(epoch FROM (observed_at-previous_at))),0) AS max_gap FROM points`,[request.driverId,request.startedAt,request.endedAt])).rows[0];
    context.assertActive();
    const complete=Number(row.samples)>=2 && row.first.getTime()-start<=15000 && end-row.last.getTime()<=15000 && Number(row.max_gap)<=30;
    return {distanceKm:String(row.distance),complete};
  }
  return {getByAccount,getTravelDistance,claimDriver:(request,context)=>change(request,context,false),releaseDriver:(request,context)=>change(request,context,true)};
}
module.exports={createAssignment};
