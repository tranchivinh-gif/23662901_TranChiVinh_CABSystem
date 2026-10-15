'use strict';
const grpc=require('@grpc/grpc-js'),crypto=require('node:crypto');
function matchingHandler(action,verify){
  return async(call,callback)=>{
    try{
      const entries=call.metadata.get('authorization'),ids=call.metadata.get('x-correlation-id');
      if(entries.length!==1 || !/^Bearer [^\s]+$/.test(entries[0]))throw {code:16};verify(entries[0].slice(7));
      if(ids.length!==1 || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(ids[0]))throw {code:3};
      const context={correlationId:ids[0] || crypto.randomUUID(),deadline:Number(call.getDeadline()),assertActive(){if(call.cancelled || Date.now()>=this.deadline)throw {code:4};}};
      context.assertActive();callback(null,await action(call.request,context));
    }catch(error){callback({code:[3,4,5,6,7,9,14,16].includes(error.code)?error.code:grpc.status.UNAVAILABLE,details:'Matching decision could not complete'});}
  };
}
module.exports={matchingHandler};
