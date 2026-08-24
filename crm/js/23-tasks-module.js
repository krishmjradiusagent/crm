/* ============ Tasks side sheet — ONE SOURCE OF TRUTH ============
   Renders rows via window.mwTaskRow(i) (the exact My Work taskRow function),
   groups by t.prop (property/transaction), reuses DS classes. */
(function(){
  function ready(){return window.mwTaskRow && window.mwTASKS;}
  function whenReady(cb){if(ready())return cb();setTimeout(()=>whenReady(cb),30);}

  const ST={tab:'all', open:{}, sel:new Set(), expandAll:{}, snoozed:new Set(), flt:{g:new Set(),ty:new Set(),src:new Set()}};

  const sheet=document.getElementById('tk-sheet'),scrim=document.getElementById('tk-scrim'),
        btn=document.getElementById('tx-tkbtn'),body=document.getElementById('tk-body'),
        stabs=document.querySelectorAll('#tk-sheet .tab[data-tktab]');

  function fltActive(){return ST.flt.g.size+ST.flt.ty.size+ST.flt.src.size;}

  function filter(){
    const TKS=window.mwTASKS;
    return TKS.map((t,i)=>({t,i})).filter(({t,i})=>{
      if(t.done)return false;
      if(!t.prop)return false; /* sheet is property-grouped only */
      if(ST.prop&&t.prop!==ST.prop)return false; /* opened from a transaction: that property only */
      /* header filter popover */
      if(ST.flt.g.size&&!ST.flt.g.has(t.g))return false;
      if(ST.flt.ty.size&&!ST.flt.ty.has(t.ty))return false;
      if(ST.flt.src.has('mel')&&!t.mel)return false;
      if(ST.tab==='unread')return !t.done;
      if(ST.tab==='snoozed')return ST.snoozed.has(i);
      if(ST.tab==='signing')return t.ty==='sign'||t.ty==='follow';
      return !ST.snoozed.has(i);
    });
  }

  function counts(){
    const TKS=window.mwTASKS;
    const open=TKS.map((t,i)=>({t,i})).filter(({t})=>!t.done&&t.prop);
    return {
      all: open.filter(({i})=>!ST.snoozed.has(i)).length,
      unread: open.length,
      snoozed: [...ST.snoozed].length,
      signing: open.filter(({t})=>t.ty==='sign'||t.ty==='follow').length
    };
  }

  function syncBadges(){
    if(!ready())return;
    const c=counts();
    const map={all:c.all,unread:c.unread,snoozed:c.snoozed,signing:c.signing};
    Object.keys(map).forEach(k=>{const el=document.getElementById('tk-ct-'+k);if(el)el.textContent=map[k];});
    document.getElementById('tk-pcount').textContent=c.all;
    if(btn){btn.dataset.count=c.all;const b=document.getElementById('tx-tkbadge');if(b)b.textContent=c.all;
      btn.setAttribute('aria-label','Tasks, '+c.all+' needing action');}
  }

  /* wrap the mywork row: inject a 'selected' class into .mwtrow when picked */
  function rowHTML({t,i}){
    let markup=window.mwTaskRow(i);
    if(ST.sel.has(i)){
      /* .mwtrow className starts with "mwtrow" and may have space + more (done/melrow) */
      markup=markup.replace('class="mwtrow','class="mwtrow selected');
      markup=markup.replace('aria-checked="false"','aria-checked="true"');
    }
    return markup;
  }

  function propGroupHTML(prop, entries){
    const open=ST.open[prop]!==false;
    const anySel=entries.some(({i})=>ST.sel.has(i));
    const selCount=entries.filter(({i})=>ST.sel.has(i)).length;
    const unread=entries.length;
    const overdue=entries.some(({t})=>t.g==='over');
    const showAll=ST.expandAll[prop];
    const rowLimit=showAll?entries.length:Math.min(entries.length,3);
    const shown=entries.slice(0,rowLimit);
    const hiddenCount=entries.length-rowLimit;
    return `<div class="tkpwrap">
      <div class="tkpgh${overdue?' od':''}" data-prop="${encodeURIComponent(prop)}" role="button" tabindex="0" aria-expanded="${open}">
        <svg class="tkpchev" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        <span class="tkpaddr">${prop}</span>
        <span class="tkpct">${unread} new</span>
      </div>
      <div class="tkpgroup${open?'':' collapsed'}">
        <div class="tkpbulk${anySel?' on':''}" data-prop-bulk="${encodeURIComponent(prop)}">
          <span class="tkpbcb"></span>
          <span class="tkpblbl"><b>${selCount}</b> selected</span>
          <div class="tkpbsp"></div>
          <button class="tkpbbtn" data-bulk="snooze"><svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Snooze</button>
          <button class="tkpbbtn" data-bulk="done"><svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>Mark done</button>
        </div>
        <div class="mwlist">${shown.map(rowHTML).join('')}</div>
        ${hiddenCount>0?`<button class="tkpmore" data-more="${encodeURIComponent(prop)}">+${hiddenCount} more</button>`:''}
      </div>
    </div>`;
  }

  function render(){
    if(!ready())return;
    const list=filter();
    if(!list.length){
      const labels={all:['You’re all caught up','No open tasks right now.'],
        unread:['No unread tasks','Everything has been reviewed.'],
        snoozed:['Nothing snoozed','Tasks you snooze appear here.'],
        signing:['Nothing to sign','Docs awaiting your signature appear here.']};
      const l=fltActive()?['No tasks match these filters','Clear a filter to see more.']:(labels[ST.tab]||labels.all);
      body.innerHTML=`<div class="tkempty">
        <div class="tkeico"><svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg></div>
        <div class="tket">${l[0]}</div>
        <div class="tkes">${l[1]}</div>
      </div>`;
      return;
    }
    const groups={};const order=[];
    list.forEach(e=>{if(!(e.t.prop in groups)){groups[e.t.prop]=[];order.push(e.t.prop)}groups[e.t.prop].push(e);});
    order.forEach((p,idx)=>{if(ST.open[p]===undefined)ST.open[p]=idx===0;});
    body.innerHTML=order.map(p=>propGroupHTML(p,groups[p])).join('');
  }

  body.addEventListener('click',e=>{
    const snz=e.target.closest('.mwta[data-act="snooze"]');
    if(snz){e.stopPropagation();openSnoozeMenu(snz,+snz.closest('[data-ti]').dataset.ti);return;}
    const dn=e.target.closest('.mwta[data-act="done"]');
    if(dn){e.stopPropagation();const i=+dn.closest('[data-ti]').dataset.ti;const t=window.mwTASKS[i];if(t){t.done=true;ST.sel.delete(i);ST.snoozed.delete(i);syncBadges();render();if(window.mwRerender)window.mwRerender();if(window.sonner)sonner('Marked done',t.t);}return;}
    const gh=e.target.closest('.tkpgh[data-prop]');
    if(gh){const p=decodeURIComponent(gh.dataset.prop);ST.open[p]=!ST.open[p];render();return;}
    const cb=e.target.closest('.mwcb');
    if(cb){const row=cb.closest('[data-ti]');if(row){const i=+row.dataset.ti;if(ST.sel.has(i))ST.sel.delete(i);else ST.sel.add(i);render();}e.stopPropagation();return;}
    const bulk=e.target.closest('[data-bulk]');
    if(bulk){
      const wrap=bulk.closest('[data-prop-bulk]');
      const p=decodeURIComponent(wrap.dataset.propBulk);
      const ids=window.mwTASKS.map((t,i)=>i).filter(i=>window.mwTASKS[i].prop===p&&ST.sel.has(i));
      if(bulk.dataset.bulk==='done'){ids.forEach(i=>{window.mwTASKS[i].done=true;ST.sel.delete(i);});
        if(window.sonner)sonner('Marked done',ids.length+' task'+(ids.length===1?'':'s')+' complete');}
      if(bulk.dataset.bulk==='snooze'){
        const wrap=bulk.closest('[data-prop-bulk]');
        const p2=decodeURIComponent(wrap.dataset.propBulk);
        const ids2=window.mwTASKS.map((t,i)=>i).filter(i=>window.mwTASKS[i].prop===p2&&ST.sel.has(i));
        openBulkSnoozeMenu(bulk,ids2);
        return;
      }
      syncBadges();render();if(window.mwRerender)window.mwRerender();return;
    }
    const more=e.target.closest('[data-more]');
    if(more){ST.expandAll[decodeURIComponent(more.dataset.more)]=true;render();return;}
  });

  stabs.forEach(t=>t.addEventListener('click',()=>{
    stabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');ST.tab=t.dataset.tktab;render();
  }));

  const va=document.getElementById('tk-viewall');
  if(va)va.addEventListener('click',()=>{closeSheet();if(window.showPage)showPage('mywork');});
  const flt=document.getElementById('tk-filter');
  const fpop=document.getElementById('tk-fpop');
  const fdot=document.getElementById('tk-fdot');
  function syncFdot(){
    const n=fltActive();
    if(fdot)fdot.hidden=!n;
  }
  function paintFpop(){
    fpop.querySelectorAll('.tkfpopt').forEach(b=>{
      const k=b.parentElement.dataset.fk,v=b.dataset.fv;
      b.classList.toggle('on',ST.flt[k].has(v));
    });
    syncFdot();
  }
  function openFpop(){fpop.hidden=false;flt.setAttribute('aria-expanded','true');paintFpop();}
  function closeFpop(){fpop.hidden=true;flt.setAttribute('aria-expanded','false');}
  if(flt)flt.addEventListener('click',e=>{e.stopPropagation();if(fpop.hidden)openFpop();else closeFpop();});
  if(fpop){
    fpop.addEventListener('click',e=>{
      e.stopPropagation();
      const opt=e.target.closest('.tkfpopt');
      if(opt){const k=opt.parentElement.dataset.fk,v=opt.dataset.fv;const S=ST.flt[k];if(S.has(v))S.delete(v);else S.add(v);paintFpop();render();return;}
      if(e.target.closest('#tk-fpclr')){Object.values(ST.flt).forEach(s=>s.clear());paintFpop();render();return;}
    });
  }
  document.addEventListener('click',e=>{if(!fpop.hidden&&!e.target.closest('#tk-fpop')&&!e.target.closest('#tk-filter'))closeFpop();});

  function resolveProp(q){
    if(!q||!window.mwTASKS)return null;
    const props=[...new Set(window.mwTASKS.map(t=>t.prop).filter(Boolean))];
    if(props.includes(q))return q;
    const num=(String(q).match(/^\d+/)||[])[0];
    return (num&&props.find(p=>p.indexOf(num)===0))||null;
  }
  function openSheet(scope){
    ST.prop=resolveProp(scope);
    sheet.classList.toggle('txscoped',!!ST.prop);
    if(ST.prop&&ST.tab==='signing')ST.tab='all';
    sheet.classList.add('on');scrim.classList.add('on');
    sheet.setAttribute('aria-hidden','false');
    if(btn)btn.setAttribute('aria-expanded','true');
    whenReady(()=>{syncBadges();render();});
    setTimeout(()=>document.getElementById('tk-close').focus(),50);
  }
  function closeSheet(){
    ST.prop=null;
    sheet.classList.remove('txscoped');
    sheet.classList.remove('on');scrim.classList.remove('on');
    sheet.setAttribute('aria-hidden','true');
    if(btn)btn.setAttribute('aria-expanded','false');
    closeFpop();
    if(btn)btn.focus();
  }
  window.openTasksSheet=openSheet;
  window.closeTasksSheet=closeSheet;
  scrim.addEventListener('click',closeSheet);
  document.getElementById('tk-close').addEventListener('click',closeSheet);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!fpop.hidden){closeFpop();return;}if(sheet.classList.contains('on'))closeSheet();}});

  /* -------- New task composer -------- */
  const nBtn=document.getElementById('tk-new'),
        nForm=document.getElementById('tk-newform'),
        nTitle=document.getElementById('tk-nt-title'),
        nProp=document.getElementById('tk-nt-prop'),
        nCl=document.getElementById('tk-nt-cl'),
        nDue=document.getElementById('tk-nt-due'),
        nTy=document.getElementById('tk-nt-ty'),
        nSave=document.getElementById('tk-nt-save'),
        nCancel=document.getElementById('tk-nt-cancel'),
        nProps=document.getElementById('tk-nt-props'),
        nAsg=document.getElementById('tk-nt-asg'),
        nEnv=document.getElementById('tk-nt-env'),
        nEnvRow=document.getElementById('tk-nt-envrow');

  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  function pad(n){return String(n).padStart(2,'0');}
  function todayISO(){const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
  function classifyDue(iso){
    const t=todayISO();
    if(iso<t)return {g:'over',due:iso===prevDayISO(t)?'Yesterday':fmtDue(iso)};
    if(iso===t)return {g:'today',due:'Today'};
    if(iso===nextDayISO(t))return {g:'up',due:'Tomorrow'};
    return {g:'up',due:fmtDue(iso)};
  }
  function fmtDue(iso){const [y,m,d]=iso.split('-').map(Number);const dt=new Date(y,m-1,d);return DAYS[dt.getDay()]+', '+MONTHS[m-1]+' '+d;}
  function prevDayISO(iso){const [y,m,d]=iso.split('-').map(Number);const dt=new Date(y,m-1,d);dt.setDate(dt.getDate()-1);return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());}
  function nextDayISO(iso){const [y,m,d]=iso.split('-').map(Number);const dt=new Date(y,m-1,d);dt.setDate(dt.getDate()+1);return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());}

  function fillProps(){
    if(!ready())return;
    const seen=new Set();window.mwTASKS.forEach(t=>{if(t.prop)seen.add(t.prop);});
    nProps.innerHTML=[...seen].map(p=>`<option value="${p.replace(/"/g,'&quot;')}">`).join('');
  }
  function validate(){
    const ok=nTitle.value.trim()&&nProp.value.trim()&&nDue.value;
    nSave.disabled=!ok;
    return ok;
  }
  function fillEnvelopes(){
    if(!nEnv)return;
    const list=[
      {v:'e-purchase',l:'Purchase agreement'},
      {v:'e-disc',l:'Seller disclosures'},
      {v:'e-agency',l:'Agency disclosure'},
      {v:'e-addA',l:'Addendum A — financing'},
      {v:'e-wire',l:'Wire instructions'},
      {v:'e-comm',l:'Commission disbursement authorization'}
    ];
    nEnv.innerHTML=list.map(e=>`<option value="${e.v}">${e.l}</option>`).join('');
  }
  function syncEnvRow(){
    if(!nEnvRow)return;
    const show=nTy.value==='sign'||nTy.value==='esign';
    nEnvRow.style.display=show?'flex':'none';
  }
  if(nTy)nTy.addEventListener('change',syncEnvRow);
  function resetForm(){
    nTitle.value='';nProp.value='';nCl.value='';nTy.value='email';
    if(nAsg)nAsg.value='me';
    if(nEnv)[...nEnv.options].forEach(o=>o.selected=false);
    nDue.value=todayISO();nSave.disabled=true;syncEnvRow();
  }
  function openForm(){
    fillProps();fillEnvelopes();resetForm();
    nForm.classList.add('on');nBtn.setAttribute('aria-expanded','true');
    setTimeout(()=>nTitle.focus(),40);
  }
  function closeForm(){
    nForm.classList.remove('on');nBtn.setAttribute('aria-expanded','false');
  }
  if(nBtn)nBtn.addEventListener('click',()=>{nForm.classList.contains('on')?closeForm():openForm();});
  if(nCancel)nCancel.addEventListener('click',closeForm);
  [nTitle,nProp,nDue].forEach(el=>el&&el.addEventListener('input',validate));
  if(nForm)nForm.addEventListener('submit',e=>{
    e.preventDefault();
    if(!validate()||!ready())return;
    const iso=nDue.value,{g,due}=classifyDue(iso);
    const envs=nEnv?[...nEnv.selectedOptions].map(o=>o.textContent):[];
    const asg=nAsg?nAsg.options[nAsg.selectedIndex].textContent:'';
    const t={t:nTitle.value.trim(),cl:nCl.value.trim()||'—',g,due,dt:iso,ty:nTy.value,prop:nProp.value.trim(),done:false,asg,envs};
    window.mwTASKS.push(t);
    const p=t.prop;ST.open[p]=true;ST.tab='all';
    stabs.forEach(x=>x.classList.toggle('active',x.dataset.tktab==='all'));
    closeForm();syncBadges();render();
    if(window.mwRerender)window.mwRerender();
    if(window.sonner)sonner('Task added',t.t);
  });

  /* -------- Snooze menu -------- */
  const snzMenu=document.getElementById('tk-snz');
  const snzDate=document.getElementById('tk-snz-date');
  const snzTime=document.getElementById('tk-snz-time');
  let snzTargets=null; /* array of task indices to snooze */
  const MENU_W=220,MENU_H=260;

  function isoFromDate(dt){return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());}
  function isoOffset(days){const d=new Date();d.setDate(d.getDate()+days);return isoFromDate(d);}
  function isoWeekend(){const d=new Date();const dow=d.getDay();/* target Saturday */const add=dow===6?7:(6-dow);d.setDate(d.getDate()+add);return isoFromDate(d);}
  function isoNextMonday(){const d=new Date();const dow=d.getDay();const add=dow===1?7:((1-dow+7)%7||7);d.setDate(d.getDate()+add);return isoFromDate(d);}

  function snzLabel(iso){
    const t=todayISO();
    if(iso===nextDayISO(t))return 'Tomorrow';
    return fmtDue(iso);
  }

  function paintSnzSubs(){
    const subs={'1':snzLabel(isoOffset(1)),'2':snzLabel(isoOffset(2)),'weekend':fmtDue(isoWeekend()),'nextweek':fmtDue(isoNextMonday())};
    snzMenu.querySelectorAll('[data-snzsub]').forEach(el=>{el.textContent=subs[el.dataset.snzsub]||'';});
  }

  function openSnoozeMenu(anchor,ti){
    snzTargets=[ti];
    placeSnzMenu(anchor);
    paintSnzSubs();
    snzDate.value=isoOffset(3);
    snzMenu.classList.add('on');
  }
  function openBulkSnoozeMenu(anchor,ids){
    snzTargets=ids.slice();
    placeSnzMenu(anchor);
    paintSnzSubs();
    snzDate.value=isoOffset(3);
    snzMenu.classList.add('on');
  }
  function placeSnzMenu(anchor){
    const r=anchor.getBoundingClientRect();
    let left=r.right-MENU_W;
    let top=r.bottom+6;
    if(left<8)left=8;
    if(left+MENU_W>window.innerWidth-8)left=window.innerWidth-MENU_W-8;
    if(top+MENU_H>window.innerHeight-8)top=r.top-MENU_H-6;
    snzMenu.style.left=left+'px';snzMenu.style.top=top+'px';
  }
  function closeSnoozeMenu(){snzMenu.classList.remove('on');snzTargets=null;}

  function applySnooze(iso){
    if(!snzTargets||!snzTargets.length||!ready())return;
    const {g,due}=classifyDue(iso);
    const time=snzTime&&snzTime.value?snzTime.value:'';
    const tLabel=time?', '+fmtTime12(time):'';
    snzTargets.forEach(i=>{const t=window.mwTASKS[i];if(!t)return;t.dt=iso;t.due=due+tLabel;t.dueTime=time;t.g=g;ST.snoozed.add(i);ST.sel.delete(i);});
    const n=snzTargets.length;
    closeSnoozeMenu();syncBadges();render();
    if(window.mwRerender)window.mwRerender();
    if(window.sonner)sonner('Snoozed to '+due.toLowerCase()+tLabel,n+' task'+(n===1?'':'s'));
  }
  function fmtTime12(hm){const [h,m]=hm.split(':').map(Number);const ap=h>=12?'PM':'AM';const h12=((h+11)%12)+1;return h12+':'+String(m).padStart(2,'0')+' '+ap;}

  snzMenu.addEventListener('click',e=>{
    e.stopPropagation();
    const tbtn=e.target.closest('[data-snztime]');
    if(tbtn){snzMenu.querySelectorAll('[data-snztime]').forEach(x=>x.classList.remove('on'));tbtn.classList.add('on');snzTime.value=tbtn.dataset.snztime;return;}
    const b=e.target.closest('[data-snz]');
    if(!b)return;
    const k=b.dataset.snz;
    if(k==='1')applySnooze(isoOffset(1));
    else if(k==='2')applySnooze(isoOffset(2));
    else if(k==='weekend')applySnooze(isoWeekend());
    else if(k==='nextweek')applySnooze(isoNextMonday());
    else if(k==='pick'){if(snzDate.value)applySnooze(snzDate.value);}
  });
  if(snzTime){snzTime.addEventListener('input',()=>{snzMenu.querySelectorAll('[data-snztime]').forEach(x=>x.classList.toggle('on',x.dataset.snztime===snzTime.value))});}
  document.addEventListener('click',e=>{if(snzMenu.classList.contains('on')&&!e.target.closest('#tk-snz')&&!e.target.closest('.mwta[data-act="snooze"]')&&!e.target.closest('[data-bulk="snooze"]'))closeSnoozeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&snzMenu.classList.contains('on'))closeSnoozeMenu();});
  window.addEventListener('resize',closeSnoozeMenu);

  window.tkOpenSnoozeMenu=(anchor,ids)=>openBulkSnoozeMenu(anchor,ids);

  whenReady(()=>{syncBadges();fillProps();});
})();
