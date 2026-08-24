# crm/ — split build of index.html

`index-split.html` is a **byte-for-byte equivalent duplicate** of `index.html` with every inline
`<style>` / `<script>` block moved into its own file here. The extraction was verified by
reconstructing the original from these files and diffing — identical, 2,176,458 bytes.

- `index.html` — untouched. Still the file everyone uses.
- `index-split.html` — same page, external CSS/JS. Safe place to work.

## Rules

- **Load order is the design.** The numeric prefix (`01-` … `41-`) is the original document order.
  CSS cascade and script execution both depend on it. Never reorder, never merge two files,
  never add a file without a number that places it correctly.
- `<link>` / `<script>` tags kept their original `id` attributes.
- CSS `url()` paths were rewritten `assets/…` → `../../assets/…` (resolved from `crm/css/`).
  JS paths are unchanged — those resolve against the document, which is still at project root.
- `website-builder.css` / `website-builder.js` were already external; untouched.
- The HTML shell is now 4,322 lines instead of 28,910.

## Map

| File | What it is |
|---|---|
| `css/01-mel-copilot-css.css` | Mel copilot panel |
| `css/02-ms-studio-css.css` | Marketing Studio |
| `css/03-ms-flow-css.css` | Marketing Studio flow |
| `css/04-msa-css.css` | Marketing Studio assets |
| `css/05-ms-v2-css.css` | Marketing Studio v2 |
| `css/06a-clients-page.css` | Clients page |
| `css/06b-clients-tx-additions.css` | Transactions-only additions inside the clients sheet |
| `css/07a-tokens-fonts.css` | @font-face — Mona Sans, Hubot Sans |
| `css/07b-tokens-fig-tokens.css` | Figma Variables (112 KB of raw token values) |
| `css/07c-tokens-colors.css` | Semantic colors, light + dark |
| `css/07d-tokens-typography.css` | Type scale tokens |
| `css/07e-tokens-radius.css` | Corner radius tokens |
| `css/07f-tokens-spacing.css` | Spacing / sizing / elevation tokens |
| `css/07g-tokens-base.css` | Base element defaults |
| `css/07h-ds-components.css` | DS component styles (Button → Table) |
| `css/08a-typography-override.css` | Type overrides (Mona/Hubot, no Inter, no mono) |
| `css/08b-transactions-additions.css` | Transactions-table-only additions |
| `css/09-my-work.css` | My work page |
| `css/10-page-visibility.css` | Initial page hide (`#cl-page`, `#mw-page`) |
| `css/11-tasks-sheet.css` | Tasks side sheet |
| `css/12a-txd-column-filters.css` | Price / client / status column-filter popovers |
| `css/12b-txd-stage-metrics.css` | Stage rail, metric cards, facts strip |
| `css/12c-txd-top-section.css` | **Top section** — photo-hero / flat variants, sale price, commission checklist. The brief lives here |
| `css/12d-txd-integrated-card.css` | Integrated transaction card, fact cells, one-line action row, checklist dropdown panel |
| `css/12e-txd-banner-hero.css` | Banner top section, property photo hero, lightbox, next action |
| `css/12f-txd-tabs-envelopes.css` | Tabs, columns, envelope list, forms rows |
| `css/12g-txd-details-popovers.css` | Rename affordance, scoped tasks, details, popovers, MLS/deal-email chips |
| `css/30-ms-packet-css.css` | Marketing packet |
| `css/34-pageloader-css.css` | Page loader |
| `css/36-ds-tweak-css.css` | DS tweak flags (`txd-ds-metrics`, `txd-ds-tabs`) |
| `css/38-ms-newflow-css.css` | Marketing Studio new flow |
| `js/13-app-core.js` | Shell bootstrap, transactions table, hover previews |
| `js/14-sonner-toast.js` | `window.sonner()` toast |
| `js/15-notifications.js` | Header bell + peek panel |
| `js/16-sidebar-shell.js` | Sidebar collapse / rail tooltips |
| `js/17-rds-filter-sheet.js` | Filter sheet |
| `js/18-clients-app.js` | Clients page |
| `js/19-clients-drawer.js` | Client drawer |
| `js/20-transaction-detail-page.js` | Transaction detail — checklist, popovers, action row |
| `js/21-mywork-app.js` | My work |
| `js/22-crm-router.js` | Page router |
| `js/23-tasks-module.js` | Tasks |
| `js/24-icons-phosphor.js` | Phosphor icon set for this page |
| `js/25-mel-copilot-js.js` | Mel copilot |
| `js/26-ms-studio-js.js` | Marketing Studio |
| `js/27-ms-ext-js.js` | Marketing Studio extensions |
| `js/28-mel-mark-tweak.js` | Mel avatar mark tweak |
| `js/29-ms-ring-tweak.js` | Marketing Studio ring tweak |
| `js/31-pke-share-panel.js` | Packet share panel |
| `js/32-ms-packet-js.js` | Marketing packet |
| `js/33-tx-tab-variants.js` | Transaction tab variants |
| `js/35-pageloader-js.js` | Page loader |
| `js/37-ds-tweak-chip.js` | DS tweak chip (hidden) |
| `js/39-ms-newflow-js.js` | Marketing Studio new flow |
| `js/40-scrim-safety-net.js` | Scrim safety net |
| `js/41-melchat-js.js` | Mel chat |

## `js/13-app-core.js` is deliberately not split

It is **one 155 KB IIFE** — a single closure. `data`, `renderTable()`, `STATUS_FAM`, `FA/FD`,
`active`, `passF()` and ~200 other bindings are private to it and referenced throughout.
Separate files get separate scopes, so cutting it anywhere breaks it; only the 1.1 KB avatar-hover
IIFE above it is independent, and moving that buys nothing.

Splitting it properly is a **refactor, not a cut**: hoist the shared state onto one namespace
(`window.TX = {}`), then move sections out one at a time, each behind a `TX.initX()` called in
the original order. That is a real change with real regression risk — do it one section at a time,
with a backup and a verify after each, never in one pass.

The CSS giants are done: `07` → 8 token/component sheets, `08` → 2, `06` → 2, `12` → 7.
Each split was verified by re-joining the parts and diffing against the original.
