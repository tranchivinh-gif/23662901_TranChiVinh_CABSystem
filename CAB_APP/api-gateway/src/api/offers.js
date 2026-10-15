'use strict';
const {sendError,rpcError}=require('./errors');
function registerOfferRoutes(app,runtime) {
  for(const decision of ['ACCEPT','REJECT'])app.post('/driver-offers/:offerId/'+decision.toLowerCase(),async(req,res)=>{
    res.set('Cache-Control','no-store');
    if(!runtime.auth)return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
    let actor;try{actor=runtime.auth.verify(req);}catch{return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required');}
    if(actor.role!=='DRIVER')return sendError(res,req.correlationId,403,'FORBIDDEN','Permission denied');
    try {
      const deadline=Date.now()+1800;
      const grant=await runtime.invoke('identity-account-service','authorizeAccess',{permission:'driver:offer'},req.correlationId,700,actor.token);
      if(grant.accountId!==actor.sub || grant.role!==actor.role)throw {code:7};
      const key=req.get('Idempotency-Key') || '';
      if(decision==='ACCEPT' && !key.trim())throw {code:3};
      const value=req.body;
      if(value!==undefined && (value===null || Array.isArray(value) || typeof value!=='object' || Object.keys(value).some(name=>decision==='ACCEPT' || name!=='reason') || (value.reason!==undefined && (typeof value.reason!=='string' || value.reason.length>500))))throw {code:3};
      if(!(await runtime.serviceHealth('booking-service',req.correlationId)).ready)throw {code:14};
      const result=await runtime.invoke('booking-service','actOnOffer',{offerId:req.params.offerId,decision,idempotencyKey:key,reason:value?.reason || ''},req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())),actor.token);
      return res.json({offerId:result.offerId,tripId:result.tripId,offerStatus:result.offerStatus,tripState:result.tripState});
    }catch(error){return rpcError(res,req.correlationId,error);}
  });
}
module.exports={registerOfferRoutes};
