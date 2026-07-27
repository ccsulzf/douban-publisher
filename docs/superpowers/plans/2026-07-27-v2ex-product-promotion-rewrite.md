# V2EX 产品自荐帖改写 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 V2EX Markdown 改写为面向全国租房用户的产品自荐帖，保留五张对应场景的产品截图，并删除技术实现和产品状态内容。

**Architecture:** 只修改一篇内容文档，不改动发布脚本和素材。正文采用“产品定位—四个使用场景—体验与反馈”的线性结构，每张截图紧跟其所说明的场景。

**Tech Stack:** Markdown、GitHub Raw 图片链接、Shell 只读校验

## Global Constraints

- 使用第一人称开发者口吻，直接、克制、自然。
- 产品面向全国租房用户，不出现郑州限定表达。
- 不包含技术栈、架构、实现细节、产品状态或迭代进度。
- 保留现有五张 GitHub Raw 图片，且放在对应内容附近。
- 不增加新依赖，不运行包管理器命令。

---

### Task 1: 重写 V2EX 产品自荐正文

**Files:**
- Modify: `content/v2ex-rental-tool-post.md`

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-07-27-v2ex-product-promotion-rewrite-design.md` 的已批准内容结构
- Produces: 可直接复制到 V2EX 的完整 Markdown 帖子

- [ ] **Step 1: 将标题和开头改为直接的产品自荐**

标题使用“做了一个帮助租房时记录、看房和对比房源的小程序”。开头用两段话说明：作者是开发者；产品不提供房源，而是帮助已经有候选房的用户整理信息、现场检查和做取舍。

- [ ] **Step 2: 将功能介绍收敛为四个使用场景**

依次介绍“候选房信息集中记录”“现场看房检查”“通勤与周边判断”“两套房源并排比较”。每节聚焦用户能解决的问题，不罗列完整字段，不使用“目前”“现阶段”“持续迭代”等状态表达。

- [ ] **Step 3: 把五张图片放在对应场景附近**

按以下顺序保留现有 Raw 链接：

1. `overview.jpg`：产品定位之后；
2. `room-inspection.jpg`：现场看房场景之后；
3. `transit-detail.jpg`：通勤与周边场景之后；
4. `commute-comparison.jpg`：房源比较场景之后；
5. `mini-program-code.jpg`：体验方式之后。

- [ ] **Step 4: 用具体问题邀请 V 友体验反馈**

结尾只询问三个方面：看房现场是否愿意使用、哪些记录项显得多余、做租房决定时还缺什么信息。删除技术反馈邀请。

### Task 2: 校验文章范围和 Markdown 完整性

**Files:**
- Verify: `content/v2ex-rental-tool-post.md`

**Interfaces:**
- Consumes: Task 1 产出的 Markdown 正文
- Produces: 通过内容范围、图片数量和链接完整性检查的文章

- [ ] **Step 1: 检查被排除内容**

Run:

```bash
rg -n '技术实现|技术栈|uni-app|Vue|TypeScript|Pinia|uniCloud|目前的状态|目前状态|现阶段|持续迭代|郑州' content/v2ex-rental-tool-post.md
```

Expected: 无输出，退出码为 1。

- [ ] **Step 2: 检查图片数量与顺序**

Run:

```bash
rg -n '^!\[' content/v2ex-rental-tool-post.md
```

Expected: 共 5 行，路径依次以 `overview.jpg`、`room-inspection.jpg`、`transit-detail.jpg`、`commute-comparison.jpg`、`mini-program-code.jpg` 结尾。

- [ ] **Step 3: 检查占位符和空白错误**

Run:

```bash
rg -n 'your-image-host|TODO|TBD|待补|待上传' content/v2ex-rental-tool-post.md
git diff --check
```

Expected: `rg` 无输出且退出码为 1；`git diff --check` 无输出且退出码为 0。

- [ ] **Step 4: 人工通读最终正文**

确认标题直接、开头说明适用对象、正文只有四个场景、结尾包含体验入口和三个反馈方向，没有开发日志或技术文章语气。

- [ ] **Step 5: 提交改写结果**

```bash
git add content/v2ex-rental-tool-post.md docs/superpowers/plans/2026-07-27-v2ex-product-promotion-rewrite.md
git commit -m "content: rewrite V2EX product introduction"
```
