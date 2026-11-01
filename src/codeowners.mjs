import { readFile, stat } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
function globToRegExp(pattern) {
  let p = pattern
  const anchored = p.startsWith('/')
  if (anchored) p = p.slice(1)
  const isDir = /\/$/.test(p)
  p = p.replace(/\/+$/, '')
  let re = ''
  for (let i = 0; i < p.length; i++) {
    const ch = p[i]
    if (ch === '*') {
      if (p[i + 1] === '*') { re += '.*'; i++ } else re += '[^/]*'
    } else if (ch === '?') re += '[^/]'
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  if (!p.includes('/')) re = '(?:^|.*/)' + re + (isDir ? '(?:/.*)?$' : '$')
  else re = (anchored ? '^' : '(?:^|.*/)') + re + (isDir ? '(?:/.*)?$' : '$')
  return new RegExp(re)
}
export function parseCodeowners(text) {
  const entries = []
  for (const line of text.split('\n')) {
    const clean = line.replace(/#.*/, '').trim()
    if (!clean) continue
    const parts = clean.split(/\s+/)
    if (parts.length < 2) continue
    const [pattern, ...owners] = parts
    entries.push({ pattern, regex: globToRegExp(pattern), owners })
  }
  return entries
}
export async function loadCodeowners(root) {
  for (const file of ['.github/CODEOWNERS', 'CODEOWNERS', 'docs/CODEOWNERS']) {
    const path = join(root, file)
    if (await stat(path).catch(() => null)) return { path, entries: parseCodeowners(await readFile(path, 'utf8')) }
  }
  throw new Error('CODEOWNERS not found (.github/CODEOWNERS, CODEOWNERS, docs/CODEOWNERS)')
}
export function lookup(files, entries) {
  return files.map((file) => {
    const path = file.replace(/^\.\//, '')
    let owners = []
    for (const entry of entries) if (entry.regex.test(path)) owners = entry.owners
    return { file: path, owners, matched: owners.length > 0 }
  })
}
export function changedFiles(root) {
  const out = execFileSync('git', ['-C', root, 'diff', '--name-only', 'HEAD'], { encoding: 'utf8', timeout: 30_000 })
  return out.trim().split('\n').filter(Boolean)
}
export function renderMarkdown(result) {
  const lines = [`# CODEOWNERS: ${result.files.length} file(s)`, '']
  for (const item of result.files) lines.push(`- ${item.file} → ${item.matched ? item.owners.join(' ') : '(no match)'}`)
  lines.push('', 'Last matching pattern wins. This is a routing helper, not an approval system.')
  return lines.join('\n')
}
