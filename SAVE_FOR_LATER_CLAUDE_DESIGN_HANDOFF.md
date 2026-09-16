# Save For Later + Share Handoff

## READ THIS FIRST — where the code actually is

This feature exists **only in the root monolithic prototype**:

```text
/Users/radius/Desktop/Design OS/CRM/index.html      (2.47 MB, single file)
```

It has **not** been ported into the split app folder `CRM/crm/` (which is CSS/JS modules only,
no `index.html`, no property search page). If you looked there and found nothing, that is why.
`crm/js/31-pke-share-panel.js` is the **marketing packet** share panel — a different feature. Ignore it.

`index.html` is too large to read whole. The exact source for this feature has been extracted
verbatim into small files you can read directly.

Read these first for the **property detail page**. This is required, not optional:

```text
CRM/save-for-later-handoff/property-detail-save.css   — property detail save button + hint CSS
CRM/save-for-later-handoff/property-detail-save.html  — property detail top bar markup
CRM/save-for-later-handoff/property-detail-save.js    — property detail save/hint/open logic
```

Then read these for search results + share:

```text
CRM/save-for-later-handoff/saved-share.css    133 lines  — all CSS for the feature
CRM/save-for-later-handoff/saved-share.html    56 lines  — all markup for the feature
CRM/save-for-later-handoff/saved-share.js     492 lines  — both JS modules, incl. window.psSaved
```

Each block in those files is commented with the `index.html` line range it came from.
**Read those three files, not `index.html`.** Line anchors in `index.html` are listed further
down only so the edits can be located in place.

## Feature Summary

We added a lightweight agent workflow:

1. Save a property from the property detail page.
2. Show saved properties as a compact shortlist row on the search page.
3. Share saved properties with clients or agents from a simple picker.
4. Introduce the feature once with a small contextual hint.

Keep it simple. This is not a client database manager, not a CRM submodule, and not a redesign.

## Current Code

Extracted source (read these):

```text
/Users/radius/Desktop/Design OS/CRM/save-for-later-handoff/property-detail-save.css
/Users/radius/Desktop/Design OS/CRM/save-for-later-handoff/property-detail-save.html
/Users/radius/Desktop/Design OS/CRM/save-for-later-handoff/property-detail-save.js
/Users/radius/Desktop/Design OS/CRM/save-for-later-handoff/saved-share.css
/Users/radius/Desktop/Design OS/CRM/save-for-later-handoff/saved-share.html
/Users/radius/Desktop/Design OS/CRM/save-for-later-handoff/saved-share.js
```

Original file the above was cut from:

```text
/Users/radius/Desktop/Design OS/CRM/index.html
```

Backup file:

```text
/Users/radius/Desktop/Design OS/CRM/backups/index.backup.html
```

Project notes:

```text
/Users/radius/Desktop/Design OS/CRM/CLAUDE.md
```

`CRM/CLAUDE.md` is the project guide (icons = Phosphor font only, containment rules, backup rule).
There is no `AGENTS.md` / `DESIGN.md` / `RULES.md` in this folder.

## Live Anchors In `index.html`

```text
8602   Saved row CSS
       .ps-savedrow, .ps-savedchips, .ps-savechip

8690   Share picker CSS
       .ps-clientpick, .ps-clientsearch, .ps-clientlist, .ps-clientpills, .ps-cpill

9059   Search page saved row markup
       #ps-savedrow

9062   Share saved button
       #ps-savedshare

9138   Share modal picker markup
       .ps-clientpick

9141   Client combobox input
       #ps-clientsearch

9146   Top client avatar pills container
       #ps-clientpills

10678  Property detail save button CSS
       .pd-topsave

10683  First-visit hint CSS
       .pd-savewrap, .pd-hint

10813  Property detail save markup
       #pd-save, #pd-savehint

22086  <script id="property-search-module"> starts (ends 22471)
       saved row, share modal, client picker, store

22455  Saved property store
       window.psSaved

22505  <script id="property-detail-module"> starts (ends 22603)
       save button state, hint lifecycle

22529  Hint storage key
       ps-savedhint
```

## What We Built

### 1. Property Detail Save Button

The save button sits in the property detail top bar immediately after the address:

```text
Back to listings -> address -> Save for later
```

It must not sit far-right. The address truncates first, and the save button holds its position beside the address.

Current markup:

```html
<span class="pd-savewrap">
  <button class="pd-topsave" type="button" id="pd-save" aria-pressed="false">
    <i class="ph ph-bookmark-simple" aria-hidden="true"></i>
    <span class="lb">Save for later</span>
  </button>
  <div class="pd-hint" id="pd-savehint" role="status" hidden>
    <span>Now you can save properties and share them with agents or clients later.</span>
    <button class="pd-hintx" type="button" id="pd-savehintx" aria-label="Got it">
      <i class="ph ph-x" aria-hidden="true"></i>
    </button>
  </div>
</span>
```

Do not place save/share controls in the `Interested / Pass` card. That card is for client interest only.

### 2. First-Time Feature Hint

Copy:

```text
Now you can save properties and share them with agents or clients later.
```

Behavior:

- Shows only on first visit to a property detail page.
- Appears under the save button.
- Is dismissible with `X`.
- Auto-dismisses after first real save.
- Auto-retires if a saved shortlist already exists.
- Uses localStorage key `ps-savedhint`.
- Is absolutely positioned in `.pd-savewrap`, so dismissing it does not shift the page.

No modal. No scrim. No onboarding tour.

### 3. Saved Row On Search Page

The saved row appears under the filters and above the results/map when there are saved properties.

Structure:

```text
Saved for later -> property chips -> Share saved
```

Behavior:

- Hidden when no saved properties exist.
- Capped at `SAVED_CAP = 5`.
- Shows 4 property chips plus `N others` when overflow exists.
- Stays on one line.
- Overflow panel supports open, share, and remove.

Current search row markup starts at:

```html
<div class="ps-savedrow" id="ps-savedrow" aria-live="polite">
```

### 4. Share Dialog

The picker was simplified per feedback.

Current flow:

```text
Search clients [chevron]
Top 5 avatar pills
Share now
```

Behavior:

- Type in the search input to filter clients.
- Click chevron to open all clients.
- Pick from dropdown.
- Top 5 clients are shown as avatar pills directly below the search input.
- Pills are selectable/clickable.
- Extra selected clients append as pills.
- `Share now` is disabled until at least one client is selected.
- Dropdown is the only scrollable area. The dialog body does not scroll.
- No large standing list.
- No checkbox-heavy UI.
- No empty padding between search and top clients.

Important current markup:

```html
<div class="ps-clientpick">
  <div class="ps-clientsearch">
    <i class="ph ph-magnifying-glass" aria-hidden="true"></i>
    <input
      class="rds-input"
      id="ps-clientsearch"
      type="text"
      placeholder="Search clients"
      autocomplete="off"
      role="combobox"
      aria-expanded="false"
      aria-controls="ps-clientlist"
      aria-autocomplete="list"
    >
    <button class="ps-clientchev" type="button" id="ps-clientchev" aria-label="Show clients">
      <i class="ph ph-caret-down" aria-hidden="true"></i>
    </button>
  </div>
  <div class="ps-clientlist" id="ps-clientlist" role="listbox" hidden></div>
</div>

<div class="ps-clientpills" id="ps-clientpills" aria-label="Top clients"></div>
```

## JavaScript Contract

Saved properties use `window.psSaved`.

Preserve this equivalent API if moving into Claude Design components:

```js
window.psSaved = {
  add(prop),
  remove(id),
  has(id),
  list(),
  subscribe(fn)
};
```

Property shape:

```js
{
  id: propertyId,
  title: addressOrShortTitle,
  price: displayPrice
}
```

Storage keys:

```text
ps-saved       saved property shortlist
ps-savedhint   first-visit hint dismissed/retired flag
```

## Integration Recipe For Claude Design

### Detail Page

Add the save control directly after the address text.

Layout rule:

```text
address truncates first; save button stays beside address
```

Do not use `margin-left:auto` to push the button to the far right.

Recommended structure:

```html
<div class="property-topbar">
  <button type="button">Back to listings</button>
  <span class="property-address">4383 Kansas St ST #7...</span>
  <span class="pd-savewrap">
    <button id="pd-save">Save for later</button>
    <div id="pd-savehint" hidden>
      Now you can save properties and share them with agents or clients later.
    </div>
  </span>
</div>
```

### Search Page

Render the saved row under filters, above the result/map area.

Recommended order:

```text
Search controls
Filters
Saved for later row
Results + map
```

Keep it one line:

```text
label -> chips -> Share saved
```

### Share Picker

Use a compact combobox with avatar pills.

Recommended order:

```text
Search clients input
Top 5 avatar pills
Share now
```

The user should feel like they are answering:

```text
Who do I send this to?
```

Not:

```text
Manage my full client database.
```

## Design Rules To Preserve

- Keep it very simple.
- Use existing Radius/shadcn patterns and tokens.
- Use Phosphor icons only: `<i class="ph ph-name" aria-hidden="true"></i>`.
- Preserve Radix/shadcn behavior if moving this into components.
- Use semantic tokens where available.
- Keep typography compact and CRM-like.
- Preserve WCAG AA contrast.
- Do not redesign the page.
- Do not modify shared components directly.
- Do not invent primitives.
- Do not hardcode a new color system.
- Do not inflate typography.
- Do not add unrelated changes.

## Do Not Reintroduce

- No save/share inside the `Interested / Pass` card.
- No far-right save button.
- No modal for the first-time hint.
- No onboarding tour.
- No large client list box.
- No checkbox-heavy picker.
- No extra selected-chip strip below the pills.
- No scroll inside the dialog body.
- No big empty padding between search and top clients.
- No decorative client database UI.

## Acceptance Checks

Use these checks after integrating into Claude Design:

1. Open a property detail page with empty localStorage.
2. Confirm `Save for later` appears directly after the address.
3. Confirm the hint appears under the save button.
4. Dismiss the hint and confirm `ps-savedhint=1`.
5. Reload and confirm the hint does not return.
6. Save a property and confirm the button changes to saved state.
7. Return to search page and confirm saved row appears under filters.
8. Save more than 5 properties and confirm row shows 4 chips plus `N others`.
9. Click `Share saved`.
10. Confirm dialog shows search input, top 5 avatar pills, and `Share now`.
11. Confirm chevron opens all clients.
12. Confirm typing filters clients.
13. Confirm selecting clients keeps pills and dropdown rows in sync.
14. Confirm `Share now` is disabled at 0 clients and enabled at 1+.
15. Confirm the dialog body does not scroll.
16. Confirm no console errors.

## Short Version

Save button beside address. One-time hint. Saved shortlist row under filters. Share dialog is just search/dropdown plus top 5 avatar pills. Keep the UI stupid simple.
