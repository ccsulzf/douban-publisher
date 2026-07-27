export function hasExpectedImageDescriptions(actualDescriptions, imageBlocks) {
  const expectedDescriptions = imageBlocks
    .map(({ description }) => description)
    .filter(Boolean)
    .sort()
  return JSON.stringify([...actualDescriptions].sort()) === JSON.stringify(expectedDescriptions)
}
