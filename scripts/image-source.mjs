export function findNewImageSource(previousSources, currentSources) {
  return currentSources.find((source) => !previousSources.has(source)) ?? null
}

export function areUploadedImagesReady({ expectedCount, sources }) {
  return sources.length === expectedCount && sources.every((source) => source.startsWith('https://'))
}

export function areImageNodesReady({ expectedCount, imageCount, hasUploadingIndicator = false }) {
  return imageCount === expectedCount && !hasUploadingIndicator
}
