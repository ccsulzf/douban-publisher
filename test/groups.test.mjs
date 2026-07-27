import assert from 'node:assert/strict'
import test from 'node:test'

import { parseCityId, selectGroups } from '../scripts/groups.mjs'

const cities = {
  wuhan: [
    { name: '武汉租房', postUrl: 'https://www.douban.com/group/551383/new_topic' },
  ],
  shanghai: [
    { name: '上海租房一组', postUrl: 'https://www.douban.com/group/shanghai-one/new_topic' },
    { name: '上海租房二组', postUrl: 'https://www.douban.com/group/shanghai-two/new_topic' },
  ],
}

test('defaults to the Wuhan city for backwards compatibility', () => {
  assert.equal(parseCityId([]), 'wuhan')
})

test('reads a city key from the command line without requiring a group key', () => {
  assert.equal(parseCityId(['--city', 'shanghai']), 'shanghai')
})

test('selects every configured group for a city and rejects unknown cities', () => {
  assert.deepEqual(selectGroups(cities, 'shanghai'), cities.shanghai)
  assert.throws(() => selectGroups(cities, 'missing'), /unknown city/i)
})
