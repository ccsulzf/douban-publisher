# Markdown-First Toolbar Mapping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable every supported Douban rich-text formatting feature through Markdown where the editor parses it and toolbar actions where it does not.

**Architecture:** `post.mjs` validates semantic blocks and renders Markdown-compatible content. A new toolbar helper maps only non-Markdown actions to their Douban button selectors. `fill-blocks.mjs` dispatches text, divider, and image blocks while `fill-douban.mjs` performs rich-editor actions without publishing.

**Tech Stack:** Node.js ESM, Playwright CDP, Node built-in test runner.

## Global Constraints

- Never click the publish button.
- Do not implement “添加条目” or “条目卡片”.
- Use Markdown only for confirmed syntax: heading, bold, strikethrough, ordered/unordered list, quote, and link.
- Use toolbar buttons for highlight, centered text, block highlight, divider, and soft return.
- Do not run package-manager install, lint, or type-check commands.

---

### Task 1: Extend and validate post blocks

**Files:**
- Modify: `scripts/post.mjs`
- Modify: `test/post.test.mjs`

**Interfaces:**
- Produces `normalizePost(value)` blocks for `ordered_list`, `unordered_list`, `divider`, and styled `paragraph` blocks.
- Produces `renderPlainText(post)` Markdown for compatible blocks.

- [ ] **Step 1: Write failing normalization tests**

```js
assert.deepEqual(normalizePost({ title: 'x', blocks: [
  { type: 'ordered_list', items: ['第一项', '第二项'] },
  { type: 'divider' },
  { type: 'paragraph', text: '重点', highlight: true, align: 'center' },
] }).blocks, [
  { type: 'ordered_list', items: ['第一项', '第二项'] },
  { type: 'divider' },
  { type: 'paragraph', text: '重点', highlight: true, align: 'center' },
])
```

- [ ] **Step 2: Run the focused test**

Run: `node --test test/post.test.mjs`

Expected: FAIL because the new block types are unsupported.

- [ ] **Step 3: Implement normalization and Markdown rendering**

```js
const BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'quote', 'link', 'image',
  'ordered_list', 'unordered_list', 'divider',
])

function requiredItems(value, field) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${field} must contain text`)
  return value.map((item, index) => requiredText(item, `${field} ${index + 1}`))
}
```

Render compatible blocks as `# text`, `**text**`, `~~text~~`, `1. item`, `- item`, `> text`, and `[text](url)`; preserve special-format metadata for toolbar application.

- [ ] **Step 4: Run focused tests**

Run: `node --test test/post.test.mjs`

Expected: PASS.

### Task 2: Add isolated toolbar operations

**Files:**
- Create: `scripts/editor-toolbar.mjs`
- Create: `test/editor-toolbar.test.mjs`

**Interfaces:**
- Produces `applyToolbarFormat(page, locator, format)` where `format` is `highlight`, `align_center`, `block_highlight`, or `divider`.
- Produces `insertSoftBreak(locator)`.

- [ ] **Step 1: Write failing toolbar selector tests**

```js
await applyToolbarFormat(page, editor, 'highlight')
assert.deepEqual(calls, ['click:.DRE-highlight-button'])
```

- [ ] **Step 2: Run the focused test**

Run: `node --test test/editor-toolbar.test.mjs`

Expected: FAIL because `editor-toolbar.mjs` does not exist.

- [ ] **Step 3: Implement exact button mapping**

```js
const TOOLBAR_SELECTORS = {
  highlight: '.DRE-highlight-button',
  align_center: '.DRE-align-center-button',
  block_highlight: '.DRE-highlight-block-button',
  divider: '.DRE-splitor-button',
}

export async function insertSoftBreak(locator) {
  await locator.press('Shift+Enter')
}
```

Locate the requested toolbar selector on `page`, require visibility, then click it. Do not include subject-item selectors.

- [ ] **Step 4: Run focused tests**

Run: `node --test test/editor-toolbar.test.mjs`

Expected: PASS.

### Task 3: Dispatch Markdown and special blocks

**Files:**
- Modify: `scripts/fill-blocks.mjs`
- Modify: `scripts/fill-douban.mjs`
- Modify: `test/fill-blocks.test.mjs`

**Interfaces:**
- `fillBlocks({ blocks, writeText, insertImage, insertDivider, separator })` calls `insertDivider()` for divider blocks and retains image failure handling.
- `setRichText(page, locator, blocks)` writes compatible Markdown and invokes toolbar helpers only for special formatting.

- [ ] **Step 1: Write failing dispatch tests**

```js
await fillBlocks({
  blocks: [{ type: 'divider' }],
  writeText: async () => {}, insertImage: async () => {},
  insertDivider: async () => calls.push('divider'), separator: async () => {},
})
assert.deepEqual(calls, ['divider'])
```

- [ ] **Step 2: Run focused test**

Run: `node --test test/fill-blocks.test.mjs`

Expected: FAIL because divider blocks are sent to `writeText`.

- [ ] **Step 3: Implement dispatch and formatting order**

Write Markdown-compatible content through `writeEditorBlock`. For a paragraph, write soft-break segments with `insertSoftBreak`; after the block text exists, apply `block_highlight`, `align_center`, and `highlight` if requested. Insert divider blocks exclusively through `applyToolbarFormat(page, locator, 'divider')`.

- [ ] **Step 4: Run focused tests**

Run: `node --test test/fill-blocks.test.mjs test/editor-toolbar.test.mjs`

Expected: PASS.

### Task 4: Update format documentation and verify the full suite

**Files:**
- Modify: `README.md`
- Modify: `output/post.json`

- [ ] **Step 1: Document the supported JSON examples**

```json
{ "type": "paragraph", "text": "重点", "highlight": true, "align": "center" }
{ "type": "unordered_list", "items": ["第一项", "第二项"] }
{ "type": "divider" }
```

- [ ] **Step 2: Add a representative sample to `output/post.json`**

Use one list, one special formatted paragraph, and one divider without adding subject blocks.

- [ ] **Step 3: Run all tests**

Run: `node --test`

Expected: PASS with all existing and newly added tests.

- [ ] **Step 4: Run a non-publishing browser verification**

Run: `npm run fill`

Expected: script reports a filled preview and does not click the publish button.
