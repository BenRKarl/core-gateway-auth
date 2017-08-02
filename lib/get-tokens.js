'use strict';
module.exports = getTokens;

function getTokens(session) {
  const idToken = session.getIdToken().getJwtToken();
  const accessToken = session.getAccessToken().getJwtToken();
  const refreshToken = session.getRefreshToken().getToken();

  return { idToken, accessToken, refreshToken };
}
