'use strict';
const crypto=require('node:crypto'),{intent,policy}=require('../domain/notification'),{permanent}=require('../../../../lib/events/envelope');
function createNotificationConsumer({clients,pii}){return async(db,event)=>{
  const requested=intent(event);if(!requested)return;
  const recipients=new Set(),cid=event.correlationId;
  if(requested.customer)recipients.add(await clients.resolve('customer',event.payload.customerId,cid));
  if(requested.driver){if(event.payload.accountId)recipients.add(event.payload.accountId);else if(event.payload.driverId)recipients.add(await clients.resolve('driver',event.payload.driverId,cid));}
  if(requested.staff)for(const id of await clients.operators(['STAFF'],cid))recipients.add(id);
  if(requested.admin)for(const id of await clients.operators(['ADMIN'],cid))recipients.add(id);
  const template=(await db.query('SELECT * FROM notification_templates WHERE template_code=$1 AND active ORDER BY version DESC LIMIT 1',[requested.template])).rows[0];
  if(!template)throw permanent('NOTIFICATION_TEMPLATE_UNAVAILABLE');
  const rule=(await db.query('SELECT policy FROM notification_delivery_policies WHERE effective_from<=now() ORDER BY effective_from DESC,version DESC LIMIT 1')).rows[0];
  const deliveryPolicy=policy(rule?.policy),references={};
  for(const field of ['bookingId','tripId','offerId','paymentId','driverId','expiresAt','notificationId','safeErrorCode'])if(event.payload[field])references[field]=event.payload[field];
  for(const recipient of recipients)for(const channel of requested.channels){const id=crypto.randomUUID(),encrypted=pii.encrypt(JSON.stringify({title:template.title_template,body:template.body_template,...references}),'notifications:'+id+':content');
    await db.query(`INSERT INTO notifications(notification_id,recipient_id,event_id,template_code,template_version,channel,status,content_ciphertext,content_key_id,content_iv,content_tag,correlation_id,delivery_policy)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT(event_id,recipient_id,channel,template_code) DO NOTHING`,[id,recipient,event.eventId,requested.template,template.version,channel,channel==='InApp'?'Sent':'Pending',encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag,cid,deliveryPolicy]);
  }
};}
module.exports={createNotificationConsumer};
