'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.CUSTOMER_DB_USER || 'cab_customer';
  const migrationUser = env.CUSTOMER_DB_MIGRATION_USER || 'cab_customer_migrator';
  const database = env.CUSTOMER_DB_NAME || 'customer_db';
  if (database !== 'customer_db' || user !== 'cab_customer' || migrationUser !== 'cab_customer_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.CUSTOMER_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'CUSTOMER_DB_MIGRATION_PASSWORD' : 'CUSTOMER_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.CUSTOMER_DB_HOST || 'customer-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 10, min: migration ? 0 : 2,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'customer-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
