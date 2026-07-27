const TOOLBAR_SELECTORS = {
  heading: '.DRE-heading-button',
  bold: '.DRE-bold-button',
  highlight: '.DRE-highlight-button',
  strikethrough: '.DRE-strikethrough-button',
  ordered_list: '.DRE-ordered-list-button',
  unordered_list: '.DRE-unordered-list-button',
  align_center: '.DRE-align-center-button',
  quote: '.DRE-quote-button',
  block_highlight: '.DRE-highlight-block-button',
  divider: '.DRE-splitor-button',
}

export async function applyToolbarFormat(page, format) {
  const selector = TOOLBAR_SELECTORS[format]
  if (!selector) throw new Error(`Unsupported toolbar format: ${format}`)
  const button = page.locator(selector).first()
  if (!await button.count() || !await button.isVisible()) {
    throw new Error(`Could not find visible toolbar button for ${format}`)
  }
  await button.evaluate((element) => element.click())
}

export async function clearActiveToolbarFormats(page) {
  await page.locator('.DRE-toolbar .DRE-action-button.active').evaluateAll((buttons) => {
    buttons.forEach((button) => button.click())
  })
}

export async function insertSoftBreak(locator) {
  await locator.press('Shift+Enter')
}
