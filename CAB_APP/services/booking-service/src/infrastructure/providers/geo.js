'use strict';
// Demo provider replaces the external routing provider only; fare rules and bookings use real PostgreSQL.
function createGeoProvider(env=process.env) {
  if (env.CAB_PROFILE!=='demo-test' || env.NODE_ENV==='production') throw new Error('Configure a production Map/Geo adapter before starting Booking');
  return { async route({pickup,destination}) {
    const rad=value=>value*Math.PI/180;
    const a=Math.sin(rad(destination.lat-pickup.lat)/2)**2+Math.cos(rad(pickup.lat))*Math.cos(rad(destination.lat))*Math.sin(rad(destination.lng-pickup.lng)/2)**2;
    const distanceKm=Number((6371*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)))*1.25).toFixed(6));
    return {distanceKm,etaMinutes:Number((distanceKm/25*60).toFixed(2))};
  }};
}
module.exports={createGeoProvider};
