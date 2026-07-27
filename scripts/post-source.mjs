export function resolvePostFileName(cityId, availableFileNames) {
  const cityPostFileName = `${cityId}-post.json`
  return availableFileNames.has(cityPostFileName) ? cityPostFileName : 'post.json'
}
