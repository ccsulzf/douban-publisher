import assert from 'node:assert/strict'
import test from 'node:test'

import { fillImageDescription, fillImageDescriptions, fillImageDescriptionsBySource } from '../scripts/image-description.mjs'

test('clicks the image caption placeholder then fills its textarea', async () => {
  const calls = []
  const textarea = {
    fill: async (value) => calls.push(`fill:${value}`),
  }
  const placeholder = {
    click: async () => calls.push('click'),
  }
  const imageNode = {
    locator: (selector) => {
      calls.push(`locator:${selector}`)
      return selector.startsWith('textarea') ? textarea : placeholder
    },
  }

  await fillImageDescription(imageNode, '客厅采光')

  assert.deepEqual(calls, [
    'locator:.DRE-caption-input-placeholder.empty',
    'click',
    'locator:textarea.DRE-input[placeholder="添加描述（选填）"]',
    'fill:客厅采光',
  ])
})

test('does not open an image caption textarea without a description', async () => {
  const imageNode = {
    locator: () => { throw new Error('caption locator should not be used') },
  }

  await fillImageDescription(imageNode, undefined)
})

test('fills captions in reverse DOM order after all images have uploaded', async () => {
  const calls = []
  const imageNodes = {
    count: async () => 3,
    nth: (index) => ({
    locator: (selector) => {
      calls.push(`node:${index}:${selector}`)
      return selector.startsWith('textarea')
        ? { fill: async (value) => calls.push(`fill:${index}:${value}`) }
        : { click: async () => calls.push(`click:${index}`) }
    },
    }),
  }

  await fillImageDescriptions(imageNodes, [
    { path: 'one.jpg', description: '第一张图' },
    { path: 'two.jpg' },
    { path: 'three.jpg', description: '第三张图' },
  ])

  assert.deepEqual(calls, [
    'node:0:.DRE-caption-input-placeholder.empty',
    'click:0',
    'node:0:textarea.DRE-input[placeholder="添加描述（选填）"]',
    'fill:0:第三张图',
    'node:2:.DRE-caption-input-placeholder.empty',
    'click:2',
    'node:2:textarea.DRE-input[placeholder="添加描述（选填）"]',
    'fill:2:第一张图',
  ])
})

test('rejects caption filling when uploaded image count differs from image blocks', async () => {
  await assert.rejects(
    () => fillImageDescriptions({ count: async () => 2 }, [{ path: 'one.jpg' }]),
    /image node count/i,
  )
})

test('fills each caption by the uploaded image URL rather than DOM position', async () => {
  const calls = []
  const imageNodes = {
    count: async () => 2,
    nth: (index) => ({
      locator: (selector) => {
        if (selector === 'img') return { getAttribute: async () => index === 0 ? 'https://douban/second.jpg' : 'https://douban/first.jpg' }
        return selector.startsWith('textarea')
          ? { fill: async (value) => calls.push(`fill:${index}:${value}`) }
          : { click: async () => calls.push(`click:${index}`) }
      },
    }),
  }

  await fillImageDescriptionsBySource(imageNodes, new Map([
    ['https://douban/first.jpg', '第一张图'],
    ['https://douban/second.jpg', '第二张图'],
  ]))

  assert.deepEqual(calls, [
    'click:0',
    'fill:0:第二张图',
    'click:1',
    'fill:1:第一张图',
  ])
})
