'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.DRIVER_DB_USER || 'cab_driver';
  const migrationUser = env.DRIVER_DB_MIGRATION_USER || 'cab_driver_migrator';
  const database = env.DRIVER_DB_NAME || 'driver_db';
  if (database !== 'driver_db' || user !== 'cab_driver' || migrationUser !== 'cab_driver_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.DRIVER_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'DRIVER_DB_MIGRATION_PASSWORD' : 'DRIVER_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.DRIVER_DB_HOST || 'driver-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 20, min: migration ? 0 : 4,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'driver-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
