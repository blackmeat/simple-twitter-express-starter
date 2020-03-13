const db = require("../models")
const Like = db.Like
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply

const adminContoller = {
  getTweets: (req, res) => {
    Tweet
      .findAll({
        order: [["createdAt", "DESC"]],
        include: [
          User,
          {model: Reply  /*order: [["createdAt", "ASC"]]*/ }
        ]
      })
      .then((tweets) => {
        // 讓每篇推播內容限制50字
        tweets = tweets.map((tweet) => ({
          ...tweet.dataValues,
          description: tweet.dataValues.description.split("").length >= 50 ? tweet.dataValues.description.substring(0, 50) + "....." : tweet.dataValues.description,
          // 把推文內的Replies按id排序，接著取第一筆(本來想在前面註解處引入Reply就排序，可是好像不行)
          Replies: tweet.Replies.sort((a,b) => b.id - a.id)[0] 
        }))
        console.log(tweets[0])
        res.render("admin/tweets", { tweets })
      })
  },

  deleteTweet: (req, res) => {
    Tweet
      .findByPk(req.params.id)
      .then((tweet) => {
        // 刪除該篇推播、回覆、點讚相關資料
        tweet.destroy()
        Like.destroy({ where: { TweetId: tweet.id } })
        Reply.destroy({ where: { TweetId: tweet.id } })
        res.redirect("back")
      })
  },

  getUsers: (req, res) => {
    User
      .findAll({
        include: [
          Like,
          { model: Tweet, include: [Like] },
          // 正在追蹤的
          { model: User, as: "followingId" },
          // 所有追蹤者
          { model: User, as: "followerId" }
        ]
      })
      .then((Users) => {
        Users = Users.map((User) => ({
          ...User.dataValues,
          TweetCount: User.dataValues.Tweets.length,
          FollowerCount: User.dataValues.followerId.length,
          FollowingCount: User.dataValues.followingId.length
        }))
        // 推播被like的數量(未完成)
        console.log(Users)
        res.render("admin/users", { Users })
      })
  }
}

module.exports = adminContoller