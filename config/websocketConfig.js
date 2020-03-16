const SocketServer = require('ws').Server

const websocket = {
    websocket: function(server) {
      let user = {} // 連接用戶數
      let online = 0 // 在線人數
      
      //把app交給SocketServer開啟 WebSocket 的服務
      const wss = new SocketServer({ server , verifyClient: yan})
      function yan(info) {
        console.log(info.req.headers.cookie)
        let infoUrl = info.req.url
        console.log('通過連接'+ infoUrl)
        return true
      } 

      // 當WebSocket從外面連結時執行
      wss.on('connection', (ws, req) => {
        console.log('Client connected')
        online = wss._server._connections
        console.log('目前在線', online, '個連接')
        ws.send('目前在線' + online + '個連接')
        
        let url = req.url
        let chatHost = url.split('/')[2] //發起聊天的人的id
        // 把發起聊天的人的ws存在伺服器
        if (chatHost) {
          user[chatHost] = ws
        }
        // console.log(user)
        let chattedUser = url.split('/')[3] //被聊天的對象的id
        
        // [待開發]首次連接就先去撈歷史訊息給Client

        // 對message進行監聽，接收從Client送進來的訊息
        ws.on('message', data => {
          console.log('收到' + url + '的消息'+ data)
          // 判斷有沒有被聊天的對象
          if(chattedUser) {
            // 會去查看被聊天的對象有沒有被存在user裡了
            if (user[chattedUser]) {
              /* 當對方沒有連線的時候，對方的readyState會變成3，只是我不確定它是在哪個時候存進去把1變3的，
              照理說user這個物件是在wss connection連接的時候就已經把所屬的ws塞進去了，
              我也沒有在斷線的時候，把對方所屬的readyState塞進去user裡，應該是不會被更新成3?
              用console發現好像是對方斷線的時候，會自動連動更新原本存在user裡的readyState?
              */
              if (user[chattedUser].readyState === 1) {
                user[chattedUser].send(data) // 把訊息送給被聊天的對象
                ws.send(data) // 也把訊息送回給發起聊天的人
                ws.send('發送成功')
                
              } else {
                ws.send('對方斷線')
              }
            } else {
              ws.send('找不到被聊天的使用者')
            }
          } else { // 如果沒有被聊天的對象，就會變成群聊發送
            let clients = wss.clients
            // 聊天室裡會有很多人，所以用迴圈發訊息給所有Client
            clients.forEach(client=> {
              if (client !==ws && client.readyState === WebSocket.Open) {
                client.send(data)
              }
              
            })
          }
        })
        
        // 連結關閉時執行
        ws.on('close', () => {
          console.log('Close connected ')
          // console.log(user)
          // [待開發]最後把所有的聊天訊息存到資料庫(要另外新建一張資料表專門存訊息)

        })
      })
    }
}

module.exports = websocket