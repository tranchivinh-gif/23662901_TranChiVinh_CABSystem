'use strict';
const crypto = require('node:crypto');
const grpc = require('@grpc/grpc-js');
const domain = require('../domain/auth');
const { AuthError } = domain;
const { opaque, tokenHash } = require('../infrastructure/security/tokens');
const { transaction } = require('../infrastructure/database/transaction');
function createAuthService({ pool, pii, passwords, tokens, otpProvider, profiles }) {
  const dummyPassword = passwords.hash(opaque());
  const audit = (db, event, context, actor = null, metadata = {}) => db.query(
    'INSERT INTO audit_events (audit_id,actor_id,event_type,aggregate_id,correlation_id,safe_metadata) VALUES ($1,$2,$3,$2,$4,$5)',
    [crypto.randomUUID(),actor,event,context.correlationId,metadata]);
  const lockPhone = (db, hash) => db.query("SELECT pg_advisory_xact_lock(hashtextextended(encode($1::bytea,'hex'),0))",[hash]);
  function unwrap(value) { if (value instanceof AuthError) throw value; return value; }
  const badContext = () => new AuthError('REGISTRATION_CONTEXT_INVALID',grpc.status.UNAUTHENTICATED);
  const invalidRefresh = () => new AuthError('REFRESH_TOKEN_INVALID',grpc.status.UNAUTHENTICATED);
  async function requestOtp(request, context) {
    const phone = domain.phone(request.phone), purpose = domain.purpose(request.purpose), phoneHash = pii.hmac(phone);
    const otp = await otpProvider.send(phone,purpose);
    context.assertActive();
    return transaction(pool,async db => {
      await lockPhone(db,phoneHash);
      await db.query('UPDATE otp_verifications SET consumed_at=now() WHERE phone_hash=$1 AND purpose=$2 AND verified_at IS NULL AND consumed_at IS NULL',[phoneHash,purpose]);
      const id = crypto.randomUUID();
      const row = (await db.query("INSERT INTO otp_verifications (verification_id,phone_hash,purpose,otp_hash,expires_at) VALUES ($1,$2,$3,$4,now()+interval '300 seconds') RETURNING expires_at",[id,phoneHash,purpose,pii.hmac(id+'.'+otp)])).rows[0];
      await audit(db,'OtpRequested',context);
      return { verificationId:id,expiresAt:row.expires_at.toISOString() };
    });
  }
  async function verifyOtp(request, context) {
    const phoneHash = pii.hmac(domain.phone(request.phone)), purpose = domain.purpose(request.purpose);
    const otp = domain.text(request.otp);
    return unwrap(await transaction(pool,async db => {
      await lockPhone(db,phoneHash);
      const row = (await db.query('SELECT *,expires_at<=now() AS expired FROM otp_verifications WHERE phone_hash=$1 AND purpose=$2 AND consumed_at IS NULL ORDER BY created_at DESC,verification_id DESC LIMIT 1 FOR UPDATE',[phoneHash,purpose])).rows[0];
      let code;
      if (!row || row.verified_at) code='OTP_INVALID';
      else if (row.expired) code='OTP_EXPIRED';
      else if (row.wrong_attempts >= otpProvider.maxWrongAttempts) code='OTP_ATTEMPTS_EXCEEDED';
      else if (!crypto.timingSafeEqual(row.otp_hash,pii.hmac(row.verification_id+'.'+otp))) {
        await db.query('UPDATE otp_verifications SET wrong_attempts=wrong_attempts+1 WHERE verification_id=$1',[row.verification_id]);
        code='OTP_INVALID';
      }
      if (code) { await audit(db,'OtpRejected',context,null,{reason:code}); return new AuthError(code,code==='OTP_ATTEMPTS_EXCEEDED'?grpc.status.RESOURCE_EXHAUSTED:grpc.status.INVALID_ARGUMENT); }
      const registrationContext = opaque();
      await db.query('UPDATE otp_verifications SET verified_at=now(),registration_context_hash=$2 WHERE verification_id=$1',[row.verification_id,tokenHash(registrationContext)]);
      await audit(db,'OtpVerified',context);
      return { verificationToken:registrationContext };
    }));
  }
  async function registerCustomer(request, context) {
    const value = domain.registration(request), emailHash=pii.hmac(value.email);
    const fingerprint = pii.hmac(JSON.stringify([value.email,value.password]));
    const passwordHash = await passwords.hash(value.password);
    context.assertActive();
    const pending = unwrap(await transaction(pool,async db => {
      await lockPhone(db,emailHash);
      const account = (await db.query('SELECT * FROM accounts WHERE email_hash=$1 FOR UPDATE',[emailHash])).rows[0];
      const progress = account && (await db.query('SELECT * FROM customer_registrations WHERE account_id=$1',[account.account_id])).rows[0];
      if (progress?.status==='Completed' && progress.request_fingerprint.equals(fingerprint)) return { account,complete:true };
      if (account && (!progress || account.status!=='Pending' || !progress.request_fingerprint.equals(fingerprint)))
        return new AuthError('EMAIL_ALREADY_EXISTS',grpc.status.ALREADY_EXISTS);
      if (account) return { account };
      const id = crypto.randomUUID(),emailEncrypted=pii.encrypt(value.email,'accounts:'+id+':email');
      const created = (await db.query("INSERT INTO accounts (account_id,role_code,email_hash,email_ciphertext,email_key_id,email_iv,email_tag,password_hash,status) VALUES ($1,'CUSTOMER',$2,$3,$4,$5,$6,$7,'Pending') RETURNING *",
        [id,emailHash,emailEncrypted.ciphertext,emailEncrypted.keyId,emailEncrypted.iv,emailEncrypted.tag,passwordHash])).rows[0];
      await db.query("INSERT INTO customer_registrations (account_id,request_fingerprint,status) VALUES ($1,$2,'PendingProfile')",[id,fingerprint]);
      await audit(db,'RegistrationPending',context,id);
      return { account:created };
    }));
    const result = account => ({ accountId:account.account_id,role:account.role_code,status:account.status.toUpperCase() });
    if (pending.complete) return result(pending.account);
    context.assertActive();
    await profiles.create({ accountId:pending.account.account_id,phone:value.phone,fullName:value.fullName,email:value.email },context);
    context.assertActive();
    return unwrap(await transaction(pool,async db => {
      await lockPhone(db,emailHash);
      const progress = (await db.query('SELECT * FROM customer_registrations WHERE account_id=$1 FOR UPDATE',[pending.account.account_id])).rows[0];
      if (progress.status==='Completed') return result({ ...pending.account,status:'Active' });
      context.assertActive();
      await db.query("UPDATE accounts SET status='Active',updated_at=now() WHERE account_id=$1",[pending.account.account_id]);
      await db.query("UPDATE customer_registrations SET status='Completed',completed_at=now() WHERE account_id=$1",[pending.account.account_id]);
      await audit(db,'CustomerRegistered',context,pending.account.account_id);
      return result({ ...pending.account,status:'Active' });
    }));
  }
  async function issue(db, account, familyId=crypto.randomUUID(), rotatedFrom=null) {
    const refreshToken=opaque(),accessToken=tokens.access(account);
    await db.query("INSERT INTO refresh_sessions (session_id,account_id,token_hash,family_id,rotated_from,expires_at) VALUES ($1,$2,$3,$4,$5,now()+interval '7 days')",[crypto.randomUUID(),account.account_id,tokenHash(refreshToken),familyId,rotatedFrom]);
    return { accessToken,refreshToken,expiresIn:1800,refreshExpiresIn:604800,accountId:account.account_id,role:account.role_code };
  }
  async function canLogin(db, account) {
    if (account.status==='Active') return true;
    if (account.role_code!=='DRIVER' || !['Pending','Rejected'].includes(account.status)) return false;
    // Only completed Driver onboarding may log in to inspect its pending/rejected profile.
    return (await db.query("SELECT 1 FROM driver_registrations WHERE account_id=$1 AND status='Completed'",[account.account_id])).rowCount===1;
  }
  async function login(request, context) {
    const password=domain.text(request.password),byEmail=Boolean(request.email);
    if(byEmail && request.phone || !byEmail && !request.phone) throw new AuthError('INVALID_ARGUMENT');
    const identity=byEmail?domain.email(request.email):domain.phone(request.phone),identityHash=pii.hmac(identity);
    const account=(await pool.query(byEmail?'SELECT * FROM accounts WHERE email_hash=$1 AND role_code=\'CUSTOMER\'':'SELECT * FROM accounts WHERE phone_hash=$1 AND role_code<>\'CUSTOMER\'',[identityHash])).rows[0];
    const correct=await passwords.verify(account?.password_hash || await dummyPassword,password);
    if (!correct || !account) { await audit(pool,'LoginFailed',context,null,{reason:'INVALID_CREDENTIALS'}); throw new AuthError('INVALID_CREDENTIALS',grpc.status.UNAUTHENTICATED); }
    context.assertActive();
    return unwrap(await transaction(pool,async db => {
      const current=(await db.query('SELECT * FROM accounts WHERE account_id=$1 FOR UPDATE',[account.account_id])).rows[0];
      if (!await canLogin(db,current)) { await audit(db,'LoginFailed',context,current.account_id,{reason:'ACCOUNT_NOT_ACTIVE'}); return new AuthError('ACCOUNT_NOT_ACTIVE',grpc.status.PERMISSION_DENIED); }
      const pair=await issue(db,current); await audit(db,'LoginSucceeded',context,current.account_id); return pair;
    }));
  }
  async function refresh(request, context) {
    const hash=tokenHash(domain.text(request.refreshToken));
    context.assertActive();
    return unwrap(await transaction(pool,async db => {
      const found=(await db.query('SELECT session_id,family_id FROM refresh_sessions WHERE token_hash=$1',[hash])).rows[0];
      if (!found) return invalidRefresh();
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,1))',[found.family_id]);
      const session=(await db.query('SELECT *,expires_at<=now() AS expired FROM refresh_sessions WHERE session_id=$1 FOR UPDATE',[found.session_id])).rows[0];
      if (session.revoked_at || session.expired) {
        if (session.revoked_at) await db.query('UPDATE refresh_sessions SET revoked_at=COALESCE(revoked_at,now()) WHERE family_id=$1',[session.family_id]);
        await audit(db,'RefreshRejected',context,session.account_id,{reason:session.revoked_at?'REPLAY':'EXPIRED'});
        return invalidRefresh();
      }
      const account=(await db.query('SELECT * FROM accounts WHERE account_id=$1 FOR UPDATE',[session.account_id])).rows[0];
      if (!await canLogin(db,account)) return new AuthError('ACCOUNT_NOT_ACTIVE',grpc.status.PERMISSION_DENIED);
      context.assertActive();
      await db.query('UPDATE refresh_sessions SET revoked_at=now() WHERE session_id=$1',[session.session_id]);
      const pair=await issue(db,account,session.family_id,session.session_id);
      await audit(db,'RefreshRotated',context,account.account_id); return pair;
    }));
  }
  async function logout(request, context) {
    let actor;
    try { actor=tokens.verify(context.authorization); } catch { throw new AuthError('UNAUTHENTICATED',grpc.status.UNAUTHENTICATED); }
    const hash=tokenHash(domain.text(request.refreshToken));
    return unwrap(await transaction(pool,async db => {
      const found=(await db.query('SELECT session_id,family_id,account_id FROM refresh_sessions WHERE token_hash=$1',[hash])).rows[0];
      if (!found || found.account_id!==actor.sub) return invalidRefresh();
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,1))',[found.family_id]);
      // Revoke the presented session's descendants too, so an old token cannot spare a rotated session.
      await db.query('UPDATE refresh_sessions SET revoked_at=COALESCE(revoked_at,now()) WHERE family_id=$1',[found.family_id]);
      await audit(db,'Logout',context,actor.sub); return {};
    }));
  }
  return { requestOtp,verifyOtp,registerCustomer,login,refresh,logout };
}
module.exports = { createAuthService };
