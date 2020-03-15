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

// 設定靜態檔案路徑
// 但我不確定是不是要跟下面的upload一樣在前面加個'public'才對? 不知道目前這樣會不會蓋到upload的路徑? 需要測一下。
app.use(express.static('public'))
app.use('/upload', express.static(__dirname + '/upload'))

app.use(session({ secret: "12345", resave: false, saveUninitialized: false }))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.userInfo = helpers.getUser(req)
  res.locals.isAuthenticated = helpers.ensureAuthenticated(req)
  next()
})

// 要把原本app.listen包起來
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// websocket設定
const SocketServer = require('ws').Server
//將 把app交給SocketServer開啟 WebSocket 的服務
const wss = new SocketServer({ server })

// 當WebSocket從外面連結時執行
wss.on('connection', ws => {
  console.log('Client connected')
  /* 如果不想只等Client發訊息，Server才回覆，可以用setInterval一直主動發訊息給Client(下面示範一直發出當前時間)
  const sendNowTime = setInterval(()=>{
    ws.send(String(new Date()))
  }, 1000)
  */
  // 對message進行監聽，接收從Client送進來的訊息
  ws.on('message', data => {
    /* data是Client發送的訊息，接著把訊息原封不動送回去給Client，但是這個只能針對個人，如果A傳給server，server會再回傳給A而已
    ws.send(data)
    */ 
    // 承上，如果需要傳給所有在聊天室的人則要用wss.clients
    let clients = wss.clients
      // 聊天室裡會有很多人，所以用迴圈發訊息給所有Client
      clients.forEach(client=> {
        client.send(data)
      })
  })
  
  // 連結關閉時執行
  ws.on('close', () => {
    console.log('Close connected ')

    // 最後把所有的聊天訊息存到資料庫

  })
})

require("./routes/index")(app, passport)
module.exports = app
