export async function fillImageDescription(imageNode, description) {
  if (!description) return
  await imageNode.locator('.DRE-caption-input-placeholder.empty').click()
  await imageNode.locator('textarea.DRE-input[placeholder="添加描述（选填）"]').fill(description)
}

export async function fillImageDescriptions(imageNodes, imageBlocks) {
  const imageNodeCount = await imageNodes.count()
  if (imageNodeCount !== imageBlocks.length) {
    throw new Error(`Image node count (${imageNodeCount}) did not match image blocks (${imageBlocks.length})`)
  }
  for (const [index, imageBlock] of [...imageBlocks].reverse().entries()) {
    await fillImageDescription(imageNodes.nth(index), imageBlock.description)
  }
}

export async function fillImageDescriptionsBySource(imageNodes, descriptionsBySource) {
  const imageNodeCount = await imageNodes.count()
  if (imageNodeCount !== descriptionsBySource.size) {
    throw new Error(`Image node count (${imageNodeCount}) did not match uploaded images (${descriptionsBySource.size})`)
  }

  for (let index = 0; index < imageNodeCount; index += 1) {
    const imageNode = imageNodes.nth(index)
    const source = await imageNode.locator('img').getAttribute('src')
    if (!descriptionsBySource.has(source)) throw new Error(`Could not match uploaded image source: ${source}`)
    const description = descriptionsBySource.get(source)
    await fillImageDescription(imageNode, description)
  }
}
