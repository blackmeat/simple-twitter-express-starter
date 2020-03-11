const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User

const Tweet = db.Tweet
const Like = db.Like
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = 'a145f3a2c4d12e7'
const Followship = db.Followship
const Like = db.Like
const Tweet = db.Tweet
const Reply = db.Reply
const moment = require("moment")


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
      where: {id: req.user.id},
      include: [
        {model: User, as: 'followerId'},
        {model: User, as: 'followingId'},
        {model: Tweet, as: 'LikedTweets'},
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
      editUser: (req, res) => {
    if (req.user.id == req.params.id) {
      return User.findByPk(req.params.id).then(user => {
        console.log(user)
        return res.render('profileedit', { user: JSON.parse(JSON.stringify(user)) }) //修改頁面
      })
    } else {
      return User.findByPk(req.user.id).then(user => {

        return res.render('profile', { user: JSON.parse(JSON.stringify(user)) }) //預設render為profile
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
      }
      else
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
    } else {
      return User.findByPk(req.user.id).then(user => {
        return res.render('profile', { user: JSON.parse(JSON.stringify(user)) })
      })
    }
  },
  addFollow: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.followingId
    })
      .then((followingId) => {
        return res.redirect('back')
      })
  },

  removeFollow: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.followingId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((restaurant) => {
            return res.redirect('back')
          })
      })
  },
  getuserlikes: (req, res) => {

    Tweet.findAll({ order: [['createdAt', 'DESC']], include: [User, { model: Reply, include: [User] }, { model: Like, include: [User] }] }).then(result => {   //最新的tweet顯示在前面
      const data = result.map(r => ({
        ...r.dataValues,
        createdAt: moment(r.createdAt).format('YYYY-MM-DD,HH:mm:ss'), //以moment套件，轉化成特定格式
        description: r.dataValues.description.substring(0, 50),
        reply: r.dataValues.Replies.length, //計算reply數量
        like: r.dataValues.Likes.length, //計算like數量
        isLiked: r.Likes.map(d => d.UserId).includes(Number(req.params.id)),
        iLiked: r.Likes.map(d => d.UserId).includes(Number(req.user.id))
      }))

      User.findOne({
        where: {
          id: req.params.id,
        },
        include: [Tweet, Like, { model: User, as: 'followerId' }, { model: User, as: 'followingId' }]
      })
        .then(user => {
          console.log(user)
          // console.log(users[0].followerId)
          // 整理 users 資料
          user = ({
            ...user.dataValues,
            FollowerCount: user.followerId.length,
            FollowingCount: user.followingId.length,
            TweetCount: user.Tweets.length,
            LikeCount: user.Likes.length
          })
          return res.render('likepage', {
            tweets: data,
            user: user,
            signinUser: req.user.id
          })
        })
}

module.exports = userController