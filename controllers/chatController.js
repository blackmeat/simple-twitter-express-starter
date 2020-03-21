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


        // if (Number(req.user.id) === Number(req.params.hostChatId)) {
        // Message.findByPk(33).then(channel => {
        //   channel.destroy()
        //   res.redirect("back")
        // })
        Channel.findAll({}).then(channel => {
          console.log(channel[0].id)
          if ((Number(channel[0].member1) === Number(req.user.id) && Number(channel[0].member2) === Number(chattedUser)) || (Number(channel[0].member2) === Number(req.user.id) && Number(channel[0].member1) === Number(chattedUser))) {
            let target = channel[0].id

            Message.findAll({
              where: { targetChannel: target }
            }).then(message => {
              message = message.map((message) => ({
                ...message.dataValues,
                message: message.message.split("叕")[0],
                sender: !message.sender.includes(req.user.id)
              }))


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
        // } else {
        //   return res.redirect('back')
        // }
      } else {
        req.flash('error_messages', '您要聊天的對象不存在')
        res.redirect('/tweets')
      }
    }
    )
  }
}

module.exports = chatController