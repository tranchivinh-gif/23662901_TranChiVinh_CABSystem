'use strict';
const owners = [
  ['identity-account-service','IDENTITY_ACCOUNT','cab_identity','identity_account_db'],
  ['customer-service','CUSTOMER','cab_customer','customer_db'],
  ['driver-service','DRIVER','cab_driver','driver_db'],
  ['booking-service','BOOKING','cab_booking','booking_db'],
  ['trip-service','TRIP','cab_trip','trip_db'],
  ['payment-service','PAYMENT','cab_payment','payment_db'],
  ['notification-service','NOTIFICATION','cab_notification','notification_db'],
];
async function main() {
  for (const [service,prefix,user,database] of owners) {
    Object.assign(process.env, {
      [`${prefix}_DB_HOST`]: service.replace(/-service$/, '-db'),
      [`${prefix}_DB_PORT`]: '5432', [`${prefix}_DB_NAME`]: database,
      [`${prefix}_DB_USER`]: user, [`${prefix}_DB_MIGRATION_USER`]: `${user}_migrator`,
    });
    const result = await require(`../services/${service}/src/infrastructure/database/migrate`).migrate();
    console.log(JSON.stringify({ service, applied: result.applied, skipped: result.skipped.length }));
  }
  console.log('All seven owning databases migrated.');
}
main().catch(error => { console.error('Migration failed: ' + (error.code || error.message)); process.exitCode = 1; });
