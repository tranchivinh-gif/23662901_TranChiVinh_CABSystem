#!/bin/sh
set -eu
. /usr/local/bin/cab-db-env.sh
PGPASSWORD="$CAB_RUNTIME_PASSWORD" psql -h 127.0.0.1 -U "$CAB_RUNTIME_USER" -d "$POSTGRES_DB" -tAc 'SELECT 1' | grep -qx 1
