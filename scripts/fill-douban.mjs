import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { cdpConnectOptions, cdpEndpoint } from './browser.mjs'
import { connectOrLaunchChrome, launchChrome, waitForCdpReady } from './browser-launch.mjs'
import { hasExpectedImageDescriptions } from './caption-verification.mjs'
import { discardExistingDraft } from './draft-modal.mjs'
import { dismissDialogSafely } from './dialog.mjs'
import { applyDeferredFormats } from './editor-format-plan.mjs'
import { selectExactText } from './editor-selection.mjs'
import { applyToolbarFormat, clearActiveToolbarFormats } from './editor-toolbar.mjs'
import { writeEditorBlock } from './editor-writer.mjs'
import { setFileFromChooser } from './file-chooser.mjs'
import { fillBlocks, imageFailurePlaceholder } from './fill-blocks.mjs'
import { parseCityId, selectGroups } from './groups.mjs'
import { fillImageDescriptionsBySource } from './image-description.mjs'
import { areImageNodesReady, findNewImageSource } from './image-source.mjs'
import { resolveImagePath } from './images.mjs'
import { normalizePost, renderEditorText, renderPlainText } from './post.mjs'
import { resolvePostFileName } from './post-source.mjs'
import { FORM_READY_TIMEOUT_MS, isFormReady } from './readiness.mjs'
import { finishRun } from './run-finish.mjs'
import { EDITOR_SELECTORS, TITLE_SELECTORS } from './selectors.mjs'
import { canonicalText, comparableText } from './text.mjs'
import { confirmImageUpload } from './upload-dialog.mjs'
import { waitForUploadStep } from './upload-step.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = resolve(root, 'output')
const IMAGE_UPLOAD_TIMEOUT_MS = 120_000
const cityId = parseCityId(process.argv.slice(2))
const cities = JSON.parse(await readFile(resolve(root, 'config/groups.json'), 'utf8'))
const groups = selectGroups(cities, cityId)
const postFileName = resolvePostFileName(cityId, new Set(await readdir(outputDir)))
const post = normalizePost(JSON.parse(await readFile(resolve(outputDir, postFileName), 'utf8')))

const { chromium } = await import('playwright')
await mkdir(outputDir, { recursive: true })

const endpoint = cdpEndpoint()
const browser = await connectOrLaunchChrome({
  chromium,
  endpoint,
  connectOptions: cdpConnectOptions(),
  launch: () => launchChrome({ endpoint }),
  waitForReady: () => waitForCdpReady(endpoint),
})
const context = browser.contexts()[0]
if (!context) throw new Error('No browser context is available from the local Chrome debugging endpoint.')

async function writeInspection(page, reason, index, editor, details = {}) {
  const inspection = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    inputs: [...document.querySelectorAll('input, textarea')].map((element) => ({
      tag: element.tagName.toLowerCase(),
      name: element.getAttribute('name'),
      id: element.id,
      placeholder: element.getAttribute('placeholder'),
      type: element.getAttribute('type'),
    })),
    contenteditables: [...document.querySelectorAll('[contenteditable]')].map((element) => ({
      tag: element.tagName.toLowerCase(),
      id: element.id,
      className: element.className,
      contenteditable: element.getAttribute('contenteditable'),
    })),
    iframes: [...document.querySelectorAll('iframe')].map((element) => ({ id: element.id, className: element.className, name: element.getAttribute('name') })),
  }))
  const editorText = editor ? await editor.innerText().catch(() => null) : null
  const editorImageCount = editor ? await editor.locator('img').count().catch(() => null) : null
  await writeFile(resolve(outputDir, `page-inspection-${cityId}-${index + 1}.json`), JSON.stringify({ reason, inspection, editorText, editorImageCount, ...details }, null, 2))
}

async function findTitleInput(page) {
  for (const selector of TITLE_SELECTORS) {
    const locator = page.locator(selector).first()
    if (await locator.count() && await locator.isVisible()) return locator
  }
  return null
}

async function findEditor(page) {
  for (const selector of EDITOR_SELECTORS) {
    const editor = page.locator(selector).first()
    if (await editor.count() && await editor.isVisible()) return { kind: 'page', target: editor }
  }

  for (const frame of page.frames()) {
    const body = frame.locator('body[contenteditable="true"], body[contenteditable="plaintext-only"]')
    if (await body.count() && await body.isVisible()) return { kind: 'frame', target: body }
  }
  return null
}

async function waitForUploadedImages(page, editor, expectedCount) {
  const deadline = Date.now() + IMAGE_UPLOAD_TIMEOUT_MS
  do {
    const imageCount = await editor.locator('.DRE-image').count()
    const hasUploadingIndicator = await editor.getByText('上传中...', { exact: true }).count() > 0
    if (areImageNodesReady({ expectedCount, imageCount, hasUploadingIndicator })) {
      return
    }
    await page.waitForTimeout(300)
  } while (Date.now() < deadline)
  throw new Error('The uploaded image did not finish in the rich-text editor within 120 seconds')
}

async function imageSources(editor) {
  return editor.locator('.DRE-image img').evaluateAll((images) => images.map((image) => image.src).filter(Boolean))
}

async function waitForUploadedImageSource(page, editor, previousSources) {
  const deadline = Date.now() + IMAGE_UPLOAD_TIMEOUT_MS
  do {
    const sources = await imageSources(editor)
    const source = findNewImageSource(previousSources, sources)
    const hasUploadingIndicator = await editor.getByText('上传中...', { exact: true }).count() > 0
    if (source?.startsWith('https://') && !hasUploadingIndicator) return source
    await page.waitForTimeout(300)
  } while (Date.now() < deadline)
  throw new Error('The uploaded image did not receive a final URL within 120 seconds')
}

async function uploadImage(page, editor, imageBlock) {
  const { path: imagePath } = imageBlock
  const mediaButton = page.locator('.DRE-action-button.DRE-media-button').first()
  if (!await mediaButton.count() || !await mediaButton.isVisible()) {
    throw new Error('Could not find the rich-text media button')
  }

  const previousImageCount = await editor.locator('.DRE-image').count()
  const previousSources = new Set(await imageSources(editor))
  await setFileFromChooser(page, mediaButton, await resolveImagePath(root, imagePath))

  const uploadMode = page.getByText('图文混排', { exact: true }).last()
  const step = await waitForUploadStep({
    previousImageCount,
    getImageCount: () => editor.locator('.DRE-image').count(),
    isModeVisible: async () => await uploadMode.count() > 0 && await uploadMode.isVisible(),
    wait: (timeout) => page.waitForTimeout(timeout),
    timeoutMs: FORM_READY_TIMEOUT_MS,
  })
  if (step === 'confirm') {
    await uploadMode.click()
    await confirmImageUpload(page)
  }
  return waitForUploadedImageSource(page, editor, previousSources)
}

function expectedTextAfterImageFailures(post, failures) {
  const failedPaths = new Set(failures.map(({ path }) => path))
  return renderEditorText({
    ...post,
    blocks: post.blocks.flatMap((block) => {
      if (block.type !== 'image') return [block]
      return failedPaths.has(block.path)
        ? [{ type: 'paragraph', text: imageFailurePlaceholder(block.path) }]
        : []
    }),
  })
}

async function setRichText(page, locator, blocks) {
  await locator.click()
  await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A')
  await locator.press('Backspace')
  await clearActiveToolbarFormats(page)

  const uploadedImageSources = new Map()
  const imageFailures = await fillBlocks({
    blocks,
    writeText: async (text, type, url, block) => {
      const textBlock = block ?? { text, type, url }
      await writeEditorBlock(locator, textBlock)
    },
    separator: async () => {
      await locator.press('Enter')
    },
    insertDivider: async () => {
      await applyToolbarFormat(page, 'divider')
    },
    insertImage: async (imageBlock) => {
      try {
        uploadedImageSources.set(imageBlock.path, await uploadImage(page, locator, imageBlock))
      } catch (error) {
        await page.keyboard.press('Escape').catch(() => {})
        throw error
      }
    },
  })
  await applyDeferredFormats({
    editor: locator,
    page,
    blocks,
    selectText: selectExactText,
    applyFormat: applyToolbarFormat,
  })
  return { imageFailures, uploadedImageSources }
}

async function readTextOutsideImages(editor) {
  return editor.evaluate((element) => {
    const copy = element.cloneNode(true)
    copy.querySelectorAll('.DRE-image, .DRE-editable-block-opts').forEach((node) => node.remove())
    return copy.innerText
  })
}

async function readImageDescriptions(editor) {
  return editor.locator('.DRE-image').evaluateAll((nodes) => nodes.map((node) => (
    node.querySelector('textarea')?.value
      ?? node.querySelector('.DRE-caption-input-placeholder')?.textContent?.trim()
      ?? ''
  )).filter(Boolean))
}

async function fillGroup(page, group, index) {
  const screenshotPath = resolve(outputDir, `preview-${cityId}-${index + 1}.png`)
  try {
    await page.goto(group.postUrl, { waitUntil: 'domcontentloaded' })
    const discardedDraft = await discardExistingDraft(page)
    if (discardedDraft) console.log(`${group.name}: discarded the existing draft and started a new post.`)

    const deadline = Date.now() + FORM_READY_TIMEOUT_MS
    let titleInput = null
    let editor = null
    do {
      titleInput = await findTitleInput(page)
      editor = await findEditor(page)
      if (isFormReady({ hasTitle: titleInput != null, hasEditor: editor != null })) break
      await page.waitForTimeout(500)
    } while (Date.now() < deadline)

    if (!titleInput || !editor) {
      await writeInspection(page, `The title input or rich-text editor did not appear within 20 seconds for ${group.name}. Log in manually if needed, then run again.`, index, editor?.target)
      throw new Error('Could not find the title input or rich-text editor.')
    }

    await titleInput.fill(post.title)
    const { imageFailures, uploadedImageSources } = await setRichText(page, editor.target, post.blocks)
    for (const { path, error } of imageFailures) {
      console.error(`${group.name}: image ${path} failed: ${error instanceof Error ? error.message : error}`)
    }

    const imageBlocks = post.blocks.filter((block) => block.type === 'image')
    await waitForUploadedImages(page, editor.target, imageBlocks.length)
    const descriptionsBySource = new Map(imageBlocks.map((block) => [
      uploadedImageSources.get(block.path),
      block.description,
    ]))
    await fillImageDescriptionsBySource(editor.target.locator('.DRE-image'), descriptionsBySource)

    const actualBody = canonicalText(await readTextOutsideImages(editor.target))
    const actualDescriptions = await readImageDescriptions(editor.target)
    const expectedBody = canonicalText(expectedTextAfterImageFailures(post, imageFailures))
    if (comparableText(actualBody) !== comparableText(expectedBody) || !hasExpectedImageDescriptions(actualDescriptions, imageBlocks)) {
      await writeInspection(page, 'Rich-text editor content did not match post.json after insertion.', index, editor.target, {
        actualBody,
        expectedBody,
        actualDescriptions,
        imageFailures: imageFailures.map(({ path, error }) => ({
          path,
          message: error instanceof Error ? error.message : String(error),
        })),
      })
      throw new Error('Editor verification failed; nothing was published.')
    }

    await page.screenshot({ path: screenshotPath, fullPage: true })
    console.log(`Filled ${group.name}. Preview saved to ${screenshotPath}; no publish action was taken.`)
    return true
  } catch (error) {
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {})
    console.error(`${group.name}: ${error instanceof Error ? error.message : error}`)
    return false
  }
}

const pages = await Promise.all(groups.map(async () => {
  const page = await context.newPage()
  page.on('dialog', dismissDialogSafely)
  return page
}))
const results = await Promise.all(groups.map((group, index) => fillGroup(pages[index], group, index)))
if (results.some((success) => !success)) {
  finishRun(1)
} else {
  console.log(`Filled ${groups.length} group page(s) for ${cityId}; no publish action was taken.`)
  finishRun(0)
}
