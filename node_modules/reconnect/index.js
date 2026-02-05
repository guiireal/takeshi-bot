var net = require('net')

module.exports = require('./inject')(function (){ 
  var args = [].slice.call(arguments)
  return net.connect.apply(null, args)
})
