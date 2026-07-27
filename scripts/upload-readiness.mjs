export function isUploadComplete({ imageCount, previousCount, hasUploadingIndicator }) {
  return imageCount > previousCount && !hasUploadingIndicator
}
