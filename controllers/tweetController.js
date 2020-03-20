const db = require('../models')
const moment = require('moment')
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const Followship = db.Followship
const User = db.User


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
        isLiked: r.Likes.map(d => d.UserId).includes(req.user.id)
      }))

      User.findAll({
        include: [
          { model: User, as: 'followerId' }
        ]
      }).then(users => {
        // console.log(users[0].id)
        // console.log(users[0].followerId)
        // 整理 users 資料
        users = users.map(user => ({
          ...user.dataValues,
          // 計算追蹤者人數
          FollowerCount: user.followerId.length,
          // 判斷目前登入使用者是否已追蹤該 User 物件
          isFollowed: user.followerId.map(d => d.id).includes(req.user.id)
        }))
        // 依追蹤者人數排序清單
        users = users.sort((a, b) => b.FollowerCount - a.FollowerCount).slice(0, 10)
        return res.render('tweets', {
          tweets: data,
          users: JSON.parse(JSON.stringify(users)),
          nowUser: req.user.id      //用於判定自己不能follow自己
        })
      })
    })
  },
  postTweet: (req, res) => {
    if (req.body.text.length > 140) {
      req.flash("error_messages", "字數不能超過140字")
      return res.redirect("/tweets")
    }
    if (req.body.text === "") {
      req.flash("error_messages", "內容不可以為空")
      return res.redirect("/tweets")
    }

    return Tweet.create({
      description: req.body.text,
      UserId: req.user.id
    })
      .then((Tweet) => {
        res.redirect("/tweets")
      })
  },
  likeTweet: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    })
      .then((like) => {
        return res.redirect('back')
      })
  },
  unlikeTweet: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        TweetId: req.params.id
      }
    })
      .then((like) => {
        like.destroy()
          .then((like) => {

            return res.redirect('back')
          })
      })
  }
}
module.exports = tweetController