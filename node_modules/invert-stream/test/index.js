var invert = require('..')
var assert = require('assert')
var macgyver = require('macgyver')

function test (fun) {
  var a = invert()

  var mac = macgyver()
  fun(a, a.b, mac)
  mac.validate()

  var a2 = invert()

  var mac = macgyver()
  fun(a2.b, a2, mac)
  mac.validate()
}

test(function (a, b, mac) {
  var _data = Math.random()
  b.on('data', mac(function (data) { 
    console.log('data', data)
    assert.equal(data, _data) 
  }).once())
  b.on('end', mac().once())
  a.write(_data)
  a.end()
})

test(function (a, b, mac) {
  var data1 = Math.random()
  var data2 = Math.random()
  b.on('data', mac(function (data) { 
    console.log('data', data)
    assert.equal(data, data1) 
  }).once())
  a.on('data', mac(function (data) { 
    console.log('data', data)
    assert.equal(data, data2) 
  }).once())
  a.on('end', mac().once())
  b.on('end', mac().once())
  a.write(data1)
  b.write(data2)
  a.end()
  b.end()
})

test(function (a, b, mac) {
  var _data = Math.random()
  b.on('close', mac().once())
  a.on('close', mac().once())
  a.destroy()
})

test(function (a, b, mac) {
  var drain = mac().once()
  var pause = mac().before(drain).once()

  b.resume = mac(b.resume).before(drain)
  b.on('pause', pause)
  b.on('drain', drain)
  a.pause()
  assert.strictEqual(b.write(), false)
  a.resume()
})

