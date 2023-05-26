const sequelize = require('../sequelize-orm');
const {models} = require('../sequelize-orm');
const config = require('../configs/config');
const log = require('../utils/logger');

async function getAllUserChiefs(id, arr, onlyIds) {
  arr = arr ? arr: [];
  const chief = await models.users.findOne({where: {id: id, role: config.CHIEF_ROLE}});
  arr.push(chief.toJSON());
  if (chief.chief_id) {
    return await getAllUserChiefs(id, arr, onlyIds);
  } else return arr;
}

module.exports = {

  /**
     * Create user
     * @param user
     * @param trans
     * @return user
     */
  createUser: async (user, trans) => {
    let transaction = null;
    log.info(`Start service createUser. Params: ${JSON.stringify(user)}`);
    try {
      transaction = trans ? trans : await sequelize.transaction();
      const result = await models.users.create(user, {transaction});
      if (!trans) await transaction.commit();
      log.info(`End service createUser. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.error(err);
      if (transaction && !trans) await transaction.rollback();
      err.code = 400;
      throw err;
    }
  },

  /**
     * Get user by filter
     * @param filter
     * @param trans
     * @param attributes
     * @return result
     */
  getUserByFilter: async (filter, attributes, trans) => {
    log.info(`Start service getUserByFilter. Params: ${JSON.stringify(filter)}`);
    const transaction = trans ? trans : null;
    try {
      let result = await models.users.findOne({
        where: filter,
        attributes,
        transaction,
        // include: [
        //   {
        //     model: models.users,
        //     through: {attributes: []},
        //     as: 'subordinates',
        //   },
        // ],
      });
      if (result) result = result.toJSON();
      log.info(`End service getUserByFilter. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      if (transaction && !trans) await transaction.rollback();
      log.error(err);
      err.code = 400;
      throw err;
    }
  },

  /**
     * Get all users by filter
     * @param filter
     * @param attributes
     * @param trans
     * @return result
     */
  getAllUsersByFilter: async (filter, attributes, trans) => {
    log.info(`Start service getAllUsersByFilter. Params: ${JSON.stringify(filter)}`);
    const transaction = trans ? trans : null;
    try {
      let result = await models.users.findAll({
        where: filter,
        attributes,
        transaction,
      });
      if (result && result.length) {
        result = result.map((item) => item.toJSON());
      }
      log.info(`End service getAllUsersByFilter. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      if (transaction && !trans) await transaction.rollback();
      log.error(err);
      err.code = 400;
      throw err;
    }
  },

  /**
     * Update user by params
     * @param params
     * @param user
     * @param trans
     * @return user
     */
  updateUserByFilter: async (params, user, trans) => {
    log.info(`Start service updateUserByFilter. Params: ${JSON.stringify({params: params, user: user})}`);
    let filter = params;
    if (typeof filter !== 'object') {
      filter = {id: params};
    }
    let transaction = null;
    try {
      transaction = trans ? trans : await sequelize.transaction();
      await models.users.update(user, {where: filter, transaction});
      let result = await models.users.findOne({
        where: filter,
        transaction,
      });
      if (result) result = result.toJSON();
      if (!trans) await transaction.commit();
      log.info(`End service updateUserByFilter. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.error(`${err}`);
      if (transaction && !trans) await transaction.rollback();
      err.code = 400;
      throw err;
    }
  },
  /**
   * Create user subordinates
   * @param data
   * @param trans
   * @return result
   */
  createUserSubordinates: async (data, trans) => {
    let transaction = null;
    log.info(`Start service createUserSubordinates. Params: ${JSON.stringify(data)}`);
    try {
      transaction = trans ? trans : await sequelize.transaction();
      const result = await models.user_to_chief.bulkCreate(data, {transaction});
      if (!trans) await transaction.commit();
      log.info(`End service createUserSubordinates. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.error(err);
      if (transaction && !trans) await transaction.rollback();
      err.code = 400;
      throw err;
    }
  },
  /**
   * Delete user subordinates
   * @param filter
   * @param trans
   * @return result
   */
  deleteUserSubordinates: async (filter, trans) => {
    let transaction = null;
    log.info(`Start service deleteUserSubordinates. Params: ${JSON.stringify(filter)}`);
    try {
      transaction = trans ? trans : await sequelize.transaction();
      const result = await models.user_to_chief.destroy({where: filter, transaction});
      if (!trans) await transaction.commit();
      log.info(`End service deleteUserSubordinates. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.error(err);
      if (transaction && !trans) await transaction.rollback();
      err.code = 400;
      throw err;
    }
  },
  /**
   * Get user subordinates
   * @param filter
   * @param trans
   * @return result
   */
  getUserToSubordinates: async (filter, trans) => {
    let transaction = null;
    log.info(`Start service getUserToSubordinates. Params: ${JSON.stringify(filter)}`);
    try {
      transaction = trans ? trans : await sequelize.transaction();
      const result = await models.user_to_chief.findAll({where: filter, transaction});
      if (!trans) await transaction.commit();
      log.info(`End service getUserToSubordinates. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.error(err);
      if (transaction && !trans) await transaction.rollback();
      err.code = 400;
      throw err;
    }
  },

  /**
   * Get user subordinate
   * @param filter
   * @param trans
   * @return result
   */
  getUserToSubordinate: async (filter, trans) => {
    let transaction = null;
    log.info(`Start service getUserToSubordinate. Params: ${JSON.stringify(filter)}`);
    try {
      transaction = trans ? trans : await sequelize.transaction();
      const result = await models.user_to_chief.findOne({where: filter, transaction});
      if (!trans) await transaction.commit();
      log.info(`End service getUserToSubordinate. Result: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      log.error(err);
      if (transaction && !trans) await transaction.rollback();
      err.code = 400;
      throw err;
    }
  },
  getAllUserChiefs,
};
