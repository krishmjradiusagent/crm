# Transaction page — top section brief (CEO feedback)

Source: Slack group DM `C0BPVHYFETD` (Krish · Biju · Jessica DeFerrari), 2026-08-20.
Screen under work: **Transaction profile → top section** (address row, overview / info blocks, commission checklist, property photo).

## Verdict
Biju (CEO) rejected the current top section outright:
- "this doesn't look good"
- "it looks like a word doc"
- "it looks messy"
- "can you think of a better design overall in this page?"

This is a rethink of the section, not a tweak.

## Biju's requirements (binding)

1. **No boxes per info item.** "Why should each of these need to be in boxes?" / "I am not a fan of those boxes for each info." Drop the per-metric containers — borderless, dense info row instead.
2. **Overview section is taking too much space.** Compress it.
3. **Commission payment checklist is not on the surface.** "The commission checklist doesn't need to be in their face. Just show it on click of something." Rationale: "Most transactions in most statuses don't need this because they haven't reached payment time yet" and "that's a lot of statuses and updates to be shown without a click."
4. **Not status-driven.** Jessica asked if it becomes visible once status = pending → Biju: "No, it should be visible on click of a button."
5. **The trigger button must indicate updates.** "If there's an update, please make sure the button indicates that so that they click it." → badge / dot state on the button.
6. **Placement of the trigger.** "Keep the button that expands to show that next to gross commission maybe."
7. **Keep the property photo.**
8. **Reuse the previous top-row design.** Krish shared the old layout; Biju approved it — minus the boxes. "Keep it simple."

Krish's commitment in-thread: "Keep it minimal, on click show payment and commission checklist, and retain the old design I had for the top row."

## Conflict resolved
Jessica (2026-08-18) asked for the commission checklist in the **top-left of the productivity section**, shrinking the sale-price containers to make room. **Biju overrode this** — the checklist is click-only, behind a button next to gross commission. Build to Biju's version.

## Jessica's other open items (separate from Biju's complaint, still live)
Transaction profile:
- "Sent envelopes" tab is missing — where did it go?
- Missing **Accepted contract**, **Contract cancelled**, **Listing cancelled** buttons.
- "Commission breakdown" must navigate to the full breakdown page.
- Checklist: restore section numbering; restore checklist filtering; statuses and icons are bunched in the right-hand corner.

Transactions dash:
- Save filter settings — missing.
- View tabs missing **Needs my approval** (and tab order per her notes).
- Clear all filters — missing.
- Notifications should look like tasks (collapsible sections).

## Implication for the current top row
The current row leads with a large red **Cancel contract** button. Jessica wants the three contract-state buttons (Accepted contract / Contract cancelled / Listing cancelled) instead, so that row changes regardless of Biju's feedback.

## Design constraints for the rebuild
- Radius UI 3.0 tokens only. Indigo `#5A5FF2` primary, `#0A0A0A` fg, `#E5E5E5` borders, 4px grid, ~32px controls.
- Flat fills, quiet 1px dividers instead of card boxes for the info row. Mel gradient = Mel identity only.
- Hubot Sans headings ≥20px, Mona Sans body 14px, tabular figures for money. Sentence case. No emoji.
- Dense pro tool: left-aligned, compact. No modal / popup for the checklist — inline expand.
- Every visible label, price and address stays literal HTML markup (editable). JS only toggles expand / selected states.
