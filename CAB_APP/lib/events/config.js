'use strict';
const topics=['booking','trip','driver','payment','notification','audit'].map(context=>'cab.'+context+'.events.v1');
const owners=['identity-account-service','customer-service','driver-service','booking-service','trip-service','payment-service','notification-service'];
function topicFor(service){if(!owners.includes(service))throw new Error('Unknown event owner');return 'cab.'+(['identity-account-service','customer-service'].includes(service)?'audit':service.replace('-service',''))+'.events.v1';}
module.exports={topics,owners,topicFor,retrySeconds:[1,5,15],partitions:3,retentionMs:604800000,dlqRetentionMs:1209600000};
