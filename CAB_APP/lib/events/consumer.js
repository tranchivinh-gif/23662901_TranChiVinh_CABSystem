'use strict';
const {validate,hash,deliveryId,permanent,uuid}=require('./envelope'),{retrySeconds}=require('./config');
function createInbox({pool,group,handle}){
  async function transaction(action){const db=await pool.connect();try{await db.query('BEGIN');await db.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='500ms'");const value=await action(db);await db.query('COMMIT');return value;}catch(error){await db.query('ROLLBACK').catch(()=>{});throw error;}finally{db.release();}}
  async function deadLetter(db,row,code,attempts){await db.query("UPDATE kafka_inbox SET status='DeadLetter',attempt_count=$2,safe_error_code=$3 WHERE event_id=$1",[row.event_id,attempts,code]);await db.query('INSERT INTO kafka_dead_letters(event_id,aggregate_id,correlation_id,original_envelope,exception_code,consumer_name,attempt_count,source_topic,source_partition,source_offset) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING',[row.event_id,uuid.test(row.envelope.aggregateId || '')?row.envelope.aggregateId:row.event_id,uuid.test(row.envelope.correlationId || '')?row.envelope.correlationId:row.event_id,row.envelope,code,group,attempts,row.source_topic,row.source_partition,row.source_offset]);}
  async function receive({topic,partition,message}){
    const raw=message.value?.toString() || '';let event,error;try{event=JSON.parse(raw);validate(event,topic,message.key?.toString());}catch(caught){error=caught.permanent?caught:permanent('INVALID_EVENT_JSON');}
    const id=!error?event.eventId:deliveryId(topic+':'+partition+':'+message.offset),envelope=!error?event:(event && typeof event==='object' && !Array.isArray(event)?event:{rawBase64:Buffer.from(raw).toString('base64')});
    await transaction(async db=>{const inserted=(await db.query('INSERT INTO kafka_inbox(event_id,source_topic,source_partition,source_offset,envelope,request_hash) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(event_id) DO NOTHING RETURNING *',[id,topic,partition,message.offset,envelope,hash(raw)])).rows[0];
      if(inserted && error)await deadLetter(db,inserted,error.safeCode,0);
    });
  }
  async function process(){return transaction(async db=>{const row=(await db.query("SELECT * FROM kafka_inbox WHERE status='Pending' AND next_attempt_at<=now() ORDER BY received_at,event_id LIMIT 1 FOR UPDATE SKIP LOCKED")).rows[0];if(!row)return false;
    await db.query('SAVEPOINT business_effect');
    try{const receipt=await db.query('INSERT INTO processed_events(event_id,consumer_group) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING event_id',[row.event_id,group]);if(receipt.rowCount)await handle(db,row.envelope);await db.query("UPDATE kafka_inbox SET status='Done',attempt_count=attempt_count+1,safe_error_code=NULL WHERE event_id=$1",[row.event_id]);}
    catch(error){await db.query('ROLLBACK TO SAVEPOINT business_effect');const attempts=row.attempt_count+1,code=error.safeCode || 'CONSUMER_DEPENDENCY_UNAVAILABLE';if(error.permanent || attempts>retrySeconds.length)await deadLetter(db,row,code,attempts);else await db.query("UPDATE kafka_inbox SET attempt_count=$2,safe_error_code=$3,next_attempt_at=now()+($4*interval '1 second') WHERE event_id=$1",[row.event_id,attempts,code,retrySeconds[attempts-1]]);}
    return true;
  });}
  return {receive,process};
}
module.exports={createInbox};
