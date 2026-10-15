'use strict';
const crypto=require('node:crypto');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createMatching(pool){
  return async(request,context)=>{
    if(!uuid.test(request.bookingId || '') || !uuid.test(request.tripId || '') || !['DriverAssigned','NoDriverFound'].includes(request.targetState) ||
      (request.targetState==='DriverAssigned'?!uuid.test(request.driverId || ''):!!request.driverId))throw {code:3};
    const db=await pool.connect();
    try{
      await db.query('BEGIN');await db.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='400ms'");
      let row=(await db.query('SELECT * FROM trips WHERE trip_id=$1 AND booking_id=$2 FOR UPDATE',[request.tripId,request.bookingId])).rows[0];
      if(!row)throw {code:5};
      // A lost assignment acknowledgement may be retried after the Driver has progressed.
      // Preserve the original assignment without rolling an active Trip back to Assigned.
      const alreadyAssigned=request.targetState==='DriverAssigned' && row.driver_id===request.driverId && ['DriverAssigned','DriverArrived','PickedUp','InProgress','Completed'].includes(row.state);
      if(!alreadyAssigned && (row.state!==request.targetState || (row.driver_id || '')!==(request.driverId || ''))){
        if(row.state!=='Searching')throw {code:9};context.assertActive();
        const previous=row.state;
        row=(await db.query("UPDATE trips SET state=$2::varchar,driver_id=$3,assigned_at=CASE WHEN $2::varchar='DriverAssigned' THEN now() ELSE assigned_at END,version=version+1,updated_at=now() WHERE trip_id=$1 RETURNING *",[row.trip_id,request.targetState,request.driverId || null])).rows[0];
        await db.query('INSERT INTO trip_status_history(history_id,trip_id,from_state,to_state,correlation_id) VALUES ($1,$2,$3,$4,$5)',[crypto.randomUUID(),row.trip_id,previous,row.state,context.correlationId]);
        await db.query('INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES ($1,$2,$3,$4,$5)',[crypto.randomUUID(),row.state==='DriverAssigned'?'DriverAssigned':'NoDriverFound',row.trip_id,context.correlationId,{tripId:row.trip_id,bookingId:row.booking_id,...(row.driver_id?{driverId:row.driver_id}:{})}]);
      }
      await db.query('COMMIT');return {tripId:row.trip_id,bookingId:row.booking_id,driverId:row.driver_id || '',status:row.state};
    }catch(error){await db.query('ROLLBACK');throw error;}finally{db.release();}
  };
}
module.exports={createMatching};
