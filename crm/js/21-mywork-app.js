/* ================= My work =================
   One source of truth for tasks / appointments / envelopes; all three layouts
   (tweak: layout = v1 | v2 | v3) render from these arrays. */
(function(){
const body=document.getElementById('mw-body');
const tabsBar=document.getElementById('mw-tabs');
const tabseg=document.getElementById('mw-tabseg');
const pcount=document.getElementById('mw-pcount');

const ic=(p,cls)=>`<svg class="${cls||'mwic'}" viewBox="0 0 24 24">${p}</svg>`;
const P={
  call:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  email:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  follow:'<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  video:'<path d="m23 7-7 5 7 5z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  apthome:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  aptusers:'<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16.5 5.4a3.2 3.2 0 0 1 0 5.2"/><path d="M18 14.4a6.5 6.5 0 0 1 3.5 5.6"/>',
  aptsale:'<path d="M12 3v18"/><path d="M16.5 7.5A3.5 3.5 0 0 0 13 5h-1.5a3 3 0 0 0 0 6h1.5a3 3 0 0 1 0 6H11a3.5 3.5 0 0 1-3.5-2.5"/>',
  pen:'<path d="M12 19h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  alert:'<path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
  check:'<path d="m5 13 4 4L19 7"/>',
  spark:'<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/>',
  eye:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  reassign:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  funnel:'<path d="M22 3H2l8 9.46V19l4 2v-8.54z"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  comm:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5A2.5 2.5 0 0 0 12.5 7h-1a2.5 2.5 0 0 0 0 5h1a2.5 2.5 0 0 1 0 5h-1A2.5 2.5 0 0 1 9 14.5"/>',
  esign:'<path d="M3 17.5V21h3.5L18.8 8.7l-3.5-3.5z"/><path d="M14.8 6.7l3.5 3.5"/><path d="M4 21h16"/>',
  comment:'<path d="M21 12a8 8 0 0 1-11.7 7.1L4 21l1.9-5.3A8 8 0 1 1 21 12z"/>',
  combrk:'<path d="M3 3v18h18"/><path d="M7 15v-4M12 15V8M17 15v-6"/>'
};

/* ---------- data ---------- */
const TASKS=[
  {t:'Send inspection repair list to Grace Lee',cl:'Grace Lee',g:'over',due:'Yesterday',dt:'2026-07-28',ty:'email',prop:'215 Marina Blvd, Apt 2A'},
  {t:'Call Peak Lending about the rate lock',cl:'Mason Martinez',g:'over',due:'Mon, Jul 27',dt:'2026-07-27',ty:'call',prop:'9 Willow Creek Lane'},
  {t:'Prep CMA for 300 Oak Ave',cl:'Carla Boyd',g:'today',due:'Today',dt:'2026-07-29',ty:'follow',prop:'300 Oak Ave'},
  {t:'Grace Lee has not heard from you in 11 days — send a market update',cl:'Grace Lee',g:'today',due:'Today',dt:'2026-07-29',ty:'email',mel:true,prop:'215 Marina Blvd, Apt 2A'},
  {t:'Confirm Saturday showing block',cl:'Daniel Ruiz',g:'today',due:'Today',dt:'2026-07-29',ty:'call',prop:'502 Cedar Ridge Court'},
  {t:'Send disclosure packet',cl:'Priya Nair',g:'today',due:'Today',dt:'2026-07-29',ty:'email',prop:'77 Bunker Hill Ave, Apt 705'},
  {t:'Follow up after Sunday open house',cl:'Jenna Woods',g:'up',due:'Thu, Jul 30',dt:'2026-07-30',ty:'follow'},
  {t:'Review counteroffer terms',cl:'Victor Hale',g:'up',due:'Thu, Jul 30',dt:'2026-07-30',ty:'follow'},
  {t:'Appraisal came in $12k under contract price — review options with Victor',cl:'Victor Hale',g:'up',due:'Thu, Jul 30',dt:'2026-07-30',ty:'follow',mel:true},
  {t:'Order listing photos for 88 King St',cl:'Tom Alvarez',g:'up',due:'Fri, Jul 31',dt:'2026-07-31',ty:'email'},
  {t:'Check appraisal status with the lender',cl:'Mason Martinez',g:'up',due:'Mon, Aug 3',dt:'2026-08-03',ty:'call'},
  {t:'Renewal check-in on 19 Bayview Ct lease',cl:'Carla Boyd',g:'up',due:'Mon, Aug 3',dt:'2026-08-03',ty:'call'},
  {t:'Approve commission split — 5670 Kearny Mesa (Nora Collins)',cl:'Nora Collins',g:'today',due:'Today',dt:'2026-07-29',ty:'comm',prop:'5670 Kearny Mesa Road, Suite 210'},
  {t:'Confirm referral fee before disbursement — 275 Miramar',cl:'Daniel Ruiz',g:'today',due:'Today',dt:'2026-07-29',ty:'comm',prop:'275 Miramar Ave'},
  {t:'Review commission adjustment after price reduction',cl:'Victor Hale',g:'up',due:'Fri, Jul 31',dt:'2026-07-31',ty:'comm',prop:'412 Maple Ave'},
  {t:'Sign brokerage split memo — 88 King St',cl:'Jenna Woods',g:'over',due:'Mon, Jul 27',dt:'2026-07-27',ty:'comm',prop:'88 King St #1204'}
].map(t=>Object.assign({done:false},t));

/* appointment types — label + icon key, keyed on a.at */
const ATY={mtg:['Meeting','aptusers'],show:['Property showing','apthome'],call:['Call','call'],
           sale:['Sale','aptsale'],email:['Email','email'],follow:['Follow up','follow']};
const ATORD=['call','show','mtg','sale','email','follow'];
const atBadge=at=>at?`<span class="mwat ${at}">${ic(P[ATY[at][1]],'mwic mwtyi')}${ATY[at][0]}</span>`:'';
const APPTS=[
  {d:'Today',dt:'2026-07-29',time:'11:00 AM',m:660,t:'Listing consultation',cl:'Carla Boyd',loc:'640 Alma St',at:'mtg'},
  {d:'Today',dt:'2026-07-29',time:'2:30 PM',m:870,t:'Buyer tour — three homes',cl:'Daniel Ruiz',loc:'275 Miramar Ave',at:'show'},
  {d:'Today',dt:'2026-07-29',time:'4:00 PM',m:960,t:'Lender call — pre-approval',cl:'Priya Nair',virtual:true,at:'call'},
  {d:'Tomorrow',dt:'2026-07-30',time:'9:30 AM',m:570,t:'Inspection walkthrough',cl:'Grace Lee',loc:'1408 Cowper St',at:'show'},
  {d:'Tomorrow',dt:'2026-07-30',time:'1:00 PM',m:780,t:'Offer review',cl:'Victor Hale',virtual:true,at:'mtg'},
  {d:'Fri, Jul 31',dt:'2026-07-31',time:'10:00 AM',m:600,t:'Open house prep',cl:'Jenna Woods',loc:'88 King St #1204',at:'follow'}
];

const dnum=(s,lo,hi)=>lo+([...s].reduce((a,c)=>a+c.charCodeAt(0),0)%(hi-lo+1));
const DOCK={you:['Awaiting your signature','Signature'],ag:['Awaiting agent','Signature'],ot:['Awaiting client','Signature'],sg:['Fully executed','Signed']};
const ENVS=[
  {n:'Offer 1',cl:'Daniel Ruiz',tx:'275 Miramar Ave',st:'you',sent:'Jul 28'},
  {n:'Offer 2',cl:'Victor Hale',tx:'3120 Alexis Dr',st:'you',sent:'Jul 27'},
  {n:'Envelope 1',cl:'Carla Boyd',tx:'640 Alma St',st:'ag',sent:'Jul 26'},
  {n:'Envelope 2',cl:'Priya Nair',tx:'Buyer search',st:'ag',sent:'Jul 25'},
  {n:'Envelope 3',cl:'Grace Lee',tx:'1408 Cowper St',st:'ot',sent:'Jul 24'},
  {n:'Envelope 4',cl:'Carla Boyd',tx:'19 Bayview Ct',st:'ot',sent:'Jul 23'},
  {n:'Envelope 5',cl:'Jenna Woods',tx:'88 King St #1204',st:'sg',sent:'Jul 20'},
  {n:'Envelope 6',cl:'Mason Martinez',tx:'210 Laurel Ave',st:'sg',sent:'Jul 18'},
  {n:'Envelope 7',cl:'Tom Alvarez',tx:'54 Ridgeway Rd',st:'you',sent:'Jul 28'},
  {n:'Envelope 8',cl:'Grace Lee',tx:'1408 Cowper St',st:'you',sent:'Jul 26'},
  {n:'Envelope 9',cl:'Mason Martinez',tx:'210 Laurel Ave',st:'ag',sent:'Jul 24'},
  {n:'Envelope 10',cl:'Jenna Woods',tx:'88 King St #1204',st:'ag',sent:'Jul 22'},
  {n:'Envelope 11',cl:'Priya Nair',tx:'Buyer search',st:'ot',sent:'Jul 23'},
  {n:'Envelope 12',cl:'Daniel Ruiz',tx:'275 Miramar Ave',st:'ot',sent:'Jul 21'},
  {n:'Envelope 13',cl:'Victor Hale',tx:'3120 Alexis Dr',st:'ot',sent:'Jul 19'},
  {n:'Envelope 14',cl:'Carla Boyd',tx:'640 Alma St',st:'sg',sent:'Jul 16'},
  {n:'Envelope 15',cl:'Tom Alvarez',tx:'54 Ridgeway Rd',st:'sg',sent:'Jul 15'},
  {n:'Envelope 16',cl:'Jenna Woods',tx:'88 King St #1204',st:'sg',sent:'Jul 14'}
];
const ST={you:['Your signature pending','Sign','you'],ag:['Agent signature pending','Remind','ag'],
          ot:['Other signature pending','Remind','ot'],sg:['Signed','View','sg']};
const GL={over:'Overdue',today:'Today',up:'Upcoming'};
const TY={email:'Email',call:'Call',follow:'Follow-up',sign:'Sign',comm:'Commission approval',esign:'eSign',comment:'Comment',combrk:'Commission breakdown'};
/* signing route — mixed order: you, then co-op agent (when there is one), then client(s) in parallel */
const ME='Ashutosh Iyer';
const COAG=['Emily Robinson','Daniel Scott','Marcus Webb','Lena Park'];
const COSIGN={'Daniel Ruiz':'Nina Ruiz','Victor Hale':'Elena Hale','Grace Lee':'Alan Lee','Jenna Woods':'Rob Woods'};
const DOCX=['Addendum A — financing','Agency disclosure','Signature page','Wire instructions','Amendment 1','Exhibit B — fixtures'];
/* the packet title is the card title, so the paper lists only what ELSE is inside */
function envDocs(e){const n=dnum(e.n,2,6),o=dnum(e.cl,0,2);return DOCX.slice(o,o+n-1);}
function envWait(e){return 29-parseInt(e.sent.split(' ')[1],10);}
function envRoute(e){
  const h=dnum(e.n+e.cl,0,99),hasAg=e.st==='ag'||h%3===0;
  const steps=[[{n:ME,r:'You · listing agent'}]];
  if(hasAg)steps.push([{n:COAG[h%COAG.length],r:'Co-op agent'}]);
  const role=ROLES[e.cl]||'Client',cli=[{n:e.cl,r:role}];
  if(COSIGN[e.cl]&&h%2===0)cli.push({n:COSIGN[e.cl],r:role+' · co-signer'});
  steps.push(cli);
  const cur=e.st==='you'?0:e.st==='ag'?(hasAg?1:0):e.st==='ot'?steps.length-1:steps.length;
  steps.forEach((s,i)=>s.forEach(p=>{p.signed=i<cur;p.cur=i===cur;}));
  return steps;
}
const rav=p=>'<span class="rds-avatar rds-avatar--xs mwav rav '+avHue(p.n)+(p.signed?' sgd':p.cur?' cur':' pnd')+'" tabindex="0">'
  +(pho(p.n)?'':initials(p.n))
  +(pho(p.n)?'<img src="'+pho(p.n)+'" alt="" onerror="this.remove();this.parentNode.prepend(document.createTextNode(\''+initials(p.n)+'\'))">':'')
  +'<span class="mwavtip">'+(p.n===ME?'You':p.n)+'<em>'+p.r+(p.signed?' · signed':p.cur?' · signing now':' · waiting')+'</em></span></span>';
const ROLES={"Grace Lee":"Seller","Mason Martinez":"Buyer","Carla Boyd":"Seller","Daniel Ruiz":"Buyer","Priya Nair":"Buyer","Jenna Woods":"Seller","Victor Hale":"Buyer","Tom Alvarez":"Seller"};
const VIEWTOG=()=>'<div class="mwvt">'
  +'<button type="button" data-view="cards"'+(view==='cards'?' class="on"':'')+' title="Cards">'+ic('<path d="M3 5h18M3 12h18M3 19h18"/>','mwic')+'</button>'
  +'<button type="button" data-view="table"'+(view==='table'?' class="on"':'')+' title="Table">'+ic('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>','mwic')+'</button></div>';
const melBadge=()=>'<span class="mwmelb" tabindex="0">'+ic(P.spark,'mwic')+'Mel<span class="mwavtip">Created by Mel<em>Suggested from client activity</em></span></span>';
const AVH=['bl','gr','or','pu','te','rd'];
const avHue=n=>AVH[[...n].reduce((a,c)=>a+c.charCodeAt(0),0)%AVH.length];
const PHOTOS=[];
const pho=n=>PHOTOS.includes(n)?'assets/av-'+n.toLowerCase().replace(/[^a-z]+/g,'-')+'.png':'';
const avatar=n=>'<span class="rds-avatar rds-avatar--xs mwav '+avHue(n)+'" data-cl tabindex="0">'+(pho(n)?'':initials(n))
  +(pho(n)?'<img src="'+pho(n)+'" alt="" onerror="this.remove();this.parentNode.prepend(document.createTextNode(\''+initials(n)+'\'))">':'')
  +'<span class="mwavtip">'+n+'<em>'+(ROLES[n]||'Client')+'</em></span></span>';
const avatarName=n=>'<span class="mwcw">'+avatar(n)+'<span class="mwcln">'+n+'</span></span>';
const initials=n=>{const p=n.trim().split(/\s+/);return((p[0]||'')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase();};
const NOW=612; /* 10:12 AM — the prototype's "now", used for the next-appointment countdown */

let layout='v2',tab='ta',melOn=true,view='cards';

/* ---------- section filters ----------
   TF / AF hold the committed state. Opening a popover snapshots them; the
   popover mutates them live but nothing re-renders until Apply, so the funnel
   badge and chips keep showing the committed set. Close / Escape restores. */
const TF={dt:'',from:'',to:'',g:[],ty:[],cl:[],done:false};
const AF={dt:'',from:'',to:'',at:[],fmt:[],cl:[]};
const EF={st:[],cl:[],sg:false};
const FS={t:TF,a:AF,e:EF};
const FMTL={inp:'In person',virt:'Virtual'};
const TODAY='2026-07-29';
const isoOf=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const shiftD=(s,n)=>{const p=s.split('-').map(Number),d=new Date(p[0],p[1]-1,p[2]+n);return isoOf(d)};
const monthEnd=s=>{const p=s.split('-').map(Number),d=new Date(p[0],p[1],0);return isoOf(d)};
const DLBL={over:'Overdue',today:'Today',tom:'Tomorrow',next7:'Next 7 days',month:'This month',custom:'Custom range'};
const TPRE=['over','today','tom','next7','month','custom'];
const APRE=['today','tom','next7','month','custom'];
function dRange(S){
  switch(S.dt){
    case 'over':return ['',shiftD(TODAY,-1)];
    case 'today':return [TODAY,TODAY];
    case 'tom':return [shiftD(TODAY,1),shiftD(TODAY,1)];
    case 'next7':return [TODAY,shiftD(TODAY,6)];
    case 'month':return [TODAY.slice(0,8)+'01',monthEnd(TODAY)];
    case 'custom':return [S.from||'',S.to||''];
    default:return null;
  }
}
const dPass=(dt,S)=>{const r=dRange(S);if(!r)return true;return (!r[0]||dt>=r[0])&&(!r[1]||dt<=r[1])};
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtD=s=>{if(!s)return '…';const p=s.split('-');return MON[+p[1]-1]+' '+(+p[2])};
const dChip=S=>S.dt==='custom'?fmtD(S.from)+' – '+fmtD(S.to):DLBL[S.dt];
const CLIENTS=[...new Set(TASKS.map(t=>t.cl).concat(APPTS.map(a=>a.cl)))].sort();
let POP=null,SNAP=null;
const hasT=()=>TF.g.length+TF.ty.length+TF.cl.length+(TF.done?1:0)+(TF.dt?1:0);
const hasA=()=>AF.at.length+AF.fmt.length+AF.cl.length+(AF.dt?1:0);
const hasE=()=>EF.st.length+EF.cl.length+(EF.sg?1:0);
const hasF=k=>k==='t'?hasT():k==='a'?hasA():hasE();
const envPass=e=>(!EF.st.length||EF.st.includes(e.st))&&(!EF.cl.length||EF.cl.includes(e.cl))&&(EF.sg||e.st!=='sg');
const fEnvs=()=>ENVS.filter(envPass);
const ENVCL=()=>[...new Set(ENVS.map(e=>e.cl))].sort();
const taskPass=t=>(!TF.g.length||TF.g.includes(t.g))&&(!TF.ty.length||TF.ty.includes(t.ty))
  &&(!TF.cl.length||TF.cl.includes(t.cl))&&(TF.done||!t.done)&&dPass(t.dt,TF);
const apptPass=a=>(!AF.at.length||AF.at.includes(a.at))&&(!AF.fmt.length||AF.fmt.includes(a.virtual?'virt':'inp'))&&(!AF.cl.length||AF.cl.includes(a.cl))&&dPass(a.dt,AF);
const fAppts=()=>APPTS.filter(apptPass);
const fTaskIds=g=>TASKS.map((t,i)=>i).filter(i=>(g==null||TASKS[i].g===g)&&taskPass(TASKS[i]));
const fopt=(k,key,v,label)=>{const on=FS[k][key].includes(v);
  return `<div class="fopt${on?' on':''}" role="checkbox" aria-checked="${on}" tabindex="0" data-fk="${key}" data-fv="${v}"><span class="fcb">${ic(P.check,'')}</span><span>${label}</span></div>`;};
const frad=(k,v)=>{const on=FS[k].dt===v;
  return `<div class="fopt rad${on?' on':''}" role="radio" aria-checked="${on}" tabindex="0" data-fdt="${v}"><span class="fcb">${ic(P.check,'')}</span><span>${DLBL[v]}</span></div>`;};
const FSEC={};
const fsec=(k,id,title,inner)=>{const key=k+'|'+id,coll=!!FSEC[key];
  return `<div class="fsec${coll?' coll':''}" data-seck="${key}">
    <button type="button" class="fsech" data-fsec="${key}" aria-expanded="${!coll}"><span>${title}</span><svg class="fschev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="fsecb">${inner}</div></div>`;};
function dateGroup(k){
  const S=k==='t'?TF:AF,pre=k==='t'?TPRE:APRE;
  return fsec(k,'dt',k==='t'?'Due date':'Date',`<div class="fopts">${pre.map(v=>frad(k,v)).join('')}</div>
    <div class="frange${S.dt==='custom'?' on':''}">
      <input type="date" data-fdt2="from" value="${S.from||''}" aria-label="From date">
      <span class="dash">to</span>
      <input type="date" data-fdt2="to" value="${S.to||''}" aria-label="To date"></div>`);
}
function fpop(k){
  const groups=k==='e'
    ?fsec('e','st','Status',`<div class="fopts">${['you','ag','ot'].map(s=>fopt('e','st',s,ST[s][0])).join('')}</div>`)
    :dateGroup(k)+(k==='t'
    ?fsec('t','ty','Type',`<div class="fopts">${['call','email','follow','comm','sign','esign','comment','combrk'].map(y=>fopt('t','ty',y,TY[y])).join('')}</div>`)
    :fsec('a','at','Type',`<div class="fopts">${ATORD.map(v=>fopt('a','at',v,ATY[v][0])).join('')}</div>`)
     +fsec('a','fmt','Format',`<div class="fopts">${['inp','virt'].map(f=>fopt('a','fmt',f,FMTL[f])).join('')}</div>`));
  const sw=k==='t'?`<div class="fsw" role="switch" aria-checked="${TF.done}" tabindex="0" data-fsw="done"><span>Show completed</span><span class="swt${TF.done?' on':''}"><span class="kn"></span></span></div>`
    :k==='e'?`<div class="fsw" role="switch" aria-checked="${EF.sg}" tabindex="0" data-fsw="sg"><span>Show signed</span><span class="swt${EF.sg?' on':''}"><span class="kn"></span></span></div>`:'';
  const clients=fsec(k,'cl','Client',
    `<div class="fsrch">${ic(P.search,'mwic')}<input type="text" placeholder="Search clients" data-fsrch aria-label="Search clients"></div>
     <div class="fopts scr">${(k==='e'?ENVCL():CLIENTS).map(c=>fopt(k,'cl',c,c)).join('')}</div>`);
  return `<div class="mwfpop" data-pop="${k}"><div class="mwfbody">${groups}${clients}${sw}</div>
    <div class="fft"><button type="button" class="fclr" data-fclr="${k}">Clear</button>
    <button type="button" class="fapply" data-fapply="${k}">Apply filters</button></div></div>`;
}
function fbtn(k){
  const n=hasF(k),lbl='Filter '+({t:'tasks',a:'appointments',e:'envelopes'}[k]);
  return `<div class="mwfw"><button class="mwfbtn${n?' on':''}" type="button" data-fpop="${k}" title="${lbl}" aria-label="${lbl}" aria-expanded="false">${ic(P.funnel,'mwic')}${n?`<span class="fdot">${n}</span>`:''}</button>${fpop(k)}</div>`;
}
function chips(k){
  const it=[];
  if(k==='t'){if(TF.dt)it.push(['Due',dChip(TF),'dt','1']);
    TF.ty.forEach(v=>it.push(['Type',TY[v],'ty',v]));
    TF.cl.forEach(v=>it.push(['Client',v,'cl',v]));if(TF.done)it.push(['','Completed shown','done','1']);}
  else if(k==='a'){if(AF.dt)it.push(['Date',dChip(AF),'dt','1']);
    AF.at.forEach(v=>it.push(['Type',ATY[v][0],'at',v]));
    AF.fmt.forEach(v=>it.push(['Format',FMTL[v],'fmt',v]));AF.cl.forEach(v=>it.push(['Client',v,'cl',v]));}
  else{EF.st.forEach(v=>it.push(['Status',ST[v][0],'st',v]));EF.cl.forEach(v=>it.push(['Client',v,'cl',v]));if(EF.sg)it.push(['','Signed shown','sg','1']);}
  if(!it.length)return '';
  return '<div class="mwchips">'+it.map(([lb,v,key,val])=>`<span class="mwchip">${lb?`<span class="k">${lb}</span>`:''}<span class="v">${v}</span><button type="button" class="cx" data-cx="${k}|${key}|${val}" aria-label="Remove ${v} filter">${ic(P.x,'')}</button></span>`).join('')
    +`<button type="button" class="mwclrall" data-fclrall="${k}">Clear all</button></div>`;
}
const fEmpty=(k,msg)=>`<div class="mwempty">${msg}${hasF(k)?`<button type="button" class="fclr2" data-fclrall="${k}">Clear filters</button>`:''}</div>`;
function fclear(k){const S=FS[k];S.dt='';S.from='';S.to='';S.cl=[];
  if(k==='t'){TF.g=[];TF.ty=[];TF.done=false;}else if(k==='a'){AF.fmt=[];AF.at=[];}else{EF.st=[];EF.sg=false;}}
const openTasks=()=>TASKS.filter(t=>!t.done);
const pend=()=>ENVS.filter(e=>e.st!=='sg');
const openCount=()=>openTasks().length+APPTS.length+pend().length;
const link=n=>`<span class="mwcw"><span class="rds-avatar rds-avatar--2xs mwav ${avHue(n)}" data-cl tabindex="0">${pho(n)?'':initials(n)}${pho(n)?'<img src="'+pho(n)+'" alt="">':''}<span class="mwavtip">${n}<em>${ROLES[n]||'Client'}</em></span></span><a class="mwcl" href="#" data-cl>${n}</a></span>`;

/* ---------- rows ---------- */
function taskRow(i){
  const t=TASKS[i];
  return `<div class="mwtrow${t.done?' done':''}${t.mel?' melrow':''}" data-ti="${i}">
    <span class="mwcb" role="checkbox" aria-checked="${t.done}" tabindex="0">${ic(P.check,'')}</span>
    <div class="mwtmain">
      <div class="mwtl1">
        <div class="mwtt2">${t.t}</div>
        <span class="mwdue${t.g==='over'?' red':''}">${t.due}</span>
      </div>
      <div class="mwtmeta">
        ${link(t.cl)}
        <span class="mwty ${t.ty}">${ic(P[t.ty],'mwic mwtyi')}${TY[t.ty]}</span>
        ${t.mel?melBadge():''}
      </div>
    </div>
    <div class="mwtacts">
      <button class="mwta" type="button" data-act="done" title="Mark as done" aria-label="Mark as done">${ic(P.check,'mwic')}</button>
      <button class="mwta" type="button" data-act="snooze" title="Snooze" aria-label="Snooze">${ic(P.clock,'mwic')}</button>
    </div></div>`;
}
function apptRow(a){
  const place=a.virtual?`${ic(P.video)} Virtual`:`${ic(P.pin)} ${a.loc}`;
  return `<div class="mwrow"><span class="mwtime">${a.time}</span><span class="mwtt">${a.t}</span>
    ${link(a.cl)}<span class="mwmeta">${atBadge(a.at)}${place}</span></div>`;
}
const GOPEN={over:true,today:true,up:false};
function tasksSection(){
  const hd='<div class="mwsech">Tasks'+fbtn('t')+'</div>'+chips('t');
  let h='<div class="mwsec">'+hd,shown=0;
  ['over','today','up'].forEach(g=>{
    const ids=fTaskIds(g);
    if(!ids.length)return;
    shown+=ids.length;
    const n=ids.filter(i=>!TASKS[i].done).length;
    const op=GOPEN[g];
    h+=`<div class="mwgh tog${g==='over'?' od':''}" data-grp="${g}" role="button" tabindex="0" aria-expanded="${op}">
          <svg class="ghchev" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          ${GL[g]} <span class="n">${n}</span>
          <span class="ghhint">Show</span></div>`;
    if(op)h+=`<div class="mwlist">${ids.map(taskRow).join('')}</div>`;
  });
  if(!shown)h+=fEmpty('t','No tasks match these filters');
  return h+'</div>';
}
const fmt=m=>{const h=Math.floor(m/60),mm=m%60;return `${((h+11)%12)+1}:${String(mm).padStart(2,'0')} ${h<12?'AM':'PM'}`};
function calEvent(a,isToday,nextM){
  const past=isToday&&a.m<=NOW;
  const place=a.virtual?`${ic(P.video)} Virtual`:`${ic(P.pin)} ${a.loc}`;
  const isNext=isToday&&a.m===nextM;
  const left=nextM-NOW;
  const badge=isNext&&left>0?`<span class="mwnext">in ${left>=60?Math.floor(left/60)+'h '+String(left%60).padStart(2,'0')+'m':left+'m'}</span>`:'';
  return `<div class="mwev${a.virtual?' virtual':''}${past?' past':''}">
    <span class="tg">${a.time}</span>
    <span class="rail"></span>
    <span class="mwevb"><span class="mwevt">${a.t}</span>
      <span class="mwevm">${link(a.cl)}<span class="pl">${place}</span>${atBadge(a.at)}</span></span>
    <span class="mwevr">${badge}</span></div>`;
}
function dayCard(d){
  const rows=fAppts().filter(a=>a.d===d).sort((x,y)=>x.m-y.m);
  const isToday=d==='Today';
  const upcoming=rows.filter(a=>a.m>=NOW);
  const nextM=isToday&&upcoming.length?upcoming[0].m:-1;
  let evs='';
  rows.forEach(a=>{
    evs+=calEvent(a,isToday,nextM);
  });
  const sub=isToday?'Wed, Jul 29':d==='Tomorrow'?'Thu, Jul 30':'';
  return `<div class="mwcal"><div class="mwcalh"><span class="d">${d}</span>${sub?`<span class="sub">${sub}</span>`:''}
    <span class="n">${rows.length}</span></div>
    <div class="mwevs">${rows.length?evs:'<div class="mwempty">Nothing scheduled</div>'}</div></div>`;
}
function apptsSection(){
  const days=[...new Set(fAppts().map(a=>a.d))];
  const hd='<div class="mwsech">Appointments'+fbtn('a')+'</div>'+chips('a');
  return `<div class="mwsec mwband" style="gap:12px">${hd}${days.length?days.map(dayCard).join(''):fEmpty('a','No appointments match these filters')}</div>`;
}
function envCard(e,i){
  const st=ST[e.st][2],rt=envRoute(e),dl=envDocs(e);
  const chip=e.st==='sg'
    ?'<span class="pchip wait ok">'+ic('<path d="m5 13 4 4L19 7"/>','pcic')+'Executed</span>'
    :'';
  const chain=rt.map((s,si)=>{
    let cn='';
    if(si){
      const prev=rt[si-1],pd=prev.every(p=>p.signed),ph=prev.some(p=>p.signed);
      const cd=s.every(p=>p.signed),ch=s.some(p=>p.cur);
      cn='<span class="rcn '+(cd?'done':pd&&ch?'next':pd?'done':ph?'next':'wait')+'"></span>';
    }
    return cn+'<span class="rstep">'+s.map(rav).join('')+'</span>';
  }).join('');
  const all=rt.reduce((a,s)=>a.concat(s),[]),sgn=all.filter(p=>p.signed).length;
  return '<div class="mwdoc '+st+'" style="--i:'+(i||0)+'">'
    +'<div class="mwpaper">'
    +'<div class="pghrow"><span class="pgh">'+e.tx+'</span>'+chip
    +'<span class="pchip docs">'+(dl.length+1)+' docs</span></div>'
    +(e.st==='sg'?'<div class="sigb"><span class="sigink signed">'+e.cl.split(" ")[0]+'</span></div>':'')+'</div>'
    +'<div class="mwdocb"><div class="mwdoct" title="'+e.n+'">'+e.n+'</div>'
    +'<div class="mwdocm"><span class="mwtx">'+e.cl+(ROLES[e.cl]?' · '+ROLES[e.cl]:'')+'</span></div>'
    +'<div class="rcp">'+chain+(sgn>0?'<span class="rct">'+sgn+'/'+all.length+' signed</span>':'')+'</div>'
    +'<div class="mwdocf"><span class="mwdue">Sent '+e.sent+'</span>'
    +'<button class="btn mwact'+(e.st==='you'?' pri':'')+'">'
    +ic(e.st==='you'?P.pen:e.st==='sg'?P.eye:P.bell,'mwic')+ST[e.st][1]+'</button></div></div></div>';
}
function sigGauge(){
  /* always compute against ALL envelopes, not the current filter view */
  const all=ENVS;
  const total=all.length||1;
  const signed=all.filter(e=>e.st==='sg').length;
  const lastWeek=Math.max(0,signed-2); /* prior-week baseline */
  const delta=signed-lastWeek;
  /* half-circle arc: cx=180, cy=150, r=140. Endpoints (40,150) → (320,150), apex (180,10) */
  const R=140, CX=180, CY=150;
  const L=Math.PI*R;
  const pct=signed/total, prevPct=lastWeek/total;
  const ptAt=p=>{const a=Math.PI - p*Math.PI;return[CX+R*Math.cos(a),CY-R*Math.sin(a)];};
  const [hx,hy]=ptAt(pct), [tx,ty]=ptAt(prevPct);
  return '<div class="siggauge">'
    +'<div class="sglbl">Signing progress this week</div>'
    +'<div class="sgnum"><span class="n">'+signed+'</span><span class="d">/ '+total+'</span></div>'
    +'<button class="sgjump" title="Jump to queue" onclick="document.querySelector(\'.mwgh\')?.scrollIntoView({block:\'start\'})">'
    +'<svg viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg></button>'
    +'<div class="sgarc"><svg viewBox="0 0 360 170" preserveAspectRatio="xMidYMid meet">'
    +'<defs><pattern id="sghatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
    +'<line x1="0" y1="0" x2="0" y2="6" stroke="var(--neutral-200)" stroke-width="2"/></pattern></defs>'
    +'<path class="sgtrack" d="M 40 150 A 140 140 0 0 1 320 150"/>'
    +'<path class="sghatch" d="M 40 150 A 140 140 0 0 1 320 150" stroke-dasharray="'+(L*pct)+' '+L+'" stroke-dashoffset="'+(-L*pct)+'"/>'
    +'<path class="sgfill" d="M 40 150 A 140 140 0 0 1 320 150" stroke-dasharray="'+(L*pct)+' '+L+'"/>'
    +'<g class="sgtail" transform="translate('+tx+' '+ty+')"><circle r="9"/><circle class="inner" r="4"/></g>'
    +'<g class="sghead" transform="translate('+hx+' '+hy+')"><circle r="10"/><circle class="inner" r="4.5"/></g>'
    +'</svg><div class="sgcap">'
    +(delta>0?'<b>'+delta+' more signed</b> than last week':delta<0?'<b>'+Math.abs(delta)+' fewer signed</b> than last week':'<b>Steady</b> vs last week')
    +'</div></div></div>';
}
function signList(){
  const rows=fEnvs();
  /* in the tabbed layout the tab already says "Signing queue" — show the count instead of repeating it */
  const ttl='Out for signature<span style="font-family:var(--mono);font-size:11px;font-weight:500;color:var(--neutral-500);background:var(--neutral-100);border-radius:var(--r-badge);padding:1px 6px">'+rows.length+'</span>';
  const hd='<div class="mwsech">'+ttl+fbtn('e')+VIEWTOG()+'</div>'+chips('e');
  if(view==='table')return '<div class="mwsec">'+hd+(rows.length?signTableDense(rows):fEmpty('e','No envelopes match these filters'))+'</div>';
  const grp=(lbl,k)=>{const a=rows.filter(e=>e.st===k);return a.length?'<div class="mwgh'+(k==='you'?' od':'')+'">'+lbl
    +' <span class="n">'+a.length+'</span></div><div class="mwdocs">'+a.map((e,i)=>envCard(e,i)).join('')+'</div>':'';};
  return '<div class="mwsec" style="gap:10px">'+hd
    +grp('Waiting on you','you')+grp('Waiting on the other agent','ag')
    +grp('Waiting on the client','ot')+grp('Signed','sg')+'</div>';
}
/* ---------- v3: dense tables ---------- */
const ORD={over:0,today:1,up:2};
function taskTable(){
  const ids=fTaskIds(null).sort((a,b)=>ORD[TASKS[a].g]-ORD[TASKS[b].g]);
  const hd='<div class="mwsech">Tasks'+fbtn('t')+'</div>'+chips('t');
  if(!ids.length)return '<div class="mwsec">'+hd+fEmpty('t','No tasks match these filters')+'</div>';
  return `<div class="mwsec">${hd}<div class="mwtwrap"><table class="mwtbl"><thead><tr>
    <th style="width:38px"></th><th>Task</th><th>Client</th><th style="width:140px">Due</th><th style="width:130px">Type</th>
    </tr></thead><tbody>${ids.map(i=>{const t=TASKS[i];
      return `<tr data-ti="${i}"${t.done?' style="opacity:.45"':''}>
      <td><span class="mwcb" role="checkbox" aria-checked="${t.done}" tabindex="0">${ic(P.check,'')}</span></td>
      <td style="${t.done?'text-decoration:line-through':''}">${t.t}${t.mel?' '+melBadge():''}</td><td>${link(t.cl)}</td>
      <td class="num"${t.g==='over'?' style="color:var(--status-red)"':''}>${t.due}</td>
      <td><span class="mwty ${t.ty}">${ic(P[t.ty],'mwic mwtyi')}${TY[t.ty]}</span></td></tr>`;}).join('')}
    </tbody></table></div></div>`;
}
function apptTable(){
  const rows=fAppts();
  const hd='<div class="mwsech">Appointments'+fbtn('a')+'</div>'+chips('a');
  if(!rows.length)return '<div class="mwsec">'+hd+fEmpty('a','No appointments match these filters')+'</div>';
  return `<div class="mwsec">${hd}<div class="mwtwrap"><table class="mwtbl"><thead><tr>
    <th style="width:110px">Day</th><th style="width:90px">Time</th>
    <th>Appointment</th><th style="width:150px">Type</th><th>Client</th><th>Location</th>
    </tr></thead><tbody>${rows.map(a=>`<tr>
      <td>${a.d}</td><td class="num">${a.time}</td>
      <td>${a.t}</td><td>${atBadge(a.at)}</td><td>${link(a.cl)}</td><td style="color:var(--neutral-600)">${a.virtual?'Virtual':a.loc}</td></tr>`).join('')}
    </tbody></table></div></div>`;
}
function signTableDense(rows){
  const list=rows||ENVS;
  return `<div class="mwtwrap"><table class="mwtbl"><thead><tr>
    <th>Envelope</th>
    <th style="width:190px">Status</th><th style="width:90px">Sent</th><th style="width:110px"></th>
    </tr></thead><tbody>${list.map(e=>`<tr>
      <td style="padding:7px 12px;height:auto;white-space:normal">
        <div style="font-weight:500;color:var(--neutral-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.n}</div>
        <div class="mwcw" style="margin-top:2px;gap:6px;font-size:12px;color:var(--neutral-500)">${avatar(e.cl)}<span class="mwcln">${e.cl}</span><span style="color:var(--neutral-300)">·</span><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.tx}</span></div>
      </td>
      <td><span class="mwbg ${ST[e.st][2]}">${ST[e.st][0]}</span></td><td class="num">${e.sent}</td>
      <td><button class="btn mwact${e.st==='you'?' pri':''}">${ic(e.st==='you'?P.pen:e.st==='sg'?P.eye:P.bell,'mwic')}${ST[e.st][1]}</button></td></tr>`).join('')}
    </tbody></table></div>`;
}

/* ---------- v2: today-first ---------- */
function v2(){
  const over=openTasks().filter(t=>t.g==='over'),mine=ENVS.filter(e=>e.st==='you');
  const next=APPTS.filter(a=>a.d==='Today').sort((x,y)=>x.m-y.m)[0];
  const mel=melOn?`<div class="mwmel" style="display:none">${ic(P.spark,'mwic')}<span><b style="font-weight:600">${over.length+mine.length} things</b> need you before ${next?next.time:'the day ends'}</span></div>`:'';
  return `${mel}<div class="mwgrid"><div>${apptsSection()}</div><div>${tasksSection()}</div></div>
`;
}

/* ---------- render ---------- */
function tabsFor(){
  if(layout==='v1'||layout==='v2')return [['ta','Tasks &amp; appointments'],['sq','Envelopes']];
  if(layout==='v3')return [['t','Tasks',openTasks().length],['a','Appointments',APPTS.length],['sq','Envelopes',fEnvs().length]];
  return [];
}
function render(){
  const list=tabsFor();
  tabsBar.style.display=list.length?'':'none';
  tabseg.innerHTML=list.map(x=>`<div class="tab${tab===x[0]?' active':''}" data-tab="${x[0]}">${x[1]}${x[2]!=null?` <span class="tcount">${x[2]}</span>`:''}</div>`).join('');
  if(layout==='v2'){body.innerHTML=tab==='sq'?signList():v2();}
  else if(layout==='v1'){body.innerHTML=tab==='sq'?signList():tasksSection()+apptsSection();}
  else{body.innerHTML=tab==='t'?taskTable():tab==='a'?apptTable():signTableDense();}
  pcount.textContent=openCount();
  if(POP){const p=body.querySelector('.mwfpop[data-pop="'+POP+'"]');
    if(p){p.classList.add('open');p.parentNode.querySelector('.mwfbtn').setAttribute('aria-expanded','true');fitPop(p);}else POP=null;}
}
function validTab(){
  const ok=tabsFor().map(x=>x[0]);
  if(ok.length&&!ok.includes(tab))tab=ok[0];
}

/* ---------- interaction ---------- */
const mwPage=document.getElementById('mw-page');
function fClose(restore){
  if(!POP)return;
  if(restore&&SNAP){const s=JSON.parse(SNAP);Object.assign(TF,s.TF);Object.assign(AF,s.AF);Object.assign(EF,s.EF);}
  POP=null;SNAP=null;render();
}
function fitPop(p){
  const btn=p.parentNode.querySelector('.mwfbtn');if(!btn)return;
  const r=btn.getBoundingClientRect(),pad=12;
  const below=window.innerHeight-r.bottom-6-pad, above=r.top-6-pad;
  const up=below<260&&above>below;
  p.classList.toggle('up',up);
  p.style.setProperty('--fpop-max',Math.max(200,Math.min(520,up?above:below))+'px');
}
window.addEventListener('resize',()=>{document.querySelectorAll('.mwfpop.open').forEach(fitPop)});
window.addEventListener('scroll',()=>{document.querySelectorAll('.mwfpop.open').forEach(fitPop)},true);
mwPage.addEventListener('click',e=>{
  const fb=e.target.closest('[data-fpop]');
  if(fb){e.stopPropagation();
    const k=fb.dataset.fpop;
    if(POP===k){fClose(true);return}
    if(POP)fClose(true);
    POP=k;SNAP=JSON.stringify({TF,AF,EF});render();return}
  const pop=e.target.closest('.mwfpop');
  if(pop){e.stopPropagation();
    const k=pop.dataset.pop,S=FS[k];
    const sh=e.target.closest('[data-fsec]');
    if(sh){const key=sh.dataset.fsec,sec=sh.closest('.fsec');
      FSEC[key]=!FSEC[key];sec.classList.toggle('coll',FSEC[key]);sh.setAttribute('aria-expanded',String(!FSEC[key]));return}
    const rd=e.target.closest('[data-fdt]');
    if(rd){const v=rd.dataset.fdt;
      if(S.dt===v){S.dt='';}else{S.dt=v;}
      pop.querySelectorAll('.fopt.rad').forEach(o=>{const on=o.dataset.fdt===S.dt;o.classList.toggle('on',on);o.setAttribute('aria-checked',on)});
      const rg=pop.querySelector('.frange');if(rg)rg.classList.toggle('on',S.dt==='custom');return}
    const o=e.target.closest('.fopt');
    if(o){const arr=S[o.dataset.fk],v=o.dataset.fv,i=arr.indexOf(v);
      i<0?arr.push(v):arr.splice(i,1);
      o.classList.toggle('on',arr.includes(v));o.setAttribute('aria-checked',arr.includes(v));return}
    const sw=e.target.closest('[data-fsw]');
    if(sw){const fk=sw.dataset.fsw;S[fk]=!S[fk];sw.querySelector('.swt').classList.toggle('on',S[fk]);sw.setAttribute('aria-checked',S[fk]);return}
    if(e.target.closest('[data-fclr]')){fclear(k);SNAP=JSON.stringify({TF,AF,EF});render();return}
    if(e.target.closest('[data-fapply]')){POP=null;SNAP=null;render();return}
    return}
  const cx=e.target.closest('[data-cx]');
  if(cx){const [k,key,val]=cx.dataset.cx.split('|');
    const S=FS[k];
    if(key==='done')TF.done=false;
    else if(key==='sg')EF.sg=false;
    else if(key==='dt'){S.dt='';S.from='';S.to='';}
    else{const arr=S[key],i=arr.indexOf(val);if(i>-1)arr.splice(i,1);}
    render();return}
  const ca=e.target.closest('[data-fclrall]');
  if(ca){fclear(ca.dataset.fclrall);render();return}
  const cl=e.target.closest('[data-cl]');
  if(cl){e.preventDefault();return}
  const vt=e.target.closest('[data-view]');
  if(vt){view=vt.dataset.view;render();return}
  const ract=e.target.closest('.mwta[data-act]');
  if(ract){const rrow=ract.closest('[data-ti]');
    if(rrow&&ract.dataset.act==='snooze'){
      if(window.tkOpenSnoozeMenu){e.stopPropagation();window.tkOpenSnoozeMenu(ract,[+rrow.dataset.ti]);}
      else{const t=TASKS[+rrow.dataset.ti];t.due='Tomorrow';t.g='up';t.dt=shiftD(TODAY,1);render();}
    }
    if(rrow&&ract.dataset.act==='done'){e.stopPropagation();const t=TASKS[+rrow.dataset.ti];t.done=true;render();if(window.sonner)sonner('Marked done',t.t);}
    return}
  const gt=e.target.closest('.mwgh.tog[data-grp]');
  if(gt){GOPEN[gt.dataset.grp]=!GOPEN[gt.dataset.grp];render();return}
  const cb=e.target.closest('.mwcb');
  if(cb){const row=cb.closest('[data-ti]');if(row){const i=+row.dataset.ti;TASKS[i].done=!TASKS[i].done;render();}return}
  const tb=e.target.closest('.tab[data-tab]');
  if(tb){tab=tb.dataset.tab;render();return}
  const master=e.target.closest('[data-master]');
  if(master){const tbl=master.closest('table');tbl.querySelectorAll('.mwsel').forEach(c=>c.checked=master.checked);return}
  const act=e.target.closest('.mwact');
  if(act){e.preventDefault();return}
});
document.getElementById('mw-page').addEventListener('keydown',e=>{
  if(e.key==='Escape'&&POP){fClose(true);return}
  const fo=e.target.closest('.fopt,[data-fsw]');
  if(fo&&(e.key===' '||e.key==='Enter')){e.preventDefault();fo.click();return}
  if(e.key!==' '&&e.key!=='Enter')return;
  const gk=e.target.closest('.mwgh.tog[data-grp]');
  if(gk){e.preventDefault();gk.click();return}
  const cb=e.target.closest('.mwcb');if(!cb)return;
  e.preventDefault();cb.click();
});
mwPage.addEventListener('input',e=>{
  const di=e.target.closest('[data-fdt2]');
  if(di){const pop=di.closest('.mwfpop'),S=pop.dataset.pop==='t'?TF:AF;
    S[di.dataset.fdt2]=di.value;S.dt='custom';return}
  const s=e.target.closest('[data-fsrch]');if(!s)return;
  const q=s.value.trim().toLowerCase();
  s.closest('.mwfpop').querySelectorAll('.fopts.scr .fopt').forEach(o=>{
    o.style.display=o.dataset.fv.toLowerCase().includes(q)?'':'none';});
});
document.addEventListener('click',e=>{if(POP&&!e.target.closest('.mwfw'))fClose(true)});
/* + Create new */
const newBtn=document.getElementById('mw-newbtn'),newMenu=document.getElementById('mw-ncmenu');
newBtn.addEventListener('click',e=>{newMenu.classList.toggle('open');e.stopPropagation()});
document.addEventListener('click',e=>{if(!e.target.closest('.ncwrap'))newMenu.classList.remove('open')});

/* expose for reuse in Tasks side sheet — one source of truth */
window.mwTaskRow=taskRow;
window.mwMelBadge=melBadge;
window.mwTASKS=TASKS;
window.mwTY=TY;
window.mwLink=link;
window.mwRerender=render;
/* tweak hooks */
window.__applyLayout=v=>{layout=['v1','v2','v3'].includes(v)?v:'v1';validTab();render();};
window.__applyMelLine=v=>{melOn=v!=='off';render();};
window.__applyDensity=v=>{document.body.classList.toggle('mw-compact',v==='compact');};
render();
})();
