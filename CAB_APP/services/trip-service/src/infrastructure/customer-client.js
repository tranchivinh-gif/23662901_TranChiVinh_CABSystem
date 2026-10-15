'use strict';
const grpc=require('@grpc/grpc-js'),loader=require('@grpc/proto-loader'),path=require('node:path');
function createCustomerClient(config,env=process.env) {
  const cab=grpc.loadPackageDefinition(loader.loadSync(path.join(config.protoRoot,'customer.proto'),{includeDirs:[config.protoRoot],defaults:true})).cab;
  const client=new cab.customer.v1.CustomerService((env.CUSTOMER_GRPC_HOST || 'customer-service')+':'+(env.CUSTOMER_GRPC_PORT || 9092),grpc.credentials.createInsecure());
  return {get(accountId,context){const metadata=new grpc.Metadata();metadata.set('authorization','Bearer '+context.token);metadata.set('x-correlation-id',context.correlationId);
    return new Promise((resolve,reject)=>client.getByAccount({id:accountId},metadata,{deadline:Math.min(Date.now()+700,context.deadline-30)},(error,value)=>error?reject(error):resolve(value)));},close(){client.close();}};
}
module.exports={createCustomerClient};
