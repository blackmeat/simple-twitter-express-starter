const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User
const Reply = db.Reply
const Followship = db.Followship
const Tweet = db.Tweet
const Like = db.Like
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = 'a145f3a2c4d12e7'


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
      where: { id: req.user.id },
      include: [
        { model: User, as: 'followerId' },
        { model: User, as: 'followingId' },
        { model: Tweet, as: 'LikedTweets' },
        Tweet
      ]
    })
      .then(user => {
        const data = {
          tweetsAmount: user.Tweets.length,
          followersAmount: user.followerId.length,
          followingsAmonut: user.followingId.length,
          likesAmount: user.LikedTweets.length,
          followers: user.followerId
        }
        res.render('following', data)
      })
  },

  getUserTweets: (req, res) => {
    User
      .findByPk(req.params.id, {
        include: [
          // 這位用戶Like過所有推文
          { model: Like, include: [Tweet] },
          // 這位用戶的推文包括推文的回覆、喜歡、使用者資訊
          { model: Tweet, limit: 6, order: [["createdAt", "DESC"]], include: [Reply, Like, User] },
          // 這位用戶的追蹤者
          { model: User, as: "followerId" },
          // 這位用戶正在追蹤的人數
          { model: User, as: "followingId" }
        ]
      })
      .then((User) => {
        // 加入使用者推文及追蹤資訊
        User = {
          ...User.dataValues,
          LikeCount: User.Likes.length,
          TweetCount: User.Tweets.length,
          FollowerCount: User.followerId.length,
          FollowingCount: User.followingId.length,
          isFollowing: req.user.followingId.map(d => d.id).includes(User.id)
        }

        // 每個推文的回覆數和讚數
        const Tweets = User.Tweets.map((Tweet) => ({
          ...Tweet,
          LikeCount: Tweet.dataValues.Likes.length,
          ReplyCount: Tweet.dataValues.Replies.length,
          isLiked: Tweet.dataValues.Likes.map(d => d.UserId).includes(req.user.id)
        }))
        // console.log(User)
        // console.log(Tweets)
        res.render("userTweets", { User, Tweets })
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
  },

  editUser: (req, res) => {
    if (req.user.id == req.params.id) {
      return User.findByPk(req.params.id).then(user => {
        console.log(user)
        return res.render('profileedit', { user: JSON.parse(JSON.stringify(user)) }) //修改頁面
      })
    } else {
      return User.findByPk(req.params.id).then(user => {
        return res.redirect(`/users/${user.id}/tweets`)  //預設render為profile
      })
    }
  },

  postUser: (req, res) => {
    if (req.user.id == req.params.id) {    //若非該使用者送出請求，重新導向目前使用者的profile
      if (!req.body.name) {
        req.flash('error_messages', "name didn't exist")
        return res.redirect('back')
      }

      const { file } = req
      if (file) {                         //修改時若有上傳圖片
        imgur.setClientID(IMGUR_CLIENT_ID);
        imgur.upload(file.path, (err, img) => {
          return User.findByPk(req.params.id)
            .then((user) => {
              user.update({
                name: req.body.name,
                avatar: file ? img.data.link : user.avatar,
                introduction: req.body.introduction
              })
                .then((user) => {
                  req.flash('success_messages', 'userprofile was successfully to update')
                  res.redirect(`/users/${user.id}/tweets`)
                })
            })
        })
      } else {
        return User.findByPk(req.params.id)          //若修改時沒上傳圖片
          .then((user) => {
            user.update({
              name: req.body.name,
              avatar: user.avatar,
              introduction: req.body.introduction
            })
              .then((user) => {
                req.flash('success_messages', 'user profile was successfully to update')
                res.redirect(`/users/${user.id}/tweets`)
              })
          })
      }
    } else {
      return User.findByPk(req.params.id).then(user => {
        return res.redirect(`/users /${user.id}/tweets`)
      })
    }
  }

}

module.exports = userController