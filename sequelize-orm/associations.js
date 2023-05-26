function associations(sequelize) {
  const {
    users,
  } = sequelize.models;

  users.belongsToMany(users, {
    through: 'user_to_chief',
    as: 'subordinates',
    foreignKey: 'chief_id',
    otherKey: 'user_id',
  });
}

module.exports = {associations};
