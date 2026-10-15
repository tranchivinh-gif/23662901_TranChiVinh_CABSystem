'use strict';
const crypto=require('node:crypto');
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
function createMatchingAccess(pool,tokens,env=process.env) {
  return {
    async issueTripToken(_request,context) {
      const secret=env.CAB_TRIP_SERVICE_SECRET;
      if(!/^[a-f0-9]{64}$/i.test(secret || '') || !/^[a-f0-9]{64}$/i.test(context.authorization || '') ||
        !crypto.timingSafeEqual(Buffer.from(secret,'hex'),Buffer.from(context.authorization,'hex')))throw {code:16};
      context.assertActive();return {accessToken:tokens.tripToken(),expiresIn:30};
    },
    async issueMatchingToken(_request,context) {
      const secret=env.CAB_BOOKING_SERVICE_SECRET;
      if(!/^[a-f0-9]{64}$/i.test(secret || '') || !/^[a-f0-9]{64}$/i.test(context.authorization || '') ||
        !crypto.timingSafeEqual(Buffer.from(secret,'hex'),Buffer.from(context.authorization,'hex')))throw {code:16};
      context.assertActive();return {accessToken:tokens.matchingToken(),expiresIn:30};
    },
    async inspectDriverAccounts(request,context) {
      tokens.verifyMatching(context.authorization);
      if(!Array.isArray(request.accountIds) || request.accountIds.length>10 || request.accountIds.some(id=>!uuid.test(id)))throw {code:3};
      const rows=(await pool.query({text:"SELECT account_id FROM accounts WHERE account_id=ANY($1::uuid[]) AND role_code='DRIVER' AND status='Active'",values:[request.accountIds],query_timeout:350})).rows;
      context.assertActive();return {accountIds:rows.map(row=>row.account_id)};
    },
  };
}
module.exports={createMatchingAccess};
