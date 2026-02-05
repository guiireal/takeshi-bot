var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var WriteEmitter = require('./write_emitter');
var ReadEmitter = require('./read_emitter');

module.exports =
function createDuplexEmitter(stream) {
  return new DuplexEmitter(stream);
};

function DuplexEmitter(stream) {
  EventEmitter.call(this);

  this.read = this.readEmitter = ReadEmitter(stream);
  this.write = this.writeEmitter = WriteEmitter(stream);

  this.write.on('error', onError.bind(this));
}

inherits(DuplexEmitter, EventEmitter);


/// addListener and on

DuplexEmitter.prototype.addListener =
DuplexEmitter.prototype.on =
function addListener(event, listener) {
  return this.read.on(event, listener);
};


/// once

DuplexEmitter.prototype.once =
function once(event, listener) {
  return this.read.once(event, listener);
};


/// removeListener

DuplexEmitter.prototype.removeListener =
function removeListener(event, listener) {
  return this.read.removeListener(event, listener);
};


/// removeAllListeners

DuplexEmitter.prototype.removeAllListeners =
function removeAllListeners() {
  return this.read.removeAllListeners.apply(this.read, arguments);
};


/// read_emitter
DuplexEmitter.prototype.emit =
function emit() {
  return this.write.emit.apply(this.write, arguments);
};


// onError

function onError(err) {
  this.emit('error', err);
}
