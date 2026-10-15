'use strict';
const crypto=require('node:crypto'),{owners,topicFor}=require('./config');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const eventUuid=/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function permanent(code){return Object.assign(new Error(code),{permanent:true,safeCode:code});}
function hash(value){return crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest();}
function deliveryId(source){const bytes=hash(source).subarray(0,16);bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=bytes.toString('hex');return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-');}
function validate(value,topic,key){
  const fields=['eventId','eventType','eventVersion','occurredAt','producer','correlationId','aggregateId','payload'];
  if(!value || Array.isArray(value) || typeof value!=='object' || Object.keys(value).length!==fields.length || fields.some(field=>!Object.hasOwn(value,field)) ||
    !eventUuid.test(value.eventId || '') || !uuid.test(value.aggregateId || '') || !uuid.test(value.correlationId || '') || !owners.includes(value.producer) || value.eventVersion!=='1.0' ||
    typeof value.eventType!=='string' || !value.eventType || typeof value.occurredAt!=='string' || !/^\d{4}-\d\d-\d\dT/.test(value.occurredAt) || !Number.isFinite(Date.parse(value.occurredAt)) || !value.payload || Array.isArray(value.payload) || typeof value.payload!=='object')throw permanent('INVALID_EVENT_ENVELOPE');
  if(topic && topic!==topicFor(value.producer) && topic!=='cab.audit.events.v1')throw permanent('EVENT_TOPIC_MISMATCH');
  if(key!==undefined && key!==value.aggregateId)throw permanent('EVENT_KEY_MISMATCH');
  return value;
}
function fromRow(row){return validate({eventId:row.event_id,eventType:row.event_type,eventVersion:row.event_version,occurredAt:row.occurred_at.toISOString(),producer:row.producer,correlationId:row.correlation_id,aggregateId:row.aggregate_id,payload:row.payload});}
module.exports={uuid,eventUuid,permanent,hash,deliveryId,validate,fromRow};
