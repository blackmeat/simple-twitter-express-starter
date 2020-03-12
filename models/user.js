'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    role: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Tweet)
    User.hasMany(models.Reply)
    User.hasMany(models.Like)
    User.belongsToMany(models.User, {
      through: models.Followship,
      foreignKey: "followerId",
      as: "followingId"
    })
    User.belongsToMany(models.User, {
      through: models.Followship,
      foreignKey: "followingId",
      as: "followerId"
    })
  };
  return User;
};