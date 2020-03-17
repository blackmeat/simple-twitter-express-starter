const db = require("../models")
const Tweet = db.Tweet
const User = db.User
const Hashtag = db.Hashtag
const Tag = db.Tag

const hashtagController = {
  getHashtagTweets: (req, res) => {
    Tag
      .findAll({
        where: { HashtagId: req.params.id },
        order: [["createdAt", "DESC"]],
        include: [
          Hashtag,
          { model: Tweet, include: [User] }
        ]
      })
      .then((Tags) => {
        console.log(Tags)
        const HashtagName = Tags[0].Hashtag.name
        res.render("hashtagTweets", { Tags, HashtagName })
      })

  }
}

module.exports = hashtagController