#!/bin/sh
set -eu
. /run/cab-secrets/config.env
REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli --no-auth-warning ping | grep -qx PONG
