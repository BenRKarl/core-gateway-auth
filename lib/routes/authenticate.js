'use strict';
const assert = require('assert');
const getTokens = require('../get-tokens');
const verifyJwt = require('../verify-jwt');
const {
  AuthenticationDetails,
  CognitoUserPool,
  CognitoUser
//  CognitoRefreshToken
} = require('amazon-cognito-identity-js');

module.exports = authenticateRoute;

/**
 * Create authenticate route.
 *
 * @param {Object} cognito - An object containing Cognito configuration
 *   (region, user_pool_id, client_id)
 * @param {Map} publicKeys - A Map of Cognito public keys, kayed by kid
 * @returns {Object} Hapi route config object
 */
function authenticateRoute(cognito, publicKeys) {
  const cognitoHost = `https://cognito-idp.${cognito.region}.amazonaws.com`;
  const poolUrl = `${cognitoHost}/${cognito.user_pool_id}`;
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
    const authData = { Username: username, Password: password };
    console.log(authData);
    const authenticationDetails = new AuthenticationDetails(authData);

    const userData = { Username: username, Pool: userPool };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function onSuccess(session) {
        const tokens = getTokens(session);
        const decodedToken = verifyJwt(publicKeys, tokens.idToken);

        // Verify the issuer
        assert(decodedToken.iss === poolUrl);
        // Verify use
        assert(decodedToken.token_use === 'access' || decodedToken.token_use === 'id');
        // Verify token not expired
        assert((decodedToken.exp * 1000) > Date.now());

        console.log({ decodedToken });

        reply({
          tokens: {
            id: tokens.idToken,
            refresh: tokens.refreshToken
          }
        });

        // refresh session
        // setTimeout(() => {
        //   cognitoUser.refreshSession(new CognitoRefreshToken({ RefreshToken: tokens.refreshToken }), (err, session) => {
        //     if (err) throw err;
        //     const refreshedTokens = getTokens(session);

        //     const refreshedToken = verifyJwt(publicKeys, refreshedTokens.idToken);
        //     console.log({ refreshedToken });
        //   });
        // }, 2000);
      },
      onFailure: function onFailure(err) {
        reply({ message: 'Invalid credentials', code: 'InvalidCredentials' }).code(401);
        console.error(err);
      },
      newPasswordRequired: function newPasswordRequired(/* userAttributes, requiredAttributes */) {
        reply({ message: 'Password change required', code: 'PasswordChangeRequired'}).code(409);
        // the api doesn't accept this field back
        // delete userAttributes.email_verified;
        // placeholder, will need to communicate need for a password change back to UI
        // cognitoUser.completeNewPasswordChallenge('tesTing123$', userAttributes, this);
      }
    });

    console.log(authData);
  }
}
