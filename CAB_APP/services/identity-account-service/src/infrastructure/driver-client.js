'use strict';
const grpc = require('@grpc/grpc-js');
const loader = require('@grpc/proto-loader');
const path = require('node:path');
function createDriverClient(config, tokens, env = process.env) {
  const definition = loader.loadSync(path.join(config.protoRoot,'driver.proto'),{includeDirs:[config.protoRoot],defaults:true});
  const Driver = grpc.loadPackageDefinition(definition).cab.driver.v1.DriverService;
  const client = new Driver((env.DRIVER_GRPC_HOST || 'driver-service')+':'+(env.DRIVER_GRPC_PORT || 9093),grpc.credentials.createInsecure());
  return { create(payload,context) {
    const metadata = new grpc.Metadata();metadata.set('x-correlation-id',context.correlationId);
    metadata.set('authorization','Bearer '+tokens.driverProfileToken(payload.accountId));
    return new Promise((resolve,reject)=>client.createProfile(payload,metadata,{deadline:Math.min(Date.now()+1300,context.deadline-100)},
      (error,value)=>error?reject(error):resolve(value)));
  },close() {client.close();} };
}
module.exports = {createDriverClient};
