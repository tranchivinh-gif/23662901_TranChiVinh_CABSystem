'use strict';
const crypto=require('node:crypto'),grpc=require('@grpc/grpc-js');
const {uuid}=require('../domain/booking');
function handler(action) {
  return async(call,callback)=>{
    try {
      const auth=call.metadata.get('authorization'),ids=call.metadata.get('x-correlation-id');
      if(auth.length!==1 || !/^Bearer [^\s]+$/i.test(auth[0]) || auth[0].length>8200) throw {code:16};
      if(ids.length>1 || (ids.length===1 && !uuid.test(ids[0]))) throw {code:3};
      const context={token:auth[0].slice(7),correlationId:ids[0] || crypto.randomUUID(),deadline:Number(call.getDeadline()),
        assertActive(){if(call.cancelled || Date.now()>=this.deadline)throw {code:4};}};
      context.assertActive();const value=await action(call.request,context);context.assertActive();
      const metadata=new grpc.Metadata();metadata.set('x-correlation-id',context.correlationId);call.sendMetadata(metadata);callback(null,value);
    } catch(error) {
      const metadata=new grpc.Metadata();if(error.businessCode)metadata.set('cab-error-code',error.businessCode);
      // Preserve safe downstream business errors, never expose SQL/provider text.
      const downstream=error.metadata?.get('cab-error-code')?.[0];if(downstream)metadata.set('cab-error-code',downstream);
      callback({code:[3,4,5,6,7,9,10,14,16].includes(error.code)?error.code:grpc.status.UNAVAILABLE,details:'Booking operation could not complete',metadata});
    }
  };
}
module.exports={handler};
