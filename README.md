# 豆瓣租房内容富文本预填工具

此工具将城市专属的结构化文章预填到对应豆瓣租房小组的发帖页，并保存检查截图。它支持按城市选择文章和一个或多个小组；它**不会**自动登录、处理验证码或点击发布。

运行环境为 Node.js 20+，浏览器自动化使用 Playwright。所有预填结果都需要人工检查并手动发布。

## 使用方式

1. 在 `materials/` 放入参考资料，在 `instructions/` 调整写作要求；使用 Codex 生成或更新 `output/post.json`。
2. 安装依赖：`npm install`。
3. 生成便于检查的文本预览：`npm run render`。
4. 执行：

   ```bash
   npm run fill
   ```

   脚本会先连接 `http://127.0.0.1:9222`；若本地调试 Chrome 尚未启动，便会自动打开一个独立的 Chrome 窗口，并将登录状态保存在 `$HOME/.douban-cdp-profile`。首次使用时，在该窗口手动登录豆瓣并确认能访问小组。

   如已手动启动调试 Chrome，脚本会直接复用它。使用其他本地端口：`DOUBAN_CDP_PORT=9333 npm run fill`。若需手动启动默认实例，可运行：

   ```bash
   open -na "Google Chrome" --args --remote-debugging-port=9222 --user-data-dir="$HOME/.douban-cdp-profile"
   ```

脚本默认选择 `wuhan`，并为该城市数组中的每个小组在已连接的 Chrome 内各新开一页、填写标题和富文本正文、验证可见文本并保存 `output/preview-<city>-<序号>.png`。传入 `--city <城市>` 时，脚本会优先读取 `output/<城市>-post.json`；该文件不存在时才回退到 `output/post.json`。例如，`npm run fill -- --city nanjing` 会读取 `output/nanjing-post.json`。它不会读取或操作其他标签。填写后 Chrome 保持开启，供你检查并手动发布。找不到编辑器或登录状态异常时，会写入对应序号的 `page-inspection-<city>-<序号>.json` 以供定位。

## 小组配置

在 `config/groups.json` 中维护城市键、显示名称和发帖 URL：

```json
{
  "wuhan": [
    {
      "name": "武汉租房",
      "postUrl": "https://www.douban.com/group/551383/new_topic"
    }
  ],
  "shanghai": [
    {
      "name": "上海租房一组",
      "postUrl": "https://www.douban.com/group/你的上海小组ID一/new_topic"
    },
    {
      "name": "上海租房二组",
      "postUrl": "https://www.douban.com/group/你的上海小组ID二/new_topic"
    }
  ]
}
```

选择城市：`npm run fill -- --city shanghai`。脚本会同时打开并预填上海数组中的全部小组。只接受 `www.douban.com` 的 HTTPS `new_topic` 地址，避免误填到其他页面。

## 文章格式

```json
{
  "title": "文章标题",
  "blocks": [
    { "type": "paragraph", "text": "普通段落" },
    { "type": "heading", "text": "小标题" },
    { "type": "quote", "text": "引用内容" },
    { "type": "unordered_list", "items": ["第一项", "第二项"] },
    { "type": "divider" }
  ]
}
```

脚本直接使用豆瓣编辑器工具栏，不输入 Markdown。`paragraph` 可选 `bold`、`highlight`、`strikethrough`、`block_highlight`、`align: "center"` 和 `soft_breaks` 字段；还支持 `ordered_list`、`unordered_list`、`divider`、标题、引用和本地图片上传。不处理链接卡片、添加条目、条目卡片、表格、远程图片或任意 HTML。

## 图片块

将 JPG、JPEG、PNG、WEBP、GIF 或 AVIF 图片放入 `materials/images/`，并在文字块之间加入图片块：

```json
{
  "type": "image",
  "path": "materials/images/room-1.jpg"
}
```

脚本会点击豆瓣富文本编辑器的图片按钮，选择“图文混排”并确认上传。每张图片按块顺序插入；上传失败时，会在原位置写入 `【图片上传失败：room-1.jpg】`，其余内容继续填写。
