var reconnect = require('..')
var assert    = require('assert')
var net       = require('net')

var port = Math.round(1025 + Math.random() * 40000)
var timeout

var server = net.createServer (function () {
  console.log('server connected!')
  reconnector.reconnect = false
  reconnector.disconnect()
  server.close()
  timeout = setTimeout(function() {
    assert.fail('client did not disconnect')
  }, 500)
})

var reconnector = reconnect({initialDelay: 10}, function (stream) {
  console.log('client connected!')
})

reconnector.on('disconnect', function() {
  if (!timeout) return;

  clearTimeout(timeout)
  console.log('all ok')
})

reconnector.connect(port)

server.listen(port)
