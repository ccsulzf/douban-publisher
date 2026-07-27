import { homedir } from 'node:os'
import { resolve } from 'node:path'
import { spawn } from 'node:child_process'

const DEFAULT_PROFILE_DIR = resolve(homedir(), '.douban-cdp-profile')
const CDP_READY_TIMEOUT_MS = 15_000
const CDP_READY_INTERVAL_MS = 250

export function chromeLaunchArguments({ port, profileDir = DEFAULT_PROFILE_DIR }) {
  return [
    '-na',
    'Google Chrome',
    '--args',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
  ]
}

function localPort(endpoint) {
  const url = new URL(endpoint)
  if (url.hostname !== '127.0.0.1' || !url.port) {
    throw new Error(`Chrome debugging endpoint must use a local port: ${endpoint}`)
  }
  return url.port
}

function openChrome(args) {
  return new Promise((resolveLaunch, reject) => {
    const child = spawn('open', args, { stdio: 'ignore' })
    child.once('error', reject)
    child.once('spawn', resolveLaunch)
  })
}

export function launchChrome({ endpoint, profileDir, runOpen = openChrome }) {
  return runOpen(chromeLaunchArguments({ port: localPort(endpoint), profileDir }))
}

function isConnectionRefused(error) {
  return error?.code === 'ECONNREFUSED' || /ECONNREFUSED/.test(error?.message ?? '')
}

function delay(timeoutMs) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, timeoutMs))
}

export async function waitForCdpReady(endpoint, {
  fetchImpl = fetch,
  timeoutMs = CDP_READY_TIMEOUT_MS,
  intervalMs = CDP_READY_INTERVAL_MS,
  wait = delay,
} = {}) {
  const deadline = Date.now() + timeoutMs
  const statusUrl = new URL('/json/version', endpoint).href
  do {
    try {
      const response = await fetchImpl(statusUrl)
      if (response.ok) return
    } catch {}
    await wait(intervalMs)
  } while (Date.now() < deadline)
  throw new Error(`Chrome did not open its debugging endpoint at ${endpoint} within ${timeoutMs / 1000} seconds.`)
}

export async function connectOrLaunchChrome({ chromium, endpoint, connectOptions, launch, waitForReady }) {
  try {
    return await chromium.connectOverCDP(endpoint, connectOptions)
  } catch (error) {
    if (!isConnectionRefused(error)) throw error
    await launch()
    await waitForReady()
    return chromium.connectOverCDP(endpoint, connectOptions)
  }
}
