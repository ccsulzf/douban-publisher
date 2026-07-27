import assert from 'node:assert/strict'
import test from 'node:test'

import { writeEditorBlock } from '../scripts/editor-writer.mjs'

test('types heading text without Markdown syntax', async () => {
  const calls = []
  const editor = {
    async press(key) { calls.push(`press:${key}`) },
    async pressSequentially(text) { calls.push(`type:${text}`) },
  }

  await writeEditorBlock(editor, { type: 'heading', text: '房屋情况' })

  assert.deepEqual(calls, [
    'type:房屋情况',
  ])
})

test('writes each list item as a separate editor line', async () => {
  const calls = []
  const editor = {
    async press(key) { calls.push(`press:${key}`) },
    async pressSequentially(text) { calls.push(`type:${text}`) },
  }

  await writeEditorBlock(editor, { type: 'unordered_list', items: ['甲', '乙'] })

  assert.deepEqual(calls, ['type:甲', 'press:Enter', 'type:乙'])
})

test('writes soft-break segments within one paragraph', async () => {
  const calls = []
  const editor = {
    async press(key) { calls.push(`press:${key}`) },
    async pressSequentially(text) { calls.push(`type:${text}`) },
  }

  await writeEditorBlock(editor, { type: 'paragraph', text: '第一行', soft_breaks: ['第二行'] })

  assert.deepEqual(calls, ['type:第一行', 'press:Shift+Enter', 'type:第二行'])
})
