const jwt = require('jsonwebtoken');
const config = require('../configs/config');

module.exports = {
  authToken: (payload) => {
    return {
      access_token: jwt.sign(payload, config.JWT_SECRET_ACCESS_TOKEN, {expiresIn: config.ACCESS_TOKEN_LIFETIME}),
      refresh_token: jwt.sign(payload, config.JWT_SECRET_REFRESH_TOKEN, {expiresIn: config.REFRESH_TOKEN_LIFETIME}),
    };
  },
};
