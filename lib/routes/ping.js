'use strict';

var pkg = require('../../package.json');

module.exports = createPingRoute;

/**
 * Create ping route.
 *
 * @returns {Object} Hapi route config object
 */
function createPingRoute() {
  return {
    method: 'GET',
    path: '/ping',
    handler
  };

  function handler(request, reply) {
    reply({
      service: 'Core Gateway User Authentication',
      route: '/ping',
      status: 'healthy',
      version: pkg.version
    });
  }
}
