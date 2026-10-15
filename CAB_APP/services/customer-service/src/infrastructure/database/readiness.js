'use strict';
// One service-owned pool; concurrent probes share one bounded query.
function createReadinessProbe(pool) {
  let pending;
  return async function isReady() {
    if (!pending) {
      pending = pool.query({ text: 'SELECT version FROM schema_migrations ORDER BY version', query_timeout: 350 })
        .then(result => result.rows.length >= 3 && [1, 2, 3].every((version,index)=>result.rows[index].version===version))
        .catch(() => false).finally(() => { pending = undefined; });
    }
    let timer;
    try { return await Promise.race([pending, new Promise(resolve => { timer = setTimeout(() => resolve(false), 400); })]); }
    finally { clearTimeout(timer); }
  };
}
module.exports = { createReadinessProbe };
