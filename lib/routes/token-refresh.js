'use strict';
const getTokens = require('../get-tokens');

const {
  CognitoUserPool,
  CognitoUser,
  CognitoRefreshToken
} = require('amazon-cognito-identity-js');

module.exports = createTokenRefreshRoute;

/**
 * Create token refresh route.
 *
 * @param {Object} cognito - An object containing Cognito configuration
 *   (region, user_pool_id, client_id)
 * @returns {Object} Hapi route config object
 */
function createTokenRefreshRoute(cognito) {
  const poolData = {
    UserPoolId: cognito.user_pool_id,
    ClientId: cognito.client_id
  };
  const userPool = new CognitoUserPool(poolData);

  return {
    method: 'POST',
    path: '/token/refresh',
    handler
  };

  function handler(request, reply) {
    const { payload } = request;

    if (payload.username && payload.refreshToken) {
      const cognitoUser = new CognitoUser({
        Username: payload.username,
        Pool: userPool
      });

      const refreshToken = new CognitoRefreshToken({ RefreshToken: payload.refreshToken });

      cognitoUser.refreshSession(refreshToken, (err, session) => {
        if (err) {
          request.log(['token', 'renewFail'], `Unable to renew token: ${err.message}`);
          return reply({
            message: 'Unable to renew token',
            errorCode: 'InvalidRefreshToken'
          });
        }

        const refreshedTokens = getTokens(session);
        reply({
          id: refreshedTokens.idToken,
          refresh: payload.refreshToken
        });
      });
    }
  }
}
