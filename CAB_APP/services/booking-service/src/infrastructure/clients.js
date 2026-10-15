'use strict';
const grpc=require('@grpc/grpc-js'),loader=require('@grpc/proto-loader'),path=require('node:path');
function createClients(config,env=process.env) {
  const definition=loader.loadSync(['identity','customer','trip','driver'].map(name=>path.join(config.protoRoot,name+'.proto')),{includeDirs:[config.protoRoot],defaults:true});
  const cab=grpc.loadPackageDefinition(definition).cab;
  const identity=new cab.identity.v1.IdentityAccountService((env.IDENTITY_ACCOUNT_GRPC_HOST || 'identity-account-service')+':'+(env.IDENTITY_ACCOUNT_GRPC_PORT || 9091),grpc.credentials.createInsecure());
  const customer=new cab.customer.v1.CustomerService((env.CUSTOMER_GRPC_HOST || 'customer-service')+':'+(env.CUSTOMER_GRPC_PORT || 9092),grpc.credentials.createInsecure());
  const trip=new cab.trip.v1.TripService((env.TRIP_GRPC_HOST || 'trip-service')+':'+(env.TRIP_GRPC_PORT || 9095),grpc.credentials.createInsecure());
  const driver=new cab.driver.v1.DriverService((env.DRIVER_GRPC_HOST || 'driver-service')+':'+(env.DRIVER_GRPC_PORT || 9093),grpc.credentials.createInsecure());
  let credential,expiresAt=0,pending;
  function invoke(client,method,payload,context,budget,capability) {
    const metadata=new grpc.Metadata();metadata.set('authorization','Bearer '+context.token);metadata.set('x-correlation-id',context.correlationId);
    if(capability)metadata.set('x-service-token',capability);
    const deadline=Math.min(Date.now()+budget,context.deadline-30);if(deadline<=Date.now())throw {code:4};
    return new Promise((resolve,reject)=>client[method](payload,metadata,{deadline},(error,value)=>error?reject(error):resolve(value)));
  }
  return {authorize:(permission,resourceId,context)=>invoke(identity,'authorizeAccess',{permission,resourceId},context,700),
    customer:(accountId,context)=>invoke(customer,'getByAccount',{id:accountId},context,700),
    trip:(payload,context,capability)=>invoke(trip,'createTrip',payload,context,900,capability),
    driver:(accountId,context)=>invoke(driver,'getByAccount',{id:accountId},context,700),
    async systemContext(correlationId,deadline=Date.now()+3500) {
      if(!credential || Date.now()>=expiresAt-5000){
        if(!pending)pending=invoke(identity,'issueMatchingToken',{}, {token:env.CAB_BOOKING_SERVICE_SECRET || '',correlationId,deadline},700)
          .then(value=>{credential=value.accessToken;expiresAt=Date.now()+value.expiresIn*1000;}).finally(()=>{pending=undefined;});
        await pending;
      }
      return {token:credential,correlationId,deadline,assertActive(){if(Date.now()>=deadline)throw {code:4};}};
    },
    eligible:(payload,context)=>invoke(driver,'getEligibleDrivers',payload,context,1200),
    claim:(payload,context)=>invoke(driver,'claimDriver',payload,context,1200),
    release:(payload,context)=>invoke(driver,'releaseDriver',payload,context,1200),
    distance:(payload,context)=>invoke(driver,'getTravelDistance',payload,context,700),
    applyMatching:(payload,context)=>invoke(trip,'applyMatching',payload,context,1500),
    close(){identity.close();customer.close();trip.close();driver.close();}};
}
module.exports={createClients};
