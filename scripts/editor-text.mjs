export function editableBlockText(block) {
  if (block.type === 'ordered_list' || block.type === 'unordered_list') {
    return block.items.join('\n')
  }
  return block.text
}
