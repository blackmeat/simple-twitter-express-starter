'use strict';
module.exports = (sequelize, DataTypes) => {
  const Channel = sequelize.define('Channel', {
    member1: DataTypes.STRING,
    member2: DataTypes.STRING
  }, {});
  Channel.associate = function (models) {
    // associations can be defined here
    // Channel.hasMany(models.Message)
  };
  return Channel;
};