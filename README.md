# Radius CRM

Static HTML/CSS/JS prototype of the Radius CRM transactions experience. Single-file app — the whole UI lives in `index.html` (~1.5MB) with Radius UI 3.0 design tokens inlined.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (Vercel)
Import this repo into Vercel with framework preset **Other**, no build command, output directory = repo root. `vercel.json` handles caching + clean URLs.

## Layout
| Path | Purpose |
|------|---------|
| `index.html` | The application (self-contained) |
| `assets/` | Static assets (images, fonts) |
| `_ds/` | Design-system reference (inlined into index.html) |
| `staging/` | WIP specs/prototypes, not wired in |
| `backups/` | Restore-only copy of index.html |
| `*.js`, `*.css` | Website-builder / support modules |

## Notes
- Primary brand color: Radius indigo `#5A5FF2`.
- `uploads/` is excluded (192MB of unreferenced recursive copies).
