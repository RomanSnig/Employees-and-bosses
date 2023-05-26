const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const sequelize = require('./sequelize-orm');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/auth', require('./routes/auth.router'));
app.use('/users', require('./routes/user.router'));

app.get('/', (req, res) =>{
  return res.status(200).json('HELLO WORLD');
});
app.use('*', (req, res) => {
  return res.status(404).json('Page not found');
});

async function assertDatabaseConnectionOk() {
  console.log(`Checking database connection...`);
  try {
    await sequelize.authenticate();
    console.log('Database connection OK!');
  } catch (error) {
    console.log(error);
    console.log('Unable to connect to the database:');
    process.exit(1);
  }
}

async function init() {
  await assertDatabaseConnectionOk();
}

init();

module.exports = app;
