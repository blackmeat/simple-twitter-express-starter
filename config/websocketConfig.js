const SocketServer = require('ws').Server
const db = require('../models')
const Channel = db.Channel
const Message = db.Message



const websocket = {
  websocket: function (app, sessionParser) {
    const Websocket = require('ws')
    const http = require('http')
    const server = http.createServer(app)
    let user = {} // 連接用戶
    let online = 0 // 在線人數

    const verifyClientFn = function (info) {
      // console.log(info.req.headers.cookie) // 這邊可以拿到session
      infoUrl = info.req.headers
      infoUser = info.req.session.passport.user
      console.log('通過連接' + infoUrl + '來自使用者' + infoUser)
      return true
    }
    const wss = new Websocket.Server({ port: 3001, clientTracking: true, noserver: true, verifyClient: verifyClientFn })

    server.on('upgrade', function (request, socket, head) {
      console.log(`parsing session from request...`)

      // 把session從request解析出來(其實如果是在原本的http server間的req傳遞，不用那麼麻煩，直接req.session就可以完成存入跟取出資料)
      sessionParser(request, {}, () => {
        console.log(request.session.passport.user)
        if (!request.session.passport.user) {
          socket.destroy()
          return
        }
        console.log('session is parsed!')
        wss.handleUpgrade(request, socket, head, function (ws) {
          // 這邊的意思好像是把解析過的request送回去給wss在連線的時候用，因為有試過把sessionParser整個註解掉，當wss.on的時候就收不到request.session的內容
          wss.emit('connection', ws, request)
        })
      })
    })

    // 當WebSocket從外面連結時執行
    wss.on('connection', (ws, req) => {
      console.log('params here', req.params)
      console.log(req.session.passport)
      console.log('Client connected')
      online = wss._server._connections

      console.log('req.url here', req.url)
      let url = req.url
      let chatHost = req.session.passport.user //發起聊天的人的id  
      // ws.userId = chatHost
      // console.log(req.url)
      // 把發起聊天的人的ws存在伺服器
      if (chatHost) {
        user[chatHost] = ws
      }

      let chattedUser = url.split('/')[2] //被聊天的對象的id  
      console.log(chattedUser)
      // 對message進行監聽，接收從Client送進來的訊息
      ws.on('message', data => {
        const target1 = data.split("叕")[1]
        const message1 = data.split("叕")[0]
        Message.create({
          sender: chatHost,
          message: data,
          targetChannel: target1
        })

        console.log('收到' + url + '的消息' + data)
        // 判斷有沒有被聊天的對象

        //先找channels,抓出id:a，用a去找出message{id:a}，塞聊天訊息
        if (chattedUser) {
          console.log('有過嗎1')
          // 會去查看被聊天的對象有沒有被存在user裡了
          if (user[chattedUser]) {
            console.log('有過嗎2')
            /* 當對方沒有連線的時候，對方的readyState會變成3，只是我不確定它是在哪個時候存進去把1變3的，
            照理說user這個物件是在wss connection連接的時候就已經把所屬的ws塞進去了，
            我也沒有在斷線的時候，把對方所屬的readyState塞進去user裡，應該是不會被更新成3?
            用console發現好像是對方斷線的時候，會自動連動更新原本存在user裡的readyState?
            */
            if (user[chattedUser].readyState === 1) {
              console.log('有過嗎3')
              user[chattedUser].send(message1) // 把訊息送給被聊天的對象
              // ws.send(message1) 也把訊息送回給發起聊天的人
              // ws.send('發送成功')

            } else {
              ws.send('對方斷線')
            }
          } else {
            ws.send('找不到被聊天的使用者')
          }
        }
      })

      // 連結關閉時執行
      ws.on('close', () => {
        console.log('Close connected ')
        // console.log(user)
        // [待開發]最後把所有的聊天訊息存到資料庫(要另外新建一張資料表專門存訊息)

      })
    })

    server.listen(3000, function () {
      console.log('Listening on http://localhost:3000');
    })
  }
}

module.exports = websocket