# Project rules

## Backups (mandatory)
- `backups/index.backup.html` holds the last known-good copy of `index.html`.
- **Before every change to `index.html`**: copy the current `index.html` over `backups/index.backup.html` (overwrite the previous one), then make the edit.
- Nothing in the project references `backups/` — it is restore-only. Never link, import, or load from it.
- To recover: copy `backups/index.backup.html` over `index.html`.

## Editing rules for index.html
- Never do blind offset/`indexOf` slicing on this file. Use exact-string replacements that are verified to match, or the editing tool.
- Primary colour is Radius indigo `#5A5FF2` (Radius UI Design System) — never neutral-900/black as primary.
