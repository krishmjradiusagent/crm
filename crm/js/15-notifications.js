/* ================= notifications: header bell + peek panel =================
   Tweaks (flip on <body>): data-nchips on|off · data-nflash on|off · data-nstagger on|off
   NOTIF.live = demo a new notification arriving 5s after the panel first opens. */
const NOTIF={version:'v2',needsLabel:'Needs attention',zoneHeader:false,chips:'on',flash:'on',stagger:'on',live:false};
(function(){
  const B=document.body;
  B.dataset.nchips=NOTIF.chips;B.dataset.nflash=NOTIF.flash;B.dataset.nstagger=NOTIF.stagger;
  B.dataset.nver=NOTIF.version;
  const V2=NOTIF.version==='v2';

  const bell=document.getElementById('tx-bell'),tip=document.getElementById('tx-belltip'),
        panel=document.getElementById('tx-npanel'),body=document.getElementById('tx-npbody'),
        empty=body.querySelector('.nempty'),chips=document.getElementById('tx-nchips'),
        twrap=document.getElementById('tx-twrap');
  const sideDot=document.querySelector('.sidebar .nav .ndot');

  const KIND={
    doc:{sys:1,ic:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="m9 15 2 2 4-4"/>'},
    commission:{sys:1,ic:'<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>'},
    missing:{sys:1,warn:1,ic:'<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>'},
    stage:{sys:1,ic:'<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>'},
    coe:{sys:1,ic:'<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>'},
    compliance:{sys:1,ic:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/>'},
    comment:{sys:0}
  };

  let items=[
    {i:11,k:'comment',t:'12m ago',g:'Today',u:1,l2:'Left you a note on the counteroffer'},
    {i:7,k:'missing',t:'2h ago',g:'Today',u:1,l2:'Acceptance date and purchase price missing',dot:'#d9a514'},
    {i:1,k:'stage',t:'5h ago',g:'Today',u:1,l2:'Pending \u2192 In escrow',dot:'#5a5ff2'},
    {i:12,k:'doc',t:'1d ago',g:'Yesterday',u:0,l2:'Disclosure packet signed'},
    {i:5,k:'commission',t:'1d ago',g:'Yesterday',u:0,l2:'Commission confirmed'},
    {i:13,k:'coe',t:'3d ago',g:'Earlier',u:0,l2:'Close date moved to Aug 21'},
    {i:16,k:'compliance',t:'5d ago',g:'Earlier',u:0,l2:'Listing agreement flagged'},
    {i:2,k:'doc',t:'5d ago',g:'Earlier',u:0,l2:'Buyer disclosures returned'},
    {i:7,k:'commission',t:'6d ago',g:'Earlier',u:0,l2:'Commission split updated'},
    {i:3,k:'stage',t:'6d ago',g:'Earlier',u:0,l2:'Active \u2192 Pending'},
    {i:9,k:'comment',t:'1w ago',g:'Earlier',u:0,l2:'Asked about the repair credit'},
    {i:4,k:'coe',t:'1w ago',g:'Earlier',u:0,l2:'Close date moved to Aug 14'},
    {i:14,k:'missing',t:'1w ago',g:'Earlier',u:0,l2:'Needs info \u2014 fee payer',dot:'#d9a514'},
    {i:6,k:'doc',t:'2w ago',g:'Earlier',u:0,l2:'Purchase agreement executed'},
    {i:10,k:'stage',t:'2w ago',g:'Earlier',u:0,l2:'New \u2192 Active'}
  ];
  /* v2 model — grouped by transaction. i = index of the matching table row. */
  let groups=[
    {i:11,st:'In escrow',dot:'#5a5ff2',zone:'needs',ev:[
      {x:'Michael left a note on the counteroffer',t:'12m',u:1,act:{v:'Reply',k:'reply'}},
      {x:'Buyer disclosure needs your signature',t:'2h',u:1,act:{v:'Sign',k:'deep'}},
      {x:'Escrow asked you to confirm the wire instructions',t:'6h',u:1,act:{v:'Review',k:'deep'}},
      {x:'Michael asked to move the inspection to Aug 12',t:'1d',u:0,act:{v:'Reply',k:'reply'}},
      {x:'Addendum 2 needs your signature',t:'1d',u:0,act:{v:'Sign',k:'deep'}}
    ]},
    {i:7,st:'Pending',dot:'#5a5ff2',zone:'needs',ev:[
      {x:'Acceptance date and purchase price missing',t:'2h',u:1,act:{v:'Add details',k:'details'}}
    ]},
    {i:16,st:'Needs review',dot:'#d9a514',zone:'needs',ev:[
      {x:'Listing agreement flagged by compliance',t:'4h',u:1,act:{v:'Review',k:'deep'}},
      {x:'Seller asked about the repair credit',t:'1d',u:0,act:{v:'Reply',k:'reply'}}
    ]},
    {i:5,st:'In escrow',dot:'#5a5ff2',zone:'needs',ev:[
      {x:'Commission split needs your confirmation',t:'6h',u:1,act:{v:'Review',k:'deep'}}
    ]},
    {i:12,st:'In escrow',dot:'#5a5ff2',ev:[
      {x:'Escrow posted the wire instructions',t:'6h',u:0},
      {x:'Title report returned clean',t:'1d',u:0},
      {x:'Disclosure packet signed by all parties',t:'1d',u:0},
      {x:'Appraisal ordered by the lender',t:'2d',u:0}
    ]},
    {i:13,st:'Pending',dot:'#8b8b8b',ev:[
      {x:'Close date moved to Aug 21',t:'3d',u:0}
    ]},
    {i:1,st:'In escrow',dot:'#5a5ff2',ev:[
      {x:'Moved to In escrow',t:'5h',u:0},
      {x:'Purchase agreement executed',t:'1w',u:0}
    ]}
  ];
  /* group sort: unresolved-action groups first (most recent action), then newest event.
     Computed on open only — never live, so nothing jumps while reading. */
  const AGE={m:1,h:60,d:1440,w:10080};
  const mins=t=>{const m=/^(\d+)\s*([mhdw])/.exec(t);return m?+m[1]*AGE[m[2]]:0};
  function sortGroups(){
    groups=groups.map((g,n)=>({g,n})).sort((a,b)=>{
      const aa=a.g.ev.filter(e=>e.act),ba=b.g.ev.filter(e=>e.act);
      if(!!aa.length!==!!ba.length)return aa.length?-1:1;
      const at=Math.min(...(aa.length?aa:a.g.ev).map(e=>mins(e.t)));
      const bt=Math.min(...(ba.length?ba:b.g.ev).map(e=>mins(e.t)));
      return at-bt||a.n-b.n;
    }).map(o=>o.g);
  }
  let filter='all',firstOpen=true;
  let actOpen=localStorage.getItem('tx-nact')==='1';
  const CAP=3;

  const trOf=i=>document.querySelectorAll('#tx-tb tr')[i]||null;
  const rowTitle=i=>{const tr=trOf(i);const n=tr&&tr.querySelector('.name');return n?n.textContent:'Transaction';};
  function avatar(i){
    const tr=trOf(i);const avs=tr?tr.querySelectorAll('.agcell .agav'):[];
    if(avs.length){const c=avs[avs.length-1].cloneNode(true);c.classList.add('nav20');return c.outerHTML;}
    return '<span class="nav20 sys"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg></span>';
  }
  const unread=()=>V2
    ?groups.reduce((s,g)=>s+g.ev.filter(e=>e.u).length,0)
    :items.filter(n=>n.u).length;
  const needsCount=()=>groups.filter(g=>g.zone==='needs').reduce((s,g)=>s+g.ev.filter(e=>e.act).length,0);
  const actCount=()=>groups.filter(g=>g.zone==='activity').reduce((s,g)=>s+g.ev.length,0);
  const ARROW='<svg viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg>';
  const CHECK='<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';

  function chipsHTML(){
    const c=[['all','All'],['unread','Unread'],['tasks','Tasks'],['documents','Documents'],['messages','Messages'],['transactions','Transactions']];
    return c.map(([k,l])=>`<div class="tab${filter===k?' active':''}" data-nfilter="${k}">${l}</div>`).join('');
  }
  /* map notification kinds to the stakeholder filter chips */
  const KIND_TO_CAT={comment:'messages',missing:'tasks',stage:'transactions',doc:'documents',commission:'transactions',coe:'transactions',compliance:'documents'};
  function actKind(e){
    if(!e.act)return null;
    const v=(e.x||'').toLowerCase();
    if(e.act.k==='reply')return 'messages';
    if(e.act.k==='deep'&&(v.includes('sign')||v.includes('disclos')||v.includes('addendum')||v.includes('agreement')||v.includes('document')||v.includes('doc')))return 'documents';
    if(e.act.k==='details')return 'tasks';
    return 'transactions';
  }
  function nsearch(){return (document.getElementById('tx-npq')||{}).value||''}
  function evPass(e){
    const q=nsearch().trim().toLowerCase();
    if(q&&!(e.x||'').toLowerCase().includes(q))return false;
    if(filter==='all')return true;
    if(filter==='unread')return !!e.u;
    return actKind(e)===filter;
  }

  function evHTML(g,gi,e,ei){
    const label=e.act?`${e.act.v} — ${e.x.toLowerCase()} on ${rowTitle(g.i)}`:'';
    return `<div class="n2ev${e.u?' unread':''}" data-g="${gi}" data-e="${ei}">
      <div class="n2evrow"><span class="n2txt">${e.x}</span>${e.u?'<span class="n2udot" aria-label="Unread"></span>':''}<span class="n2t">${e.t}</span></div>
      ${e.act?`<div class="n2act"><button class="n2btn" data-act="${e.act.k}" aria-label="${label}">${e.act.v}${e.act.k==='deep'?ARROW:''}</button>
        ${e.act.k==='reply'?`<div class="n2reply" data-open="false"><div><div class="n2rin"><input type="text" placeholder="Write a reply" aria-label="${label}"><button class="n2btn" data-act="send">Send</button><button class="n2btn" data-act="cancel">Cancel</button></div></div></div>`:''}
        ${e.act.k==='inline'?`<div class="n2reply" data-open="false"><div><div class="n2rin"><input type="date" aria-label="Close date for ${rowTitle(g.i)}"><button class="n2btn" data-act="send">Save</button><button class="n2btn" data-act="cancel">Cancel</button></div></div></div>`:''}
      </div>`:''}
      <button class="nrdel" data-ndel="1" title="Delete notification" aria-label="Delete notification"><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14M10 11v6M14 11v6"/></svg></button>
    </div>`;
  }

  function groupHTML(g,gi){
    const list=g.ev.filter(evPass);
    if(!list.length)return '';
    /* actionable events win the visible slots, then render back in chronological order */
    const pick=list.map((e,n)=>({e,n})).sort((a,b)=>(!!b.e.act-!!a.e.act)||a.n-b.n).slice(0,CAP).map(o=>o.n);
    const shown=g.exp?list:list.filter((e,n)=>pick.includes(n)),rest=list.length-shown.length;
    const nUnread=list.filter(e=>e.u).length;
    if(g.open===undefined)g.open=nUnread>0;
    return `<div class="n2grp" data-open="${g.open?'true':'false'}" data-gi="${gi}">
      <div class="n2gh" role="button" tabindex="0" aria-expanded="${g.open?'true':'false'}" data-gtoggle="${gi}">
        <svg class="n2gchev" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>
        <span class="n2addr" data-goto="${g.i}" tabindex="0" role="link">${rowTitle(g.i)}</span>
        <span class="n2st">${g.st}</span>
        ${nUnread?`<span class="n2new">${nUnread} new</span>`:''}
      </div>
      <div class="n2gwrap"><div class="n2ginner">
        ${shown.map(e=>evHTML(g,gi,e,g.ev.indexOf(e))).join('')}
        ${rest>0?`<button class="n2more" data-more="${gi}">+${rest} more</button>`:''}
      </div></div>
    </div>`;
  }

  function render2(){
    body.querySelectorAll('.n2zone,.ngroup,.nrow').forEach(el=>el.remove());
    chips.innerHTML=chipsHTML();
    const gs=groups.map((g,i)=>groupHTML(g,i)).filter(Boolean).join('');
    const shownAny=!!gs;
    const html=shownAny?`<section class="n2zone">${gs}</section>`:'';
    if(!shownAny){
      empty.querySelector('.e1').textContent=filter==='all'?"You're all caught up":'Nothing needs attention right now';
      empty.querySelector('.e2').innerHTML=filter==='all'?'New activity on your transactions shows up here.':'<a data-nfilter-link="all" style="cursor:pointer;text-decoration:underline">See all notifications</a>';
    }
    empty.insertAdjacentHTML('beforebegin',html);
    body.classList.toggle('isempty',!shownAny);
    syncBadges();
  }

  function render(){
    body.querySelectorAll('.ngroup,.nrow').forEach(el=>el.remove());
    const list=items.filter(n=>filter==='all'||n.u);
    let html='',seen='';
    list.forEach((n,idx)=>{
      if(n.g!==seen){seen=n.g;html+=`<div class="ngroup">${n.g}</div>`}
      const kd=KIND[n.k]||{sys:1,ic:''};
      const who=kd.sys?`<span class="nav20 sys${kd.warn?' warn':''}"><svg viewBox="0 0 24 24">${kd.ic}</svg></span>`:avatar(n.i);
      const l2=n.l2.replace(/\s*\u2192\s*/,' <svg class="nar" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg> ');
      html+=`<div class="nrow${n.u?' unread':''}${n.fresh?' arrived':''}" data-ni="${items.indexOf(n)}" tabindex="0" role="button">
        ${who}
        <span class="ntxt"><span class="nl1">${rowTitle(n.i)}</span><span class="nl2"><span>${l2}</span></span></span>
        <span class="nright"><span class="ntime">${n.t}</span><span class="nrmenu" data-nmenu="${items.indexOf(n)}">\u22ef</span></span>
      </div>`;
      n.fresh=false;
    });
    empty.insertAdjacentHTML('beforebegin',html);
    body.classList.toggle('isempty',list.length===0);
    syncBadges();
  }

  function syncBadges(){
    const n=unread();
    bell.dataset.unread=n;
    bell.setAttribute('aria-label',V2
      ?(n?`Notifications, ${n} need your attention`:'Notifications, nothing needs you')
      :(n?`Notifications, ${n} unread`:'Notifications, no unread'));
    tip.textContent=n===1?'1 unread':n+' unread';
    if(sideDot){sideDot.dataset.n=n;sideDot.style.display=n?'':'none';}
  }

  const scrim=document.getElementById('tx-nscrim');
  scrim.addEventListener('click',()=>close());
  function open(){
    B.classList.add('npopen');scrim.classList.add('open');panel.classList.add('open');bell.classList.add('open');bell.setAttribute('aria-expanded','true');
    if(V2)sortGroups();
    (V2?render2:render)();panel.focus();
    if(firstOpen&&NOTIF.live){firstOpen=false;setTimeout(arrive,5000);}
  }
  function close(){
    B.classList.remove('npopen');scrim.classList.remove('open');panel.classList.remove('open');bell.classList.remove('open');bell.setAttribute('aria-expanded','false');bell.focus();
  }
  const isOpen=()=>panel.classList.contains('open');

  function arrive(){
    if(!isOpen())return;
    if(V2){groups[0].ev.unshift({x:'Inspection report uploaded',t:'now',u:1});return render2()}
    items.unshift({i:19,k:'doc',t:'now',g:'Today',u:1,fresh:true,l2:'Inspection report uploaded'});
    render();
  }

  bell.addEventListener('click',e=>{e.stopPropagation();isOpen()?close():open()});
  document.getElementById('tx-nclose').addEventListener('click',close);
  document.getElementById('tx-nmarkall').addEventListener('click',()=>{
    if(V2){
      const rows=[...body.querySelectorAll('.n2ev.unread')].slice(0,5);
      rows.forEach((r,k)=>setTimeout(()=>r.classList.remove('unread'),k*40));
      body.querySelectorAll('.n2ev.unread').forEach(r=>r.classList.remove('unread'));
      groups.forEach(g=>g.ev.forEach(e=>e.u=0));
      setTimeout(syncBadges,rows.length*40+160);
      return;
    }
    const rows=[...body.querySelectorAll('.nrow.unread')];
    rows.forEach((r,k)=>setTimeout(()=>r.classList.remove('unread'),k*30));
    items.forEach(n=>n.u=0);
    setTimeout(syncBadges,rows.length*30+200);
  });
  chips.addEventListener('click',e=>{
    const t=e.target.closest('[data-nfilter]');if(!t)return;
    chips.querySelectorAll('.tab').forEach(c=>c.classList.remove('active'));t.classList.add('active');
    filter=t.dataset.nfilter;(V2?render2:render)();
  },true);
  /* search */
  const npq=document.getElementById('tx-npq'),npqx=document.getElementById('tx-npqx');
  if(npq){
    npq.addEventListener('input',()=>{npqx.hidden=!npq.value;(V2?render2:render)()});
    npqx.addEventListener('click',()=>{npq.value='';npqx.hidden=true;(V2?render2:render)();npq.focus()});
  }
  /* per-row delete + settings link */
  body.addEventListener('click',e=>{
    const del=e.target.closest('[data-ndel]');
    if(!del)return;
    e.stopPropagation();
    const ev=del.closest('.n2ev');
    if(ev){
      const gi=+ev.dataset.g,ei=+ev.dataset.e;
      const g=groups[gi];if(!g||!g.ev[ei])return;
      ev.classList.add('gone');
      setTimeout(()=>{g.ev.splice(ei,1);if(!g.ev.length)groups.splice(gi,1);(V2?render2:render)();syncBadges()},180);
      return;
    }
    const nrow=del.closest('.nrow');
    if(nrow){
      const ni=+nrow.dataset.ni;items.splice(ni,1);(V2?render2:render)();syncBadges();
    }
  });
  const nset=document.getElementById('tx-nsettings');
  if(nset)nset.addEventListener('click',e=>{e.stopPropagation();close();if(window.sonner)sonner('Notification settings','Choose which events reach you and how.')});
  document.getElementById('tx-nviewall').addEventListener('click',()=>{
    close();if(window.sonner)sonner('Notifications','Opening the full notifications page.');
  });

  /* ---- v2 interactions ---- */
  function resolve(btn,gi,ei,label){
    const ev=btn.closest('.n2ev');
    btn.classList.add('done');btn.innerHTML=CHECK+label;
    setTimeout(()=>{
      ev.classList.add('gone');
      setTimeout(()=>{
        const g=groups[gi];g.ev.splice(ei,1);
        if(!g.ev.length)groups.splice(gi,1);
        render2();
      },200);
    },1200);
  }
  function expandReply(btn){
    const w=btn.parentElement.querySelector('.n2reply');if(!w)return;
    w.dataset.open='true';
    const inp=w.querySelector('input');
    const focus=()=>inp.focus();
    w.addEventListener('transitionend',focus,{once:true});
    setTimeout(focus,220);
  }
  if(V2)body.addEventListener('click',e=>{
    const zt=e.target.closest('[data-zt]');
    if(zt){e.stopPropagation();const z=zt.closest('.n2zone');actOpen=z.dataset.open!=='true';z.dataset.open=actOpen;zt.setAttribute('aria-expanded',actOpen);localStorage.setItem('tx-nact',actOpen?'1':'0');return}
    const more=e.target.closest('[data-more]');
    if(more){e.stopPropagation();groups[+more.dataset.more].exp=1;return render2()}
    const goto=e.target.closest('[data-goto]');
    if(goto){e.stopPropagation();return jump(+goto.dataset.goto)}
    const gtog=e.target.closest('[data-gtoggle]');
    if(gtog){
      e.stopPropagation();
      const gi=+gtog.dataset.gtoggle,g=groups[gi];
      g.open=!g.open;
      const wrap=gtog.parentNode;
      wrap.dataset.open=g.open?'true':'false';
      gtog.setAttribute('aria-expanded',g.open?'true':'false');
      return;
    }
    const btn=e.target.closest('.n2btn');
    if(btn){
      e.stopPropagation();
      const ev=btn.closest('.n2ev'),gi=+ev.dataset.g,ei=+ev.dataset.e,k=btn.dataset.act;
      if(k==='reply'||k==='inline')return expandReply(btn);
      if(k==='details'){
        close();
        const idx=window.firstIncompleteTx?window.firstIncompleteTx():-1;
        setTimeout(()=>{
          const t=idx>=0&&document.querySelector('.cshint[data-mi="'+idx+'"]');
          if(t&&window.openMissingPop)window.openMissingPop(t,idx);
        },180);
        return;
      }
      if(k==='cancel'){btn.closest('.n2reply').dataset.open='false';return}
      if(k==='send'){
        const trigger=btn.closest('.n2act').querySelector('.n2btn');
        btn.closest('.n2reply').dataset.open='false';
        return resolve(trigger,gi,ei,trigger.dataset.act==='inline'?'Saved':'Sent');
      }
      if(k==='deep'){
        if(window.sonner)sonner(btn.textContent.trim(),rowTitle(groups[gi].i));
        return resolve(btn,gi,ei,'Opened');
      }
      if(k==='dismiss')return resolve(btn,gi,ei,'Dismissed');
      return;
    }
    const row=e.target.closest('.n2ev');
    if(row){const g=groups[+row.dataset.g];g.ev[+row.dataset.e].u=0;syncBadges();jump(g.i)}
  },true);
  if(V2)body.addEventListener('keydown',e=>{
    const gh=e.target.closest('[data-gtoggle]');
    if(gh&&(e.key==='Enter'||e.key===' ')){e.preventDefault();gh.click()}
  });
  function jump(i){
    close();
    if(B.dataset.nflash!=='on')return;
    const tr=document.querySelectorAll('#tx-tb tr')[i];if(!tr)return;
    if(twrap)twrap.scrollTop=Math.max(0,tr.offsetTop-twrap.clientHeight/2);
    tr.classList.remove('nflash');void tr.offsetWidth;tr.classList.add('nflash');
    setTimeout(()=>tr.classList.remove('nflash'),500);
  }
  if(V2)body.addEventListener('click',e=>{
    const l=e.target.closest('[data-nfilter-link]');
    if(l){filter=l.dataset.nfilterLink;render2()}
  });

  if(!V2)body.addEventListener('click',e=>{
    const menu=e.target.closest('[data-nmenu]');
    if(menu){e.stopPropagation();return openNotifMenu(menu,+menu.dataset.nmenu)}
    const row=e.target.closest('.nrow');if(!row)return;
    activate(+row.dataset.ni);
  });
  if(!V2)body.addEventListener('keydown',e=>{
    const row=e.target.closest('.nrow');
    if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();activate(+row.dataset.ni)}
  });

  function activate(ni){
    const n=items[ni];if(!n)return;
    n.u=0;syncBadges();close();
    if(B.dataset.nflash!=='on')return;
    const tr=document.querySelectorAll('#tx-tb tr')[n.i];if(!tr)return;
    if(twrap)twrap.scrollTop=Math.max(0,tr.offsetTop-twrap.clientHeight/2);
    tr.classList.remove('nflash');void tr.offsetWidth;tr.classList.add('nflash');
    setTimeout(()=>tr.classList.remove('nflash'),500);
  }

  /* reuses the table's row-menu popover (.rmpop) */
  function openNotifMenu(el,ni){
    if(typeof rmPop==='undefined')return;
    const n=items[ni];const r=el.getBoundingClientRect();
    rmPop.innerHTML=`
      <div class="rmitem" data-act="read"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>${n.u?'Mark as read':'Mark as unread'}</div>
      <div class="rmitem" data-act="mute"><svg viewBox="0 0 24 24"><path d="M8.7 3A6 6 0 0 1 18 8c0 7 3 9 3 9h-4"/><path d="M6.3 6.3A6 6 0 0 0 6 8c0 7-3 9-3 9h10"/><path d="m2 2 20 20"/></svg>Mute this transaction</div>`;
    rmPop.style.top=(r.bottom+4)+'px';
    rmPop.style.left=Math.max(8,r.left-170)+'px';
    rmPop.classList.add('open');
    rmPop.querySelector('[data-act="read"]').onclick=ev=>{ev.stopPropagation();n.u=n.u?0:1;rmPop.classList.remove('open');render()};
    rmPop.querySelector('[data-act="mute"]').onclick=ev=>{ev.stopPropagation();rmPop.classList.remove('open');if(window.sonner)sonner('Muted',rowTitle(n.i)+' will stay quiet.')};
  }

  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())close()});
  let inside=false;
  document.addEventListener('click',e=>{inside=panel.contains(e.target)||bell.contains(e.target)},true);
  document.addEventListener('click',()=>{if(isOpen()&&!inside)close()});
  syncBadges();
})();
