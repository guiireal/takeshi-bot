var reconnect = require('..')
var assert    = require('assert')
var mac  = require('macgyver')()

var port = Math.round(1025 + Math.random() * 40000)

var reconnector = reconnect({initialDelay: 10}, mac(function (stream) {
  console.log('connected!')
  assert.ok(false) //should not happen in this test!
}).never())

var connect = mac(function () {
  assert.equal(reconnector.connected, true)
}).never()

var reconnect = mac(function () {
  assert.equal(reconnector.connected, false)
  assert.equal(reconnector.reconnect, true)
}).before(connect)

reconnector
  .on('connect', connect)       //for test
  .on('reconnect', reconnect)   //for test
  .on('reconnect', function (n, delay) {
    console.log(n, delay)
    if(n > 4) //stop trying, so process will exit
      reconnector.reconnect = false
  })
  .connect(port)

process.on('exit', mac.validate)
