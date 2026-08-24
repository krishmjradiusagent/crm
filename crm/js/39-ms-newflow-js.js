/* Marketing Studio — new flow, step 1 (address) → step 2 (intent) → step 2b (package contents).
   Old flow is untouched; this only drives the .msnf screens. */
(function(){
  const root = document.getElementById('ms-newflow');
  if(!root) return;
  const B = document.body;
  const L = {
    grove: { a:'1420 Grove St',        mls:'424118902', photos:24, oh:'Sat 1–4',  drop:'Price drop · Aug 12',
             price:'$1,285,000', hood:'Noe Valley',        facts:'3 bd · 2 ba · 1,510 sqft', img:'assets/prop/s1.jpg',
             why:'Price drop 6 days ago — I would lead with a feed post.',
             tpl:'editorial', tplwhy:'Price drop reads better in Editorial — considered, not salesy.' },
    pine:  { a:'88 Pine St, Unit 12B', mls:'424106744', photos:18, oh:'Sat 11–1', drop:'11 days on market',
             price:'$842,000',   hood:'Financial District', facts:'2 bd · 2 ba · 1,120 sqft', img:'assets/prop/s2.jpg',
             why:'Eleven days on market and an open house Saturday — a feed post is the fastest way to fill it.',
             tpl:'feature', tplwhy:'A city condo sells on the numbers — Feature sheet puts them up front.' },
    maple: { a:'412 Maple Ave',        mls:'41069318',  photos:31, oh:'Sun 12–3', drop:'Price drop · Aug 4',
             price:'$975,000',   hood:'Rockridge',          facts:'4 bd · 3 ba · 2,240 sqft', img:'assets/prop/s3.jpg',
             why:'New price since Aug 4 and 31 photos to work with — a feed post carries it best.',
             tpl:'collage', tplwhy:'Thirty-one photos is a lot of house — Collage shows more of it in one frame.' },
    judah: { a:'1719 Judah St',        mls:'424097902', photos:22, oh:'Sun 1–4',  drop:'Price drop · Aug 13',
             price:'$1,149,000', hood:'Outer Sunset',       facts:'3 bd · 2 ba · 1,340 sqft', img:'assets/prop/s4.jpg',
             why:'Not your listing, but the price moved 6 days ago — a feed post is the safe lead.',
             tpl:'wave', tplwhy:'Not your listing, so Wave keeps it about the house, not the branding.' }
  };
  const ASSETS = {
    igpost:  'feed post',        website: 'property page', igstory: 'story',        reels: 'photo reel',
    tiktok:  'walkthrough clip', x:       'listing tweet', email:   'email blast',  flyer: 'open-house flyer'
  };
  const TPLNAME = { wave:'Wave', feature:'Feature sheet', editorial:'Editorial', collage:'Collage', minimal:'Minimal' };
  const S = { prop:'grove', intent:null, keys:[], tpl:null };

  function screen(name){
    root.querySelectorAll('.msnfs').forEach(s => s.classList.toggle('on', s.dataset.nf === name));
  }
  function paintProp(){
    const p = L[S.prop];
    root.querySelectorAll('[data-nfaddr]').forEach(el => { el.textContent = p.a; });
    const chips = root.querySelectorAll('#msnf-insight .msnfchip');
    if(chips.length === 3){
      chips[0].textContent = p.drop;
      chips[1].textContent = 'Open house ' + p.oh;
      chips[2].textContent = p.photos + ' photos';
    }
    const why = root.querySelector('.msnfcard.rec .whytx');
    if(why) why.textContent = p.why;
    root.querySelectorAll('[data-nfprice]').forEach(el => { el.textContent = p.price; });
    root.querySelectorAll('[data-nfhood]').forEach(el => { el.textContent = p.hood; });
    root.querySelectorAll('[data-nffacts]').forEach(el => { el.textContent = p.facts; });
    root.querySelectorAll('[data-nfphoto]').forEach(el => { el.style.backgroundImage = "url('" + p.img + "')"; });
  }
  function paintCount(){
    const boxes = [...root.querySelectorAll('[data-nfasset]')];
    const n = boxes.filter(b => b.checked).length;
    const cnt = document.getElementById('msnf-cnt'), lbl = document.getElementById('msnf-golbl'),
          go = document.getElementById('msnf-go');
    if(cnt) cnt.textContent = n + ' of ' + boxes.length + ' selected';
    if(lbl) lbl.textContent = n === 1 ? 'Generate 1 asset' : 'Generate ' + n + ' assets';
    if(go) go.disabled = n === 0;
  }

  root.addEventListener('click', e => {
    const pick = e.target.closest('[data-nfpick]');
    if(pick){ S.prop = pick.dataset.nfpick; S.intent = 'igpost'; S.keys = ['igpost']; openTemplates(); return; }
    const back = e.target.closest('[data-nfback]');
    if(back){ screen(back.dataset.nfback); return; }
    const intent = e.target.closest('[data-nfintent]');
    if(intent){
      const k = intent.dataset.nfintent;
      if(k === 'package'){ S.intent = 'package'; paintCount(); screen('scope'); return; }
      S.intent = k;
      root.querySelectorAll('.msnfcard').forEach(c => c.classList.toggle('sel', c === intent));
      if(window.__msnfTemplates) window.__msnfTemplates(S.prop, k);
    }
  });
  root.addEventListener('change', e => { if(e.target.closest('[data-nfasset]')) paintCount(); });

  const field = document.getElementById('msnf-addr'), wrap = document.getElementById('msnf-search');
  if(field && wrap){
    field.addEventListener('focus', () => wrap.classList.add('on'));
    field.addEventListener('blur', () => wrap.classList.remove('on'));
    field.addEventListener('input', () => wrap.classList.remove('miss'));
    /* the field cycles through what it accepts, so nobody has to guess */
    const HINTS = ['Search a property address, or pick one below', 'Try “1420 Grove St”', 'Try an MLS number — “424118902”', 'Try “pull in 1719 Judah St”'];
    const slow = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!slow){
      let i = 0;
      setInterval(() => {
        if(document.activeElement === field || field.value) return;
        if(!wrap.closest('.msnfs').classList.contains('on')) return;
        i = (i + 1) % HINTS.length;
        field.animate([
          { opacity:1, filter:'blur(0px)', transform:'translateY(0)' },
          { opacity:0, filter:'blur(4px)', transform:'translateY(-3px)', offset:.45 },
          { opacity:0, filter:'blur(4px)', transform:'translateY(3px)', offset:.55 },
          { opacity:1, filter:'blur(0px)', transform:'translateY(0)' }
        ], { duration:900, easing:'cubic-bezier(.77,0,.175,1)' });
        setTimeout(() => { field.placeholder = HINTS[i]; }, 450);
      }, 4200);
    }
    field.addEventListener('keydown', e => {
      if(e.key !== 'Enter') return;
      const t = field.value.trim().toLowerCase();
      if(!t) return;
      const num = t.replace(/[^0-9]/g, '');
      const byMls = num.length >= 7 ? Object.keys(L).find(k => L[k].mls === num) : null;
      const q = t.replace(/^pull in\s*/, '');
      const byAddr = q ? Object.keys(L).find(k => L[k].a.toLowerCase().includes(q) || k.includes(q)) : null;
      const hit = byMls || byAddr;
      if(!hit){ wrap.classList.add('miss'); return; }
      wrap.classList.remove('miss');
      /* Mel pulls the listing — the ring runs while it does */
      wrap.classList.add('loading');
      field.blur();
      setTimeout(() => {
        wrap.classList.remove('loading');
        S.prop = hit; S.intent = 'igpost'; S.keys = ['igpost']; openTemplates();
      }, 620);
    });
  }

  const goBtn = document.getElementById('msnf-go');
  if(goBtn) goBtn.addEventListener('click', () => {
    const keys = [...root.querySelectorAll('[data-nfasset]')].filter(b => b.checked).map(b => b.dataset.nfasset);
    if(window.__msnfGenerate) window.__msnfGenerate(S.prop, keys);
  });

  /* ---------- step 3: template wall ---------- */
  const wall = document.getElementById('msnf-tplgrid'), why = document.getElementById('msnf-tplwhy'),
        whyTx = document.getElementById('msnf-tplwhytx'), what = document.getElementById('msnf-tplwhat');

  function openTemplates(){
    S.tpl = null;
    if(why) why.classList.remove('on');
    root.querySelectorAll('.msnftpl,.msafcard--tpl').forEach(t => t.classList.remove('sel','dim','melpick'));
    if(what) what.textContent = S.keys.length > 1 ? 'listing package' : (ASSETS[S.intent] || 'feed post');
    /* highlight Mel's recommended template + copy its 'why' onto the card */
    const p = L[S.prop];
    if(p && p.tpl){
      const rec = root.querySelector('.msafcard--tpl[data-nftpl="' + p.tpl + '"]');
      if(rec){
        rec.classList.add('melpick');
        const whyBox = rec.querySelector('[data-nfwhy]');
        if(whyBox && p.tplwhy) whyBox.textContent = p.tplwhy;
      }
    }
    /* reset format tabs to Post and rebuild visibility + label */
    const tabs = root.querySelectorAll('[data-nfformat]');
    tabs.forEach(t => { const on = t.dataset.nfformat === 'post'; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
    root.querySelectorAll('.msafcard--tpl').forEach(c => {
      const ok = (c.dataset.nfformats || '').split(/\s+/).includes('post');
      c.classList.toggle('hide', !ok);
    });
    const lbl = document.getElementById('msaf-tpllab');
    const cnt = document.getElementById('msaf-tplcnt');
    if(lbl) lbl.textContent = 'Post templates';
    if(cnt) cnt.textContent = root.querySelectorAll('.msafcard--tpl:not(.hide)').length;
    paintProp();
    screen('templates');
  }
  window.__msnfTemplates = function(prop, key){ S.prop = prop; S.intent = key; S.keys = [key]; openTemplates(); };
  window.__msnfGenerate  = function(prop, keys){ S.prop = prop; S.intent = 'package'; S.keys = keys.slice(); openTemplates(); };

  root.addEventListener('click', e => {
    /* More tab toggle */
    const moreBtn = e.target.closest('#msaf-tabmore');
    if(moreBtn){
      const pop = document.getElementById('msaf-morepop');
      if(pop){
        const open = moreBtn.getAttribute('aria-expanded') === 'true';
        moreBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        pop.hidden = open;
      }
      return;
    }
    const fm = e.target.closest('[data-nfformat]');
    if(fm){
      const f = fm.dataset.nfformat;
      const fmap = { post:'Post', story:'Story', reel:'Reel', flier:'Flyers', email:'Email header', site:'Listing website', cards:'Business cards', signs:'Signs' };
      const inMore = !!fm.closest('.msaf-morepop');
      /* clear tab actives */
      root.querySelectorAll('.msaf-tab').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected','false'); });
      root.querySelectorAll('.msaf-moreitem').forEach(b => b.classList.remove('on'));
      /* set active */
      if(inMore){
        fm.classList.add('on');
        const more = document.getElementById('msaf-tabmore');
        const lbl2 = document.getElementById('msaf-morelbl');
        const cnt2 = document.getElementById('msaf-morecnt');
        if(more){ more.classList.add('on'); more.setAttribute('aria-selected','true'); more.setAttribute('aria-expanded','false'); }
        if(lbl2) lbl2.textContent = fmap[f];
        if(cnt2) cnt2.hidden = true;
        const pop = document.getElementById('msaf-morepop'); if(pop) pop.hidden = true;
      } else {
        fm.classList.add('on');
        fm.setAttribute('aria-selected','true');
        const lbl2 = document.getElementById('msaf-morelbl');
        if(lbl2) lbl2.textContent = 'More';
        const more = document.getElementById('msaf-tabmore'); if(more) more.setAttribute('aria-expanded','false');
        const pop = document.getElementById('msaf-morepop'); if(pop) pop.hidden = true;
      }
      /* filter grid */
      root.querySelectorAll('.msafcard--tpl').forEach(c => {
        const ok = (c.dataset.nfformats || '').split(/\s+/).includes(f);
        c.classList.toggle('hide', !ok);
      });
      const lbl = document.getElementById('msaf-tpllab');
      const cnt = document.getElementById('msaf-tplcnt');
      if(lbl) lbl.textContent = (fmap[f] || 'Post') + ' templates';
      if(cnt) cnt.textContent = root.querySelectorAll('.msafcard--tpl:not(.hide)').length;
      return;
    }
    /* Upload template button */
    const upBtn = e.target.closest('#msaf-upload-btn');
    if(upBtn){
      const inp = document.getElementById('msaf-upload-input');
      if(inp) inp.click();
      return;
    }
    /* Build listing package button */
    const pkgBtn = e.target.closest('#msaf-package-btn');
    if(pkgBtn){
      const on = document.body.classList.toggle('msaf-pkgmode');
      pkgBtn.classList.toggle('on', on);
      if(on){
        S.intent = 'package';
        S.keys = ['igpost','igstory','reels','flier','website'];
      } else {
        S.intent = 'igpost';
        S.keys = ['igpost'];
      }
      return;
    }
    /* Exit package mode */
    const pkgClear = e.target.closest('#msaf-pkgclear');
    if(pkgClear){
      document.body.classList.remove('msaf-pkgmode');
      const pb = document.getElementById('msaf-package-btn');
      if(pb) pb.classList.remove('on');
      S.intent = 'igpost';
      S.keys = ['igpost'];
      return;
    }
    /* click outside closes More popup */
    if(!e.target.closest('.msaf-moregroup')){
      const more = document.getElementById('msaf-tabmore');
      const pop = document.getElementById('msaf-morepop');
      if(more && pop && !pop.hidden){ more.setAttribute('aria-expanded','false'); pop.hidden = true; }
    }
    const t = e.target.closest('[data-nftpl]');
    if(t){ runGen(t.dataset.nftpl); }
  });

  const melPick = document.getElementById('msnf-melpick');
  if(melPick) melPick.addEventListener('click', () => {
    const p = L[S.prop], pick = root.querySelector('[data-nftpl="' + p.tpl + '"]');
    if(!pick) return;
    root.querySelectorAll('[data-nffilter]').forEach(b => b.classList.toggle('on', b.dataset.nffilter === 'All'));
    root.querySelectorAll('.msnftpl').forEach(x => { x.classList.remove('hide'); x.classList.toggle('sel', x === pick); x.classList.toggle('dim', x !== pick); });
    if(whyTx) whyTx.textContent = p.tplwhy;
    if(why) why.classList.add('on');
    S.tpl = p.tpl;
  });

  /* ---------- step 4: skip the interstitial, land straight in the editor ---------- */
  function runGen(tplKey){
    S.tpl = tplKey;
    paintProp();
    if(window.__msnfEditor) window.__msnfEditor(S.prop, S.keys);
  }

  /* Tweaks → Marketing Studio → Flow */
  window.__applyMsFlow = function(v){
    const on = v === 'new';
    B.classList.toggle('msflow-new', on);
    try { localStorage.setItem('crm-msflow', on ? 'new' : 'old'); } catch(_){}
    if(on){ S.intent = null; root.querySelectorAll('.msnfcard').forEach(c => c.classList.remove('sel')); paintProp(); paintCount(); screen('address'); }
  };
  ['ms-navstudio','mel-new'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.addEventListener('click', () => { if(B.classList.contains('msflow-new')) setTimeout(() => screen('address'), 0); });
  });

  let saved = null;
  const upInp = document.getElementById('msaf-upload-input');
  if(upInp) upInp.addEventListener('change', () => {
    const f = upInp.files && upInp.files[0];
    if(f && window.MEL && typeof window.MEL.toast === 'function') window.MEL.toast('Template uploaded: ' + f.name);
    else if(f) console.log('Template uploaded:', f.name);
    upInp.value = '';
  });
  try { saved = localStorage.getItem('crm-msflow'); } catch(_){}
  window.__applyMsFlow(saved === 'new' ? 'new' : 'old');

  /* --- msaf full-page mode: hide Mel copilot secondary sidebar on address screen only --- */
  (function(){
    const bod = document.body;
    const pageEl = document.getElementById('mel-page');
    function inMS(){ return bod.classList.contains('msflow-new') && pageEl && pageEl.classList.contains('studio'); }
    function syncFull(){
      const addrOn = !!root.querySelector('.msnfs[data-nf="address"].on, .msnfs[data-nf="templates"].on');
      const shellPlain = pageEl && !pageEl.classList.contains('paneled') && !pageEl.classList.contains('canvason') && !pageEl.classList.contains('packeton') && !pageEl.classList.contains('library') && !pageEl.classList.contains('pkediton');
      bod.classList.toggle('msfull', addrOn && inMS() && shellPlain);
    }
    ['ms-navstudio','mel-new','ms-navlib'].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.addEventListener('click', () => setTimeout(syncFull, 40));
    });
    let syncing = false;
    function safeSync(){
      if(syncing) return;
      syncing = true;
      try { syncFull(); } finally { setTimeout(() => { syncing = false; }, 0); }
    }
    const obs = new MutationObserver(safeSync);
    root.querySelectorAll('.msnfs').forEach(s => obs.observe(s, {attributes:true, attributeFilter:['class']}));
    if(pageEl) new MutationObserver(safeSync).observe(pageEl, {attributes:true, attributeFilter:['class']});
    setTimeout(safeSync, 0);
    setTimeout(safeSync, 400);

    const back = document.getElementById('msaf-back');
    if(back) back.addEventListener('click', () => {
      bod.classList.remove('msfull');
      if(window.MEL && typeof window.MEL.newChat === 'function') window.MEL.newChat();
      else if(pageEl) pageEl.classList.remove('studio','packeton','canvason','library','paneled');
    });
  })();
})();
