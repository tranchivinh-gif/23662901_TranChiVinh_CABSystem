'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.NOTIFICATION_DB_USER || 'cab_notification';
  const migrationUser = env.NOTIFICATION_DB_MIGRATION_USER || 'cab_notification_migrator';
  const database = env.NOTIFICATION_DB_NAME || 'notification_db';
  if (database !== 'notification_db' || user !== 'cab_notification' || migrationUser !== 'cab_notification_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.NOTIFICATION_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'NOTIFICATION_DB_MIGRATION_PASSWORD' : 'NOTIFICATION_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.NOTIFICATION_DB_HOST || 'notification-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 10, min: migration ? 0 : 2,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'notification-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
