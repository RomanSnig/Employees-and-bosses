const log = require('../utils/logger');
const config = require('../configs/config');
const errors = require('../configs/errors');
const userService = require('../services/user.service');
const tokenUtil = require('../utils/token-util');
const bcryptUtil = require('../utils/bcrypt-util');
const jwt = require('jsonwebtoken');

module.exports = {
  login: async (req, res) => {
    log.info(`Start login Data: ${JSON.stringify(req.body)}`);
    try {
      const {nick_name, password} = req.body;
      if (!nick_name || !password) {
        return res.status(errors.SOME_FIELD_IS_EMPTY.code).json({
          message: errors.SOME_FIELD_IS_EMPTY.message,
          errCode: errors.SOME_FIELD_IS_EMPTY.code,
        });
      }
      const user = await userService.getUserByFilter({nick_name: nick_name}, null, null);
      if (!user) {
        return res.status(400).json({
          message: errors.ENTER_CORRECT_LOGIN_AND_PASSWORD.message,
          errCode: errors.ENTER_CORRECT_LOGIN_AND_PASSWORD.code,
        });
      }
      if (!await bcryptUtil.checkHashPassword(password, user.password)) {
        return res.status(400).json({
          message: errors.ENTER_CORRECT_LOGIN_AND_PASSWORD.message,
          errCode: errors.ENTER_CORRECT_LOGIN_AND_PASSWORD.code,
        });
      }

      const token = tokenUtil.authToken({nick_name: user.nick_name, user_id: user.id, role: user.role});

      await userService.updateUserByFilter({id: user.id}, {access_token: token.access_token, refresh_token: token.refresh_token}, null);
      log.info(`End post /login. Result: ${JSON.stringify({id: user.id, role: user.role, nick_name: user.nick_name})}`);
      res.setHeader('Authorization', token.access_token);
      return res.status(200).json({access_token: token.access_token, refresh_token: token.refresh_token, id: user.id, role: user.role, nick_name: user.nick_name});
    } catch (err) {
      log.error(err);
      return res.status(400).json({
        message: err.message,
        errCode: 400,
      });
    }
  },
  logout: async (req, res) => {
    log.info(`Start logout`);
    try {
      const token = req.get('Authorization');
      if (!token) {
        return res.status(400).json({
          message: errors.BAD_REQUEST_TO_REFRESH_TOKEN.message,
          errCode: errors.BAD_REQUEST_TO_REFRESH_TOKEN.code,
        });
      }
      const user = await userService.getUserByFilter({access_token: token}, config.USER_ATTRIBUTES, null);
      if (!user) {
        return res.status(errors.OBJECT_NOT_EXIST.code).json({
          message: errors.OBJECT_NOT_EXIST.message,
          errCode: errors.OBJECT_NOT_EXIST.code,
        });
      }
      await userService.updateUserByFilter(user.id, {refresh_token: null, access_token: null}, null);
      log.info(`End logout Result: ${JSON.stringify(true)}`);
      return res.status(200).json(true);
    } catch (err) {
      log.error(err);
      return res.status(400).json({
        message: err.message,
        errCode: 400,
      });
    }
  },
  refresh: async (req, res) => {
    log.info(`Start refresh`);
    const token = req.headers['authorization'];
    const {refresh_token} = req.body;
    console.log(token, refresh_token);
    try {
      if (!token || !refresh_token) {
        return res.status(400).json({
          message: errors.BAD_REQUEST_TO_REFRESH_TOKEN.message,
          errCode: errors.BAD_REQUEST_TO_REFRESH_TOKEN.code,
        });
      }
      const userInfo = await userService.getUserByFilter({access_token: token, refresh_token: refresh_token}, null, null);
      if (!userInfo) {
        return res.status(400).json({
          message: errors.BAD_REQUEST_TO_REFRESH_TOKEN.message,
          errCode: errors.BAD_REQUEST_TO_REFRESH_TOKEN.code,
        });
      }

      jwt.verify(userInfo.refresh_token, config.JWT_SECRET_REFRESH_TOKEN, {}, async (err) => {
        if (err) {
          log.info(`End /refresh. Result: ${JSON.stringify('Refresh token has expired')}`);
          return res.status(401).json({
            message: 'Refresh token has expired',
            errCode: 401,
          });
        }
        const newToken = tokenUtil.authToken({nick_name: userInfo.nick_name, user_id: userInfo.id, role: userInfo.role});
        await userService.updateUserByFilter({id: userInfo.id}, {access_token: newToken.access_token, refresh_token: newToken.refresh_token}, null);
        log.info(`End refresh Result: ${JSON.stringify(newToken.access_token)}`);
        res.setHeader('Authorization', newToken.access_token);
        return res.status(200).json({
          access_token: newToken.access_token,
          refresh_token: newToken.refresh_token,
        });
      });
    } catch (err) {
      log.error(err);
      return res.status(400).json({
        message: `Error to refresh token: ${err.message}`,
        errCode: 400,
      });
    }
  },
};
