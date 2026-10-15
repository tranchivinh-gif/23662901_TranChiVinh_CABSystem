'use strict';
const grpc=require('@grpc/grpc-js');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const invalid=()=>{throw {code:grpc.status.INVALID_ARGUMENT};};
function registration(request) {
  let value;
  try {value=JSON.parse(request.profileJson);} catch {invalid();}
  if(!uuid.test(request.accountId || '') || !value || Array.isArray(value) || typeof value!=='object' || Object.keys(value).some(key=>!['fullName','phoneNumber','identityDocument','driverLicense','vehicle'].includes(key)) ||
    typeof value.fullName!=='string' || !value.fullName.trim() || !/^\+[1-9]\d{5,14}$/.test(value.phoneNumber || '') ||
    typeof value.identityDocument!=='string' || !value.identityDocument.trim() || typeof value.driverLicense!=='string' || !value.driverLicense.trim()) invalid();
  const vehicle=value.vehicle;
  if(!vehicle || typeof vehicle.licensePlate!=='string' || !vehicle.licensePlate.trim() || !['MOTORBIKE','CAR_4_SEATS'].includes(vehicle.serviceType) ||
    ['make','model','color'].some(key=>vehicle[key]!==undefined && typeof vehicle[key]!=='string') ||
    (vehicle.seatCount!==undefined && (!Number.isInteger(vehicle.seatCount) || vehicle.seatCount<1)) ||
    !Array.isArray(request.documents) || request.documents.length<1 || request.documents.length>5) invalid();
  let total=0;
  for(const doc of request.documents) {
    if(typeof doc.filename!=='string' || !doc.filename.trim() || typeof doc.mediaType!=='string' || !Buffer.isBuffer(doc.content) || !doc.content.length || doc.content.length>1048576) invalid();
    total+=doc.content.length;
  }
  if(total>2097152) invalid();
  return {...value,fullName:value.fullName.trim(),vehicle:{...vehicle,licensePlate:vehicle.licensePlate.replace(/[\s.-]/g,'').toUpperCase()}};
}
function location(request) {
  const point=request.location;
  if(!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180 ||
    !/^\d{4}-\d{2}-\d{2}T/.test(request.observedAt || '') || !Number.isFinite(Date.parse(request.observedAt))) invalid();
  for(const key of ['heading','speed','accuracy']) if(Object.hasOwn(request,key) && (!Number.isFinite(request[key]) || request[key]<0 || (key==='heading' && request[key]>=360))) invalid();
  return {lat:point.lat,lng:point.lng,observedAt:new Date(request.observedAt),heading:request.heading ?? null,speed:request.speed ?? null,accuracy:request.accuracy ?? null};
}
function nearby(request) {
  const point=request.location;
  const page=request.pagination?.page ?? 0,limit=request.pagination?.limit ?? 10;
  if(!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180 ||
    !Number.isFinite(request.radiusKm) || request.radiusKm<0 || request.radiusKm>1 || !Number.isInteger(page) || page<0 || page>2147483647 ||
    !Number.isInteger(limit) || limit<1 || limit>100 || (request.status && !['ONLINE','OFFLINE','BUSY'].includes(request.status))) invalid();
  return {...point,page,limit,radiusKm:request.radiusKm,status:request.status || ''};
}
module.exports={uuid,invalid,registration,location,nearby};
