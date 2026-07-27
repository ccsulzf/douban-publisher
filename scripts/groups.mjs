function readOption(args, option, fallback) {
  const index = args.indexOf(option)
  if (index === -1) return fallback
  const value = args[index + 1]
  if (typeof value !== 'string' || value.trim() === '' || value.startsWith('--')) {
    throw new Error(`Use ${option} <key> to select a configured value`)
  }
  return value.trim()
}

export function parseCityId(args) {
  return readOption(args, '--city', 'wuhan')
}

export function selectGroups(cities, cityId) {
  const groups = cities?.[cityId]
  if (!Array.isArray(groups) || groups.length === 0) {
    throw new Error(`Unknown city: ${cityId}`)
  }
  return groups.map((group, index) => {
    if (group == null || typeof group !== 'object') {
      throw new Error(`Group ${cityId}[${index}] must be an object`)
    }
    if (typeof group.name !== 'string' || group.name.trim() === '') {
      throw new Error(`Group ${cityId}[${index}] must have a non-empty name`)
    }
    if (typeof group.postUrl !== 'string') {
      throw new Error(`Group ${cityId}[${index}] must have a postUrl`)
    }
    const url = new URL(group.postUrl)
    if (url.protocol !== 'https:' || url.hostname !== 'www.douban.com' || !url.pathname.endsWith('/new_topic')) {
      throw new Error(`Group ${cityId}[${index}] postUrl must be a Douban HTTPS new_topic URL`)
    }
    return { name: group.name.trim(), postUrl: url.toString() }
  })
}
