const db = require('../models')
const Tweet = db.Tweet

let tweetController = {
  getTweet: (req, res) => {

  },
  postTweet: (req, res) => {
    if (req.body.text.length > 140) {
      req.flash("error_messages", "字數不能超過140字")
      return res.redirect("/tweets")
    }
    if (req.body.text === "") {
      req.flash("error_messages", "內容不可以為空")
      return res.redirect("/tweets")
    }

    return Tweet.create({
      description: req.body.text,
      UserId: req.user.id
    })
      .then((Tweet) => {
        res.redirect("/tweets")
      })
  }
}
module.exports = tweetController