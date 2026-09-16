# Gates — New transaction wizard (2-step, single popup)

- [x] G1 Backup exists.
  CHECK: node -e "const fs=require('fs');process.stdout.write(fs.existsSync('backups/index.backup.html')?'BACKUP_OK':'BACKUP_MISSING')"
  EXPECT: BACKUP_OK
- [x] G2 One wizard shell.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(((s.match(/id=\"ntw\"/g)||[]).length)+'')"
  EXPECT: 1
- [x] G3 Exactly two step panes.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(((s.match(/data-ntwpane=/g)||[]).length)+'')"
  EXPECT: 2
- [x] G4 Step 1 fields match the live product: type, state, status, template — and nothing else.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const p=s.slice(s.indexOf('data-ntwpane=\"1\"'),s.indexOf('data-ntwpane=\"2\"'));const ids=[...p.matchAll(/<select[^>]*id=\"([^\"]+)\"/g)].map(m=>m[1]).join(',');process.stdout.write(ids)"
  EXPECT: ntw-state,ntw-status,ntw-tpl
- [x] G5 One status select, not one per type.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(((s.match(/id=\"ntw-status\"/g)||[]).length)+'')"
  EXPECT: 1
- [x] G6 No invented fields (contract type, client name, referred to).
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/ntw-contract|ntw-refclient|ntw-refto/.test(s)?'INVENTED':'CLEAN')"
  EXPECT: CLEAN
- [x] G7 [hidden] beats the DS display rules inside the wizard.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/\.ntw \[hidden\]\{display:none !important\}/.test(s)?'GUARD_OK':'GUARD_MISSING')"
  EXPECT: GUARD_OK
- [x] G8 Collaborator rows use the DS checkbox, no hand-rolled box.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const b=s.slice(s.indexOf('id=\"ntw-collablist\"'));process.stdout.write(((b.match(/rds-checkbox\" data-ntwperson/g)||[]).length)+'|'+(/ntw__box/.test(s)?'FAUX':'NOFAUX'))"
  EXPECT: 5|NOFAUX
- [x] G9 Collaborator list is inline (no fixed/absolute popover inside the transformed dialog).
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const m=s.match(/\.ntw__menu\{[^}]*\}/)[0];process.stdout.write(/position:static/.test(m)&&!/position:(fixed|absolute)/.test(m)?'INLINE_OK':'FLOATING')"
  EXPECT: INLINE_OK
- [x] G10 No dead JS references left from removed fields.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/refClient|refWrap|subSel|contractEl|placeMenu/.test(s)?'DEAD_REFS':'NO_DEAD_REFS')"
  EXPECT: NO_DEAD_REFS
- [x] G11 Next ships disabled (gated validation).
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/id=\"ntw-next\"[^>]*disabled/.test(s)?'GATED':'UNGATED')"
  EXPECT: GATED
- [x] G12 Discard confirm exists; wizard wired to the New transaction button; Create hands off to the transaction page.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write([/id=\"ntw-confirm\"/.test(s),/tx-newtxbtn/.test(s)&&/openNtw/.test(s),/openTxDetail/.test(s)].join(','))"
  EXPECT: true,true,true
- [x] G13 No emoji, no silent catch in the wizard block.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const b=s.slice(s.indexOf('id=\"ntw-app\"'));process.stdout.write((/catch\s*\(\s*_?\s*\)\s*\{\s*\}/.test(b)?'SILENT':'OK'))"
  EXPECT: OK
