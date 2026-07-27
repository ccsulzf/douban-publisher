# Zhengzhou Rental Personal Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Zhengzhou-specific Douban rental post with a personal-sharing tone, contextually placed mini-program screenshots, and prefill it without publishing.

**Architecture:** Store the city-specific article in `output/zhengzhou-post.json` so the existing city resolver selects it without changing other posts. Validate the JSON through the existing normalization code, verify every local image path and block order, then run the existing Playwright prefill flow for the configured Zhengzhou group.

**Tech Stack:** JSON, Node.js 20+, existing `post.mjs` normalization/rendering, existing Playwright-based Douban prefill scripts.

## Global Constraints

- Do not run package-manager commands or modify dependencies.
- Do not overwrite another city's post file.
- The title must be `郑州租房：真正住进去以后，每天面对的都是这些小事`.
- Use a natural personal-reflection tone without inventing a specific listing, rent, contact detail, or incident.
- Every selected screenshot must immediately follow the paragraph it illustrates.
- Do not click Douban's publish button; leave the filled page open for human review.

---

### Task 1: Create and validate the Zhengzhou post

**Files:**
- Create: `output/zhengzhou-post.json`
- Reference: `docs/superpowers/specs/2026-07-27-zhengzhou-rental-personal-post-design.md`

**Interfaces:**
- Consumes: `normalizePost(value)` and `renderPlainText(post)` from `scripts/post.mjs`.
- Produces: a normalized post object selected by `resolvePostFileName('zhengzhou', files)`.

- [ ] **Step 1: Write the city-specific article**

Create a JSON object whose block flow is exactly:

```text
intro paragraphs
宣传图.jpg
费用与基本条件 paragraph
房屋基本情况-费用信息.jpg
房间实际体验 paragraph
房屋总揽-第一屏.jpg
房屋总揽-第二屏.jpg
房屋基本情况.jpg
公区 paragraph
公区检查.jpg
通勤 paragraph
目的地编辑.jpg
目的地列表.jpg
通勤方式.jpg
通勤-公交方案详情.jpg
生活半径 paragraph
周边.jpg
房源取舍 paragraph
房源对比-房屋.jpg
房源对比-公区.jpg
房源对比-周边.jpg
房源对比通勤.jpg
closing paragraph
小程序码.jpg
```

Use short headings to separate the five daily-life themes. Each image block must include a concise Chinese `description` matching the visible feature.

- [ ] **Step 2: Validate schema, title, images, and copy boundaries**

Run from `douban-publisher/`:

```bash
node --input-type=module -e "import {readFile,access} from 'node:fs/promises'; import {normalizePost,renderPlainText} from './scripts/post.mjs'; const post=normalizePost(JSON.parse(await readFile('./output/zhengzhou-post.json','utf8'))); if(!post.title.includes('郑州')) throw new Error('title missing 郑州'); for(const block of post.blocks.filter(b=>b.type==='image')) await access(block.path); const text=renderPlainText(post); for(const term of ['微信号','手机号','元/月']) if(text.includes(term)) throw new Error('unexpected claim: '+term); console.log(JSON.stringify({title:post.title,blocks:post.blocks.length,images:post.blocks.filter(b=>b.type==='image').length,textLength:text.length}))"
```

Expected: one JSON summary, 16 images, and no exception.

- [ ] **Step 3: Run focused regression tests for post and city selection**

Run from `douban-publisher/`:

```bash
node --test test/post.test.mjs test/post-source.test.mjs test/groups.test.mjs test/image-path.test.mjs
```

Expected: all focused tests pass without installing or changing dependencies.

### Task 2: Prefill and verify the Zhengzhou Douban draft

**Files:**
- Read: `output/zhengzhou-post.json`
- Read: `config/groups.json`
- Create/update at runtime: `output/preview-zhengzhou-1.png`
- Create on failure only: `output/page-inspection-zhengzhou-1.json`

**Interfaces:**
- Consumes: the city-specific post from Task 1 and configured Zhengzhou `new_topic` URL.
- Produces: one open browser page containing the filled title, rich text, and images, plus a preview screenshot.

- [ ] **Step 1: Run the existing prefill flow directly with Node**

Run from `douban-publisher/` without a package manager:

```bash
node scripts/fill-douban.mjs --city zhengzhou
```

Expected: the tool connects to or launches the dedicated Chrome profile, opens the configured Zhengzhou group, fills one page, and logs that no publish action was taken.

- [ ] **Step 2: Verify the generated preview artifact**

Run from `douban-publisher/`:

```bash
test -s output/preview-zhengzhou-1.png
```

Expected: exit code 0. Inspect the screenshot to confirm the title contains “郑州” and the screenshot groups appear after their matching paragraphs.

- [ ] **Step 3: Leave the browser open for manual review**

Do not click or script any publish action. Report any login, captcha, group-rule, upload, or rich-text verification failure using `output/page-inspection-zhengzhou-1.json` when available.

## Plan Self-Review

- Spec coverage: title, personal-sharing tone, exact image placement, city-specific output, validation, preview artifact, and no-publish boundary are all assigned to a task.
- Placeholder scan: no deferred content or unspecified validation remains.
- Interface consistency: `zhengzhou-post.json` is the same filename consumed by the existing city resolver and prefill flow.
