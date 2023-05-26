const {Sequelize} = require('sequelize');
const {associations} = require('./associations');
const config = require('../configs/config');
const log = require('../utils/logger');

const mysqlUrl = config.MYSQL_URL;
const mysqlUser = config.MYSQL_USER;
const mysqlPassword = config.MYSQL_PASSWORD;
const mysqlDb = config.MYSQL_DB;

log.info(`Creating connection to mysql: ${mysqlUrl}`);

const sequelize = new Sequelize(mysqlDb, mysqlUser, mysqlPassword, {
  host: mysqlUrl,
  dialect: 'mysql',
  // logging: false,
  // dialectOptions: { options: { encrypt: true } }
});

const modelDefiners = [
  require('./models/users'),
  require('./models/user_to_chief'),
];

// Define all models according to their files.
for (const modelDefiner of modelDefiners) {
  modelDefiner(sequelize);
}

// Execute extra setup after the models are defined, such as adding associations.
associations(sequelize);


// Export the sequelize connection instance to be used around our app.
module.exports = sequelize;
