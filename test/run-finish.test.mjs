import assert from 'node:assert/strict'
import test from 'node:test'

import { finishRun } from '../scripts/run-finish.mjs'

test('ends the Node process with the completed run status', () => {
  let receivedExitCode

  finishRun(1, (exitCode) => { receivedExitCode = exitCode })

  assert.equal(receivedExitCode, 1)
})
