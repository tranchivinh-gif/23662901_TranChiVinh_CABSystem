'use strict';
function getDatabaseConfig(env = process.env, mode = 'runtime') {
  if (!['runtime', 'migration'].includes(mode)) throw new Error('Invalid database mode');
  const migration = mode === 'migration';
  const user = env.IDENTITY_ACCOUNT_DB_USER || 'cab_identity';
  const migrationUser = env.IDENTITY_ACCOUNT_DB_MIGRATION_USER || 'cab_identity_migrator';
  const database = env.IDENTITY_ACCOUNT_DB_NAME || 'identity_account_db';
  if (database !== 'identity_account_db' || user !== 'cab_identity' || migrationUser !== 'cab_identity_migrator') throw new Error('Database ownership configuration mismatch');
  const port = Number(env.IDENTITY_ACCOUNT_DB_PORT ?? 5432);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database port');
  const password = env[migration ? 'IDENTITY_ACCOUNT_DB_MIGRATION_PASSWORD' : 'IDENTITY_ACCOUNT_DB_PASSWORD'];
  if (!password || password === 'CHANGE_ME') throw new Error('Missing database credential');
  return {
    host: env.IDENTITY_ACCOUNT_DB_HOST || 'identity-account-db', port, database,
    user: migration ? migrationUser : user, password,
    max: migration ? 1 : 10, min: migration ? 0 : 2,
    connectionTimeoutMillis: 3000, idleTimeoutMillis: 60000, maxLifetimeSeconds: 1800,
    application_name: 'identity-account-service-' + mode,
  };
}
module.exports = { getDatabaseConfig };
