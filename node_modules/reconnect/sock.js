
var sock = require('sockjs-stream')

module.exports = require('./inject')(function (){
  var args = [].slice.call(arguments)
      .map(function (e) {
        if('string' !== typeof e) return e
        return e.replace(/^http/, 'ws')
      })

  return sock.apply(null, args)
})
