'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const grpc=require('@grpc/grpc-js');
const jwt=require('jsonwebtoken');
function createProfileHandler(action,env=process.env) {
  const paths={ [env.CAB_JWT_ACTIVE_KEY_ID || 'v1']:env.CAB_JWT_PUBLIC_KEY_PATH,...JSON.parse(env.CAB_JWT_PUBLIC_KEY_PATHS || '{}') };
  const keys=Object.fromEntries(Object.entries(paths).map(([id,file])=>{
    const key=crypto.createPublicKey(fs.readFileSync(file));
    if(key.asymmetricKeyType!=='rsa' || key.asymmetricKeyDetails.modulusLength<2048) throw new Error('Invalid RSA public key');
    return [id,key];
  }));
  return async(call,callback)=>{
    try {
      const entries=call.metadata.get('authorization');
      if (entries.length!==1 || !/^Bearer /.test(entries[0])) throw {code:grpc.status.UNAUTHENTICATED};
      const token=entries[0].slice(7),decoded=jwt.decode(token,{complete:true});
      if (!decoded || decoded.header.alg!=='RS256' || !Object.hasOwn(keys,decoded.header.kid)) throw {code:grpc.status.UNAUTHENTICATED};
      let claims;
      try {claims=jwt.verify(token,keys[decoded.header.kid],{algorithms:['RS256'],issuer:env.CAB_JWT_ISSUER || 'cab-system',audience:'cab-customer-internal'});} catch {throw {code:grpc.status.UNAUTHENTICATED};}
      if (claims.sub!=='identity-account-service' || claims.scope!=='customer:create-profile' || claims.tokenUse!=='service' || claims.accountId!==call.request.accountId || !Number.isInteger(claims.exp) || !Number.isInteger(claims.iat) || claims.exp-claims.iat>30) throw {code:grpc.status.PERMISSION_DENIED};
      if (call.cancelled) throw {code:grpc.status.DEADLINE_EXCEEDED};
      const ids=call.metadata.get('x-correlation-id');
      if(ids.length>1 || (ids.length===1 && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(ids[0]))) throw {code:grpc.status.INVALID_ARGUMENT};
      const metadata=new grpc.Metadata();metadata.set('x-correlation-id',ids[0] || crypto.randomUUID());call.sendMetadata(metadata);
      callback(null,await action(call.request,{correlationId:ids[0] || metadata.get("x-correlation-id")[0]}));
    } catch(error) {callback({code:[3,6,7,16,4].includes(error.code)?error.code:grpc.status.UNAVAILABLE,details:'Profile operation could not complete'});}
  };
}
module.exports={createProfileHandler};
