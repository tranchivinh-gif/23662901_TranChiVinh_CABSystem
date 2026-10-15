'use strict';
const crypto=require('node:crypto');
// Sandbox checkout only: payment succeeds exclusively through a signed webhook.
function createProvider(pool){
  return {async initiate(attempt,amount){
    const token=crypto.randomBytes(24).toString('base64url');
    await pool.query('INSERT INTO mock_provider_transactions(provider_reference,amount,checkout_token) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[attempt.provider_reference,amount,token]);
    const row=(await pool.query('SELECT * FROM mock_provider_transactions WHERE provider_reference=$1',[attempt.provider_reference])).rows[0];
    if(Number(row.amount)!==Number(amount))throw {code:9};
    return {checkoutToken:row.checkout_token};
  }};
}
module.exports={createProvider};
