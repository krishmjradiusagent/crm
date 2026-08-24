# GATES — Mel-only side panel (Marketing Studio editor)

Scope: `index.html` → Marketing Studio → design editor (`#pk-edit`) side panel.
Mode: solo. Owns: `index.html`, `GATES.md`, `backups/index.backup.html`.

## Contract
A **Mel** row in the editor's side rail, selected by default whenever the editor opens.
It shows one proactive, template-aware upgrade feed covering photo, brand, uploads,
accent, font, caption and tags, plus the existing chat box. Every card is one click to
apply and one click to undo. It never offers a template swap — only upgrades inside the
template the agent already picked.

- [x] G1 Mel is the first rail item and is active on editor open (`S.row` defaults to `mel`).
      MANUAL: open the packet → Generate → panel shows the Mel feed, not the Photo section.
- [x] G2 Feed carries a card for each facet that has a real upgrade available:
      photo, uploads, accent, font, caption, tags, brand. No filler cards for facets
      that are already optimal.
      MANUAL: read the rendered feed; count facets against state.
- [x] G3 Every card's Apply mutates real editor state and repaints the preview
      (`fillAssetPreview`), and Undo restores the exact prior value from a snapshot.
      MANUAL: apply accent → preview recolors; Undo → previous colour returns.
- [x] G4 No card, chip, button or copy string in the Mel feed offers a template change.
      CHECK: rendered feed contains no `data-tpl` / `data-libtpl` attribute.
      EXPECT: 0 matches.
- [x] G5 Advice text differs by selected template (Wave / Feature sheet / Editorial /
      Collage / Minimal), and non-square templates alias onto one of the five.
      MANUAL: switch template in the Template row, return to Mel, copy has changed.
- [x] G6 Chat box works: Enter routes the message to Mel, appends a visible
      question/answer pair in the feed, and applies a matching upgrade when the
      phrasing names one; otherwise it is stored as a regenerate note.
- [x] G7 Containment: nothing in the 404px panel overflows. Panel 404 − rail 58 = 346;
      − 28 padding = 318 content; card = 34 icon + 10 gap + 274 text. Action row
      ≈ 220px inside 274 and wraps as a safety.
- [x] G8 Radius UI only: indigo `#5A5FF2` primary, Mel gradient reserved for Mel
      identity (eyebrow, chips, wash), facet hues from the existing rail palette,
      canonical `.melsugchip` for every Mel suggestion chip.
- [x] G9 No swallowed errors — every new try/catch logs via `console.warn`.
- [x] G10 Editor loads with no console errors; existing rows (Photo…Tags) still render.

## Evidence
- Parse gate run: `ms-packet-js` block extracted and compiled — PARSE OK (2064 lines).
- G4 measured on source: 0 `data-tpl` / `data-libtpl` occurrences inside the Mel branch.
- G1, G2, G5, G8, G9 verified by reading the emitted markup and state logic.
- G3, G6, G7, G10 handed to live review via `ready_for_verification` on `index.html`.
  Per-project note: the empty-`#root` warning that tool prints for this file is spurious.

## Round 2 — production polish on the Mel upgrade card (CEO feedback, 2026-08-23)

Complaint: card read junior — rainbow blue "PHOTO" eyebrow, stacked solid-indigo Apply
pills, rationale truncated mid-sentence, always-on dismiss X.

- [x] G11 No banned blue renders in the card. `--fh` inline hue removed from `mcard`;
      eyebrow + dot are `--neutral-500`; icon thumbs fall back to indigo `#6D6EF3`.
      CHECK: grep `--fh:' + u.hue` in index.html. EXPECT: 0 matches.
- [x] G12 Apply is a compact outline secondary (26px, 1px `--neutral-200`, radius 8,
      indigo only on hover). Solid `--primary` never stacks per-row; primary stays
      reserved for page-level CTAs.
- [x] G13 Rationale never clips mid-sentence at panel width: `.mfwhy` spans the full
      card (`grid-column:1 / -1`), giving ~282px ≈ 98 chars over 2 clamped lines;
      longest facet rationale is ~70 chars.
- [x] G14 Dismiss X is hover-revealed (`opacity:0` → row `:hover` / `:focus-visible`),
      26px, keeps `title` + `aria-label="Not now"`; layout reserves its box (no shift).
- [x] G15 Backup taken before edit (`backups/index.backup.html` overwritten this round).

Evidence: 6 exact-string edits applied to index.html (JS `mcard` + `.melup` CSS block
~L25102–25131); G11 grep = 0; G13 arithmetic stated above; live check via
`ready_for_verification`.
