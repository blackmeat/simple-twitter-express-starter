const db = require("../../models")
const User = db.User

const apiController = {
  getUser: (req, res) => {
    User
      .findAll()
      .then((Users) => {
        Users = Users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        })
        )
        return res.json({ Users: Users })
      })
  }
}
module.exports = apiController