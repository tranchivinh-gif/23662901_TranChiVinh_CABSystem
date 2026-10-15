'use strict';
const grpc=require('@grpc/grpc-js'),loader=require('@grpc/proto-loader'),path=require('node:path');
function createClients(config,env){
  const cab=grpc.loadPackageDefinition(loader.loadSync(['identity','customer','driver'].map(name=>path.join(config.protoRoot,name+'.proto')),{includeDirs:[config.protoRoot],defaults:true})).cab;
  const clients={identity:new cab.identity.v1.IdentityAccountService((env.IDENTITY_ACCOUNT_GRPC_HOST || 'identity-account-service')+':'+(env.IDENTITY_ACCOUNT_GRPC_PORT || 9091),grpc.credentials.createInsecure()),customer:new cab.customer.v1.CustomerService((env.CUSTOMER_GRPC_HOST || 'customer-service')+':'+(env.CUSTOMER_GRPC_PORT || 9092),grpc.credentials.createInsecure()),driver:new cab.driver.v1.DriverService((env.DRIVER_GRPC_HOST || 'driver-service')+':'+(env.DRIVER_GRPC_PORT || 9093),grpc.credentials.createInsecure())};
  let credential;
  function invoke(name,method,value,token,cid,deadline=Date.now()+700){const metadata=new grpc.Metadata();metadata.set('authorization','Bearer '+token);metadata.set('x-correlation-id',cid);return new Promise((resolve,reject)=>clients[name][method](value,metadata,{deadline:Math.min(Date.now()+700,deadline)},(error,result)=>error?reject(error):resolve(result)));}
  async function serviceToken(cid){if(!credential || credential.expiresAt<Date.now()){const result=await invoke('identity','issueNotificationToken',{},env.CAB_NOTIFICATION_SERVICE_SECRET,cid);credential={token:result.accessToken,expiresAt:Date.now()+20000};}return credential.token;}
  return {async resolve(kind,id,cid){return (await invoke(kind,'resolveAccount',{id},await serviceToken(cid),cid)).id;},async operators(roles,cid){return (await invoke('identity','listNotificationOperators',{roles},await serviceToken(cid),cid)).accountIds;},authorize:(id,context)=>invoke('identity','authorizeAccess',{permission:'notification:read',resourceId:id},context.token,context.correlationId,context.deadline-30),close(){Object.values(clients).forEach(client=>client.close());}};
}
module.exports={createClients};
