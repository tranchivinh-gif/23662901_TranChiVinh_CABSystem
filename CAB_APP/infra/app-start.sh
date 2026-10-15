#!/bin/sh
set -eu
. /run/cab-secrets/config.env
export CAB_PROFILE=demo-test NODE_ENV=development
export CAB_JWT_ACTIVE_KEY_ID=v1 CAB_PII_ACTIVE_KEY_ID=v1
export CAB_JWT_ISSUER=cab-system CAB_JWT_AUDIENCE=cab-public-api
export CAB_JWT_PUBLIC_KEY_PATH=/run/cab-secrets/jwt-public.pem
if [ "${CAB_APP_NAME:-}" = identity-account-service ]; then
  export CAB_JWT_PRIVATE_KEY_PATH=/run/cab-private/jwt-private.pem
fi
if [ "${CAB_APP_NAME:-}" = driver-service ] && [ "${CAB_DEMO_PRESENCE:-}" = true ] && [ "${1:-}" = services/driver-service/src/index.js ]; then
  node /app/scripts/demo-presence.js &
fi
exec node "$@"
