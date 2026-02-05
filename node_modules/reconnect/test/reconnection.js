var reconnect = require('..')
var assert    = require('assert')
var mac       = require('macgyver')()
var net       = require('net')

var port = Math.round(1025 + Math.random() * 40000)

var times = 0
var server = net.createServer (mac(function onConnect(stream) {
  console.log('server connected!', times)
  if(++times >= 2) {
    reconnector.reconnect = false
    server.close()
  }
  stream.destroy()

}).times(2))

var reconnector = reconnect({initialDelay: 10}, mac(function (stream) {
  console.log('connected!')
}).times(2))

var connect = mac(function () {
  console.log('client connected')
  assert.equal(reconnector.connected, true)
}).times(2)

var reconnect = mac(function (n, d) {
  console.log(n, d)
  assert.equal(reconnector.connected, false)
  assert.equal(reconnector.reconnect, true)
}).atLeast(1)

reconnector
  .on('connect', connect)       //for test
  .on('reconnect', reconnect)   //for test
  .on('reconnect', function (n, delay) {
    console.log(n, delay)
    if(n == 4) //stop trying, so process will exit
      server.listen(port)
  })
  .connect(port)

process.on('exit' ,mac.validate)
