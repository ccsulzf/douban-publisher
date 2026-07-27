# Douban Publisher 独立仓库完整迁移设计

## 目标

将本地 `douban-publisher` 完整整理为公开 GitHub 仓库 `ccsulzf/douban-publisher`。仓库包含可独立运行的发布工具、测试、文章素材、城市文章和 V2EX 成稿，并使用仓库内图片的 GitHub Raw 地址展示 V2EX 帖子图片。

## 仓库范围

公开提交以下内容：

- `scripts/`：豆瓣富文本预填脚本。
- `test/`：Node.js 测试。
- `config/`：城市小组公开配置。
- `instructions/`：文案和发帖规则。
- `materials/`：文章素材与小程序公开宣传截图。
- `output/*.json` 与 `output/post.txt`：可复用的结构化城市文章和文本示例。
- `content/v2ex-rental-tool-post.md`：V2EX 产品介绍成稿。
- `docs/`：设计与实施记录，以及 V2EX 专用图片资源。
- `README.md`、`package.json`、`package-lock.json` 和 `.gitignore`。

不公开提交以下内容：

- `node_modules/`。
- 豆瓣预填预览截图 `output/preview*.png`。
- 页面诊断文件 `output/page-inspection*.json`。
- `.env`、`.env.*`、浏览器配置、Cookie、会话、访问令牌或其他凭据。
- 本机 Chrome 用户数据；当前工具将其保存在仓库外部，不需要迁移。

## V2EX 文章迁移

- 将 `rentTool-mini/docs/content/v2ex-rental-tool-post.md` 移动到 `douban-publisher/content/v2ex-rental-tool-post.md`。
- 将文章设计和实施记录从 `rentTool-mini/docs/superpowers/` 移入 `douban-publisher/docs/superpowers/`，避免小程序源码仓库保留宣传发布文档。
- 不修改 `rentTool-mini` 中已有的用户代码改动。

## 图片组织与链接

V2EX 使用的五张图片复制到 `docs/assets/v2ex/`，使用稳定的 ASCII 文件名：

- `overview.jpg`：宣传图。
- `room-inspection.jpg`：房屋基本情况。
- `transit-detail.jpg`：公交方案详情。
- `commute-comparison.jpg`：房源通勤对比。
- `mini-program-code.jpg`：小程序码。

Markdown 使用以下 GitHub Raw 地址前缀：

```text
https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/
```

首次推送完成后逐一验证五个地址返回 HTTP 200 和 `image/jpeg`。

## README 与运行说明

- 将 README 标题从武汉专用描述改为通用的豆瓣租房内容预填工具。
- 说明按 `--city` 选择城市、城市专属文章文件命名、图片块用法和不自动发布的安全边界。
- 保留现有 Node.js 20+ 与 Playwright 安装、运行说明。
- 不运行任何包管理器安装、修复或依赖更新命令。

## Git 与 GitHub

- 在本地 `douban-publisher` 初始化 `main` 分支。
- 远端设置为 `https://github.com/ccsulzf/douban-publisher.git`。
- 远端当前为空，因此首次推送不会覆盖已有提交。
- 提交前只按精确路径暂存文件，并检查忽略结果和敏感信息。
- 首次提交完成后推送 `main`，不强制推送。

## 验证

- 使用 `node --test` 运行完整测试，不使用 npm 或 pnpm 命令。
- 确认 `node_modules`、预览、诊断和 `.env` 文件均未进入 Git 索引。
- 检查仓库待提交文件中不存在凭据模式。
- 检查 V2EX Markdown 有五个 GitHub Raw 图片地址，不再包含示例图床地址。
- 推送后请求五个 Raw 地址，验证状态码和内容类型。

## 验收标准

- `ccsulzf/douban-publisher` 的 `main` 分支包含完整、可独立使用的工具仓库。
- `rentTool-mini` 中的 V2EX 成稿和对应发布设计/计划已迁移，不影响其他未提交修改。
- V2EX Markdown 使用五个可访问的 GitHub Raw 图片地址。
- 全量 Node.js 测试通过。
- 没有依赖目录、运行时预览、诊断文件或凭据被提交。
