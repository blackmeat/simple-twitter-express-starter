const express = require('express')
const helpers = require('./_helpers');
const exhbs = require("express-handlebars")
const bodyParser = require("body-parser")
const passport = require("./config/passport")
const session = require("express-session")
const flash = require("connect-flash")
const methodOverride = require("method-override")

const app = express()
const port = 3000

app.use(methodOverride("_method"))
app.engine("handlebars", exhbs({
  defaultLayout: "main",
  helpers: require("./config/handlebars-helper")
}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({ extended: true }))
app.use('/upload', express.static(__dirname + '/upload'))

app.use(methodOverride("_method"))

app.use(session({ secret: "12345", resave: false, saveUninitialized: false }))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = helpers.getUser(req)
  res.locals.isAuthenticated = helpers.ensureAuthenticated(req)
  next()
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


require("./routes/index")(app, passport)
module.exports = app
