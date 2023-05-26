const log = require('../utils/logger');
const sequelize = require('../sequelize-orm');
const config = require('../configs/config');
const errors = require('../configs/errors');
const userService = require('../services/user.service');
const bcryptUtil = require('../utils/bcrypt-util');

module.exports = {
  createNewUser: async (req, res) => {
    let {nick_name, password, confirm_password, chief_id} = req.body;
    log.info(`Start createNewUser. Data: ${JSON.stringify({nick_name})}`);
    let transaction;
    try {
      if (!chief_id && req.role === config.ADMIN_ROLE) {
        chief_id = req.user_id;
      }
      if (!nick_name || !password || !confirm_password || !chief_id) {
        return res.status(errors.SOME_FIELD_IS_EMPTY.code).json({
          message: errors.SOME_FIELD_IS_EMPTY.message,
          errCode: errors.SOME_FIELD_IS_EMPTY.code,
        });
      }
      if (!config.REGEX_PASSWORD.test(password)) {
        return res.status(errors.PASSWORD_CHARACTERS_LONG.code).json({
          message: errors.PASSWORD_CHARACTERS_LONG.message,
          errCode: errors.PASSWORD_CHARACTERS_LONG.code,
        });
      }
      if (password !== confirm_password) {
        return res.status(errors.BAD_REQUEST_USER_CONFIRM_PASSWORD_NOT_MATCH.code).json({
          message: errors.BAD_REQUEST_USER_CONFIRM_PASSWORD_NOT_MATCH.message,
          errCode: errors.BAD_REQUEST_USER_CONFIRM_PASSWORD_NOT_MATCH.code,
        });
      }
      const isUserChiefCreated = await userService.getUserByFilter({id: chief_id}, config.USER_ATTRIBUTES, null);
      if (!isUserChiefCreated) {
        return res.status(errors.USER_NOT_EXIST.code).json({
          message: errors.USER_NOT_EXIST.message,
          errCode: errors.USER_NOT_EXIST.code,
        });
      }
      const isUserCreated = await userService.getUserByFilter({nick_name}, config.USER_ATTRIBUTES, null);
      if (isUserCreated) {
        return res.status(errors.NICKNAME_ALREADY_EXIST.code).json({
          message: errors.NICKNAME_ALREADY_EXIST.message,
          errCode: errors.NICKNAME_ALREADY_EXIST.code,
        });
      }
      transaction = await sequelize.transaction();
      const user_to_db = {nick_name, password: await bcryptUtil.hashPassword(password), chief_id: chief_id ? chief_id: req.user_id, role: config.WORKER_ROLE};
      const createdUser = await userService.createUser(user_to_db, transaction);
      if (isUserChiefCreated.role !== config.ADMIN_ROLE) {
        await userService.createUserSubordinates([{user_id: createdUser.id, chief_id: req.user_id}], transaction);
      }
      await userService.updateUserByFilter({id: chief_id, role: config.WORKER_ROLE}, {role: config.CHIEF_ROLE}, transaction);
      const result = await userService.getUserByFilter(createdUser.id, config.USER_ATTRIBUTES, transaction);
      await transaction.commit();
      log.info(`End createNewUser Result: ${JSON.stringify(result)}`);
      return res.status(200).json(result);
    } catch (err) {
      log.error(err);
      if (transaction) await transaction.rollback();
      return res.status(400).json({
        message: err.message,
        errCode: 400,
      });
    }
  },
  updateUserChief: async (req, res) => {
    const {id, chief_id} = req.body;
    log.info(`Start updateUser. Data: ${JSON.stringify({id, chief_id})}`);
    let transaction; let result;
    try {
      if (!chief_id || !id) {
        return res.status(errors.SOME_FIELD_IS_EMPTY.code).json({
          message: errors.SOME_FIELD_IS_EMPTY.message,
          errCode: errors.SOME_FIELD_IS_EMPTY.code,
        });
      }
      const isUserCreated = await userService.getUserByFilter(id, config.USER_ATTRIBUTES, null);
      if (!isUserCreated) {
        return res.status(errors.OBJECT_NOT_EXIST.code).json({
          message: errors.OBJECT_NOT_EXIST.message,
          errCode: errors.OBJECT_NOT_EXIST.code,
        });
      }
      if (isUserCreated.chief_id !== req.user_id) {
        return res.status(errors.NO_ACCESS_TO_OBJECT.code).json({
          message: errors.NO_ACCESS_TO_OBJECT.message,
          errCode: errors.NO_ACCESS_TO_OBJECT.code,
        });
      }
      if (chief_id === isUserCreated.chief_id) {
        return res.status(errors.CHANGE_CHIEF_ERROR.code).json({
          message: errors.CHANGE_CHIEF_ERROR.message,
          errCode: errors.CHANGE_CHIEF_ERROR.code,
        });
      }
      const isUserChiefCreated = await userService.getUserByFilter({id: chief_id}, config.USER_ATTRIBUTES, null);
      if (!isUserChiefCreated) {
        return res.status(errors.USER_NOT_EXIST.code).json({
          message: errors.USER_NOT_EXIST.message,
          errCode: errors.USER_NOT_EXIST.code,
        });
      }
      transaction = await sequelize.transaction();
      await userService.updateUserByFilter(id, {chief_id}, transaction);
      await userService.deleteUserSubordinates({user_id: id}, transaction);
      // const all_user_chiefs = await userService.getAllUserChiefs(isUserChiefCreated.chief_id, true);
      let all_user_chiefs = [];
      if (isUserChiefCreated.chief_id) {
        all_user_chiefs = await userService.getUserToSubordinates({user_id: chief_id}, transaction);
        all_user_chiefs = all_user_chiefs.map((i) => i.chief_id);
      }
      all_user_chiefs.unshift(chief_id);
      await userService.createUserSubordinates(all_user_chiefs.map((i) => ({user_id: id, chief_id: i})), transaction);
      if (isUserCreated.role === config.WORKER_ROLE) {
        await userService.updateUserByFilter({id: chief_id}, {role: config.CHIEF_ROLE}, transaction);
      }
      const previousChiefWorkers = await userService.getUserByFilter({chief_id: isUserCreated.chief_id}, config.USER_ATTRIBUTES, transaction);
      if (!previousChiefWorkers) {
        await userService.updateUserByFilter({id: isUserCreated.chief_id}, {role: config.WORKER_ROLE}, transaction);
      }
      result = await userService.getUserByFilter(id, config.USER_ATTRIBUTES, transaction);
      await transaction.commit();
      log.info(`End updateUser Result: ${JSON.stringify(result)}`);
      return res.status(200).json(result);
    } catch (err) {
      log.error(err);
      if (transaction) await transaction.rollback();
      return res.status(400).json({
        message: err.message,
        errCode: 400,
      });
    }
  },
  getUserById: async (req, res) => {
    const {id} = req.params;
    log.info(`Start getUserById. Data: ${JSON.stringify({id})}`);
    try {
      const checkUserChief = await userService.getUserToSubordinates({chief_id: req.user_id, user_id: id}, null);
      if (!checkUserChief) {
        return res.status(errors.NO_ACCESS_TO_OBJECT.code).json({
          message: errors.NO_ACCESS_TO_OBJECT.message,
          errCode: errors.NO_ACCESS_TO_OBJECT.code,
        });
      }
      const result = await userService.getUserByFilter(id, config.USER_ATTRIBUTES, null);
      log.info(`End getUserById Result: ${JSON.stringify(result)}`);
      return res.status(200).json(result);
    } catch (err) {
      log.error(err);
      return res.status(400).json({
        message: err.message,
        errCode: 400,
      });
    }
  },
  getAllUsers: async (req, res) => {
    log.info(`Start getAllUsers`);
    try {
      const filter = {};
      if (req.role === config.CHIEF_ROLE) {
        const userSubordinates = await userService.getUserToSubordinates({chief_id: req.user_id}, null);
        filter.id = userSubordinates.map((i) => i.user_id);
        filter.id.push(req.user_id);
      }
      if (req.role === config.CHIEF_ROLE) {
        const userSubordinates = await userService.getUserToSubordinates({chief_id: req.user_id}, null);
        filter.id = userSubordinates.map((i) => i.user_id);
        filter.id.push(req.user_id);
      } else if (req.role === config.WORKER_ROLE) {
        filter.id = req.user_id;
      }
      const result = await userService.getAllUsersByFilter(filter, config.USER_ATTRIBUTES, null);
      log.info(`End getUserById Result: ${JSON.stringify(result)}`);
      return res.status(200).json(result);
    } catch (err) {
      log.error(err);
      return res.status(400).json({
        message: err.message,
        errCode: 400,
      });
    }
  },
};
