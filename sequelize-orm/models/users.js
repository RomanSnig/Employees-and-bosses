const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('users', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    nick_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(555),
      allowNull: false,
    },
    access_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    chief_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    role: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
    },
  }, {
    tableName: 'users',
    timestamps: false,
  });
};
