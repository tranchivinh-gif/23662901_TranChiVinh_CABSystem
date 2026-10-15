#!/bin/sh
set -eu
. /usr/local/bin/cab-db-env.sh
if [ "$#" -eq 0 ]; then
  set -- postgres
fi
exec /usr/local/bin/docker-entrypoint.sh "$@"
