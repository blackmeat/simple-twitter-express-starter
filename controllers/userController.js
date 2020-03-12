const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Followship = db.Followship

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
    // 找到當前頁面的擁有者
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
      // 撈出當前頁面擁有者被誰追蹤，並重構資料把isFollowed塞進去
      const followers = user.followerId.map(follower => {
        return {
          ...follower.dataValues,
          // 拿出現在登入的使用者追蹤了哪些人，並比對當前頁面擁有者的追蹤者是否在裡面
          isFollowed: req.user.followingId.map(d => d.id).includes(follower.id)
        }
      })
      const data = {
        currentUser: user,
        tweetsAmount: user.Tweets.length,
        followersAmount: user.followerId.length,
        followingsAmonut: user.followingId.length,
        likesAmount: user.Likes.length,
        followingsAndFollowers: followers,
        paramsId: Number(req.params.id)
      }
      return res.render('following', data)
    })
  }
}

module.exports = userController