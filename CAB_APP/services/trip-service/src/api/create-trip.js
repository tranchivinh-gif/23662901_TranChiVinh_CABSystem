'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),grpc=require('@grpc/grpc-js'),jwt=require('jsonwebtoken');
function createTripHandler(action,env=process.env) {
  const paths={[env.CAB_JWT_ACTIVE_KEY_ID || 'v1']:env.CAB_JWT_PUBLIC_KEY_PATH,...JSON.parse(env.CAB_JWT_PUBLIC_KEY_PATHS || '{}')};
  const keys=Object.fromEntries(Object.entries(paths).map(([id,file])=>[id,crypto.createPublicKey(fs.readFileSync(file))]));
  for(const key of Object.values(keys))if(key.asymmetricKeyType!=='rsa' || key.asymmetricKeyDetails.modulusLength<2048)throw new Error('Invalid RSA key');
  return async(call,callback)=>{
    try {
      const entries=call.metadata.get('x-service-token'),auth=call.metadata.get('authorization'),ids=call.metadata.get('x-correlation-id');
      if(entries.length!==1 || auth.length!==1 || !/^Bearer [^\s]+$/.test(auth[0]))throw {code:16};
      const decoded=jwt.decode(entries[0],{complete:true});if(!decoded || decoded.header.alg!=='RS256' || !Object.hasOwn(keys,decoded.header.kid))throw {code:16};
      let claims;try{claims=jwt.verify(entries[0],keys[decoded.header.kid],{algorithms:['RS256'],issuer:env.CAB_JWT_ISSUER || 'cab-system',audience:'cab-trip-internal'});}catch{throw {code:16};}
      if(claims.sub!=='booking-service' || claims.tokenUse!=='service' || claims.scope!=='trip:create' || claims.bookingId!==call.request.bookingId || !Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.exp<=claims.iat || claims.exp-claims.iat>30)throw {code:7};
      if(ids.length!==1 || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(ids[0]))throw {code:3};
      const context={accountId:claims.accountId,token:auth[0].slice(7),correlationId:ids[0],deadline:Number(call.getDeadline()),
        assertActive(){if(call.cancelled || Date.now()>=this.deadline)throw {code:4};}};
      context.assertActive();const result=await action(call.request,context);context.assertActive();callback(null,result);
    }catch(error){callback({code:[3,4,5,6,7,14,16].includes(error.code)?error.code:grpc.status.UNAVAILABLE,details:'Trip creation could not complete'});}
  };
}
module.exports={createTripHandler};
