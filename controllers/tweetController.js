const db = require('../models')
const moment = require('moment')
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const Followship = db.Followship
const User = db.User
const helpers = require("../_helpers")


let tweetController = {
  getTweets: (req, res) => {

    Tweet.findAll({ order: [['createdAt', 'DESC']], include: [User, { model: Reply, include: [User] }, { model: Like, include: [User] }] }).then(result => {   //最新的tweet顯示在前面
      // console.log(result[9].Likes)

      const data = result.map(r => ({
        ...r.dataValues,
        createdAt: moment(r.createdAt).format('YYYY-MM-DD,HH:mm:ss'), //以moment套件，轉化成特定格式
        description: r.dataValues.description.substring(0, 50),
        reply: r.dataValues.Replies.length, //計算reply數量
        like: r.dataValues.Likes.length, //計算like數量
        isLiked: r.Likes.map(d => d.UserId).includes(helpers.getUser(req).id)
      }))

      User.findAll({
        include: [
          { model: User, as: 'Followers' }
        ]
      }).then(users => {
        // console.log(users[0].id)
        // console.log(users[0].followerId)
        // 整理 users 資料
        users = users.map(user => ({
          ...user.dataValues,
          // 計算追蹤者人數
          FollowerCount: user.Followers.length,
          // 判斷目前登入使用者是否已追蹤該 User 物件
          isFollowed: user.Followers.map(d => d.id).includes(helpers.getUser(req).id)
        }))
        // 依追蹤者人數排序清單
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount).slice(0, 10)
        return res.render('tweets', {
          tweets: data,
          users: JSON.parse(JSON.stringify(users)),
          nowUser: helpers.getUser(req).id      //用於判定自己不能follow自己
        })
      })
    })
  },
  postTweet: (req, res) => {
    if (req.body.description.length > 140) {
      req.flash("error_messages", "字數不能超過140字")
      return res.redirect("back")
    }
    if (req.body.description === "") {
      req.flash("error_messages", "內容不可以為空")
      return res.redirect("back")
    }

    return Tweet.create({
      description: req.body.description,
      UserId: helpers.getUser(req).id
    })
      .then((Tweet) => {
        return res.redirect("back")
      })
  },
  likeTweet: (req, res) => {
    return Like.create({
      UserId: helpers.getUser(req).id,
      TweetId: req.params.id
    })
      .then((like) => {
        return res.redirect('back')
      })
  },
  unlikeTweet: (req, res) => {
    Like.findOne({
      where: {
        UserId: helpers.getUser(req).id,
        TweetId: req.params.id
      }
    })
      .then((like) => {
        like.destroy()
        return res.redirect('back')
      })
  }
}
module.exports = tweetController