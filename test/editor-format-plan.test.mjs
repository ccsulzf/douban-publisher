import assert from 'node:assert/strict'
import test from 'node:test'

import { applyDeferredFormats, formatsForBlock } from '../scripts/editor-format-plan.mjs'

test('maps text blocks to toolbar formats after their text has been inserted', () => {
  assert.deepEqual(formatsForBlock({ type: 'heading', text: '标题' }), ['heading'])
  assert.deepEqual(formatsForBlock({ type: 'ordered_list', items: ['一', '二'] }), ['ordered_list'])
  assert.deepEqual(formatsForBlock({ type: 'quote', text: '引用' }), ['quote'])
  assert.deepEqual(formatsForBlock({ type: 'paragraph', text: '正文', bold: true }), ['bold'])
})

test('selects every list item before applying its list button', async () => {
  const calls = []
  await applyDeferredFormats({
    editor: 'editor',
    page: 'page',
    blocks: [
      { type: 'paragraph', text: '第一段', bold: true },
      { type: 'ordered_list', items: ['第一项', '第二项'] },
      { type: 'quote', text: '引用文字' },
    ],
    selectText: async (_editor, text) => calls.push(`select:${text}`),
    applyFormat: async (_page, format) => calls.push(`format:${format}`),
  })

  assert.deepEqual(calls, [
    'select:第一段', 'format:bold',
    'select:第一项', 'format:ordered_list',
    'select:第二项', 'format:ordered_list',
    'select:引用文字', 'format:quote',
  ])
})
