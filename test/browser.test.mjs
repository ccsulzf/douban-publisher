import assert from 'node:assert/strict'
import test from 'node:test'

import { cdpConnectOptions, cdpEndpoint } from '../scripts/browser.mjs'

test('connects to the user-started local Chrome debugging endpoint by default', () => {
  assert.equal(cdpEndpoint({}), 'http://127.0.0.1:9222')
})

test('allows an explicit local CDP port without accepting a remote host', () => {
  assert.equal(cdpEndpoint({ DOUBAN_CDP_PORT: '9333' }), 'http://127.0.0.1:9333')
  assert.throws(() => cdpEndpoint({ DOUBAN_CDP_PORT: 'abc' }), /port/i)
})

test('does not apply Playwright context defaults to the user browser', () => {
  assert.deepEqual(cdpConnectOptions(), { noDefaults: true })
})
