import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizePost, renderEditorText, renderPlainText } from '../scripts/post.mjs'

test('renders ordered rich-text blocks as readable Douban plain text', () => {
  const post = normalizePost({
    title: '武汉租房经验分享',
    blocks: [
      { type: 'paragraph', text: '这是第一段。' },
      { type: 'heading', text: '看房建议' },
      { type: 'quote', text: '先核实房东身份。' },
      { type: 'paragraph', text: '武汉租房小组' },
    ],
  })

  assert.equal(
    renderPlainText(post),
    '这是第一段。\n\n看房建议\n\n> 先核实房东身份。\n\n武汉租房小组',
  )
})

test('rejects an empty title or a post without readable blocks', () => {
  assert.throws(() => normalizePost({ title: ' ', blocks: [{ type: 'paragraph', text: '正文' }] }), /title/i)
  assert.throws(() => normalizePost({ title: '标题', blocks: [] }), /block/i)
})

test('rejects unsupported rich-text blocks instead of silently changing meaning', () => {
  assert.throws(
    () => normalizePost({ title: '标题', blocks: [{ type: 'table', text: '不支持' }] }),
    /unsupported/i,
  )
})

test('rejects links because link-card insertion is not supported', () => {
  assert.throws(
    () => normalizePost({ title: '标题', blocks: [{ type: 'link', text: '链接', url: 'https://www.douban.com/' }] }),
    /unsupported/i,
  )
})

test('accepts image blocks without treating the path as editable text', () => {
  const post = normalizePost({
    title: '带图文章',
    blocks: [
      { type: 'paragraph', text: '图片前的文字。' },
      { type: 'image', path: 'materials/images/room.jpg' },
      { type: 'paragraph', text: '图片后的文字。' },
    ],
  })

  assert.equal(post.blocks[1].path, 'materials/images/room.jpg')
  assert.equal(renderPlainText(post), '图片前的文字。\n\n图片后的文字。')
})

test('normalizes an optional image description as visible image text', () => {
  const post = normalizePost({
    title: '带图文章',
    blocks: [{ type: 'image', path: 'materials/images/room.jpg', description: ' 客厅采光 ' }],
  })

  assert.deepEqual(post.blocks[0], {
    type: 'image',
    path: 'materials/images/room.jpg',
    description: '客厅采光',
  })
  assert.equal(renderPlainText(post), '客厅采光')
})

test('omits a blank optional image description', () => {
  const post = normalizePost({
    title: '带图文章',
    blocks: [{ type: 'image', path: 'materials/images/room.jpg', description: '   ' }],
  })

  assert.deepEqual(post.blocks[0], { type: 'image', path: 'materials/images/room.jpg' })
})

test('normalizes list, divider, and toolbar-only paragraph formats', () => {
  const post = normalizePost({
    title: '格式测试',
    blocks: [
      { type: 'ordered_list', items: [' 第一项 ', '第二项'] },
      { type: 'unordered_list', items: ['甲', '乙'] },
      { type: 'divider' },
      {
        type: 'paragraph',
        text: '重点内容',
        bold: true,
        strikethrough: true,
        highlight: true,
        block_highlight: true,
        align: 'center',
        soft_breaks: ['第二行'],
      },
    ],
  })

  assert.deepEqual(post.blocks, [
    { type: 'ordered_list', items: ['第一项', '第二项'] },
    { type: 'unordered_list', items: ['甲', '乙'] },
    { type: 'divider' },
    {
      type: 'paragraph',
      text: '重点内容',
      bold: true,
      strikethrough: true,
      highlight: true,
      block_highlight: true,
      align: 'center',
      soft_breaks: ['第二行'],
    },
  ])
  assert.equal(
    renderPlainText(post),
    '1. 第一项\n2. 第二项\n\n- 甲\n- 乙\n\n重点内容\n第二行',
  )
})

test('rejects invalid list and paragraph formatting fields', () => {
  assert.throws(
    () => normalizePost({ title: 'x', blocks: [{ type: 'ordered_list', items: [] }] }),
    /items/i,
  )
  assert.throws(
    () => normalizePost({ title: 'x', blocks: [{ type: 'paragraph', text: 'x', align: 'left' }] }),
    /align/i,
  )
  assert.throws(
    () => normalizePost({ title: 'x', blocks: [{ type: 'paragraph', text: 'x', highlight: 'yes' }] }),
    /highlight/i,
  )
})

test('renders editor verification text without list-marker characters', () => {
  const post = normalizePost({
    title: '格式测试',
    blocks: [
      { type: 'ordered_list', items: ['第一项', '第二项'] },
      { type: 'unordered_list', items: ['甲', '乙'] },
    ],
  })

  assert.equal(renderEditorText(post), '第一项\n第二项\n\n甲\n乙')
})
