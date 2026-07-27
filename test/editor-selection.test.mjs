import assert from 'node:assert/strict'
import test from 'node:test'

import { selectCurrentLine, selectExactText } from '../scripts/editor-selection.mjs'

test('selects the current editor line on macOS', async () => {
  const calls = []
  await selectCurrentLine({ press: async (key) => calls.push(key) }, 'darwin')
  assert.deepEqual(calls, ['Meta+Shift+ArrowLeft'])
})

test('selects the current editor line on other platforms', async () => {
  const calls = []
  await selectCurrentLine({ press: async (key) => calls.push(key) }, 'linux')
  assert.deepEqual(calls, ['Control+Shift+ArrowLeft'])
})

test('selects an exact text range in the editor before applying a toolbar format', async () => {
  const calls = []
  const editor = {
    evaluate: async (_callback, value) => {
      calls.push(value)
      return true
    },
  }

  await selectExactText(editor, '加粗测试')
  assert.deepEqual(calls, ['加粗测试'])
})
