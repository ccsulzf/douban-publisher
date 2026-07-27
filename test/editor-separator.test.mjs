import assert from 'node:assert/strict'
import test from 'node:test'

import { separateBlocks } from '../scripts/editor-separator.mjs'

test('separates adjacent editor blocks with a soft line break', async () => {
  const calls = []
  await separateBlocks({ press: async (key) => calls.push(key) })

  assert.deepEqual(calls, ['Shift+Enter'])
})
