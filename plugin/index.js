import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCodeowners, lookup, renderMarkdown } from '../src/codeowners.mjs'
const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const SKILL_PATH = join(PLUGIN_DIR, '..', 'skills', 'codeowners', 'SKILL.md')
const PROVIDER = 'dsh-codeowners'
export const name = 'codeowners'
export const inject = ['tools', 'skills']
function stripFrontmatter(text) { if (!text.startsWith('---\n')) return text; const end = text.indexOf('\n---\n', 4); return end === -1 ? text : text.slice(end + 5) }
const summary = { name: 'codeowners', description: 'Match files against CODEOWNERS with GitHub-style last-match-wins patterns. Read-only routing helper.', whenToUse: 'A PR/file set needs the CODEOWNERS owners, or a CODEOWNERS pattern needs a sanity check.', invocation: { modelInvocable: true, userInvocable: true }, source: 'bundled', provider: PROVIDER, resourceBase: { kind: 'directory', path: join(PLUGIN_DIR, '..', 'skills', 'codeowners') }, rank: 600, locator: 'codeowners', metadata: { domain: 'git', version: '0.1.0' } }
export function apply(ctx) {
  ctx.tools.register({ name: 'codeowners_lookup', description: 'Match files against a repository CODEOWNERS file. Read-only; last matching pattern wins; not an approval system.', parameters: { type: 'object', additionalProperties: false, properties: { root: { type: 'string' }, files: { type: 'array', items: { type: 'string' } } }, required: ['root', 'files'] }, output: { schema: { type: 'object', additionalProperties: false, properties: { markdown: { type: 'string' }, files: { type: 'integer' }, unmatched: { type: 'integer' } }, required: ['markdown', 'files', 'unmatched'] }, render: (_a, v) => [{ type: 'text', text: v.markdown }] }, timeoutMs: 20_000, async execute(args = {}) { const { path, entries } = await loadCodeowners(args.root); const r = { codeowners: path, files: lookup(args.files || [], entries) }; return { markdown: renderMarkdown(r), files: r.files.length, unmatched: r.files.filter((x) => !x.matched).length } } })
  ctx.skills.registerProvider(() => ({ name: PROVIDER, async list() { return [summary] }, async get(c) { if (c?.name !== 'codeowners') return undefined; return { ...summary, content: stripFrontmatter(await readFile(SKILL_PATH, 'utf8')) } } }))
}
