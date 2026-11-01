---
name: codeowners
description: Match files against CODEOWNERS with GitHub-style last-match-wins patterns. Use codeowners_lookup for a read-only routing check.
whenToUse: "A PR or changed-file set needs CODEOWNERS routing, or a pattern needs a sanity check."
---

# CODEOWNERS

```text
Use codeowners_lookup with root=. and the changed files.
```

It reads `.github/CODEOWNERS`, `CODEOWNERS`, or `docs/CODEOWNERS`, evaluates patterns, and lets the
last matching pattern win.

## Limits

- Routing helper only; not an approval or enforcement system.
- Does not validate that owners exist or have access.
- No GitHub API; no branch protection semantics.
- Patterns are a practical subset; test unusual globs.
