'use strict';
const getCliArgs = require('./get-cli-args');

module.exports = parseCliArgs;

/**
 * Parse CLI flags and ENV VARS from an argv object, return a configuraion
 * object suitable for running server.
 *
 * @param {Object} argv - yargs argv object
 * @returns {Object} configuration object
 */
function parseCliArgs(argv = getCliArgs()) {
  return {
    cognito: argv.cognito,
    host: argv.host,
    port: argv.port,
    logLevel: argv.debug ? 'debug' : 'info'
  };
}
