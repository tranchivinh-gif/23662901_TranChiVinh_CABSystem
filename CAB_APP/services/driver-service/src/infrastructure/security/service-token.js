'use strict';
const fs=require('node:fs');
const crypto=require('node:crypto');
const jwt=require('jsonwebtoken');
const grpc=require('@grpc/grpc-js');
function createServiceVerifier(env=process.env) {
  const paths={ [env.CAB_JWT_ACTIVE_KEY_ID || 'v1']:env.CAB_JWT_PUBLIC_KEY_PATH,...JSON.parse(env.CAB_JWT_PUBLIC_KEY_PATHS || '{}') };
  const keys=Object.fromEntries(Object.entries(paths).map(([id,file])=>{
    const key=crypto.createPublicKey(fs.readFileSync(file));
    if(key.asymmetricKeyType!=='rsa' || key.asymmetricKeyDetails.modulusLength<2048) throw new Error('Invalid RSA public key');
    return [id,key];
  }));
  return (token,scope,accountId)=>{
    let claims;
    try {
      const decoded=jwt.decode(token,{complete:true});
      if(!decoded || decoded.header.alg!=='RS256' || !Object.hasOwn(keys,decoded.header.kid)) throw new Error();
      claims=jwt.verify(token,keys[decoded.header.kid],{algorithms:['RS256'],issuer:env.CAB_JWT_ISSUER || 'cab-system',audience:scope==='booking:matching'?'cab-matching-internal':'cab-driver-internal',maxAge:30});
      if(!Number.isInteger(claims.exp) || !Number.isInteger(claims.iat) || claims.exp-claims.iat>30 || claims.exp<=claims.iat || claims.iat>Math.floor(Date.now()/1000)+5) throw new Error();
    } catch {throw {code:grpc.status.UNAUTHENTICATED};}
    const subject=['driver:eligible','booking:matching'].includes(scope)?'booking-service':'identity-account-service';
    if(claims.tokenUse!=='service' || claims.scope!==scope || claims.sub!==subject || (accountId && claims.accountId!==accountId)) throw {code:grpc.status.PERMISSION_DENIED};
    return claims;
  };
}
module.exports={createServiceVerifier};
