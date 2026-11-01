# CODEOWNERS for DSH

> Read-only file-to-owner routing with GitHub-style last-match-wins CODEOWNERS patterns.

## Use

```bash
node bin/dsh-codeowners.mjs --root . docs/a.md src/a.js
node bin/dsh-codeowners.mjs --root . --json
```

In DSH:

```text
Use codeowners_lookup with root=. and the changed files.
```

## Limits

- Routing helper, not approval/enforcement
- No GitHub API, owner validation, or branch protection
- Practical glob subset; test unusual patterns

## Tests

```bash
npm test
```

## Provenance

A small independent matcher. License: MIT.
