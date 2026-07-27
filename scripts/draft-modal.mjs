const DRAFT_PROMPT = '你有一篇草稿，要继续写吗？'
const DRAFT_MODAL_TIMEOUT_MS = 1_500

/**
 * Starts a fresh post when Douban restores a previous draft.
 * Returns whether a draft modal was found and dismissed.
 */
export async function discardExistingDraft(page) {
  const modal = page.locator('.drc-modal.s').filter({ hasText: DRAFT_PROMPT })
  try {
    await modal.waitFor({ state: 'visible', timeout: DRAFT_MODAL_TIMEOUT_MS })
  } catch {
    return false
  }

  await modal.locator('.drc-modal-cancel').click()
  await modal.waitFor({ state: 'hidden' })
  return true
}
