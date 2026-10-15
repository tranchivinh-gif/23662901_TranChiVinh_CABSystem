'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { Client } = require('pg');
const { getDatabaseConfig } = require('../../config/database');
const defaultDirectory = path.resolve(__dirname, '../../..', 'migrations');
function migrationFiles(directory = defaultDirectory) {
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('.sql')).map((filename) => {
    const match = /^V([0-9]{6})__([a-z0-9_]+)\.sql$/.exec(filename);
    if (!match) throw new Error('Invalid migration filename: ' + filename);
    const bytes = fs.readFileSync(path.join(directory, filename));
    return { version: Number(match[1]), filename, checksum: crypto.createHash('sha256').update(bytes).digest('hex'), sql: bytes.toString('utf8') };
  }).sort((a, b) => a.version - b.version);
  if (!files.length || files.some((file, index) => file.version !== index + 1)) throw new Error('Migration versions must be unique and contiguous from 1');
  return files;
}
async function migrate({ config = getDatabaseConfig(process.env, 'migration'), directory = defaultDirectory } = {}) {
  const files = migrationFiles(directory);
  const client = new Client(config);
  const lockKey = crypto.createHash('sha256').update('cab:migrations:' + config.database).digest().readBigInt64BE().toString();
  let locked = false;
  await client.connect();
  try {
    await client.query("SET statement_timeout='30s'; SET lock_timeout='10s'; SET timezone='UTC'; SET search_path=public;");
    const owner = (await client.query('SELECT current_database() AS database, current_user AS username')).rows[0];
    if (owner.database !== 'customer_db' || owner.username !== 'cab_customer_migrator') throw new Error('Migrations require the owning migration role/database');
    await client.query('SELECT pg_advisory_lock($1::bigint)', [lockKey]);
    locked = true;
    await client.query('BEGIN');
    try {
      await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (version integer PRIMARY KEY CHECK (version > 0), filename text NOT NULL UNIQUE, checksum text NOT NULL CHECK (checksum ~ '^[0-9a-f]{64}$'), applied_at timestamptz NOT NULL DEFAULT now()); REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON schema_migrations FROM cab_customer;");
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    const applied = (await client.query('SELECT version, filename, checksum FROM schema_migrations ORDER BY version')).rows;
    for (const [index, record] of applied.entries()) {
      const expected = files[index];
      if (!expected || record.version !== expected.version || record.filename !== expected.filename || record.checksum !== expected.checksum) {
        throw new Error('Applied migration missing, out of order or checksum changed: version ' + record.version);
      }
    }
    const result = { service: 'customer-service', database: config.database, applied: [], skipped: applied.map((record) => record.version) };
    for (const file of files.slice(applied.length)) {
      await client.query('BEGIN');
      try {
        await client.query(file.sql);
        await client.query('INSERT INTO schema_migrations (version, filename, checksum) VALUES ($1,$2,$3)', [file.version, file.filename, file.checksum]);
        await client.query('COMMIT');
        result.applied.push(file.version);
      } catch (error) { await client.query('ROLLBACK'); throw error; }
    }
    return result;
  } finally {
    if (locked) { try { await client.query('SELECT pg_advisory_unlock($1::bigint)', [lockKey]); } catch { /* Closing the connection also releases session locks. */ } }
    await client.end();
  }
}
if (require.main === module) {
  migrate().then((result) => console.log(JSON.stringify(result)))
    .catch((error) => { console.error(JSON.stringify({ service: 'customer-service', code: error.code || 'MIGRATION_FAILED', message: error.message })); process.exitCode = 1; });
}
module.exports = { migrate, migrationFiles, defaultDirectory };
