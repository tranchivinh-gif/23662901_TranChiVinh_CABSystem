'use strict';
const { Pool } = require('pg');
const { drivers } = require('./demo-data');
const pool = new Pool({ host: 'driver-db', port: 5432, database: 'driver_db', user: 'cab_driver',
  password: process.env.DRIVER_DB_PASSWORD, connectionTimeoutMillis: 3000, max: 1 });
const active = drivers.slice(0,8).map(item => item.profileId);
let pending = false;
async function refresh() {
  if (pending) return;
  pending = true;
  try {
    await pool.query("UPDATE driver_availability SET last_heartbeat_at=now() WHERE driver_id=ANY($1::uuid[]) AND availability_status IN ('Available','Busy')", [active]);
    await pool.query(`UPDATE driver_current_location l SET observed_at=now(),received_at=now()
      FROM driver_availability a WHERE l.driver_id=a.driver_id AND l.driver_id=ANY($1::uuid[]) AND a.availability_status IN ('Available','Busy')`, [active]);
  } catch { /* Database/app startup and outages are reflected by Driver readiness. */ }
  finally { pending = false; }
}
void refresh();
setInterval(() => void refresh(), 10000);
