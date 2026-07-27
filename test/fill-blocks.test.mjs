import assert from 'node:assert/strict'
import test from 'node:test'

import { fillBlocks } from '../scripts/fill-blocks.mjs'

test('keeps image blocks between surrounding text blocks', async () => {
  const calls = []
  await fillBlocks({
    blocks: [
      { type: 'paragraph', text: '第一段' },
      { type: 'image', path: 'materials/images/room.jpg' },
      { type: 'paragraph', text: '第二段' },
    ],
    writeText: async (text) => calls.push(`text:${text}`),
    insertImage: async (block) => calls.push(`image:${block.path}`),
    separator: async () => calls.push('separator'),
  })

  assert.deepEqual(calls, [
    'text:第一段',
    'separator',
    'image:materials/images/room.jpg',
    'separator',
    'text:第二段',
  ])
})

test('writes a failure placeholder and continues after an image upload error', async () => {
  const calls = []
  await fillBlocks({
    blocks: [
      { type: 'image', path: 'materials/images/missing.jpg' },
      { type: 'paragraph', text: '后续文字' },
    ],
    writeText: async (text) => calls.push(`text:${text}`),
    insertImage: async () => { throw new Error('upload failed') },
    separator: async () => calls.push('separator'),
  })

  assert.deepEqual(calls, [
    'text:【图片上传失败：missing.jpg】',
    'separator',
    'text:后续文字',
  ])
})

test('passes the complete image block to the image insertion callback', async () => {
  const calls = []
  await fillBlocks({
    blocks: [{ type: 'image', path: 'materials/images/room.jpg', description: '客厅采光' }],
    writeText: async () => {},
    insertImage: async (block) => calls.push(block),
    separator: async () => {},
  })

  assert.deepEqual(calls, [{
    type: 'image',
    path: 'materials/images/room.jpg',
    description: '客厅采光',
  }])
})

test('inserts a divider through its dedicated callback', async () => {
  const calls = []
  await fillBlocks({
    blocks: [{ type: 'divider' }],
    writeText: async () => {},
    insertImage: async () => {},
    insertDivider: async () => calls.push('divider'),
    separator: async () => {},
  })

  assert.deepEqual(calls, ['divider'])
})
