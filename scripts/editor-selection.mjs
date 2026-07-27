export async function selectCurrentLine(locator, platform = process.platform) {
  await locator.press(platform === 'darwin' ? 'Meta+Shift+ArrowLeft' : 'Control+Shift+ArrowLeft')
}

export async function selectExactText(editor, text) {
  const selected = await editor.evaluate((root, targetText) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const start = node.textContent.indexOf(targetText)
      if (start < 0) continue
      const range = document.createRange()
      range.setStart(node, start)
      range.setEnd(node, start + targetText.length)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      return true
    }
    return false
  }, text)
  if (!selected) throw new Error(`Could not select text for toolbar formatting: ${text}`)
}
