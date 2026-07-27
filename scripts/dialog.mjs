export async function dismissDialogSafely(dialog) {
  await dialog.dismiss().catch(() => {})
}
