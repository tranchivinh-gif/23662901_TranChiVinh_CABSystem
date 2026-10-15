'use strict';
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('node:path');
function createIdentityClient(config, env = process.env) {
  const definition = loader.loadSync(path.join(config.protoRoot, 'identity.proto'), { includeDirs: [config.protoRoot], defaults: true });
  const Identity = grpc.loadPackageDefinition(definition).cab.identity.v1.IdentityAccountService;
  const client = new Identity((env.IDENTITY_ACCOUNT_GRPC_HOST || 'identity-account-service') + ':' + (env.IDENTITY_ACCOUNT_GRPC_PORT || 9091), grpc.credentials.createInsecure());
  return {
    authorize(permission, resourceId, context) {
      const metadata = new grpc.Metadata();
      metadata.set('authorization', 'Bearer ' + context.token);
      metadata.set('x-correlation-id', context.correlationId);
      const deadline = Math.min(Date.now() + 700, context.deadline - 100);
      if (deadline <= Date.now()) throw { code: grpc.status.DEADLINE_EXCEEDED };
      return new Promise((resolve, reject) => client.authorizeAccess({ permission, resourceId }, metadata, { deadline },
        (error, value) => error ? reject(error) : resolve(value)));
    },
    close() { client.close(); },
  };
}
module.exports = { createIdentityClient };
