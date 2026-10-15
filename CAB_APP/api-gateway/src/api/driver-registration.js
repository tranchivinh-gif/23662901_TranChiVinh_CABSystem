'use strict';
const busboy=require('busboy');
const {sendError,rpcError}=require('./errors');
const { normalizeString, normalizeText } = require('../infrastructure/input-validation');
function parseRegistration(req) {
  return new Promise((resolve,reject)=>{
    let parser;
    try {parser=busboy({headers:req.headers,limits:{files:5,fileSize:1048576,fields:2,fieldSize:32768,parts:7}});} catch {return reject({status:400});}
    const fields={},documents=[];let error,total=0;
    const fail=status=>{error={status};};
    parser.on('field',(name,value,info)=>{
      if(!['registrationContext','profile'].includes(name) || Object.hasOwn(fields,name)) fail(400);
      if(info.valueTruncated) fail(413);
      fields[name]=value;
    });
    parser.on('file',(name,file,info)=>{
      const chunks=[];
      if(name!=='documents') fail(400);
      file.on('limit',()=>fail(413));
      file.on('data',chunk=>{total+=chunk.length;if(total>2097152)fail(413);if(!error)chunks.push(chunk);});
      file.on('error',()=>fail(400));
      file.on('end',()=>documents.push({filename:info.filename,mediaType:info.mimeType,content:Buffer.concat(chunks)}));
    });
    for(const event of ['filesLimit','fieldsLimit','partsLimit']) parser.on(event,()=>fail(413));
    parser.on('error',()=>reject({status:400}));
    req.on('aborted',()=>{parser.destroy();reject({status:400});});
    parser.on('close',()=>error?reject(error):resolve({...fields,documents}));
    req.pipe(parser);
  });
}
function registerDriverRegistration(app,runtime) {
  app.post('/auth/register/driver',async(req,res)=>{
    if(!runtime.auth) return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
    try {
      if(!req.is('multipart/form-data')) throw {status:400};
      const value=await parseRegistration(req);
      const deadline=Date.now()+1800;
      if(!value.registrationContext?.trim()) return sendError(res,req.correlationId,400,'REGISTRATION_CONTEXT_REQUIRED','Verified registration context required');
      let profile;try {profile=JSON.parse(value.profile);} catch {throw {status:400};}
      const required=['fullName','phoneNumber','identityDocument','driverLicense','vehicle'];
      if(!profile || Array.isArray(profile) || typeof profile!=='object' || Object.keys(profile).some(key=>!required.includes(key)) ||
        required.filter(key=>key!=='vehicle').some(key=>typeof profile[key]!=='string' || !profile[key].trim()) ||
        !profile.vehicle || typeof profile.vehicle!=='object' || Array.isArray(profile.vehicle) || !profile.vehicle.licensePlate ||
        !['MOTORBIKE','CAR_4_SEATS'].includes(profile.vehicle.serviceType) || !value.documents.length || value.documents.some(doc=>!doc.content.length)) throw {status:400};
      try {
        profile.fullName = normalizeText(profile.fullName, { field: 'fullName', maxLength: 128 });
        profile.phoneNumber = normalizeString(profile.phoneNumber, { field: 'phoneNumber', maxLength: 32 });
        profile.identityDocument = normalizeString(profile.identityDocument, { field: 'identityDocument', maxLength: 128 });
        profile.driverLicense = normalizeString(profile.driverLicense, { field: 'driverLicense', maxLength: 128 });
        profile.vehicle.licensePlate = normalizeString(profile.vehicle.licensePlate, { field: 'licensePlate', maxLength: 32 });
        profile.vehicle.serviceType = normalizeString(profile.vehicle.serviceType, { field: 'serviceType', maxLength: 32 });
        if (!['MOTORBIKE','CAR_4_SEATS'].includes(profile.vehicle.serviceType)) throw new Error('INVALID_ARGUMENT');
      } catch { throw {status:400}; }
      const rate=await runtime.auth.rateLimit({...req,ip:req.ip,body:{phoneNumber:profile.phoneNumber}},'registerDriver');
      if(!rate.allowed) {res.set('Retry-After',String(rate.retryAfter));return sendError(res,req.correlationId,429,'RATE_LIMIT_EXCEEDED','Too many requests');}
      if(!(await runtime.serviceHealth('identity-account-service',req.correlationId)).ready) throw {code:14};
      const result=await runtime.invoke('identity-account-service','registerDriver',{phone:profile.phoneNumber,verificationToken:value.registrationContext,driverProfileJson:JSON.stringify(profile),documents:value.documents},req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())));
      res.set('Cache-Control','no-store');return res.status(201).json({driverId:result.driverId,status:result.status});
    } catch(error) {
      if(error.status) return sendError(res,req.correlationId,error.status,error.status===413?'PAYLOAD_TOO_LARGE':'INVALID_ARGUMENT','Invalid registration request');
      return rpcError(res,req.correlationId,error);
    }
  });
}
module.exports={parseRegistration,registerDriverRegistration};
