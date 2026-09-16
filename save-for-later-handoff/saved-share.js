/* Save for later + Share — logic extracted verbatim from CRM/index.html.
   Two IIFEs. The first owns the store and exposes window.psSaved; the second
   (property detail) is a pure consumer of it. */

/* ==== index.html 22086-22471 : #property-search-module ==== */
(function(){
  const root=document.getElementById('ps-page');
  if(!root)return;
  const cards=[...root.querySelectorAll('.ps-card[data-ps-id]')];
  const selected=new Set();
  const saved=new Map();
  const selectedClients=new Set();
  const clients=[
    {id:'sarah',name:'Sarah Chen',meta:'Buyer · $900k budget'},
    {id:'michael',name:'Michael Ross',meta:'Investor · cash ready'},
    {id:'priya',name:'Priya Shah',meta:'Relocating · needs schools'},
    {id:'daniel',name:'Daniel Lee',meta:'First-time buyer'},
    {id:'amanda',name:'Amanda Brooks',meta:'Seller + buyer'},
    {id:'nora',name:'Nora Zeglaya',meta:'Buyer · condo shortlist'},
    {id:'marcus',name:'Marcus Hale',meta:'Move-up buyer'},
    {id:'elena',name:'Elena Park',meta:'Downsizing'},
    {id:'jordan',name:'Jordan Miles',meta:'VA approved'},
    {id:'lena',name:'Lena Ortiz',meta:'Open house follow-up'}
  ];
  const bulk=root.querySelector('#ps-bulkbar');
  const bulkCount=root.querySelector('#ps-bulkcount');
  const saveBtn=root.querySelector('#ps-save-later');
  const shareBtn=root.querySelector('#ps-share-now');
  const savedRow=root.querySelector('#ps-savedrow');
  const savedChips=root.querySelector('#ps-savedchips');
  const savedShare=root.querySelector('#ps-savedshare');
  const savedPop=root.querySelector('#ps-savedpop');
  const savedPopTitle=root.querySelector('#ps-savedpop-t');
  const savedPopBody=root.querySelector('#ps-savedpop-b');
  let savedPopAnchor=null;
  const modal=document.getElementById('ps-sharemodal');
  const modalDesc=document.getElementById('ps-sharedesc');
  const clientSearch=document.getElementById('ps-clientsearch');
  const clientChev=document.getElementById('ps-clientchev');
  const clientList=document.getElementById('ps-clientlist');
  const clientPills=document.getElementById('ps-clientpills');
  const TOP_CLIENTS=5;             /* pills under the search: the agent's most-used clients, one tap each */
  const shareConfirm=document.getElementById('ps-shareconfirm');

  function propFromCard(card){
    return {id:card.dataset.psId,title:card.dataset.psTitle,price:card.dataset.psPrice};
  }
  function selectedProps(){
    return cards.filter(card=>selected.has(card.dataset.psId)).map(propFromCard);
  }
  function syncSelection(){
    cards.forEach(card=>{
      const on=selected.has(card.dataset.psId);
      card.classList.toggle('selected',on);
      const box=card.querySelector('[data-ps-select]');
      if(box)box.checked=on;
    });
    const count=selected.size;
    bulkCount.textContent=count+' '+(count===1?'property':'properties')+' selected';
    bulk.classList.toggle('on',count>=2);
  }
  function clearSelection(){
    selected.clear();
    syncSelection();
  }
  /* ---- saved store: this module is the single owner. The property detail page talks to it
     through window.psSaved (below) and never keeps a second copy — two stores would drift. ---- */
  const SAVED_KEY='ps-saved';
  const SAVED_CAP=5;               /* chip slots in the row; the last one becomes "N others". 5 keeps the row on one line */
  const savedSubs=[];
  function loadSaved(){
    try{
      const raw=localStorage.getItem(SAVED_KEY);
      if(!raw)return;
      JSON.parse(raw).forEach(p=>{if(p&&p.id)saved.set(p.id,{id:p.id,title:p.title,price:p.price});});
    }catch(e){console.warn('[ps-saved] could not read storage, saves stay in memory: '+e.message);}
  }
  function persistSaved(){
    try{localStorage.setItem(SAVED_KEY,JSON.stringify([...saved.values()]));}
    catch(e){console.warn('[ps-saved] could not write storage, saves stay in memory: '+e.message);}
  }
  /* the saved row is a working shortlist, not a parking lot: open · share · remove.
     Batch share lives on the row; per-item share lives in the overflow panel, where
     there is width for it — a third control on a 28px chip reads as a toolbar. */
  function openSaved(prop){
    closeSavedPop();
    if(typeof window.openPropertyDetail==='function')window.openPropertyDetail(prop);
    else console.warn('[ps-saved] window.openPropertyDetail missing — cannot open '+prop.id);
  }
  function savedChip(prop){
    const chip=document.createElement('span');
    chip.className='ps-savechip';
    const label=document.createElement('button');
    label.type='button';
    label.className='lab';
    label.title='Open '+prop.title;
    label.textContent=prop.title+' · '+prop.price;
    label.addEventListener('click',()=>openSaved(prop));
    const remove=document.createElement('button');
    remove.type='button';
    remove.className='rm';
    remove.setAttribute('aria-label','Remove '+prop.title);
    remove.textContent='×';
    remove.addEventListener('click',()=>{saved.delete(prop.id);syncSaved();});
    chip.append(label,remove);
    return chip;
  }
  function overflowList(){return [...saved.values()].slice(SAVED_CAP-1);}
  function syncSaved(){
    savedChips.textContent='';
    const list=[...saved.values()];
    const over=list.length>SAVED_CAP;
    (over?list.slice(0,SAVED_CAP-1):list).forEach(prop=>savedChips.appendChild(savedChip(prop)));
    if(over){
      const rest=list.length-(SAVED_CAP-1);
      const more=document.createElement('button');
      more.type='button';
      more.id='ps-savedmore';
      more.className='ps-savechip more';
      more.setAttribute('aria-haspopup','dialog');
      more.setAttribute('aria-expanded',savedPop.classList.contains('on')?'true':'false');
      const label=document.createElement('span');
      label.textContent=rest+' others';
      const caret=document.createElement('i');
      caret.className='ph ph-caret-down';
      caret.setAttribute('aria-hidden','true');
      more.append(label,caret);
      /* stopPropagation so the outside-click listener doesn't close the panel we just opened */
      more.addEventListener('click',e=>{e.stopPropagation();savedPop.classList.contains('on')?closeSavedPop():openSavedPop(more);});
      savedChips.appendChild(more);
      if(savedPop.classList.contains('on')){renderSavedPop();placeSavedPop(more);}
    }else if(savedPop.classList.contains('on')){closeSavedPop();}
    savedRow.classList.toggle('on',saved.size>0);
    persistSaved();
    savedSubs.forEach(fn=>{try{fn();}catch(e){console.warn('[ps-saved] subscriber failed: '+e.message);}});
  }
  function renderSavedPop(){
    const rest=overflowList();
    savedPopTitle.textContent=rest.length+' more saved';
    savedPopBody.textContent='';
    rest.forEach(prop=>{
      const row=document.createElement('div');
      row.className='ps-savepoprow';
      const label=document.createElement('button');
      label.type='button';
      label.className='lab';
      label.title='Open '+prop.title;
      label.textContent=prop.title+' · '+prop.price;
      label.addEventListener('click',e=>{e.stopPropagation();openSaved(prop);});
      const share=document.createElement('button');
      share.type='button';
      share.className='act';
      share.title='Share '+prop.title;
      share.setAttribute('aria-label','Share '+prop.title);
      share.innerHTML='<i class="ph ph-share-network" aria-hidden="true"></i>';
      share.addEventListener('click',e=>{e.stopPropagation();closeSavedPop();openModal([prop]);});
      const remove=document.createElement('button');
      remove.type='button';
      remove.className='rm';
      remove.setAttribute('aria-label','Remove '+prop.title);
      remove.textContent='×';
      /* stopPropagation: syncSaved() re-renders this row, so by the time the document
         listener runs the button is detached and would read as an outside click */
      remove.addEventListener('click',e=>{e.stopPropagation();saved.delete(prop.id);syncSaved();});
      row.append(label,share,remove);
      savedPopBody.appendChild(row);
    });
  }
  function placeSavedPop(anchor){
    if(!anchor)return;
    const r=anchor.getBoundingClientRect(),w=savedPop.offsetWidth;
    let left=Math.min(r.right-w,window.innerWidth-w-12);
    if(left<12)left=12;
    /* pick the roomier side and cap the height to it — clamping a too-tall panel to the
       viewport top would park it on top of the saved row it belongs to */
    const below=window.innerHeight-12-(r.bottom+8),above=r.top-8-12;
    const useBelow=below>=above;
    savedPop.style.maxHeight=Math.max(160,useBelow?below:above)+'px';
    const h=savedPop.offsetHeight;
    savedPop.style.left=left+'px';
    savedPop.style.top=(useBelow?r.bottom+8:Math.max(12,r.top-h-8))+'px';
  }
  function openSavedPop(anchor){
    savedPopAnchor=anchor;
    renderSavedPop();
    savedPop.classList.add('on');
    savedPop.setAttribute('aria-hidden','false');
    anchor.setAttribute('aria-expanded','true');
    placeSavedPop(anchor);
  }
  function closeSavedPop(){
    savedPop.classList.remove('on');
    savedPop.setAttribute('aria-hidden','true');
    const more=document.getElementById('ps-savedmore');
    if(more)more.setAttribute('aria-expanded','false');
    savedPopAnchor=null;
  }
  function clientInitials(name){
    return name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
  }
  function clientAvatar(client){
    const av=document.createElement('span');
    av.className='rds-avatar rds-avatar--xs';
    av.setAttribute('aria-hidden','true');
    av.textContent=clientInitials(client.name);
    return av;
  }
  function toggleClient(id){
    if(selectedClients.has(id))selectedClients.delete(id);
    else selectedClients.add(id);
    renderClientPills();
    renderClients();
  }
  function openClientList(){
    clientList.hidden=false;
    clientChev.setAttribute('aria-expanded','true');
    clientSearch.setAttribute('aria-expanded','true');
  }
  function closeClientList(){
    clientList.hidden=true;
    clientChev.setAttribute('aria-expanded','false');
    clientSearch.setAttribute('aria-expanded','false');
  }
  /* the dropdown is the ONLY scroller in this dialog — the body itself never scrolls */
  function renderClients(){
    const q=(clientSearch.value||'').trim().toLowerCase();
    const rows=clients.filter(c=>(c.name+' '+c.meta).toLowerCase().includes(q));
    clientList.textContent='';
    if(!rows.length){
      const empty=document.createElement('div');
      empty.className='ps-clientempty';
      empty.textContent='No clients match that search.';
      clientList.appendChild(empty);
      return;
    }
    rows.forEach(client=>{
      const row=document.createElement('div');
      row.className='ps-clientrow';
      row.setAttribute('role','option');
      row.tabIndex=0;
      row.dataset.psClient=client.id;
      const on=selectedClients.has(client.id);
      row.setAttribute('aria-selected',on?'true':'false');
      const name=document.createElement('strong');
      name.textContent=client.name;
      row.append(clientAvatar(client),name);
      if(on){
        const ck=document.createElement('i');
        ck.className='ph ph-check ck';
        ck.setAttribute('aria-hidden','true');
        row.appendChild(ck);
      }
      row.addEventListener('click',()=>toggleClient(client.id));
      row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleClient(client.id);}});
      clientList.appendChild(row);
    });
  }
  /* pills = the top 5 clients, plus anyone picked from the dropdown who isn't in that 5.
     One row does both jobs, so there is no separate "selected chips" strip to keep in sync. */
  function renderClientPills(){
    const top=clients.slice(0,TOP_CLIENTS);
    const extra=clients.filter(c=>selectedClients.has(c.id)&&!top.includes(c));
    clientPills.textContent='';
    top.concat(extra).forEach(client=>{
      const on=selectedClients.has(client.id);
      const pill=document.createElement('button');
      pill.type='button';
      pill.className='ps-cpill'+(on?' on':'');
      pill.dataset.psClient=client.id;
      pill.setAttribute('aria-pressed',on?'true':'false');
      const label=document.createElement('span');
      label.textContent=client.name;
      pill.append(clientAvatar(client),label);
      pill.addEventListener('click',()=>toggleClient(client.id));
      clientPills.appendChild(pill);
    });
    shareConfirm.disabled=selectedClients.size===0;
  }
  /* one share modal, two sources: the checkbox selection (default) or the saved shortlist.
     Never fork this into a second dialog — the two copies would drift. */
  let shareTargets=[],shareFromSelection=true;
  function openModal(props){
    shareFromSelection=!(props&&props.length);
    shareTargets=shareFromSelection?selectedProps():props;
    if(!shareTargets.length)return;
    selectedClients.clear();
    clientSearch.value='';
    const count=shareTargets.length;
    modalDesc.textContent=count+' '+(count===1?'property':'properties')+' selected. Add one or more clients.';
    renderClientPills();
    renderClients();
    closeClientList();
    modal.classList.add('on');
    modal.setAttribute('aria-hidden','false');
    setTimeout(()=>clientSearch.focus(),0);
  }
  function closeModal(){
    closeClientList();
    modal.classList.remove('on');
    modal.setAttribute('aria-hidden','true');
  }

  cards.forEach(card=>{
    const box=card.querySelector('[data-ps-select]');
    if(!box)return;
    const wrap=card.querySelector('.ps-select');
    /* stopPropagation only — never preventDefault here: cancelling the label click
       reverts the native checkbox after syncSelection() writes it, so the card reads
       selected while its box reads unchecked. The change event is the only source. */
    if(wrap)wrap.addEventListener('click',e=>{e.stopPropagation();});
    box.addEventListener('change',()=>{
      if(box.checked)selected.add(card.dataset.psId);
      else selected.delete(card.dataset.psId);
      syncSelection();
    });
  });
  saveBtn.addEventListener('click',()=>{
    selectedProps().forEach(prop=>saved.set(prop.id,prop));
    syncSaved();
    clearSelection();
  });
  /* wrapped, not passed directly: the listener would hand openModal the click event as its props */
  shareBtn.addEventListener('click',()=>openModal());
  root.querySelector('.ps-pill.share').addEventListener('click',()=>{if(selected.size)openModal();});
  savedShare.addEventListener('click',()=>{closeSavedPop();openModal([...saved.values()]);});
  clientSearch.addEventListener('input',()=>{renderClients();openClientList();});
  clientSearch.addEventListener('focus',()=>{if((clientSearch.value||'').trim())openClientList();});
  clientChev.addEventListener('click',()=>{
    if(clientList.hidden){renderClients();openClientList();clientSearch.focus();}
    else closeClientList();
  });
  /* Clicks inside the picker must not close the list — and the check CANNOT be
     `e.target.closest('.ps-clientpick')` in the handler below: toggling a row re-renders the
     list, so by the time the click bubbles up the clicked row is detached and closest() is null.
     Stopping propagation at the container (which is never re-rendered) is the reliable guard. */
  document.querySelector('.ps-clientpick').addEventListener('click',e=>e.stopPropagation());
  modal.addEventListener('click',e=>{
    if(e.target===modal){closeModal();return;}
    closeClientList();
  });
  document.getElementById('ps-shareclose').addEventListener('click',closeModal);
  document.getElementById('ps-sharecancel').addEventListener('click',closeModal);
  /* Esc unwinds one layer at a time: dropdown first, dialog second. Capture phase + stopPropagation
     is required — a document-level Esc handler elsewhere closes the overlay, so a bubbling listener
     here would let both layers close on one press. */
  modal.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    if(!clientList.hidden){e.stopPropagation();closeClientList();return;}
    closeModal();
  },true);
  shareConfirm.addEventListener('click',()=>{
    const propCount=shareTargets.length;
    const clientCount=selectedClients.size;
    closeModal();
    /* sharing the checkbox selection ends it (existing behaviour). Sharing the saved list
       does NOT clear it — it is a shortlist the agent curates over days and may send twice. */
    if(shareFromSelection)clearSelection();
    if(window.sonner)window.sonner('Shared property shortlist',propCount+' properties · '+clientCount+' clients');
  });
  root.querySelector('#ps-savedpop-x').addEventListener('click',closeSavedPop);
  document.addEventListener('click',e=>{
    if(!savedPop.classList.contains('on'))return;
    /* composedPath() is captured at dispatch, so it still names the panel even when the
       clicked node was re-rendered away mid-handler */
    const path=typeof e.composedPath==='function'?e.composedPath():[];
    if(path.some(n=>n&&(n.id==='ps-savedpop'||n.id==='ps-savedmore')))return;
    if(e.target.closest&&(e.target.closest('#ps-savedpop')||e.target.closest('#ps-savedmore')))return;
    closeSavedPop();
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&savedPop.classList.contains('on'))closeSavedPop();});
  window.addEventListener('resize',()=>{if(savedPop.classList.contains('on'))placeSavedPop(savedPopAnchor);});
  window.addEventListener('scroll',()=>{if(savedPop.classList.contains('on'))placeSavedPop(savedPopAnchor);},true);

  /* the only way other modules (property detail page) touch the saved list */
  window.psSaved={
    add(prop){
      if(!prop||!prop.id){console.warn('[ps-saved] add() called without an id');return false;}
      saved.set(prop.id,{id:prop.id,title:prop.title,price:prop.price});
      syncSaved();
      return true;
    },
    remove(id){const had=saved.delete(id);if(had)syncSaved();return had;},
    has(id){return saved.has(id);},
    list(){return [...saved.values()];},
    subscribe(fn){if(typeof fn==='function')savedSubs.push(fn);}
  };

  syncSelection();
  loadSaved();
  syncSaved();
})();

/* ==== index.html 22505-22603 : #property-detail-module ==== */
/* Property detail page — opened by clicking a .ps-card, closed by "Back to listings".
   Same mechanism as #txd-page: sibling <main>, toggled with .on, the list page hidden
   behind it. body.pd-open drops the CRM sidebar so the page runs full-bleed. */
(function(){
  const page=document.getElementById('pd-page');
  const list=document.getElementById('ps-page');
  const back=document.getElementById('pd-back');
  if(!page||!list||!back){console.warn('[property-detail] missing #pd-page, #ps-page or #pd-back');return;}
  const saveBtn=document.getElementById('pd-save');
  /* the card that opened the page — all four point at the Kansas St listing today, but the
     save must record the card the agent actually clicked, not a hardcoded id */
  let current=null;

  function syncSaveBtn(){
    if(!saveBtn||!window.psSaved)return;
    const on=!!(current&&window.psSaved.has(current.id));
    saveBtn.classList.toggle('on',on);
    saveBtn.setAttribute('aria-pressed',on?'true':'false');
    saveBtn.querySelector('.lb').textContent=on?'Saved for later':'Save for later';
    /* no fill variant exists in the vendored Phosphor set — state is carried by the class + label */
    saveBtn.querySelector('i').className=on?'ph ph-check':'ph ph-bookmark-simple';
  }
  /* first-visit intro. Once ever per browser: dismissing it sets the flag, and so does the
     first real save — using the feature explains it better than the hint does. */
  const HINT_KEY='ps-savedhint';
  const hint=document.getElementById('pd-savehint');
  function retireHint(){
    if(hint)hint.hidden=true;
    try{localStorage.setItem(HINT_KEY,'1');}
    catch(e){console.warn('[property-detail] could not persist hint flag: '+e.message);}
  }
  function maybeShowHint(){
    if(!hint)return;
    let seen=true;
    try{seen=localStorage.getItem(HINT_KEY)==='1';}
    catch(e){console.warn('[property-detail] could not read hint flag: '+e.message);}
    if(seen)return;
    /* an agent who already has a shortlist has met the feature — don't explain it to them */
    if(window.psSaved&&window.psSaved.list().length){retireHint();return;}
    hint.hidden=false;
  }
  if(hint)document.getElementById('pd-savehintx').addEventListener('click',retireHint);
  if(saveBtn){
    if(!window.psSaved){console.warn('[property-detail] window.psSaved missing — save button disabled');saveBtn.disabled=true;}
    else{
      saveBtn.addEventListener('click',()=>{
        if(!current)return;
        retireHint();
        if(window.psSaved.has(current.id)){
          window.psSaved.remove(current.id);
          if(window.sonner)window.sonner('Removed from saved',current.title);
        }else{
          window.psSaved.add(current);
          if(window.sonner)window.sonner('Saved for later',current.title+' · '+current.price);
        }
        syncSaveBtn();
      });
      window.psSaved.subscribe(syncSaveBtn);
    }
  }

  function openPd(){
    list.style.display='none';
    page.classList.add('on');
    document.body.classList.add('pd-open');
    page.querySelector('.pd-scroll').scrollTop=0;
    maybeShowHint();
  }
  function closePd(){
    page.classList.remove('on');
    document.body.classList.remove('pd-open');
    if(document.body.getAttribute('data-page')==='search')list.style.display='flex';
  }
  window.closePropertyDetail=closePd;
  /* how the saved shortlist reopens a property — same path as a card click, so the
     save button on the page comes up in the right state for that listing */
  window.openPropertyDetail=function(prop){
    if(!prop||!prop.id){console.warn('[property-detail] openPropertyDetail() called without a property');return;}
    current={id:prop.id,title:prop.title,price:prop.price};
    syncSaveBtn();
    openPd();
  };

  document.querySelectorAll('#ps-page .ps-card[data-ps-id]').forEach(card=>{
    card.addEventListener('click',e=>{
      /* the checkbox owns its own click (.ps-select calls stopPropagation) — this is a guard
         for keyboard/label edge cases, not a duplicate of it */
      if(e.target.closest('.ps-select'))return;
      current={id:card.dataset.psId,title:card.dataset.psTitle,price:card.dataset.psPrice};
      syncSaveBtn();
      openPd();
    });
  });
  back.addEventListener('click',closePd);
  /* a sidebar nav click can't happen while the page is open (the sidebar is hidden),
     but keep the page from surviving any other route change */
  document.querySelectorAll('.sidebar > .nav[data-page]').forEach(n=>n.addEventListener('click',closePd));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&page.classList.contains('on'))closePd();});
})();
