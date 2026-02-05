var tls = require('tls')
var inject = require('./inject')

module.exports = inject(function (opts) {
  return tls.connect(opts)
    .on('secureConnect', function () {
      this.emit('connect')
    })
    .on('clientError', function (err) {
      this.emit('error', err)
    })
})
