'use strict';
// Local demo data provisioning; never imported by business services.
const crypto = require('node:crypto');
const { Pool } = require('pg');
const { createPii } = require('../services/identity-account-service/src/infrastructure/security/pii');
const { hash } = require('../services/identity-account-service/src/infrastructure/security/password');
const { password, center, id, customers, operators, drivers } = require('./demo-data');
const pii = createPii();
const owners = {
  identity: ['IDENTITY_ACCOUNT','identity-account-db','identity_account_db','cab_identity'],
  customer: ['CUSTOMER','customer-db','customer_db','cab_customer'],
  driver: ['DRIVER','driver-db','driver_db','cab_driver'],
  booking: ['BOOKING','booking-db','booking_db','cab_booking'],
  trip: ['TRIP','trip-db','trip_db','cab_trip'],
  payment: ['PAYMENT','payment-db','payment_db','cab_payment'],
};
function pool(owner) {
  const [prefix,host,database,user] = owners[owner];
  return new Pool({host,database,user,password:process.env[prefix+'_DB_PASSWORD'],port:5432,max:1,connectionTimeoutMillis:3000});
}
async function transaction(owner, action) {
  const database=pool(owner), client=await database.connect();
  try { await client.query('BEGIN'); const result=await action(client); await client.query('COMMIT'); return result; }
  catch(error){await client.query('ROLLBACK');throw error;}
  finally {client.release();await database.end();}
}
async function seedIdentity() {
  const people=[...customers,...operators,...drivers];
  await transaction('identity',async db=>{
    for(const item of people){
      const encrypted=pii.encrypt(item.phone,'accounts:'+item.accountId+':phone');
      const emailEncrypted=item.role==='CUSTOMER'?pii.encrypt(item.email,'accounts:'+item.accountId+':email'):null;
      const status=item.name==='driver9'?'Pending':item.name==='driver10'?'Suspended':'Active';
      await db.query(`INSERT INTO accounts(account_id,role_code,phone_hash,phone_ciphertext,phone_key_id,phone_iv,phone_tag,email_hash,email_ciphertext,email_key_id,email_iv,email_tag,password_hash,status)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT(account_id) DO UPDATE SET
        email_hash=COALESCE(EXCLUDED.email_hash,accounts.email_hash),email_ciphertext=COALESCE(EXCLUDED.email_ciphertext,accounts.email_ciphertext),
        email_key_id=COALESCE(EXCLUDED.email_key_id,accounts.email_key_id),email_iv=COALESCE(EXCLUDED.email_iv,accounts.email_iv),email_tag=COALESCE(EXCLUDED.email_tag,accounts.email_tag)`,
      [item.accountId,item.role,pii.hmac(item.phone),encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag,
        item.role==='CUSTOMER'?pii.hmac(item.email):null,emailEncrypted?.ciphertext || null,emailEncrypted?.keyId || null,emailEncrypted?.iv || null,emailEncrypted?.tag || null,await hash(password),status]);
    }
    // The pending demo driver has completed OTP/profile registration and can be approved by Staff/Admin.
    const pending=drivers[8], verificationId=id('driver9:verification');
    await db.query(`INSERT INTO otp_verifications(verification_id,phone_hash,purpose,otp_hash,expires_at,verified_at,consumed_at)
      VALUES($1,$2,'DRIVER_REGISTRATION',$3,now()+interval '1 year',now(),now()) ON CONFLICT(verification_id) DO NOTHING`,
    [verificationId,pii.hmac(pending.phone),pii.hmac('demo-driver9-otp')]);
    await db.query(`INSERT INTO driver_registrations(account_id,verification_id,request_fingerprint,driver_id,status,completed_at)
      VALUES($1,$2,$3,$4,'Completed',now()) ON CONFLICT(account_id) DO NOTHING`,
    [pending.accountId,verificationId,pii.hmac('demo-driver9-registration'),pending.profileId]);
  });
}
async function seedCustomers() {
  await transaction('customer',async db=>{
    for(const item of customers){
      const profile={fullName:item.fullName,phone:item.phone,email:item.email,address:'CAB demo address'};
      const encrypted=pii.encrypt(JSON.stringify(profile),'customers:'+item.profileId+':profile');
      await db.query(`INSERT INTO customers(customer_id,account_id,phone_hash,profile_ciphertext,profile_key_id,profile_iv,profile_tag)
        VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(customer_id) DO NOTHING`,
      [item.profileId,item.accountId,pii.hmac(item.phone),encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag]);
    }
  });
}
async function seedDrivers() {
  await transaction('driver',async db=>{
    for(const [index,item] of drivers.entries()){
      const status=index===8?'Pending':index===9?'Suspended':'Active';
      const profile=pii.encrypt(JSON.stringify({fullName:item.fullName,phone:item.phone}),'drivers:'+item.profileId+':profile');
      await db.query(`INSERT INTO drivers(driver_id,account_id,phone_hash,profile_ciphertext,profile_key_id,profile_iv,profile_tag,approval_status,approved_by,approved_at)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(driver_id) DO NOTHING`,
      [item.profileId,item.accountId,pii.hmac(item.phone),profile.ciphertext,profile.keyId,profile.iv,profile.tag,status,
        status==='Active'?operators[0].accountId:null,status==='Active'?new Date():null]);
      const vehicleId=id(item.name+':vehicle'),plate='CAB-'+String(index+1).padStart(4,'0');
      const vehicle=pii.encrypt(plate,'vehicles:'+vehicleId+':plate');
      await db.query(`INSERT INTO vehicles(vehicle_id,driver_id,service_type,plate_hash,plate_ciphertext,plate_key_id,plate_iv,plate_tag,make,model,color,seat_count)
        VALUES($1,$2,'MOTORBIKE',$3,$4,$5,$6,$7,'CAB','Demo','black',1) ON CONFLICT(vehicle_id) DO NOTHING`,
      [vehicleId,item.profileId,pii.hmac(plate),vehicle.ciphertext,vehicle.keyId,vehicle.iv,vehicle.tag]);
      const availability=index<7?'Available':index===7?'Busy':'Offline';
      await db.query(`INSERT INTO driver_availability(driver_id,availability_status,available_since,last_heartbeat_at)
        VALUES($1,$2,$3,$4) ON CONFLICT(driver_id) DO NOTHING`,
      [item.profileId,availability,availability==='Available'?new Date(Date.now()-60000):null,index<8?new Date():null]);
      await db.query(`INSERT INTO driver_current_location(driver_id,current_location,observed_at)
        VALUES($1,ST_SetSRID(ST_MakePoint($2,$3),4326)::geography,now()) ON CONFLICT(driver_id) DO NOTHING`,
      [item.profileId,center.lng+(index+1)*0.00035,center.lat]);
      for(const documentType of ['IDENTITY','LICENSE','VEHICLE_REGISTRATION']) {
        const docId=id(item.name+':document:'+documentType);
        const sealed=pii.encrypt(JSON.stringify('CAB-DEMO-'+documentType+'-'+(index+1)),
          'driver_documents:'+docId+':document');
        await db.query(`INSERT INTO driver_documents(document_id,driver_id,document_type,document_ciphertext,document_key_id,document_iv,document_tag,status)
          VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(document_id) DO NOTHING`,
        [docId,item.profileId,documentType,sealed.ciphertext,sealed.keyId,sealed.iv,sealed.tag,status==='Active'?'Approved':'Pending']);
      }
    }
  });
}
async function seedBookings() {
  await transaction('booking',async db=>{
    await db.query("INSERT INTO service_types(service_type,active) VALUES('MOTORBIKE',true),('CAR_4_SEATS',true) ON CONFLICT DO NOTHING");
    const rule=id('motorbike:fare-rule');
    await db.query(`INSERT INTO fare_rules(fare_rule_id,service_type,version,base_fare,price_per_km,surcharge,effective_from)
      VALUES($1,'MOTORBIKE',1,12000,5000,0,'2026-01-01T00:00:00Z') ON CONFLICT(service_type,version) DO NOTHING`,[rule]);
    await db.query(`INSERT INTO fare_rules(fare_rule_id,service_type,version,base_fare,price_per_km,surcharge,effective_from)
      VALUES($1,'CAR_4_SEATS',1,20000,8000,0,'2026-01-01T00:00:00Z') ON CONFLICT(service_type,version) DO NOTHING`,[id('car:fare-rule')]);
    for(let index=1;index<=9;index++){
      const booking=id('historical:booking:'+index),trip=id('historical:trip:'+index);
      await db.query(`INSERT INTO bookings(booking_id,customer_id,service_type,status,payment_method,pickup_lat,pickup_lng,destination_lat,destination_lng,search_started_at,search_deadline_at,trip_id,provisioning_status)
        VALUES($1,$2,'MOTORBIKE','NoDriverFound','Cash',$3,$4,$5,$6,now()-interval '1 day',now()-interval '1 day'+interval '120 seconds',$7,'Completed')
        ON CONFLICT(booking_id) DO NOTHING`,[booking,customers[0].profileId,center.lat,center.lng,center.lat+0.01,center.lng+0.01,trip]);
      await db.query(`INSERT INTO fare_calculations(fare_calculation_id,booking_id,fare_rule_id,rule_version,distance_km,base_fare,price_per_km,surcharge,final_fare,estimated)
        VALUES($1,$2,$3,1,4,12000,5000,0,32000,true) ON CONFLICT(fare_calculation_id) DO NOTHING`,
      [id('historical:fare:'+index),booking,rule]);
    }
    const booking=id('completed:booking'),trip=id('completed:trip');
    await db.query(`INSERT INTO bookings(booking_id,customer_id,driver_id,service_type,status,payment_method,pickup_lat,pickup_lng,destination_lat,destination_lng,search_started_at,search_deadline_at,trip_id,provisioning_status)
      VALUES($1,$2,$3,'MOTORBIKE','Assigned','Electronic',$4,$5,$6,$7,now()-interval '1 day',now()-interval '1 day'+interval '120 seconds',$8,'Completed')
      ON CONFLICT(booking_id) DO NOTHING`,[booking,customers[0].profileId,drivers[7].profileId,center.lat,center.lng,center.lat+0.01,center.lng+0.01,trip]);
    await db.query(`INSERT INTO fare_calculations(fare_calculation_id,booking_id,fare_rule_id,rule_version,distance_km,base_fare,price_per_km,surcharge,final_fare,estimated)
      VALUES($1,$2,$3,1,4,12000,5000,0,32000,true) ON CONFLICT(fare_calculation_id) DO NOTHING`,
    [id('completed:fare'),booking,rule]);
  });
}
async function seedTrips() {
  await transaction('trip',async db=>{
    for(let index=1;index<=10;index++){
      const historical=index<=9,trip=id(historical?'historical:trip:'+index:'completed:trip');
      const booking=id(historical?'historical:booking:'+index:'completed:booking');
      const state=historical?'NoDriverFound':'Completed';
      await db.query(`INSERT INTO trips(trip_id,booking_id,customer_id,driver_id,state,service_type,payment_method,completed_at)
        VALUES($1,$2,$3,$4,$5,'MOTORBIKE',$6,$7) ON CONFLICT(trip_id) DO NOTHING`,
      [trip,booking,customers[0].profileId,historical?null:drivers[7].profileId,state,historical?'Cash':'Electronic',historical?null:new Date()]);
      await db.query(`INSERT INTO trip_fare_snapshot(trip_id,fare_rule_id,rule_version,base_fare,price_per_km,surcharge,distance_km,final_fare,estimated,rule_snapshot)
        VALUES($1,$2,1,12000,5000,0,4,32000,false,$3) ON CONFLICT(trip_id) DO NOTHING`,
      [trip,id('motorbike:fare-rule'),{serviceType:'MOTORBIKE',version:1}]);
      await db.query(`INSERT INTO trip_status_history(history_id,trip_id,to_state,correlation_id)
        VALUES($1,$2,$3,$4) ON CONFLICT(history_id) DO NOTHING`,
      [id('history:'+index),trip,state,id('correlation:'+index)]);
    }
  });
}
async function seedPayment() {
  await transaction('payment',async db=>{
    await db.query(`INSERT INTO payments(payment_id,trip_id,method,status,amount,customer_id,driver_id)
      VALUES($1,$2,'Electronic','Pending',32000,$3,$4) ON CONFLICT(payment_id) DO NOTHING`,
    [id('completed:payment'),id('completed:trip'),customers[0].profileId,drivers[7].profileId]);
  });
}
async function main() {
  await seedIdentity(); await seedCustomers(); await seedDrivers();
  await seedBookings(); await seedTrips(); await seedPayment();
  console.log('CAB demo data ready: 1 Customer, 10 Drivers, 1 Staff, 1 Admin, 10 Bookings/Trips, 1 Pending electronic Payment.');
  console.log('Login: Customer customer1@example.test; Staff 0900000011; Admin 0900000010; Drivers 0900000101..0900000110.');
  console.log('Demo password: ' + password + ' (local demo only). Nearby center: ' + center.lat + ',' + center.lng);
}
main().catch(error => { console.error('Demo seed failed: ' + (error.code || error.message)); process.exitCode = 1; });
