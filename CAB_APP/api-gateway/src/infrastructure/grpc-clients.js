'use strict';
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const targets = [
  { name: 'identity-account-service', context: 'identity', type: 'IdentityAccountService', prefix: 'IDENTITY_ACCOUNT', port: 9091 },
  { name: 'customer-service', context: 'customer', type: 'CustomerService', prefix: 'CUSTOMER', port: 9092 },
  { name: 'driver-service', context: 'driver', type: 'DriverService', prefix: 'DRIVER', port: 9093 },
  { name: 'booking-service', context: 'booking', type: 'BookingService', prefix: 'BOOKING', port: 9094 },
  { name: 'trip-service', context: 'trip', type: 'TripService', prefix: 'TRIP', port: 9095 },
  { name: 'payment-service', context: 'payment', type: 'PaymentService', prefix: 'PAYMENT', port: 9096 },
  { name: 'notification-service', context: 'notification', type: 'NotificationService', prefix: 'NOTIFICATION', port: 9097 },
];
function loadContracts() {
  const protoRoot = path.resolve(__dirname, '../../../contracts/proto');
  const definition = protoLoader.loadSync(targets.map((target) => path.join(protoRoot, target.context + '.proto')), {
    includeDirs: [protoRoot], keepCase: false, longs: String, enums: String, defaults: true, oneofs: true,
  });
  return grpc.loadPackageDefinition(definition).cab;
}
// Clients are created explicitly; requiring the Gateway does not connect to dependencies.
// Runtime routing/dependency aggregation own these clients and close them on shutdown.
function createGrpcClients(env = process.env) {
  const contracts = loadContracts();
  const endpoints = targets.map((target) => {
    const host = env[target.prefix + '_GRPC_HOST'] || target.name;
    const port = Number(env[target.prefix + '_GRPC_PORT'] ?? target.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid ' + target.prefix + '_GRPC_PORT');
    return { ...target, address: host + ':' + port };
  });
  const clients = Object.fromEntries(endpoints.map((target) => [target.name, {
    health: new contracts.common.v1.InternalHealth(target.address, grpc.credentials.createInsecure()),
    business: new contracts[target.context].v1[target.type](target.address, grpc.credentials.createInsecure()),
  }]));
  return { clients, close() { for (const client of Object.values(clients)) { client.health.close(); client.business.close(); } } };
}
module.exports = { targets, loadContracts, createGrpcClients };
