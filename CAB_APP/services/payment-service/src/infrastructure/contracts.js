'use strict';
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
function loadContracts(protoRoot) {
  const definition = protoLoader.loadSync(path.join(protoRoot, 'payment.proto'), {
    includeDirs: [protoRoot], keepCase: false, longs: String, enums: String, defaults: true, oneofs: true,
  });
  const cab = grpc.loadPackageDefinition(definition).cab;
  return { health: cab.common.v1.InternalHealth, business: cab.payment.v1.PaymentService };
}
module.exports = { loadContracts };
