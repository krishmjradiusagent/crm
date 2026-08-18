# Kanban multi-select + bulk assign

Scope: **Clients → Board view → Detail card layout only.** Minimal and Signal layouts are
untouched (Signal keeps its own avatar-checkbox selection and its own bar).

## Turning it on

- Toolbar button **Select** sits left of the list/board view toggle. It only appears when the
  board is showing and the card layout is Detail.
- Keyboard: `S` enters select mode (ignored while typing or in Quiet mode).
- While on, the button reads **Selecting** and is filled neutral‑900.
- Off by default. Nothing about normal board behaviour changes until it is on.

## Selecting

| Action | Result |
|---|---|
| Click a card | Toggle it |
| Shift‑click | Range select within the same column, from the last card you picked |
| Cmd/Ctrl‑click | Adds (plain click already adds — no accidental deselect‑all) |
| `Select all` in a column header | Selects/clears that column |
| `Space` on a focused card | Toggles it (cards are tabbable) |
| `Esc` | Closes an open menu, else clears the selection and leaves select mode |
| `✕` on the bar | Same as Esc |

Selected cards get a 2px indigo (`#5A5FF2`) ring; unselected cards drop to 48% opacity so the
selection reads at a glance. Checkbox is `role="checkbox"` with `aria-checked`.

Selection **can span columns**. When it does, the bar shows `across N stages` and the
Move‑to‑stage menu carries an amber warning, because that action is stage‑specific.

## Bulk bar

Floating neutral‑900 bar, bottom‑centre of the board, appears when ≥1 card is selected.
Actions are fixed to the approved list — no others:

1. **Assign campaign** — from the campaign list (`assignable`)
2. **Move to stage** — the 8 pipeline stages
3. **Add to smart list** — from `listPool`
4. **Add tag** — from `bulkTags`
5. **Archive** — destructive styling, removes cards from the board

Each of the first four opens a searchable popover (type to filter, click to apply).
Archive applies immediately.

## After applying

A toast reports what happened and offers **Undo for 30 seconds**. Undo restores stages,
removes the added campaign/list/tag, or unarchives — exactly the records the action touched.

## Configuration

| Name | Where | What |
|---|---|---|
| `bulkTags` | clients script | Tag options in the Add tag menu |
| `assignable` | clients script | Campaign options (shared with the card‑level assign menu) |
| `listPool` | clients script | Smart list options |
| `extraMap` | runtime | `Map<clientIndex, {tags, lists, camps}>` — what bulk assign added; rendered as an indigo chip on the card, a row in the Lists tab, and a row in Mel → Campaigns |
| `archived` | runtime | `Set<clientIndex>` filtered out of the board |

Prototype note: `extraMap` / `archived` are in‑memory only and are not reflected in the table
view — the table is out of scope for this change.
