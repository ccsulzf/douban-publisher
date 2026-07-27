export async function confirmImageUpload(page) {
  const confirmButton = page.getByText('确定上传', { exact: true }).last()
  await confirmButton.click()
  await confirmButton.waitFor({ state: 'hidden' })
}
