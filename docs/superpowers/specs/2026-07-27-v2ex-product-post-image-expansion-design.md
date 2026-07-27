# V2EX 产品自荐帖配图扩展设计

## 目标

调整 `content/v2ex-rental-tool-post.md` 的场景结构和配图，使候选房记录、现场检查、通勤、周边和房源比较都有直接对应的小程序截图。正文继续面向全国租房用户，并保持开发者产品自荐口吻。

## 场景结构

正文按以下五个场景排列：

1. 候选房信息集中记录；
2. 现场看房检查；
3. 通勤判断；
4. 周边生活配套；
5. 两套房源并排比较。

“通勤与周边判断”拆成两个独立章节。通勤段落只讨论路线、用时、换乘和出行方式；周边段落只讨论超市、菜市场、医院、公园等生活配套。

## 图片映射与顺序

全文使用八张图片，顺序如下：

1. 产品概览：`docs/assets/v2ex/overview.jpg`；
2. 候选房记录：新增 `docs/assets/v2ex/property-costs.jpg`，来源为 `materials/images/房屋基本情况-费用信息.jpg`；
3. 现场检查：`docs/assets/v2ex/room-inspection.jpg`；
4. 通勤方式：新增 `docs/assets/v2ex/commute-modes.jpg`，来源为 `materials/images/通勤方式.jpg`；
5. 公交通勤详情：`docs/assets/v2ex/transit-detail.jpg`；
6. 周边生活配套：新增 `docs/assets/v2ex/amenities.jpg`，来源为 `materials/images/周边.jpg`；
7. 房源比较：`docs/assets/v2ex/commute-comparison.jpg`；
8. 小程序码：`docs/assets/v2ex/mini-program-code.jpg`。

每张图片紧跟其对应的介绍段落。通勤章节先放“通勤方式”总览图，再放“公交通勤详情”图，形成从总体选择到具体路线的阅读顺序。

## 图片发布方式

- 新增图片以二进制原样复制，保持 JPEG 格式和现有清晰度；
- 使用英文文件名，避免 Raw 链接中的中文路径转义；
- Markdown 使用 `https://raw.githubusercontent.com/ccsulzf/douban-publisher/main/docs/assets/v2ex/<filename>`；
- 图片替代文本说明截图展示的功能，不使用“截图一”等无信息描述；
- 截图中的上海示例地点可以保留，它只作为演示数据，不改变产品面向全国用户的定位。

## 文案调整

- “候选房信息集中记录”段落补充一张费用与房屋信息截图，不扩展为字段清单；
- 原“通勤与周边判断”拆为“通勤判断”和“周边生活配套”；
- 通勤章节用两张图片说明不同通勤方式和公交路线详情；
- 周边章节说明将配套与具体候选房关联的价值；
- 后续章节编号顺延，体验方式和三个反馈问题保持不变。

## 验收标准

- 正文恰有五个编号场景章节，通勤与周边互相独立；
- 全文恰有八张图片，顺序与本设计一致；
- 三个新增公开图片文件与各自素材源二进制一致；
- 三个新增 Raw 链接没有中文路径、占位地址或无效文件名；
- 不重新加入技术实现、产品状态、迭代进度或郑州限定表达；
- Markdown 无空白错误，可以直接复制到 V2EX。
