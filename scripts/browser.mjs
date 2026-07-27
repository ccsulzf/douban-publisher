export function cdpEndpoint(env = process.env) {
  const port = env.DOUBAN_CDP_PORT ?? '9222'
  if (!/^[1-9]\d{0,4}$/.test(port) || Number(port) > 65535) {
    throw new Error('DOUBAN_CDP_PORT must be a local port between 1 and 65535')
  }
  return `http://127.0.0.1:${port}`
}

export function cdpConnectOptions() {
  return { noDefaults: true }
}
