#!/bin/sh
set -eu

# Sourced by the official PostgreSQL entrypoint on an empty data volume.
# Keep bootstrap superuser credentials separate from migration/runtime credentials.
for cab_role in "$CAB_RUNTIME_USER" "$CAB_MIGRATION_USER"; do
  case "$cab_role" in ''|*[!a-z0-9_]*|postgres) echo 'Invalid service role name' >&2; exit 1 ;; esac
done
for cab_secret in "$CAB_RUNTIME_PASSWORD" "$CAB_MIGRATION_PASSWORD" "$POSTGRES_PASSWORD"; do
  case "$cab_secret" in ''|CHANGE_ME|*[!A-Za-z0-9_-]*) echo 'Invalid database credential configuration' >&2; exit 1 ;; esac
  [ "${#cab_secret}" -ge 24 ] || { echo 'Database credentials must contain at least 24 characters' >&2; exit 1; }
done
[ "$CAB_RUNTIME_USER" != "$CAB_MIGRATION_USER" ] || { echo 'Runtime and migration roles must differ' >&2; exit 1; }
[ "$CAB_RUNTIME_PASSWORD" != "$CAB_MIGRATION_PASSWORD" ] && [ "$CAB_RUNTIME_PASSWORD" != "$POSTGRES_PASSWORD" ] && [ "$CAB_MIGRATION_PASSWORD" != "$POSTGRES_PASSWORD" ] || { echo 'Database credentials must differ' >&2; exit 1; }

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=db_name="$POSTGRES_DB" \
  --set=runtime_user="$CAB_RUNTIME_USER" --set=runtime_password="$CAB_RUNTIME_PASSWORD" \
  --set=migration_user="$CAB_MIGRATION_USER" --set=migration_password="$CAB_MIGRATION_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L', :'runtime_user', :'runtime_password') \gexec
SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD %L', :'migration_user', :'migration_password') \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', :'db_name') \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', datname) FROM pg_database WHERE datname <> :'db_name' \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO %I, %I', :'db_name', :'runtime_user', :'migration_user') \gexec
REVOKE ALL ON SCHEMA public FROM PUBLIC;
SELECT format('ALTER SCHEMA public OWNER TO %I', :'migration_user') \gexec
SELECT format('GRANT USAGE ON SCHEMA public TO %I', :'runtime_user') \gexec
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO %I', :'migration_user', :'runtime_user') \gexec
SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO %I', :'migration_user', :'runtime_user') \gexec
SQL

# Driver image installs PostGIS before this script. Runtime needs existing spatial
# functions/types but must not own extensions or be granted DDL privileges.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  --set=runtime_user="$CAB_RUNTIME_USER" --set=migration_user="$CAB_MIGRATION_USER" <<'SQL'
SELECT format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO %I, %I', :'runtime_user', :'migration_user') \gexec
SQL
