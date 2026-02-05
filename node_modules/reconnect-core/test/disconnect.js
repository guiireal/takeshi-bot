var inject = require('..')
var test = require('tape')
var Stream = require('stream')

test('disconnect', function (t) {
  t.plan(1)

  var timeout
  var reconnect = inject(function () {
    reconnector.reconnect = false
    reconnector.disconnect()

    timeout = setTimeout(function() {
      t.fail('client did not disconnect')
    }, 500)

    var s = new Stream
    process.nextTick(function () {
      s.emit('end')
    })
    return s
  })

  var reconnector = reconnect({initialDelay: 10})

  reconnector.on('disconnect', function() {
    clearTimeout(timeout)
    t.ok(true, 'disconnected')
  })

  reconnector.connect()
})

