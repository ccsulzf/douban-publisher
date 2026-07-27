# Douban Publisher Repository Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the complete local `douban-publisher` tool to the empty public repository `ccsulzf/douban-publisher`, migrate the V2EX post into it, and replace all image placeholders with working GitHub Raw URLs.

**Architecture:** Treat `douban-publisher` as the standalone repository root. Keep reusable post JSON and public promotional source images tracked, keep runtime/browser artifacts ignored, and expose five ASCII-named V2EX assets under `docs/assets/v2ex/` so the Markdown uses stable `main`-branch Raw links.

**Tech Stack:** Node.js 20+, Playwright, Markdown, Git, GitHub Raw content.

## Global Constraints

- Do not run npm, pnpm, yarn, Corepack, or any dependency installation/repair command.
- Do not stage or modify the user's existing `rentTool-mini/src/pages/index/index-page.vue` or `rentTool-mini/src/uni-pages.d.ts` changes.
- Do not commit `node_modules`, preview screenshots, page-inspection JSON, `.env` files, browser state, cookies, sessions, tokens, or credentials.
- Do not force-push or overwrite remote history.
- The GitHub remote must be `https://github.com/ccsulzf/douban-publisher.git` and the published branch must be `main`.

---

### Task 1: Migrate the V2EX content and public image assets

**Files:**
- Move: `../rentTool-mini/docs/content/v2ex-rental-tool-post.md` → `content/v2ex-rental-tool-post.md`
- Move: `../rentTool-mini/docs/superpowers/specs/2026-07-27-v2ex-rental-tool-post-design.md` → `docs/superpowers/specs/2026-07-27-v2ex-rental-tool-post-design.md`
- Move: `../rentTool-mini/docs/superpowers/plans/2026-07-27-v2ex-rental-tool-post.md` → `docs/superpowers/plans/2026-07-27-v2ex-rental-tool-post.md`
- Create: `docs/assets/v2ex/overview.jpg`
- Create: `docs/assets/v2ex/room-inspection.jpg`
- Create: `docs/assets/v2ex/transit-detail.jpg`
- Create: `docs/assets/v2ex/commute-comparison.jpg`
- Create: `docs/assets/v2ex/mini-program-code.jpg`

**Interfaces:**
- Consumes: the existing V2EX Markdown and the five source images in `materials/images/`.
- Produces: one self-contained article and five stable public asset paths.

- [ ] **Step 1: Move the three V2EX text files into the standalone repository**

```bash
mkdir -p content docs/assets/v2ex
mv ../rentTool-mini/docs/content/v2ex-rental-tool-post.md content/v2ex-rental-tool-post.md
mv ../rentTool-mini/docs/superpowers/specs/2026-07-27-v2ex-rental-tool-post-design.md docs/superpowers/specs/2026-07-27-v2ex-rental-tool-post-design.md
mv ../rentTool-mini/docs/superpowers/plans/2026-07-27-v2ex-rental-tool-post.md docs/superpowers/plans/2026-07-27-v2ex-rental-tool-post.md
```

- [ ] **Step 2: Copy the five public images to ASCII-named V2EX asset paths**

```bash
cp materials/images/宣传图.jpg docs/assets/v2ex/overview.jpg
cp materials/images/房屋基本情况.jpg docs/assets/v2ex/room-inspection.jpg
cp materials/images/通勤-公交方案详情.jpg docs/assets/v2ex/transit-detail.jpg
cp materials/images/房源对比通勤.jpg docs/assets/v2ex/commute-comparison.jpg
cp materials/images/小程序码.jpg docs/assets/v2ex/mini-program-code.jpg
```

- [ ] **Step 3: Verify migration and binary identity**

```bash
test ! -e ../rentTool-mini/docs/content/v2ex-rental-tool-post.md
test -s content/v2ex-rental-tool-post.md
cmp materials/images/宣传图.jpg docs/assets/v2ex/overview.jpg
cmp materials/images/房屋基本情况.jpg docs/assets/v2ex/room-inspection.jpg
cmp materials/images/通勤-公交方案详情.jpg docs/assets/v2ex/transit-detail.jpg
cmp materials/images/房源对比通勤.jpg docs/assets/v2ex/commute-comparison.jpg
cmp materials/images/小程序码.jpg docs/assets/v2ex/mini-program-code.jpg
```

Expected: every command exits 0.

### Task 2: Make the repository safe and presentable for public use

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `content/v2ex-rental-tool-post.md`

**Interfaces:**
- Consumes: migrated article and assets from Task 1.
- Produces: public-repository documentation and stable Raw image references.

- [ ] **Step 1: Extend ignore rules**

Ensure `.gitignore` contains exactly the required protections in addition to current rules:

```gitignore
node_modules/
.DS_Store
.env
.env.*
!.env.example
output/preview*.png
output/page-inspection*.json
```

- [ ] **Step 2: Generalize the README**

Change the title to `豆瓣租房内容富文本预填工具`; describe the tool as city-generic; keep the existing `--city`, city-specific post JSON, image block, Node.js 20+, Playwright, login, captcha, and no-publish instructions accurate.

- [ ] **Step 3: Replace five placeholder image URLs**

Use these exact URLs in `content/v2ex-rental-tool-post.md`:

```text
https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/overview.jpg
https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/room-inspection.jpg
https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/transit-detail.jpg
https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/commute-comparison.jpg
https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/mini-program-code.jpg
```

- [ ] **Step 4: Verify content and ignore rules**

```bash
test "$(rg -c 'raw\.githubusercontent\.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/' content/v2ex-rental-tool-post.md)" -eq 5
! rg -n 'your-image-host\.example' content/v2ex-rental-tool-post.md
git check-ignore -q node_modules/playwright/package.json
git check-ignore -q output/preview-zhengzhou-1.png
git check-ignore -q output/page-inspection-zhengzhou-1.json
```

Expected: every command exits 0.

### Task 3: Validate and publish the standalone repository

**Files:**
- Track: all intended repository files except ignored artifacts.
- Remote: `https://github.com/ccsulzf/douban-publisher.git`

**Interfaces:**
- Consumes: clean public tree from Tasks 1–2.
- Produces: a public GitHub `main` branch and five accessible image URLs.

- [ ] **Step 1: Run the full Node.js test suite directly**

```bash
node --test
```

Expected: all tests pass with 0 failures.

- [ ] **Step 2: Configure the exact remote and inspect intended files**

```bash
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/ccsulzf/douban-publisher.git
git add .gitignore README.md package.json package-lock.json config content docs instructions materials output scripts test
git status --short
git diff --cached --check
```

Expected: ignored runtime artifacts and `node_modules` do not appear; cached diff check exits 0.

- [ ] **Step 3: Scan staged text for credential-shaped content**

```bash
git grep --cached -n -I -E '(BEGIN [A-Z ]*PRIVATE KEY|password[[:space:]]*[:=]|passwd[[:space:]]*[:=]|api[_-]?key[[:space:]]*[:=]|access[_-]?token[[:space:]]*[:=]|userhash[[:space:]]*[:=])' -- . ':!package-lock.json'
```

Expected: no matches. If matches exist, inspect and remove real credentials before committing.

- [ ] **Step 4: Commit the complete public repository**

```bash
git commit -m "feat: publish standalone douban publisher"
```

Expected: commit succeeds without staging user changes from `rentTool-mini`.

- [ ] **Step 5: Push main without force**

```bash
git push -u origin main
```

Expected: the empty remote accepts the local history and sets `origin/main` as upstream.

- [ ] **Step 6: Verify the remote and every Raw image response**

```bash
git ls-remote --heads origin main
curl -fsSI https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/overview.jpg
curl -fsSI https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/room-inspection.jpg
curl -fsSI https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/transit-detail.jpg
curl -fsSI https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/commute-comparison.jpg
curl -fsSI https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/mini-program-code.jpg
```

Expected: `main` resolves to the pushed commit; each URL returns HTTP 200 and `content-type: image/jpeg`.

## Plan Self-Review

- Spec coverage: complete tool migration, V2EX document move, five Raw assets, README generalization, ignore rules, credential scan, direct tests, safe commit, non-force push, and remote URL verification are covered.
- Placeholder scan: no deferred implementation requirement remains.
- Interface consistency: the five copied file names exactly match the five Markdown URLs and verification requests.
