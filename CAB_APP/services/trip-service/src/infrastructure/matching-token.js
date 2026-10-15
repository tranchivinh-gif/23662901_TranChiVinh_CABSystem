'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),jwt=require('jsonwebtoken');
function createMatchingVerifier(env=process.env) {
  const paths={[env.CAB_JWT_ACTIVE_KEY_ID || 'v1']:env.CAB_JWT_PUBLIC_KEY_PATH,...JSON.parse(env.CAB_JWT_PUBLIC_KEY_PATHS || '{}')};
  const keys=Object.fromEntries(Object.entries(paths).map(([id,file])=>[id,crypto.createPublicKey(fs.readFileSync(file))]));
  for(const key of Object.values(keys))if(key.asymmetricKeyType!=='rsa' || key.asymmetricKeyDetails.modulusLength<2048)throw new Error('Invalid RSA key');
  return token=>{
    const decoded=jwt.decode(token,{complete:true});if(!decoded || decoded.header.alg!=='RS256' || !Object.hasOwn(keys,decoded.header.kid))throw {code:16};
    let claims;try{claims=jwt.verify(token,keys[decoded.header.kid],{algorithms:['RS256'],issuer:env.CAB_JWT_ISSUER || 'cab-system',audience:'cab-matching-internal',maxAge:30});}catch{throw {code:16};}
    if(claims.sub!=='booking-service' || claims.tokenUse!=='service' || claims.scope!=='booking:matching' || !Number.isInteger(claims.exp) || !Number.isInteger(claims.iat) || claims.exp<=claims.iat || claims.exp-claims.iat>30 || claims.iat>Math.floor(Date.now()/1000)+5)throw {code:7};
    return claims;
  };
}
module.exports={createMatchingVerifier};
