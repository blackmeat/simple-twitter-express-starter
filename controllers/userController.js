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
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        Like,
        User
      ]
    }).then(tweet => {
      Reply.findAll({
        where: {TweetId: req.params.tweet_id},
        include: [User]
      })
      .then(replies => {
        const data = {
          replies: replies,
          tweet: tweet,
          repliesAmount: replies.length,
          likesAmount: tweet.Likes.length
        }  
        return res.render('replies', data)
      })
      
          
    })
    
  }
}

module.exports = userController