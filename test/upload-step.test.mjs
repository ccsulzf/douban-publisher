import assert from 'node:assert/strict'
import test from 'node:test'

import { waitForUploadStep } from '../scripts/upload-step.mjs'

test('selects the upload mode when it becomes available', async () => {
  let checks = 0
  const step = await waitForUploadStep({
    previousImageCount: 0,
    getImageCount: async () => 0,
    isModeVisible: async () => ++checks === 2,
    wait: async () => {},
    timeoutMs: 100,
    intervalMs: 0,
  })

  assert.equal(step, 'confirm')
})

test('accepts a later upload that Douban inserts with the previous mode', async () => {
  let checks = 0
  const step = await waitForUploadStep({
    previousImageCount: 1,
    getImageCount: async () => ++checks === 2 ? 2 : 1,
    isModeVisible: async () => false,
    wait: async () => {},
    timeoutMs: 100,
    intervalMs: 0,
  })

  assert.equal(step, 'inserted')
})
