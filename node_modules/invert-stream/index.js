var Stream = require('stream')
var inherits = require('util').inherits

inherits(InvertStream, Stream)

function InvertStream (other) {
  this.writable = this.readable = true
  this.paused = false
  if(other) {
    this.other = other
    other.other = this
    this.b = other
    other.a = this
  }
}

InvertStream.prototype.write = 
  function (data) {
    this.other.emit('data', data)
    return !this.paused
  }

InvertStream.prototype.end = 
 function () {
    this.writable = false
    this.other.readable = false
    this.other.emit('end')
  }
InvertStream.prototype.destroy = 
  function () {
    this.writable = this.readable = 
    this.other.readable = this.other.writable = false
    this.emit('close')
    this.other.emit('close')
  }

InvertStream.prototype.pause = 
  function () {
    this.other.paused = true
    this.other.emit('pause')
    return this
  }

InvertStream.prototype.resume = 
  function () {
    this.other.paused = false
    this.other.emit('drain')
    return this
  }

exports = 
module.exports = function () {
  return new InvertStream(new InvertStream())
}

exports.InvertStream = InvertStream

