'use strict';
const { randomUUID } = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const { AuthError } = require('../domain/auth');
function createAuthHandlers(service) {
  return Object.fromEntries(Object.entries(service).map(([method, action])=>[method,async(call,callback)=>{
    try {
      const correlation=call.metadata.get('x-correlation-id');
      if (correlation.length>1 || (correlation.length===1 && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(correlation[0]))) throw new AuthError('INVALID_ARGUMENT');
      const authorization=call.metadata.get('authorization');
      const context={correlationId:correlation[0] || randomUUID(),deadline:Number(call.getDeadline()),authorization:authorization.length===1 && /^Bearer /.test(authorization[0])?authorization[0].slice(7):'',
        assertActive() { if (call.cancelled || Date.now()>=this.deadline) throw new AuthError('DEADLINE_EXCEEDED',grpc.status.DEADLINE_EXCEEDED); } };
      const result=await action(call.request,context);
      const metadata=new grpc.Metadata();metadata.set('x-correlation-id',context.correlationId);call.sendMetadata(metadata);
      callback(null,result);
    } catch(error) {
      if (error instanceof AuthError) {
        const metadata=new grpc.Metadata();metadata.set('cab-error-code',error.code);
        callback({code:error.grpcCode,details:'Authentication operation rejected',metadata});
      } else if ([grpc.status.INVALID_ARGUMENT,grpc.status.UNAUTHENTICATED,grpc.status.PERMISSION_DENIED,grpc.status.NOT_FOUND,grpc.status.FAILED_PRECONDITION,grpc.status.UNAVAILABLE,grpc.status.DEADLINE_EXCEEDED,grpc.status.ALREADY_EXISTS].includes(error.code)) callback({code:error.code,details:'Required service could not complete the operation'});
      else callback({code:grpc.status.UNAVAILABLE,details:'Authentication dependency unavailable'});
    }
  }]));
}
module.exports={createAuthHandlers};
