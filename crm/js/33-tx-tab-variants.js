/* Transactions tab-row variants (tweak: txTabs = 2a | 1a | 1b | 1c).
   The eight .tab[data-tab] nodes stay in the DOM; a variant reorders them,
   relabels them, hides the overflow set, and exposes it in a More/Status menu. */
(function(){
  const SHORT={'All':'All','Active listings':'Active listings','Pending':'Pending','Closing soon':'Closing','Closed':'Closed','Needs attention':'Approvals','Referrals':'Referrals','Drafts':'Drafts'};
  const FULL={'All':'All','Active listings':'Active listings','Pending':'Pending','Closing soon':'Closing soon','Closed':'Closed','Needs attention':'Needs my approval','Referrals':'Referrals','Drafts':'Drafts'};
  const V={
    '2a':{order:['Pending','Closing soon','Active listings','Drafts','Closed','Needs attention','Referrals','All'],show:6,labels:FULL,trigger:'More'},
    '1a':{order:['All','Pending','Closing soon','Active listings','Referrals','Closed','Drafts','Needs attention'],show:4,labels:FULL,trigger:'More'},
    '1b':{order:['All','Pending','Closing soon','Active listings','Referrals','Closed','Drafts','Needs attention'],show:8,labels:SHORT,trigger:null},
    '1c':{order:['All','Active listings','Closed','Pending','Closing soon','Needs attention','Referrals','Drafts'],show:3,labels:SHORT,trigger:'Status'}
  };
  const CARET='<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;opacity:.65;transform:translateY(.5px)"><path d="m6 9 6 6 6-6"/></svg>';
  let cur='2a', pop=null, more=null;

  function seg(){const t=document.querySelector('.tab[data-tab="Closing soon"]');return t&&t.closest('.tabseg')}

  function closePop(){if(pop){pop.remove();pop=null}if(more)more.classList.remove('open')}

  function openPop(hidden,labels){
    closePop();
    const r=more.getBoundingClientRect();
    pop=document.createElement('div');
    pop.style.cssText='position:fixed;z-index:9000;min-width:180px;background:var(--white,#fff);border:1px solid var(--neutral-200,#E5E5E5);border-radius:10px;box-shadow:0 8px 24px rgba(10,10,10,.12);padding:6px;font:13px/1.3 var(--font,"Mona Sans",sans-serif);color:var(--neutral-900,#0A0A0A)';
    pop.style.left=Math.round(r.left)+'px';
    pop.style.top=Math.round(r.bottom+6)+'px';
    hidden.forEach(t=>{
      const it=document.createElement('div');
      it.textContent=labels[t.dataset.tab]||t.dataset.tab;
      it.style.cssText='padding:7px 10px;border-radius:7px;cursor:pointer;white-space:nowrap';
      it.addEventListener('mouseenter',()=>it.style.background='var(--neutral-100,#F5F5F5)');
      it.addEventListener('mouseleave',()=>it.style.background='');
      it.addEventListener('click',()=>{closePop();t.click();paint()});
      pop.appendChild(it);
    });
    document.body.appendChild(pop);
    more.classList.add('open');
  }

  function paint(){
    const s=seg(); if(!s) return;
    const v=V[cur]||V['2a'];
    const map={};
    s.querySelectorAll('.tab[data-tab]').forEach(t=>{map[t.dataset.tab]=t});
    v.order.forEach(k=>{if(map[k]){map[k].textContent=v.labels[k]||k;s.appendChild(map[k])}});
    const vis=v.order.slice(0,v.show).map(k=>map[k]).filter(Boolean);
    const hid=v.order.slice(v.show).map(k=>map[k]).filter(Boolean);
    vis.forEach(t=>t.style.display='');
    hid.forEach(t=>t.style.display='none');

    if(more){more.remove();more=null}
    closePop();
    if(!hid.length||!v.trigger) return;
    const activeHidden=hid.find(t=>t.classList.contains('active'));
    more=document.createElement('div');
    more.className='tab txmore'+(activeHidden?' active':'');
    more.style.cssText='display:inline-flex;align-items:center;gap:4px;cursor:pointer;flex:none;padding-right:9px';
    more.innerHTML='<span>'+(activeHidden?(v.labels[activeHidden.dataset.tab]||v.trigger):v.trigger)+'</span>'+CARET;
    more.addEventListener('click',e=>{e.stopPropagation();pop?closePop():openPop(hid,v.labels)});
    s.appendChild(more);
  }

  document.addEventListener('click',e=>{if(pop&&!e.target.closest('.txmore'))closePop()});
  window.addEventListener('resize',closePop);
  (function(){const s=seg();if(s)s.querySelectorAll('.tab[data-tab]').forEach(t=>t.addEventListener('click',()=>setTimeout(paint,0)))})();

  window.__applyTxTabs=v=>{
    cur=V[v]?v:'2a';
    try{localStorage.setItem('crm-txtabs',cur)}catch(e){}
    paint();
  };
  const saved=(()=>{try{return localStorage.getItem('crm-txtabs')}catch(e){return null}})();
  window.__applyTxTabs(saved||'2a');
})();
