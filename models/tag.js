'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    HashtagId: DataTypes.INTEGER,
    TweetId: DataTypes.INTEGER
  }, {});
  Tag.associate = function (models) {
    // associations can be defined here
    Tag.belongsTo(models.Hashtag)
    Tag.belongsTo(models.Tweet)
  };
  return Tag;
};