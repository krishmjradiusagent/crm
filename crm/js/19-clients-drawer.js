/* ---------- Add client drawer ----------
   Opens from "+ New client → Add manually". Right-anchored sheet; scrim + Esc close,
   focus moves to the first field on open and returns to the trigger on close. */
(function(){
  const scrim=document.getElementById('ac-scrim'),dw=document.getElementById('ac-drawer');
  if(!dw)return;
  let lastFocus=null;
  const focusables=()=>[...dw.querySelectorAll('button,input,select,textarea,[href]')].filter(el=>!el.disabled&&el.offsetParent!==null);

  function open(){
    lastFocus=document.activeElement;
    dw.setAttribute('aria-hidden','false');
    scrim.classList.add('open');dw.classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('ac-name').focus(),260);
  }
  function close(){
    scrim.classList.remove('open');dw.classList.remove('open');
    dw.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
    if(lastFocus&&lastFocus.focus)lastFocus.focus();
  }
  window.openAddClient=open;

  /* trigger: the "Add manually" row in the + New client menu */
  const menu=document.getElementById('cl-ncmenu');
  if(menu){
    [...menu.querySelectorAll('.ncitem')].forEach(it=>{
      if(/add manually/i.test(it.textContent))it.addEventListener('click',()=>{menu.classList.remove('open');open();});
    });
  }

  scrim.addEventListener('click',close);
  ['ac-close','ac-back','ac-cancel'].forEach(id=>document.getElementById(id).addEventListener('click',close));
  document.addEventListener('keydown',e=>{
    if(!dw.classList.contains('open'))return;
    if(e.key==='Escape'){e.stopPropagation();close();return;}
    if(e.key==='Tab'){
      const f=focusables();if(!f.length)return;
      const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
  },true);

  /* repeatable phone / email rows */
  const rmSvg='<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  function addRow(wrapId,type,ph){
    const wrap=document.getElementById(wrapId);
    const row=document.createElement('div');row.className='dwrow';
    row.innerHTML='<input class="rds-input" type="'+type+'" placeholder="'+ph+'"><button class="rds-btn rds-btn--outline rds-btn--icon rds-btn--sm" type="button" aria-label="Remove">'+rmSvg+'</button>';
    row.querySelector('button').addEventListener('click',()=>row.remove());
    wrap.appendChild(row);row.querySelector('input').focus();
  }
  document.getElementById('ac-addphone').addEventListener('click',()=>addRow('ac-phones','tel','Enter phone number'));
  document.getElementById('ac-addemail').addEventListener('click',()=>addRow('ac-emails','email','Enter email address'));

  /* avatar */
  const fileIn=document.getElementById('ac-file');
  document.getElementById('ac-browse').addEventListener('click',()=>fileIn.click());
  fileIn.addEventListener('change',()=>{
    const f=fileIn.files&&fileIn.files[0];if(!f)return;
    const url=URL.createObjectURL(f);
    document.getElementById('ac-avpreview').innerHTML='<img alt="Profile preview" src="'+url+'">';
  });

  /* tags */
  const tagIn=document.getElementById('ac-tags'),tagBox=document.getElementById('ac-tagbox');
  tagIn.addEventListener('keydown',e=>{
    if(e.key!=='Enter'||!tagIn.value.trim())return;
    e.preventDefault();
    const pill=document.createElement('span');pill.className='rds-badge rds-badge--indigo';
    pill.innerHTML='<span></span><button type="button" aria-label="Remove tag">'+rmSvg+'</button>';
    pill.firstChild.textContent=tagIn.value.trim();
    pill.querySelector('button').addEventListener('click',()=>pill.remove());
    tagBox.appendChild(pill);tagIn.value='';
  });

  /* additional details */
  const disc=document.getElementById('ac-disc'),tog=document.getElementById('ac-disctog');
  tog.addEventListener('click',()=>{
    const openNow=!disc.classList.contains('open');
    disc.classList.toggle('open',openNow);tog.setAttribute('aria-expanded',String(openNow));
  });

  /* contact-type hierarchy: Type (contact|client) reveals either Contact type (single,
     with an Other free-text) or Client role (multi-select tags). All three are DS
     comboboxes — a trigger plus an rds-menu panel, no native selects. */
  const typePick=document.getElementById('ac-type'),
        ctypeField=document.getElementById('ac-ctype-field'),ctypePick=document.getElementById('ac-ctype'),
        otherField=document.getElementById('ac-ctother-field'),otherIn=document.getElementById('ac-ctother'),
        roleField=document.getElementById('ac-roles-field'),rolePick=document.getElementById('ac-roles'),
        roleBtn=document.getElementById('ac-roles-btn'),roleMenu=document.getElementById('ac-roles-menu'),
        roleVal=document.getElementById('ac-roles-val'),
        picks=[typePick,ctypePick,rolePick];
  function pickVal(p){return p.dataset.value||''}
  function openPick(p,open){
    p.classList.toggle('open',open);
    p.querySelector('.rds-combobox__trigger').setAttribute('aria-expanded',String(open));
  }
  function closeAllPicks(except){picks.forEach(p=>{if(p!==except)openPick(p,false)})}
  function setPick(p,val,ph){
    p.dataset.value=val;
    const t=p.querySelector('.rds-combobox__trigger');
    t.querySelector('.ctpick__val').textContent=val||ph;
    t.dataset.placeholder=String(!val);
    p.querySelectorAll('.ctpick__opt[data-val]').forEach(o=>o.setAttribute('aria-selected',String(o.dataset.val===val)));
  }
  function acRoles(){return [...roleMenu.querySelectorAll('[aria-selected="true"]')].map(o=>o.dataset.role)}
  function acType(){return pickVal(typePick)}
  function paintRoles(){
    const r=acRoles();
    roleVal.innerHTML=r.length
      ? r.map(v=>`<span class="ctpick__tag">${v}<span class="ctpick__tagx" role="button" tabindex="0" aria-label="Remove ${v}" data-rm="${v}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span></span>`).join('')
      : 'Select client role';
    roleBtn.dataset.placeholder=String(!r.length);
  }
  /* trigger toggles */
  picks.forEach(p=>p.querySelector('.rds-combobox__trigger').addEventListener('click',()=>{
    const open=!p.classList.contains('open');closeAllPicks(p);openPick(p,open);
  }));
  /* Type */
  typePick.querySelector('.rds-combobox__panel').addEventListener('click',e=>{
    const o=e.target.closest('.ctpick__opt');if(!o)return;
    setPick(typePick,o.dataset.val,'Select type');openPick(typePick,false);
    const v=o.dataset.val;
    ctypeField.hidden=v!=='Contact';
    roleField.hidden=v!=='Client';
    /* switching branch clears the other branch's answer */
    if(v!=='Contact'){setPick(ctypePick,'','Select contact type');otherIn.value='';otherField.hidden=true}
    if(v!=='Client'){roleMenu.querySelectorAll('[aria-selected="true"]').forEach(x=>x.setAttribute('aria-selected','false'));paintRoles()}
  });
  /* Contact type */
  ctypePick.querySelector('.rds-combobox__panel').addEventListener('click',e=>{
    const o=e.target.closest('.ctpick__opt');if(!o)return;
    setPick(ctypePick,o.dataset.val,'Select contact type');openPick(ctypePick,false);
    const isOther=o.dataset.val==='Other';
    otherField.hidden=!isOther;
    if(!isOther)otherIn.value='';else otherIn.focus();
  });
  /* Client role — multi */
  roleMenu.addEventListener('click',e=>{
    const o=e.target.closest('.ctpick__opt');if(!o)return;
    o.setAttribute('aria-selected',o.getAttribute('aria-selected')!=='true');paintRoles();
  });
  roleVal.addEventListener('click',e=>{
    const x=e.target.closest('[data-rm]');if(!x)return;
    e.stopPropagation();
    const o=roleMenu.querySelector(`[data-role="${x.dataset.rm}"]`);
    if(o)o.setAttribute('aria-selected','false');
    paintRoles();
  });
  document.addEventListener('click',e=>{if(!picks.some(p=>p.contains(e.target)))closeAllPicks()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAllPicks()});
  /* keyboard: Enter/Space on an option behaves like a click */
  picks.forEach(p=>p.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const o=e.target.closest('.ctpick__opt');if(!o)return;
    e.preventDefault();o.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  }));

  /* save */
  document.getElementById('ac-save').addEventListener('click',()=>{
    const name=document.getElementById('ac-name').value.trim();
    const hasContact=[...dw.querySelectorAll('#ac-phones input,#ac-emails input')].some(i=>i.value.trim());
    if(!name||!hasContact){
      const bad=!name?document.getElementById('ac-name'):document.getElementById('ac-phone');
      bad.focus();bad.setAttribute('aria-invalid','true');
      bad.addEventListener('input',()=>bad.removeAttribute('aria-invalid'),{once:true});
      if(window.sonner)window.sonner('Missing required info',!name?'Add a full name to save this client.':'Add a phone number or email address.');
      return;
    }
    const t=acType(),ct=pickVal(ctypePick),roles=acRoles();
    if(!t){if(window.sonner)window.sonner('Pick a type','Choose contact or client to save.');return}
    if(t==='Contact'&&!ct){if(window.sonner)window.sonner('Pick a contact type','Agent, industry professional, external or other.');return}
    if(t==='Contact'&&ct==='Other'&&!otherIn.value.trim()){otherIn.focus();if(window.sonner)window.sonner('Name the type','Enter a name for this contact type.');return}
    if(t==='Client'&&!roles.length){roleBtn.focus();if(window.sonner)window.sonner('Pick a client role','Choose at least one of buyer, seller, landlord or tenant.');return}
    const what=t==='Client'?'a client · '+roles.join(', ').toLowerCase()
      :'a contact · '+(ct==='Other'?otherIn.value.trim():ct).toLowerCase();
    if(window.sonner)window.sonner('Client saved',name+' was added as '+what+'.');
    close();
  });
})();
