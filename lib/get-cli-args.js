'use strict';
const yargs = require('yargs');
const assert = require('assert');

module.exports = getCliArgs;

/**
 * Parse CLI flags and ENV VARS, return a configuraion object
 *
 * @returns {Object} configuration object
 */
function getCliArgs() {
  const argv = yargs
    .usage('Usage: $0 [options]')
    .example('$0 -p 80 -a 127.0.0.1 \\\n--cognito.region us-east-1 \\\n--cognito.user_pool_id ... \\\n--cognito.client_id ...')
    .env('NODE')
    .alias('p', 'port')
    .describe('p', 'Port to listen on')
    .default('p', process.env.npm_package_config_port)
    .alias('a', 'host')
    .describe('a', 'Host/address to listen on')
    .default('a', process.env.npm_package_config_host)
    .describe('cognito.region', 'Cognito region')
    .default('cognito.region', process.env.npm_package_config_cognito_region)
    .describe('cognito.user_pool_id', 'Cognito user pool ID')
    .default('cognito.user_pool_id', process.env.npm_package_config_cognito_user_pool_id)
    .describe('cognito.client_id', 'Cognito client ID')
    .default('cognito.client_id', process.env.npm_package_config_cognito_client_id)
    .alias('d', 'debug')
    .describe('debug', 'Enable debug logging')
    .boolean('d')
    .alias('h', 'help')
    .help()
    .argv;

  const { cognito } = argv;
  try {
    assert(cognito && cognito.region, 'cognito.region required.');
    assert(cognito && cognito.user_pool_id, 'cognito.user_pool_id required.');
    assert(cognito && cognito.client_id, 'cognito.client_id required.');
  } catch (err) {
    yargs.showHelp();
    console.error(err.message, '\n');
    process.exit();
  }

  return argv;
}
