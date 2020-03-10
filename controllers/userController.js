const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User
const Reply = db.Reply
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

  getUserTweets: (req, res) => {
    User
      .findByPk(req.params.id, {
        include: [
          { model: Like, include: [Tweet] },
          { model: Tweet, include: [Reply, Like, User] },
          { model: User, as: "followerId" },
          { model: User, as: "followingId" }
        ]
      })
      .then((User) => {
        User = {
          ...User.dataValues,
          LikeCount: User.Likes.length,
          TweetCount: User.Tweets.length,
          FollowerCount: User.followerId.length,
          FollowingCount: User.followingId.length,
          isFollowing: req.user.followingId.map(d => d.id).includes(User.id)
        }
        console.log(User)
        res.render("userTweets", { User })
      })

  },
  addFollow: (req, res) => {
    Followship.create({
      followerId: req.user.id,
      followingId: req.params.followingId
    })
      .then((followship) => {
        res.redirect("back")
      })
  },
  deleteFollow: (req, res) => {
    Followship
      .findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.followingId
        }
      })
      .then((followship) => {
        followship.destroy()
        res.redirect("back")
      })
  }
}

module.exports = userController