# V2EX Rental Tool Post Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a complete Markdown post that introduces the rental mini-program from its developer's perspective and invites actionable V2EX feedback.

**Architecture:** Keep the post in one focused Markdown file under `docs/content/`. Structure it as motivation, workflow, core features, technical background, current status, feedback questions, and experience entry; place five HTTPS image markers immediately after the related product sections.

**Tech Stack:** Markdown and existing product documentation for factual grounding.

## Global Constraints

- Do not run package-manager commands or modify dependencies.
- Use developer first person throughout.
- Do not invent user counts, results, listings, rent prices, or development history.
- Keep product introduction and feedback invitation as the main thread.
- Mention uni-app, Vue 3, TypeScript, Pinia, uniCloud, and Tencent Location Service only as concise technical context.
- Do not publish or open V2EX.

---

### Task 1: Write and validate the V2EX Markdown post

**Files:**
- Create: `docs/content/v2ex-rental-tool-post.md`
- Reference: `docs/superpowers/specs/2026-07-27-v2ex-rental-tool-post-design.md`

**Interfaces:**
- Consumes: verified product capabilities from `README.md`, `src/pages/onsite/README.md`, and `src/pages/compare/README.md`.
- Produces: one standalone Markdown post with a suggested title, body, five image markers, and four concrete feedback questions.

- [ ] **Step 1: Write the complete post**

Use these exact top-level sections:

```text
为什么做这个小程序
目前做了什么
我希望它解决的是“怎么选”，而不只是“怎么记”
技术实现
目前的状态
想请大家重点帮我看看
体验方式
```

The product flow must be stated as: record a candidate listing, inspect the room and common area, review surroundings and commute routes, then compare two candidates. Include image markers for the promotional overview, room inspection, public-transit detail, commute comparison, and mini-program QR code.

- [ ] **Step 2: Verify required content and Markdown structure**

Run:

```bash
rg -n "^# |^## |uni-app|Vue 3|TypeScript|Pinia|uniCloud|腾讯地图|想请大家重点帮我看看|https://your-image-host\.example/" docs/content/v2ex-rental-tool-post.md
```

Expected: one title heading, all seven section headings, all six technology names, the feedback section, and five replaceable HTTPS image URLs.

- [ ] **Step 3: Check prohibited claims and image count**

Run:

```bash
if rg -n "用户量|日活|最好用|解决行业痛点|颠覆|百分之|成功率" docs/content/v2ex-rental-tool-post.md; then exit 1; fi
test "$(rg -c '^!\[' docs/content/v2ex-rental-tool-post.md)" -eq 5
```

Expected: exit code 0, with no exaggerated claims and exactly five Markdown images.

## Plan Self-Review

- Spec coverage: developer voice, product workflow, factual features, concise technical context, current-state caveat, feedback questions, image positions, and no-publish boundary are covered.
- Placeholder scan: image-host URLs are intentional user-replaceable deliverable content, not deferred plan requirements.
- Interface consistency: all feature and technology names match the current repository documentation.
