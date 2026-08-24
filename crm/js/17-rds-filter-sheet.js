/* ================= Shared filter side sheet =================
   ONE implementation of the Radius filter panel, so every page's filters look and
   behave the same: right-edge sheet + scrim, global search, collapsible sections
   (stacked) or a section rail with a left flyout, staged chips above the table,
   destructive Clear, and Apply carrying the live result count.
   Tasks and Appointments keep their own inline popovers by product decision.

   RDSFilterSheet({ns, title, sections, base, pass, onApply, chips})
     sections: [{key, label, mode:'multi'|'single'|'dates', options(), fields()}]
     base()  -> array of row ids the page's tab/scope already allows
     pass(id, state) -> boolean
   Layout follows the same `filterLayout` tweak as Transactions. */
window.RDSFilterSheet=function(cfg){
  const NS=cfg.ns;
  const $=id=>document.getElementById(id);
  const esc=s=>String(s).replace(/"/g,'&quot;');
  const CK='<span class="bx"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg></span>';
  const RD='<span class="rd"></span>';
  const DPRE=[['l7','Last 7 days'],['l30','Last 30 days'],['l90','Last 90 days'],['l365','Last year']];
  const DLBL=Object.assign({any:'Any time',custom:'Custom range'},...DPRE.map(([k,l])=>({[k]:l})));

  const blank=()=>{
    const s={};
    cfg.sections.forEach(sec=>{
      if(sec.mode==='multi')s[sec.key]=[];
      else if(sec.mode==='single')s[sec.key]=sec.options()[0].v;
      else s[sec.key]={field:(sec.fields()[0]||{v:''}).v,pre:'any',ds:'',de:''};
    });
    return s;
  };
  const clone=o=>JSON.parse(JSON.stringify(o));
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  let A=blank(),D=blank(),openSec=new Set(cfg.sections.slice(0,3).map(s=>s.key)),sel=null,q='';

  /* ---- shell ---- */
  const scrim=document.createElement('div');scrim.className='fscrim';
  const pane=document.createElement('div');pane.className='fpane';pane.hidden=true;pane.setAttribute('role','group');
  const sheet=document.createElement('aside');
  sheet.className='fsheet';sheet.id=NS+'-fsheet';sheet.setAttribute('role','dialog');
  sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-hidden','true');
  sheet.innerHTML='<div class="fsh"><span class="ptitle">'+esc(cfg.title||'Filters')+'</span>'
    +'<span class="fspill" id="'+NS+'-fspill" hidden>0</span><span class="sp"></span>'
    +'<button type="button" class="fsx" aria-label="Close filters"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>'
    +'<div class="fsq"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>'
    +'<input type="text" placeholder="Search filters" autocomplete="off" aria-label="Search filters">'
    +'<button type="button" class="fsqx" aria-label="Clear search" hidden><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>'
    +'<div class="fsbody"></div><div class="fsempty" hidden>No filters match that search.</div>'
    +'<div class="fsfoot"><button type="button" class="rst">Clear all</button><span class="sp"></span>'
    +'<button type="button" class="fsapply">Apply<span class="rc2"></span></button></div>';
  document.body.append(scrim,pane,sheet);
  const body=sheet.querySelector('.fsbody'),qIn=sheet.querySelector('.fsq input'),qX=sheet.querySelector('.fsqx');
  const empty=sheet.querySelector('.fsempty'),foot=sheet.querySelector('.fsfoot');
  const applyBtn=foot.querySelector('.fsapply'),rcEl=applyBtn.querySelector('.rc2'),clrBtn=foot.querySelector('.rst');
  const pill=sheet.querySelector('.fspill');

  const secOf=k=>cfg.sections.find(s=>s.key===k);
  const stacked=()=>window.__filterLayout!=='pane';

  /* ---- section state helpers ---- */
  function isSet(k){
    const sec=secOf(k),v=D[k];
    if(sec.mode==='multi')return !!v.length;
    if(sec.mode==='single')return v!==sec.options()[0].v;
    return v.pre!=='any';
  }
  function summary(k){
    const sec=secOf(k),v=D[k];
    if(sec.mode==='multi'){
      if(!v.length)return sec.anyLabel||'Any';
      if(v.length===1){const o=sec.options().find(o=>o.v===v[0]);return o?o.label:v[0]}
      return v.length+' selected';
    }
    if(sec.mode==='single'){const o=sec.options().find(o=>o.v===v);return o?o.label:v}
    if(v.pre==='custom')return (v.ds||'any')+' \u2192 '+(v.de||'any');
    return DLBL[v.pre]||'Any time';
  }
  function labels(k){
    const sec=secOf(k);
    if(sec.mode==='dates')return sec.fields().map(f=>f.label).concat(Object.values(DLBL));
    return sec.options().map(o=>o.label);
  }

  /* ---- option markup ---- */
  function optsHTML(sec){
    const base=cfg.base(),v=D[sec.key];
    if(sec.mode==='dates'){
      const fl=sec.fields();
      const seg=fl.length>1?'<div class="fseg">'+fl.map(f=>'<button type="button" data-segk="'+sec.key+'" data-seg="'+esc(f.v)+'" class="'+(v.field===f.v?'on':'')+'">'+f.label+'</button>').join('')+'</div>':'';
      const rd=(pv,lb,n)=>'<div class="fo'+(v.pre===pv?' on':'')+'" data-k="'+sec.key+'" data-p="'+pv+'">'+RD+lb+(n==null?'':'<span class="ct">'+n+'</span>')+'</div>';
      const cnt=pv=>{const t=clone(blank());t[sec.key]={field:v.field,pre:pv,ds:'',de:''};return base.filter(i=>cfg.pass(i,t)).length};
      return seg+'<div class="fopts">'+rd('any','Any time',null)+DPRE.map(([pv,lb])=>rd(pv,lb,cnt(pv))).join('')+rd('custom','Custom range',null)+'</div>'
        +'<div class="frow"><input type="date" class="fdate" data-k="'+sec.key+'" data-df="ds" value="'+v.ds+'" aria-label="Start date"><span class="arw">&rarr;</span>'
        +'<input type="date" class="fdate" data-k="'+sec.key+'" data-df="de" value="'+v.de+'" aria-label="End date"></div>';
    }
    const list=sec.options(),multi=sec.mode==='multi';
    const rows=list.map(o=>{
      const on=multi?v.includes(o.v):v===o.v;
      const n=o.count==null?'':'<span class="ct">'+o.count+'</span>';
      const dot=o.dot?'<span class="dot" style="background:'+o.dot+'"></span>':'';
      return '<div class="fo'+(on?' on':'')+'" data-k="'+sec.key+'" data-v="'+esc(o.v)+'">'+(multi?CK:RD)+dot+o.label+n+'</div>';
    }).join('');
    return '<div class="fopts">'+rows+'</div>';
  }

  function buildStacked(){
    return cfg.sections.map(sec=>{
      const on=openSec.has(sec.key);
      return '<div class="fgrp'+(on?'':' collapsed')+'" data-secblk="'+sec.key+'" data-title="'+esc(sec.label)+'">'
        +'<div class="fgh" role="button" tabindex="0" aria-expanded="'+on+'"><svg class="fgcar" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>'
        +'<span class="l">'+sec.label+'</span><span class="n">'+summary(sec.key)+'</span>'
        +(isSet(sec.key)?'<button type="button" class="pclr" data-pclr="'+sec.key+'">Clear</button>':'')
        +'</div><div class="fgbody">'+optsHTML(sec)+'</div></div>';
    }).join('');
  }
  function buildRail(){
    return cfg.sections.map(sec=>'<div class="fsrow'+(sel===sec.key?' on':'')+(isSet(sec.key)?' set':'')+'" data-sec="'+sec.key+'" role="button" tabindex="0" aria-expanded="'+(sel===sec.key)+'">'
      +'<span class="l">'+sec.label+'</span><span class="v">'+summary(sec.key)+'</span>'
      +'<svg class="cv" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></div>').join('');
  }
  function buildPane(k){
    const sec=secOf(k);
    return '<div class="ph"><span class="l">'+sec.label+'</span>'
      +(isSet(k)?'<button type="button" class="pclr" data-pclr="'+k+'">Clear</button>':'')+'</div>'+optsHTML(sec);
  }
  function placePane(){
    if(!sel)return;
    const row=body.querySelector('.fsrow[data-sec="'+sel+'"]');if(!row)return;
    const r=row.getBoundingClientRect();
    pane.style.top=Math.max(12,Math.min(r.top-10,window.innerHeight-pane.offsetHeight-12))+'px';
  }
  function applyQ(){
    const hit=k=>!q||secOf(k).label.toLowerCase().includes(q)||labels(k).some(l=>String(l).toLowerCase().includes(q));
    if(stacked())body.querySelectorAll('[data-secblk]').forEach(b=>{
      const on=hit(b.dataset.secblk);b.hidden=!on;
      if(q&&on)b.classList.remove('collapsed');
      else if(!q)b.classList.toggle('collapsed',!openSec.has(b.dataset.secblk));
      b.querySelector('.fgh').setAttribute('aria-expanded',!b.classList.contains('collapsed'));
    });
    else body.querySelectorAll('.fsrow').forEach(r=>{r.hidden=!hit(r.dataset.sec)});
    empty.hidden=!(q&&[...body.children].every(c=>c.hidden));
  }
  function count(){
    const n=cfg.base().filter(i=>cfg.pass(i,D)).length;
    rcEl.textContent=' \u2014 '+n+' result'+(n===1?'':'s');
    const k=chipList(D).length;
    pill.hidden=!k;pill.textContent=k;clrBtn.disabled=!k;
  }
  function render(){
    sheet.dataset.mode=stacked()?'stacked':'pane';
    if(stacked()){sel=null;pane.hidden=true;body.innerHTML=buildStacked()}
    else{body.innerHTML=buildRail();if(sel){pane.innerHTML=buildPane(sel);placePane()}}
    applyQ();count();renderChips();
  }

  /* ---- chips ---- */
  function chipList(S){
    const out=[];
    cfg.sections.forEach(sec=>{
      const v=S[sec.key];
      if(sec.mode==='multi')v.forEach(x=>{const o=sec.options().find(o=>o.v===x);out.push([sec.chipLabel||sec.label,o?o.label:x,sec.key,x])});
      else if(sec.mode==='single'){if(v!==sec.options()[0].v){const o=sec.options().find(o=>o.v===v);out.push([sec.chipLabel||sec.label,o?o.label:v,sec.key,''])}}
      else if(v.pre!=='any'){
        const f=sec.fields().find(f=>f.v===v.field);
        out.push([f?f.label:sec.label,v.pre==='custom'?((v.ds||'any')+' \u2192 '+(v.de||'any')):DLBL[v.pre],sec.key,'']);
      }
    });
    return out;
  }
  function chipsHTML(){
    const key=c=>c[2]+'|'+c[3]+'|'+c[1];
    const app=chipList(A),drf=chipList(D);
    const dset=new Set(drf.map(key)),aset=new Set(app.map(key));
    let h=app.map(c=>{
      const gone=!dset.has(key(c));
      return '<span class="chip'+(gone?' pend':'')+'"><b>'+c[0]+'</b> '+c[1]
        +(gone?'':' <span class="cx" data-fx="'+c[2]+'|'+esc(c[3])+'" role="button" tabindex="0" aria-label="Remove '+esc(c[0])+' filter">\u2715</span>')+'</span>';
    }).join('');
    h+=drf.filter(c=>!aset.has(key(c))).map(c=>'<span class="chip pend"><b>'+c[0]+'</b> '+c[1]+'</span>').join('');
    if(!same(A,D))h+='<span class="fpendbar"><button type="button" class="go" data-fpend="apply">Apply changes</button><button type="button" class="un" data-fpend="undo">Undo</button></span>';
    return h;
  }
  function renderChips(){
    if(cfg.chipsRender)return cfg.chipsRender();
    const host=cfg.chips&&$(cfg.chips);if(!host)return;
    const h=chipsHTML();
    host.innerHTML=h;
    host.classList.toggle('on',!!h);
  }
  function clearSec(k){
    const sec=secOf(k);
    if(sec.mode==='multi')D[k]=[];
    else if(sec.mode==='single')D[k]=sec.options()[0].v;
    else D[k]={field:D[k].field,pre:'any',ds:'',de:''};
  }
  function stageOff(k,v){
    const sec=secOf(k);
    if(sec.mode==='multi')D[k]=D[k].filter(x=>x!==v);else clearSec(k);
  }

  /* ---- open / close / commit ---- */
  function commit(){A=clone(D);if(cfg.onApply)cfg.onApply(A);renderChips()}
  function open(){
    D=clone(A);sel=null;pane.hidden=true;q='';qIn.value='';qX.hidden=true;
    render();scrim.classList.add('on');sheet.classList.add('on');sheet.setAttribute('aria-hidden','false');
  }
  function close(){scrim.classList.remove('on');sheet.classList.remove('on');sheet.setAttribute('aria-hidden','true');sel=null;pane.hidden=true}
  const isOpen=()=>sheet.classList.contains('on');

  scrim.addEventListener('click',close);
  sheet.querySelector('.fsx').addEventListener('click',close);
  clrBtn.addEventListener('click',()=>{D=blank();render()});
  applyBtn.addEventListener('click',()=>{commit();close()});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!isOpen())return;sel?(sel=null,pane.hidden=true,render()):close()});
  window.addEventListener('resize',placePane);
  qIn.addEventListener('input',()=>{q=qIn.value.trim().toLowerCase();qX.hidden=!q;applyQ()});
  qX.addEventListener('click',()=>{qIn.value='';q='';qX.hidden=true;applyQ();qIn.focus()});

  function onClick(e){
    const pc=e.target.closest('[data-pclr]');
    if(pc){clearSec(pc.dataset.pclr);render();return}
    const gh=e.target.closest('.fgh');
    if(gh&&gh.closest('[data-secblk]')){
      const k=gh.closest('[data-secblk]').dataset.secblk;
      openSec.has(k)?openSec.delete(k):openSec.add(k);render();return;
    }
    const row=e.target.closest('.fsrow');
    if(row){sel=sel===row.dataset.sec?null:row.dataset.sec;pane.hidden=!sel;if(sel){pane.innerHTML=buildPane(sel)}render();return}
    const sg=e.target.closest('[data-segk]');
    if(sg){D[sg.dataset.segk]={field:sg.dataset.seg,pre:'any',ds:'',de:''};render();return}
    const o=e.target.closest('.fo');
    if(!o||o.classList.contains('dis'))return;
    const k=o.dataset.k,sec=secOf(k);
    if(sec.mode==='dates')D[k]=Object.assign({},D[k],{pre:o.dataset.p});
    else if(sec.mode==='multi'){const j=D[k].indexOf(o.dataset.v);j<0?D[k].push(o.dataset.v):D[k].splice(j,1)}
    else D[k]=o.dataset.v;
    render();
  }
  function onInput(e){
    const d=e.target.closest('[data-df]');if(!d)return;
    const k=d.dataset.k;
    D[k]=Object.assign({},D[k],{[d.dataset.df]:d.value,pre:'custom'});
    (stacked()?body:pane).querySelectorAll('[data-k="'+k+'"][data-p]').forEach(x=>x.classList.toggle('on',x.dataset.p==='custom'));
    if(stacked())body.querySelectorAll('[data-secblk="'+k+'"] .fgh .n').forEach(n=>n.textContent=summary(k));
    else body.querySelectorAll('.fsrow[data-sec="'+k+'"] .v').forEach(n=>n.textContent=summary(k));
    count();renderChips();
  }
  body.addEventListener('click',onClick);pane.addEventListener('click',onClick);
  body.addEventListener('input',onInput);pane.addEventListener('input',onInput);
  body.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    if(e.target.closest('.fgh')||e.target.closest('.fsrow')){e.preventDefault();onClick(e)}
  });
  if(cfg.chips)document.addEventListener('click',e=>{
    if(!e.target.closest('#'+cfg.chips))return;
    const pb=e.target.closest('[data-fpend]');
    if(pb){pb.dataset.fpend==='apply'?commit():(D=clone(A));if(isOpen())render();else renderChips();return}
    const cx=e.target.closest('[data-fx]');
    if(!cx)return;
    const [k,v]=cx.dataset.fx.split('|');
    stageOff(k,v);isOpen()?render():renderChips();
  });

  const api={open,close,toggle:()=>isOpen()?close():open(),state:()=>A,pass:i=>cfg.pass(i,A),
    active:()=>chipList(A).length,chipsHTML,rerender:()=>{if(isOpen())render()},refreshChips:renderChips,
    prune:fn=>{[A,D].forEach(S=>cfg.sections.forEach(sec=>{if(sec.mode==='multi')S[sec.key]=S[sec.key].filter(v=>fn(sec.key,v))}));renderChips();if(isOpen())render()}};
  return api;
};
