# 武汉租房工具经验帖 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成一篇以武汉租房者经验分享为口吻的图文帖，并预填至武汉租房小组供人工检查。

**Architecture:** `output/post.json` 保存标题、短段落、小标题与本地图片块。现有 `fill-douban.mjs` 读取该文件，连接本地 Chrome 并预填豆瓣发帖页，但不点击发布。

**Tech Stack:** JSON、Node.js 内置测试运行器、现有 Playwright 预填脚本。

## Global Constraints

- 不自动登录、不处理验证码、不点击发布。
- 不包含不确定的联系方式、价格或房源承诺。
- 仅使用验证过的功能：房源基本信息、房屋检查、公区检查、周边、通勤与两套房源对比。
- 截图中的示例房源、价格和路线不是武汉真实房源，不在正文中引用为事实。

---

### Task 1: 生成并验证结构化经验帖

**Files:**
- Modify: `output/post.json`
- Consumes: `materials/images/房屋基本情况-费用信息.jpg`、`房屋基本情况.jpg`、`公区检查.jpg`、`通勤-公交方案详情.jpg`、`周边.jpg`、`房源对比通勤.jpg`、`小程序码.jpg`
- Produces: 被 `normalizePost` 接受的图文文章。

- [ ] **Step 1: 编写文章 JSON**

使用标题“武汉看房几套后，我做了个不靠记忆的看房记录工具”，按房源信息、房屋检查、公区检查、通勤、周边、对比、试用反馈的顺序写入短段落；每段明确一个看房痛点及对应解决方式，图片说明只描述对应界面功能。

- [ ] **Step 2: 验证文章结构与文本预览**

Run: `node scripts/render-post.mjs`
Expected: 输出无 schema error 的纯文本预览，且不含测试文章标题、虚构联系方式、示例房价或房源名。

### Task 2: 预填武汉租房小组草稿

**Files:**
- Consumes: `output/post.json` 与 Task 1 的五张图片。
- Produces: 武汉租房小组 `new_topic` 页中的预填草稿和 `output/preview-wuhan-1.png`。

- [ ] **Step 1: 启动预填命令**

Run: `npm run fill`
Expected: 自动连接或启动本地 Chrome，打开武汉租房小组发帖页、上传图片、填入文章并保存预览截图；不点击发布。

- [ ] **Step 2: 检查预填结果**

Run: `test -f output/preview-wuhan-1.png`
Expected: exit 0；浏览器保留在已填好的草稿页，由用户检查小组规则和正文后手动决定是否发布。
