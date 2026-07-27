import { basename } from 'node:path'

export function imageFailurePlaceholder(imagePath) {
  return `【图片上传失败：${basename(imagePath)}】`
}

export async function fillBlocks({ blocks, writeText, insertImage, insertDivider, separator }) {
  const failures = []
  for (const [index, block] of blocks.entries()) {
    if (index > 0) await separator(blocks[index - 1], block)
    if (block.type === 'divider') {
      await insertDivider()
      continue
    }
    if (block.type !== 'image') {
      await writeText(block.text, block.type, block.url, block)
      continue
    }

    try {
      await insertImage(block)
    } catch (error) {
      const placeholder = imageFailurePlaceholder(block.path)
      failures.push({ path: block.path, error })
      await writeText(placeholder, 'paragraph')
    }
  }
  return failures
}
