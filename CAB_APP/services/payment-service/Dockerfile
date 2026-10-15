FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
COPY api-gateway/package.json ./api-gateway/package.json
COPY services/identity-account-service/package.json ./services/identity-account-service/package.json
COPY services/customer-service/package.json ./services/customer-service/package.json
COPY services/driver-service/package.json ./services/driver-service/package.json
COPY services/booking-service/package.json ./services/booking-service/package.json
COPY services/trip-service/package.json ./services/trip-service/package.json
COPY services/payment-service/package.json ./services/payment-service/package.json
COPY services/notification-service/package.json ./services/notification-service/package.json
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY contracts/proto ./contracts/proto
COPY lib ./lib
COPY infra/app-start.sh ./infra/app-start.sh
COPY scripts/runtime-health.js ./scripts/runtime-health.js
COPY scripts/manual-webhook-sign.js ./scripts/manual-webhook-sign.js
COPY services/payment-service/src ./services/payment-service/src
USER node
ENTRYPOINT ["/bin/sh", "/app/infra/app-start.sh"]
CMD ["services/payment-service/src/index.js"]
