'use strict';
const bunyan = require('bunyan');

const SERVICE_NAME = 'core-gateway-auth';

module.exports = createLogger;

/**
 * Create an instance of a Bunyan logger appropriate for use by the
 * formation-doc-portal server.
 *
 * @param {Object} options - Bunyan options
 * @returns {Object} Bunyan logger object
 */
function createLogger({
  name = SERVICE_NAME,
  level = 'info',
  silent = false
} = {}) {
  const ringbuffer = new bunyan.RingBuffer({ limit: 100 });
  const streams = [ { level: 'trace', stream: ringbuffer, type: 'raw' } ];
  if (!silent) {
    streams.push({ level, stream: process.stdout });
  }

  return bunyan.createLogger({
    name,
    streams,
    serializers: bunyan.stdSerializers
  });
}
