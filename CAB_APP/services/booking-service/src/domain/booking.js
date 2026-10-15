'use strict';
const crypto = require('node:crypto');
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function fail(code = 'INVALID_ARGUMENT', status = 3) { throw { code: status, businessCode: code }; }
function route(value) {
  if (!value || !['MOTORBIKE','CAR_4_SEATS'].includes(value.serviceType)) fail('INVALID_SERVICE_TYPE');
  for (const point of [value.pickup,value.destination]) {
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng) || Math.abs(point.lat)>90 || Math.abs(point.lng)>180 || Object.keys(point).some(key=>!['lat','lng'].includes(key))) fail();
  }
  return {pickup:value.pickup,destination:value.destination,serviceType:value.serviceType};
}
function canonical(value) {
  if (Array.isArray(value)) return '['+value.map(canonical).join(',')+']';
  if (value && typeof value === 'object') return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonical(value[key])).join(',')+'}';
  return JSON.stringify(value);
}
function fingerprint(value) { return crypto.createHash('sha256').update(canonical(value)).digest(); }
function money(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) fail();
  const [whole,decimal=''] = String(value).split('.');
  return BigInt(whole)*100n+BigInt(decimal.padEnd(2,'0'));
}
function decimal(value) { return (value/100n)+'.'+String(value%100n).padStart(2,'0'); }
function calculate(rule,distanceKm,etaMinutes) {
  if (!Number.isFinite(distanceKm) || distanceKm<0 || !Number.isFinite(etaMinutes) || etaMinutes<0) fail('MAP_PROVIDER_UNAVAILABLE',14);
  const distance=BigInt(Math.round(distanceKm*1e6));
  const micros=(money(rule.base_fare)+money(rule.surcharge))*1000000n+money(rule.price_per_km)*distance;
  const rounded=((micros+50000000000n)/100000000000n)*100000n;
  if (rounded>BigInt(Number.MAX_SAFE_INTEGER)) fail('FARE_OUT_OF_RANGE',14);
  return {total:{amount:decimal(rounded),currency:'VND'},distanceKm:(Number(distance)/1e6).toFixed(6),fareRuleVersion:String(rule.version),
    baseFare:String(rule.base_fare),pricePerKm:String(rule.price_per_km),surcharge:String(rule.surcharge),estimated:true,etaMinutes,fareRuleId:rule.fare_rule_id};
}
function pagination(value={}) {
  const page=value.page ?? 0,limit=value.limit ?? 10;
  if (!Number.isInteger(page) || page<0 || !Number.isInteger(limit) || limit<1 || limit>100 || !Number.isSafeInteger(page*limit)) fail();
  return {page,limit};
}
module.exports={uuid,fail,route,canonical,fingerprint,calculate,pagination};
