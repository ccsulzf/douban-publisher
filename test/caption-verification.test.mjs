import assert from 'node:assert/strict'
import test from 'node:test'

import { hasExpectedImageDescriptions } from '../scripts/caption-verification.mjs'

test('accepts image descriptions regardless of Douban image-node ordering', () => {
  assert.equal(hasExpectedImageDescriptions(
    ['卧室采光', '客餐厅采光'],
    [{ description: '客餐厅采光' }, { description: '卧室采光' }],
  ), true)
})

test('rejects a missing image description', () => {
  assert.equal(hasExpectedImageDescriptions(
    ['卧室采光'],
    [{ description: '客餐厅采光' }, { description: '卧室采光' }],
  ), false)
})
