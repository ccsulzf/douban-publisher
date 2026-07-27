import assert from 'node:assert/strict'
import test from 'node:test'

import { FORM_READY_TIMEOUT_MS, isFormReady } from '../scripts/readiness.mjs'

test('does not treat a loading page as ready until both fields exist', () => {
  assert.equal(isFormReady({ hasTitle: true, hasEditor: false }), false)
  assert.equal(isFormReady({ hasTitle: false, hasEditor: true }), false)
  assert.equal(isFormReady({ hasTitle: true, hasEditor: true }), true)
})

test('allows sufficient time for the Douban editor to finish loading', () => {
  assert.equal(FORM_READY_TIMEOUT_MS, 20_000)
})
