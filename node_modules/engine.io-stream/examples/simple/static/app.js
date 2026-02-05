var through = require('through')
var append = require("insert/append")

var engine = require("../../../")

var body = document.body
var stream = engine("/invert")

stream
    .pipe(through(function (chunk) {
        append(body, String(chunk))
        return String(Number(chunk) ^ 1)
    }))
    .pipe(stream)
