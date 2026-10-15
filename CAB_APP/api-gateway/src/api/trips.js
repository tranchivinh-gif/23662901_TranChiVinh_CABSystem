'use strict';
const {sendError,rpcError}=require('./errors');
function registerTripRoutes(app,runtime){
  const routes=[['get','/trips/:id','getTrip','trip:read',['CUSTOMER','DRIVER','STAFF','ADMIN']],
    ...Object.entries({arrive:'DriverArrived',pickup:'PickedUp',start:'InProgress',complete:'Completed'}).map(([path,target])=>['post','/trips/:id/'+path,'transition','trip:transition',['DRIVER'],target]),
    ['post','/trips/:id/cancel','cancelTrip','trip:cancel',['CUSTOMER','DRIVER','STAFF','ADMIN']],
    ['post','/trips/:id/rating','rateTrip','trip:rate',['CUSTOMER']]];
  for(const [verb,path,method,permission,roles,target] of routes)app[verb](path,async(req,res)=>{
    res.set('Cache-Control','no-store');
    if(!runtime.auth)return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
    let actor;try{actor=runtime.auth.verify(req);}catch{return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required');}
    if(!roles.includes(actor.role))return sendError(res,req.correlationId,403,'FORBIDDEN','Permission denied');
    try{
      const deadline=Date.now()+1800;
      const grant=await runtime.invoke('identity-account-service','authorizeAccess',{permission,resourceId:req.params.id},req.correlationId,700,actor.token);
      if(grant.accountId!==actor.sub || grant.role!==actor.role)throw {code:7};
      const body=req.body,payload={tripId:req.params.id,id:req.params.id};
      if(method==='transition'){
        if(body!==undefined && (body===null || Array.isArray(body) || typeof body!=='object' || Object.keys(body).length))throw {code:3};
        const key=req.get('Idempotency-Key');if(!key || !key.trim() || key.length>200)throw {code:3};Object.assign(payload,{targetStatus:target,idempotencyKey:key});
      }
      if(['cancelTrip','rateTrip'].includes(method)){
        const allowed=method==='cancelTrip'?['reason']:['stars','comment'];
        if(!body || Array.isArray(body) || typeof body!=='object' || Object.keys(body).some(key=>!allowed.includes(key)))throw {code:3};
        if(method==='cancelTrip'){if(typeof body.reason!=='string' || !body.reason.trim() || body.reason.length>500)throw {code:3};payload.reason=body.reason;}
        else{if(!Number.isInteger(body.stars) || body.stars<1 || body.stars>5 || (body.comment!==undefined && (typeof body.comment!=='string' || body.comment.length>2000)))throw {code:3};Object.assign(payload,{score:body.stars,comment:body.comment || ''});}
      }
      if(!(await runtime.serviceHealth('trip-service',req.correlationId)).ready)throw {code:14};
      const value=await runtime.invoke('trip-service',method,payload,req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())),actor.token);
      if(method==='cancelTrip')return res.json({tripId:value.tripId,state:value.status,cancellationFeeVnd:value.cancellationFeeVnd});
      if(method==='rateTrip')return res.status(201).json({tripId:value.tripId,ratingId:value.ratingId,stars:value.score});
      const fare=JSON.parse(value.fareJson);
      if(method==='transition')return res.json({tripId:value.tripId,state:value.status,fare});
      const payment=value.status==='COMPLETED'?await runtime.invoke('payment-service','getPayment',{id:req.params.id},req.correlationId,1500,actor.token):null;
      return res.json({tripId:value.tripId,bookingId:value.bookingId,customerId:value.customerId,...(value.driverId?{driverId:value.driverId}:{}),state:value.status,serviceType:value.serviceType,fare,...(payment?{paymentStatus:payment.status}:{})});
    }catch(error){return rpcError(res,req.correlationId,error);}
  });
}
module.exports={registerTripRoutes};
