# STAGES.md — Feed Post Picker rebuild (Marketing Studio)

**Pick-up doc for new chats.** Read `CLAUDE.md` first for context. This file breaks the 7 stages into executable steps. Do ONE stage per chat turn. Stop after each. Wait for "go" before the next.

> Screen: `index.html` → **Marketing Studio → Pick a design for the feed post**.
> Direction: Instagram-style inline picker. No popups. No modals.
> Rule: Backup `index.html` → `backups/index.backup.html` **before every write**.
> Rule: Editable-first. Every visible label is literal HTML markup. JS only toggles classes / swaps attributes.
> Rule: Radius UI 3.0 only. Indigo `#5A5FF2` primary. Mel gradient = Mel identity only.

---

## Stage 0 — Audit (report only, zero edits)

**Goal:** Understand what's actually in `index.html` today before touching it.

**Do:**
1. `grep` `index.html` for markers around the picker section: `Marketing Studio`, `Pick a design`, `Let Mel pick`, `Want to make something else`, `Wave`, `Feature sheet`, `Editorial`, `Collage`, `Minimal`.
2. `read_file` the picker markup with narrow offset+limit around each grep hit. Do NOT read the full file.
3. Note:
   - Line range where the picker lives.
   - Where the listing data (`1420 Grove St`, `$1,285,000`, photo URL) is sourced from.
   - Which template thumb images the current cards use.
   - Whether text is literal markup or built in JS.
   - Existing filter-chip markup / class names.
   - Existing button/CTA patterns already used elsewhere in the page (to reuse the same class names).
4. Also check `Post Templates.dc.html`, `Header Options.dc.html`, and `staging/` for existing template-card patterns to reuse.
5. Confirm `_ds/radius-ui-design-system-c7220bb1-3534-4549-94e9-dd1c4d80b981/` is loaded in `index.html`.

**Output (report only):**
- One-line root cause.
- Existing markup range for the picker (start/end line).
- Real listing data source path.
- Refined step list for Stage 1.
- Any surprises.

**Stop. Wait for user "go stage 1".**

---

## Stage 1 — Page head + format tabs ✅ DONE

**Goal:** Replace centered marketing-y header with dense Radius CRM head + add format segmented control.

**Do:**
1. **Backup:** `copy_files` `index.html` → `backups/index.backup.html` (overwrite).
2. `str_replace_edit` on the existing centered header block. Replace with:
   ```
   Eyebrow: "Marketing Studio" (small caps, muted, muted-fg)
   H2 title: "Feed post" (Hubot Sans, 20-24px, sentence case)
   Meta line (one row): "1420 Grove St · $1,285,000 · Just listed" (14px Mona Sans, muted-fg, tabular nums for price)
   Right side actions: [Change listing] ghost button + [Let Mel pick] indigo primary button
   Layout: left-align, one row for title+actions, meta as second row under title
   ```
3. Directly under the head, add the **format segmented control**:
   ```
   Tabs: Post 1:1 · Story 9:16 · Reel 9:16 · Flier · Email header
   Selected default: Post 1:1
   Selected state: indigo #5A5FF2 underline + weight 600
   Each tab: label + count (e.g. "Post 1:1 · 12")
   Full-width row, sits sticky under the page head
   ```
4. **Delete** the floating `Let Mel pick` pill that was top-right of the filter chip row.
5. **Delete** the bottom `Want to make something else?` pill.
6. All labels, counts, listing meta = literal HTML text. No JS-generated strings.

**Acceptance:**
- Click "Feed post", "1420 Grove St", "$1,285,000", any tab label → all editable.
- Format tabs render, Post 1:1 selected by default.
- No orange Mel gradient on head or tabs.
- Head is left-aligned, dense, one screen height ~120px max.

**Stop. `ready_for_verification`. Wait for user "go stage 2".**

---

## Stage 1a — Template card → "existing vs upload" screen

**Goal:** When agent selects a template card, route to a new screen that asks: pick from existing templates or upload a new one.

**Do:**
1. **Backup.**
2. Add a new `.msnfs` screen `data-nf="tplsource"` between the template picker and the gen screen.
3. Screen contents (all literal HTML markup):
   - Back link: `Want to change the design?` → returns to `templates` screen.
   - Header eyebrow: `Marketing Studio`.
   - H2: `Use this design or upload your own?`
   - Meta line: `<selected template name> · 1420 Grove St`.
   - Two choice cards, side-by-side:
     - **Use existing template** — icon (grid/layers), title, one-line benefit (`Start from Mel's <template> layout and edit copy.`), primary CTA `Use this design →` (indigo).
     - **Upload new template** — icon (upload cloud), title, one-line benefit (`Bring your own PNG/PSD/Figma frame — Mel matches the copy.`), ghost CTA `Upload file →`.
4. Route wiring:
   - Clicking a template card no longer jumps straight to `gen`. It sets the selection then advances to `tplsource`.
   - `Use this design →` on the existing card advances to `gen` (current behavior).
   - `Upload file →` opens a file picker (stub — no upload backend yet; just log + advance to `gen` with a `custom` template key).
5. All titles, benefits, CTAs = literal HTML text. JS only toggles screen classes.

**Acceptance:**
- Select any template card → lands on the new `tplsource` screen with the picked template name in the meta line.
- Both choice cards render; existing = primary indigo CTA, upload = ghost CTA.
- Back link returns to template picker with the previous selection intact.
- No popups, no modals.

**Stop. Verify. Wait for "go stage 2".**

---

## Stage 2 — 2-column layout scaffold

**Goal:** Split the picker body into 55/45 columns. Placeholders only.

**Do:**
1. **Backup.**
2. Wrap picker body (below the format tabs, above the old grid) in a two-column CSS grid:
   ```
   grid-template-columns: 55% 45%
   gap: 24px
   left column: id="feedPreview" — empty framed placeholder box, aspect-square (1:1) inside a card
   right column: id="feedTemplateList" — empty framed placeholder inside a card
   ```
3. Move the filter chip row (`All · Bold · Editorial · Minimal`) INTO the right column, above the (still empty) grid area.
4. Do NOT rebuild the cards yet. Just move existing chip markup.
5. Give both columns a min-height so layout doesn't collapse.

**Acceptance:**
- Layout holds at 1440 and 1920 viewport widths.
- Left preview panel is roughly square (1:1) since Post is the default format.
- Filter chips visible in the right column above the empty grid area.
- No console errors.

**Stop. Verify. Wait for "go stage 3".**

---

## Stage 3 — Template grid (right column)

**Goal:** Rebuild the 5 template cards as REAL template shapes, grouped by use case, with proper selected state.

**Do:**
1. **Backup.**
2. Rebuild filter chips with typography that matches each template:
   ```
   All (Mona Sans regular) · counts "12"
   Bold (Hubot Sans heavy condensed) · counts "4"
   Editorial (Newsreader / serif italic) · counts "3"
   Minimal (Mona Sans thin) · counts "5"
   ```
   Selected chip: flat indigo `#5A5FF2` bg + white text. NEVER Mel gradient.
3. Add two section headers inside the grid area:
   - `Suggested for just-listed` (with a small sparkle icon — Mel-curated 3 templates)
   - `All templates`
4. Rebuild each card so the preview renders the **real template shape**, not a stock photo:
   - **Wave** — real listing photo, price gradient band at bottom, address under price.
   - **Feature sheet** — photo top, tight stack of price + address + `3 bd · 2 ba · 1,510 sqft` under it.
   - **Editorial** — small-caps eyebrow "JUST LISTED", serif h3 "Noe Valley" ABOVE a smaller photo, price + address below.
   - **Collage** — 4-tile mini grid of listing photos with `$1,285,000` centered pill on top.
   - **Minimal** — full photo with a single 12px caption line beneath: `1420 Grove St · $1,285,000`.
5. Selected card state:
   - 2px `#5A5FF2` ring (outline offset -2 or box-shadow inset).
   - Subtle indigo bg wash (`#5A5FF2` at 4% opacity).
6. Card lockup: preview + one-line benefit under it. **Drop** the redundant category label on the card (Bold/Editorial/Minimal is already the section header and filter chip).
   - Wave: `Loud price. Best for new listings.`
   - Feature sheet: `Full spec sheet. Best for open houses.`
   - Editorial: `Serif eyebrow. Best for luxury.`
   - Collage: `Multi-photo grid. Best for portfolios.`
   - Minimal: `Photo speaks. Best for iconic properties.`
7. Trailing grid tile: `See all 24 templates →` (indigo text on white, dashed border card).
8. JS: clicking any card toggles a `.is-selected` class on that card (removes it from siblings). No content is generated in JS. The preview swap in Stage 4 will read the selected card's `data-template` attribute.
9. Hover: card lifts (`transform: translateY(-2px)`) + shadow-md. 150ms ease.

**Acceptance:**
- Every visible price, address, benefit line, section header, chip label → click-editable.
- The 5 cards LOOK different from each other at a glance.
- Selected state is obvious (indigo ring visible from across the room).
- Filter chips render in their template's typography.
- Grid is 2-col, no empty slot, `See all →` closes it out.

**Stop. Verify. Wait for "go stage 4".**

---

## Stage 4 — Big live preview (left column)

**Goal:** Render the selected template large in the left column with real listing data + Instagram-post chrome.

**Do:**
1. **Backup.**
2. In the left column, above the preview canvas, add the Instagram-post chrome (all editable HTML):
   - Small circular avatar (agent photo or initial), handle `@moya.realtor`, tiny `·`, `Just now`.
   - Right-side `⋯` overflow icon.
3. Preview canvas: 1:1 aspect ratio, wraps a single visible template variant. Render 5 sibling variant blocks under `id="feedPreview"`, only `.is-active` shows. Default active = Wave.
4. Each variant block renders the SAME template shape as the corresponding grid card, but scaled up (all text still literal markup, ~3x larger).
5. Under preview: engagement row chrome (like / comment / share ghost icons + `Add a caption…` placeholder text — ghosted, not interactive yet).
6. Below the whole preview block, action row:
   - `Use this design →` — indigo primary, full expressive.
   - `Regenerate copy` — ghost.
   - `Export PNG` — ghost.
7. JS: when a card gets `.is-selected` in the grid, toggle `.is-active` on the matching preview variant block by matching `data-template` on card ↔ variant. No text is generated; only classes flip.

**Acceptance:**
- Click Wave card → left preview shows Wave with `$1,285,000` on the photo.
- Click Editorial card → preview switches to Editorial layout with `JUST LISTED / Noe Valley` above the photo.
- All caption/handle/price/address text is click-editable.
- Instagram chrome is subtle grey, does not compete with the design.
- `Use this design →` sits under the preview, primary indigo, not floating.

**Stop. Verify. Wait for "go stage 5".**

---

## Stage 5 — Accent color chips + live recolor

**Goal:** Add 4 accent color chips below the preview. Click chip → preview accent recolors live.

**Do:**
1. **Backup.**
2. Under preview action row, add a labelled row:
   ```
   Label: "Accent color"
   4 swatches, 24px circles:
   - Indigo #5A5FF2 (default, selected)
   - Slate #0A0A0A
   - Sand #C9A56B
   - Sage #6DA544
   ```
3. Selected swatch: 2px `#5A5FF2` ring around it (or currentColor ring at 2px offset).
4. JS: click a swatch → set a CSS variable `--feed-accent` on `#feedPreview` root. All accent-y elements inside variants read `background: var(--feed-accent, #5A5FF2)` or `color: var(--feed-accent, #5A5FF2)`.
5. In each variant markup, tag the accent-carrying element with the CSS var (price band on Wave, eyebrow on Editorial, price pill on Collage, etc). No JS-generated text.

**Acceptance:**
- Click Sand swatch → Wave's price band recolors sand instantly. Preview swaps colors, cards in the grid do not.
- Swatches themselves are hard-coded literal HTML.
- Default remains indigo on refresh.

**Stop. Verify. Wait for "go stage 6".**

---

## Stage 6 — Format-tab wiring

**Goal:** Post/Story/Reel/Flier/Email actually change the preview aspect ratio AND filter which templates show.

**Do:**
1. **Backup.**
2. Each tab carries `data-format` (`post` `story` `reel` `flier` `email`) and a real per-format count in its label.
3. Each template card carries `data-formats="post story reel"` (space-separated list of formats it supports).
4. JS on tab click:
   - Toggle `.is-selected` on the tab.
   - Set `data-format` on the picker root.
   - Update `#feedPreview` aspect ratio via a class (`.is-post`, `.is-story`, `.is-reel`, `.is-flier`, `.is-email`) — 1:1, 9:16, 9:16, 8.5x11 letter, 2:1.
   - Show/hide grid cards based on whether their `data-formats` contains the selected format (`.is-hidden`).
   - Update per-tab counts? No — counts are literal in markup; user can hand-edit later.
5. If the currently selected card is hidden by the new format, auto-select the first visible card.

**Acceptance:**
- Click Story tab → preview goes tall 9:16. Some templates disappear from the grid.
- Click Post again → preview goes back to 1:1, all 5 templates visible.
- Tab labels remain literal markup, editable.
- No layout collapse between formats.

**Stop. Verify. Wait for "go stage 7".**

---

## Stage 7 — Final acceptance

**Goal:** Ship-check the whole picker.

**Do:**
1. Walk the entire picker and click every visible text → editable? If not, that text was generated in JS. Move it back to markup.
2. Confirm selected state is visible on BOTH: the grid card AND the preview variant.
3. Confirm all 5 format tabs work.
4. Confirm all 4 accent swatches work.
5. Confirm `Let Mel pick` in the head triggers something (at minimum: cycles a "Mel picked X" toast — or auto-selects the first `Suggested for just-listed` card).
6. Confirm no popups, no modals, no floating pills.
7. Confirm no console errors.
8. Confirm no `React.createElement`, no `innerHTML`, no template-literal HTML injections were added.
9. `ready_for_verification({path: "index.html"})`.

**Stop. Report.**

---

## New-chat onboarding checklist

Read in this order when starting fresh:
1. `CLAUDE.md` — project rules + session log + traps.
2. `STAGES.md` (this file) — the 7-stage plan.
3. The current stage's step block only.
4. `grep` `index.html` for the section you're about to touch. Do NOT read the whole file.

Never skip a stage. Never combine stages. If a stage fails review, redo THAT stage from spec — no patch-on-patch.
