import assert from 'node:assert/strict'
import test from 'node:test'

import { setFileFromChooser } from '../scripts/file-chooser.mjs'

test('sets the selected file through the chooser opened by the trigger click', async () => {
  const calls = []
  const chooser = {
    setFiles: async (path) => calls.push(`setFiles:${path}`),
  }
  const page = {
    waitForEvent: async (event) => {
      calls.push(`waitForEvent:${event}`)
      return chooser
    },
  }
  const trigger = {
    click: async () => calls.push('click'),
  }

  await setFileFromChooser(page, trigger, '/tmp/room.jpg')

  assert.deepEqual(calls, [
    'waitForEvent:filechooser',
    'click',
    'setFiles:/tmp/room.jpg',
  ])
})
