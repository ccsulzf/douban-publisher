import assert from 'node:assert/strict'
import test from 'node:test'

import { canonicalText, comparableText } from '../scripts/text.mjs'

test('treats a plain-text quote marker and a rich-text blockquote as equivalent', () => {
  assert.equal(canonicalText('> 先核实房东身份。'), canonicalText('先核实房东身份。'))
})

test('ignores the editor-only image description prompt during readback', () => {
  assert.equal(
    canonicalText('第一段\n\n添加描述（选填）\n\n第二段'),
    canonicalText('第一段\n\n第二段'),
  )
})

test('compares editor text without treating soft line-break storage as content', () => {
  assert.equal(
    comparableText('第一段\n\n第二段'),
    comparableText('第一段第二段'),
  )
})
