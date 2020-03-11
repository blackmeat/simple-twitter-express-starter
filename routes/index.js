const userController = require("../controllers/userController")

module.exports = (app, passport) => {
  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") { return next() }
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
  // Tweets
  app.get("/", authenticated, (req, res) => { res.redirect("/tweets") })
  app.get("/tweets", (req, res) => { res.render("tweets") })
  // Follow
  app.post("/followships/:followingId", authenticated, userController.addFollow)
  app.delete("/followships/:followingId", authenticated, userController.deleteFollow)
}