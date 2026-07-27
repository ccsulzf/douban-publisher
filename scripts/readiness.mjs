export const FORM_READY_TIMEOUT_MS = 20_000

export function isFormReady({ hasTitle, hasEditor }) {
  return hasTitle && hasEditor
}
