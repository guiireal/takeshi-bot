var uuid = require('node-uuid');
var Transport = require('./transport');

var defaults =
{
  timeout : 60e3, // 60 seconds
  bufferTimeout: 15 * 60 * 1e3, // 15 minutes
  bufferMax: 1000,
  acknowledgeInterval: 1e3,
  channel: 'DEFAULT_CHANNEL',
  maxPeers: 1000
};

function merge(a, b) {
  for(var p in b) {
    if (b.hasOwnProperty(p)) a[p] = b[p];
  }
}

exports =
module.exports =
function Options(opts) {
  var options = {};
  merge(options, defaults);

  if (! opts) opts = {};
  if (typeof opts === 'string') {
    opts = {
      channel: opts
    };
  }

  merge(options, opts);

  if (! options.node_id) options.node_id = uuid.v4();

  if (! options.transport) options.transport = 'tcp';

  if (typeof options.transport == 'string') options.transport = Transport[options.transport];
  if (! options.transport) throw new Error('Need a valid transport defined in options. Valid ones are: ' +
    JSON.stringify(Object.keys(Transport)));

  return options;
}

module.exports.defaults = defaults;