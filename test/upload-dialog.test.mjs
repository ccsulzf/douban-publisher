import assert from 'node:assert/strict'
import test from 'node:test'

import { confirmImageUpload } from '../scripts/upload-dialog.mjs'

test('waits for the image upload dialog to close before continuing', async () => {
  const calls = []
  const confirmButton = {
    async click() { calls.push('click') },
    async waitFor(options) { calls.push(options) },
  }
  const page = {
    getByText(text, options) {
      assert.equal(text, '确定上传')
      assert.deepEqual(options, { exact: true })
      return { last: () => confirmButton }
    },
  }

  await confirmImageUpload(page)

  assert.deepEqual(calls, ['click', { state: 'hidden' }])
})
