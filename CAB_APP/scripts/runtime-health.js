'use strict';
// Container-private probe, never a public service HTTP port.
const path = require('node:path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
async function main() {
  const name = process.argv[2];
  if (name === 'api-gateway') {
    const response = await fetch('http://127.0.0.1:' + (process.env.GATEWAY_PORT || 8080) + '/api/v1/ready', { signal: AbortSignal.timeout(1800) });
    if (!response.ok || (await response.json()).status !== 'READY') throw new Error('Gateway not ready');
    return;
  }
  const config = require(path.resolve(__dirname, '../services', name, 'src/config')).getConfig();
  const root = path.resolve(__dirname, '../contracts/proto');
  const definition = protoLoader.loadSync(path.join(root, 'common.proto'), { includeDirs: [root], defaults: true });
  const Health = grpc.loadPackageDefinition(definition).cab.common.v1.InternalHealth;
  const client = new Health('127.0.0.1:' + config.port, grpc.credentials.createInsecure());
  try {
    const result = await new Promise((resolve, reject) => client.check({}, { deadline: Date.now() + 500 }, (error, value) => error ? reject(error) : resolve(value)));
    if (result.name !== name || result.status !== 'SERVING' || !result.ready) throw new Error('Service not ready');
  } finally { client.close(); }
}
main().catch(() => { console.error('Runtime not ready'); process.exitCode = 1; });
