import test from 'node:test'
import assert from 'node:assert/strict'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCodeowners, lookup } from '../src/codeowners.mjs'
import { apply } from '../plugin/index.js'
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
test('last matching pattern wins, including directory patterns', async () => {
  const { entries } = await loadCodeowners(join(ROOT, 'test/fixtures'))
  const result = lookup(['docs/a.md', 'src/a.js', 'README.md'], entries)
  assert.deepEqual(result[0].owners, ['@docs-team'])
  assert.deepEqual(result[1].owners, ['@frontend'])
  assert.deepEqual(result[2].owners, ['@default'])
})
test('plugin registers codeowners_lookup and codeowners', async () => {
  const tools = []; let factory
  apply({ tools: { register: (t) => tools.push(t) }, skills: { registerProvider: (fn) => { factory = fn } } })
  assert.equal(tools[0].name, 'codeowners_lookup')
  const result = await tools[0].execute({ root: join(ROOT, 'test/fixtures'), files: ['docs/a.md'] })
  assert.equal(result.files, 1)
  assert.equal((await factory().list())[0].name, 'codeowners')
})
