'use strict';
const crypto=require('node:crypto');
function createAuditConsumer(){return async(db,event)=>{
  if(event.producer==='identity-account-service')return;
  const fields=['actorId','action','before','after','tripId','bookingId','driverId','customerId','paymentId','offerId','recipientId','availability','status','safeErrorCode'];
  const safe=Object.fromEntries(fields.filter(field=>Object.hasOwn(event.payload,field)).map(field=>[field,event.payload[field]]));
  await db.query("INSERT INTO audit_events(audit_id,actor_id,event_type,aggregate_id,correlation_id,safe_metadata,occurred_at) VALUES($1,$2,'AsyncDomainEventObserved',$3,$4,$5,$6)",[crypto.randomUUID(),event.payload.actorId || null,event.aggregateId,event.correlationId,{...safe,sourceEventId:event.eventId,sourceEventType:event.eventType,sourceProducer:event.producer},event.occurredAt]);
};}
module.exports={createAuditConsumer};
