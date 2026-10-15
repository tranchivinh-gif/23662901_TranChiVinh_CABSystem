FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df
WORKDIR /app
COPY CAB_APP/infra/bootstrap-secrets.js ./bootstrap-secrets.js
CMD ["node", "/app/bootstrap-secrets.js"]
