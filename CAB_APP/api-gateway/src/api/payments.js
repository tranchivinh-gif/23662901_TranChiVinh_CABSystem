'use strict';
const {sendError,rpcError}=require('./errors');
function summary(value){return {paymentId:value.paymentId,tripId:value.tripId,amount:Number(value.amount.amount),currency:'VND',method:value.method,status:value.status,...(value.providerReference?{providerReference:value.providerReference}:{})};}
function registerPaymentRoutes(app,runtime){
  const routes=[['get','/trips/:id/payment','getPayment','payment:read',['CUSTOMER','DRIVER','STAFF','ADMIN']],
    ['post','/trips/:id/payment/electronic','initiatePayment','payment:initiate',['CUSTOMER']],
    ['post','/payments/:id/retry','retryPayment','payment:retry',['CUSTOMER']],
    ['post','/payments/:id/cash-confirm','confirmCash','payment:cash',['DRIVER']],
    ['post','/webhooks/payment/:provider','handleCallback',null,[]]];
  for(const [verb,path,method,permission,roles] of routes)app[verb](path,async(req,res)=>{
    res.set('Cache-Control','no-store');let actor;
    if(permission){
      if(!runtime.auth)return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
      try{actor=runtime.auth.verify(req);}catch{return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required');}
      if(!roles.includes(actor.role))return sendError(res,req.correlationId,403,'FORBIDDEN','Permission denied');
    }
    try{
      let payload;
      if(method==='handleCallback'){
        const body=req.body,timestamp=req.get('X-CAB-Timestamp'),signature=req.get('X-CAB-Signature');
        if(req.params.provider!=='mock' || !body || Array.isArray(body) || typeof body!=='object' || Object.keys(body).some(key=>!['providerReference','amount','status'].includes(key)) || typeof body.providerReference!=='string' || !body.providerReference || body.providerReference.length>200 || !Number.isSafeInteger(body.amount) || body.amount<0 || !['COMPLETED','FAILED'].includes(body.status) || !/^\d{10}$/.test(timestamp || '') || typeof signature!=='string')throw {code:3};
        payload={provider:'mock',providerReference:body.providerReference,amount:{amount:String(body.amount),currency:'VND'},status:body.status,timestamp,signature};
      }else{
        if(method!=='getPayment'){
          const body=req.body;if(body!==undefined && (!body || Array.isArray(body) || typeof body!=='object' || Object.keys(body).length))throw {code:3};
          const key=req.get('Idempotency-Key');if(!key || !key.trim() || key.length>200)throw {code:3};
          payload={id:req.params.id,tripId:req.params.id,paymentId:req.params.id,idempotencyKey:key,method:'Electronic'};
        }else payload={id:req.params.id};
        const grant=await runtime.invoke('identity-account-service','authorizeAccess',{permission,resourceId:req.params.id},req.correlationId,700,actor.token);
        if(grant.accountId!==actor.sub || grant.role!==actor.role)throw {code:7};
      }
      if(!(await runtime.serviceHealth('payment-service',req.correlationId)).ready)throw {code:14};
      const value=await runtime.invoke('payment-service',method,payload,req.correlationId,2200,actor?.token);
      // The frozen webhook response describes acknowledgement, including failed provider outcomes.
      if(method==='handleCallback')return res.json({paymentId:value.paymentId,status:'COMPLETED'});
      if(['initiatePayment','retryPayment'].includes(method))return res.status(201).json({payment:summary(value),provider:'mock',attemptNo:value.attemptNo,...(value.checkoutToken?{checkoutToken:value.checkoutToken}:{})});
      return res.json(summary(value));
    }catch(error){return rpcError(res,req.correlationId,error);}
  });
}
module.exports={registerPaymentRoutes};
