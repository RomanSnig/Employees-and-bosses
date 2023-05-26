const config = require('../configs/config');
const log = require('../utils/logger');
const {models} = require('../sequelize-orm');
const jwt = require('jsonwebtoken');
module.exports = {
  checkToken: (role) => {
    return async (req, res, next) => {
      log.info(`Start check token function`);
      let token = req.get('Authorization');
      if (!token){
        if (req.cookies && req.cookies['jwt']){
          token = req.cookies['jwt'];
        }
      }
      if (!token) {
        return res.status(401).json({
          message: 'No token in request',
          errCode: 401,
        });
      }
      let user;
      if (role) {
        user = await models.users.findOne({where: {access_token: token, role: role}, raw: true});
      } else {
        user = await models.users.findOne({where: {access_token: token}, raw: true});
      }
      if (!user) {
        log.error(`Error! User with such token is not defined! Token ${token}`);
        return res.status(401).json({
          message: `Error! User with such token is not defined! Token ${token}`,
          errCode: 401,
        });
      }
      req.role = user ? user.role : null;
      req.user_id = user ? user.id : null;
      req.nick_name = user ? user.nick_name : null;
      req.access_token = token ? token : null;
      try {
        jwt.verify(token, config.JWT_SECRET_ACCESS_TOKEN, {}, (err) => {
          if (err) {
            throw new Error(`Token not verified. Token ${token}`);
          }
        });
        return next();
      } catch (err) {
        log.error(`Token not verified. Token ${token}`);
        return res.status(401).json({
          message: `Token not verified. Token ${token}`,
          errCode: 401,
        });
      }
    };
  },
};
