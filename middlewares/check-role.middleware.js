const errors = require('../configs/errors');
module.exports = {

  checkRole: (role) => {
    return async (req, res, next) => {
      if (Array.isArray(role)){
        if (req.role && role.includes(req.role)) {
          return next();
        }
      } else {
        if (req.role && role == req.role) {
          return next();
        }
      }
      return res.status(401).json({
        message: errors.WRONG_USER_ROLE.message,
        errCode: errors.WRONG_USER_ROLE.code,
      });
    };
  },
};
