'use strict';
const fs = require('node:fs');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
function createTokens(env = process.env) {
  const kid = env.CAB_JWT_ACTIVE_KEY_ID || 'v1';
  const issuer = env.CAB_JWT_ISSUER || 'cab-system', audience = env.CAB_JWT_AUDIENCE || 'cab-public-api';
  const privateKey = crypto.createPrivateKey(fs.readFileSync(env.CAB_JWT_PRIVATE_KEY_PATH));
  if (privateKey.asymmetricKeyType !== 'rsa' || privateKey.asymmetricKeyDetails.modulusLength < 2048) throw new Error('RSA key must be at least 2048 bits');
  const paths = { [kid]: env.CAB_JWT_PUBLIC_KEY_PATH, ...JSON.parse(env.CAB_JWT_PUBLIC_KEY_PATHS || '{}') };
  const keys = Object.fromEntries(Object.entries(paths).map(([id,file]) => {
    const key=crypto.createPublicKey(fs.readFileSync(file));
    if(key.asymmetricKeyType!=='rsa' || key.asymmetricKeyDetails.modulusLength<2048) throw new Error('Invalid RSA public key');
    return [id,key];
  }));
  if (crypto.createPublicKey(privateKey).export({ type:'spki',format:'pem' }) !== keys[kid].export({ type:'spki',format:'pem' })) throw new Error('JWT key pair mismatch');
  function access(account) {
    return jwt.sign({ role: account.role_code, tokenUse:'access' }, privateKey,
      { algorithm:'RS256',keyid:kid,issuer,audience,subject:account.account_id,expiresIn:3600,jwtid:crypto.randomUUID() });
  }
  function verify(token) {
    const decoded = jwt.decode(token,{complete:true});
    if (!decoded || decoded.header.alg !== 'RS256' || !Object.hasOwn(keys,decoded.header.kid)) throw new Error('Invalid token');
    const result = jwt.verify(token,keys[decoded.header.kid],{algorithms:['RS256'],issuer,audience});
    if (result.tokenUse !== 'access' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(result.sub || '') || !['CUSTOMER','DRIVER','STAFF','ADMIN'].includes(result.role) || !Number.isInteger(result.exp) || !Number.isInteger(result.iat) || result.exp-result.iat > 3600 || result.exp<=result.iat || result.iat>Math.floor(Date.now()/1000)+30) throw new Error('Invalid claims');
    return result;
  }
  function profileToken(accountId) {
    return jwt.sign({ scope:'customer:create-profile',accountId,tokenUse:'service' },privateKey,
      {algorithm:'RS256',keyid:kid,issuer,audience:'cab-customer-internal',subject:'identity-account-service',expiresIn:30});
  }
  function driverProfileToken(accountId) {
    return jwt.sign({scope:'driver:create-profile',accountId,tokenUse:'service'},privateKey,
      {algorithm:'RS256',keyid:kid,issuer,audience:'cab-driver-internal',subject:'identity-account-service',expiresIn:30});
  }
  function tripCreateToken(accountId, bookingId) {
    return jwt.sign({scope:'trip:create',accountId,bookingId,tokenUse:'service'},privateKey,
      {algorithm:'RS256',keyid:kid,issuer,audience:'cab-trip-internal',subject:'booking-service',expiresIn:30});
  }
  function matchingToken() {
    return jwt.sign({scope:'booking:matching',tokenUse:'service'},privateKey,
      {algorithm:'RS256',keyid:kid,issuer,audience:'cab-matching-internal',subject:'booking-service',expiresIn:30});
  }
  function verifyMatching(token) {
    const decoded=jwt.decode(token,{complete:true});
    if(!decoded || decoded.header.alg!=='RS256' || !Object.hasOwn(keys,decoded.header.kid))throw {code:16};
    let claims;try {claims=jwt.verify(token,keys[decoded.header.kid],{algorithms:['RS256'],issuer,audience:['cab-matching-internal','cab-driver-internal'],maxAge:30});}catch{throw {code:16};}
    if(claims.sub!=='booking-service' || claims.tokenUse!=='service' || !['booking:matching','driver:eligible'].includes(claims.scope) ||
      (claims.scope==='booking:matching' && claims.aud!=='cab-matching-internal') || (claims.scope==='driver:eligible' && claims.aud!=='cab-driver-internal') ||
      !Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.exp<=claims.iat || claims.exp-claims.iat>30)throw {code:7};
    return claims;
  }
  function tripToken() {
    return jwt.sign({scope:'trip:lifecycle',tokenUse:'service'},privateKey,
      {algorithm:'RS256',keyid:kid,issuer,audience:'cab-booking-internal',subject:'trip-service',expiresIn:30});
  }
  function notificationToken() { return jwt.sign({scope:"notification:resolve",tokenUse:"service"},privateKey,{algorithm:"RS256",keyid:kid,issuer,audience:"cab-events-internal",subject:"notification-service",expiresIn:30}); }
  return { notificationToken, access, verify, profileToken, driverProfileToken, tripCreateToken, matchingToken, verifyMatching, tripToken };
}
function opaque() { return crypto.randomBytes(32).toString('base64url'); }
function tokenHash(value) { return crypto.createHash('sha256').update(value).digest(); }
module.exports = { createTokens, opaque, tokenHash };
