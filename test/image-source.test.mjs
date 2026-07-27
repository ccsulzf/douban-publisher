import assert from 'node:assert/strict'
import test from 'node:test'

import { areImageNodesReady, findNewImageSource } from '../scripts/image-source.mjs'

test('finds the newly inserted image source without relying on DOM position', () => {
  assert.equal(
    findNewImageSource(new Set(['first.jpg', 'second.jpg']), ['third.jpg', 'second.jpg', 'first.jpg']),
    'third.jpg',
  )
})

test('returns null until a new image source appears', () => {
  assert.equal(findNewImageSource(new Set(['first.jpg']), ['first.jpg']), null)
})

test('recognizes when every expected image node is available without waiting for remote URLs', () => {
  assert.equal(areImageNodesReady({
    expectedCount: 3,
    imageCount: 3,
  }), true)
  assert.equal(areImageNodesReady({
    expectedCount: 3,
    imageCount: 2,
  }), false)
  assert.equal(areImageNodesReady({
    expectedCount: 3,
    imageCount: 3,
    hasUploadingIndicator: true,
  }), false)
})
