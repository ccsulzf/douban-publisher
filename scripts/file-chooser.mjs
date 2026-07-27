export async function setFileFromChooser(page, trigger, path) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    trigger.click(),
  ])
  await chooser.setFiles(path)
}
