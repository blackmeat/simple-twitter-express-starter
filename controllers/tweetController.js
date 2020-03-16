const db = require('../models')
const moment = require('moment')
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const Followship = db.Followship
const User = db.User
const HashTag = db.Hashtag
const Tag = db.Tag


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
    // 解析textarea內容出現在＃符號提出來
    let hashTag = req.body.text.split("#").slice(1)
    console.log(hashTag)
    if (req.body.text.includes("#")) {
      req.body.text = req.body.text.split("#")[0]
    }

    Tweet.create({
      description: req.body.text,
      UserId: req.user.id
    })
      .then((Tweet) => {
        for (let i = 0; i < hashTag.length; i++) {
          HashTag
            .findAll()
            .then((hashtags) => {
              let hashtagsName = hashtags.map(hashtag => hashtag.name)
              if (hashtagsName.every(name => name !== hashTag[i])) {
                HashTag.create({
                  name: hashTag[i]
                })
                  .then((HashTag) => {
                    Tag.create({
                      HashtagId: HashTag.id,
                      TweetId: Tweet.id
                    })
                  })
              } else {
                let hashtag = hashtags.find(hashtag => hashtag.name === hashTag[i])
                Tag.create({
                  HashtagId: hashtag.id,
                  TweetId: Tweet.id
                })
              }
            })
        }
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