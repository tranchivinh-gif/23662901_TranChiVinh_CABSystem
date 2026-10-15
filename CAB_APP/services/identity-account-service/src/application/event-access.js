'use strict';
const crypto=require('node:crypto');
function createEventAccess(pool,tokens,verify,env){return {
  async issueNotificationToken(_request,context){const secret=env.CAB_NOTIFICATION_SERVICE_SECRET;if(!/^[a-f0-9]{64}$/i.test(secret || '') || !/^[a-f0-9]{64}$/i.test(context.authorization || '') || !crypto.timingSafeEqual(Buffer.from(secret,'hex'),Buffer.from(context.authorization,'hex')))throw {code:16};context.assertActive();return {accessToken:tokens.notificationToken(),expiresIn:30};},
  async listNotificationOperators(request,context){verify(context.authorization);if(!Array.isArray(request.roles) || !request.roles.length || request.roles.some(role=>!['STAFF','ADMIN'].includes(role)))throw {code:3};return {accountIds:(await pool.query("SELECT account_id FROM accounts WHERE status='Active' AND role_code=ANY($1::text[]) ORDER BY account_id",[request.roles])).rows.map(row=>row.account_id)};},
};}
module.exports={createEventAccess};
