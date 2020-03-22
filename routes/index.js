const userController = require("../controllers/userController")
const tweetController = require("../controllers/tweetController")
const adminController = require("../controllers/adminController")

const chatController = require("../controllers/chatController")

const helpers = require("../_helpers")
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) {
      if (helpers.getUser(req).role === "admin") { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }
  // 登入＆登出 
  app.get("/signup", userController.signUpPage)
  app.post("/signup", userController.signUp)
  app.get("/signin", userController.signInPage)
  app.post("/signin", passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get("/logout", userController.logout)

  // Users
  app.get("/users/:id/tweets", authenticated, userController.getUserTweets)
  app.get('/users/:id/followings', authenticated, userController.followingsPage)
  app.get('/users/:id/followers', authenticated, userController.followersPage)
  app.get("/users/:id/edit", authenticated, userController.editUser) //取得修改頁面
  app.get("/users/:id/likes", authenticated, userController.getuserlikes)
  app.post("/users/:id/edit", authenticated, upload.single('avatar'), userController.postUser) //寫入修改資料
  const hashtagController = require("../controllers/hashtagController")

  // Tweets
  app.get("/", authenticated, (req, res) => res.redirect('/tweets'))
  app.get("/tweets", authenticated, tweetController.getTweets)
  app.post("/tweets", authenticated, tweetController.postTweet)
  app.get('/tweets/:tweet_id/replies', authenticated, userController.getReplies)
  app.post('/tweets/:tweet_id/replies', authenticated, userController.createReply)
  app.post("/tweets/:id/like", authenticated, tweetController.likeTweet)
  app.post("/tweets/:id/unlike", authenticated, tweetController.unlikeTweet)

  // Follow
  app.post("/followships", authenticated, userController.addFollow)
  app.delete("/followships/:followingId", authenticated, userController.deleteFollow)

  // admin 
  app.get("/admin", authenticatedAdmin, (req, res) => { res.redirect("/admin/tweets") })
  app.get("/admin/tweets", authenticatedAdmin, adminController.getTweets)
  app.delete("/admin/tweets/:id", authenticatedAdmin, adminController.deleteTweet)
  app.get("/admin/users", authenticatedAdmin, adminController.getUsers)


      // privateChat
  // :hostChatId表示發起聊天的人(即當前登入的使用者)， :id表示被聊天的對象
  app.get('/chat/:chatted', authenticated, chatController.showChat)
  // hashtag
  app.get("/hashtags/:id/tweets", authenticated, hashtagController.getHashtagTweets)
  // privateChat
  // :hostChatId表示發起聊天的人(即當前登入的使用者)， :id表示被聊天的對象
  app.get('/chat/:hostChatId/:id', authenticated, (req, res) => {
    // console.log(Number(req.user.id))
    // console.log(Number(req.params.hostChatId))
    if (Number(req.user.id) === Number(req.params.hostChatId)) {
      res.render('chat')
    } else {
      return res.redirect('back')
    }

  })

}