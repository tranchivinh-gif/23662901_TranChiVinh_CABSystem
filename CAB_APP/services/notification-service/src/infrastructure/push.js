'use strict';
// Demo provider ledger is separate from the delivery transaction, as an external provider would be.
function createPush(pool){return {async send(notification){
  const existing=(await pool.query('SELECT provider_reference FROM mock_push_deliveries WHERE notification_id=$1',[notification.notification_id])).rows[0];if(existing)return existing.provider_reference;
  const control=(await pool.query('WITH current AS MATERIALIZED (SELECT * FROM mock_push_controls WHERE recipient_id=$1 FOR UPDATE), changed AS (UPDATE mock_push_controls t SET failures_left=GREATEST(c.failures_left-1,0) FROM current c WHERE t.recipient_id=c.recipient_id RETURNING t.recipient_id) SELECT c.always_fail,c.failures_left FROM current c JOIN changed USING(recipient_id)',[notification.recipient_id])).rows[0];
  if(control?.always_fail || control?.failures_left>0)throw Object.assign(new Error('Push unavailable'),{safeCode:'PUSH_PROVIDER_UNAVAILABLE'});
  const reference='mock_push_'+notification.notification_id;
  return (await pool.query('INSERT INTO mock_push_deliveries(notification_id,provider_reference) VALUES($1,$2) ON CONFLICT(notification_id) DO UPDATE SET provider_reference=mock_push_deliveries.provider_reference RETURNING provider_reference',[notification.notification_id,reference])).rows[0].provider_reference;
}};}
module.exports={createPush};
