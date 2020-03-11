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
  }
}