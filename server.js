#!/usr/bin/env node
const config = require('./configs/config');
/**
 * Module dependencies.
 */
const app = require('./app');

/**
 * Listen on provided port, on all network interfaces.
 */

app.listen(config.APP_PORT, () => console.log(`Listen ${config.APP_PORT}`));
