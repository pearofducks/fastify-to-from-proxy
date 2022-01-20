import { wrapProxyPlugin } from './index.js'
import Fastify from 'fastify'
import proxyPlugin from 'fastify-http-proxy'
import { suite } from 'uvu'
import * as assert from 'uvu/assert'

const test = suite('proxy')
const plugin = wrapProxyPlugin(proxyPlugin)
const json = { foo: 'bar', llama: 'wombat' }

test.before(async t => {
  t.upstreamServer = Fastify()
  t.upstreamServer.get('/json', async (_, reply) => reply.send(json))
  await t.upstreamServer.ready()
  await t.upstreamServer.listen(12345)
})

test.after(async t => {
  await t.upstreamServer.close()
})

test.before.each(t => {
  t.server = Fastify()
})

test.after.each(async t => {
  await t.server.close()
})

test('can set up a proxy using to/from', async t => {
  await t.server.register(plugin, { from: '/foo', to: 'http://localhost:12345/json' })
  const res = await t.server.inject().get('/foo')
  assert.ok(res.headers['content-type'].includes('application/json'))
  assert.is(res.body, JSON.stringify(json))
})

test('can set up a proxy using native options', async t => {
  await t.server.register(plugin, { prefix: '/foo', upstream: 'http://localhost:12345', rewritePrefix: '/json' })
  const res = await t.server.inject().get('/foo')
  assert.ok(res.headers['content-type'].includes('application/json'))
  assert.is(res.body, JSON.stringify(json))
})

test('can mix options', async t => {
  await t.server.register(plugin, { from: '/foo', to: 'http://localhost:12345/whoops', rewritePrefix: '/json' })
  const res = await t.server.inject().get('/foo')
  assert.ok(res.headers['content-type'].includes('application/json'))
  assert.is(res.body, JSON.stringify(json))
})

test.run()
