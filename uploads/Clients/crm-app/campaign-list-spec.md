# Campaign list — UI spec (Radius UI 3.0)

## 1. Component hierarchy

```
MelTabPanel
└── CampaignsSection
    ├── SectionHeader "Campaigns"        .melck  (label + 1px rule, no + button)
    ├── CampaignList                     .mecl   (flex column, gap 4)
    │   └── CampaignRow ×n               .melcamp  role=button, tabindex=0
    │       ├── CampaignName             .melcn
    │       └── StatusBadge              .melst .act | .sch | .snt
    └── AssignControl                    .melasn
        ├── AssignButton "Assign campaign"  .melasnb  (outline, full width)
        └── AssignMenu                      .melasnm  role=menu
            └── MenuItem ×n                 .melasni  role=menuitem
```

## 2. Visual description

**SectionHeader** — 11px / 500, `--neutral-500`, sentence case, followed by a 1px `--neutral-200` rule. No create affordance.

**CampaignRow** — single line, 1px `--neutral-200` border, radius 9, padding 8/10, name left (12.5px / 500, `--neutral-900`, truncates), status right. Hover: border `--neutral-300` + `--neutral-50` wash. Press: `scale(.99)`. Focus: 2px `--neutral-400` ring, 2px offset.

**StatusBadge** — 11px / 500, radius 6, padding 4/7. Four states only:
- `Active` → green fg on 14% green tint
- `Scheduled` → `--status-orange` on 12% tint
- `Since Aug 2` → same scheduled tone
- `Sent` → `--neutral-600` on `--neutral-100`

No grey dot, no open rate, no "last …" timestamp, no metrics of any kind.

**AssignButton** — full-width outline, height 30, radius 10, plus icon 12px + label. Hover `--neutral-100`, press `scale(.98)`, 140ms ease.

**AssignMenu** — opens upward, radius 10, `shadow-md`, 4px padding, 12px items, hover `--neutral-100`.

Dark mode mirrors with `#1c1c1c` surfaces and `#2e2e2e` borders. All values come from token vars; no new hex introduced.

## 3. Interaction flow — assign a campaign to a seller

1. Trigger: agent clicks **Assign campaign** on the seller's Mel tab.
2. Menu opens above the button; `aria-expanded=true`. Only one menu open at a time.
3. Agent picks a campaign name.
4. Feedback (<100ms): the row appends to the list with status `Scheduled`; menu closes.
5. Duplicate guard: a campaign already on the list is a no-op — no error state needed.
6. Dismiss: click anywhere outside closes the menu.

Rows are keyboard-reachable (`tabindex=0`, `role=button`) and announce "Open campaign {name}, {status}".

## 4. Checklist

- [x] No add/create campaign affordance
- [x] Name + status only
- [x] Statuses limited to active / scheduled / since Aug 2 / sent
- [x] Grey indicator, open rate, last-sent date removed
- [x] Assign control present
- [x] Radius tokens only; single-file HTML prototype
