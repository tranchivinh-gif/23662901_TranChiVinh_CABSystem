'use strict';
const {uuid}=require('../../../../lib/events/envelope');
function createResolveAccount(pool,verify){return async(request,context)=>{verify(context.token);if(!uuid.test(request.id || ''))throw {code:3};const row=(await pool.query('SELECT account_id FROM drivers WHERE driver_id=$1',[request.id])).rows[0];if(!row)throw {code:5};return {id:row.account_id};};}
module.exports={createResolveAccount};
