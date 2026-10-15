'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.PAYMENT_DB_USER || 'cab_payment';
  const migrationUser = env.PAYMENT_DB_MIGRATION_USER || 'cab_payment_migrator';
  const database = env.PAYMENT_DB_NAME || 'payment_db';
  if (database !== 'payment_db' || user !== 'cab_payment' || migrationUser !== 'cab_payment_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.PAYMENT_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'PAYMENT_DB_MIGRATION_PASSWORD' : 'PAYMENT_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.PAYMENT_DB_HOST || 'payment-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 10, min: migration ? 0 : 2,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'payment-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
