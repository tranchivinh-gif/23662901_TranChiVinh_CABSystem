#!/bin/sh
set -eu
. /run/cab-secrets/config.env
case "${REDIS_PASSWORD:-}" in ''|CHANGE_ME|*[!A-Za-z0-9_-]*) echo 'Invalid Redis credential configuration' >&2; exit 1 ;; esac
[ "${#REDIS_PASSWORD}" -ge 24 ] || { echo 'Redis credential must contain at least 24 characters' >&2; exit 1; }
umask 077
cat > /tmp/cab-redis.conf <<EOF
bind 0.0.0.0
port 6379
protected-mode yes
requirepass "$REDIS_PASSWORD"
dir /data
appendonly yes
appendfsync everysec
EOF
chown redis:redis /tmp/cab-redis.conf
exec /usr/local/bin/docker-entrypoint.sh redis-server /tmp/cab-redis.conf
