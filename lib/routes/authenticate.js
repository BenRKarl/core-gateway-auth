'use strict';
const getTokens = require('../get-tokens');

const {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUser
} = require('amazon-cognito-identity-js');

module.exports = createAuthenticateRoute;

/**
 * Create authenticate route.
 *
 * @param {Object} cognito - An object containing Cognito configuration
 *   (region, user_pool_id, client_id)
 * @returns {Object} Hapi route config object
 */
function createAuthenticateRoute(cognito) {
  const poolData = {
    UserPoolId: cognito.user_pool_id,
    ClientId: cognito.client_id
  };
  const userPool = new CognitoUserPool(poolData);

  return {
    method: 'POST',
    path: '/authenticate',
    handler
  };

  function handler(request, reply) {
    const { username, password } = request.payload;

    if (username && password) {
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });
      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: password
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function onSuccess(session) {
          const tokens = getTokens(session);
          reply({
            tokens: {
              id: tokens.idToken,
              refresh: tokens.refreshToken
            }
          });
        },
        onFailure: function onFailure(err) {
          request.log(['auth', 'fail'], `Authentication failure for ${username}: ${err.message}`);
          reply({
            message: 'Invalid credentials',
            errorCode: 'InvalidCredentials'
          });
        },
        newPasswordRequired: function newPasswordRequired(/* userAttributes, requiredAttributes */) {
          request.log(['auth', 'passwordChangeRequired'], `Password change required for ${username}`);
          reply({
            message: 'Password change required',
            errorCode: 'PasswordChangeRequired'
          });
          // the api doesn't accept this field back
          // delete userAttributes.email_verified;
          // placeholder, will need to communicate need for a password change back to UI
          // cognitoUser.completeNewPasswordChallenge('tesTing123$', userAttributes, this);
        }
      });
    } else {
      reply({
        message: 'Credentials not supplied',
        errorCode: 'MissingCredentials'
      }).code(400);
    }
  }
}
