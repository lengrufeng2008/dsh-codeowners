#!/usr/bin/env node
import { loadCodeowners, lookup, changedFiles, renderMarkdown } from '../src/codeowners.mjs'
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) { console.log('dsh-codeowners [files...] [--root DIR] [--json]\\n\\nMatch files against CODEOWNERS. With no files, uses git diff --name-only HEAD.'); process.exit(0) }
const value = (n) => { const i = args.indexOf(n); return i === -1 ? undefined : args[i + 1] }
const root = value('--root') || process.cwd()
const files = args.filter((a) => !a.startsWith('--') && a !== root && args[args.indexOf(a) - 1] !== '--root')
try {
  const { path, entries } = await loadCodeowners(root)
  const list = files.length ? files : changedFiles(root)
  const result = { codeowners: path, files: lookup(list, entries) }
  if (args.includes('--json')) console.log(JSON.stringify(result, null, 2))
  else console.log(renderMarkdown(result))
} catch (error) { console.error(`dsh-codeowners: ${error.message}`); process.exitCode = 2 }
