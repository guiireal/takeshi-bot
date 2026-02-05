var EngineSocket = require("engine.io-client").Socket

var EngineStream = require("./eiostream")

module.exports = EngineClient

function EngineClient(options) {
    options = options || {}

    if (typeof options === "string") {
        options = { path: options }
    }

    var socket = new EngineSocket(options)
    return EngineStream(socket)
}
