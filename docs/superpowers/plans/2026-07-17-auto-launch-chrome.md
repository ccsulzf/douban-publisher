# 自动启动调试 Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 使 `npm run fill` 在本地 CDP 未运行时自动启动专用 Chrome 并连接。

**Architecture:** 将 macOS Chrome 启动、CDP 就绪轮询和“连接或启动”逻辑放入独立模块。现有填充脚本只调用该模块取得浏览器，因此原有填充流程和端口配置不变。

**Tech Stack:** Node.js 20+、Playwright、Node 内置测试运行器、macOS `open`。

## Global Constraints

- 只连接 `127.0.0.1`，保留 `DOUBAN_CDP_PORT` 验证。
- 仅在连接被拒绝时启动 Chrome，使用 `$HOME/.douban-cdp-profile` 持久化登录状态。
- 不关闭 Chrome、不自动登录、不发布。

---

### Task 1: 浏览器启动与连接辅助模块

**Files:**
- Create: `scripts/browser-launch.mjs`
- Create: `test/browser-launch.test.mjs`

**Interfaces:**
- Consumes: `endpoint`, `connectOptions` 和 Playwright `chromium.connectOverCDP`。
- Produces: `connectOrLaunchChrome({ chromium, endpoint, connectOptions, launch, waitForReady })`，返回 Playwright browser。

- [ ] **Step 1: Write the failing test**

```js
test('launches Chrome and reconnects when the local CDP endpoint refuses connections', async () => {
  const calls = []
  const chromium = { connectOverCDP: async () => {
    calls.push('connect')
    if (calls.filter((call) => call === 'connect').length === 1) {
      const error = new Error('refused')
      error.code = 'ECONNREFUSED'
      throw error
    }
    return 'browser'
  } }
  const browser = await connectOrLaunchChrome({ chromium, endpoint: 'http://127.0.0.1:9222', connectOptions: {}, launch: async () => calls.push('launch'), waitForReady: async () => calls.push('wait') })
  assert.equal(browser, 'browser')
  assert.deepEqual(calls, ['connect', 'launch', 'wait', 'connect'])
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/browser-launch.test.mjs`
Expected: FAIL because `scripts/browser-launch.mjs` does not exist.

- [ ] **Step 3: Write minimal implementation**

```js
export async function connectOrLaunchChrome({ chromium, endpoint, connectOptions, launch, waitForReady }) {
  try { return await chromium.connectOverCDP(endpoint, connectOptions) }
  catch (error) {
    if (error.code !== 'ECONNREFUSED') throw error
    await launch()
    await waitForReady()
    return chromium.connectOverCDP(endpoint, connectOptions)
  }
}
```

Also implement a macOS launcher with `spawn('open', ['-na', 'Google Chrome', '--args', '--remote-debugging-port=<port>', '--user-data-dir=<profile>'])` and a timed `fetch('<endpoint>/json/version')` wait.

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test test/browser-launch.test.mjs test/browser.test.mjs`
Expected: PASS.

### Task 2: 将填充脚本切换为自动连接

**Files:**
- Modify: `scripts/fill-douban.mjs:4,38`
- Modify: `README.md:8-24`

**Interfaces:**
- Consumes: `connectOrLaunchChrome` 和 `launchChrome`。
- Produces: `npm run fill` 的首次运行自动启动体验。

- [ ] **Step 1: Write the failing integration-oriented test**

```js
test('does not launch Chrome when the initial CDP connection succeeds', async () => {
  let launched = false
  const browser = await connectOrLaunchChrome({ chromium: { connectOverCDP: async () => 'browser' }, endpoint: 'http://127.0.0.1:9222', connectOptions: {}, launch: async () => { launched = true }, waitForReady: async () => {} })
  assert.equal(browser, 'browser')
  assert.equal(launched, false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/browser-launch.test.mjs`
Expected: FAIL until the initial-connection branch is implemented.

- [ ] **Step 3: Replace direct connection and update documentation**

```js
const browser = await connectOrLaunchChrome({
  chromium,
  endpoint: cdpEndpoint(),
  connectOptions: cdpConnectOptions(),
  launch: () => launchChrome({ endpoint: cdpEndpoint() }),
  waitForReady: () => waitForCdpReady(cdpEndpoint()),
})
```

Update README so `npm run fill` is the standard command; document first-run login in the auto-opened Chrome and preserve the optional manual command as a troubleshooting path.

- [ ] **Step 4: Run focused regression tests**

Run: `node --test test/browser.test.mjs test/browser-launch.test.mjs`
Expected: PASS.
