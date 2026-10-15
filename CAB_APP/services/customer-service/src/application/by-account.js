'use strict';
const grpc=require('@grpc/grpc-js');
function createByAccount(pool,identity) {
  return async(request,context)=>{
    const actor=await identity.authorize('customer:read','',context);
    if(actor.role!=='CUSTOMER' || request.id!==actor.accountId)throw {code:grpc.status.PERMISSION_DENIED};
    const row=(await pool.query({text:'SELECT customer_id,account_id,status FROM customers WHERE account_id=$1',values:[actor.accountId],query_timeout:350})).rows[0];
    if(!row)throw {code:grpc.status.NOT_FOUND};
    return {customerId:row.customer_id,accountId:row.account_id,status:row.status.toUpperCase()};
  };
}
module.exports={createByAccount};
