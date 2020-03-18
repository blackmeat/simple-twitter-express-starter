const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  ifNoCond: function (a, b, options) { //用於自己不能follow自己
    if (a !== b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },
  date: function (a) {
    return moment(a).format('YYYY-MM-DD, HH:mm:ss')
  },
  subString: function (a) {
    return String(a).split("").length >= 50 ? a.substring(0, 50) + "....." : a
  },
}