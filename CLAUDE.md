# Project rules

## Active briefs
- `TRANSACTION-TOP-SECTION-BRIEF.md` — CEO (Biju) feedback on the **transaction profile top section**, from Slack DM `C0BPVHYFETD` (2026-08-20). Read it before touching that section. Its requirements are binding: no boxes per info item, compress the overview, commission checklist behind a click (never status-driven) with an update indicator on the button next to gross commission, keep the property photo, reuse the old top row. Biju's call overrides Jessica's earlier "checklist in the productivity section" note.

## Backups (mandatory)
- `backups/index.backup.html` holds the last known-good copy of `index.html`.
- **Before every change to `index.html`**: copy the current `index.html` over `backups/index.backup.html` (overwrite the previous one), then make the edit.
- Nothing in the project references `backups/` — it is restore-only. Never link, import, or load from it.
- To recover: copy `backups/index.backup.html` over `index.html`.
- **A fresh backup before EVERY edit, not once per session.** One backup taken at the start of a long session is worthless — by the tenth edit it is ten edits stale, and restoring it silently destroys hours of approved work.
- **Never restore a backup on your own initiative.** "You broke it" means fix the specific defect, not roll back. A restore is destructive and irreversible here; ask first, always, and say exactly what will be lost.
- After any restore or bulk rewrite, **re-read the file and list what is actually present** before reporting state. Do not claim a change "survived" without verifying it in the file.

## Transaction top section — layout invariants (learned the hard way)
- **Never make a rule that hides or truncates CTA labels at some width.** A width breakpoint added to fix one request silently strips the labels the next time a column width changes. Fixed values only: the CTA row is ~630px, the left column is 667px (630 + 18px padding each side), and the labels always render in full.
- **Top section height budget is 276px (photo min 276px, right card stretches to match).** The docs/envelopes columns are `position:sticky` with `max-height:calc(100vh - 288px)` — that offset is derived from the top-section height and **must be updated together with it**. Changing one without the other pushes the page into outer scroll and the section slides under the sticky columns.
- The 1/12 badge, the carousel dots and the CTA row all end on the same right edge (19px inset). Changing the column width means re-checking all three.

## Icons (STRICT — no exceptions)
- **Phosphor only.** The Phosphor icon font is vendored at `src/regular/style.css` (already linked in `index.html`). Every icon is `<i class="ph ph-<name>" aria-hidden="true"></i>`.
- **You have no right to custom-make icons or add Lucide icons.** No hand-drawn `<svg><path d="…">`, no inline path data, no Lucide, no Heroicons, no other set, no "equivalent" glyph you drew yourself. If a glyph seems missing, grep `src/regular/style.css` for the right `ph-` name — it has the full regular set.
- The design system's `PhosphorIcon*` components are Lucide paths under a Phosphor name. Do not use them; use the font.
- Size icons with `font-size` and colour them with `color` (they are text). Never `width`/`height`/`stroke`.
- Brand marks (Radius logo, Mel mark) are real SVG assets in `assets/` — they are not icons and this rule does not apply to them.

## Editing rules for index.html
- Never do blind offset/`indexOf` slicing on this file. Use exact-string replacements that are verified to match, or the editing tool.
- Primary colour is Radius indigo `#5A5FF2` (Radius UI Design System) — never neutral-900/black as primary.

## Mel suggestion chip — single canonical style (STRICT)
Every clickable **Mel suggestion** anywhere in the project (caption rewrites, section picks, quick replies, "try another" prompts) uses this one treatment. Never a plain gray outlined chip — a gray pill reads as a filter, not as Mel.

```css
.melsugchip{display:inline-flex;align-items:center;gap:8px;min-height:34px;max-width:100%;min-width:0;
  padding:6px 14px 6px 11px;
  border:1px solid #E4E4FB;border-radius:12px;
  background:linear-gradient(100deg,#F7F7FE 0%,#FCFAFD 48%,#FFFBF8 100%);
  font:500 13px/17px var(--font);text-align:left;cursor:pointer}
.melsugchip .msp{flex:0 0 auto;color:#6D6EF3}   /* 4-point sparkle, static */
.melsugchip .mlab{background:var(--mel-gradient);-webkit-background-clip:text;background-clip:text;color:transparent}
.melsugchip:hover{border-color:#C9CAF8;box-shadow:0 2px 12px rgba(90,95,242,.16)}
.melsugchip:active{transform:scale(.98)}
```

- Always leads with a **static 4-point sparkle** (`<svg class="msp">`, `M12 2c.6 5 4 8.4 9 9-5 .6-8.4 4-9 9-.6-5-4-8.4-9-9 5-.6 8.4-4 9-9z`, `currentColor` at `#6D6EF3`), then `<span class="mlab">` for the label. The label must sit in its own span — the gradient text clip needs it.
- Not the Mel loop mark (`assets/mel-icon.svg`) — at 14px it reads as a coral circle. No animation on the icon, ever.
- Labels wrap to a second line rather than clipping; never `white-space:nowrap` inside a narrow panel.
- Soft indigo→warm wash background, 12px radius, pale indigo border. No solid indigo fill, no gray border, no hairline-only chip.
- The Mel gradient (`--mel-gradient`) is Mel identity only — it belongs on these chips and on Mel capsules, never on filters, tabs, or generic CTAs.
- Reference implementation: `.melsugchip` (Marketing Studio → editor mode → caption suggestions).

## Containment (STRICT — this bug has shipped three times)
Anything rendered inside a fixed-width panel, sidebar, drawer or card **must not overflow it**. No exceptions, no horizontal bleed, no clipped cards.

Every grid or flex row inside a panel:
```css
grid-template-columns:repeat(N,minmax(0,1fr));   /* never plain 1fr */
```
and every child: `min-width:0; overflow:hidden;` — plus `text-overflow:ellipsis` on any `white-space:nowrap` label.

Why it keeps breaking: `1fr` floors at **min-content**. A `nowrap` label or a fixed-px render (e.g. a `tplThumb`/`frame` output sized by `--u`) sets min-content wider than the track, so the track grows and the grid pushes past the panel. `overflow:auto` on the scroller hides the cause and shows a clipped mess.

Rules:
- Cloned/embedded renders go in a `position:relative; overflow:hidden` box with a fixed aspect; the render inside is `position:absolute` (+ `zoom`/`transform` to fit). Never let it size the track.
- Column count is chosen from the real available width: panel width − rail − padding. If cards don't fit at 3, use 2. Never keep 3 and let it spill.
- Vertical scroll only. A horizontal scrollbar inside a control panel means the layout is wrong, not that it needs scrolling.
- Before handing off any panel change: state the arithmetic (panel px − chrome = content px ÷ columns) rather than assuming it fits.

## Silent-failure rule
Never leave `catch(_){}` around rendering code. A swallowed error degrades to a text fallback that looks like a design choice and wastes a review cycle. Log it (`console.warn('[fn] ' + reason)`) so the failure is visible.

## Notification / unread dot — single canonical spec (STRICT)
Every unread/attention dot on an icon button uses **exactly** these values — no variants, no indigo dots, no inset dots:

```css
position:absolute; top:-3px; right:-3px;
width:8px; height:8px; border-radius:50%;
background:var(--destructive);           /* #DC2626 */
box-shadow:0 0 0 2px var(--white);       /* ring punches it off the icon */
```

- Anchored to the **top-right outer corner** of the control (overlapping the border), never inside the padding box.
- Colour is always red `--destructive`. Indigo is for primary actions, never for the dot.
- The parent control needs `position:relative`.
- Reference implementation: `.txd-ctrl .cb .cdot` (comments button). The header bell `.nbell .ndot2` matches it.
- Count badges (a number, not a dot) are a different part — they keep their own spec; this rule covers dots only.

---

# Transaction page — top section (STRICT)

- The action row (lock · edit · Auditing comments · Commission breakdown · Commission checklist · notification bell · status select · **Cancel contract**) is **one single line, always**. `flex-wrap:nowrap`. Nothing may drop to a second line at any width.
- The property photo has a **fixed height** (132px in the flat top section). Its **width** may change (grow/shrink), never its height, and never at the cost of the detail row or action row wrapping — the photo shrinks first.
- Same for the fact strip (Clients · Collaborators · Sale price · Gross commission · Acceptance date · Closing date): one row, no wrapping.

## Action-row labels — icon vs text (STRICT)
Label visibility is driven **only** by the sidebar state, never by lifecycle state:

| Control | Sidebar expanded | Sidebar minimized (`.app.collapsed`) |
|---|---|---|
| Lock (private) | icon only, 32px | icon only, 32px |
| Edit | icon only, 32px | icon **+ text** |
| Notification bell (`.nbell`) | icon only, 32px | icon **+ text** |
| Auditing comments | icon **+ text** | icon **+ text** |
| Commission breakdown / Commission checklist / status | always text | always text |

- Icon-only controls keep their `title` **and** `aria-label` — hover and screen readers must still name them.
- The default (`.txd-ctrl .cb.ico`) is icon-only; labels are granted back by explicit `.app.collapsed …` rules per control. Never invert this — a blanket `.app.collapsed .cb.ico .lb{display:inline}` breaks the one-line rule.
- "Comments" is called **Auditing comments** — it is the auditor thread, not generic comments.

## Commission checklist — dialog-in-a-dropdown (STRICT)
The commission payment checklist is **never** an inline box in the top section and **never** a blocking modal. It lives in `#txd-cspop` (`.txd-dpop`), an anchored panel with dialog chrome opened by the **Commission checklist** button.

- `position:fixed`, placed under the anchor by JS, flips above when there is no room, re-places on scroll/resize, clamped 12px from the viewport edge. No scrim — the page behind stays readable and clickable.
- Chrome: **bold title only** (`Commission Payment Checklist`), the count (`3/6`, or a green `100%` pill) and a close X on the same line. **No subtitle, no description, no footer, no action buttons.** Don't reintroduce explanatory copy — the list explains itself.
- Body is the existing checklist renderer, nothing else. Split/breakdown rows belong to the **Commission breakdown** popover, not here.
- Closes on X, `Esc`, and outside click; the outside-click listener must ignore clicks inside the panel and on its trigger (the trigger's own handler calls `stopPropagation`).
- The trigger carries the canonical red dot (`.cdot.cdot-chk`) while any gate is pending; it disappears at 100%. It needs its own class so `body.txd-nocomments` (which kills comment dots) can't hide it.
- One renderer, two mounts: `renderChk()` builds the HTML once and writes it into both `#txd-chk` (inline column, hidden in flat mode) and `#txd-chk2` (inside the panel). Never fork the markup — the states would drift.
- Because `body.txd-flat .txd-chkcol{display:none}` exists, the in-panel copy needs `body .txd-dpop .txd-chkcol{display:flex}` (tag+2 classes, declared later) to win. Don't reach for `!important`.

### Traps hit while building this (do not repeat)
- **Trap:** put the checklist in the top section as a card/box → violates the brief. **Fix:** anchored panel behind a click.
- **Trap:** ship it as a centred modal with a scrim. **Fix:** dropdown-positioned panel, no scrim, nothing blocked.
- **Trap:** dress the panel up with a subtitle, footer row and CTA buttons. **Fix:** title + count + X. Every line must earn its place; the CEO reads added copy as filler.
- **Trap:** duplicate the checklist markup for the panel. **Fix:** one `renderChk()`, two targets.
- **Trap:** rename a button and let the row wrap. **Fix:** buy the width back by turning utilities into icons — never by wrapping.
- **Trap:** self-verify by screenshotting `index.html` in the agent preview. The file is large and the preview iframe frequently times out (`executeJavaScript timed out`). **Fix:** make the targeted edit and hand off to `ready_for_verification`; the empty-`#root` warning it prints for this file is spurious (there is no `#root`).

---

# Session log — "Pick a design for the feed post" (Marketing Studio)

## Screen under work
`index.html` → **Marketing Studio → Pick a design for the feed post**. Agent picks a template (Wave / Feature sheet / Editorial / Collage / Minimal) that renders the listing's photo, price, and address for a social feed post.

## Problems diagnosed (from user screenshot)
1. **Broken 3-col grid** — 5 cards, awkward empty slot; Editorial card has huge whitespace above its preview.
2. **No selected state** on template cards — it's a picker but nothing indicates the current choice.
3. **No format target** — no Post 1:1 / Story 9:16 / Reel / Flier switch; unclear which platform the post is for.
4. **Previews too similar** — Bold / Editorial / Minimal all show the same photo + price + address; visual differences are not readable at a glance.
5. **Redundant category labels** — "Wave — Bold", "Feature sheet — Bold" duplicate the filter chip they're already grouped under.
6. **Mel-glow gradient misused** — orange Mel gradient is applied to the active filter chip. That gradient is reserved for Mel identity only.
7. **Filter chips carry no counts** — "All", "Bold", "Editorial", "Minimal" should show counts.
8. **Header reads as marketing** — centered eyebrow + title + long description, floating "Let Mel pick" pill, weak "Want to make something else?" bottom pill. Radius CRM is a dense pro tool; head should be left-aligned and compact.
9. **No hover / live preview** — cards give no lift/affordance and clicking doesn't update anything visible.
10. **Popup / modal feel** — the whole picker floats like a dialog rather than sitting in the CRM shell.

## Direction agreed with user
Instagram-style inline picker. **No popups, no modals.** Single page inside the CRM shell.

Layout:
- **Page head (Radius CRM pattern)** — left-aligned; eyebrow "Marketing Studio", h2 "Feed post", meta line "1420 Grove St · $1,285,000 · Just listed", right-side actions: `Change listing` (ghost) + `Let Mel pick` (indigo primary).
- **Format segmented control** below head — `Post 1:1 · Story 9:16 · Reel 9:16 · Flier · Email header`. Selected = indigo underline; each tab shows a count.
- **Left 55% — live preview panel** — the selected template rendered large with the real listing data (Grove St photo / $1,285,000 / 1420 Grove St), wrapped in subtle Instagram-post chrome (avatar + handle + like/comment ghosted). Below preview: accent color chips (live recolor) + `Use this design →` indigo primary + `Regenerate copy` / `Export PNG` ghosts.
- **Right 45% — template grid** — 2-col scroll. Each card renders the **real template shape** (Bold = huge price overlay, Editorial = serif eyebrow above photo, Minimal = 12px caption, Wave = gradient-price band, Collage = 4-tile grid), not a stock photo. Selected card = 2px indigo `#5A5FF2` ring + subtle indigo wash. Section headers group by use case: "Suggested for just-listed" (Mel-curated 3) then "All templates" (rest). "See all 24 →" tile fills the trailing grid slot. Card lockup drops the redundant category label; carries a one-line benefit ("Loud price. New listings.").
- **Filter chips** above grid render in their own typography (Bold in heavy condensed, Editorial in serif italic, Minimal in thin sans) with counts per chip.

## Ideas stolen and where they land
- **Linear "What kind of template" dialog** → cards render real template shapes inline, not stock thumbs; each carries a one-line benefit.
- **Instagram "New post"** → format segmented bar + big live preview above / grid pattern.
- **SiteAI project grid** → indigo ring + revealed CTA on the selected card.
- **Notion featured collections** → group templates by use case, not aesthetic label.
- **TikTok text chips** → filter chips styled in their own typography.
- **TikTok color swatches** → accent chips under preview, live recolor.
- **IG avatar picker** → trailing "See all →" tile instead of empty grid slot.
- **Notion ratings** → optional social-proof line under templates ("used 2,340 times").
- **simplelist landing** → **skipped**. Glassmorphism is off-brand for Radius CRM.

## Mistakes / traps and their solutions
- **Trap:** treat "Bold / Editorial / Minimal" as decoration → all previews look the same.
  **Fix:** each card MUST render the template's real construction (typography, price treatment, photo crop), not one shared photo.
- **Trap:** put Mel's indigo→coral glow on filter chips because it "looks nice".
  **Fix:** the Mel gradient is reserved for Mel identity (assistant capsule, Mel CTA). Filter/selected states use flat indigo `#5A5FF2`.
- **Trap:** center the page head with a long description like a landing page.
  **Fix:** left-align, one-line title + one-line meta; Radius CRM is dense pro.
- **Trap:** launch the picker as a modal / centered card.
  **Fix:** inline in the CRM shell. Clicking a card only updates the left preview; the "Use this design" CTA advances to the next step as a new page, never a popup.
- **Trap:** fall back to `React.createElement` / `innerHTML` / JS-generated text to render template cards.
  **Fix:** every card, label, price, address, chip label is literal HTML markup in `index.html`. JS only toggles the selected class and swaps aspect ratio on the preview. All visible text must remain editable by clicking.
- **Trap:** rewrite the whole file.
  **Fix:** targeted exact-string replacements. Backup `index.html` to `backups/index.backup.html` **before every change** (project rule).
- **Trap:** blind offset / `indexOf` slicing on `index.html`.
  **Fix:** use the editing tool with unique exact-string matches only.
- **Trap:** invent colors, fonts, spacings.
  **Fix:** Radius UI 3.0 tokens only. Indigo `#5A5FF2` primary, `#0A0A0A` fg, `#E5E5E5` borders, 4px grid, ~32px controls. Hubot Sans headings ≥20px, Mona Sans body 14px. Sentence case. No emoji. No gradients on surfaces.

## Staged plan (execute one at a time, verify, stop)
- **Stage 0 — Audit** (report only, zero edits). Read current picker markup in `index.html`, locate real listing data source, confirm existing patterns in `Post Templates.dc.html` / `Header Options.dc.html` / `staging/`. State one-line root cause + refined plan. Wait for "go".
- **Stage 1 — Page head + format tabs.** Backup. Replace centered header with left-aligned Radius CRM head (eyebrow · title · listing meta · right actions). Add format segmented control (Post 1:1 · Story 9:16 · Reel · Flier · Email header) with per-tab counts. Kill floating "Let Mel pick" pill and "Want to make something else?" pill. All text literal in markup. Verify → stop.
- **Stage 2 — 2-column scaffold.** Backup. Wrap picker body in 55/45 grid: left preview column, right template column. Empty framed placeholders inside each. Move filter chips into right column above grid. Verify layout at 1440 / 1920. Stop.
- **Stage 3 — Template grid (right column).** Backup. Rebuild 5 cards as real template shapes inline (Bold = huge price overlay; Editorial = serif eyebrow above photo; Minimal = 12px caption; Wave = gradient-price band; Collage = 4-tile grid). Section headers: "Suggested for just-listed" (Mel-picked 3) then "All templates". Selected = 2px indigo ring + wash. Filter chips styled in their own typography, with counts. "See all 24 →" trailing tile. Drop duplicated category tag. Click card → updates left preview (JS behavior only, markup already present). Verify → stop.
- **Stage 4 — Big live preview (left column).** Backup. Render selected template large with real Grove St data (photo, price, address). Subtle Instagram-post chrome around preview (avatar + handle + like/comment icons ghosted, editable text). Primary CTA `Use this design →` indigo + `Regenerate copy` ghost + `Export PNG` ghost. Verify → stop.
- **Stage 5 — Accent color chips + live recolor.** Backup. 4 accent chips below preview (indigo default + 3 alts from DS). Click chip → preview accent updates live via JS on existing markup. Verify → stop.
- **Stage 6 — Format-tab wiring.** Backup. Post/Story/Reel/Flier/Email swap preview aspect ratio + filter template grid to templates supporting that format. Per-tab counts reflect real filtered counts. Verify → stop.
- **Stage 7 — Final acceptance.** Every visible text click-editable? Selected state visible on card AND preview? Format tabs functional? Mel primary CTA works? No console errors, no broken grid, no popups. `ready_for_verification` → stop.

## Locked rules for this session
- Backup `index.html` → `backups/index.backup.html` before every write.
- Editable-first: every visible label / price / address / chip is literal HTML markup. JS only reorders / toggles / swaps classes.
- Radius UI 3.0 only. Indigo `#5A5FF2` primary. Mel gradient = Mel identity only.
- Targeted exact-string edits. No blind offset slicing. No file rewrites.
- One stage at a time. Verify. Stop. Wait.

---

# Saved shortlist (property search + detail) — 2026-09-16

- `Save for later` lives in the property detail top bar **immediately after the address** (`.pd-savewrap` → `#pd-save`). Never `margin-left:auto`; the address truncates first so the button stays beside it. It is an agent triage control — it does **not** belong in the client-facing `Are you interested?` card (that card is Interested / Pass only).
- Saved row caps at `SAVED_CAP=5`: 4 chips + "N others" when over, strict one line (`flex-wrap:nowrap`), `Share saved` on the right, overflow panel keeps open · share · remove.
- First-visit hint `#pd-savehint` (`.pd-hint`) sits under the button, `position:absolute` so dismissing it shifts nothing. Shown once ever via `ps-savedhint` in localStorage; the flag is also set on the first real save and when a shortlist already exists.

---

# Share dialog — client picker (STRICT) — 2026-09-16

Keep it stupid simple: **combobox → top-5 avatar pills → Share now.** Nothing else.

- One input `#ps-clientsearch` (`role="combobox"`) with a search icon left and a chevron `#ps-clientchev` right.
  Typing filters and opens; the chevron alone opens the full list. The list `#ps-clientlist` is
  `position:absolute` under the input — **the only scroller in the dialog**. The dialog body never scrolls.
- Below it, `#ps-clientpills`: the first `TOP_CLIENTS` (5) clients as `.ps-cpill` (24px `rds-avatar--xs`
  + name, one tap to select, `aria-pressed`). Anyone picked from the dropdown who is not in that 5
  is appended as a pill. **There is no separate "selected chips" row** — one row does both jobs, so
  the two copies cannot drift. Selected pill = `#F3F3FE` wash / `#C9CAF8` border / `--primary` text.
- No standing client list, no checkboxes, no `min-height` gap. Dialog is 460px, ~292px tall.

## Traps hit here (do not repeat)
- **Trap:** outside-click guard written as `e.target.closest('.ps-clientpick')`. Toggling a row
  re-renders the list, so the clicked row is **detached** by the time the click bubbles and
  `closest()` returns null — the dropdown closed on every pick. **Fix:** `stopPropagation()` on the
  `.ps-clientpick` container, which is never re-rendered.
- **Trap:** bubbling `keydown` listener for Esc. A document-level Esc handler elsewhere also closes
  the overlay, so one press closed the dropdown *and* the dialog. **Fix:** capture-phase listener on
  the modal + `stopPropagation()` while the dropdown is open. Esc unwinds one layer per press.
