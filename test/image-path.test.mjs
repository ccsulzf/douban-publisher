import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import os from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { resolveImagePath } from '../scripts/images.mjs'

test('resolves an existing image only from materials/images', async () => {
  const root = await mkdtemp(join(os.tmpdir(), 'douban-publisher-'))
  await mkdir(join(root, 'materials/images'), { recursive: true })
  await writeFile(join(root, 'materials/images/room.jpg'), 'fixture')

  assert.equal(await resolveImagePath(root, 'materials/images/room.jpg'), join(root, 'materials/images/room.jpg'))
  await assert.rejects(() => resolveImagePath(root, '../room.jpg'), /materials\/images/i)
  await assert.rejects(() => resolveImagePath(root, 'materials/images/room.txt'), /image/i)
})
