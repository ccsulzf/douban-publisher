const BLOCK_TYPES = new Set([
  'paragraph', 'heading', 'quote', 'image',
  'ordered_list', 'unordered_list', 'divider',
])
const BOOLEAN_FORMATS = ['bold', 'highlight', 'strikethrough', 'block_highlight']

function requiredText(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${field} must be a non-empty string`)
  }
  return value.trim()
}

function requiredItems(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${field} must be a non-empty array`)
  }
  return value.map((item, index) => requiredText(item, `${field} ${index + 1}`))
}

function optionalBoolean(value, field) {
  if (value != null && typeof value !== 'boolean') {
    throw new Error(`${field} must be a boolean`)
  }
  return value === true
}

export function normalizePost(value) {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('post must be an object')
  }

  const title = requiredText(value.title, 'title')
  if (!Array.isArray(value.blocks) || value.blocks.length === 0) {
    throw new Error('blocks must contain at least one item')
  }

  const blocks = value.blocks.map((block, index) => {
    if (block == null || typeof block !== 'object' || Array.isArray(block)) {
      throw new Error(`block ${index + 1} must be an object`)
    }
    if (!BLOCK_TYPES.has(block.type)) {
      throw new Error(`unsupported block type: ${block.type}`)
    }

    if (block.type === 'divider') return { type: 'divider' }

    if (block.type === 'ordered_list' || block.type === 'unordered_list') {
      return { type: block.type, items: requiredItems(block.items, `block ${index + 1} items`) }
    }

    if (block.type === 'image') {
      const imagePath = requiredText(block.path, `block ${index + 1} path`)
      if (!imagePath.startsWith('materials/images/') || imagePath.includes('..')) {
        throw new Error(`block ${index + 1} image path must be inside materials/images`)
      }
      if (block.description != null && typeof block.description !== 'string') {
        throw new Error(`block ${index + 1} description must be a string`)
      }
      const description = block.description?.trim()
      if (description != null && description.length > 300) {
        throw new Error(`block ${index + 1} description must be at most 300 characters`)
      }
      return { type: 'image', path: imagePath, ...(description ? { description } : {}) }
    }

    const normalized = { type: block.type, text: requiredText(block.text, `block ${index + 1} text`) }
    if (block.type === 'paragraph') {
      for (const format of BOOLEAN_FORMATS) {
        if (optionalBoolean(block[format], `block ${index + 1} ${format}`)) normalized[format] = true
      }
      if (block.align != null && block.align !== 'center') {
        throw new Error(`block ${index + 1} align must be "center"`)
      }
      if (block.align === 'center') normalized.align = 'center'
      if (block.soft_breaks != null) {
        normalized.soft_breaks = requiredItems(block.soft_breaks, `block ${index + 1} soft_breaks`)
      }
    }
    return normalized
  })

  return { title, blocks }
}

export function renderPlainText(post) {
  return post.blocks.map((block) => {
    if (block.type === 'image') return block.description ?? ''
    if (block.type === 'divider') return ''
    if (block.type === 'ordered_list') return block.items.map((item, index) => `${index + 1}. ${item}`).join('\n')
    if (block.type === 'unordered_list') return block.items.map((item) => `- ${item}`).join('\n')
    if (block.type === 'paragraph') return [block.text, ...(block.soft_breaks ?? [])].join('\n')
    if (block.type === 'quote') return `> ${block.text}`
    return block.text
  }).filter(Boolean).join('\n\n')
}

export function renderEditorText(post) {
  return post.blocks.map((block) => {
    if (block.type === 'image' || block.type === 'divider') return ''
    if (block.type === 'ordered_list' || block.type === 'unordered_list') return block.items.join('\n')
    if (block.type === 'paragraph') return [block.text, ...(block.soft_breaks ?? [])].join('\n')
    return block.text
  }).filter(Boolean).join('\n\n')
}
