FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df
WORKDIR /app
COPY CAB_APP/package.json CAB_APP/package-lock.json .npmrc ./
COPY CAB_APP/api-gateway/package.json ./api-gateway/package.json
COPY CAB_APP/services/identity-account-service/package.json ./services/identity-account-service/package.json
COPY CAB_APP/services/customer-service/package.json ./services/customer-service/package.json
COPY CAB_APP/services/driver-service/package.json ./services/driver-service/package.json
COPY CAB_APP/services/booking-service/package.json ./services/booking-service/package.json
COPY CAB_APP/services/trip-service/package.json ./services/trip-service/package.json
COPY CAB_APP/services/payment-service/package.json ./services/payment-service/package.json
COPY CAB_APP/services/notification-service/package.json ./services/notification-service/package.json
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY CAB_APP/contracts/proto ./contracts/proto
COPY CAB_APP/lib ./lib
COPY CAB_APP/infra/app-start.sh ./infra/app-start.sh
COPY CAB_APP/scripts/runtime-health.js ./scripts/runtime-health.js
COPY CAB_APP/services/driver-service/src ./services/driver-service/src
COPY CAB_APP/scripts/demo-presence.js CAB_APP/scripts/demo-data.js ./scripts/
USER node
ENTRYPOINT ["/bin/sh", "/app/infra/app-start.sh"]
CMD ["services/driver-service/src/index.js"]
