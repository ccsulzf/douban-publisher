import assert from 'node:assert/strict'
import test from 'node:test'

import { dismissDialogSafely } from '../scripts/dialog.mjs'

test('absorbs a dialog that has already disappeared during CDP teardown', async () => {
  await assert.doesNotReject(() => dismissDialogSafely({ dismiss: async () => { throw new Error('No dialog is showing') } }))
})
