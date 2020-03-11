const userController = require("../controllers/userController")
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

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
    app.get("/users/:id/edit", authenticated, userController.editUser) //取得修改頁面
  app.post("/users/:id/edit", authenticated, upload.single('avatar'), userController.postUser) //寫入修改資料

}