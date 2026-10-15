'use strict';
const {permanent,uuid}=require('../../../../lib/events/envelope');
const customer=new Set(['BookingCreated','DriverAssigned','NoDriverFound','DriverArrived','TripPickedUp','TripInProgress','TripCompleted','TripCancelled','TripFailed','PaymentSucceeded','PaymentFailed']);
const driver=new Set(['DriverOfferCreated','DriverAssigned','TripCompleted','TripCancelled','TripFailed','DriverApproved','DriverRejected','DriverSuspended']);
const allowedOwners={BookingCreated:'booking-service',DriverOfferCreated:'booking-service',DriverAssigned:'booking-service',NoDriverFound:'booking-service',DriverArrived:'trip-service',TripPickedUp:'trip-service',TripInProgress:'trip-service',TripCompleted:'trip-service',TripCancelled:'trip-service',TripFailed:'trip-service',PaymentSucceeded:'payment-service',PaymentFailed:'payment-service',PaymentStaffHandlingRequested:'payment-service',DriverApproved:'driver-service',DriverRejected:'driver-service',DriverSuspended:'driver-service',NotificationDeadLetter:'notification-service'};
function intent(event,now=Date.now()){
  const warning=event.eventType==='NotificationFailed',staff=event.eventType==='PaymentStaffHandlingRequested';
  if(event.eventType!=='NotificationRequested' && !warning && !staff)return null;
  const template=warning?'NotificationDeadLetter':staff?'PaymentStaffHandlingRequested':event.payload.templateCode;
  if(allowedOwners[template]!==event.producer)throw permanent('INVALID_NOTIFICATION_TEMPLATE_OWNER');
  if(template==='DriverOfferCreated' && (!uuid.test(event.payload.offerId || '') || !Number.isFinite(Date.parse(event.payload.expiresAt))))throw permanent('INVALID_DRIVER_OFFER_NOTIFICATION');
  if(template==='DriverOfferCreated' && Date.parse(event.payload.expiresAt)<=now)return null;
  if(customer.has(template) && !uuid.test(event.payload.customerId || ''))throw permanent('NOTIFICATION_CUSTOMER_REQUIRED');
  if(driver.has(template) && !event.payload.accountId && !event.payload.driverId && !['TripCancelled','TripFailed'].includes(template))throw permanent('NOTIFICATION_DRIVER_REQUIRED');
  for(const field of ['customerId','driverId','accountId'])if(event.payload[field] && !uuid.test(event.payload[field]))throw permanent('INVALID_NOTIFICATION_RECIPIENT');
  return {template,customer:customer.has(template),driver:driver.has(template),staff:['NoDriverFound','PaymentFailed','PaymentStaffHandlingRequested'].includes(template),admin:warning,channels:warning?['InApp']:['InApp','Push']};
}
function policy(value){if(value?.retryMax!==3 || JSON.stringify(value.backoffSeconds)!=='[1,5,15]')throw permanent('INVALID_NOTIFICATION_DELIVERY_POLICY');return value;}
module.exports={intent,policy};
