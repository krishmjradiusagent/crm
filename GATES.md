# Gates — new "Split" template (3 status variations)

- [ ] G1 Backup: `backups/index.backup.html` matches `index.html` before write.
  CHECK: node -e "const a=require('fs').readFileSync('index.html','utf8');const b=require('fs').readFileSync('backups/index.backup.html','utf8');process.stdout.write(a===b?'BACKUP_MATCH':'BACKUP_MISMATCH')"
  EXPECT: BACKUP_MATCH
- [ ] G2 Grid gains one `data-nftpl="split"` card.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const c=(s.match(/data-nftpl=\"split\"/g)||[]).length;process.stdout.write(c+'')"
  EXPECT: 1
- [ ] G3 Card carries 3 variations tagged `data-nfsplit-var`.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const c=(s.match(/data-nfsplit-var=/g)||[]).length;process.stdout.write(c+'')"
  EXPECT: 3
- [ ] G4 Card renders diagonal split shape inline (tsplt- class markers).
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/tpl-split[\s\S]{0,6000}tsplt-hd/.test(s)?'SHAPE_OK':'SHAPE_MISSING')"
  EXPECT: SHAPE_OK
- [ ] G5 CSS block for `.prev.tpl-split` exists.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/\.prev\.tpl-split\b/.test(s)?'CSS_OK':'CSS_MISSING')"
  EXPECT: CSS_OK
- [ ] G6 No emoji inside new card block.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');const m=s.match(/data-nftpl=\"split\"[\s\S]{0,8000}?<\/article>/);const bad=/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F\uDE80-\uDEFF]/.test(m?m[0]:'');process.stdout.write(bad?'EMOJI_FOUND':'EMOJI_CLEAN')"
  EXPECT: EMOJI_CLEAN
- [ ] G7 `CARD_TPL_NM` map has a `split:` entry so the picker shows a name.
  CHECK: node -e "const s=require('fs').readFileSync('index.html','utf8');process.stdout.write(/CARD_TPL_NM[\s\S]{0,600}split:/.test(s)?'MAP_OK':'MAP_MISSING')"
  EXPECT: MAP_OK
