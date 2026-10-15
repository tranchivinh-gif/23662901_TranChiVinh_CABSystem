'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.BOOKING_DB_USER || 'cab_booking';
  const migrationUser = env.BOOKING_DB_MIGRATION_USER || 'cab_booking_migrator';
  const database = env.BOOKING_DB_NAME || 'booking_db';
  if (database !== 'booking_db' || user !== 'cab_booking' || migrationUser !== 'cab_booking_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.BOOKING_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'BOOKING_DB_MIGRATION_PASSWORD' : 'BOOKING_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.BOOKING_DB_HOST || 'booking-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 15, min: migration ? 0 : 3,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'booking-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
