'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.TRIP_DB_USER || 'cab_trip';
  const migrationUser = env.TRIP_DB_MIGRATION_USER || 'cab_trip_migrator';
  const database = env.TRIP_DB_NAME || 'trip_db';
  if (database !== 'trip_db' || user !== 'cab_trip' || migrationUser !== 'cab_trip_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.TRIP_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'TRIP_DB_MIGRATION_PASSWORD' : 'TRIP_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.TRIP_DB_HOST || 'trip-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 15, min: migration ? 0 : 3,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'trip-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
