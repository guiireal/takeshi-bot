
var engine = require('engine.io-stream')

module.exports = require('./inject')(function (){
  var args = [].slice.call(arguments)
  return engine.apply(null, args)
})
