var defaultOptions = {
  maxMessages:  1000,
  timeout:      60 * 60 * 1e3 // 1 hour
};

module.exports =
function Messages(options) {

  /// State
  var ended = false;

  var m = {};

  /// Options

  if (! options) options = {};

  for(var p in defaultOptions) {
    if (! options[p]) options[p] = defaultOptions[p];
  }

  /// Messages

  var messages = {};
  var messageIds = [];
  var currentIndex = 0;

  m.push =
  function push(message) {
    if (ended) throw new Error('Ended');
    if (! message || ! message._id) {
      throw new Error('invalid arguments, message or message._id is missing');
    }
    var id = message._id;
    messages[id] = { message: message, expires: Date.now() + options.timeout };
    messageIds.push(id);
    if (messageIds.length > options.maxMessages) {
      var mId = messageIds.splice(0, 1)[0];
      delete messages[mId];
      if (currentIndex > 0) currentIndex --;
    }
    scheduleExpiration();
  };

  m.next =
  function next() {
    var id = messageIds[currentIndex];
    if (id) {
      var m = messages[id];
      currentIndex ++;
      return m.message;
    }
  };

  m.length =
  function length() {
    return messageIds.length;
  };

  m.acknowledge =
  function acknowledge(id) {
    var mId;
    if (id && messages.hasOwnProperty(id)) {
      while(messageIds.length) {
        mId = messageIds.splice(0, 1)[0];
        delete messages[mId];
        if (mId == id) break;
      }      
      scheduleExpiration();
    }
    currentIndex = 0;
  };

  
  /// Expiration

  var timeout;
  function scheduleExpiration() {
    if (ended) throw new Error('Ended');
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
    if (messageIds.length) {
      var now = Date.now();
      var mId = messageIds[0];
      var m = mId && messages[mId];
      if (m) {
        var expires = m.expires;
        timeout = setTimeout(expire, expires - now);        
      }
    }
  }

  function expire() {
    var now = Date.now();

    while(messageIds.length) {
      var mId = messageIds[0];
      var m = messages[mId];
      if (m.expires < now) {
        messageIds.splice(0, 1);
        delete messages[mId];
      } else break;
    }
    scheduleExpiration();
  }


  /// End

  m.dropTimeout =
  function dropTimeout() {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  }

  m.end =
  function end() {
    ended = true;
    m.dropTimeout();
  };


  return m;
};