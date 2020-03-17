const bcrypt = require("bcrypt-nodejs")
const db = require("../models")
const User = db.User
const Reply = db.Reply
const Followship = db.Followship
const Tweet = db.Tweet
const Like = db.Like

const helpers = require("../_helpers")

const Hashtag = db.Hashtag
const Tag = db.Tag

const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = 'a145f3a2c4d12e7'
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

  getUserTweets: (req, res) => {
    User
      .findByPk(req.params.id, {
        include: [
          // 這位用戶Like過所有推文
          { model: Like, include: [Tweet] },
          // 這位用戶的推文包括推文的回覆、喜歡、使用者資訊
          {
            model: Tweet,
            limit: 6,
            order: [["createdAt", "DESC"]],
            include: [Reply, Like, User, { model: Tag, include: [Hashtag] }]
          },
          // 這位用戶的追蹤者
          { model: User, as: "Followers" },
          // 這位用戶正在追蹤的人數
          { model: User, as: "Followings" }
        ]
      })
      .then((User) => {
        // 加入使用者推文及追蹤資訊
        User = {
          ...User.dataValues,
          LikeCount: User.Likes.length,
          TweetCount: User.Tweets.length,
          FollowerCount: User.Followers.length,
          FollowingCount: User.Followings.length,
          isFollowing: helpers.getUser(req).Followings.map(d => d.id).includes(User.id)
        }

        // 每個推文的回覆數和讚數
        const Tweets = User.Tweets.map((Tweet) => ({
          ...Tweet.dataValues,
          LikeCount: Tweet.dataValues.Likes.length,
          ReplyCount: Tweet.dataValues.Replies.length,
          isLiked: Tweet.dataValues.Likes.map(d => d.UserId).includes(helpers.getUser(req).id),
          Hashtag: Tweet.dataValues.Tags.map(d => d.Hashtag).map(hashtag => ({ id: hashtag.id, name: hashtag.name }))
        }))
        // console.log(User)
        // console.log(Tweets)
        res.render("userTweets", { User, Tweets })
      })
  },

  addFollow: (req, res) => {

    if (Number(helpers.getUser(req).id) !== Number(req.body.id)) {
      Followship.create({
        followerId: Number(helpers.getUser(req).id),
        followingId: Number(req.body.id)
      })
        .then((followship) => {
          return res.redirect("back")
        })
    } else {
      return res.redirect(200, "back")   //改這

    }

  },

  deleteFollow: (req, res) => {
    Followship
      .findOne({
        where: {
          followerId: helpers.getUser(req).id,
          followingId: req.params.followingId
        }
      })
      .then((followship) => {
        followship.destroy()
        res.redirect("back")
      })
  },

  followingsPage: (req, res) => {
    // 找到這一頁所屬的擁有者
    User.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        Tweet,
        Like
      ]
    })
      .then(user => {
        const followings = user.Followings.map(follower => {
          return {
            ...follower.dataValues,
            // 拿出現在登入的使用者追蹤了哪些人，並比對當前頁面擁有者追蹤的人是否在裡面
            isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(follower.id)
          }
        })

        const data = {
          currentUser: user,
          tweetsAmount: user.Tweets.length,
          followersAmount: user.Followers.length,
          followingsAmonut: user.Followings.length,
          likesAmount: user.Likes.length,
          followingsAndFollowers: followings,
          paramsId: Number(req.params.id),
          isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
        }
        return res.render('following', data)
      })
  },

  followersPage: (req, res) => {
    // 找到當前頁面的擁有者
    User.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
        Tweet,
        Like
      ]
    })
      .then(user => {
        // 撈出當前頁面擁有者被誰追蹤，並重構資料把isFollowed塞進去
        const followers = user.Followers.map(follower => {
          return {
            ...follower.dataValues,
            // 拿出現在登入的使用者追蹤了哪些人，並比對當前頁面擁有者的追蹤者是否在裡面
            isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(follower.id)
          }
        })
        const data = {
          currentUser: user,
          tweetsAmount: user.Tweets.length,
          followersAmount: user.Followers.length,
          followingsAmonut: user.Followings.length,
          likesAmount: user.Likes.length,
          followingsAndFollowers: followers,
          paramsId: Number(req.params.id),
          // 拿出現在登入的使用者追蹤了哪些人，判斷當前頁面擁有者是否在裡面
          isFollowed: helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
        }
        return res.render('following', data)
      })
  },

  editUser: (req, res) => {
    if (helpers.getUser(req).id == req.params.id) {
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
    if (helpers.getUser(req).id == req.params.id) {    //若非該使用者送出請求，重新導向目前使用者的profile
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
        return res.redirect(`/users/${user.id}/tweets`)
      })
    }
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
        iLiked: r.Likes.map(d => d.UserId).includes(Number(helpers.getUser(req).id))
      }))

      User.findOne({
        where: {
          id: req.params.id,
        },
        include: [
          Tweet,
          Like,
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })
        .then(user => {
          console.log(user)
          // console.log(users[0].followerId)
          // 整理 users 資料
          user = ({
            ...user.dataValues,
            FollowerCount: user.Followers.length,
            FollowingCount: user.Followings.length,
            TweetCount: user.Tweets.length,
            LikeCount: user.Likes.length
          })
          return res.render('likepage', {
            tweets: data,
            user: user,
            signinUser: helpers.getUser(req).id
          })
        })
    })
  },

  getReplies: (req, res) => {
    // 先撈出該筆tweet
    Tweet.findByPk(req.params.tweet_id, {
      include: [
        User,
        Like,
        { model: Reply, include: [User] }
      ]
    }).then(tweet => {
      // 再撈出該筆tweet發文者資料，主要是給頁面左半算數量使用
      User.findByPk(tweet.User.id, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
          Tweet,
          Like
        ]
      })
        .then(user => {
          // 檢查該筆tweet的發文者有沒有被現在登入的使用者follow過(供頁面左半Follow或Unfollow用)
          const isFollowed = helpers.getUser(req).Followings.map(d => d.id).includes(user.id)
          const data = {
            replies: tweet.Replies,
            repliesAmount: tweet.Replies.length,
            tweet: tweet,
            tweetLikedAmount: tweet.Likes.length,
            tweetsAmount: user.Tweets.length,
            followersAmount: user.Followers.length,
            followingsAmonut: user.Followings.length,
            likesAmount: user.Likes.length,
            isFollowed: isFollowed,
            isLiked: tweet.Likes.map(d => d.UserId).includes(helpers.getUser(req).id)
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
      UserId: helpers.getUser(req).id,
      TweetId: req.params.tweet_id,
      comment: req.body.reply
    })
      .then(reply => {
        res.redirect('back')
      })
  }

}
module.exports = userController