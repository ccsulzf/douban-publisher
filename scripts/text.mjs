export function canonicalText(text) {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/^>\s*/gm, '')
    .replace(/^添加描述（选填）\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function comparableText(text) {
  return canonicalText(text).replace(/\s+/g, '')
}
