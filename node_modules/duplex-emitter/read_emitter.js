var assert = require('assert');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var Parser = require('./parser');

module.exports =
function createReadEmitter(stream) {
  return new ReadEmitter(stream);
};

function ReadEmitter(stream) {
  EventEmitter.call(this);

  this._stream = stream;

  var parser = Parser();
  parser.on('error', onParserError.bind(this));

  stream.pipe(parser);
  parser.on('data', onData.bind(this));

};

inherits(ReadEmitter, EventEmitter);

function onData(d) {
  if (! Array.isArray(d)) this.emit('error', new Error('data should be array:' + JSON.stringify(d)));
  else this.emit.apply(this, d);
}

function onParserError(err) {
  err.message = 'Error parsing peer data: ' + err.message;
  this.emit('error', err);
}