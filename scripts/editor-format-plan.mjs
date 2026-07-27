const INLINE_FORMATS = ['bold', 'highlight', 'strikethrough']

export function formatsForBlock(block) {
  if (block.type === 'heading') return ['heading']
  if (block.type === 'quote') return ['quote']
  if (block.type === 'ordered_list') return ['ordered_list']
  if (block.type === 'unordered_list') return ['unordered_list']
  if (block.type !== 'paragraph') return []

  return [
    ...INLINE_FORMATS.filter((format) => block[format]),
    ...(block.block_highlight ? ['block_highlight'] : []),
    ...(block.align === 'center' ? ['align_center'] : []),
  ]
}

function textsForBlock(block) {
  return block.type === 'ordered_list' || block.type === 'unordered_list'
    ? block.items
    : block.text ? [block.text] : []
}

/** Applies formats only after all source text has been inserted into the editor. */
export async function applyDeferredFormats({ editor, page, blocks, selectText, applyFormat }) {
  for (const block of blocks) {
    const formats = formatsForBlock(block)
    for (const text of textsForBlock(block)) {
      for (const format of formats) {
        await selectText(editor, text)
        await applyFormat(page, format)
      }
    }
  }
}
