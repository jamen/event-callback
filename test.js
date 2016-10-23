const test = require('tape')
const eventcb = require('./')
const EventEmitter = require('events')

test('emits passing events', function (t) {
  const foo = new EventEmitter()

  eventcb(foo, 'testing', function (err, data, bar) {
    t.is(err, null, 'no error')
    t.is(data, 'foobar', 'first arg')
    t.is(bar, 'hello world', 'second arg')
    t.end()
  })

  foo.emit('testing', 'foobar', 'hello world')
})

test('emits error events', function (t) {
  const foo = new EventEmitter()
  eventcb(foo, 'testing', function (err) {
    t.same(err, new Error('ooga booga!'), 'caught "error" event')
  })

  // Custom fail event
  const bar = new EventEmitter()
  eventcb(bar, 'testing', 'my-error', function (err) {
    t.same(err, new Error('custom error'), 'caught custom error event')
    t.end()
  })

  foo.emit('error', new Error('ooga booga!'))
  bar.emit('my-error', new Error('custom error'))
})

test('emits once', function (t) {
  const foo = new EventEmitter()

  let emitted = false

  foo.on('testing', function () {
    if (emitted) t.end()
  })

  eventcb(foo, 'testing', function () {
    if (!emitted) {
      emitted = true
      t.true(emitted, 'emitted once')
    } else {
      t.false(emitted, 'emitted twice')
    }
  })

  foo.emit('testing')
  foo.emit('testing')
})

test('persistence', function (t) {
  const foo = new EventEmitter()

  let emitted = false

  foo.on('testing', function () {
    if (emitted) t.end()
  })

  eventcb.persist(foo, 'testing', function () {
    if (!emitted) {
      emitted = true
      t.true(emitted, 'emitted once')
    } else {
      t.true(emitted, 'emitted twice')
    }
  })

  foo.emit('testing')
  foo.emit('testing')
})

test('request event example', function (t) {
  const http = require('http')

  console.log('Requesting http://example.com')
  const foo = http.get('http://example.com')
  eventcb(foo, 'response', function (err, resp) {
    if (err) t.end(err)
    else {
      console.log('Status code:', resp.statusCode)
      t.end()
    }
  })
})
