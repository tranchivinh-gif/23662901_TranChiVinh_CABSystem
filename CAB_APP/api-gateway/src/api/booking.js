'use strict';
const {sendError,rpcError}=require('./errors');
const {routeAllowed}=require('./authorization');
const { normalizeServiceType, normalizeString } = require('../infrastructure/input-validation');
function fareBody(fare) {
  return {currency:'VND',baseFare:Number(fare.baseFare),distanceKm:Number(fare.distanceKm),pricePerKm:Number(fare.pricePerKm),
    surcharge:Number(fare.surcharge),finalFare:Number(fare.total.amount),ruleVersion:fare.fareRuleVersion,estimated:fare.estimated};
}
function bookingBody(value) {
  return {bookingId:value.bookingId,customerId:value.customerId,tripId:value.tripId,serviceType:value.serviceType,state:value.status,
    paymentMethod:value.paymentMethod,fareEstimate:fareBody(value.fare)};
}
function registerBookingRoutes(app,runtime) {
  for(const [method,path,operation,rpc,permission] of [
    ['get','/service-types','getServiceTypes','getServiceTypes','booking:types'],
    ['post','/fares/estimate','estimateFare','estimateFare','booking:estimate'],
    ['post','/bookings','createBooking','createBooking','booking:create'],
    ['get','/customers/me/bookings','getMyBookings','listCustomerBookings','booking:list'],
    ['get','/customers/:customerId/bookings','getCustomerBookings','listCustomerBookings','booking:list'],
  ])app[method](path,async(req,res)=>{
    res.set('Cache-Control','no-store');
    if(!runtime.auth)return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
    let actor;try{actor=runtime.auth.verify(req);}catch{return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required');}
    if(!routeAllowed(operation,actor.role))return sendError(res,req.correlationId,403,'FORBIDDEN','Permission denied');
    if(operation==='getMyBookings' && actor.role!=='CUSTOMER')return sendError(res,req.correlationId,403,'FORBIDDEN','Permission denied');
    try {
      const deadline=Date.now()+1800;
      let payload={};
      if(method==='post') {
        const value=req.body;
        if(!value || Array.isArray(value) || typeof value!=='object')throw {code:3};
        for(const point of [value.pickup,value.destination])if(!point || typeof point.lat!=='number' || typeof point.lng!=='number' || Object.keys(point).some(key=>!['lat','lng'].includes(key)))throw {code:3};
        if(typeof value.serviceType!=='string')throw {code:3};
        const serviceType=normalizeServiceType(value.serviceType);
        payload={pickup:value.pickup,destination:value.destination,serviceType};
        if(rpc==='createBooking') {
          const rawKey=req.get('Idempotency-Key');
          const key=rawKey?normalizeString(rawKey,{field:'Idempotency-Key',maxLength:128}):'';
          if(!key || !['Cash','Electronic'].includes(value.paymentMethod))throw {code:3};
          if(value.fareEstimate!==undefined) {
            const estimate=value.fareEstimate;
            if(!estimate || Array.isArray(estimate) || estimate.currency!=='VND' || typeof estimate.finalFare!=='number' || estimate.finalFare<0 ||
              ['baseFare','distanceKm','pricePerKm','surcharge'].some(name=>estimate[name]!==undefined && (typeof estimate[name]!=='number' || estimate[name]<0)) ||
              (estimate.ruleVersion!==undefined && typeof estimate.ruleVersion!=='string') || (estimate.estimated!==undefined && typeof estimate.estimated!=='boolean'))throw {code:3};
          }
          const rate=await runtime.auth.rateLimit(req,'createBooking');
          if(!rate.allowed){res.set('Retry-After',String(rate.retryAfter || 1));return sendError(res,req.correlationId,429,'RATE_LIMIT_EXCEEDED','Too many requests');}
          payload={route:payload,paymentMethod:value.paymentMethod,idempotencyKey:key,payloadJson:JSON.stringify(value)};
        }
      } else if(rpc==='listCustomerBookings') {
        const integer=(name,defaultValue)=>{const raw=req.query[name];if(raw===undefined)return defaultValue;if(typeof raw!=='string' || !/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)))throw {code:3};return Number(raw);};
        const page=integer('page',0),limit=integer('limit',10);if(page>2147483647 || limit<1 || limit>100)throw {code:3};
        payload={customerId:req.params.customerId,pagination:{page,limit}};
      }
      const decision=await runtime.invoke('identity-account-service','authorizeAccess',{permission},req.correlationId,700,actor.token);
      if(decision.accountId!==actor.sub || decision.role!==actor.role)throw {code:7};
      if(operation==='getMyBookings') {
        const profile=await runtime.invoke('customer-service','getByAccount',{id:actor.sub},req.correlationId,Math.min(500,Math.max(1,deadline-Date.now())),actor.token);
        payload.customerId=profile.customerId;
      }
      if(!(await runtime.serviceHealth('booking-service',req.correlationId)).ready)throw {code:14};
      const value=await runtime.invoke('booking-service',rpc,payload,req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())),actor.token);
      if(rpc==='getServiceTypes')return res.json(value.items.map(item=>({code:item.code,active:item.active})));
      if(rpc==='estimateFare')return res.json({fare:fareBody(value),etaMinutes:value.etaMinutes});
      if(rpc==='createBooking')return res.status(201).json(bookingBody(value));
      const total=Number(value.meta.totalItems);return res.json({items:value.items.map(bookingBody),page:value.meta.page,limit:value.meta.limit,totalItems:total,totalPages:Number(value.meta.totalPages),total});
    }catch(error){return rpcError(res,req.correlationId,error);}
  });
}
module.exports={registerBookingRoutes,fareBody,bookingBody};
