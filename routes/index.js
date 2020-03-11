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
  app.get("/signup", userController.signUpPage)
  app.post("/signup", userController.signUp)
  app.get("/signin", userController.signInPage)
  app.post("/signin", passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get("/logout", userController.logout)

  app.get("/tweets", (req, res) => {
    res.render("tweets")
  })

  app.get('/users/:id/followings', authenticated, userController.followingsPage)
  app.get('/users/:id/followers', authenticated, userController.followersPage)
  app.get('/tweets/:tweet_id/replies', authenticated, userController.getReplies)

}