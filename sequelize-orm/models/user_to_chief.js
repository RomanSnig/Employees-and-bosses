const {DataTypes} = require('sequelize');
module.exports = function(sequelize) {
  sequelize.define('user_to_chief', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chief_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    tableName: 'user_to_chief',
    timestamps: false,
  });
};
