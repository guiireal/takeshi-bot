var request = require('request')

module.exports = require('./inject')(function (){
  var args = [].slice.call(arguments)
  return request.apply(null, args)
})
