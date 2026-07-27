import assert from 'node:assert/strict'
import test from 'node:test'

import { discardExistingDraft } from '../scripts/draft-modal.mjs'

function createPage({ visible }) {
  const events = []
  const restart = {
    click: async () => { events.push('click-restart') },
  }
  const modal = {
    waitFor: async ({ state, timeout }) => {
      events.push(`wait-${state}-${timeout ?? 'none'}`)
      if (state === 'visible' && !visible) throw new Error('not visible')
    },
    locator: (selector) => {
      assert.equal(selector, '.drc-modal-cancel')
      return restart
    },
  }
  return {
    page: {
      locator: (selector) => {
        assert.equal(selector, '.drc-modal.s')
        return {
          filter: ({ hasText }) => {
            assert.equal(hasText, '你有一篇草稿，要继续写吗？')
            return modal
          },
        }
      },
    },
    events,
  }
}

test('clicks 重新写 and waits for the draft modal to disappear', async () => {
  const { page, events } = createPage({ visible: true })

  assert.equal(await discardExistingDraft(page), true)
  assert.deepEqual(events, ['wait-visible-1500', 'click-restart', 'wait-hidden-none'])
})

test('continues when the draft modal does not appear', async () => {
  const { page, events } = createPage({ visible: false })

  assert.equal(await discardExistingDraft(page), false)
  assert.deepEqual(events, ['wait-visible-1500'])
})
