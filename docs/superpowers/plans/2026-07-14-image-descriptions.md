# Image Descriptions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill an optional Douban caption for each uploaded image block.

**Architecture:** `post.mjs` normalizes optional image descriptions and includes them in plain-text verification. `fill-blocks.mjs` passes the complete image block to the browser upload callback. `fill-douban.mjs` uploads the image, scopes to its newly inserted `.DRE-image`, clicks the caption placeholder, and fills the textarea created by Douban.

**Tech Stack:** Node.js ESM, node:test, Playwright over CDP.

## Global Constraints

- Do not publish posts or change dependency state.
- `description` is optional; empty or whitespace-only values are omitted.
- Captions are at most 300 characters, matching Douban's textarea limit.

---

### Task 1: Normalize and propagate image descriptions

**Files:**
- Modify: `scripts/post.mjs`
- Modify: `scripts/fill-blocks.mjs`
- Test: `test/post.test.mjs`
- Test: `test/fill-blocks.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
assert.deepEqual(post.blocks[0], {
  type: 'image', path: 'materials/images/room.jpg', description: '客厅采光',
})
assert.equal(renderPlainText(post), '客厅采光')
```

```js
insertImage: async (block) => calls.push(`image:${block.path}:${block.description}`)
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test test/post.test.mjs test/fill-blocks.test.mjs`

- [ ] **Step 3: Implement the minimal data-flow change**

```js
const description = typeof block.description === 'string' && block.description.trim()
  ? block.description.trim()
  : undefined
return { type: 'image', path: imagePath, ...(description ? { description } : {}) }
```

Pass `block` rather than `block.path` to `insertImage`, and render a present image description as visible plain text.

- [ ] **Step 4: Re-run the focused tests and verify success**

Run: `node --test test/post.test.mjs test/fill-blocks.test.mjs`

### Task 2: Fill the image-node textarea after upload

**Files:**
- Modify: `scripts/fill-douban.mjs`
- Create: `scripts/image-description.mjs`
- Test: `test/image-description.test.mjs`

- [ ] **Step 1: Write a failing helper test**

```js
await fillImageDescription(imageNode, '客厅采光')
assert.deepEqual(calls, [
  'locator:.DRE-caption-input-placeholder.empty',
  'click',
  'locator:textarea.DRE-input[placeholder="添加描述（选填）"]',
  'fill:客厅采光',
])
```

- [ ] **Step 2: Run the helper test and verify failure**

Run: `node --test test/image-description.test.mjs`

- [ ] **Step 3: Implement the scoped caption helper and call it**

```js
export async function fillImageDescription(imageNode, description) {
  if (!description) return
  await imageNode.locator('.DRE-caption-input-placeholder.empty').click()
  await imageNode.locator('textarea.DRE-input[placeholder="添加描述（选填）"]').fill(description)
}
```

After `waitForUploadedImage`, obtain `editor.locator('.DRE-image').last()` and call the helper with `block.description`.

- [ ] **Step 4: Run all tests**

Run: `node --test`
Expected: all tests pass.
