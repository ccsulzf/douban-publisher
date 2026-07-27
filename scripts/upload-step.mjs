export async function waitForUploadStep({
  previousImageCount,
  getImageCount,
  isModeVisible,
  wait,
  timeoutMs,
  intervalMs = 200,
}) {
  const deadline = Date.now() + timeoutMs
  do {
    if (await isModeVisible()) return 'confirm'
    if (await getImageCount() > previousImageCount) return 'inserted'
    await wait(intervalMs)
  } while (Date.now() < deadline)

  throw new Error('The image upload did not offer a mode or insert an image before timing out')
}
