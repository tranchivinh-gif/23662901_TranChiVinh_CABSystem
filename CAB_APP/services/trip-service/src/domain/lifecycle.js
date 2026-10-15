'use strict';
const crypto=require('node:crypto');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const states={Searching:'SEARCHING',DriverAssigned:'DRIVER_ASSIGNED',DriverArrived:'ARRIVED',PickedUp:'PICKED_UP',InProgress:'IN_PROGRESS',Completed:'COMPLETED',Cancelled:'CANCELED',Failed:'FAILED',NoDriverFound:'FAILED'};
const previous={DriverArrived:'DriverAssigned',PickedUp:'DriverArrived',InProgress:'PickedUp',Completed:'InProgress'};
function fail(code=3){throw {code};}
function policy(value){
  if(!value || value.freeCancelSeconds!==30 || value.cancellationFeeVnd!==20000 || value.noShowWaitSeconds!==300 || value.ratingWindowDays!==7)fail(9);
  return value;
}
function transition(state,target){if(!previous[target])fail();if(state!==target && previous[target]!==state)fail(9);return state!==target;}
function reason(value){if(typeof value!=='string' || !value.trim() || value.length>500)fail();return value.trim();}
function cancellation(trip,actor,why,settings,now){
  if(actor.role==='DRIVER'){
    if(!['CustomerNoShow','NO_SHOW'].includes(why))fail(7);
    if(trip.state!=='DriverArrived' || !trip.arrived_at || now-new Date(trip.arrived_at).getTime()<settings.noShowWaitSeconds*1000)fail(9);
    return {reason:'NO_SHOW',fee:settings.cancellationFeeVnd};
  }
  if(['CustomerNoShow','NO_SHOW'].includes(why))fail(7);
  if(!['Searching','DriverAssigned','DriverArrived'].includes(trip.state))fail(9);
  return {reason:why,fee:trip.state==='Searching'?0:now-new Date(trip.assigned_at).getTime()<=settings.freeCancelSeconds*1000?0:settings.cancellationFeeVnd};
}
function rating(trip,score,comment,settings,now){
  if(!Number.isInteger(score) || score<1 || score>5 || typeof comment!=='string' || comment.length>2000)fail();
  if(trip.state!=='Completed' || !trip.completed_at || now-new Date(trip.completed_at).getTime()>settings.ratingWindowDays*86400000)fail(9);
}
function fingerprint(value){return crypto.createHash('sha256').update(JSON.stringify(value)).digest();}
module.exports={uuid,states,fail,policy,transition,reason,cancellation,rating,fingerprint};
