'use strict';
const {sendError,rpcError}=require('./errors');
const {routeAllowed}=require('./authorization');
const {resolveDemoArea}=require('../../../scripts/demo-addresses');
const {escapeHtml}=require('./encoding');
function driverBody(value) {
  return {driverId:value.driverId,fullName:value.fullName,approvalStatus:value.status,availability:value.availability,
    ...(value.phoneNumber?{phoneNumber:value.phoneNumber}:{})};
}
function updatedDriverBody(value) {
  return {
    driverId: value.driverId,
    fullName: escapeHtml(value.fullName),
    approvalStatus: value.status,
    availability: value.availability,
    ...(value.phoneNumber ? { phoneNumber: escapeHtml(value.phoneNumber) } : {}),
    ...(value.vehicle ? { vehicle: {
      ...(value.vehicle.vehicleId ? { vehicleId: value.vehicle.vehicleId } : {}),
      ...(value.vehicle.licensePlate ? { licensePlate: escapeHtml(value.vehicle.licensePlate) } : {}),
      ...(value.vehicle.serviceType ? { serviceType: value.vehicle.serviceType } : {}),
      ...(value.vehicle.make ? { make: escapeHtml(value.vehicle.make) } : {}),
      ...(value.vehicle.model ? { model: escapeHtml(value.vehicle.model) } : {}),
      ...(value.vehicle.color ? { color: escapeHtml(value.vehicle.color) } : {}),
      ...(value.vehicle.active !== undefined ? { active: value.vehicle.active } : {}),
      ...(value.vehicle.seatCount ? { seatCount: value.vehicle.seatCount } : {}),
    } } : {}),
  };
}
function registerDriverRoutes(app,runtime) {
  const routes=[
    ['get','/admin/drivers','adminListDrivers','listDrivers'],
    ['get','/drivers/nearby','getNearbyDrivers','getNearbyDrivers'],
    ['patch','/drivers/me','updateMyDriverProfile','updateDriverProfile'],
    ['put','/drivers/me/availability','updateMyDriverAvailability','setAvailability'],
    ['put','/drivers/me/location','updateMyDriverLocation','heartbeat'],
    ['post','/admin/drivers/:id/approve','approveDriver','decideDriver'],
    ['post','/admin/drivers/:id/reject','rejectDriver','decideDriver'],
  ];
  for(const [method,path,operation,rpc] of routes) app[method](path,async(req,res)=>{
    if(!runtime.auth) return sendError(res,req.correlationId,501,'NOT_IMPLEMENTED','Authentication is not configured');
    let actor;
    try {actor=runtime.auth.verify(req);} catch {return sendError(res,req.correlationId,401,'UNAUTHENTICATED','Authentication required');}
    if(!routeAllowed(operation,actor.role)) return sendError(res,req.correlationId,403,'FORBIDDEN','Permission denied');
    try {
      const deadline=Date.now()+1800;
      let payload;
      if(rpc==='listDrivers') {
        const allowed=['page','limit','driverId','phone','name','approvalStatus','availability','serviceType'];
        if(Object.keys(req.query).some(key=>!allowed.includes(key) || typeof req.query[key]!=='string' || !req.query[key].trim())) throw {code:3};
        const page=req.query.page===undefined?0:Number(req.query.page),limit=req.query.limit===undefined?20:Number(req.query.limit);
        if(!Number.isInteger(page) || page<0 || page>2147483647 || !Number.isInteger(limit) || limit<1 || limit>100 ||
          (req.query.approvalStatus && !['PENDING','ACTIVE','REJECTED','SUSPENDED'].includes(req.query.approvalStatus)) ||
          (req.query.availability && !['ONLINE','OFFLINE','BUSY'].includes(req.query.availability)) ||
          (req.query.serviceType && !['MOTORBIKE','CAR_4_SEATS'].includes(req.query.serviceType))) throw {code:3};
        payload={pagination:{page,limit},driverId:req.query.driverId || '',phone:req.query.phone || '',name:req.query.name || '',
          approvalStatus:req.query.approvalStatus || '',availability:req.query.availability || '',serviceType:req.query.serviceType || ''};
      } else if(rpc==='getNearbyDrivers') {
        const allowed=['lat','lng','area','rad','radi','radiusKm','page','limit','status'];
        const radiusKeys=['rad','radi','radiusKm'].filter(key=>req.query[key]!==undefined);
        const named=req.query.area!==undefined;
        if(Object.keys(req.query).some(key=>!allowed.includes(key)) || radiusKeys.length>1 ||
          (named?(req.query.lat!==undefined || req.query.lng!==undefined || !resolveDemoArea(req.query.area)):
            ['lat','lng'].some(key=>typeof req.query[key]!=='string' || !req.query[key].trim())) ||
          allowed.some(key=>req.query[key]!==undefined && (typeof req.query[key]!=='string' || !req.query[key].trim()))) throw {code:3};
        payload={location:named?resolveDemoArea(req.query.area):{lat:Number(req.query.lat),lng:Number(req.query.lng)},radiusKm:radiusKeys.length?Number(req.query[radiusKeys[0]]):1,
          pagination:{page:req.query.page===undefined?0:Number(req.query.page),limit:req.query.limit===undefined?10:Number(req.query.limit)},status:req.query.status || ''};
        if(!Number.isInteger(payload.pagination.page) || !Number.isInteger(payload.pagination.limit) || payload.pagination.page<0 || payload.pagination.page>2147483647 ||
          payload.pagination.limit<1 || payload.pagination.limit>100 || !Number.isFinite(payload.radiusKm) || payload.radiusKm<0 || payload.radiusKm>1 ||
          !Number.isFinite(payload.location.lat) || !Number.isFinite(payload.location.lng) || Math.abs(payload.location.lat)>90 || Math.abs(payload.location.lng)>180 ||
          (payload.status && !['ONLINE','OFFLINE','BUSY'].includes(payload.status))) throw {code:3};
      } else if(rpc==='setAvailability') {
        if(!req.is('application/json') || !req.body || Object.keys(req.body).some(key=>key!=='availability') || !['ONLINE','OFFLINE'].includes(req.body.availability)) throw {code:3};
        payload={availability:req.body.availability};
      } else if(rpc==='heartbeat') {
        const value=req.body;
        if(!req.is('application/json') || !value || Object.keys(value).some(key=>!['lat','lng','heading','speed','accuracy','timestamp'].includes(key)) ||
          !['lat','lng'].every(key=>typeof value[key]==='number') || typeof value.timestamp!=='string') throw {code:3};
        payload={location:{lat:value.lat,lng:value.lng},observedAt:value.timestamp};
        for(const key of ['heading','speed','accuracy']) if(value[key]!==undefined) {
          if(typeof value[key]!=='number') throw {code:3};payload[key]=value[key];
        }
      } else if(rpc==='updateDriverProfile') {
        const value=req.body;
        const allowed=['fullName','phoneNumber','vehicle'];
        if(!req.is('application/json') || !value || Array.isArray(value) || typeof value!=='object' ||
          Object.keys(value).length===0 || Object.keys(value).some(key=>!allowed.includes(key)) ||
          ['fullName','phoneNumber'].some(key=>value[key]!==undefined && typeof value[key]!=='string') ||
          (value.vehicle!==undefined && (!value.vehicle || Array.isArray(value.vehicle) || typeof value.vehicle!=='object'))) throw {code:3};
        const fields=Object.keys(value);
        const vehicle=value.vehicle || {};
        const vehicleFields=Object.keys(vehicle);
        if(vehicleFields.some(key=>!['licensePlate','serviceType','make','model','color','seatCount'].includes(key)) ||
          vehicleFields.some(key=>key==='seatCount' ? !Number.isInteger(vehicle[key]) : typeof vehicle[key]!=='string') ||
          (value.fullName!==undefined && !value.fullName.trim()) ||
          (value.phoneNumber!==undefined && !/^\+[1-9]\d{5,14}$/.test(value.phoneNumber))) throw {code:3};
        if(value.vehicle!==undefined && !vehicleFields.length) throw {code:3};
        payload={
          fields,
          fullName:value.fullName || '',
          phoneNumber:value.phoneNumber || '',
          vehicleFields,
          licensePlate:vehicle.licensePlate || '',
          serviceType:vehicle.serviceType || '',
          make:vehicle.make || '',
          model:vehicle.model || '',
          color:vehicle.color || '',
          seatCount:vehicle.seatCount || 0,
        };
      } else {
        if(req.body!==undefined && (Array.isArray(req.body) || typeof req.body!=='object' || (req.body.reason!==undefined && typeof req.body.reason!=='string'))) throw {code:3};
        payload={driverId:req.params.id,decision:operation==='approveDriver'?'APPROVE':'REJECT',reason:req.body?.reason || ''};
      }
      if(!(await runtime.serviceHealth('driver-service',req.correlationId)).ready) throw {code:14};
      const result=await runtime.invoke('driver-service',rpc,payload,req.correlationId,Math.min(1500,Math.max(1,deadline-Date.now())),actor.token);
      res.set('Cache-Control','no-store');
      if(rpc==='listDrivers') {
        const total=Number(result.meta.totalItems);
        return res.json({items:result.items.map(driverBody),page:result.meta.page,limit:result.meta.limit,
          totalItems:total,totalPages:Number(result.meta.totalPages),total});
      }
      if(rpc==='getNearbyDrivers') {
        const total=Number(result.meta.totalItems);
        return res.json({items:result.items.map(value=>({driver:driverBody(value),distanceKm:value.distanceKm})),page:result.meta.page,limit:result.meta.limit,
          totalItems:total,totalPages:Number(result.meta.totalPages),total});
      }
      if(rpc==='heartbeat') return res.json({driverId:result.driverId,acceptedAt:result.acceptedAt,availability:result.availability});
      if(rpc==='updateDriverProfile') return res.json(updatedDriverBody(result));
      return res.json(driverBody(result));
    } catch(error) {return rpcError(res,req.correlationId,error);}
  });
}
module.exports={registerDriverRoutes,driverBody,updatedDriverBody};
