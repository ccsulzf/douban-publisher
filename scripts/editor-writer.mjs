import { editableBlockText } from './editor-text.mjs'

export async function writeEditorBlock(locator, block) {
  if (block.type === 'ordered_list' || block.type === 'unordered_list') {
    for (const [index, item] of block.items.entries()) {
      await locator.pressSequentially(item)
      if (index < block.items.length - 1) await locator.press('Enter')
    }
    return
  }

  await locator.pressSequentially(editableBlockText(block))
  for (const text of block.soft_breaks ?? []) {
    await locator.press('Shift+Enter')
    await locator.pressSequentially(text)
  }
}
