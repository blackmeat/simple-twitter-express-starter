const db = require('../models')
const Channel = db.Channel
const Message = db.Message
const User = db.User


const chatController = {
  showChat: (req, res) => {
    let chattedUser = req.params.chatted//被聊天的對象的id   
    // 判斷如果沒有被聊天的使用者在user表中，就不讓它繼續下去
    User.findByPk(chattedUser).then(user => {
      if (user) {

        Channel.findAll({}).then(channel => {
          let findChannel = [] //收集channel



          for (let i = 0; i < channel.length; i++) {
            if ((Number(channel[i].member1) === Number(req.user.id) && Number(channel[i].member2) === Number(chattedUser)) || (Number(channel[i].member2) === Number(req.user.id) && Number(channel[i].member1) === Number(chattedUser))) {
              findChannel.push(channel[i].id) // 符合條件的channel放進去，因為不知道為甚麼資料庫會寫兩次一模一樣的channel，所以findChannel必須是陣列存兩筆一樣的東西，只是它的id不同而已
              console.log('findChannel是', findChannel)
            }
          }
          // console.log('列印', findChannel)

          if (findChannel.length !== 0) {
            console.log('findchannel[0]這', findChannel[0])
            let target = findChannel[0]  //雙重連線為解決

            Message.findAll({
              where: { targetChannel: target }
            }).then(message => {
              message = message.map((message) => {
                return {
                  ...message.dataValues,
                  message: JSON.parse(message.message).message1,
                  sender: !message.sender.includes(req.user.id)
                }
              })
              res.render('chat', { message, target })
            })
          } else {
            Channel.create({
              member1: req.user.id,
              member2: chattedUser
            }).then(channel => {
              return res.render('chat', { channel })
            })
          }
        })
        // console.log('列印', findChannel)
      } else {
        req.flash('error_messages', '您要聊天的對象不存在')
        res.redirect('/tweets')
      }
    }
    )
  }
}

module.exports = chatController