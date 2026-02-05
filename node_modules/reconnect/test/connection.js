var reconnect = require('..')
var assert    = require('assert')
var mac       = require('macgyver')()
var net       = require('net')

var port = Math.round(1025 + Math.random() * 40000)

var server = net.createServer (function () {
  console.log('server connected!')
  server.close()
})

var reconnector = reconnect({initialDelay: 10}, function (stream) {
  console.log('connected!')
  reconnector.reconnect = false
  reconnector.disconnect()
})

var connect = mac(function () {
  console.log('client connected')
  assert.equal(reconnector.connected, true)
}).once()

var reconnect = mac(function (n, d) {
  console.log(n, d)
  assert.equal(reconnector.connected, false)
  assert.equal(reconnector.reconnect, true)
}).before(connect)

reconnector
  .on('connect', connect)       //for test
  .on('reconnect', reconnect)   //for test
  .on('reconnect', function (n, delay) {
    console.log(n, delay)
    if(n < 4) //stop trying, so process will exit
      server.listen(port)
  })
  .connect(port)

process.on('exit' ,mac.validate)
