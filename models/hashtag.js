'use strict';
module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define('Hashtag', {
    name: DataTypes.STRING
  }, {});
  Hashtag.associate = function (models) {
    // associations can be defined here
    Hashtag.hasMany(models.Tag)
  };
  return Hashtag;
};