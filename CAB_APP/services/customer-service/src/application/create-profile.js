'use strict';
const crypto=require('node:crypto');
const grpc=require('@grpc/grpc-js');
const {profile}=require('../domain/profile');
function createProfileService(pool,pii) {
  return async (request,context={correlationId:crypto.randomUUID()}) => {
    let value;try { value=profile(request); } catch { throw {code:grpc.status.INVALID_ARGUMENT}; }
    const client=await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='400ms'");
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,2))',[request.accountId]);
      let row=(await client.query('SELECT * FROM customers WHERE account_id=$1',[request.accountId])).rows[0];
      if (row) {
        const stored=JSON.parse(pii.decrypt({ciphertext:row.profile_ciphertext,keyId:row.profile_key_id,iv:row.profile_iv,tag:row.profile_tag},'customers:'+row.customer_id+':profile'));
        if (JSON.stringify(stored)!==JSON.stringify(value)) throw {code:grpc.status.ALREADY_EXISTS};
      } else {
        const id=crypto.randomUUID(),encrypted=pii.encrypt(JSON.stringify(value),'customers:'+id+':profile');
        row=(await client.query("INSERT INTO customers (customer_id,account_id,phone_hash,profile_ciphertext,profile_key_id,profile_iv,profile_tag,status) VALUES ($1,$2,$3,$4,$5,$6,$7,'Active') RETURNING *",[id,request.accountId,value.phone?pii.hmac(value.phone):null,encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag])).rows[0];
        const history=pii.encrypt(JSON.stringify(value),'customers:'+id+':profile');
        await client.query('INSERT INTO customer_profile_history (history_id,customer_id,version,profile_ciphertext,profile_key_id,profile_iv,profile_tag,changed_by) VALUES ($1,$2,1,$3,$4,$5,$6,$7)',[crypto.randomUUID(),id,history.ciphertext,history.keyId,history.iv,history.tag,request.accountId]);
        await client.query("INSERT INTO outbox_events(event_id,event_type,aggregate_id,correlation_id,payload) VALUES($1,'CustomerProfileCreated',$2,$3,$4)",[crypto.randomUUID(),id,context.correlationId,{customerId:id,accountId:request.accountId}]);
      }
      await client.query('COMMIT');
      return {customerId:row.customer_id,accountId:row.account_id,fullName:value.fullName,status:row.status.toUpperCase()};
    } catch(error) {await client.query('ROLLBACK');throw error;}
    finally {client.release();}
  };
}
module.exports={createProfileService};
