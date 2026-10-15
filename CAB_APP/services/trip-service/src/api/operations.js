'use strict';
const crypto=require('node:crypto'),grpc=require('@grpc/grpc-js');
function handler(action){return async(call,callback)=>{
  try{
    const auth=call.metadata.get('authorization'),ids=call.metadata.get('x-correlation-id');
    if(auth.length!==1 || !/^Bearer [^\s]+$/.test(auth[0]) || auth[0].length>8200)throw {code:16};
    if(ids.length>1 || (ids.length===1 && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(ids[0])))throw {code:3};
    const context={token:auth[0].slice(7),correlationId:ids[0] || crypto.randomUUID(),deadline:Number(call.getDeadline()),assertActive(){if(call.cancelled || Date.now()>=this.deadline)throw {code:4};}};
    context.assertActive();const value=await action(call.request,context);context.assertActive();callback(null,value);
  }catch(error){callback({code:[3,4,5,6,7,9,10,14,16].includes(error.code)?error.code:grpc.status.UNAVAILABLE,details:'Trip operation could not complete'});}
};}
module.exports={handler};
