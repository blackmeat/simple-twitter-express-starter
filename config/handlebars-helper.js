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
    const year = a.getFullYear()
    const month = a.getMonth() + 1
    const date = a.getDate()
    const hour = a.getHours()
    const minute = a.getMinutes()
    return `${year}-${month}-${date},${hour}:${minute}`
  }
}