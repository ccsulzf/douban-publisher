import assert from 'node:assert/strict'
import test from 'node:test'

import { applyToolbarFormat, insertSoftBreak } from '../scripts/editor-toolbar.mjs'

test('clicks Douban toolbar buttons for non-Markdown formats', async () => {
  const calls = []
  const page = {
    locator(selector) {
      calls.push(`locator:${selector}`)
      return {
        first: () => ({
          count: async () => 1,
          isVisible: async () => true,
          click: async () => calls.push(`click:${selector}`),
          evaluate: async (callback) => callback({ click: () => calls.push(`native:${selector}`) }),
        }),
      }
    },
  }

  await applyToolbarFormat(page, 'highlight')
  await applyToolbarFormat(page, 'align_center')
  await applyToolbarFormat(page, 'block_highlight')
  await applyToolbarFormat(page, 'divider')

  assert.deepEqual(calls, [
    'locator:.DRE-highlight-button', 'native:.DRE-highlight-button',
    'locator:.DRE-align-center-button', 'native:.DRE-align-center-button',
    'locator:.DRE-highlight-block-button', 'native:.DRE-highlight-block-button',
    'locator:.DRE-splitor-button', 'native:.DRE-splitor-button',
  ])
})

test('uses Shift+Enter for a soft return', async () => {
  const calls = []
  await insertSoftBreak({ press: async (key) => calls.push(key) })
  assert.deepEqual(calls, ['Shift+Enter'])
})

test('rejects unsupported toolbar formats', async () => {
  await assert.rejects(() => applyToolbarFormat({}, 'subject_card'), /unsupported/i)
})

test('maps every supported direct-editor format without subject or link buttons', async () => {
  const calls = []
  const page = {
    locator(selector) {
      return { first: () => ({ count: async () => 1, isVisible: async () => true, evaluate: async (callback) => callback({ click: () => calls.push(selector) }) }) }
    },
  }

  for (const format of ['heading', 'bold', 'strikethrough', 'ordered_list', 'unordered_list', 'quote']) {
    await applyToolbarFormat(page, format)
  }

  assert.deepEqual(calls, [
    '.DRE-heading-button',
    '.DRE-bold-button',
    '.DRE-strikethrough-button',
    '.DRE-ordered-list-button',
    '.DRE-unordered-list-button',
    '.DRE-quote-button',
  ])
})
