'use strict';
const decodeJwt = require('../decode-jwt');
const validateToken = require('../validate-token');

module.exports = createTokenValidateRoute;

/**
 * Create authenticate route.
 *
 * @param {Object} cognito - An object containing Cognito configuration
 *   (region, user_pool_id, client_id)
 * @param {Map} publicKeys - A Map of Cognito public keys, kayed by kid
 * @returns {Object} Hapi route config object
 */
function createTokenValidateRoute(cognito, publicKeys) {
  return {
    method: 'POST',
    path: '/token/validate',
    handler
  };

  function handler(request, reply) {
    const { token } = request.payload;
    try {
      const decodedToken = decodeJwt(publicKeys, token);
      validateToken(cognito, decodedToken);
      reply({
        token_use: decodedToken.token_use,
        auth_time: decodedToken.auth_time,
        exp: decodedToken.exp,
        username: decodedToken['cognito:username'],
        email: decodedToken.email,
        email_verified: decodedToken.email_verified
      });
    } catch (err) {
      request.log(['token', 'invalidToken'], 'Failed to validate token');
      return reply({
        message: err.message,
        errorCode: 'InvalidToken'
      }).code(400);
    }
  }
}
