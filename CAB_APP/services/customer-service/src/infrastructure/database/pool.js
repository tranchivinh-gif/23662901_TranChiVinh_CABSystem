'use strict';
const { Pool } = require('pg');
const { getDatabaseConfig } = require('../../config/database');
function createPool(env = process.env) { return new Pool(getDatabaseConfig(env)); }
module.exports = { createPool };
