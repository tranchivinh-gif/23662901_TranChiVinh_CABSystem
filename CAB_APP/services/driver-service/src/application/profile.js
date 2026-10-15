'use strict';
const crypto=require('node:crypto');
const {registration}=require('../domain/driver');
const {transaction}=require('../infrastructure/database/transaction');
const grpc=require('@grpc/grpc-js');
function createProfile(pool,pii,verify) {
  return async(request,context)=>{
    verify(context.token,'driver:create-profile',request.accountId);
    const profile=registration(request);
    const fingerprint=pii.hmac(JSON.stringify([profile,request.documents.map(doc=>[doc.filename,doc.mediaType,crypto.createHash('sha256').update(doc.content).digest('hex')])]));
    return transaction(pool,async db=>{
      await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,8))',[request.accountId]);
      const existing=(await db.query('SELECT * FROM drivers WHERE account_id=$1',[request.accountId])).rows[0];
      if(existing) {
        if(!existing.registration_fingerprint?.equals(fingerprint)) throw {code:grpc.status.ALREADY_EXISTS};
        return {driverId:existing.driver_id,accountId:existing.account_id,status:existing.approval_status.toUpperCase()};
      }
      context.assertActive();
      const id=crypto.randomUUID(),value={fullName:profile.fullName,phone:profile.phoneNumber};
      const encrypted=pii.encrypt(JSON.stringify(value),'drivers:'+id+':profile');
      await db.query('INSERT INTO drivers (driver_id,account_id,phone_hash,profile_ciphertext,profile_key_id,profile_iv,profile_tag,registration_fingerprint) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[id,request.accountId,pii.hmac(profile.phoneNumber),encrypted.ciphertext,encrypted.keyId,encrypted.iv,encrypted.tag,fingerprint]);
      await db.query('INSERT INTO driver_availability (driver_id) VALUES ($1)',[id]);
      const vehicleId=crypto.randomUUID(),plate=pii.encrypt(profile.vehicle.licensePlate,'vehicles:'+vehicleId+':plate');
      await db.query('INSERT INTO vehicles (vehicle_id,driver_id,service_type,plate_hash,plate_ciphertext,plate_key_id,plate_iv,plate_tag,make,model,color,seat_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[vehicleId,id,profile.vehicle.serviceType,pii.hmac(profile.vehicle.licensePlate),plate.ciphertext,plate.keyId,plate.iv,plate.tag,profile.vehicle.make || null,profile.vehicle.model || null,profile.vehicle.color || null,profile.vehicle.seatCount ?? null]);
      const documents=[{type:'IDENTITY',value:profile.identityDocument},{type:'LICENSE',value:profile.driverLicense},
        ...request.documents.map((doc,index)=>({type:'UPLOAD_'+index,value:{filename:doc.filename,mediaType:doc.mediaType,contentBase64:doc.content.toString('base64')}}))];
      for(const doc of documents) {
        const docId=crypto.randomUUID(),sealed=pii.encrypt(JSON.stringify(doc.value),'driver_documents:'+docId+':document');
        await db.query('INSERT INTO driver_documents (document_id,driver_id,document_type,document_ciphertext,document_key_id,document_iv,document_tag) VALUES ($1,$2,$3,$4,$5,$6,$7)',[docId,id,doc.type,sealed.ciphertext,sealed.keyId,sealed.iv,sealed.tag]);
      }
      context.assertActive();
      return {driverId:id,accountId:request.accountId,status:'PENDING',availability:'OFFLINE'};
    });
  };
}
function project(row,pii,full=false) {
  const value=JSON.parse(pii.decrypt({ciphertext:row.profile_ciphertext,keyId:row.profile_key_id,iv:row.profile_iv,tag:row.profile_tag},'drivers:'+row.driver_id+':profile'));
  return {driverId:row.driver_id,fullName:value.fullName,phoneNumber:full?value.phone:'******'+value.phone.slice(-4),status:row.approval_status.toUpperCase(),
    availability:{Available:'ONLINE',Offline:'OFFLINE',Busy:'BUSY'}[row.availability_status || 'Offline']};
}
module.exports={createProfile,project};
