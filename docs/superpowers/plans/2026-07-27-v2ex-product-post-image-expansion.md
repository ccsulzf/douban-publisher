# V2EX 产品自荐帖配图扩展 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 V2EX 产品自荐帖补充候选房、通勤和周边截图，将正文调整为五个独立场景和八张准确对应的图片。

**Architecture:** 将三个已有中文素材文件二进制复制为 `docs/assets/v2ex/` 下的英文公开文件名，再修改一篇 Markdown 的章节结构和 Raw 链接。通过二进制比对、标题与图片顺序检索、禁用内容扫描和完整测试验证交付物。

**Tech Stack:** Markdown、JPEG、GitHub Raw、Shell 只读校验、Node.js test runner

## Global Constraints

- 正文继续面向全国租房用户，并保持开发者产品自荐口吻。
- 截图中的上海示例地点可以保留，它只作为演示数据。
- 三个新增图片使用英文文件名，并与素材源二进制一致。
- 正文恰有五个编号场景章节和八张图片。
- 通勤与周边使用独立章节；通勤章节包含两张图。
- 不重新加入技术实现、产品状态、迭代进度或郑州限定表达。
- 不增加或修改项目依赖，不运行包管理器命令。

---

### Task 1: 发布三张场景截图

**Files:**
- Create: `docs/assets/v2ex/property-costs.jpg`
- Create: `docs/assets/v2ex/commute-modes.jpg`
- Create: `docs/assets/v2ex/amenities.jpg`
- Source: `materials/images/房屋基本情况-费用信息.jpg`
- Source: `materials/images/通勤方式.jpg`
- Source: `materials/images/周边.jpg`

**Interfaces:**
- Consumes: 三张已有 JPEG 原始素材
- Produces: Task 2 可通过 GitHub Raw 路径引用的三个英文文件名

- [ ] **Step 1: 复制候选房费用截图**

```bash
cp materials/images/房屋基本情况-费用信息.jpg docs/assets/v2ex/property-costs.jpg
```

- [ ] **Step 2: 复制通勤方式截图**

```bash
cp materials/images/通勤方式.jpg docs/assets/v2ex/commute-modes.jpg
```

- [ ] **Step 3: 复制周边配套截图**

```bash
cp materials/images/周边.jpg docs/assets/v2ex/amenities.jpg
```

- [ ] **Step 4: 验证三个副本与来源二进制一致**

```bash
cmp materials/images/房屋基本情况-费用信息.jpg docs/assets/v2ex/property-costs.jpg
cmp materials/images/通勤方式.jpg docs/assets/v2ex/commute-modes.jpg
cmp materials/images/周边.jpg docs/assets/v2ex/amenities.jpg
file docs/assets/v2ex/property-costs.jpg docs/assets/v2ex/commute-modes.jpg docs/assets/v2ex/amenities.jpg
```

Expected: 三个 `cmp` 均退出码 0；`file` 将三个文件识别为 JPEG image data。

- [ ] **Step 5: 提交公开图片**

```bash
git add docs/assets/v2ex/property-costs.jpg docs/assets/v2ex/commute-modes.jpg docs/assets/v2ex/amenities.jpg
git commit -m "assets: add V2EX rental scenario screenshots"
```

### Task 2: 调整五个场景和八张配图

**Files:**
- Modify: `content/v2ex-rental-tool-post.md`
- Verify: `docs/assets/v2ex/property-costs.jpg`
- Verify: `docs/assets/v2ex/commute-modes.jpg`
- Verify: `docs/assets/v2ex/amenities.jpg`

**Interfaces:**
- Consumes: Task 1 产出的三个英文文件名
- Produces: 可直接复制到 V2EX 的五场景、八图片 Markdown

- [ ] **Step 1: 给候选房记录补充费用截图**

在“候选房信息集中记录”两段文案之后插入：

```markdown
![候选房记录：集中填写房屋情况、押金、付款方式和租期](https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/property-costs.jpg)
```

- [ ] **Step 2: 将通勤和周边拆为两个章节**

将原“通勤与周边判断”改为“3. 通勤判断”，正文只保留路线、用时、换乘和出行方式内容。在通勤正文后依次插入：

```markdown
![通勤方式：比较公交、驾车和骑行的时间、距离与成本](https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/commute-modes.jpg)

![公交通勤详情：步行接驳、线路、站点和预计用时](https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/transit-detail.jpg)
```

新增“4. 周边生活配套”，说明将超市、菜市场、医院、公园等配套与具体候选房关联的价值，并插入：

```markdown
![周边生活配套：按类型查看候选房附近的超市、菜市场、医院和公园](https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/amenities.jpg)
```

- [ ] **Step 3: 顺延房源比较章节编号**

将“两套房源并排比较”调整为“5. 两套房源并排比较”，保留现有 `commute-comparison.jpg` 及其对应文案。体验方式和三个反馈问题保持不变。

- [ ] **Step 4: 校验五个场景标题**

```bash
rg -n '^## [1-5]\. ' content/v2ex-rental-tool-post.md
```

Expected: 恰有五行，依次为候选房信息集中记录、现场看房检查、通勤判断、周边生活配套、两套房源并排比较。

- [ ] **Step 5: 校验八张图片及顺序**

```bash
rg -n '^!\[' content/v2ex-rental-tool-post.md
```

Expected: 恰有八行，链接文件名依次为 `overview.jpg`、`property-costs.jpg`、`room-inspection.jpg`、`commute-modes.jpg`、`transit-detail.jpg`、`amenities.jpg`、`commute-comparison.jpg`、`mini-program-code.jpg`。

- [ ] **Step 6: 校验禁用内容、占位符和空白**

```bash
rg -n '技术实现|技术栈|uni-app|Vue|TypeScript|Pinia|uniCloud|目前的状态|目前状态|现阶段|持续迭代|郑州|your-image-host|TODO|TBD|待补|待上传' content/v2ex-rental-tool-post.md
git diff --check
```

Expected: `rg` 无输出且退出码 1；`git diff --check` 无输出且退出码 0。

- [ ] **Step 7: 运行完整项目测试**

```bash
node --test
```

Expected: 68 tests passed, 0 failed。

- [ ] **Step 8: 提交文章调整**

```bash
git add content/v2ex-rental-tool-post.md
git commit -m "content: expand V2EX post screenshots"
```
