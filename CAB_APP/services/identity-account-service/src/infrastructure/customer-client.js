'use strict';
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('node:path');
function createCustomerClient(config, tokens, env=process.env) {
  const definition=protoLoader.loadSync(path.join(config.protoRoot,'customer.proto'),{includeDirs:[config.protoRoot],defaults:true,keepCase:false});
  const Customer=grpc.loadPackageDefinition(definition).cab.customer.v1.CustomerService;
  const client=new Customer((env.CUSTOMER_GRPC_HOST || 'customer-service')+':'+(env.CUSTOMER_GRPC_PORT || 9092),grpc.credentials.createInsecure());
  return { async create(payload,context) {
    const metadata=new grpc.Metadata(); metadata.set('x-correlation-id',context.correlationId);
    metadata.set('authorization','Bearer '+tokens.profileToken(payload.accountId));
    const deadline=Math.min(Date.now()+1500,context.deadline-150);
    if (deadline<=Date.now()) throw { code:grpc.status.DEADLINE_EXCEEDED };
    return new Promise((resolve,reject)=>client.createProfile(payload,metadata,{deadline},(error,result)=>error?reject(error):resolve(result)));
  },close() { client.close(); } };
}
module.exports={createCustomerClient};
