'use strict';
const crypto = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const {phone,text,AuthError} = require('../domain/auth');
const {opaque,tokenHash} = require('../infrastructure/security/tokens');
const {transaction} = require('../infrastructure/database/transaction');
const DEMO_DRIVER_PASSWORD = '123';
function createDriverRegistration({pool,pii,passwords,drivers,authorize,env}) {
  if (env.CAB_PROFILE !== 'demo-test' || env.NODE_ENV === 'production') throw new Error('Driver credential provisioning requires demo-test profile');
  const lock = (db,hash)=>db.query("SELECT pg_advisory_xact_lock(hashtextextended(encode($1::bytea,'hex'),0))",[hash]);
  const invalid = ()=>new AuthError('REGISTRATION_CONTEXT_INVALID',grpc.status.UNAUTHENTICATED);
  const unwrap = value=>{if(value instanceof AuthError)throw value;return value;};
  async function registerDriver(request,context) {
    const normalized = phone(request.phone), contextHash = tokenHash(text(request.verificationToken,'REGISTRATION_CONTEXT_REQUIRED'));
    let profile;
    try {profile=JSON.parse(request.driverProfileJson);} catch {throw new AuthError('INVALID_ARGUMENT');}
    if (!profile || Array.isArray(profile) || typeof profile!=='object' || Object.keys(profile).some(key=>!['fullName','phoneNumber','identityDocument','driverLicense','vehicle'].includes(key)) ||
        ['fullName','phoneNumber','identityDocument','driverLicense'].some(key=>typeof profile[key]!=='string' || !profile[key].trim()) || phone(profile.phoneNumber)!==normalized ||
        !profile.vehicle || typeof profile.vehicle.licensePlate!=='string' || !profile.vehicle.licensePlate.trim() || !['MOTORBIKE','CAR_4_SEATS'].includes(profile.vehicle.serviceType) ||
        ['make','model','color'].some(key=>profile.vehicle[key]!==undefined && typeof profile.vehicle[key]!=='string') ||
        (profile.vehicle.seatCount!==undefined && (!Number.isInteger(profile.vehicle.seatCount) || profile.vehicle.seatCount<1)) ||
        !Array.isArray(request.documents) || !request.documents.length || request.documents.length>5 || request.documents.some(doc=>typeof doc.filename!=='string' || !doc.filename.trim() || typeof doc.mediaType!=='string' || !Buffer.isBuffer(doc.content) || !doc.content.length || doc.content.length>1048576)) throw new AuthError('INVALID_ARGUMENT');
    if (request.documents.reduce((sum,doc)=>sum+doc.content.length,0)>2097152) throw new AuthError('INVALID_ARGUMENT');
    profile.phoneNumber=normalized;
    const payload=JSON.stringify(profile), phoneHash=pii.hmac(normalized);
    const fingerprint=pii.hmac(JSON.stringify([payload,request.documents.map(doc=>[doc.filename,doc.mediaType,crypto.createHash('sha256').update(doc.content).digest('hex')])]));
    const passwordHash=await passwords.hash(DEMO_DRIVER_PASSWORD);
    context.assertActive();
    const pending=unwrap(await transaction(pool,async db=>{
      await lock(db,phoneHash);
      const otp=(await db.query('SELECT *,expires_at<=now() AS expired FROM otp_verifications WHERE registration_context_hash=$1 FOR UPDATE',[contextHash])).rows[0];
      if(!otp || !otp.verified_at || otp.purpose!=='DRIVER_REGISTRATION' || !otp.phone_hash.equals(phoneHash)) return invalid();
      const account=(await db.query('SELECT * FROM accounts WHERE phone_hash=$1 FOR UPDATE',[phoneHash])).rows[0];
      const progress=account && (await db.query('SELECT * FROM driver_registrations WHERE account_id=$1',[account.account_id])).rows[0];
      if(progress?.status==='Completed' && progress.verification_id===otp.verification_id && progress.request_fingerprint.equals(fingerprint)) return {account,driverId:progress.driver_id,complete:true};
      if(otp.expired || otp.consumed_at) return invalid();
      if(account && (!progress || progress.status!=='PendingProfile' || account.status!=='Pending' || !progress.request_fingerprint.equals(fingerprint))) return new AuthError('PHONE_NUMBER_ALREADY_EXISTS',grpc.status.ALREADY_EXISTS);
      if(account) {
        if(progress.verification_id!==otp.verification_id) {
          await db.query('UPDATE otp_verifications SET consumed_at=now() WHERE verification_id=$1',[progress.verification_id]);
          await db.query('UPDATE driver_registrations SET verification_id=$2 WHERE account_id=$1',[account.account_id,otp.verification_id]);
        }
        return {account};
      }
      const id=crypto.randomUUID(),encrypted=pii.encrypt(normalized,'accounts:'+id+':phone');
      const created=(await db.query("INSERT INTO accounts (account_id,role_code,phone_hash,phone_ciphertext,phone_key_id,phone_iv,phone_tag,password_hash,status) VALUES ($1,'DRIVER',$2,$3,$4,$5,$6,$7,'Pending') RETURNING *",[id,phoneHash,encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag,passwordHash])).rows[0];
      await db.query("INSERT INTO driver_registrations (account_id,verification_id,request_fingerprint,status) VALUES ($1,$2,$3,'PendingProfile')",[id,otp.verification_id,fingerprint]);
      return {account:created};
    }));
    if(pending.complete) return {accountId:pending.account.account_id,role:'DRIVER',status:'PENDING',driverId:pending.driverId};
    const created=await drivers.create({accountId:pending.account.account_id,profileJson:payload,documents:request.documents},context);
    context.assertActive();
    return unwrap(await transaction(pool,async db=>{
      await lock(db,phoneHash);
      const progress=(await db.query('SELECT * FROM driver_registrations WHERE account_id=$1 FOR UPDATE',[pending.account.account_id])).rows[0];
      if(progress.status==='Completed') return {accountId:pending.account.account_id,role:'DRIVER',status:'PENDING',driverId:progress.driver_id};
      const otp=(await db.query('SELECT *,expires_at<=now() AS expired FROM otp_verifications WHERE verification_id=$1 FOR UPDATE',[progress.verification_id])).rows[0];
      if(otp.expired || otp.consumed_at) return invalid();
      await db.query("UPDATE driver_registrations SET status='Completed',driver_id=$2,completed_at=now() WHERE account_id=$1",[pending.account.account_id,created.driverId]);
      await db.query('UPDATE otp_verifications SET consumed_at=now() WHERE verification_id=$1',[progress.verification_id]);
      await db.query("INSERT INTO audit_events (audit_id,actor_id,event_type,aggregate_id,correlation_id) VALUES ($1,$2,'DriverRegistered',$3,$4)",[crypto.randomUUID(),pending.account.account_id,created.driverId,context.correlationId]);
      return {accountId:pending.account.account_id,role:'DRIVER',status:'PENDING',driverId:created.driverId};
    }));
  }
  async function updateDriverAccountStatus(request,context) {
    const actor=await authorize({permission:'driver:approve'},context);
    if(!['Active','Rejected'].includes(request.status) || (request.status==='Rejected' && !request.reason?.trim())) throw new AuthError('INVALID_ARGUMENT');
    return unwrap(await transaction(pool,async db=>{
      const row=(await db.query('SELECT a.*,r.driver_id,r.status AS registration_status FROM accounts a JOIN driver_registrations r USING(account_id) WHERE a.account_id=$1 AND r.driver_id=$2 FOR UPDATE OF a',[request.accountId,request.driverId])).rows[0];
      if(!row || row.role_code!=='DRIVER' || row.registration_status!=='Completed') return new AuthError('NOT_FOUND',grpc.status.NOT_FOUND);
      if(row.status===request.status) return {accountId:row.account_id,role:'DRIVER',status:row.status.toUpperCase()};
      if(row.status!=='Pending') return new AuthError('CONFLICT',grpc.status.FAILED_PRECONDITION);
      context.assertActive();
      await db.query('UPDATE accounts SET status=$2,updated_at=now() WHERE account_id=$1',[row.account_id,request.status]);
      // Reasons stay in encrypted Driver outbox; audit keeps only decision and identifiers.
      await db.query('INSERT INTO audit_events (audit_id,actor_id,event_type,aggregate_id,correlation_id,safe_metadata) VALUES ($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),actor.accountId,request.status==='Active'?'DriverApproved':'DriverRejected',request.driverId,context.correlationId,{accountId:row.account_id,status:request.status}]);
      return {accountId:row.account_id,role:'DRIVER',status:request.status.toUpperCase()};
    }));
  }
  return {registerDriver,updateDriverAccountStatus};
}
module.exports = {createDriverRegistration,DEMO_DRIVER_PASSWORD};
