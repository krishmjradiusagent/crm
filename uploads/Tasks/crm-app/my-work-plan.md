# Plan: My work page — crm-app/index.html

For: Opus implementation agent. Single file edit: `crm-app/index.html` (4263 lines). Design system: Radius UI 3.0 (tokens already in `:root` + `ds.css`). All decisions below are final — do not re-ask.

## Context (verified against source)

- Sidebar nav items: ~line 1780 (`.nav` divs, "Main" group). "Property search" is first.
- Clients page: `<main class="content" id="cl-page">` — header `.phead`, tabs `.tabs`, chips, `.twrap` table, `.board` kanban, `.slpop`, `.scopepop`.
- `showPage(p)` at ~line 2010 toggles `#cl-page` + sidebar `.active` via `data-page`.
- `showPage('clients')` called at ~line 3921 on load.
- Tweaks panel exists (project has `tweaks-panel.jsx`; page hides old font/theme fabs — tweaks pattern already in use). Follow existing tweaks wiring in this file if present; else add controls via the page's existing tweaks mechanism.
- Dark mode: `body.dark` token remap — any new colors must use existing vars (`--neutral-*`, `--status-*`, `--white`, `--primary`) so dark mode works free.

## Scope

### 1. Sidebar
1. Add "My work" nav item ABOVE "Property search" (first in Main group). Icon: Lucide `briefcase` (inline SVG, same style as siblings: `viewBox="0 0 24 24"`, stroke icons).
   - `<div class="nav active" data-page="mywork" onclick="showPage('mywork')">…My work</div>`
2. "Clients" nav item: KEEP visually, remove `onclick` and `data-page` — dead item, no navigation.
3. All other nav items untouched.

### 2. Remove Clients page
- Delete the Clients main content: table `.twrap`/`#cl-tb`, board `#cl-board`, chips, smart-list popover `#cl-slpop`, scope popover/menu, filter popovers — the whole `#cl-page` main EXCEPT reuse its header/tabs markup patterns (`.phead`, `.tabs`, `.tabseg`, `.tab`) as the skeleton for the new page.
- Delete now-dead JS: client rows data + render, board render, smart-list logic, scope logic, filters, selection bar, column sort, row-click → client profile handler. Anything referencing removed `cl-*` ids must go (no console errors).
- Keep shared CSS (`.phead`, `.tabs`, `.tab`, `.btn`, `.ncmenu`, badges, table styles) — new page reuses them.
- `showPage` now handles `mywork`; call `showPage('mywork')` on load.

### 3. My work page (`#mw-page`, class `content`)

**Header** (reuse `.phead` pattern):
- Title "My work" + `.pcount` = count of OPEN items (open tasks + upcoming appointments + pending envelopes; live-updates when a task is checked).
- No scope switcher, no Portal link.
- Primary btn "+ Create new" with dropdown (reuse `.ncwrap`/`.ncmenu` pattern): items "Task", "Appointment" (menu opens/closes; items no-op).

**Tabs** (reuse `.tabseg` segmented pattern): 2 tabs
- "Tasks & appointments" (default active)
- "Signing queue"
- No smart-list tab, no search/columns/filter/view-toggle right cluster (or keep a simple search input only if trivial — otherwise omit).

**Tab 1 — Tasks & appointments**: two sections stacked.
- *Tasks section*: grouped Overdue → Today → Upcoming (group headers with counts; Overdue count in `--status-red`). Row: checkbox (works: strike-through, fades, decrements header count + group count), task title, client name (clickable link style `--primary`, `href="#"` no-op — NO client profile), due chip (e.g. "Yesterday" red, "Today", "Fri, Aug 1"), type icon (call/email/follow-up).
- *Appointments section*: grouped by date header (Today, Tomorrow, then dates), chronological. Row: time chip ("2:30 PM"), title, client (clickable no-op), location w/ map-pin icon OR "Virtual" w/ video icon, duration ("45 min").
- ~8–10 tasks, ~5–6 appointments. Realistic real-estate fake data (showings, inspection follow-ups, CMA prep, lender calls — Radius voice: plain, specific, sentence case).

**Tab 2 — Signing queue**: table (reuse existing table styles). Columns: Envelope name, Client (clickable no-op), Transaction/property, Status badge, Sent date, Action.
- Statuses + colors (pale-bg/dark-fg tints, existing badge pattern):
  - Your signature pending — orange — action btn **Sign**
  - Agent signature pending — yellow — action **Remind**
  - Other signature pending — blue — action **Remind**
  - Signed — green — action **View**
- ~7–8 rows covering all 4 statuses. Action buttons no-op (small outline `.btn`).

### 4. Tweaks (variants live here, NOT in the UI)
Add a Tweaks control `layout` (radio/select, 3 options), default `v1`:
- **v1 "Two tabs"** — as spec'd above.
- **v2 "Today-first"** — no tabs. Top strip "Needs you now": overdue tasks + your-signature envelopes + next-appointment countdown card. Below: 2-col grid — appointments timeline (left) + task list (right). Signing queue = compact card in right rail. One Mel line on top ("3 things need you before 2 PM") using `--mel-gradient` glow-border capsule (the ONLY gradient allowed).
- **v3 "Classic tables"** — 3 tabs: Tasks / Appointments / Signing queue, each a dense table w/ count badges on tabs, header row, bulk checkbox column, due-date sort order.
All 3 variants render from the SAME data arrays (single source of truth in JS). Keep 1–2 more small tweaks (e.g. show/hide Mel line, compact density) — panel small; hidden entirely when Tweaks off.

### 5. Constraints
- Radius rules: sentence case everywhere; Inter; no gradients except Mel; badge radius 6 / input 8 / button 10 / card 14; 1px `--neutral-200` borders; 32px controls; color = state only; Lucide inline stroke SVGs only, no emoji.
- Dark mode must work — use existing CSS vars only; check `body.dark` for any new accent surface (mirror existing patches like `.tab.active`).
- Page title `<title>` → "Radius CRM — My work".
- No console errors after Clients JS removal (grep for orphaned `cl-` ids/listeners).
- Keep sidebar collapse, messenger flyout, notifications, profile menu, theme/dark logic untouched.

### 6. Acceptance checklist
1. Load → My work page shows, sidebar "My work" active, above Property search, briefcase icon.
2. Clients nav dead (no click handler), no client table/kanban anywhere.
3. Header count decrements when task checked.
4. "+ Create new" opens dropdown: Task / Appointment.
5. Tab switch Tasks & appointments ↔ Signing queue works.
6. All 4 signing statuses visible w/ correct badge colors + action labels.
7. Tweaks: layout v1/v2/v3 switches whole page layout; same data everywhere.
8. Dark mode toggle → everything legible, no white flashes.
9. Zero console errors.
