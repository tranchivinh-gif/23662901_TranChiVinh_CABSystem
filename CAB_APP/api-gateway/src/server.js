'use strict';
const http = require('node:http');
const { getConfig } = require('./config');
const { createApp } = require('./app');
const { createDependencies } = require('./infrastructure/dependencies');
async function start(config = getConfig(), options = {}) {
  const dependencies = options.dependencies || createDependencies(options.env || process.env);
  if (!options.dependencies && !dependencies.auth) { dependencies.close(); throw new Error('Missing Gateway JWT configuration'); }
  const server = http.createServer(createApp(dependencies));
  try { await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(config.port, config.host, () => { server.removeListener('error', reject); resolve(); });
  }); } catch (error) { await dependencies.close(); throw error; }
  const port = server.address().port;
  let closing;
  function stop() {
    if (!closing) closing = new Promise((resolve, reject) => {
      const timer = setTimeout(() => server.closeAllConnections(), 1000);
      timer.unref();
      server.close((error) => { clearTimeout(timer); error ? reject(error) : resolve(); });
    }).then(() => dependencies.close());
    return closing;
  }
  return { server, port, address: config.host + ':' + port, stop };
}
module.exports = { start };
