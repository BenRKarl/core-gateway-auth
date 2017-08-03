'use strict';
const assert = require('assert');

module.exports = validateToken;

function validateToken(cognito, token) {
  // Verify the issuer
  assert(token.iss === cognito.poolUrl, 'Invalid issuer');
  // Verify use
  assert(token.token_use === 'access' || token.token_use === 'id', 'Invalid token use');
  // Verify token not expired
  assert((token.exp * 1000) > Date.now(), 'Expired token');
}
