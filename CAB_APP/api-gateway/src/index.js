'use strict';
const { start } = require('./server');
if (require.main === module) {
  start().then((runtime) => {
    console.log(JSON.stringify({ event: 'listening', name: 'api-gateway', protocol: 'http', address: runtime.address, checkpoint: 'CP-06' }));
    const shutdown = () => runtime.stop().then(() => {
      process.removeListener('SIGINT', shutdown);
      process.removeListener('SIGTERM', shutdown);
    });
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
module.exports = { start };
