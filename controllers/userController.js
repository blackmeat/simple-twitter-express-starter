const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User
const Tweet = db.Tweet
const Like = db.Like

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
    /*塞入假資料測試用
    Followship.create({
      followerId: 3,
      followingId : 1,
    }).then(f=>console.log(123))
    
    Tweet.create({
      UserId: 3,
      description: '我很好!!'
    })
    */
   
    User.findOne({
      where: {id: req.user.id},
      include: [
        {model: User, as: 'followerId'},
        {model: User, as: 'followingId'},
        //{model: Like, as: 'LikedTweets'},
        Tweet
      ]
    })
    .then(user => {
      const numberObj = {
        tweetsAmount: user.Tweets.length,
        followersAmount: user.followerId.length,
        followingsAmonut: user.followingId.length,
      }
      res.render('following', {...numberObj, followers: user.followerId})
    })
  }
}

module.exports = userController