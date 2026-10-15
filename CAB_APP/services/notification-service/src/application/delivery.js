'use strict';
const crypto=require('node:crypto'),{policy}=require('../domain/notification');
function createDelivery({pool,provider,pii}){
  let timer,pending,stopping=false;
  async function tick(){if(pending)return pending;pending=(async()=>{
    const db=await pool.connect();try{await db.query('BEGIN');
      const row=(await db.query("SELECT * FROM notifications WHERE channel='Push' AND status IN ('Pending','Failed') AND (next_retry_at IS NULL OR next_retry_at<=now()) ORDER BY created_at,notification_id LIMIT 1 FOR UPDATE SKIP LOCKED")).rows[0];
      if(!row){await db.query('COMMIT');return false;}
      const rule=policy(row.delivery_policy),attempt=row.attempt_count+1;let reference,failure;
      try{const content=JSON.parse(pii.decrypt({ciphertext:row.content_ciphertext,keyId:row.content_key_id,iv:row.content_iv,tag:row.content_tag},'notifications:'+row.notification_id+':content'));reference=await provider.send(row,content);}catch{failure='PUSH_PROVIDER_UNAVAILABLE';}
      await db.query('INSERT INTO notification_attempts(attempt_id,notification_id,attempt_no,status,provider_reference,safe_error_code) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),row.notification_id,attempt,failure?'Failed':'Sent',reference || null,failure || null]);
      const terminal=Boolean(failure && attempt>rule.retryMax),status=failure?(terminal?'DeadLetter':'Failed'):'Sent';
      await db.query('UPDATE notifications SET status=$2,attempt_count=$3,retry_count=$4,next_retry_at=CASE WHEN $5::integer IS NULL THEN NULL ELSE now()+($5*interval \'1 second\') END,updated_at=now() WHERE notification_id=$1',[row.notification_id,status,attempt,Math.min(failure?attempt:attempt-1,3),failure && !terminal?rule.backoffSeconds[attempt-1]:null]);
      if(!failure || terminal)await db.query('INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),terminal?'NotificationFailed':'NotificationDelivered',row.notification_id,row.correlation_id,{notificationId:row.notification_id,recipientId:row.recipient_id,sourceEventId:row.event_id,templateCode:row.template_code,channel:'Push',attemptCount:attempt,...(terminal?{safeErrorCode:failure}:{})}]);
      await db.query('COMMIT');return true;
    }catch(error){await db.query('ROLLBACK').catch(()=>{});throw error;}finally{db.release();}
  })().finally(()=>{pending=undefined;});return pending;}
  return {tick,start(){timer=setInterval(()=>{if(!stopping)tick().catch(()=>{});},250);timer.unref();},async stop(){stopping=true;clearInterval(timer);await pending?.catch(()=>{});}};
}
module.exports={createDelivery};
