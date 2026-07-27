import assert from 'node:assert/strict'
import test from 'node:test'

import { EDITOR_SELECTORS, TITLE_SELECTORS } from '../scripts/selectors.mjs'

test("recognizes Douban's textarea title field", () => {
  assert.ok(TITLE_SELECTORS.includes('textarea[placeholder*="标题"]'))
})

test('recognizes the Douban rich-text editor root', () => {
  assert.ok(EDITOR_SELECTORS.includes('div.DRE-inputor.DRE-root[contenteditable="true"]'))
})
