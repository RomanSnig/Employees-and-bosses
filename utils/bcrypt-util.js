const bcrypt = require('bcryptjs');

module.exports.hashPassword = async (password) => await bcrypt.hash(password, 10);
module.exports.checkHashPassword = async (password, hash) => await bcrypt.compare(password, hash);
