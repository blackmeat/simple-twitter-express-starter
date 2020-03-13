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
          Reply,
        ]
      })
      .then((tweets) => {
        // 讓每篇推播內容限制50字
        tweets = tweets.map((tweet) => ({
          ...tweet.dataValues,
          description: tweet.dataValues.description.split("").length >= 50 ? tweet.dataValues.description.substring(0, 50) + "....." : tweet.dataValues.description,
        }))
        console.log(tweets)
        // 每篇文最新回覆資料（未完成）
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
    const forLike = []           //儲存每個人的like總數
    User
      .findAll({
        order: [['id', 'ASC']]  //第一次用來取得總Like數
      })
      .then((Users) => {

        Users = Users.map((d) => {   //計算每個User的總Like數
          Tweet.findAll({ where: { UserId: d.id }, include: Like }).then((result) => {

            let totalLike = 0
            for (let i = 0; i < result.length; i++) {
              totalLike += result[i].Likes.length
            }
            forLike.push({ 'totalLike': totalLike })  //推入forLike儲存
            console.log(forLike)
          })
        })
      })


    // --------第二部分---------
    User
      .findAll({
        order: [['id', 'ASC']],   //第二次取得Id,Name,Tweets,Followers,Following資料
        include: [
          Like,
          { model: Tweet, include: [Like] },
          { model: User, as: "followingId" },
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
        res.render("admin/users", { Users, forLike }) //因這兩次取資料時，皆有經過相同的排序方法。所以在render時順序一致!

      })
  }
}

module.exports = adminContoller