'use strict';

// Synthetic demo addresses. All named bookings start at diachia so driver ranking stays unchanged.
const addresses=Object.freeze({
  diachia:Object.freeze({lat:10,lng:10}),
  diachib:Object.freeze({lat:10.01,lng:10.01}),
  diachic:Object.freeze({lat:10.02,lng:10}),
  diachid:Object.freeze({lat:10,lng:10.02}),
  diachie:Object.freeze({lat:9.99,lng:10.01}),
});
const areas=Object.freeze({
  khuvuc1:addresses.diachia,
  khuvuc2:Object.freeze({lat:10.002,lng:10.002}),
  khuvuc3:Object.freeze({lat:10.004,lng:10.004}),
});

function resolveDemoAddress(value,kind){
  if(typeof value!=='string')return value;
  const key=value.trim().toLowerCase();
  if(kind==='pickup' && key!=='diachia')return undefined;
  if(kind==='destination' && key==='diachia')return undefined;
  return Object.hasOwn(addresses,key)?addresses[key]:undefined;
}

function resolveDemoArea(value){
  if(typeof value!=='string')return undefined;
  const key=value.trim().toLowerCase();
  return Object.hasOwn(areas,key)?areas[key]:undefined;
}

module.exports={addresses,areas,resolveDemoAddress,resolveDemoArea};
