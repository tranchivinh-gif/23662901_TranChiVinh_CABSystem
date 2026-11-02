'use strict';
const {sendError,rpcError}=require('./errors');
const {normalizeString,normalizeText}=require('../infrastructure/input-validation');
function registerDriverRegistration(app,runtime) {
  app.post('/auth/register/driver',async(req,res)=>{
    if(!runtime.auth) return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
    try {
      const value=req.body;
      const required=['registrationContext','name','licenseNumber','vehicleNumber','type'];
      if(!req.is('application/json') || !value || typeof value!=='object' || Array.isArray(value) ||
        Object.keys(value).some(key=>!required.includes(key)) || required.some(key=>typeof value[key]!=='string')) throw {status:400};
      const registrationContext=normalizeString(value.registrationContext,{field:'registrationContext',maxLength:512});
      const profile={
        fullName:normalizeText(value.name,{field:'name',maxLength:128}),
        driverLicense:normalizeString(value.licenseNumber,{field:'licenseNumber',maxLength:128}),
        vehicle:{
          licensePlate:normalizeString(value.vehicleNumber,{field:'vehicleNumber',maxLength:32}),
          serviceType:normalizeString(value.type,{field:'type',maxLength:32}),
        },
      };
      if(profile.vehicle.serviceType==='car4') profile.vehicle.serviceType='CAR_4_SEATS';
      if(!['MOTORBIKE','CAR_4_SEATS'].includes(profile.vehicle.serviceType)) throw {status:400};
      const deadline=Date.now()+1800;
      const rate=await runtime.auth.rateLimit({...req,ip:req.ip,body:{}},'registerDriver');
      if(!rate.allowed) {res.set('Retry-After',String(rate.retryAfter));return sendError(res,req.correlationId,429,'RATE_LIMIT_EXCEEDED','Too many requests');}
      if(!(await runtime.serviceHealth('identity-account-service',req.correlationId)).ready) throw {code:14};
      const result=await runtime.invoke('identity-account-service','registerDriver',{
        verificationToken:registrationContext,driverProfileJson:JSON.stringify(profile),documents:[],
      },req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())));
      res.set('Cache-Control','no-store');
      return res.status(201).json({driverId:result.driverId,status:result.status});
    } catch(error) {
      if(error.status || (error.message && error.message.includes('INVALID_ARGUMENT')))
        return sendError(res,req.correlationId,400,'INVALID_ARGUMENT','Invalid registration request');
      return rpcError(res,req.correlationId,error);
    }
  });
}
module.exports={registerDriverRegistration};
