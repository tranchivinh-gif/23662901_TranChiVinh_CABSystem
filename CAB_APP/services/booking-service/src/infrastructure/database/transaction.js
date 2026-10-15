'use strict';
async function transaction(pool,action,readOnly=false) {
  const client=await pool.connect();
  try {
    await client.query(readOnly?'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY':'BEGIN');
    await client.query("SET LOCAL statement_timeout='1000ms'; SET LOCAL lock_timeout='400ms'");
    const value=await action(client);await client.query('COMMIT');return value;
  } catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
module.exports={transaction};
