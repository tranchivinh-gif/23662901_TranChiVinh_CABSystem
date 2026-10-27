'use strict';
const {sendError,rpcError}=require('./errors');
const { normalizeString, normalizeEmail } = require('../infrastructure/input-validation');
const operations=[
  ['requestCustomerRegistrationOtp','/auth/register/customer/request-otp','requestOtp',['phoneNumber'],[],200],
  ['verifyCustomerRegistrationOtp','/auth/register/customer/verify-otp','verifyOtp',['phoneNumber','otp'],[],200],
  ['requestDriverRegistrationOtp','/auth/register/driver/request-otp','requestOtp',['phoneNumber'],[],200],
  ['verifyDriverRegistrationOtp','/auth/register/driver/verify-otp','verifyOtp',['phoneNumber','otp'],[],200],
  ['registerCustomer','/auth/register/customer','registerCustomer',['email','pass'],[],201],
  ['login','/auth/login','login',['pass'],['email','phone'],200],
  ['refreshToken','/auth/refresh','refresh',['refreshToken'],[],200],
  ['logout','/auth/logout','logout',['refreshToken'],[],200],
];
function registerAuthRoutes(app,dependencies) {
  if(!dependencies.auth) return;
  for(const [operation,path,rpc,required,optional,status] of operations) app.post(path,async(req,res)=>{
    const deadline=Date.now()+1800;
    let actor;
    if(operation==='logout') {
      try {actor=dependencies.auth.verify(req);} catch {return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required');}
    }
    const value=req.body;
    if(!req.is('application/json') || !value || Array.isArray(value) || typeof value!=='object') {
      return sendError(res,req.correlationId,400,'INVALID_ARGUMENT','Invalid request');
    }
    let normalized;
    try {
      normalized = Object.fromEntries(Object.entries(value).map(([key,entry]) => {
        if (typeof entry !== 'string') return [key, entry];
        if (key === 'email') return [key, normalizeEmail(entry)];
        if (key === 'password' || key === 'otp' || key === 'refreshToken' || key === 'registrationContext' || key === 'phoneNumber') {
          return [key, normalizeString(entry, { field: key, maxLength: 256 })];
        }
        if (key === 'fullName') return [key, normalizeString(entry, { field: key, maxLength: 128 })];
        return [key, normalizeString(entry, { field: key, maxLength: 256 })];
      }));
    } catch {
      return sendError(res,req.correlationId,400,'INVALID_ARGUMENT','Invalid request');
    }
    if (required.some(key=>typeof normalized[key]!=='string' || !normalized[key].trim()) || Object.keys(normalized).some(key=>![...required,...optional].includes(key)) || optional.some(key=>normalized[key]!==undefined && typeof normalized[key]!=='string')) {
      return sendError(res,req.correlationId,400,'INVALID_ARGUMENT','Invalid request');
    }
    if(operation==='login' && Number(Boolean(normalized.email))+Number(Boolean(normalized.phone))!==1)
      return sendError(res,req.correlationId,400,'INVALID_ARGUMENT','Provide exactly one of email or phone');
    const valueToUse = normalized;
    try {
      const limit=await dependencies.auth.rateLimit(req,operation);
      if(!limit.allowed) {res.set('Retry-After',String(limit.retryAfter));return sendError(res,req.correlationId,429,'RATE_LIMIT_EXCEEDED','Too many requests');}
    } catch {return sendError(res,req.correlationId,503,'SERVICE_UNAVAILABLE','Authentication dependency unavailable');}
    const health=await dependencies.serviceHealth('identity-account-service',req.correlationId);
    if(!health.ready) return sendError(res,req.correlationId,503,'SERVICE_UNAVAILABLE','Required service is unavailable');
    let payload;
    if(rpc==='requestOtp') payload={phone:valueToUse.phoneNumber,purpose:operation.includes('Driver')?'DRIVER_REGISTRATION':'CUSTOMER_REGISTRATION'};
    else if(rpc==='verifyOtp') payload={phone:valueToUse.phoneNumber,otp:valueToUse.otp,purpose:operation.includes('Driver')?'DRIVER_REGISTRATION':'CUSTOMER_REGISTRATION'};
    else if(rpc==='registerCustomer') payload={password:valueToUse.pass,email:valueToUse.email};
    else if(rpc==='login') payload={email:valueToUse.email || '',phone:valueToUse.phone || '',password:valueToUse.pass};
    else payload={refreshToken:valueToUse.refreshToken};
    try {
      const result=await dependencies.invoke('identity-account-service',rpc,payload,req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())),actor?.token);
      res.set('Cache-Control','no-store');
      if(rpc==='requestOtp' || rpc==='logout') return res.status(status).end();
      if(rpc==='verifyOtp') return res.json({verified:true,registrationContext:result.verificationToken});
      if(rpc==='registerCustomer') return res.status(201).json({accountId:result.accountId,role:result.role,status:result.status});
      return res.json({accountId:result.accountId,role:result.role,accessToken:result.accessToken,refreshToken:result.refreshToken,tokenType:'Bearer',accessTokenTtlSeconds:result.expiresIn,refreshTokenTtlSeconds:result.refreshExpiresIn});
    } catch(error) {return rpcError(res,req.correlationId,error);}
  });
}
module.exports={registerAuthRoutes,operations};
