const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Followship = db.Followship
const Reply = db.Reply

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },

  signUp: (req, res) => {
    if (req.body.password !== req.body.passwordCheck) {
      req.flash("error_messages", "兩次密碼輸入不相同")
      return res.redirect("/signup")
    } else {
      User
        .findOne({ where: { email: req.body.email } })
        .then((user) => {
          if (user) {
            req.flash("error_messages", "信箱已經被註冊過")
            return res.redirect("/signup")
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
            }).then(user => {
              req.flash("success_messages", "成功註冊！！")
              return res.redirect('/signin')
            })
          }
        })
    }
  },
  signInPage: (req, res) => {
    res.render("signin")
  },
  signIn: (req, res) => {
    req.flash("success_messages", "成功登入")
    res.redirect("/tweets")
  },
  logout: (req, res) => {
    req.flash("success_messages", "已經成功登出")
    req.logout()
    res.redirect("/signin")
  },
  followingsPage: (req, res) => {
    User.findOne({
      where: {id: req.params.id},
      include: [
        {model: User, as: 'followerId'},
        {model: User, as: 'followingId'},
        Tweet,
        Like
      ]
    })
    .then(user => {
      const data = {
        tweetsAmount: user.Tweets.length,
        followersAmount: user.followerId.length,
        followingsAmonut: user.followingId.length,
        likesAmount: user.Likes.length,
        followingsAndFollowers: user.followerId,
        paramsId: Number(req.params.id)
      }
      return res.render('following', data)
    })
  },
  followersPage: (req, res) => {
    User.findOne({
      where: {id: req.params.id},
      include: [
        {model: User, as: 'followerId'},
        {model: User, as: 'followingId'},
        Tweet,
        Like
      ]
    })
    .then(user => {
      const followers = user.followingId.map(follower => {
        return {
          ...follower.dataValues,
          isFollowed: req.user.followerId.map(d => d.id).includes(follower.id)
        }
      })
      const data = {
        tweetsAmount: user.Tweets.length,
        followersAmount: user.followerId.length,
        followingsAmonut: user.followingId.length,
        likesAmount: user.Likes.length,
        followingsAndFollowers: followers,
        paramsId: Number(req.params.id)
      }
      return res.render('following', data)
    })
  },
  getReplies: (req, res) => {
    // 先撈出該筆tweet
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        User,
        Like,
        {model: Reply, include: [User]}
      ]
    }).then(tweet => {
      // 再撈出該筆tweet發文者資料，主要是給頁面左半算數量使用
      User.findByPk(tweet.User.id, {
        include: [
          {model: User, as: 'followerId'},
          {model: User, as: 'followingId'},
          Tweet,
          Like
        ]
      })
      .then(user => {
        // 檢查該筆tweet的發文者有沒有被現在登入的使用者follow過(供頁面左半Follow或Unfollow用)
        const isFollowed = req.user.followerId.map(d=>d.id).includes(user.id)
        const data = {
          replies: tweet.Replies,
          repliesAmount: tweet.Replies.length,
          tweet: tweet,
          tweetLikedAmount: tweet.Likes.length,

          tweetsAmount: user.Tweets.length,
          followersAmount: user.followerId.length,
          followingsAmonut: user.followingId.length,
          likesAmount: user.Likes.length,
          isFollowed: isFollowed
        }
        return res.render('replies', data)
      })
    })
  },
  createReply: (req, res) => {
    if (!req.body.reply) {
      req.flash('error_messages', '請輸入留言')
    }
    Reply.create({
      UserId: req.user.id,
      TweetId: req.params.tweet_id,
      comment: req.body.reply
    })
    .then(reply => {
      res.redirect('back')
    })
  }
}

module.exports = userController