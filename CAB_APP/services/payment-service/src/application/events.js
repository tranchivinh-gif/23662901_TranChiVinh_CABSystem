'use strict';
const crypto=require('node:crypto'),{permanent,uuid}=require('../../../../lib/events/envelope');
function createCompletedConsumer(){return async(db,event)=>{
  if(event.eventType!=='TripCompleted')return;
  const value=event.payload;
  if(event.producer!=='trip-service' || !uuid.test(value.tripId || '') || event.aggregateId!==value.tripId || !uuid.test(value.customerId || '') || !uuid.test(value.driverId || '') || !['Cash','Electronic'].includes(value.paymentMethod) || value.currency!=='VND' || !Number.isSafeInteger(value.amount) || value.amount<0)throw permanent('INVALID_COMPLETED_PAYMENT_SNAPSHOT');
  await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,12))',[value.tripId]);
  const existing=(await db.query('SELECT * FROM payments WHERE trip_id=$1',[value.tripId])).rows[0];
  if(existing){if(existing.method!==value.paymentMethod || Number(existing.amount)!==value.amount || existing.customer_id!==value.customerId || existing.driver_id!==value.driverId)throw permanent('PAYMENT_SNAPSHOT_CONFLICT');return;}
  const id=crypto.randomUUID();await db.query('INSERT INTO payments(payment_id,trip_id,method,amount,customer_id,driver_id) VALUES($1,$2,$3,$4,$5,$6)',[id,value.tripId,value.paymentMethod,value.amount,value.customerId,value.driverId]);
  await db.query("INSERT INTO payment_audit_events(audit_id,payment_id,event_type,correlation_id) VALUES($1,$2,'PaymentCreated',$3)",[crypto.randomUUID(),id,event.correlationId]);
};}
module.exports={createCompletedConsumer};
