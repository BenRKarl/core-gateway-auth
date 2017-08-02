'use strict';
const request = require('request-promise-native');
const jwkToPem = require('jwk-to-pem');

module.exports = fetchPublicKeys;

function fetchPublicKeys(keyUrl) {
  return request({ url: keyUrl, json: true })
    .then(({ keys }) => {
      return keys.reduce((publicKeys, key) => {
        publicKeys.set(key.kid, jwkToPem(key));
        return publicKeys;
      }, new Map());
    });
}
