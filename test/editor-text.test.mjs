import assert from 'node:assert/strict'
import test from 'node:test'

import { editableBlockText } from '../scripts/editor-text.mjs'

test('keeps editor content as plain text before toolbar formatting', () => {
  assert.equal(
    editableBlockText({ type: 'link', text: '武汉租房小组', url: 'https://www.douban.com/group/551383/' }),
    '武汉租房小组',
  )
  assert.equal(editableBlockText({ type: 'heading', text: '房屋情况' }), '房屋情况')
  assert.equal(editableBlockText({ type: 'quote', text: '核实身份' }), '核实身份')
  assert.equal(editableBlockText({ type: 'paragraph', text: '重点', bold: true, strikethrough: true }), '重点')
})

test('joins list items without Markdown markers for direct editor insertion', () => {
  assert.equal(
    editableBlockText({ type: 'ordered_list', items: ['第一项', '第二项'] }),
    '第一项\n第二项',
  )
  assert.equal(
    editableBlockText({ type: 'unordered_list', items: ['第一项', '第二项'] }),
    '第一项\n第二项',
  )
})
