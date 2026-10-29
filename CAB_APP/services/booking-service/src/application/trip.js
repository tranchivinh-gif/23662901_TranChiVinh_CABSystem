'use strict';
const {uuid,calculate}=require('../domain/booking');
const {transaction}=require('../infrastructure/database/transaction');
function createTripOperations({pool,clients,matching,verify}){
  async function finalizeTrip(request,context){
    verify(context.token);
    if(!uuid.test(request.bookingId || '') || !uuid.test(request.tripId || '') || !['Completed','Cancelled'].includes(request.state))throw {code:3};
    return matching.withLock(request.bookingId,async()=>{
      const row=await transaction(pool,async db=>{
        const row=(await db.query('SELECT * FROM bookings WHERE booking_id=$1 AND trip_id=$2 FOR UPDATE',[request.bookingId,request.tripId])).rows[0];if(!row)throw {code:5};
        if(request.state==='Completed' && row.status!=='Assigned')throw {code:9};
        context.assertActive();
        if(request.state==='Cancelled')await db.query("UPDATE bookings SET status='Cancelled',version=version+1,updated_at=now() WHERE booking_id=$1 AND status<>'Cancelled'",[row.booking_id]);
        await db.query("UPDATE matching_jobs SET stage='Done',safe_error_code=NULL,updated_at=now() WHERE booking_id=$1",[row.booking_id]);
        await db.query("UPDATE driver_offers SET status='Cancelled',responded_at=now() WHERE booking_id=$1 AND status='Pending'",[row.booking_id]);
        // An accept that lost the Trip row lock to cancellation cannot resume as successful.
        await db.query("UPDATE idempotency_keys k SET response_status=409,response_body='{\"code\":\"OFFER_UNAVAILABLE\"}'::jsonb FROM matching_jobs j WHERE j.booking_id=$1 AND k.actor_id=j.accept_actor_id AND k.route=j.accept_route AND k.idempotency_key=j.accept_key AND k.response_status IS NULL",[row.booking_id]);
        return row;
      });
      const reservations=(await pool.query("SELECT driver_id FROM driver_reservations WHERE booking_id=$1 AND status='Active'",[row.booking_id])).rows;
      for(const value of reservations){const system=await clients.systemContext(context.correlationId,context.deadline);await clients.release({driverId:value.driver_id,bookingId:row.booking_id},system);await pool.query("UPDATE driver_reservations SET status='Released',released_at=now() WHERE booking_id=$1 AND driver_id=$2 AND status='Active'",[row.booking_id,value.driver_id]);}
      return {};
    },true);
  }
  async function calculateFinalFare(request,context){
    verify(context.token);
    if(!uuid.test(request.bookingId || '') || !uuid.test(request.driverId || '') || !Number.isFinite(Date.parse(request.startedAt)) || !Number.isFinite(Date.parse(request.endedAt)) || Date.parse(request.endedAt)<Date.parse(request.startedAt))throw {code:3};
    const row=(await pool.query('SELECT b.driver_id,f.* FROM bookings b JOIN fare_calculations f USING(booking_id) WHERE b.booking_id=$1',[request.bookingId])).rows[0];if(!row)throw {code:5};if(row.driver_id!==request.driverId)throw {code:7};
    const system=await clients.systemContext(context.correlationId,context.deadline);
    const distance=await clients.distance({driverId:request.driverId,startedAt:request.startedAt,endedAt:request.endedAt},system);
    const fare=calculate({...row,version:row.rule_version},distance.complete?Number(distance.distanceKm):Number(row.distance_km),0);fare.estimated=!distance.complete;return fare;
  }
  async function getTripRoute(request,context){
    verify(context.token);
    if(!uuid.test(request.bookingId || '') || !uuid.test(request.tripId || ''))throw {code:3};
    const row=(await pool.query('SELECT pickup_lat,pickup_lng,destination_lat,destination_lng FROM bookings WHERE booking_id=$1 AND trip_id=$2',[request.bookingId,request.tripId])).rows[0];
    if(!row)throw {code:5};
    return {pickup:{lat:Number(row.pickup_lat),lng:Number(row.pickup_lng)},destination:{lat:Number(row.destination_lat),lng:Number(row.destination_lng)}};
  }
  return {finalizeTrip,calculateFinalFare,getTripRoute};
}
module.exports={createTripOperations};
