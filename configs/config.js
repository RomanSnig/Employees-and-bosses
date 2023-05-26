require('dotenv').config();

module.exports = {

  ADMIN_ROLE: 1,
  CHIEF_ROLE: 2,
  WORKER_ROLE: 3,

  MYSQL_URL: process.env.MYSQL_URL || 'localhost',
  MYSQL_USER: process.env.MYSQL_USER || 'root',
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || 'root',
  MYSQL_DB: process.env.MYSQL_DB || 'incode-test',
  APP_PORT: process.env.APP_PORT || '3000',

  JWT_SECRET_ACCESS_TOKEN: process.env.JWT_SECRET_ACCESS_TOKEN || 'ACCESSTOKEN',
  ACCESS_TOKEN_LIFETIME: process.env.ACCESS_TOKEN_LIFETIME || '5m',
  JWT_SECRET_REFRESH_TOKEN: process.env.JWT_SECRET_REFRESH_TOKEN || 'REFRESHTOKEN',
  REFRESH_TOKEN_LIFETIME: process.env.REFRESH_TOKEN_LIFETIME || '1d',

  REGEX_PASSWORD: /^(?=^[^\s]{8,16}$)(?=.*[a-z].*).*$/,
  USER_ATTRIBUTES: ['id', 'nick_name', 'role', 'chief_id'],

};
