import assert from 'node:assert/strict'
import test from 'node:test'

import { isUploadComplete } from '../scripts/upload-readiness.mjs'

test('an editor image is ready only after it appears and the upload indicator is gone', () => {
  assert.equal(isUploadComplete({ imageCount: 1, previousCount: 0, hasUploadingIndicator: true }), false)
  assert.equal(isUploadComplete({ imageCount: 0, previousCount: 0, hasUploadingIndicator: false }), false)
  assert.equal(isUploadComplete({ imageCount: 1, previousCount: 0, hasUploadingIndicator: false }), true)
})
