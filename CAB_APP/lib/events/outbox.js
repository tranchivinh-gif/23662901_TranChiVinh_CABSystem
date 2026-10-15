'use strict';
const {topicFor}=require('./config'),{fromRow}=require('./envelope');
function createOutbox({pool,producer,service,afterPublish}){
  async function publish(){const db=await pool.connect();let row;
    try{await db.query('BEGIN');await db.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='500ms'");
      row=(await db.query(`SELECT e.* FROM outbox_events e WHERE e.status<>'Published' AND (e.next_attempt_at IS NULL OR e.next_attempt_at<=now())
        AND NOT EXISTS(SELECT 1 FROM outbox_events earlier WHERE earlier.aggregate_id=e.aggregate_id AND earlier.publication_sequence<e.publication_sequence AND earlier.status<>'Published')
        ORDER BY e.publication_sequence LIMIT 1 FOR UPDATE SKIP LOCKED`)).rows[0];
      if(!row){await db.query('COMMIT');return false;}
      const event=fromRow(row),topic=topicFor(service),message={key:event.aggregateId,value:JSON.stringify(event),headers:{'event-id':event.eventId,'x-correlation-id':event.correlationId}};
      await producer.sendBatch({acks:-1,topicMessages:[{topic,messages:[message]},...(topic==='cab.audit.events.v1'?[]:[{topic:'cab.audit.events.v1',messages:[message]}])]});
      await afterPublish?.(event);
      await db.query("UPDATE outbox_events SET status='Published',published_at=now(),safe_error_code=NULL WHERE event_id=$1",[row.event_id]);await db.query('COMMIT');return true;
    }catch(error){await db.query('ROLLBACK').catch(()=>{});if(row)await pool.query("UPDATE outbox_events SET status='Failed',retry_count=retry_count+1,next_attempt_at=now()+interval '1 second',safe_error_code='KAFKA_PUBLISH_UNAVAILABLE' WHERE event_id=$1 AND status<>'Published'",[row.event_id]).catch(()=>{});throw error;}
    finally{db.release();}
  }
  async function publishDeadLetter(){const db=await pool.connect();try{await db.query('BEGIN');const row=(await db.query('SELECT * FROM kafka_dead_letters WHERE published_at IS NULL ORDER BY failed_at LIMIT 1 FOR UPDATE SKIP LOCKED')).rows[0];if(!row){await db.query('COMMIT');return false;}
    const value={eventId:row.event_id,payload:row.original_envelope.payload || row.original_envelope,original:row.original_envelope,exceptionCode:row.exception_code,consumerName:row.consumer_name,attemptCount:row.attempt_count,failedAt:row.failed_at.toISOString(),source:{topic:row.source_topic,partition:row.source_partition,offset:row.source_offset}};
    await producer.send({topic:row.source_topic+'.dlq',acks:-1,messages:[{key:row.aggregate_id,value:JSON.stringify(value),headers:{'event-id':row.event_id,'x-correlation-id':row.correlation_id}}]});await db.query('UPDATE kafka_dead_letters SET published_at=now() WHERE event_id=$1',[row.event_id]);await db.query('COMMIT');return true;
  }catch(error){await db.query('ROLLBACK').catch(()=>{});throw error;}finally{db.release();}}
  return {publish,publishDeadLetter};
}
module.exports={createOutbox};
