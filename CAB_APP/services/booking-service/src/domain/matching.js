'use strict';
function policy(value) {
  if(!value || value.radiusKm!==5 || value.maxCandidates!==10 ||
    !((value.offerTimeoutSeconds===60 && value.searchTimeoutSeconds===120) ||
      (value.offerTimeoutSeconds===300 && value.searchTimeoutSeconds===3000) ||
      (value.offerTimeoutSeconds===120 && value.searchTimeoutSeconds===1200)) ||
    value.strategy!=='sequential' || value.radiusExpansion!==false)throw {code:9,businessCode:'MATCHING_POLICY_INVALID'};
  return value;
}
function claim(booking,driverId,checkOnly=false) {
  return {driverId,bookingId:booking.booking_id,serviceType:booking.service_type,
    pickup:{lat:Number(booking.pickup_lat),lng:Number(booking.pickup_lng)},checkOnly};
}
function offerAction(offer,booking,accepted) {
  return {offerId:offer.offer_id,bookingId:booking.booking_id,driverId:offer.driver_id,tripId:booking.trip_id,
    offerStatus:accepted?'ACCEPTED':'REJECTED',tripState:accepted?'DRIVER_ASSIGNED':'SEARCHING'};
}
module.exports={policy,claim,offerAction};
