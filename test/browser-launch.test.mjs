import assert from 'node:assert/strict'
import test from 'node:test'

import { chromeLaunchArguments, connectOrLaunchChrome } from '../scripts/browser-launch.mjs'

test('builds macOS Chrome arguments for the local CDP port and persistent profile', () => {
  assert.deepEqual(
    chromeLaunchArguments({ port: '9333', profileDir: '/tmp/douban-profile' }),
    [
      '-na',
      'Google Chrome',
      '--args',
      '--remote-debugging-port=9333',
      '--user-data-dir=/tmp/douban-profile',
    ],
  )
})

test('launches Chrome and reconnects when the local CDP endpoint refuses connections', async () => {
  const calls = []
  const chromium = {
    async connectOverCDP() {
      calls.push('connect')
      if (calls.filter((call) => call === 'connect').length === 1) {
        const error = new Error('connect ECONNREFUSED 127.0.0.1:9222')
        error.code = 'ECONNREFUSED'
        throw error
      }
      return 'browser'
    },
  }

  const browser = await connectOrLaunchChrome({
    chromium,
    endpoint: 'http://127.0.0.1:9222',
    connectOptions: {},
    launch: async () => calls.push('launch'),
    waitForReady: async () => calls.push('wait'),
  })

  assert.equal(browser, 'browser')
  assert.deepEqual(calls, ['connect', 'launch', 'wait', 'connect'])
})

test('does not launch Chrome when the initial CDP connection succeeds', async () => {
  let launched = false
  const browser = await connectOrLaunchChrome({
    chromium: { connectOverCDP: async () => 'browser' },
    endpoint: 'http://127.0.0.1:9222',
    connectOptions: {},
    launch: async () => { launched = true },
    waitForReady: async () => {},
  })

  assert.equal(browser, 'browser')
  assert.equal(launched, false)
})

test('preserves connection errors other than a refused local endpoint', async () => {
  const error = new Error('invalid browser endpoint')
  await assert.rejects(
    connectOrLaunchChrome({
      chromium: { connectOverCDP: async () => { throw error } },
      endpoint: 'http://127.0.0.1:9222',
      connectOptions: {},
      launch: async () => assert.fail('must not launch'),
      waitForReady: async () => assert.fail('must not wait'),
    }),
    error,
  )
})
