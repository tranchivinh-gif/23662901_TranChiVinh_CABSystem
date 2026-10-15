'use strict';
const crypto=require('node:crypto');
const grpc=require('@grpc/grpc-js');
const {uuid,invalid,location,nearby}=require('../domain/driver');
const {transaction}=require('../infrastructure/database/transaction');
const {project}=require('./profile');
function createOperations(pool,pii,identity,verify) {
  async function event(db,type,row,context,payload={}) {
    await db.query('INSERT INTO outbox_events (event_id,event_type,aggregate_id,correlation_id,payload) VALUES ($1,$2,$3,$4,$5)',
      [crypto.randomUUID(),type,row.driver_id,context.correlationId,{driverId:row.driver_id,accountId:row.account_id,...payload}]);
  }
  async function own(db,actor,request) {
    const row=(await db.query('SELECT d.*,a.availability_status,a.last_heartbeat_at,a.assigned_booking_id FROM drivers d JOIN driver_availability a USING(driver_id) WHERE d.account_id=$1 FOR UPDATE OF d,a',[actor.accountId])).rows[0];
    if(!row) throw {code:grpc.status.NOT_FOUND};
    if(row.approval_status!=='Active' || (request.driverId && request.driverId!==row.driver_id)) throw {code:grpc.status.PERMISSION_DENIED};
    return row;
  }
  async function setAvailability(request,context) {
    if(!['ONLINE','OFFLINE'].includes(request.availability)) invalid();
    const actor=await identity.authorize('driver:availability','',context);
    if(actor.role!=='DRIVER') throw {code:grpc.status.PERMISSION_DENIED};
    return transaction(pool,async db=>{
      const row=await own(db,actor,request);
      if(row.availability_status==='Busy' || row.assigned_booking_id) throw {code:grpc.status.FAILED_PRECONDITION};
      if(request.availability==='ONLINE' && !(await db.query('SELECT 1 FROM vehicles WHERE driver_id=$1 AND active LIMIT 1',[row.driver_id])).rowCount) throw {code:grpc.status.FAILED_PRECONDITION};
      const status=request.availability==='ONLINE'?'Available':'Offline';
      context.assertActive();
      await db.query(`UPDATE driver_availability SET availability_status=$2::varchar,
        available_since=CASE WHEN $2::varchar='Available' THEN CASE WHEN availability_status='Available' THEN available_since ELSE now() END ELSE NULL END,
        last_heartbeat_at=CASE WHEN $2::varchar='Available' THEN now() ELSE last_heartbeat_at END,updated_at=now() WHERE driver_id=$1`,[row.driver_id,status]);
      if(row.availability_status!==status) await event(db,'DriverAvailabilityChanged',row,context,{availability:status});
      return project({...row,availability_status:status},pii,true);
    });
  }
  async function heartbeat(request,context) {
    const value=location(request),actor=await identity.authorize('driver:location','',context);
    if(actor.role!=='DRIVER') throw {code:grpc.status.PERMISSION_DENIED};
    return transaction(pool,async db=>{
      const row=await own(db,actor,request);
      if(!['Available','Busy'].includes(row.availability_status) && !row.assigned_booking_id) throw {code:grpc.status.PERMISSION_DENIED};
      const clock=(await db.query("SELECT now() AS received_at, $1::timestamptz >= now()-interval '30 seconds' AND $1::timestamptz <= now()+interval '5 seconds' AS valid",[value.observedAt])).rows[0];
      if(!clock.valid) invalid();
      const stored=(await db.query('SELECT observed_at,ST_Y(current_location::geometry) AS lat,ST_X(current_location::geometry) AS lng,heading,speed,accuracy,received_at FROM driver_current_location WHERE driver_id=$1',[row.driver_id])).rows[0];
      if(stored && value.observedAt.getTime()<=stored.observed_at.getTime()) {
        const same=value.observedAt.getTime()===stored.observed_at.getTime() && value.lat===stored.lat && value.lng===stored.lng &&
          ['heading','speed','accuracy'].every(key=>value[key]===null?stored[key]===null:Number(stored[key])===value[key]);
        if(!same) invalid();
        // Duplicate telemetry does not renew the lease or create another history record.
        return {driverId:row.driver_id,acceptedAt:stored.received_at.toISOString(),availability:project(row,pii).availability};
      }
      context.assertActive();
      await db.query(`INSERT INTO driver_current_location (driver_id,current_location,heading,speed,accuracy,observed_at)
        VALUES ($1,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,$4,$5,$6,$7)
        ON CONFLICT(driver_id) DO UPDATE SET current_location=EXCLUDED.current_location,heading=EXCLUDED.heading,speed=EXCLUDED.speed,accuracy=EXCLUDED.accuracy,observed_at=EXCLUDED.observed_at,received_at=now()`,
        [row.driver_id,value.lng,value.lat,value.heading,value.speed,value.accuracy,value.observedAt]);
      await db.query('INSERT INTO driver_location_history (location_id,driver_id,current_location,observed_at) VALUES ($1,$2,ST_SetSRID(ST_MakePoint($3,$4),4326)::geography,$5)',[crypto.randomUUID(),row.driver_id,value.lng,value.lat,value.observedAt]);
      await db.query("UPDATE driver_availability SET last_heartbeat_at=now(),availability_status=CASE WHEN assigned_booking_id IS NOT NULL THEN 'Busy' ELSE availability_status END,updated_at=now() WHERE driver_id=$1",[row.driver_id]);
      return {driverId:row.driver_id,acceptedAt:clock.received_at.toISOString(),availability:row.assigned_booking_id?'BUSY':project(row,pii).availability};
    });
  }
  async function decideDriver(request,context) {
    if(!uuid.test(request.driverId || '') || !['APPROVE','REJECT'].includes(request.decision) ||
      (request.decision==='REJECT' && !request.reason?.trim())) invalid();
    const actor=await identity.authorize('driver:approve','',context);
    if(!['STAFF','ADMIN'].includes(actor.role)) throw {code:grpc.status.PERMISSION_DENIED};
    return transaction(pool,async db=>{
      const row=(await db.query('SELECT d.*,a.availability_status FROM drivers d JOIN driver_availability a USING(driver_id) WHERE d.driver_id=$1 FOR UPDATE OF d,a',[request.driverId])).rows[0];
      if(!row) throw {code:grpc.status.NOT_FOUND};
      const target=request.decision==='APPROVE'?'Active':'Rejected';
      if(row.approval_status===target) return project(row,pii);
      if(row.approval_status!=='Pending') throw {code:grpc.status.FAILED_PRECONDITION};
      if(!(await db.query('SELECT 1 FROM vehicles WHERE driver_id=$1 AND active LIMIT 1',[row.driver_id])).rowCount ||
         Number((await db.query('SELECT count(*) FROM driver_documents WHERE driver_id=$1',[row.driver_id])).rows[0].count)<3) throw {code:grpc.status.FAILED_PRECONDITION};
      context.assertActive();
      // Identity first: partial failure leaves the local profile Pending, which still cannot go Online.
      await identity.decide({accountId:row.account_id,driverId:row.driver_id,status:target,reason:request.reason || ''},context);
      context.assertActive();
      const sealed=request.reason?pii.encrypt(request.reason,'drivers:'+row.driver_id+':decision'):null;
      const protectedReason=sealed?{ciphertext:sealed.ciphertext,keyId:sealed.keyId,iv:sealed.iv.toString('base64'),tag:sealed.tag.toString('base64')}:null;
      await db.query('UPDATE drivers SET approval_status=$2::varchar,approved_by=$3,approved_at=CASE WHEN $2::varchar=\'Active\' THEN now() ELSE NULL END,rejection_reason=$4,updated_at=now() WHERE driver_id=$1',[row.driver_id,target,actor.accountId,target==='Rejected'?JSON.stringify(protectedReason):null]);
      await db.query('UPDATE driver_documents SET status=$2 WHERE driver_id=$1',[row.driver_id,target==='Active'?'Approved':'Rejected']);
      await db.query("UPDATE driver_availability SET availability_status='Offline',available_since=NULL,updated_at=now() WHERE driver_id=$1",[row.driver_id]);
      await event(db,target==='Active'?'DriverApproved':'DriverRejected',row,context,{actorId:actor.accountId});
      await event(db,'NotificationRequested',row,context,{templateCode:target==='Active'?'DriverApproved':'DriverRejected'});
      return project({...row,approval_status:target,availability_status:'Offline'},pii);
    });
  }
  async function getNearbyDrivers(request,context) {
    const value=nearby(request),actor=await identity.authorize('driver:nearby','',context);
    if(!['STAFF','ADMIN'].includes(actor.role)) throw {code:grpc.status.PERMISSION_DENIED};
    const status={ONLINE:'Available',OFFLINE:'Offline',BUSY:'Busy'}[value.status] || '';
    const result=await pool.query({text:`WITH candidates AS (
      SELECT d.*, CASE WHEN d.approval_status='Active' AND a.last_heartbeat_at>=now()-interval '30 seconds'
        THEN a.availability_status ELSE 'Offline' END AS availability_status,
        ST_Distance(l.current_location,ST_SetSRID(ST_MakePoint($1,$2),4326)::geography)/1000 AS distance_km
      FROM driver_current_location l JOIN drivers d USING(driver_id) LEFT JOIN driver_availability a USING(driver_id)
      WHERE ST_DWithin(l.current_location,ST_SetSRID(ST_MakePoint($1,$2),4326)::geography,$3)),
      filtered AS (SELECT * FROM candidates WHERE $4='' OR availability_status=$4),
      paged AS (SELECT * FROM filtered ORDER BY distance_km,driver_id LIMIT $5 OFFSET $6)
      SELECT paged.*,stats.total FROM (SELECT count(*)::text AS total FROM filtered) stats LEFT JOIN paged ON true ORDER BY distance_km,driver_id`,
      values:[value.lng,value.lat,value.radiusKm*1000,status,value.limit,value.page*value.limit],query_timeout:700});
    context.assertActive();
    const total=Number(result.rows[0].total);
    return {items:result.rows.filter(row=>row.driver_id).map(row=>({...project(row,pii),distanceKm:row.distance_km})),
      meta:{page:value.page,limit:value.limit,totalItems:String(total),totalPages:String(Math.ceil(total/value.limit))}};
  }
  async function listDrivers(request,context) {
    const actor=await identity.authorize('driver:nearby','',context);
    if(!['STAFF','ADMIN'].includes(actor.role)) throw {code:grpc.status.PERMISSION_DENIED};
    const page=request.pagination?.page ?? 0,limit=request.pagination?.limit ?? 20;
    if(!Number.isInteger(page) || page<0 || !Number.isInteger(limit) || limit<1 || limit>100 ||
      (request.approvalStatus && !['PENDING','ACTIVE','REJECTED','SUSPENDED'].includes(request.approvalStatus)) ||
      (request.availability && !['ONLINE','OFFLINE','BUSY'].includes(request.availability)) ||
      (request.driverId && !uuid.test(request.driverId)) ||
      (request.serviceType && !['MOTORBIKE','CAR_4_SEATS'].includes(request.serviceType))) invalid();
    const status={PENDING:'Pending',ACTIVE:'Active',REJECTED:'Rejected',SUSPENDED:'Suspended'}[request.approvalStatus] || null;
    const availability={ONLINE:'Available',OFFLINE:'Offline',BUSY:'Busy'}[request.availability] || null;
    const phone=request.phone ? request.phone.replace(/^0/,'+84') : null;
    const rows=(await pool.query({text:`SELECT d.*,a.availability_status,a.last_heartbeat_at FROM drivers d
      JOIN driver_availability a USING(driver_id)
      WHERE ($1::varchar IS NULL OR d.approval_status=$1)
        AND ($2::uuid IS NULL OR d.driver_id=$2)
        AND ($3::bytea IS NULL OR d.phone_hash=$3)
        AND ($4::varchar IS NULL OR EXISTS(SELECT 1 FROM vehicles v WHERE v.driver_id=d.driver_id AND v.service_type=$4))
      ORDER BY d.created_at DESC,d.driver_id`,values:[status,request.driverId || null,phone?pii.hmac(phone):null,request.serviceType || null],query_timeout:700})).rows;
    context.assertActive();
    const items=rows.map(row=>project({...row,availability_status:row.approval_status==='Active' && row.last_heartbeat_at>=new Date(Date.now()-30000)?row.availability_status:'Offline'},pii))
      .filter(item=>(!availability || item.availability===request.availability) && (!request.name || item.fullName.toLocaleLowerCase().includes(request.name.toLocaleLowerCase())));
    const total=items.length;
    return {items:items.slice(page*limit,(page+1)*limit),meta:{page,limit,totalItems:String(total),totalPages:String(Math.ceil(total/limit))}};
  }
  async function getEligibleDrivers(request,context) {
    try {verify(context.token,'driver:eligible');}catch{verify(context.token,'booking:matching');}
    const point=request.pickup;
    if(!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180 ||
      request.radiusKm!==5 || !['MOTORBIKE','CAR_4_SEATS'].includes(request.serviceType) || !Number.isInteger(request.maxCandidates) || request.maxCandidates<1 || request.maxCandidates>10) invalid();
    const allowed=[];let offset=0;
    while(allowed.length<request.maxCandidates){
    const rows=(await pool.query({text:`SELECT d.driver_id,d.account_id,a.available_since,
      ST_Distance(l.current_location,ST_SetSRID(ST_MakePoint($1,$2),4326)::geography)/1000 AS distance_km
      FROM driver_current_location l JOIN drivers d USING(driver_id) JOIN driver_availability a USING(driver_id)
      WHERE d.approval_status='Active' AND a.availability_status='Available' AND a.assigned_booking_id IS NULL AND a.last_heartbeat_at>=now()-interval '30 seconds'
        AND l.observed_at>=now()-interval '30 seconds' AND l.observed_at<=now()+interval '5 seconds'
        AND EXISTS (SELECT 1 FROM vehicles v WHERE v.driver_id=d.driver_id AND v.active AND v.service_type=$3)
        AND ST_DWithin(l.current_location,ST_SetSRID(ST_MakePoint($1,$2),4326)::geography,5000)
      ORDER BY distance_km,a.available_since,d.driver_id LIMIT $4 OFFSET $5`,values:[point.lng,point.lat,request.serviceType,10,offset],query_timeout:700})).rows;
    context.assertActive();
    const active=new Set(rows.length?await identity.inspectAccounts(rows.map(row=>row.account_id),context):[]);
    allowed.push(...rows.filter(row=>active.has(row.account_id)).slice(0,request.maxCandidates-allowed.length));
    if(rows.length<10)break;offset+=10;
    }
    return {items:allowed.map(row=>({driverId:row.driver_id,status:'ACTIVE',availability:'ONLINE',distanceKm:row.distance_km})),meta:{page:0,limit:request.maxCandidates,totalItems:String(allowed.length),totalPages:allowed.length?'1':'0'}};
  }
  async function expireHeartbeats() {
    return transaction(pool,async db=>{
      const rows=(await db.query(`WITH stale AS (SELECT driver_id FROM driver_availability
        WHERE availability_status IN ('Available','Busy') AND (last_heartbeat_at IS NULL OR last_heartbeat_at<now()-interval '30 seconds')
        FOR UPDATE SKIP LOCKED)
        UPDATE driver_availability a SET availability_status='Offline',available_since=NULL,updated_at=now() FROM stale WHERE a.driver_id=stale.driver_id RETURNING a.driver_id`)).rows;
      for(const row of rows) await event(db,'DriverHeartbeatExpired',row,{correlationId:crypto.randomUUID()},{availability:'Offline'});
      return rows.length;
    });
  }
  return {setAvailability,heartbeat,decideDriver,getNearbyDrivers,listDrivers,getEligibleDrivers,expireHeartbeats};
}
module.exports={createOperations};
