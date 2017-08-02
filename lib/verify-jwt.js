'use strict';
const jwt = require('jsonwebtoken');

module.exports = verifyJwt;

function verifyJwt(publicKeys, token) {
  // break raw token into segments to capture header
  // [0] = header
  // [1] = payload
  // [2] = signature
  const tokenSegments = token.split('.');
  const header = JSON.parse(Buffer.from(tokenSegments[0], 'base64').toString());
  const publicKey = publicKeys.get(header.kid);

  return jwt.verify(token, publicKey, {
    algorithms: [header.alg]
  });
}

