String.prototype.format = function () {
  if (arguments.length == 0) return this
  const param = arguments[0]
  let _self = this
  if (typeof (param) == 'object') {
    for (let key in param) {
      _self = _self.replace(new RegExp('\\{' + key + '\\}', 'g'), param[key])
    }
    return _self
  } else {
    for (let i = 0; i < arguments.length; i++) {
      _self = _self.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i])
    }
    return _self
  }
}
