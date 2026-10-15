'use strict';
const all = ['CUSTOMER', 'DRIVER', 'STAFF', 'ADMIN'];
const operators = ['STAFF', 'ADMIN'];
const policies = Object.create(null);
function allow(operations, roles) { for (const operation of operations.split(' ')) policies[operation] = roles; }
allow('logout getServiceTypes listTrips getTripById getTripPayment', all);
allow('updateMyCustomerProfile getMyBookings estimateFare createBooking rateTripDriver initiateElectronicPayment retryElectronicPayment', ['CUSTOMER']);
allow('getCustomerById getCustomerBookings', ['CUSTOMER', ...operators]);
allow('cancelTrip',all);
allow('getDriverById', ['DRIVER', ...operators]);
allow('updateMyDriverProfile updateMyDriverAvailability updateMyDriverLocation markTripArrived markTripPickedUp startTrip completeTrip confirmCashPayment acceptDriverOffer rejectDriverOffer', ['DRIVER']);
allow('getNearbyDrivers adminListTrips adminListOnlineDrivers adminListPayments adminListCustomers adminListVehicles adminCreateVehicle adminListDrivers approveDriver rejectDriver adminUpdateCustomer adminUpdateVehicle adminRedispatchTrip', operators);
allow('adminListAccounts adminCreateAccount adminQueryAuditLogs suspendCustomer suspendDriver activateDriver activateCustomer adminForceCloseTrip adminAdjustTripFare adminAdjustPayment adminUpdateAccount adminUpdateAccountRole adminGetPolicy adminCreatePolicyVersion', ['ADMIN']);
function routeAllowed(operation, role) { return policies[operation]?.includes(role) === true; }
module.exports = { policies, routeAllowed };
