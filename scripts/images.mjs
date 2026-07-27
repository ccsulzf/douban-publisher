import { access, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp'])

export async function resolveImagePath(projectRoot, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath.startsWith('materials/images/') || relativePath.includes('..')) {
    throw new Error('image path must be inside materials/images')
  }
  if (!IMAGE_EXTENSIONS.has(extname(relativePath).toLowerCase())) {
    throw new Error('image path must use a supported image extension')
  }

  const imageRoot = resolve(projectRoot, 'materials/images')
  const absolutePath = resolve(projectRoot, relativePath)
  if (!absolutePath.startsWith(`${imageRoot}${sep}`)) {
    throw new Error('image path must be inside materials/images')
  }
  await access(absolutePath)
  if (!(await stat(absolutePath)).isFile()) {
    throw new Error('image path must reference a file')
  }
  return absolutePath
}
