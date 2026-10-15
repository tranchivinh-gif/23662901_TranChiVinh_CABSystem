'use strict';
const crypto = require('node:crypto');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function fail(businessCode='INVALID_ARGUMENT',code=3){throw {businessCode,code};}
function key(value){if(typeof value!=='string' || !value.trim() || value.length>200)fail();return value;}
function fingerprint(value){return crypto.createHash('sha256').update(JSON.stringify(value)).digest();}
function signature(secret,timestamp,reference,amount,status){return crypto.createHmac('sha256',Buffer.from(secret,'hex')).update(`${timestamp}.${reference}.${amount}.${status}`).digest('hex');}
function callback(value,secret,now=Date.now()){
  if(value.provider!=='mock' || typeof value.providerReference!=='string' || !value.providerReference || value.providerReference.length>200 ||
    value.amount?.currency!=='VND' || !/^(0|[1-9]\d*)$/.test(String(value.amount?.amount)) || !Number.isSafeInteger(Number(value.amount.amount)) ||
    !['COMPLETED','FAILED'].includes(value.status) || !/^\d{10}$/.test(String(value.timestamp)))fail();
  const amount=Number(value.amount.amount),timestamp=Number(value.timestamp);
  const expected=signature(secret,timestamp,value.providerReference,amount,value.status);
  if(!/^[a-f0-9]{64}$/.test(value.signature || '') || !crypto.timingSafeEqual(Buffer.from(expected,'hex'),Buffer.from(value.signature,'hex')))fail('INVALID_WEBHOOK_SIGNATURE',16);
  if(Math.abs(Math.floor(now/1000)-timestamp)>300)fail('WEBHOOK_REPLAY_REJECTED',9);
  return {amount,timestamp,status:value.status==='COMPLETED'?'Succeeded':'Failed',eventId:fingerprint([value.provider,value.providerReference,amount,value.status]).toString('hex')};
}
function retry(row,attempt,now=Date.now()){
  if(row.method!=='Electronic' || row.status!=='Failed' || !attempt || attempt.status!=='Failed')fail('PAYMENT_NOT_RETRYABLE',9);
  if(attempt.attempt_no>=3 || now-row.created_at.getTime()>=86400000)fail('PAYMENT_RETRY_LIMIT_REACHED',9);
}
function summary(row,attempt){return {paymentId:row.payment_id,tripId:row.trip_id,amount:{amount:row.amount,currency:'VND'},method:row.method.toUpperCase(),status:{Pending:'PENDING',Succeeded:'COMPLETED',Failed:'FAILED'}[row.status],providerReference:attempt?.provider_reference || '',attemptNo:attempt?.attempt_no || 0,provider:attempt?'mock':'',checkoutToken:attempt?.checkout_token || ''};}
module.exports={uuid,fail,key,fingerprint,signature,callback,retry,summary};
