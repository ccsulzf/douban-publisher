import assert from 'node:assert/strict'
import test from 'node:test'

import { resolvePostFileName } from '../scripts/post-source.mjs'

test('uses a city-specific post when one exists', () => {
  assert.equal(
    resolvePostFileName('nanjing', new Set(['post.json', 'nanjing-post.json'])),
    'nanjing-post.json',
  )
})

test('falls back to the default post when no city-specific post exists', () => {
  assert.equal(
    resolvePostFileName('wuhan', new Set(['post.json'])),
    'post.json',
  )
})
