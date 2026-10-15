'use strict';
const grpc=require('@grpc/grpc-js'),loader=require('@grpc/proto-loader'),path=require('node:path');
function createClients(config,env=process.env){
  const cab=grpc.loadPackageDefinition(loader.loadSync(['identity','trip'].map(name=>path.join(config.protoRoot,name+'.proto')),{includeDirs:[config.protoRoot],defaults:true})).cab;
  const clients={identity:new cab.identity.v1.IdentityAccountService((env.IDENTITY_ACCOUNT_GRPC_HOST || 'identity-account-service')+':'+(env.IDENTITY_ACCOUNT_GRPC_PORT || 9091),grpc.credentials.createInsecure()),trip:new cab.trip.v1.TripService((env.TRIP_GRPC_HOST || 'trip-service')+':'+(env.TRIP_GRPC_PORT || 9095),grpc.credentials.createInsecure())};
  function invoke(name,method,value,context){const metadata=new grpc.Metadata();metadata.set('authorization','Bearer '+context.token);metadata.set('x-correlation-id',context.correlationId);return new Promise((resolve,reject)=>clients[name][method](value,metadata,{deadline:Math.min(Date.now()+700,context.deadline-30)},(error,result)=>error?reject(error):resolve(result)));}
  return {authorize:(permission,id,ctx)=>invoke('identity','authorizeAccess',{permission,resourceId:id},ctx),trip:(id,ctx)=>invoke('trip','getTrip',{id},ctx),close(){Object.values(clients).forEach(client=>client.close());}};
}
module.exports={createClients};
