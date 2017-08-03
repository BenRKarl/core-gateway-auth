#!/usr/bin/env node
'use strict';
const assert = require('assert');
const hapi = require('hapi');
const hapiBunyan = require('hapi-bunyan');
const createLogger = require('./lib/create-logger');
const fetchPublicKeys = require('./lib/fetch-public-keys');

// Support: "node index.js" execution entry point
if (require.main === module) {
  const parseCliArgs = require('./lib/parse-cli-args');
  const serverOptions = parseCliArgs();
  const logger = createLogger({ level: serverOptions.logLevel });
  const { cognito } = serverOptions;

  cognito.host = `cognito-idp.${cognito.region}.amazonaws.com`;
  cognito.poolUrl = `https://${cognito.host}/${cognito.user_pool_id}`;
  cognito.keyUrl = `${cognito.poolUrl}/.well-known/jwks.json`;

  fetchPublicKeys(cognito.keyUrl)
    .then(publicKeys => {
      logger.info(`Downloaded ${publicKeys.size} public keys from ${cognito.keyUrl}`);
      return createServer(publicKeys, Object.assign(serverOptions, { logger }));
    })
    .then(server => {
      return server.start().then(() => server);
    })
    .then(server => {
      logger.info(`Server running at ${server.info.uri}`);
    })
    .catch(
      /* istanbul ignore next */
      (err) => {
        switch (err.code) {
          case 'EACCES':
            logger.fatal({ err }, `Unable to bind port ${serverOptions.port}`);
            break;
          default:
            throw err;
        }
      }
    );
  /* istanbul ignore next */
  process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, `Uncaught rejection: ${err.message}`);
    process.exit(1);
  });
}

/**
 * Create an instance of the core-gateway-auth server.
 *
 * @param {Map} publicKeys - A Map of public Cognito keys, keyed by kid
 * @param {Object} options - server options: cognito, host, port, logger
 * @returns {Promise} resolves to Hapi server once plugin registration is complete
 */
function createServer(publicKeys, options = {}) {
  const {
    host = process.env.npm_package_config_host,
    port = process.env.npm_package_config_port,
    logger = createLogger(),
    cognito
  } = options;

  assert(cognito.region, 'cognito.region option required');
  assert(cognito.user_pool_id, 'cognito.user_pool_id option required');
  assert(cognito.client_id, 'cognito.client_id option required');

  const server = new hapi.Server({ debug: false });
  server.connection({ host, port });

  const bunyanPlugin = {
    register: hapiBunyan,
    options: { logger }
  };

  return server.register([bunyanPlugin]).then(() => {
    // load routes
    // POST /authenticate
    server.route(require('./lib/routes/authenticate')(cognito));
    // POST /token/refresh
    server.route(require('./lib/routes/token-refresh')(cognito));
    // POST /token/validate
    server.route(require('./lib/routes/token-validate')(cognito, publicKeys));

    return server;
  });
}

