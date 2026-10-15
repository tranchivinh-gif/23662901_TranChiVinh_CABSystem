'use strict';
const grpc=require('@grpc/grpc-js'),loader=require('@grpc/proto-loader'),path=require('node:path');
function createLifecycleClients(config,env=process.env){
  const cab=grpc.loadPackageDefinition(loader.loadSync(['identity','driver','booking','customer'].map(name=>path.join(config.protoRoot,name+'.proto')),{includeDirs:[config.protoRoot],defaults:true})).cab;
  const clients=Object.fromEntries([['identity',cab.identity.v1.IdentityAccountService,'IDENTITY_ACCOUNT',9091],['customer',cab.customer.v1.CustomerService,'CUSTOMER',9092],['driver',cab.driver.v1.DriverService,'DRIVER',9093],['booking',cab.booking.v1.BookingService,'BOOKING',9094]].map(([name,Type,prefix,port])=>[name,new Type((env[prefix+'_GRPC_HOST'] || (name==='identity'?'identity-account-service':name+'-service'))+':'+(env[prefix+'_GRPC_PORT'] || port),grpc.credentials.createInsecure())]));
  let token,expires=0,pending;
  function invoke(name,method,payload,context,budget=700){
    const metadata=new grpc.Metadata();metadata.set('authorization','Bearer '+context.token);metadata.set('x-correlation-id',context.correlationId);
    const deadline=Math.min(Date.now()+budget,context.deadline-30);if(deadline<=Date.now())throw {code:4};
    return new Promise((resolve,reject)=>clients[name][method](payload,metadata,{deadline},(error,value)=>error?reject(error):resolve(value)));
  }
  async function systemContext(correlationId,deadline=Date.now()+3500){
    if(!token || Date.now()>=expires-5000){
      if(!pending)pending=invoke('identity','issueTripToken',{}, {token:env.CAB_TRIP_SERVICE_SECRET || '',correlationId,deadline}).then(value=>{token=value.accessToken;expires=Date.now()+value.expiresIn*1000;}).finally(()=>{pending=undefined;});
      await pending;
    }
    return {token,correlationId,deadline,assertActive(){if(Date.now()>=deadline)throw {code:4};}};
  }
  return {authorize:(permission,id,ctx)=>invoke('identity','authorizeAccess',{permission,resourceId:id},ctx),
    customer:(accountId,ctx)=>invoke('customer','getByAccount',{id:accountId},ctx),driver:(accountId,ctx)=>invoke('driver','getByAccount',{id:accountId},ctx),
    systemContext,finalize:(value,ctx)=>invoke('booking','finalizeTrip',value,ctx,1400),fare:(value,ctx)=>invoke('booking','calculateFinalFare',value,ctx,1200),
    close(){for(const client of Object.values(clients))client.close();}};
}
module.exports={createLifecycleClients};
