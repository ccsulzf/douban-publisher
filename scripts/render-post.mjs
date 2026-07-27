import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { normalizePost, renderPlainText } from './post.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourcePath = resolve(root, 'output/post.json')
const targetPath = resolve(root, 'output/post.txt')
const post = normalizePost(JSON.parse(await readFile(sourcePath, 'utf8')))

await writeFile(targetPath, `${post.title}\n\n${renderPlainText(post)}\n`, 'utf8')
console.log(`Wrote ${targetPath}`)
