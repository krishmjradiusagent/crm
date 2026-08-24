

/* ---------- global photo-avatar hover preview ----------
   Shared across both pages (agent/client/collaborator/profile avatars). Only triggers
   when the hovered avatar actually contains a real <img> (a loaded photo) — initials-only
   fallback avatars have no <img> in the DOM at all, so they're skipped automatically. */
(function(){
  const prev=document.createElement('div');
  prev.className='avpreview';
  document.body.appendChild(prev);
  function place(anchorEl){
    const r=anchorEl.getBoundingClientRect();
    prev.style.left=Math.min(r.left,window.innerWidth-88)+'px';
    prev.style.top=(r.bottom+8)+'px';
    prev.classList.add('on');
    const pr=prev.getBoundingClientRect();
    if(pr.bottom>window.innerHeight-8)prev.style.top=(r.top-pr.height-8)+'px';
    if(pr.right>window.innerWidth-8)prev.style.left=(window.innerWidth-pr.width-8)+'px';
  }
  document.addEventListener('mouseover',e=>{
    const holder=e.target.closest('.agav,.avatar,.pav');
    if(!holder)return;
    const img=holder.querySelector('img');
    if(!img||!img.getAttribute('src'))return;
    prev.innerHTML=`<img src="${img.getAttribute('src')}" alt="">`;
    place(holder);
  });
  document.addEventListener('mouseout',e=>{
    const holder=e.target.closest('.agav,.avatar,.pav');
    if(!holder)return;
    if(holder.contains(e.relatedTarget))return;
    prev.classList.remove('on');
  });
  window.addEventListener('scroll',()=>prev.classList.remove('on'),true);
})();

(function(){
const root=document.getElementById('tx-page');
/* ---------- data ---------- */
/* ---------- status model ----------
   Statuses are per-side: a listing moves through market states, a buyer/tenant side moves
   through offer states, a referral has its own short set. Colour encodes the FAMILY the
   status belongs to (lead / paperwork / pre-market / live / offer / executed / in-flight /
   closed / dead), so ten statuses read at a glance without ten unrelated hues.
   [badge-bg, badge-fg, dot] */
const STFAM={
 prospect:['#fdf2f8','#9d174d','#db2777'],
 paper:['#eef0ff','#3730a3','#5a5ff2'],
 premarket:['#f7f8e2','#4d7c0f','#84a12a'],
 live:['#eaf6e4','#3f6212','#6da544'],
 offer:['#e6f6f3','#0f766e','#0f766e'],
 executed:['#eaf4f6','#155e75','#155e75'],
 pending:['#eff6ff','#1d4ed8','#2563eb'],
 closed:['var(--neutral-100)','var(--neutral-700)','#a3a3a3'],
 dead:['#fdf0ef','#9f1239','#dc2626'],
 incomplete:['#fdf3e3','#92400e','#ea580c']
};
const STATUS_FAM={
 'Prospect':'prospect','Listing agreement signed':'paper','Coming soon':'premarket',
 'Active on market':'live','Back on market':'live',
 'Listing canceled':'dead','Listing expired':'dead',
 'New offer':'offer','Pending signature':'paper','Executed':'executed',
 'Submitted to listing agent':'executed','Offer rejected':'dead','Offer withdrawn':'dead',
 'Pre-pending':'pending','Pending':'pending','In escrow':'pending',
 'Closed':'closed','Void':'dead'
};
const stFam=s=>STFAM[STATUS_FAM[s]||'closed'];
const stDot=s=>stFam(s)[2];
const SIDE=t=>t==='Referral'?'referral':(t==='Buyer'||t==='Tenant')?'buyer':t==='Seller & Buyer'?'dual':'listing';
/* what the status dropdown offers, by side */
const ST_SET={
 listing:['Prospect','Listing agreement signed','Coming soon','Active on market','Back on market','Pending','In escrow','Closed','Listing canceled','Listing expired','Void'],
 buyer:['New offer','Pending signature','Executed','Submitted to listing agent','Pending','In escrow','Closed','Offer rejected','Offer withdrawn','Void'],
 dual:['Prospect','Listing agreement signed','Coming soon','Active on market','New offer','Pending signature','Executed','Pending','In escrow','Closed','Listing canceled','Void'],
 referral:['Pre-pending','Pending','In escrow','Closed','Void']
};
/* [address, city, type, client, private(0/1), price|null, stageIdx, agent, acceptanceDate|null, commission|null, coe|null, incomplete(0/1), missing] */
const data=[
["5670 Kearny Mesa Road, Suite 210","San Diego","Seller & Buyer","Nora Zeglaya",0,"$1,450,000",2,"Emily Robinson","07/23/2026",null,"07/23/2026",0,""],
["275 Miramar Avenue, Apt 4B","San Francisco","Buyer","Samuel Stewart",1,"$100,000",2,"Daniel Scott","07/23/2026",null,"07/23/2026",0,""],
["5670 Kearny Mesa Road, Suite 210","San Diego","Seller","Penelope Hernandez",0,"$1,450,000",2,"Emily Robinson","07/23/2026",null,"07/23/2026",0,""],
["5670 Kearny Mesa Road, Suite 210","San Diego","Seller","Aiden Brown",0,"$1,450,000",2,"Emily Robinson","07/23/2026",null,"07/23/2026",0,""],
["5670 Kearny Mesa Road, Suite 210","San Diego","Seller","William Sanchez",0,"$1,450,000",2,"Emily Robinson","07/23/2026",null,"07/23/2026",0,""],
["789 West Harbor Drive, Suite 1500","San Diego","Landlord","Evelyn Bell",0,null,1,"Donald Scott","07/23/2026",null,null,0,""],
["Referral","—","Referral","Client name",1,null,3,"Ashutosh iOSacc","07/23/2026",null,null,0,""],
["2345 Fair Oaks Boulevard, Unit 12","Sacramento","Buyer","Andrew Timeline",1,null,2,"Ashutosh iOSacc",null,null,null,1,"Missing: acceptance date, purchase price"],
["Referral","—","Referral","test docume",1,"$700,000",2,"Ashutosh iOSacc",null,null,"07/01/2026",0,""],
["Referral","—","Referral","sdfsad dasf",1,"$500,000",2,"Aashin R. Ironman",null,null,"07/01/2026",0,""],
["6270 Houston Avenue, Apt A","Hanford","Tenant","—",1,null,2,"Ashutosh iOSacc",null,null,null,1,"Missing: client name, acceptance date"],
["1420 Ocean Front Walk, Apt 3","Santa Monica","Buyer","Marcus Webb",0,"$2,150,000",4,"Michael Allen","06/12/2026","$32,250","08/02/2026",0,""],
["88 King Street, Suite 900","San Francisco","Seller","Priya Anand",0,"$980,000",0,"Emily Robinson",null,null,null,0,""],
["502 Cedar Ridge Court","Napa","Seller","Grace Lee",0,"$3,400,000",1,"Donald Scott",null,null,null,0,""],
["77 Bunker Hill Ave, Apt 705","Los Angeles","Buyer","Tom Reilly",0,"$610,000",5,"Daniel Scott","03/02/2026","$12,200","04/18/2026",0,""],
["215 Marina Blvd, Apt 2A","San Diego","Buyer","Isabella Rossi",0,"$1,120,000",5,"Emily Robinson","02/14/2026","$16,800","03/29/2026",0,""],
["9 Willow Creek Lane","Fresno","Seller","Owen Foster",0,"$425,000",6,"Michael Allen","01/05/2026","$8,500","02/20/2026",0,""],
["360 Highland Drive, Apt 8","Sacramento","Landlord","Sofia Nguyen",0,null,0,"Aashin R. Ironman",null,null,null,0,""],
["48 Bayview Terrace, Apt 6C","Oakland","Buyer","Liam Carter",0,"$875,000",4,"Emily Robinson","06/28/2026","$13,125","08/14/2026",0,""],
["1300 Sunset Blvd, Suite 400","Los Angeles","Seller","Maya Patel",0,"$2,800,000",4,"Donald Scott","06/30/2026","$42,000","08/20/2026",0,""],
["245 Lombard Street, Unit 11","San Francisco","Seller & Buyer","Derek Chan",0,"$1,875,000",4,"Emily Robinson","05/14/2026","$28,125","07/02/2026",0,""],
["3390 Peachtree Lane","Irvine","Buyer","Hannah Wu",0,"$960,000",3,"Daniel Scott","07/01/2026",null,"08/22/2026",0,""],
["12 Vista Del Mar","La Jolla","Seller","Robert Kim",0,"$4,200,000",0,"Donald Scott",null,null,null,0,""],
["560 Alamo Square, Apt 3D","San Francisco","Buyer","Ines Torres",0,"$1,340,000",3,"Michael Allen","06/20/2026",null,"08/05/2026",0,""],
["78 Willow Glen Rd, Apt 2","San Jose","Landlord","Carlos Mendez",0,null,1,"Aashin R. Ironman",null,null,null,0,""],
["901 Rodeo Drive, Suite 120","Beverly Hills","Seller","Natalie Brooks",1,"$3,900,000",4,"Emily Robinson","04/02/2026","$58,500","06/18/2026",0,""],
["44 Shoreline Ct, Apt 14","Long Beach","Buyer","Jason Park",0,"$540,000",5,"Daniel Scott","01/28/2026","$10,800","03/10/2026",0,""],
["220 Vine Street, Apt 5B","Hollywood","Tenant","—",0,null,2,"Emily Robinson",null,null,null,1,"Missing: client name, purchase price"],
["Referral","—","Referral","Priyanka Rao",1,"$450,000",2,"Aashin R. Ironman",null,null,"06/28/2026",0,""],
["19 Cliffside Ave","Malibu","Seller","Wendy Ford",0,"$5,600,000",1,"Donald Scott",null,null,null,0,""],
["670 Bridgeway, Suite 210","Sausalito","Buyer","George Ellis",0,"$1,980,000",4,"Michael Allen","06/02/2026","$29,700","07/20/2026",0,""],
["1500 Elm Court","Fresno","Seller","Diane Reyes",0,"$390,000",6,"Emily Robinson","12/12/2025","$7,800","01/22/2026",0,""],
["8 Presidio Terrace","San Francisco","Seller","Victor Huang",0,"$6,200,000",0,"Donald Scott",null,null,null,0,""],
["302 Ocean Ave, Apt 9","Santa Cruz","Buyer","Amanda Cole",0,"$725,000",3,"Daniel Scott","06/26/2026",null,"08/09/2026",0,""],
["150 Grand Ave, Suite 305","Oakland","Landlord","Felix Grant",0,null,0,"Aashin R. Ironman",null,null,null,0,""],
["9200 Wilshire Blvd, Suite 780","Beverly Hills","Buyer","Monica Delgado",1,"$2,650,000",4,"Emily Robinson","05/30/2026","$39,750","07/15/2026",0,""],
["44 Almaden Blvd, Apt 1802","San Jose","Seller","Trevor James",0,"$1,050,000",5,"Michael Allen","02/02/2026","$15,750","03/18/2026",0,""],
["Referral","—","Referral","Bianca Ortiz",1,null,3,"Ashutosh iOSacc","07/05/2026",null,null,0,""],
["4534 Adam Road, Unit 2","Simi Valley","Buyer","Ryan Kessler",0,"$680,000",0,"Daniel Scott",null,null,null,0,""],
["77 Laurel Street","Pasadena","Seller","Helen Vasquez",0,"$1,150,000",0,"Michael Allen",null,null,null,0,""],
["3243 Pumpherston Way, Apt 7","San Jose","Tenant","Aaron Boyd",1,null,0,"Aashin R. Ironman",null,null,null,0,""],
["6270 Houston Avenue, Apt B","Hanford","Landlord","Nina Kaur",0,null,0,"Donald Scott",null,null,null,0,""],
["#420, 999 North Pacific Street","Oceanside","Tenant","Ranjith Menon",0,null,0,"Ashutosh iOSacc",null,null,null,0,""],
["1010 Bay Ridge Court","Sacramento","Buyer","Elena Ford",0,"$780,000",0,"Emily Robinson","07/18/2026",null,null,0,""]
];
/* the seed rows carry a legacy stage index — resolve it into a real per-side status once,
   then column 6 holds the status name for the rest of the prototype's life. */
const LEG={
 listing:['Active on market','Coming soon','Pending','Listing agreement signed','In escrow','Closed','Listing expired','Listing canceled'],
 dual:['Active on market','Coming soon','Pending','Listing agreement signed','In escrow','Closed','Listing expired','Listing canceled'],
 buyer:['New offer','Pending signature','Pending','Submitted to listing agent','In escrow','Closed','Offer withdrawn','Offer rejected'],
 referral:['Pre-pending','Pre-pending','Pending','Pre-pending','In escrow','Closed','Void','Void']
};
const ST_OVR={5:'Coming soon',7:'Pending signature',10:'New offer',12:'Active on market',17:'Active on market',21:'Executed',22:'Prospect',23:'Submitted to listing agent',24:'Listing agreement signed',27:'Pending',29:'Back on market',32:'Prospect',33:'Submitted to listing agent',34:'Listing expired',38:'Offer rejected',39:'Listing canceled',40:'Void',41:'Back on market',42:'New offer',43:'Executed'};
data.forEach((r,i)=>{
  if(typeof r[6]==='string')return;
  r[6]=ST_OVR[i]||((r[6]>=6&&r[9])?'Closed':LEG[SIDE(r[2])][r[6]]);
});
const ini=n=>n==='—'?'—':n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const agtone={"Emily Robinson":["#e0e7ff","#3730a3"],"Daniel Scott":["#dcfce7","#166534"],"Donald Scott":["#fef9c3","#854d0e"],"Michael Allen":["#fce7f3","#9d174d"],"Ashutosh iOSacc":["#e5e5e5","#404040"],"Aashin R. Ironman":["#dbeafe","#1d4ed8"]};
const agImg={"Emily Robinson":"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Donald Scott":"https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Aashin R. Ironman":"https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop"};
const clientTone=["#eff3ff","#edfdf3","#fef9e3","#fdf3f9","#edf4fe","#f9f3ff","#fff1f2","#e5fdf8","#fefce1","#eff8fe"];
const clientImgTx={"Marcus Webb":"https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Grace Lee":"https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop"};
const avImg=(n,map)=>map[n]?`<img src="${map[n]}" alt="" onerror="this.remove()">`:'';
const tb=document.getElementById('tx-tb');
/* Fix 2 (Krish review): dates render short ("Jul 23"), year only when it isn't the prototype's
   current year — never the full "07/23/2026" that was truncating to "07/2..." in narrow columns. */
const MONTHS_TX=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CUR_YEAR_TX=2026;
function shortDate(mdY){
  if(!mdY)return null;
  const [m,d,y]=mdY.split('/').map(Number);
  return MONTHS_TX[m-1]+' '+d+(y!==CUR_YEAR_TX?', '+y:'');
}

/* ---------- missing-details model ----------
   Required fields are derived from the row itself, in transaction-form order, so the
   warning, tooltip, popover and tab count can never disagree with the table. */
const ME_TX='Ashutosh iOSacc';
const FIELDS={
  client:{label:'Client name',col:3,type:'text',ph:'Full name'},
  acc:{label:'Acceptance date',col:8,type:'date'},
  price:{label:'Purchase price',col:5,type:'money'}
};
const FORM_ORDER=['client','acc','price'];
const deletedTx=new Set();
const CS_TIP='Additional details are missing in the coversheet \u2014 fill them in to move this transaction forward.';
const SUGGEST={acc:{raw:'07/23/2026',iso:'2026-07-23'}};
function missingOf(i){
  const r=data[i];
  if(!r||!r[11])return[];
  return FORM_ORDER.filter(k=>{const v=r[FIELDS[k].col];return !v||v==='—'});
}
function consLine(m){
  if(m.length>=3)return "This deal can't close until these are added.";
  const key=['price','acc','client'].find(k=>m.includes(k));
  const lead={price:"Commission won't calculate until",acc:"The escrow timeline won't start until",client:"The portal invite can't go out until"}[key];
  return lead+(m.length>1?' these are added.':" it's added.");
}
let tabTx='Pending';
let qTx='';
/* Tab predicates. Stage names: Active listing, Coming soon, Pending, Pre-escrow, In escrow, Closed, Archived, Withdrawn.
   Drafts = everything that hasn't reached Active or Pending yet (Coming soon / Pre-escrow). */
const DEAD=['Closed','Void','Listing canceled','Listing expired','Offer rejected','Offer withdrawn'];
const TAB_PRED={
  'Pending':i=>['Pending','In escrow'].includes(data[i][6]),
  'Closing soon':i=>{const r=data[i];return !!r[10]&&!DEAD.includes(r[6])},
  'Active listings':i=>['Active on market','Back on market'].includes(data[i][6]),
  'Referrals':i=>data[i][2]==='Referral',
  'Closed':i=>data[i][6]==='Closed',
  'Drafts':i=>['Prospect','Listing agreement signed','Coming soon','New offer','Pending signature','Executed','Submitted to listing agent','Pre-pending'].includes(data[i][6]),
  'All':()=>true
};
/* Search spans agents, clients (incl. co-parties), and the transaction itself
   (address, city, type, representation, status, price). */
function searchHayTx(i){
  const r=data[i],parties=PARTIES[r[3]]||[r[3]];
  return [r[0],r[1],r[2],TXTYPE[r[2]]||'',r[3],...parties,r[5]||'',r[6],r[7]].join(' ').toLowerCase();
}
/* ---------- scope: whose transactions the table shows ---------- */
const TEAM_TX=['Emily Robinson','Daniel Scott','Michael Allen','Donald Scott','Aashin R. Ironman'];
const GROUPS_TX=[
  {n:'Downtown listings',m:['Emily Robinson','Daniel Scott']},
  {n:'Relocation desk',m:['Michael Allen','Donald Scott']},
  {n:'Luxury waterfront',m:['Emily Robinson','Aashin R. Ironman','Michael Allen']}
];
let TXSCOPE={kind:'all',sel:[],groups:[]};
function txScopeNames(){
  const out=TXSCOPE.sel.slice();
  TXSCOPE.groups.forEach(gn=>{
    const g=GROUPS_TX.find(x=>x.n===gn);
    if(g)g.m.forEach(n=>{if(!out.includes(n))out.push(n)});
  });
  return out;
}
const txInScope=i=>{
  const ag=data[i][7];
  if(TXSCOPE.kind==='my')return ag===ME_TX;
  if(TXSCOPE.kind==='assoc')return txScopeNames().includes(ag);
  return true;
};
function txNameKey(n){return String(n||'').toLowerCase()}
function visibleRowsTx(){
  let rows=data.map((r,i)=>i).filter(i=>!deletedTx.has(i)).filter(txInScope);
  if(tabTx==='Needs attention')rows=rows.filter(i=>missingOf(i).length).sort((a,b)=>missingOf(b).length-missingOf(a).length);
  else rows=rows.filter(TAB_PRED[tabTx]||(()=>true));
  if(window._txPassF)rows=rows.filter(window._txPassF);
  if(window._txColF)rows=rows.filter(window._txColF);
  if(qTx){
    const terms=qTx.split(/\s+/).filter(Boolean);
    rows=rows.filter(i=>{const hay=searchHayTx(i);return terms.every(t=>hay.includes(t))});
  }
  if(tabTx==='Closing soon')rows.sort((a,b)=>{const k=s=>s.slice(6)+s.slice(0,2)+s.slice(3,5);return k(data[a][10])<k(data[b][10])?-1:1});
  if(window._txPriceSort){const dir=window._txPriceSort==='asc'?1:-1;rows.sort((a,b)=>{const pa=moneyOf(data[a][5]),pb=moneyOf(data[b][5]);if(pa==null&&pb==null)return 0;if(pa==null)return 1;if(pb==null)return -1;return (pa-pb)*dir})}
  if(window._txClientSort){const d=window._txClientSort==='desc'?-1:1;rows.sort((a,b)=>{const ka=txNameKey(data[a][3]),kb=txNameKey(data[b][3]);return ka<kb?-1*d:ka>kb?1*d:0})}
  return rows;
}

/* Transaction type is the deal itself (sale / lease / referral); representation is which
   side we hold — they are separate fields, and a deal can hold both sides. */
const TXTYPE={Seller:'Sale',Buyer:'Sale','Seller & Buyer':'Sale',Landlord:'Lease',Tenant:'Lease',Referral:'Referral'};
const TXCONTRACT={Sale:'Nor Cal Standard Residential Purchase',Lease:'Residential Lease Agreement',Referral:'Broker Referral Agreement'};
/* A side can have more than one principal (co-owners, married buyers, trusts). */
const PARTIES={
 'Nora Zeglaya':['Nora Zeglaya','James Collins','Marcus Webb'],
 'Aiden Brown':['Aiden Brown','Priya Brown'],
 'Derek Chan':['Derek Chan','Amy Chan'],
 'Maya Patel':['Maya Patel','Rohan Patel']
};
/* how each additional principal relates to the primary client on the side */
const PARTY_ROLE={
 'James Collins':'Spouse','Marcus Webb':'Father',
 'Priya Brown':'Spouse',
 'Amy Chan':'Mother',
 'Rohan Patel':'Father'
};
const sideWord=ty=>ty==='Buyer'?'buyer':ty==='Seller'?'seller':ty==='Lease'?'tenant':'client';
/* Auditing + checklist + collaboration are derived from the transaction's stage so the
   table stays internally consistent (a closed deal can't have an unstarted audit). */
/* pale-bg / dark-fg of the status family's own hue — the badge carries the state, no dot needed */
const STTINT=Object.fromEntries(Object.keys(STATUS_FAM).map(k=>[k,stFam(k).slice(0,2)]));
const AUDIT=[['\u2014','none'],['Not started','ns'],['In review','rev'],['Complete','ok']];
const AUDIT_LIVE=['Pending','In escrow','Pre-pending'];
function auditOf(i){const r=data[i];if(!r)return AUDIT[0];const st=r[6];if(st==='Closed')return AUDIT[3];if(!AUDIT_LIVE.includes(st))return AUDIT[0];return AUDIT[1+((i*7+r[0].length)%3)];}
function openItemsOf(i){const k=auditOf(i)[1];if(k==='ok')return 0;if(k==='none')return missingOf(i).length;const n=(data[i][0].length*3+i*5)%48;return k==='rev'?Math.max(1,n%18):n;}
function commentsOf(i){return (i*5+data[i][3].length)%5}
function auditCommentsOf(i){return (i*3+data[i][0].length)%4}
const AUDIT_NOTES=['Compliance flagged a missing signature.','Commission split needs a second review.','Audit cleared — all docs verified.','Broker requested the CDA before release.'];
/* Commission breakdown: Confirmed → Pending approval (one party at a time) → Completed.
   Derived from the row, so badge, filter and popover can never disagree. */
const CB_PARTIES=['Team lead','Agent','Group lead','Auditor'];
function cbStateOf(i){
  const r=data[i];if(!r)return['Confirmed','conf',null];
  if(r[6]==='Closed')return['Completed','done',null];
  return ((r[0].length*5+i*3)%7)<2?['Confirmed','conf',null]:['Pending approval','pend',CB_PARTIES[(i+r[3].length)%4]];
}
const cbTokens=i=>{const s=cbStateOf(i);return s[1]==='pend'?['Pending','p:'+s[2]]:[s[0]]};
const COLLAB_POOL=[['Dana Ruiz','T.C.','#dcfce7','#166534','https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop'],['Tim Cho','Lender','#e0e7ff','#3730a3','https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop'],['Rosa Lee','Assistant','#fef9c3','#854d0e'],['Ken Adams','Vendor','#fce7f3','#9d174d'],['Mia Park','Home inspector','#e5e5e5','#404040','https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop']];
function collabsOf(i){const n=1+((i*3+data[i][3].length)%5);const out=[];for(let k=0;k<n;k++)out.push(COLLAB_POOL[(i+k)%COLLAB_POOL.length]);return out;}
const CMT_NOTES=['Counteroffer sent \u2014 waiting on the listing side.','Buyer wants the inspection moved to Friday.','Disclosure packet is short one page.','Lender confirmed funding date.'];
function renderTable(){
  tb.innerHTML='';
  visibleRowsTx().forEach(idx=>{
    const r=data[idx];
    const [addr,city,ty,client,priv,price,st,ag,acc,comm,coe,incomplete,missing]=r;
    const isReferral=ty==='Referral';
    const parties=PARTIES[client]||[client];
    const payload=encodeURIComponent(JSON.stringify({addr:isReferral?('Referral — '+client):addr,city:isReferral?'':city,price,comm,coe:shortDate(coe),coeD:(coe?coe.slice(6)+'-'+coe.slice(0,2)+'-'+coe.slice(3,5):null),acc:shortDate(acc),client,parties,rep:isReferral?'—':ty,txtype:TXTYPE[ty]||'—',txcontract:TXCONTRACT[TXTYPE[ty]]||'—',ag,st,stc:stDot(st),priv}));
    const addrCell=isReferral
      ? `<span class="name" data-txd="${payload}" onclick="openTxDetail(this)">Referral — ${client}</span>`
      : `<span class="name" data-txd="${payload}" onclick="openTxDetail(this)">${addr}</span><span class="addrcity">${city}</span>`;
    const miss=missingOf(idx);
    const csHint=miss.length?`<span class="cshint" data-mi="${idx}" tabindex="0" role="img" aria-label="${CS_TIP} On ${isReferral?'referral — '+client:addr}."><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/></svg></span>`:'';
    const stcolor=stDot(st);
    /* an incomplete row still has a real status — the amber overlay says the coversheet
       is short, it does not replace the stage the deal is actually in */
    const sttext=incomplete?('Incomplete - '+st):st;
    const sttint=incomplete?STFAM.incomplete.slice(0,2):(STTINT[st]||['var(--neutral-100)','var(--neutral-600)']);
    tb.insertAdjacentHTML('beforeend',`<tr>
      <td data-c="_sel"><input type="checkbox" class="rc"></td>
      <td data-c="Address" title="${isReferral?client:addr+', '+city}">${addrCell}${csHint}${'<button type="button" class="lock'+(priv?'':' lock--open')+'" aria-label="'+(priv?'Private transaction. Make visible.':'Make transaction private.')+'" title="'+(priv?'Private — only you can see this. Click to make it visible.':'Visible to your team. Click to make it private.')+'" onclick="'+(priv?'requestUnlock':'requestLock')+'(event,'+idx+')" data-noswap><svg viewBox="0 0 24 24" aria-hidden="true" data-noswap><rect x="3" y="11" width="18" height="11" rx="2"/><path class="shk" d="M7 11V7a5 5 0 0 1 10 0v4"/><path class="shko" d="M7 11V7a5 5 0 0 1 9.9-1"/></svg></button>'}</td>
      <td data-c="Representation">${isReferral?'<span class="badge rep" data-rep="Referral">Referral</span>':'<span class="badge rep" data-rep="'+ty+'">'+ty+'</span>'}</td>
      <td data-c="Client" class="sub" title="${parties.join(', ')}">${client==='—'?'<span class="em">—</span>':`<span class="agcell"><span class="agav" style="background:${clientTone[idx%clientTone.length]};color:#404040">${ini(client)}${avImg(client,clientImgTx)}</span>${client}${parties.length>1?'<button type="button" class="pmoreb" data-noswap onclick="openPartiesPop(event,'+idx+')" aria-haspopup="dialog" aria-expanded="false" aria-label="'+parties.length+' '+sideWord(ty)+'s \u2014 view relationships"><span class="pmore" data-noswap>+'+(parties.length-1)+'</span><svg class="pchev" viewBox="0 0 24 24" aria-hidden="true" data-noswap><path d="m6 9 6 6 6-6"/></svg></button>':''}</span>`}</td>
      <td data-c="Price" class="mono">${price||'<span class="em">—</span>'}</td>
      <td data-c="Status"><span class="stwrap"><span class="tt stcell" onclick="openStatusPop(event,${idx})"><span class="aud" data-st="${idx}" style="background:${sttint[0]};color:${sttint[1]}">${sttext}<svg class="stcar" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></span></span></td>
      <td data-c="Agent" class="sub"><span class="agcell"><span class="agav" style="background:${agtone[ag][0]};color:${agtone[ag][1]}">${ini(ag)}${avImg(ag,agImg)}</span>${ag.split(' ')[0]} ${ag.split(' ')[1]||''}</span></td>
      <td data-c="Acceptance date" class="mono sub">${shortDate(acc)||'<span class="em">—</span>'}</td>
      <td data-c="Commission" class="mono">${comm||'<span class="em">—</span>'}</td>
      <td data-c="Commission breakdown">${(()=>{const s=cbStateOf(idx);return '<button type="button" class="cbb cbb--'+s[1]+'" data-noswap onclick="openCbPop(event,'+idx+')" aria-haspopup="dialog" title="Open commission breakdown">'+s[0]+(s[2]?'<i>'+s[2]+'</i>':'')+'</button>'})()}</td>
      <td data-c="Close of escrow" class="mono sub">${shortDate(coe)||'<span class="em">—</span>'}</td>
      <td data-c="Auditing status">${(()=>{const a=auditOf(idx);return a[1]==='none'?'<span class="em">\u2014</span>':'<span class="aud aud--'+a[1]+'">'+a[0]+'</span>'})()}</td>
      <td data-c="Incomplete items">${(()=>{const n=openItemsOf(idx);return '<span class="icnt'+(n?'':' zero')+'" title="'+(n?n+' open checklist item'+(n>1?'s':''):'No open checklist items')+'">'+n+'</span>'})()}</td>
      <td data-c="Comments">${(()=>{const n=commentsOf(idx),a=auditCommentsOf(idx);const tx='<button type="button" class="cmt'+(n?' has':'')+'" data-noswap onclick="openCmtPop(event,'+idx+',\'tx\')" aria-label="'+(n?n+' transaction comment'+(n>1?'s':''):'No transaction comments')+'" title="Transaction comments"><svg viewBox="0 0 24 24" aria-hidden="true" data-noswap><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>'+(n||'')+'</button>';const au='<button type="button" class="cmt'+(a?' has':'')+'" data-noswap onclick="openCmtPop(event,'+idx+',\'audit\')" aria-label="'+(a?a+' auditing comment'+(a>1?'s':''):'No auditing comments')+'" title="Transaction auditing comments"><svg viewBox="0 0 24 24" aria-hidden="true" data-noswap><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M10 8H8v2a2 2 0 0 0 2 2"/><path d="M15 8h-2v2a2 2 0 0 0 2 2"/></svg>'+(a||'')+'</button>';return '<span class="cmtwrap" style="display:inline-flex;gap:2px;align-items:center">'+tx+au+'</span>'})()}</td>
      <td data-c="Collaborators">${(()=>{const c=collabsOf(idx);const st=c.slice(0,3).map(p=>'<span class="cav" data-noswap>'+(p[4]?'<img src="'+p[4]+'" alt="" onerror="this.remove()">':ini(p[0]))+'</span>').join('');const more=c.length>3?'<span class="cmore" data-noswap>+'+(c.length-3)+'</span>':'';return '<button type="button" class="collabg" data-noswap onclick="openCollabPop(event,'+idx+')" aria-haspopup="dialog" aria-label="'+c.length+' collaborator'+(c.length===1?'':'s')+' \u2014 view roles">'+st+more+'<svg class="cchev" viewBox="0 0 24 24" aria-hidden="true" data-noswap><path d="m6 9 6 6 6-6"/></svg></button>'})()}</td>
      <td data-c="_menu"><span class="rowmenu" onclick="openRowMenu(event,${idx})">⋯</span></td>
    </tr>`);
  });
  root.querySelectorAll('.rc').forEach(c=>c.addEventListener('change',sync));
  if(window.applyColOrderTx)window.applyColOrderTx();
  const _pc=document.getElementById('tx-pcount');if(_pc)_pc.textContent=visibleRowsTx().length;
  const nct=document.getElementById('tx-nact-ct');
  if(nct)nct.textContent=data.filter((r,i)=>missingOf(i).length).length;
}

/* ---------- selection ---------- */
const bar=document.getElementById('tx-selbar'),cnt=document.getElementById('tx-selcount');
function sync(){
  const boxes=[...root.querySelectorAll('.rc')];
  const n=boxes.filter(c=>c.checked).length;
  bar.classList.toggle('on',n>0);
  cnt.textContent=n+' selected';
  boxes.forEach(c=>c.closest('tr').classList.toggle('selected',c.checked));
}
renderTable();
document.getElementById('tx-all').addEventListener('change',e=>{root.querySelectorAll('.rc').forEach(c=>c.checked=e.target.checked);sync()});
function clearSelTx(){root.querySelectorAll('.rc,#tx-all').forEach(c=>c.checked=false);sync()}

/* ---------- coversheet tooltip: read-only tip, 300ms delay, instant on a second hover ---------- */
const warnTip=document.createElement('div');warnTip.className='warntip';
warnTip.id='tx-cstip';warnTip.setAttribute('role','tooltip');
document.body.appendChild(warnTip);
let tipT=null,tipLeftAt=0;
function showCsTip(ic,instant){
  warnTip.textContent=CS_TIP;
  warnTip.classList.toggle('instant',!!instant);
  const r=ic.getBoundingClientRect();
  warnTip.classList.add('on');
  warnTip.style.left=Math.max(8,Math.min(r.left-4,window.innerWidth-warnTip.offsetWidth-12))+'px';
  warnTip.style.top=(r.bottom+6)+'px';
}
function hideCsTip(){clearTimeout(tipT);if(warnTip.classList.contains('on'))tipLeftAt=Date.now();warnTip.classList.remove('on')}
root.addEventListener('mouseover',e=>{
  const ic=e.target.closest('.cshint');
  if(!ic)return;
  clearTimeout(tipT);
  /* adjacent hint within 500ms opens with no delay and no animation — feels faster,
     without giving up the delay that stops accidental flashes */
  if(Date.now()-tipLeftAt<500)return showCsTip(ic,true);
  tipT=setTimeout(()=>showCsTip(ic,false),300);
});
root.addEventListener('mouseout',e=>{
  const ic=e.target.closest('.cshint');
  if(!ic||ic.contains(e.relatedTarget))return;
  hideCsTip();
});
root.addEventListener('focusin',e=>{const ic=e.target.closest('.cshint');if(ic)showCsTip(ic,true)});
root.addEventListener('focusout',e=>{if(e.target.closest('.cshint'))hideCsTip()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideCsTip()});
window.addEventListener('scroll',()=>hideCsTip(),true);

/* ---------- missing-details popover: the fix, in place ---------- */
const remindedTx={};
const mdPop=document.createElement('div');
mdPop.className='mdpop';mdPop.setAttribute('role','dialog');
document.body.appendChild(mdPop);
let mdIdx=null,mdBtn=null;
const mdCountText=n=>n===0?'All details added':n+' detail'+(n>1?'s':'')+' missing';
function openMissingPop(btn,i){
  const m=missingOf(i);
  if(!m.length)return;
  mdIdx=i;mdBtn=btn;
  const r=data[i],title=r[2]==='Referral'?'Referral \u2014 '+r[3]:r[0];
  const foreign=r[7]!==ME_TX,many=m.length>=5;
  const listHTML=`<div class="mdlist">${m.map(k=>`<span><i></i>${FIELDS[k].label}</span>`).join('')}</div>`;
  const formHTML=m.map(k=>{
    const f=FIELDS[k],s=SUGGEST[k];
    return `<div class="mdfield"><span class="mdlab">${f.label}${s?'<span class="mdsug">Suggested</span>':''}</span>
      <span class="mdin${f.type==='money'?' money':''}">${f.type==='money'?'<span class="pfx">$</span>':''}<input data-f="${k}" type="${f.type==='date'?'date':'text'}"${s?` value="${s.iso}"`:''}${f.ph?` placeholder="${f.ph}"`:''} aria-label="${f.label}"></span></div>`;
  }).join('');
  let foot;
  if(foreign){
    foot=remindedTx[i]
      ?'<span class="mdnote">Reminded 2h ago</span>'
      :'<button class="mdbtn" data-md="cancel">Cancel</button><button class="mdbtn pri" data-md="remind">Remind agent</button>';
  }else if(many){
    foot='<button class="mdbtn" data-md="cancel">Cancel</button><button class="mdbtn pri" data-md="deep">Complete details<svg viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg></button>';
  }else{
    foot='<button class="mdbtn" data-md="cancel">Cancel</button><button class="mdbtn pri" data-md="save">Save</button>';
  }
  mdPop.setAttribute('aria-label',mdCountText(m.length)+' on '+title);
  mdPop.innerHTML=`<div class="mdct" id="tx-mdct">${mdCountText(m.length)}</div>
    <div class="mdcons">${consLine(m)}</div>
    <div class="mdsep"></div>${(foreign||many)?listHTML:formHTML}<div class="mdsep"></div>
    <div class="mdf">${foot}</div>`;
  mdPop.classList.remove('closing');
  mdPop.style.visibility='hidden';mdPop.classList.add('open');
  const br=btn.getBoundingClientRect();
  mdPop.style.left=Math.max(8,Math.min(br.left-8,window.innerWidth-336))+'px';
  mdPop.style.top=(br.bottom+8)+'px';
  let pr=mdPop.getBoundingClientRect();
  const flip=pr.bottom>window.innerHeight-8;
  if(flip)mdPop.style.top=Math.max(8,br.top-pr.height-8)+'px';
  pr=mdPop.getBoundingClientRect();
  mdPop.style.transformOrigin=(br.left+br.width/2-pr.left)+'px '+(flip?pr.height+8+'px':'-8px');
  mdPop.classList.remove('open');void mdPop.offsetWidth;
  mdPop.style.visibility='';mdPop.classList.add('open');
  btn.setAttribute('aria-expanded','true');
  const first=mdPop.querySelector('input')||mdPop.querySelector('.mdbtn.pri');
  if(first)first.focus({preventScroll:true});
}
function closeMissingPop(){
  if(!mdPop.classList.contains('open')||mdPop.classList.contains('closing'))return;
  mdPop.classList.add('closing');
  setTimeout(()=>mdPop.classList.remove('open','closing'),120);
  const b=mdBtn;mdBtn=null;
  if(b){b.setAttribute('aria-expanded','false');if(document.body.contains(b))b.focus({preventScroll:true})}
}
mdPop.addEventListener('input',()=>{
  const total=missingOf(mdIdx).length;
  const filled=[...mdPop.querySelectorAll('input[data-f]')].filter(x=>x.value.trim()).length;
  const h=mdPop.querySelector('#tx-mdct');
  if(h)h.textContent=mdCountText(Math.max(0,total-filled));
});
mdPop.addEventListener('click',e=>{
  const b=e.target.closest('[data-md]');
  if(!b)return;
  e.stopPropagation();
  const k=b.dataset.md,i=mdIdx;
  if(k==='cancel')return closeMissingPop();
  if(k==='remind'){remindedTx[i]=1;const rb=mdBtn;mdPop.classList.remove('open');openMissingPop(rb,i);if(window.sonner)sonner('Reminder sent',data[i][7]+' will get a nudge.');return}
  if(k==='deep'){closeMissingPop();if(window.sonner)sonner('Opening transaction','Finish the remaining details in the form.');return}
  if(k==='save'){
    mdPop.querySelectorAll('input[data-f]').forEach(inp=>{
      const v=inp.value.trim();if(!v)return;
      const f=inp.dataset.f;
      if(f==='acc'){const p=v.split('-');if(p.length===3)data[i][8]=p[1]+'/'+p[2]+'/'+p[0]}
      else if(f==='price'){const n=Number(v.replace(/[^0-9.]/g,''));if(n)data[i][5]='$'+n.toLocaleString('en-US')}
      else data[i][3]=v;
    });
    const done=!missingOf(i).length;
    if(done){data[i][11]=0;data[i][12]=''}
    const btnEl=mdBtn;
    closeMissingPop();
    if(done&&btnEl&&document.body.contains(btnEl)){btnEl.classList.add('cleared');setTimeout(renderTable,210)}
    else renderTable();
  }
});
/* The row marker is a tip, not a trigger — the fill-in surface is reached from the
   transaction itself or from activity, never by clicking the hint. */
document.addEventListener('click',e=>{if(!e.target.closest('.mdpop')&&!e.target.closest('.cshint'))closeMissingPop()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMissingPop()});
window.addEventListener('scroll',()=>closeMissingPop(),true);
window.openMissingPop=openMissingPop;
window.firstIncompleteTx=()=>data.findIndex((r,i)=>missingOf(i).length);

/* ---------- My/Team segmented toggle — scopes stat cards + cap + chart ---------- */
const arrowUp='<svg viewBox="0 0 24 24" stroke="currentColor"><path d="M7 17 17 7M7 7h10v10"/></svg>';
const arrowDown='<svg viewBox="0 0 24 24" stroke="currentColor"><path d="M7 7 17 17M17 7v10H7"/></svg>';
const stat_my={
  active:{v:8,up:true,pct:"12.5%",cap:"Steady pipeline growth",sub:"2 new this week",spark:[4,5,4,6,7,7,8]},
  pending:{v:9,up:false,pct:"8%",cap:"On track to close",sub:"3 closing this month",spark:[12,11,10,11,10,9,9]},
  closed:{v:4,up:true,pct:"100%",cap:"Ahead of last year",sub:"1 closed last month",spark:[1,1,2,2,3,3,4]},
  earn:{v:"$18,400",up:true,pct:"22%",cap:"Trending up this year",sub:"Avg $4.6k / deal",spark:[9,11,10,13,14,16,18]},
  gci:{v:"$19,850",up:true,pct:"18%",cap:"Steady commission growth",sub:"6 deals contributed",spark:[11,12,12,14,15,17,19]},
  cap:77,capcap:"$18,400 of $24,000"
};
const stat_team={
  active:{v:195,up:true,pct:"9%",cap:"Team pipeline growing",sub:"14 new this week",spark:[160,165,172,178,182,188,195]},
  pending:{v:557,up:true,pct:"4%",cap:"Steady team volume",sub:"62 closing this month",spark:[520,528,535,540,545,551,557]},
  closed:{v:4,up:false,pct:"20%",cap:"Behind last year",sub:"1 closed last month",spark:[6,5,5,4,4,4,4]},
  earn:{v:"$26,020",up:true,pct:"11%",cap:"Team earnings up",sub:"Avg $6.5k / deal",spark:[19,20,22,22,24,25,26]},
  gci:{v:"$26,120",up:true,pct:"10%",cap:"Team GCI growing",sub:"22 deals contributed",spark:[20,21,22,23,24,25,26]},
  cap:null,capcap:null
};
/* 7-week micro trend. Count cards render discrete bars, money cards a bare line.
   Hover a week: others fade, tooltip shows the point, card value swaps to it. */
const SPARK_MODE={active:'bars',pending:'bars',closed:'bars',earn:'bars',gci:'bars'};
/* period per card: pipeline counts move week to week; YTD cards step by month */
const SPARK_PERIOD={active:'week',pending:'week',closed:'month',earn:'month',gci:'month'};
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function sparkLabel(key,i,n){
  if(SPARK_PERIOD[key]==='month'){
    if(i===n-1) return 'This month';
    const m=new Date().getMonth()-(n-1-i);
    return MONTHS[(m%12+12)%12];
  }
  return i===n-1?'This week':'Wk '+(i+1);
}
const sparkTip=document.createElement('div');sparkTip.className='sparktip';document.body.appendChild(sparkTip);
function sparkFmt(key,v){return (key==='earn'||key==='gci')?'$'+v+'k':v;}
function paintSpark(key,vals,up,restore){
  const el=document.getElementById('tx-sp-'+key); if(!el||!vals) return;
  const valEl=document.getElementById('tx-s-'+key);
  const mode=SPARK_MODE[key]||'line',n=vals.length;
  const min=Math.min(...vals),max=Math.max(...vals),r=(max-min)||1;
  el.style.color=up?'#16803d':'#dc2626';
  const pts=vals.map((v,i)=>[i*(100/(n-1)),28-2-((v-min)/r)*19]);
  if(mode==='bars'){
    el.className='spark';
    el.innerHTML=vals.map((v,i)=>'<div class="bar'+(i===n-1?' last':'')+'" style="height:'+(18+((v-min)/r)*76)+'%"></div>').join('');
  }else{
    const d=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
    el.className='spark line';
    el.innerHTML='<svg viewBox="0 0 100 28" preserveAspectRatio="none"><path d="'+d+'" fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/></svg>'
      +'<div class="dot"></div><div class="hits">'+vals.map(()=>'<div class="hit"></div>').join('')+'</div>';
  }
  const targets=el.querySelectorAll(mode==='bars'?'.bar':'.hit');
  const dot=el.querySelector('.dot');
  targets.forEach((t,i)=>{
    t.addEventListener('mouseenter',ev=>{
      el.classList.add('hot');
      targets.forEach((o,j)=>o.classList.toggle('on',i===j));
      if(dot){dot.style.left=pts[i][0]+'%';dot.style.top=(pts[i][1]/28*100)+'%';}
      if(valEl) valEl.textContent=sparkFmt(key,vals[i]);
      const b=t.getBoundingClientRect();
      sparkTip.textContent=sparkLabel(key,i,n)+' · '+sparkFmt(key,vals[i]);
      sparkTip.style.display='block';requestAnimationFrame(()=>sparkTip.classList.add('show'));
      sparkTip.style.left=Math.round(b.left+b.width/2-sparkTip.offsetWidth/2)+'px';
      sparkTip.style.top=Math.round(b.top-sparkTip.offsetHeight-6)+'px';
    });
  });
  el.addEventListener('mouseleave',()=>{
    el.classList.remove('hot');
    targets.forEach(o=>o.classList.remove('on'));
    sparkTip.classList.remove('show');sparkTip.style.display='none';
    if(valEl) valEl.textContent=restore;
  });
}
function paintTrend(key,s){
  const t=document.getElementById('tx-t-'+key);
  t.className='cbtn trend '+(s.up?'up':'down');
  t.title=(s.up?'Up ':'Down ')+s.pct+' vs last year';
  t.innerHTML=(s.up?'<svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>':'<svg viewBox="0 0 24 24"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>');
  paintSpark(key,s.spark,s.up,s.v);
  document.getElementById('tx-s-'+key).textContent=s.v;
  document.getElementById('tx-sub-'+key).textContent=s.sub;
}
function applyScope(seg){
  const s=seg==='my'?stat_my:stat_team;
  ['active','pending','closed','earn','gci'].forEach(k=>paintTrend(k,s[k]));
  const capcard=document.getElementById('tx-capcard');
  if(s.cap===null){capcard.style.display='none'}
  else{
    capcard.style.display='';
    document.getElementById('tx-capval').textContent=s.cap+'%';
    document.getElementById('tx-capbarfill').style.width=s.cap+'%';
    document.getElementById('tx-capcap').textContent=s.capcap;
  }
}
/* My/Team — dropdown (was a segmented toggle) */
const scopeTrigger=document.getElementById('tx-scopetrigger'),mtpop=document.getElementById('tx-mtpop'),scopeLabel=document.getElementById('tx-scopelabel');
scopeTrigger.addEventListener('click',e=>{
  mtpop.classList.toggle('open');e.stopPropagation();
});
const agList=document.getElementById('tx-aglist'),grList=document.getElementById('tx-grlist'),
      agQ=document.getElementById('tx-agq'),grQ=document.getElementById('tx-grq');
const nOfAgent=n=>data.filter((r,i)=>!deletedTx.has(i)&&r[7]===n).length;
const agentsTx=[...new Set(data.map(r=>r[7]))].filter(n=>n&&n!==ME_TX).sort();
const plus=(first,n)=>n>1?first.split(' ')[0]+' +'+(n-1):first;
function scopeTextTx(){
  if(TXSCOPE.kind==='my')return 'My';
  if(TXSCOPE.kind!=='assoc')return 'All transactions';
  if(TXSCOPE.preset)return 'Associate';
  const g=TXSCOPE.groups,s=TXSCOPE.sel;
  if(g.length&&!s.length)return g.length===1?g[0]:g[0]+' +'+(g.length-1);
  if(!g.length&&s.length)return plus(s[0],s.length);
  const nm=txScopeNames();
  if(!nm.length)return 'All transactions';
  return plus(nm[0],nm.length);
}
function avTx(n){
  const t=agtone[n]||['#e5e5e5','#404040'];
  return '<span class="scav" style="background:'+t[0]+';color:'+t[1]+'">'+ini(n)+avImg(n,agImg)+'</span>';
}
function paintScopeTx(){
  scopeLabel.textContent=scopeTextTx();
  mtpop.querySelectorAll('.scopeitem[data-scope]').forEach(x=>{
    const k=x.dataset.scope;
    x.classList.toggle('selected',
      (k==='my'&&TXSCOPE.kind==='my')||
      (k==='all'&&TXSCOPE.kind==='all')||
      (k==='assoc-all'&&TXSCOPE.kind==='assoc'&&!!TXSCOPE.preset));
  });
  drawAg();drawGr();
  applyScope(TXSCOPE.kind==='my'?'my':'team');
  renderTable();
}
function drawAg(){
  const q=(agQ.value||'').trim().toLowerCase();
  const list=agentsTx.filter(n=>!q||n.toLowerCase().includes(q));
  agList.innerHTML=list.length
    ?list.map(n=>'<div class="scopeitem'+(TXSCOPE.kind==='assoc'&&txScopeNames().includes(n)?' selected':'')+
      '" data-ag="'+n+'">'+'<span class="scbx"><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg></span>'+avTx(n)+n+'<span class="scct">'+nOfAgent(n)+'</span></div>').join('')
    :'<div class="scempty">No associate matches “'+(agQ.value||'')+'”</div>';
}
function drawGr(){
  const q=(grQ.value||'').trim().toLowerCase();
  const list=GROUPS_TX.filter(g=>!q||g.n.toLowerCase().includes(q));
  grList.innerHTML=list.length
    ?list.map(g=>'<div class="scopeitem'+(TXSCOPE.groups.includes(g.n)?' selected':'')+'" data-gr="'+g.n+'">'+
      '<span class="scbx"><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg></span>'+g.n+'<span class="scct">'+g.m.reduce((a,n)=>a+nOfAgent(n),0)+'</span></div>').join('')
    :'<div class="scempty">No group matches “'+(grQ.value||'')+'”</div>';
}
mtpop.querySelectorAll('.scopeitem[data-scope]').forEach(o=>o.addEventListener('click',e=>{
  const k=o.dataset.scope;
  if(k==='my')TXSCOPE={kind:'my',sel:[],groups:[]};
  else if(k==='all')TXSCOPE={kind:'all',sel:[],groups:[]};
  else TXSCOPE={kind:'assoc',sel:TEAM_TX.slice(),groups:[],preset:true};
  paintScopeTx();
  mtpop.classList.remove('open');
  e.stopPropagation();
}));
agList.addEventListener('click',e=>{
  const r=e.target.closest('[data-ag]');if(!r)return;
  const n=r.dataset.ag;
  const sel=(TXSCOPE.kind==='assoc'&&!TXSCOPE.preset)?TXSCOPE.sel.slice():[];
  const groups=(TXSCOPE.kind==='assoc'&&!TXSCOPE.preset)?TXSCOPE.groups.slice():[];
  const at=sel.indexOf(n);
  if(at<0)sel.push(n);else sel.splice(at,1);
  TXSCOPE=(sel.length||groups.length)?{kind:'assoc',sel,groups}:{kind:'all',sel:[],groups:[]};
  paintScopeTx();
  e.stopPropagation();
});
grList.addEventListener('click',e=>{
  const r=e.target.closest('[data-gr]');if(!r)return;
  const g=GROUPS_TX.find(x=>x.n===r.dataset.gr);if(!g)return;
  const keep=TXSCOPE.kind==='assoc'&&!TXSCOPE.preset;
  const groups=keep?TXSCOPE.groups.slice():[],sel=keep?TXSCOPE.sel.slice():[];
  const at=groups.indexOf(g.n);
  if(at<0)groups.push(g.n);else groups.splice(at,1);
  TXSCOPE=(sel.length||groups.length)?{kind:'assoc',sel,groups}:{kind:'all',sel:[],groups:[]};
  paintScopeTx();
  e.stopPropagation();
});
agQ.addEventListener('input',e=>{drawAg();e.stopPropagation()});
grQ.addEventListener('input',e=>{drawGr();e.stopPropagation()});
[agQ,grQ].forEach(el=>el.addEventListener('click',e=>e.stopPropagation()));
drawAg();drawGr();
document.addEventListener('click',e=>{if(!e.target.closest('#tx-scopetrigger'))mtpop.classList.remove('open')});
['active','pending','closed','earn','gci'].forEach(k=>paintTrend(k,stat_team[k])); /* paint initial All-scope trends on load */

/* ---------- card skin (driven by Tweaks: pastel / neutral / glass) ---------- */
window.__applyCardSkin=s=>{
  const grid=document.getElementById('tx-statgrid');
  if(!grid)return;
  grid.classList.remove('neutral','glass','gradient','flat','pastel');
  grid.classList.add(s==='pastel'||!s?'neutral':s);
  try{localStorage.setItem('crm-cardskin2',s||'pastel')}catch(e){}
};
window.__applyTxHeader=v=>{
  const b=document.body;
  b.classList.toggle('txd-inv',v==='innovative');
  b.classList.toggle('txd-flat',v==='flat');
  b.classList.toggle('txd-bnr',v==='banner');
  try{localStorage.setItem('crm-txheader',v||'current')}catch(e){}
  const fb=document.getElementById('txd-flatbar');
  if(fb) fb.style.display=(v==='flat')?'flex':'none';
  if(typeof window.__renderFlatbar==='function') window.__renderFlatbar();
};
window.__applySalePrice=v=>{
  document.body.classList.toggle('txd-heroprice',v==='hero');
  try{localStorage.setItem('crm-saleprice',v||'normal')}catch(e){}
};
window.__applyChkState=v=>{
  window.__chkState=v||'inprogress';
  if(window.__renderChk)window.__renderChk();
  try{localStorage.setItem('crm-chkstate',window.__chkState)}catch(e){}
};
window.__applyTxPhoto=v=>{
  document.body.classList.toggle('txd-nophoto',v==='off');
  try{localStorage.setItem('crm-txphoto',v||'on')}catch(e){}
};

/* ---------- overview collapse ---------- */
const ov=document.getElementById('tx-overview'),ovbtn=document.getElementById('tx-ovtoggle');
let ovOpen=true;
ovbtn.addEventListener('click',()=>{
  ovOpen=!ovOpen;
  ov.style.display=ovOpen?'':'none';
  ovbtn.classList.toggle('open',ovOpen);
  ovbtn.title=ovOpen?'Hide overview':'Show overview';
});

/* ---------- tabs ---------- */
root.querySelectorAll('.tab[data-tab]').forEach(t=>t.addEventListener('click',()=>{
  root.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  t.classList.add('active');
  tabTx=t.dataset.tab;
  closeMissingPop();
  renderTable();
}));

/* ---------- table search ---------- */
const schTx=document.getElementById('tx-search');
if(schTx){
  const wrap=schTx.closest('.tsearch');
  const applyTx=()=>{
    qTx=schTx.value.trim().toLowerCase();
    wrap.classList.toggle('hasval',!!schTx.value);
    closeMissingPop();
    renderTable();
  };
  schTx.addEventListener('input',applyTx);
  schTx.addEventListener('keydown',e=>{if(e.key==='Escape'){schTx.value='';applyTx()}});
  document.getElementById('tx-searchclear').addEventListener('click',()=>{schTx.value='';applyTx();schTx.focus()});
}

/* ---------- smart lists popover (Krish review fix #3 — missing from prompt #1) ---------- */
const smartListsTx=[
 {n:"Closing this week",d:"Escrow date within 7 days",on:false},
 {n:"High-value deals",d:"Purchase price over $1M",on:false},
 {n:"Needs attention",d:"Incomplete — missing required fields",on:false},
 {n:"My referrals",d:"Type: referral, assigned to me",on:false},
 {n:"Team pending",d:"Pending stage across the team",on:false},
 {n:"Recently updated",d:"Status changed in the last 3 days",on:false}
];
const plainListsTx=[
 {n:"Q3 closings",d:"Manual list · 14 transactions",on:false},
 {n:"Repeat clients 2026",d:"Manual list · 9 transactions",on:false},
 {n:"VIP sellers",d:"Manual list · 6 transactions",on:false}
];
let curSegTx='smart';
const slwrapTx=document.getElementById('tx-sllist'),slpopTx=document.getElementById('tx-slpop'),smarttabTx=document.getElementById('tx-smarttab');
root.querySelectorAll('.slsegbtn').forEach(b=>b.addEventListener('click',e=>{
  root.querySelectorAll('.slsegbtn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');curSegTx=b.dataset.seg;renderSLTx();e.stopPropagation();
}));
function renderSLTx(){
  const d=curSegTx==='smart'?smartListsTx:plainListsTx;
  slwrapTx.innerHTML=d.map((s,i)=>`<div class="slitem">
    <span class="slmeta"><span class="slname">${s.n}</span><span class="sldesc">${s.d}</span></span>
    <span class="switch ${s.on?'on':''}" onclick="toggleSLTx(${i})"></span></div>`).join('');
  root.querySelectorAll('.sltab').forEach(t=>t.remove());
  [...smartListsTx,...plainListsTx].filter(s=>s.on).forEach(s=>{
    smarttabTx.insertAdjacentHTML('beforebegin',`<div class="tab sltab">${s.n}</div>`);
  });
  root.querySelectorAll('.sltab').forEach(t=>t.addEventListener('click',()=>{
    root.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
  }));
}
function toggleSLTx(i){const d=curSegTx==='smart'?smartListsTx:plainListsTx;d[i].on=!d[i].on;renderSLTx()}
smarttabTx.addEventListener('click',e=>{
  if(e.target.closest('.sltab'))return;
  const r=smarttabTx.getBoundingClientRect(),c=root.getBoundingClientRect();
  slpopTx.style.left=Math.max(8,r.left-c.left)+'px';
  slpopTx.style.top=(r.bottom-c.top+6)+'px';
  slpopTx.classList.toggle('open');e.stopPropagation();
});
document.addEventListener('click',e=>{if(!e.target.closest('.slpop')&&!e.target.closest('#tx-smarttab'))slpopTx.classList.remove('open')});
renderSLTx();
window.toggleSLTx=toggleSLTx;

/* ---------- Filters side sheet (right edge, same shell as the Tasks sheet) ----------
   Tabs own the coarse cut, so statuses outside the active tab are disabled, not hidden.
   Everything inside the sheet is a DRAFT until Apply; chip ✕ stages a removal the same way. */
const filterbtn=document.getElementById('tx-filterbtn');
const fsheet=document.getElementById('tx-fsheet'),fscrim=document.getElementById('tx-fscrim'),fsbody=document.getElementById('tx-fsbody');
const TODAY_TX=(()=>{const d=new Date();d.setHours(0,0,0,0);return d})();
const DAY_TX=864e5;
const dayOf=s=>{if(!s)return null;const[m,d,y]=s.split('/').map(Number);return new Date(y,m-1,d).setHours(0,0,0,0)};
const moneyOf=s=>{if(!s)return null;const n=Number(String(s).replace(/[^0-9.]/g,''));return isFinite(n)&&n>0?n:null};
const PRICE_MAX=(()=>{let m=0;data.forEach(r=>{const p=moneyOf(r[5]);if(p&&p>m)m=p});return Math.max(1e6,Math.ceil(m/1e5)*1e5)})();
const fmtM=n=>n>=1e6?'$'+(n/1e6).toFixed(n%1e6?1:0)+'M':'$'+Math.round(n/1e3)+'k';
const REP_SET=[...new Set(data.map(r=>r[2]))];
const ST_PRESENT=[...new Set(data.map(r=>r[6]))].sort((a,b)=>Object.keys(STATUS_FAM).indexOf(a)-Object.keys(STATUS_FAM).indexOf(b));
const blankF=()=>({st:[],stside:'b',rep:[],ty:'All types',aud:[],cb:[],chk:'any',vis:'all',dfield:'coe',dpre:'any',ds:'',de:'',pmin:0,pmax:PRICE_MAX,cmin:'',cmax:'',rmin:'',rmax:''});
/* Status is side-scoped: each representation side runs its own stage vocabulary, so the
   section carries a tab per side and only shows the sides the Representation filter allows. */
const ST_SIDES=[['b','Buyer / Tenant'],['s','Seller / Landlord'],['r','Referral']];
const ST_SIDE_LBL=Object.fromEntries(ST_SIDES);
const ST_BY_SIDE={
  b:['New Offer','Pending Signature','Executed','Submitted To Listing Agent','Offer Rejected','Offer Withdrawn','Incomplete - Pending','Pending','CDA Pending','CDA Completed','Closed'],
  s:['Prospect','Listing Agreement Signed','Coming Soon','Active On Market','Back On Market','Listing Canceled','Listing Expired','Pending','Incomplete - Pending','CDA Pending','CDA Completed'],
  r:['Pre-Pending','Pending','CDA Pending','CDA Completed','Closed','Contract Canceled','Void']
};
const rowSides=i=>{const s=SIDE(data[i][2]);return s==='dual'?['b','s']:s==='buyer'?['b']:s==='referral'?['r']:['s']};
function stLabelMatch(i,label){
  const r=data[i],st=String(r[6]).toLowerCase(),l=label.toLowerCase();
  if(l==='incomplete - pending')return !!r[11]&&st==='pending';
  if(l==='cda pending')return cbStateOf(i)[1]==='pend';
  if(l==='cda completed')return cbStateOf(i)[1]==='done';
  return st===l;
}
const stTok=(sd,lb)=>sd+'|'+lb;
const stTokMatch=(i,tok)=>{const p=tok.split('|');return rowSides(i).includes(p[0])&&stLabelMatch(i,p[1])};
function sidesFor(S){
  const all=ST_SIDES.map(s=>s[0]);
  if(!S.rep.length)return all;
  const set=new Set();
  S.rep.forEach(rp=>{const k=SIDE(rp);if(k==='dual'){set.add('b');set.add('s')}else if(k==='buyer')set.add('b');else if(k==='referral')set.add('r');else set.add('s')});
  return all.filter(k=>set.has(k));
}
const cloneF=o=>JSON.parse(JSON.stringify(o));
const sameF=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
let FA=blankF(),FD=blankF(),fMore=false;
const DPRE={coe:[['past','Past due'],['today','Closing today'],['n7','Next 7 days'],['n30','Next 30 days']],acc:[['l7','Last 7 days'],['l30','Last 30 days'],['l90','Last 90 days'],['l365','Last year']]};
const DPRE_LBL=Object.assign({},...[...DPRE.coe,...DPRE.acc].map(([k,l])=>({[k]:l})));

function passF(i,A){
  const r=data[i];
  if(A.st.length&&!A.st.some(t=>stTokMatch(i,t)))return false;
  if(A.rep.length&&!A.rep.includes(r[2]))return false;
  if(A.ty!=='All types'&&(TXTYPE[r[2]]||'')!==A.ty)return false;
  if(A.aud.length&&!A.aud.includes(auditOf(i)[0]))return false;
  if(A.cb.length){const t=cbTokens(i);if(!t.some(x=>A.cb.includes(x)))return false}
  if(A.chk==='open'&&!openItemsOf(i))return false;
  if(A.chk==='clear'&&openItemsOf(i))return false;
  if(A.vis==='private'&&!r[4])return false;
  if(A.vis==='shared'&&r[4])return false;
  const p=moneyOf(r[5]),c=moneyOf(r[9]),nn=v=>v===''||v==null?null:Number(v);
  if(A.pmin>0||A.pmax<PRICE_MAX){if(p==null||p<A.pmin||p>A.pmax)return false}
  if(nn(A.cmin)!=null&&(c==null||c<nn(A.cmin)))return false;
  if(nn(A.cmax)!=null&&(c==null||c>nn(A.cmax)))return false;
  const rate=(p&&c)?c/p*100:null;
  if(nn(A.rmin)!=null&&(rate==null||rate<nn(A.rmin)))return false;
  if(nn(A.rmax)!=null&&(rate==null||rate>nn(A.rmax)))return false;
  if(A.dpre!=='any'){
    const v=dayOf(r[A.dfield==='coe'?10:8]);
    if(v==null)return false;
    const t=TODAY_TX.getTime(),win=(a,b)=>v>=a&&v<=b;
    if(A.dpre==='past')return v<t;
    if(A.dpre==='today')return v===t;
    if(A.dpre==='n7')return win(t,t+7*DAY_TX);
    if(A.dpre==='n30')return win(t,t+30*DAY_TX);
    if(A.dpre==='l7')return win(t-7*DAY_TX,t);
    if(A.dpre==='l30')return win(t-30*DAY_TX,t);
    if(A.dpre==='l90')return win(t-90*DAY_TX,t);
    if(A.dpre==='l365')return win(t-365*DAY_TX,t);
    if(A.dpre==='custom'){
      const s=A.ds?new Date(A.ds+'T00:00:00').getTime():-Infinity;
      const e=A.de?new Date(A.de+'T00:00:00').getTime():Infinity;
      return v>=s&&v<=e;
    }
  }
  return true;
}
window._txPassF=i=>passF(i,FA);
/* rows the tab alone allows — the denominator every option count is measured against */
function baseRowsF(){
  let rows=data.map((r,i)=>i).filter(i=>!deletedTx.has(i));
  return tabTx==='Needs attention'?rows.filter(i=>missingOf(i).length):rows.filter(TAB_PRED[tabTx]||(()=>true));
}

const CKM='<span class="bx"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg></span>';
const RDM='<span class="rd"></span>';
const esc2=s=>String(s).replace(/"/g,'&quot;');
const fpane=document.getElementById('tx-fpane');
let fSec=null,fQ='',fOpenSec=new Set(['rep','st','dates']);
const oCk=(k,v,label,extra,n,dis)=>`<div class="fo${(Array.isArray(FD[k])?FD[k].includes(v):FD[k]===v)?' on':''}${dis?' dis':''}" data-k="${k}" data-v="${esc2(v)}"${dis?' title="Not in the '+esc2(tabTx)+' tab"':''}>${CKM}${extra||''}${label}${n==null?'':'<span class="ct">'+n+'</span>'}</div>`;
const oRd=(k,v,label,n)=>`<div class="fo${FD[k]===v?' on':''}" data-k="${k}" data-v="${esc2(v)}">${RDM}${label}${n==null?'':'<span class="ct">'+n+'</span>'}</div>`;

/* one row per filter; its options open in a pane to the left, so nothing ever scrolls */
const SECS=[
  ['rep','Representation'],['st','Status'],['dates','Dates'],
  ['aud','Auditing status'],['cb','Commission breakdown'],['chk','Checklist'],['money','Price & commission']
];
function secSummary(k){
  const A=FD;
  if(k==='st')return A.st.length?(A.st.length>1?A.st.length+' statuses':A.st[0].split('|')[1]):'Any status';
  if(k==='rep')return A.rep.length?(A.rep.length>1?A.rep.length+' sides':A.rep[0]):'All sides';
  if(k==='ty')return A.ty;
  if(k==='dates')return A.dpre==='any'?'Any time':(A.dpre==='custom'?((A.ds||'any')+' \u2192 '+(A.de||'any')):DPRE_LBL[A.dpre]);
  if(k==='aud')return A.aud.length?(A.aud.length>1?A.aud.length+' selected':A.aud[0]):'Any';
  if(k==='cb')return A.cb.length?(A.cb.length>1?A.cb.length+' selected':(A.cb[0].startsWith('p:')?A.cb[0].slice(2)+' approval':(A.cb[0]==='Pending'?'Pending approval':A.cb[0]))):'Any';
  if(k==='chk')return A.chk==='any'?'Any':(A.chk==='open'?'Has open items':'No open items');
  if(k==='money'){
    const bits=[];
    if(A.pmin>0||A.pmax<PRICE_MAX)bits.push(fmtM(A.pmin)+'\u2013'+(A.pmax>=PRICE_MAX?fmtM(PRICE_MAX)+'+':fmtM(A.pmax)));
    if(A.cmin!==''||A.cmax!=='')bits.push('fee $'+(A.cmin||'0')+'\u2013'+(A.cmax||'any'));
    if(A.rmin!==''||A.rmax!=='')bits.push((A.rmin||'0')+'\u2013'+(A.rmax||'any')+'%');
    return bits.length?bits.join(' \u00b7 '):'Any';
  }
  if(k==='vis')return A.vis==='all'?'All transactions':(A.vis==='private'?'Private only':'Team visible');
  return '';
}
const secSet=k=>{
  const A=FD;
  if(k==='st')return !!A.st.length; if(k==='rep')return !!A.rep.length;
  if(k==='ty')return A.ty!=='All types'; if(k==='dates')return A.dpre!=='any';
  if(k==='aud')return !!A.aud.length; if(k==='chk')return A.chk!=='any';
  if(k==='money')return A.pmin>0||A.pmax<PRICE_MAX||A.cmin!==''||A.cmax!==''||A.rmin!==''||A.rmax!=='';
  return false;
};
function buildRail(){
  return SECS.map(([k,l])=>`<div class="fsrow${fSec===k?' on':''}${secSet(k)?' set':''}" data-sec="${k}" role="button" tabindex="0" aria-expanded="${fSec===k}"><span class="l">${l}</span><span class="v">${secSummary(k)}</span><svg class="cv" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></div>`).join('');
}
/* every section's option markup, shared by both layouts (pane flyout / stacked sidebar) */
function secBody(k){
  const base=baseRowsF(),nOf=p=>base.filter(p).length;
  let h='',wide=false,hint='';
  if(k==='st'){
    const sides=sidesFor(FD);
    const side=sides.includes(FD.stside)?FD.stside:sides[0];
    const seg=sides.length>1?'<div class="fseg">'+sides.map(sd=>`<button type="button" data-segk="stside" data-seg="${sd}" class="${side===sd?'on':''}">${ST_SIDE_LBL[sd]}</button>`).join('')+'</div>':'';
    const cell=lb=>{
      const tok=stTok(side,lb),on=FD.st.includes(tok);
      const n=base.filter(i=>stTokMatch(i,tok)).length;
      return `<div class="fo${on?' on':''}" data-k="st" data-v="${esc2(tok)}">${CKM}${lb}<span class="ct">${n}</span></div>`;
    };
    h=seg+`<div class="fopts">${ST_BY_SIDE[side].map(cell).join('')}</div>`;
  }else if(k==='rep'){
    h='<div class="fopts">'+REP_SET.map(s=>oCk('rep',s,s,'',nOf(i=>data[i][2]===s),false)).join('')+'</div>';
  }else if(k==='dates'){
    const fld=FD.dfield;
    h=`<div class="fseg"><button type="button" data-segk="dfield" data-seg="acc" class="${fld==='acc'?'on':''}">Acceptance date</button><button type="button" data-segk="dfield" data-seg="coe" class="${fld==='coe'?'on':''}">Close of escrow</button></div>`
     +'<div class="fopts">'+oRd('dpre','any','Any time',null)
     +DPRE[fld].map(([p,l])=>oRd('dpre',p,l,nOf(i=>passF(i,Object.assign(blankF(),{dfield:fld,dpre:p}))))).join('')
     +oRd('dpre','custom','Custom range',null)+'</div>'
     +`<div class="frow"><input type="date" class="fdate" data-f="ds" value="${FD.ds}" aria-label="Start date"><span class="arw">&rarr;</span><input type="date" class="fdate" data-f="de" value="${FD.de}" aria-label="End date"></div>`;
  }else if(k==='aud'){
    h='<div class="fopts">'+['Not started','In review','Complete'].map(a=>oCk('aud',a,a,'',nOf(i=>auditOf(i)[0]===a),false)).join('')+'</div>';
  }else if(k==='cb'){
    const tk=v=>nOf(i=>cbTokens(i).includes(v));
    h='<div class="fopts">'+oCk('cb','Confirmed','Confirmed','',tk('Confirmed'),false)
     +oCk('cb','Pending','Pending approval','',tk('Pending'),false)
     +'<div class="fsubopts fopts">'+CB_PARTIES.map(p=>oCk('cb','p:'+p,p+' approval','',tk('p:'+p),false)).join('')+'</div>'
     +oCk('cb','Completed','Completed','',tk('Completed'),false)+'</div>';
  }else if(k==='chk'){
    h='<div class="fopts">'+oRd('chk','any','Any',null)+oRd('chk','open','Has open items',nOf(i=>openItemsOf(i)>0))+oRd('chk','clear','No open items',nOf(i=>openItemsOf(i)===0))+'</div>';
  }else if(k==='money'){
    const pl=FD.pmin/PRICE_MAX*100,pr=FD.pmax/PRICE_MAX*100;
    h=`<div class="fsub" style="margin-top:0">Sale price</div>`
     +`<div class="fsld"><div class="trk"></div><div class="fill" id="tx-prfill" style="left:${pl}%;right:${100-pr}%"></div>`
     +`<input type="range" id="tx-pr1" data-f="pmin" min="0" max="${PRICE_MAX}" step="50000" value="${FD.pmin}" aria-label="Minimum price">`
     +`<input type="range" id="tx-pr2" data-f="pmax" min="0" max="${PRICE_MAX}" step="50000" value="${FD.pmax}" aria-label="Maximum price"></div>`
     +`<div class="fsldv"><span id="tx-prlo">${fmtM(FD.pmin)}</span><span id="tx-prhi">${FD.pmax>=PRICE_MAX?fmtM(PRICE_MAX)+'+':fmtM(FD.pmax)}</span></div>`
     +`<div class="fsub">Gross commission</div><div class="frow"><span class="fnum"><span class="pfx">$</span><input type="number" data-f="cmin" value="${FD.cmin}" placeholder="Min"></span><span class="arw">&rarr;</span><span class="fnum"><span class="pfx">$</span><input type="number" data-f="cmax" value="${FD.cmax}" placeholder="Max"></span></div>`
     +`<div class="fsub">Commission rate</div><div class="frow"><span class="fnum"><input type="number" data-f="rmin" value="${FD.rmin}" placeholder="Min" step="0.25"><span class="pfx">%</span></span><span class="arw">&rarr;</span><span class="fnum"><input type="number" data-f="rmax" value="${FD.rmax}" placeholder="Max" step="0.25"><span class="pfx">%</span></span></div>`;
  }
  return {h,wide,hint};
}
/* labels the global search matches against, per section */
function secLabels(k){
  if(k==='st')return sidesFor(FD).flatMap(sd=>[ST_SIDE_LBL[sd]].concat(ST_BY_SIDE[sd]));
  if(k==='rep')return REP_SET;
  if(k==='dates')return ['Any time','Custom range','Acceptance date','Close of escrow'].concat(DPRE[FD.dfield].map(d=>d[1]));
  if(k==='aud')return ['Not started','In review','Complete'];
  if(k==='cb')return ['Confirmed','Pending approval','Completed'].concat(CB_PARTIES.map(p=>p+' approval'));
  if(k==='chk')return ['Any','Has open items','No open items'];
  if(k==='money')return ['Sale price','Gross commission','Commission rate'];
  return [];
}
const secTitle=k=>(SECS.find(s=>s[0]===k)||['',''])[1];
function buildPane(k){
  const b=secBody(k);
  fpane.classList.toggle('wide',b.wide);
  return `<div class="ph"><span class="l">${secTitle(k)}</span>${secSet(k)?'<button type="button" class="pclr" data-pclr="'+k+'">Clear</button>':''}</div>`+b.h+(b.hint?`<div class="fhint">${b.hint}</div>`:'');
}
/* stacked layout: every section inline in the same sidebar, collapsible by chevron */
function buildStacked(){
  return SECS.map(([k,l])=>{
    const b=secBody(k),open=fOpenSec.has(k);
    return `<div class="fgrp${open?'':' collapsed'}" data-secblk="${k}" data-title="${esc2(l)}">`
      +`<div class="fgh" role="button" tabindex="0" aria-expanded="${open}"><svg class="fgcar" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg><span class="l">${l}</span>`
      +`<span class="n">${secSummary(k)}</span>`
      +(secSet(k)?`<button type="button" class="pclr" data-pclr="${k}">Clear</button>`:'')
      +'</div><div class="fgbody">'+b.h+(b.hint?`<div class="fhint">${b.hint}</div>`:'')+'</div></div>';
  }).join('');
}
/* global search: a section shows when its name or any of its option labels match */
function applyQ(){
  const hit=k=>!fQ||secTitle(k).toLowerCase().includes(fQ)||secLabels(k).some(l=>String(l).toLowerCase().includes(fQ));
  if(window.__filterLayout!=='pane')fsbody.querySelectorAll('[data-secblk]').forEach(blk=>{
    const on=hit(blk.dataset.secblk);
    blk.hidden=!on;
    /* a search hit opens the section it matched, so the answer is on screen */
    if(fQ&&on)blk.classList.remove('collapsed');
    else if(!fQ)blk.classList.toggle('collapsed',!fOpenSec.has(blk.dataset.secblk));
    const gh=blk.querySelector('.fgh');if(gh)gh.setAttribute('aria-expanded',!blk.classList.contains('collapsed'));
  });
  else fsbody.querySelectorAll('.fsrow').forEach(row=>{row.hidden=!hit(row.dataset.sec)});
  const none=[...fsbody.children].every(c=>c.hidden);
  const em=document.getElementById('tx-fsempty');
  if(em)em.hidden=!(fQ&&none);
}
function placePane(){
  if(!fSec)return;
  const row=fsbody.querySelector('.fsrow[data-sec="'+fSec+'"]');
  if(!row)return;
  const r=row.getBoundingClientRect(),ph=fpane.offsetHeight;
  fpane.style.top=Math.max(12,Math.min(r.top-10,window.innerHeight-ph-12))+'px';
}
function openSec(k){
  fSec=fSec===k?null:k;
  if(!fSec){fpane.hidden=true;renderF();return}
  fpane.hidden=false;fpane.innerHTML=buildPane(fSec);
  renderF();placePane();
}
function fCount(){
  const n=baseRowsF().filter(i=>passF(i,FD)).length;
  const rc=document.getElementById('tx-fsrc');if(rc)rc.textContent=' \u2014 '+n+' result'+(n===1?'':'s');
  const pill=document.getElementById('tx-fspill'),k=chipsF(FD).length;
  if(pill){pill.hidden=!k;pill.textContent=k}
  const clr=document.getElementById('tx-fsclr');if(clr)clr.disabled=!k;
}
/* rail always redraws (it carries every summary); the pane redraws unless we're mid-typing */
function renderF(paneToo){
  const stacked=window.__filterLayout!=='pane';
  fsheet.dataset.mode=stacked?'stacked':'pane';
  if(stacked){fSec=null;fpane.hidden=true;fsbody.innerHTML=buildStacked()}
  else{fsbody.innerHTML=buildRail();if(paneToo!==false&&fSec){fpane.innerHTML=buildPane(fSec);placePane()}}
  applyQ();
  fCount();
}
function chipsF(A){
  const out=[];
  A.st.forEach(v=>{const p=v.split('|');out.push(['Status',(ST_SIDE_LBL[p[0]]||'').split(' / ')[0]+' \u00b7 '+p[1],'st',v])});
  A.rep.forEach(v=>out.push(['Side',v,'rep',v]));
  if(A.ty!=='All types')out.push(['Type',A.ty,'ty','']);
  A.aud.forEach(v=>out.push(['Audit',v,'aud',v]));
  A.cb.forEach(v=>out.push(['Commission',v.startsWith('p:')?v.slice(2)+' approval':(v==='Pending'?'Pending approval':v),'cb',v]));
  if(A.chk!=='any')out.push(['Checklist',A.chk==='open'?'Has open items':'No open items','chk','']);
  if(A.vis!=='all')out.push(['Visibility',A.vis==='private'?'Private only':'Team visible','vis','']);
  if(A.dpre!=='any')out.push([A.dfield==='coe'?'Close of escrow':'Acceptance',A.dpre==='custom'?((A.ds||'any')+' \u2192 '+(A.de||'any')):DPRE_LBL[A.dpre],'dpre','']);
  if(A.pmin>0||A.pmax<PRICE_MAX)out.push(['Price',fmtM(A.pmin)+' \u2013 '+(A.pmax>=PRICE_MAX?fmtM(PRICE_MAX)+'+':fmtM(A.pmax)),'price','']);
  if(A.cmin!==''||A.cmax!=='')out.push(['Commission',(A.cmin?'$'+A.cmin:'any')+' \u2013 '+(A.cmax?'$'+A.cmax:'any'),'comm','']);
  if(A.rmin!==''||A.rmax!=='')out.push(['Rate',(A.rmin||'0')+'\u2013'+(A.rmax||'any')+'%','rate','']);
  return out;
}
window._txSheetChips=()=>{
  const app=chipsF(FA),drf=chipsF(FD);
  const key=c=>c[2]+'|'+c[3]+'|'+c[1];
  const drfSet=new Set(drf.map(key)),appSet=new Set(app.map(key));
  let h=app.map(c=>{
    const gone=!drfSet.has(key(c));
    return `<span class="chip${gone?' pend':''}"><b>${c[0]}</b> ${c[1]}${gone?'':` <span class="cx" data-fx="${c[2]}|${esc2(c[3])}" role="button" tabindex="0" aria-label="Remove ${esc2(c[0])} filter">\u2715</span>`}</span>`;
  }).join('');
  h+=drf.filter(c=>!appSet.has(key(c))).map(c=>`<span class="chip pend"><b>${c[0]}</b> ${c[1]}</span>`).join('');
  if(!sameF(FA,FD))h+='<span class="fpendbar"><button type="button" class="go" data-fpend="apply">Apply changes</button><button type="button" class="un" data-fpend="undo">Undo</button></span>';
  return h;
};
function clearKeyF(k,v){
  if(k==='st'||k==='rep'||k==='aud'||k==='cb'){FD[k]=FD[k].filter(x=>x!==v)}
  else if(k==='ty')FD.ty='All types';
  else if(k==='chk')FD.chk='any';
  else if(k==='vis')FD.vis='all';
  else if(k==='dates'||k==='dpre'){FD.dpre='any';FD.ds='';FD.de=''}
  else if(k==='price'){FD.pmin=0;FD.pmax=PRICE_MAX}
  else if(k==='comm'){FD.cmin='';FD.cmax=''}
  else if(k==='rate'){FD.rmin='';FD.rmax=''}
  else if(k==='st_all')FD.st=[];
  else if(k==='money'){FD.pmin=0;FD.pmax=PRICE_MAX;FD.cmin='';FD.cmax='';FD.rmin='';FD.rmax=''}
}
function clearSecF(k){
  if(k==='st')FD.st=[];else if(k==='rep')FD.rep=[];else if(k==='aud')FD.aud=[];else if(k==='cb')FD.cb=[];
  else clearKeyF(k,null);
}
function commitF(){FA=cloneF(FD);renderTable();renderChips()}
function openF(){FD=cloneF(FA);fMore=false;fSec=null;fpane.hidden=true;fQ='';const q=document.getElementById('tx-fsq');if(q){q.value='';document.getElementById('tx-fsqx').hidden=true}renderF();fsheet.classList.add('on');fscrim.classList.add('on');fsheet.setAttribute('aria-hidden','false');filterbtn.classList.add('on')}
function closeF(){fsheet.classList.remove('on');fscrim.classList.remove('on');fsheet.setAttribute('aria-hidden','true');filterbtn.classList.remove('on');fSec=null;fpane.hidden=true}
filterbtn.addEventListener('click',e=>{e.stopPropagation();fsheet.classList.contains('on')?closeF():openF()});
fscrim.addEventListener('click',closeF);
document.getElementById('tx-fsx').addEventListener('click',closeF);
document.addEventListener('keydown',e=>{if(e.key!=='Escape'||!fsheet.classList.contains('on'))return;fSec?openSec(fSec):closeF()});
document.getElementById('tx-fsclr').addEventListener('click',()=>{FD=blankF();renderF()});
document.getElementById('tx-fsapply').addEventListener('click',()=>{commitF();closeF()});
window.addEventListener('resize',placePane);
fsbody.addEventListener('click',e=>{
  const row=e.target.closest('.fsrow');
  if(row){openSec(row.dataset.sec);return}
  handleOptClick(e);
});
fsbody.addEventListener('keydown',e=>{
  const row=e.target.closest('.fsrow');
  if(row&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openSec(row.dataset.sec);return}
  const gh=e.target.closest('.fgh');
  if(gh&&(e.key==='Enter'||e.key===' ')){e.preventDefault();handleOptClick({target:gh})}
});
function handleOptClick(e){
  const pc=e.target.closest('[data-pclr]');
  if(pc){clearSecF(pc.dataset.pclr);renderF();return}
  const gh=e.target.closest('.fgh');
  if(gh){
    const k=gh.closest('[data-secblk]').dataset.secblk;
    fOpenSec.has(k)?fOpenSec.delete(k):fOpenSec.add(k);
    renderF();return;
  }
  const mo=e.target.closest('[data-fmore]');
  if(mo){fMore=!fMore;renderF();return}
  const sg=e.target.closest('[data-segk]');
  if(sg){
    const gk=sg.dataset.segk;
    if(gk==='stside')FD.stside=sg.dataset.seg;
    else{FD[gk]=sg.dataset.seg;FD.dpre='any'}
    renderF();return;
  }
  const o=e.target.closest('.fo');
  if(!o||o.classList.contains('dis'))return;
  const k=o.dataset.k,v=o.dataset.v;
  if(Array.isArray(FD[k])){const j=FD[k].indexOf(v);j<0?FD[k].push(v):FD[k].splice(j,1)}else FD[k]=v;
  if(k==='rep'){
    /* representation drives which status sides exist — drop picks that no longer apply */
    const ok=new Set(sidesFor(FD));
    FD.st=FD.st.filter(t=>ok.has(t.split('|')[0]));
    if(!ok.has(FD.stside))FD.stside=[...ok][0]||'b';
  }
  renderF();
}
function syncSummaries(){
  fsbody.querySelectorAll('[data-secblk]').forEach(blk=>{const n=blk.querySelector('.fgh .n');if(n)n.textContent=secSummary(blk.dataset.secblk)});
}
function handleOptInput(e){
  const t=e.target,f=t.dataset.f;if(!f)return;
  if(f==='pmin'||f==='pmax'){
    const a=+document.getElementById('tx-pr1').value,b=+document.getElementById('tx-pr2').value;
    FD.pmin=Math.min(a,b);FD.pmax=Math.max(a,b);
    const fill=document.getElementById('tx-prfill');
    if(fill){fill.style.left=(FD.pmin/PRICE_MAX*100)+'%';fill.style.right=(100-FD.pmax/PRICE_MAX*100)+'%'}
    document.getElementById('tx-prlo').textContent=fmtM(FD.pmin);
    document.getElementById('tx-prhi').textContent=FD.pmax>=PRICE_MAX?fmtM(PRICE_MAX)+'+':fmtM(FD.pmax);
  }else{
    FD[f]=t.value;
    if(f==='ds'||f==='de'){FD.dpre='custom';(window.__filterLayout==='pane'?fpane:fsbody).querySelectorAll('[data-k="dpre"]').forEach(x=>x.classList.toggle('on',x.dataset.v==='custom'))}
  }
  if(window.__filterLayout==='pane')fsbody.innerHTML=buildRail();else syncSummaries();
  fCount();
}
fpane.addEventListener('click',handleOptClick);
fsbody.addEventListener('input',handleOptInput);
fpane.addEventListener('input',handleOptInput);
/* global search across every filter option */
(function(){
  const q=document.getElementById('tx-fsq'),qx=document.getElementById('tx-fsqx');
  if(!q)return;
  q.addEventListener('input',()=>{fQ=q.value.trim().toLowerCase();qx.hidden=!fQ;applyQ()});
  qx.addEventListener('click',()=>{q.value='';fQ='';qx.hidden=true;applyQ();q.focus()});
})();
window.__rerenderFilters=()=>{if(fsheet.classList.contains('on'))renderF();};
/* chip row: ✕ stages, Apply changes commits, Undo reverts to the applied set */
document.getElementById('tx-chips').addEventListener('click',e=>{
  const pb=e.target.closest('[data-fpend]');
  if(pb){pb.dataset.fpend==='apply'?commitF():(FD=cloneF(FA),renderChips());if(fsheet.classList.contains('on'))renderF();return}
  const cx=e.target.closest('[data-fx]');
  if(!cx)return;
  const [k,v]=cx.dataset.fx.split('|');
  clearKeyF(k,v);renderChips();
  if(fsheet.classList.contains('on'))renderF();
});
/* a tab switch re-scopes the coarse cut, so the panel and its counts redraw */
root.querySelectorAll('.tabseg .tab[data-tab]').forEach(t=>t.addEventListener('click',()=>setTimeout(()=>{
  renderChips();
  if(fsheet.classList.contains('on'))renderF();
},0)));

/* ---------- Columns popover: reorder (drag) + show/hide ---------- */
(function(){
  const btn=document.getElementById('tx-colsbtn'),pop=document.getElementById('tx-colspop');
  if(!btn||!pop)return;
  const head=root.querySelector('#tx-twrap thead tr');
  const LOCKED=['Address'];
  let hide=new Set();
  window._txHide=hide;
  window._txApplyHide=()=>applyHide();
  window._txRebuildColsPop=()=>{if(pop.classList.contains('open'))build()};
  const colTh=()=>[...head.children].filter(t=>t.dataset.col);
  const saved={h:'',o:colTh().map(t=>t.dataset.col).join('|')};
  const snap=()=>({h:[...hide].sort().join('|'),o:colTh().map(t=>t.dataset.col).join('|')});
  const dirty=()=>{const s=snap();return s.h!==saved.h||s.o!==saved.o};
  function updateSaveBtn(){const b=pop.querySelector('#tx-colssave');if(b)b.hidden=!dirty()}
  const style=document.createElement('style');document.head.appendChild(style);
  const eye='<svg viewBox="0 0 24 24"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  const eyeOff='<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 6.1A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 3.9"/><path d="M6.3 8.2A17 17 0 0 0 2 12s3.6 6.5 10 6.5a10 10 0 0 0 3.6-.6"/><path d="M9.6 9.7a2.6 2.6 0 0 0 3.6 3.7"/></svg>';
  const grip='<span class="cgrip"><svg viewBox="0 0 12 24"><circle cx="3" cy="7" r="1.4"/><circle cx="3" cy="12" r="1.4"/><circle cx="3" cy="17" r="1.4"/><circle cx="9" cy="7" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="17" r="1.4"/></svg></span>';
  function applyHide(){
    style.textContent=[...hide].map(c=>`#tx-page th[data-col="${c}"],#tx-page td[data-c="${c}"]{display:none!important}`).join('\n');
    const n=colTh().length-hide.size;
    btn.classList.toggle('on',hide.size>0);
    const dot=document.getElementById('tx-colsdot');if(dot)dot.textContent=hide.size;
    const f=pop.querySelector('#tx-colscount');if(f)f.textContent=n+' of '+colTh().length+' shown';
    if(typeof updateRail==='function')updateRail();
    updateSaveBtn();
  }
  function build(){
    pop.innerHTML='<div class="cph"><span>Columns</span><span class="cpreset" id="tx-colsall" style="display:none">Show all</span></div><div class="colslist" id="tx-colslist"></div><div class="cpf"><span id="tx-colscount"></span><button class="csave" id="tx-colssave" type="button" hidden><svg viewBox="0 0 24 24"><path d="M5 12.5l4 4L19 7"/></svg>Save table</button><span class="chint">Drag to reorder</span></div>';
    const list=pop.querySelector('#tx-colslist');
    colTh().forEach(th=>{
      const c=th.dataset.col,lock=LOCKED.includes(c),off=hide.has(c);
      const row=document.createElement('div');
      row.className='colrow'+(lock?' locked':'')+(off?' off':'');
      row.dataset.col=c;
      row.innerHTML=grip+'<span class="clabel">'+c+'</span><button class="ceye" type="button" aria-label="'+(off?'Show ':'Hide ')+c+'">'+(off?eyeOff:eye)+'</button>';
      list.appendChild(row);
    });
    pop.querySelector('#tx-colsall').onclick=e=>{e.stopPropagation();hide.clear();applyHide();build();sonner('Columns reset','All columns shown')};
    pop.querySelector('#tx-colssave').onclick=e=>{e.stopPropagation();saved.h=[...hide].sort().join('|');saved.o=colTh().map(t=>t.dataset.col).join('|');updateSaveBtn();sonner('Table saved','Column layout saved as your default')};
    list.addEventListener('click',e=>{
      const b=e.target.closest('.ceye');if(!b)return;
      e.stopPropagation();
      const row=b.closest('.colrow'),c=row.dataset.col;
      if(LOCKED.includes(c))return;
      hide.has(c)?hide.delete(c):hide.add(c);
      applyHide();build();
    });
    bindDrag(list);
    applyHide();
  }
  function bindDrag(list){
    let start=null,drag=null,target=null,after=false;
    const rows=()=>[...list.children];
    const clear=()=>rows().forEach(r=>r.classList.remove('cdrop','cdrop-after'));
    list.addEventListener('pointerdown',e=>{
      const row=e.target.closest('.colrow');
      if(!row||row.classList.contains('locked')||e.target.closest('.ceye'))return;
      start={row,y:e.clientY};
    });
    document.addEventListener('pointermove',e=>{
      if(!start)return;
      if(!drag){if(Math.abs(e.clientY-start.y)<4)return;drag=start.row;drag.classList.add('cdrag')}
      e.preventDefault();clear();target=null;
      const row=rows().find(r=>{const b=r.getBoundingClientRect();return e.clientY>=b.top&&e.clientY<=b.bottom});
      if(!row||row===drag||row.classList.contains('locked'))return;
      const b=row.getBoundingClientRect();
      after=e.clientY>b.top+b.height/2;target=row;
      row.classList.add(after?'cdrop-after':'cdrop');
    },true);
    document.addEventListener('pointerup',()=>{
      if(!start)return;
      const d=drag,t=target,aft=after;start=null;drag=null;target=null;
      if(!d)return;
      d.classList.remove('cdrag');clear();
      if(!t||t===d)return;
      t[aft?'after':'before'](d);
      /* mirror into the table: header order follows the popover list, body cells follow the header */
      const order=rows().map(r=>r.dataset.col),last=head.lastElementChild;
      order.forEach(c=>{const th=head.querySelector('th[data-col="'+c+'"]');if(th)last.before(th)});
      if(window.applyColOrderTx)window.applyColOrderTx();
      if(typeof updateRail==='function')updateRail();
      updateSaveBtn();
      sonner('Column moved',d.dataset.col+' reordered');
    },true);
  }
  function place(){
    const r=btn.getBoundingClientRect();
    pop.style.left=Math.max(8,Math.min(r.right-268,window.innerWidth-276))+'px';
    const list=pop.querySelector('.colslist');
    let h=window.innerHeight-r.bottom-90; /* leave room for the Mel ask bar */
    let top=r.bottom+6,flip=false;
    if(h<220){flip=true;h=Math.min(r.top-14,window.innerHeight-120)}
    h=Math.max(160,h);
    pop.style.maxHeight=h+'px';
    if(list)list.style.maxHeight=(h-78)+'px';
    pop.style.top=flip?Math.max(8,r.top-h-6)+'px':top+'px';
  }
  btn.addEventListener('click',e=>{
    if(e.target.closest('.colspop'))return;
    e.stopPropagation();
    const open=!pop.classList.contains('open');
    if(open){build();place()}
    pop.classList.toggle('open',open);
  });
  document.addEventListener('click',e=>{if(!e.target.closest('#tx-colsbtn'))pop.classList.remove('open')});
  window.addEventListener('resize',()=>{if(pop.classList.contains('open'))place()});
  window.addEventListener('scroll',()=>{if(pop.classList.contains('open'))place()},true);
})();

/* ---------- per-column header filter popover (clients pattern) ---------- */
const NOSORT_TX=new Set(['Status','Commission breakdown','Auditing status','Incomplete items','Comments','Collaborators','Representation']);
root.querySelectorAll('th[data-col]').forEach(th=>{
  if(NOSORT_TX.has(th.dataset.col))return;
  th.querySelector('.fic').insertAdjacentHTML('beforebegin','<svg class="sorticon" viewBox="0 0 24 24"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>');
});
const pop=document.getElementById('tx-fpop');
let curCol=null,curType=null;
const chips=document.getElementById('tx-chips');const active={};
window.__txActive=active;
/* per-column row filter (currently wired for the Address popover: address text + city multi-select) */
window._txColF=function(i){
  const r=data[i];if(!r)return true;
  const AC=window.__txActive||{};
  const a=AC['Address'];
  if(a&&a.type==='addr'){
    if(a.val){const hay=((r[0]||'')+' '+(r[1]||'')).toLowerCase();if(!hay.includes(a.val.toLowerCase()))return false}
    if(a.cities&&a.cities.length&&!a.cities.includes(r[1]))return false;
    if(a.priv&&!r[4])return false;
    if(a.needs&&!(missingOf(i).length))return false;
  }
  const pf=AC['Price'];
  if(pf&&pf.type==='number'){
    const p=moneyOf(r[5]);
    if(pf.none){if(p!=null)return false}
    else{
      if(p==null)return false;
      const mn=pf.min===''||pf.min==null?null:Number(pf.min),mx=pf.max===''||pf.max==null?null:Number(pf.max);
      if(pf.op==='gt'){if(mn!=null&&p<mn)return false}
      else if(pf.op==='lt'){if(mx!=null&&p>mx)return false}
      else if(pf.op==='eq'){if(mn!=null&&p!==mn)return false}
      else{if(mn!=null&&p<mn)return false;if(mx!=null&&p>mx)return false}
    }
  }
  const cf=AC['Client'];
  if(cf&&cf.type==='client'){
    if(cf.values&&cf.values.length&&!cf.values.includes(r[3]))return false;
    if(cf.val){const nm=String(r[3]||'').toLowerCase();if(!nm.includes(cf.val.toLowerCase()))return false}
  }
  const rp=AC['Representation'];if(rp&&rp.values&&rp.values.length&&!rp.values.includes(r[2]))return false;
  const agf=AC['Agent'];if(agf&&agf.values&&agf.values.length&&!agf.values.includes(r[7]))return false;
  const stf=AC['Status'];if(stf&&stf.tokens&&stf.tokens.length&&!stf.tokens.some(t=>stTokMatch(i,t)))return false;
  const auf=AC['Auditing status'];if(auf&&auf.values&&auf.values.length&&!auf.values.includes(auditOf(i)[0]))return false;
  const cbf=AC['Commission breakdown'];if(cbf&&cbf.values&&cbf.values.length&&!cbf.values.includes(cbStateOf(i)[0]))return false;
  const ckf=AC['Incomplete items'];if(ckf&&ckf.chk&&ckf.chk!=='any'){const op=openItemsOf(i);if(ckf.chk==='open'&&!op)return false;if(ckf.chk==='clear'&&op)return false;}
  return true;
};

function _escH(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const CHK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fmchk"><path d="M20 6 9 17l-5-5"/></svg>';
const CHK_BOX=(on)=>`<span class="fmbox" aria-hidden="true">${on?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>':''}</span>`;
const DATE_PRESETS=[
  {k:'today',lbl:'Today'},
  {k:'last7',lbl:'Last 7 days'},
  {k:'last30',lbl:'Last 30 days'},
  {k:'next30',lbl:'Next 30 days'},
  {k:'thismonth',lbl:'This month'},
  {k:'custom',lbl:'Custom range'}
];
function _colValues(col){
  const map={Address:0,Representation:2,Client:3,Price:5,Agent:7,'Acceptance date':8,Commission:9,'Close of escrow':10};
  if(col==='Status'){const s=new Set();data.forEach((r,i)=>{if(deletedTx.has(i))return;const st=(typeof stageOf==='function')?stageOf(i):r[6];if(st)s.add(st)});return [...s].sort()}
  if(col==='Auditing status')return ['Cleared','Needs review'];
  const idx=map[col];if(idx==null)return [];
  const s=new Set();data.forEach((r,i)=>{if(deletedTx.has(i))return;const v=r[idx];if(v!=null&&v!=='')s.add(v)});
  return [...s].sort();
}
function _footerRow(){
  return `<div class="rds-menu__sep"></div>
    <div class="fmfoot"><button class="rds-btn rds-btn--outline rds-btn--sm fmclr" type="button" onclick="resetFilterTx()">Clear</button><button class="rds-btn rds-btn--sm apply" type="button" onclick="applyFilterTx()">Apply filter</button></div>`;
}
/* cities Radius currently serves */
const TX_CITIES=['San Diego','San Francisco','Los Angeles','San Jose','Sacramento','Oakland','Irvine'];
/* ---- Price column filter: bands, histogram, comparator, sort ---- */
const PX_BANDS=[['Under $500K',0,500000],['$500K\u2013$1M',500000,1000000],['$1M\u2013$2M',1000000,2000000],['$2M\u2013$5M',2000000,5000000],['$5M+',5000000,'']];
let pxHB=null;
function pxNum(v){if(v==null)return null;let s=String(v).trim().toLowerCase().replace(/[$,\s]/g,'');if(!s)return null;let mul=1;if(s.endsWith('k')){mul=1e3;s=s.slice(0,-1)}else if(s.endsWith('m')){mul=1e6;s=s.slice(0,-1)}const n=parseFloat(s);return isFinite(n)?Math.round(n*mul):null}
function pxBuckets(){const NB=20,w=PRICE_MAX/NB,c=new Array(NB).fill(0);data.forEach((r,i)=>{if(deletedTx.has(i))return;const p=moneyOf(r[5]);if(p==null)return;c[Math.min(NB-1,Math.floor(p/w))]++});return {c,NB}}
function pxRangeFields(op,mn,mx){
  const mnI=`<input class="rds-input" type="text" inputmode="numeric" placeholder="Min" value="${_escH(mn)}" id="fn-min">`;
  const mxI=`<input class="rds-input" type="text" inputmode="numeric" placeholder="Max" value="${_escH(mx)}" id="fn-max">`;
  return `<div class="fnrange">${mnI}<span class="fdsep">to</span>${mxI}</div>`;
}
function pxPriceBody(cur){
  const op='between',mn=(cur.min===0||cur.min)?cur.min:'',mx=(cur.max===0||cur.max)?cur.max:'',sort=window._txPriceSort||'';
  const rng=`<div class="fmfield" id="px-rangewrap">${pxRangeFields(op,mn,mx)}</div>`;
  const hist=`<div class="pxhist" id="px-hist"><div class="pxtrack" id="px-track"><div class="pxrail"></div><div class="pxfill" id="px-fill"></div><div class="pxhandle" id="px-h0" role="slider" tabindex="0" aria-label="Minimum price"></div><div class="pxhandle" id="px-h1" role="slider" tabindex="0" aria-label="Maximum price"></div></div></div>`;
  const bands=`<div class="rds-menu__label">Quick bands</div><div class="pxbands" id="px-bands">`+PX_BANDS.map(([l,a,b])=>`<button type="button" class="pxband" data-min="${a}" data-max="${b}" data-on="false">${l}</button>`).join('')+`</div>`;
  const sortRow=`<div class="rds-menu__sep"></div><div class="rds-menu__label">Sort by price</div><div class="pxsort" id="px-sort"><button type="button" data-sort="asc" data-on="${sort==='asc'?'true':'false'}">Low \u2192 High</button><button type="button" data-sort="desc" data-on="${sort==='desc'?'true':'false'}">High \u2192 Low</button></div>`;
  return `<div class="rds-menu__label">Price</div><div class="rds-menu__sep"></div>`+rng+hist+bands+sortRow+_footerRow();
}
function pxClearRange(){const a=pop.querySelector('#fn-min'),b=pop.querySelector('#fn-max');if(a)a.value='';if(b)b.value=''}
function pxDrawHist(){
  const wrap=pop.querySelector('#px-hist');if(!wrap||wrap.hasAttribute('hidden')||!pxHB)return;
  const mnV=pxNum((pop.querySelector('#fn-min')||{}).value),mxV=pxNum((pop.querySelector('#fn-max')||{}).value);
  const lo=mnV==null?0:mnV,hi=mxV==null?PRICE_MAX:mxV;
  const lp=Math.max(0,Math.min(100,lo/PRICE_MAX*100)),rp=Math.max(0,Math.min(100,hi/PRICE_MAX*100));
  const fill=pop.querySelector('#px-fill');fill.style.left=lp+'%';fill.style.right=(100-rp)+'%';
  pop.querySelector('#px-h0').style.left=lp+'%';pop.querySelector('#px-h1').style.left=rp+'%';
}
function pxSyncBands(){
  const between=true;
  const mn=pxNum((pop.querySelector('#fn-min')||{}).value),mx=pxNum((pop.querySelector('#fn-max')||{}).value),cmn=mn==null?0:mn;
  pop.querySelectorAll('#px-bands .pxband').forEach(b=>{const bmn=Number(b.dataset.min),bmx=b.dataset.max===''?null:Number(b.dataset.max);const on=between&&cmn===bmn&&((bmx==null&&mx==null)||mx===bmx);b.dataset.on=on?'true':'false'})
}
function pxSetOp(op,fromBand){
  pop.querySelectorAll('#px-seg [data-op]').forEach(b=>b.dataset.on=(b.dataset.op===op)?'true':'false');
  const mn=(pop.querySelector('#fn-min')||{}).value||'',mx=(pop.querySelector('#fn-max')||{}).value||'';
  pop.querySelector('#px-rangewrap').innerHTML=pxRangeFields(op,mn,mx);
  const hist=pop.querySelector('#px-hist');if(op==='between')hist.removeAttribute('hidden');else hist.setAttribute('hidden','');
  if(!fromBand){pxDrawHist();pxSyncBands()}
}
function pxBindHandle(id,which){
  const h=pop.querySelector('#'+id);if(!h)return;
  h.addEventListener('pointerdown',e=>{e.preventDefault();try{h.setPointerCapture(e.pointerId)}catch(_){}
    const track=pop.querySelector('#px-track'),rect=track.getBoundingClientRect();
    const move=ev=>{let f=(ev.clientX-rect.left)/rect.width;f=Math.max(0,Math.min(1,f));let val=Math.round(f*PRICE_MAX/50000)*50000;
      const mnEl=pop.querySelector('#fn-min'),mxEl=pop.querySelector('#fn-max');if(!mnEl||!mxEl)return;
      if(which==='lo'){let hi=pxNum(mxEl.value);if(hi==null)hi=PRICE_MAX;if(val>hi)val=hi;mnEl.value=val>0?val:''}
      else{let lo=pxNum(mnEl.value);if(lo==null)lo=0;if(val<lo)val=lo;mxEl.value=val>=PRICE_MAX?'':val}
      pxDrawHist();pxSyncBands();
    };
    const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};
    window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
  });
}
function pxWire(){
  pxHB=pxBuckets();
  const seg=pop.querySelector('#px-seg');if(seg)seg.addEventListener('click',e=>{const b=e.target.closest('[data-op]');if(b)pxSetOp(b.dataset.op)});
  const bands=pop.querySelector('#px-bands');if(bands)bands.addEventListener('click',e=>{const b=e.target.closest('.pxband');if(!b)return;
    if(b.dataset.on==='true'){pxClearRange()}else{pxSetOp('between',true);const mnEl=pop.querySelector('#fn-min'),mxEl=pop.querySelector('#fn-max');if(mnEl)mnEl.value=Number(b.dataset.min)>0?b.dataset.min:'';if(mxEl)mxEl.value=b.dataset.max}
    pxDrawHist();pxSyncBands()});
  const sort=pop.querySelector('#px-sort');if(sort)sort.addEventListener('click',e=>{const b=e.target.closest('[data-sort]');if(!b)return;const on=b.dataset.on==='true';sort.querySelectorAll('[data-sort]').forEach(x=>x.dataset.on='false');if(!on)b.dataset.on='true'});
  const rw=pop.querySelector('#px-rangewrap');if(rw)rw.addEventListener('input',e=>{if(e.target.id==='fn-min'||e.target.id==='fn-max'){pxDrawHist();pxSyncBands()}});
  pxBindHandle('px-h0','lo');pxBindHandle('px-h1','hi');
  pxDrawHist();pxSyncBands();
}
function clientBody(cur){
  const vals=_colValues('Client').slice(0,5);const sel=new Set(cur.values||[]);
  const sort=window._txClientSort||'';
  const field=`<div class="rds-menu__label">Client</div><div class="rds-menu__sep"></div><div class="fmfield"><input class="rds-input" type="text" id="tx-fval" placeholder="Search clients" value="${_escH(cur.val||'')}" autocomplete="off"></div>`;
  const seg=`<div class="txclsort" id="tx-clsort"><button type="button" data-sort="asc" data-on="${sort==='asc'?'true':'false'}">A \u2192 Z</button><button type="button" data-sort="desc" data-on="${sort==='desc'?'true':'false'}">Z \u2192 A</button></div><div class="rds-menu__sep"></div>`;
  const list=`<div id="tx-cllist">`+vals.map(v=>`<div class="rds-menu__item fmopt" role="menuitemcheckbox" aria-checked="${sel.has(v)?'true':'false'}" data-val="${_escH(v)}" data-active="${sel.has(v)?'true':'false'}">${CHK_BOX(sel.has(v))}<span class="fmlab">${_escH(v)}</span></div>`).join('')+`</div>`;
  return field+seg+list+_footerRow();
}
function repSides(v){const s=SIDE(v);return s==='dual'?['b','s']:s==='buyer'?['b']:s==='referral'?['r']:['s'];}
const _flabel=t=>`<div class="rds-menu__label">${_escH(t)}</div><div class="rds-menu__sep"></div>`;
const CHK_INNER='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const _fmoptVal=(v,on,n)=>`<div class="rds-menu__item fmopt" role="menuitemcheckbox" aria-checked="${on}" data-val="${_escH(v)}" data-active="${on}">${CHK_BOX(on)}<span class="fmlab">${_escH(v)}</span>${n==null?'':'<span class="fmct">'+n+'</span>'}</div>`;
let stSel=new Set(),stSide='b';
function _stListHTML(){const base=baseRowsF();return ST_BY_SIDE[stSide].map(lb=>{const tok=stTok(stSide,lb);const on=stSel.has(tok);const n=base.filter(i=>stTokMatch(i,tok)).length;return `<div class="rds-menu__item fmopt" role="menuitemcheckbox" aria-checked="${on}" data-tok="${_escH(tok)}" data-active="${on}">${CHK_BOX(on)}<span class="fmlab">${_escH(lb)}</span><span class="fmct">${n}</span></div>`}).join('')}
function statusBody(cur){
  stSel=new Set(cur.tokens||[]);
  const repSet=(active['Representation']&&active['Representation'].values&&active['Representation'].values.length)?['b','s','r']:['b','s'];
  if(!repSet.includes(stSide))stSide=repSet[0];
  const tabs=ST_SIDES.filter(s=>repSet.includes(s[0])).map(([k,l])=>`<button type="button" class="txstab" data-side="${k}" data-on="${k===stSide?'true':'false'}">${_escH(l)}</button>`).join('');
  return _flabel('Status')+`<div class="txstabs" id="tx-stabs">${tabs}</div><div id="tx-stlist">${_stListHTML()}</div>`+_footerRow();
}
function auditBody(cur){const sel=new Set(cur.values||[]);const base=baseRowsF();return _flabel('Auditing status')+['Not started','In review','Complete'].map(v=>_fmoptVal(v,sel.has(v),base.filter(i=>auditOf(i)[0]===v).length)).join('')+_footerRow();}
function cbBody(cur){const sel=new Set(cur.values||[]);const base=baseRowsF();return _flabel('Commission breakdown')+['Confirmed','Pending approval','Completed'].map(v=>_fmoptVal(v,sel.has(v),base.filter(i=>cbStateOf(i)[0]===v).length)).join('')+_footerRow();}
function chkBody(cur){const c=cur.chk||'any';const item=(v,l)=>`<div class="rds-menu__item fmopt" role="menuitemcheckbox" data-chk="${v}" aria-checked="${c===v}" data-active="${c===v}">${CHK_BOX(c===v)}<span class="fmlab">${l}</span></div>`;return _flabel('Incomplete items')+item('open','Has open items')+item('clear','No open items')+_footerRow();}
function buildFbody(col,type){
  const cur=active[col]||{};
  if(col==='Client')return clientBody(cur);
  if(col==='Status')return statusBody(cur);
  if(col==='Auditing status')return auditBody(cur);
  if(col==='Commission breakdown')return cbBody(cur);
  if(col==='Incomplete items')return chkBody(cur);
  const head=`<div class="rds-menu__label">${_escH(col)}</div>
    <div class="rds-menu__sep"></div>`;
  if(col==='Address'){
    const cities=TX_CITIES;
    const selC=new Set(cur.cities||[]);
    const cityOpts=cities.map(v=>`<div class="rds-menu__item fmopt" role="menuitemcheckbox" aria-checked="${selC.has(v)?'true':'false'}" data-val="${_escH(v)}" data-active="${selC.has(v)?'true':'false'}">${CHK_BOX(selC.has(v))}<span class="fmlab">${_escH(v)}</span></div>`).join('');
    return head+`<div class="fmfield">
      <input class="rds-input" type="text" id="tx-fval" placeholder="Search address" value="${_escH(cur.val||'')}" autocomplete="off">
    </div>
    <div class="rds-menu__sep"></div>
    <div class="rds-menu__label">City</div>
    <div class="fmfield">
      <input class="rds-input" type="text" id="tx-citysearch" placeholder="Search city" autocomplete="off">
    </div>
    <div id="tx-citylist">${cityOpts}</div>
    <div class="rds-menu__label" id="tx-citynone" style="text-align:center;padding:8px;display:none">No matching city</div>
    <div class="rds-menu__sep"></div>
    <div class="rds-menu__item fmopt" id="tx-fpriv" role="menuitemcheckbox" aria-checked="${cur.priv?'true':'false'}" data-active="${cur.priv?'true':'false'}">${CHK_BOX(!!cur.priv)}<span class="fmlab">Only private transactions</span></div>
    <div class="rds-menu__item fmopt" id="tx-fneeds" role="menuitemcheckbox" aria-checked="${cur.needs?'true':'false'}" data-active="${cur.needs?'true':'false'}">${CHK_BOX(!!cur.needs)}<span class="fmlab">Only additional details</span></div>`+_footerRow();
  }
  if(type==='multi'){
    const vals=_colValues(col);const sel=new Set(cur.values||[]);
    const opts=vals.map(v=>`<div class="rds-menu__item fmopt" role="menuitemcheckbox" aria-checked="${sel.has(v)?'true':'false'}" data-val="${_escH(v)}" data-active="${sel.has(v)?'true':'false'}">${CHK_BOX(sel.has(v))}<span class="fmlab">${_escH(v)}</span></div>`).join('')||'<div class="rds-menu__label" style="text-align:center;padding:12px">No values</div>';
    return head+`<div class="fmfield"><input class="rds-input" type="text" id="tx-multisearch" placeholder="Search ${_escH(col)}" autocomplete="off"></div><div id="tx-multilist">${opts}</div>`+_footerRow();
  }
  if(col==='Price'){
    return pxPriceBody(cur);
  }
  if(type==='number'){
    return head+`<div class="fmfield">
      <div class="fnrange">
        <input class="rds-input" type="text" inputmode="numeric" placeholder="Min" value="${_escH(cur.min||'')}" id="fn-min">
        <span class="fdsep">to</span>
        <input class="rds-input" type="text" inputmode="numeric" placeholder="Max" value="${_escH(cur.max||'')}" id="fn-max">
      </div>
    </div>`+_footerRow();
  }
  if(type==='date'){
    const p=cur.preset||'';
    const presets=DATE_PRESETS.map(d=>`<div class="rds-menu__item fdpreset" role="menuitemradio" aria-checked="${p===d.k?'true':'false'}" data-preset="${d.k}">${p===d.k?CHK_SVG:""}<span>${d.lbl}</span></div>`).join('');
    return head+presets+`<div class="rds-menu__sep"></div>
    <div class="rds-menu__label">Custom range</div>
    <div class="fmfield">
      <div class="fdrange">
        <input class="rds-input" type="date" id="fd-from" value="${_escH(cur.from||'')}">
        <span class="fdsep">to</span>
        <input class="rds-input" type="date" id="fd-to" value="${_escH(cur.to||'')}">
      </div>
    </div>`+_footerRow();
  }
  return head+`<div class="fmfield">
    <input class="rds-input" type="text" id="tx-fval" placeholder="Search ${_escH(col)}" value="${_escH(cur.val||'')}" autocomplete="off">
  </div>`+_footerRow();
}
function _wireFbody(){
  const items=pop.querySelectorAll('.fmopt');
  if(items.length&&!pop._fmBound){
    pop.addEventListener('click',_fmClick);pop._fmBound=true;
  }
  const citySearch=pop.querySelector('#tx-citysearch');
  if(citySearch){
    citySearch.addEventListener('input',()=>{
      const q=citySearch.value.trim().toLowerCase();
      let shown=0;
      pop.querySelectorAll('#tx-citylist .fmopt').forEach(o=>{
        const hit=o.dataset.val.toLowerCase().includes(q);
        o.style.display=hit?'':'none';if(hit)shown++;
      });
      const none=pop.querySelector('#tx-citynone');if(none)none.style.display=shown?'none':'';
    });
  }
  const presets=pop.querySelectorAll('.fdpreset');
  if(presets.length){
    if(!pop._fdBound){pop.addEventListener('click',_fdClick);pop._fdBound=true;}
    const from=pop.querySelector('#fd-from'),to=pop.querySelector('#fd-to');
    [from,to].forEach(inp=>inp&&inp.addEventListener('input',()=>pop.querySelectorAll('.fdpreset').forEach(p=>{p.dataset.active='false';p.setAttribute('aria-checked','false');const s=p.querySelector('.fmchk');if(s)s.remove()})));
  }
  const ms=pop.querySelector('#tx-multisearch');
  if(ms)ms.addEventListener('input',()=>{const q=ms.value.trim().toLowerCase();pop.querySelectorAll('#tx-multilist .fmopt').forEach(o=>{o.style.display=o.dataset.val.toLowerCase().includes(q)?'':'none'})});
  if(curCol==='Price')pxWire();
  if(curCol==='Client'){
    const seg=pop.querySelector('#tx-clsort');
    if(seg)seg.addEventListener('click',e=>{const b=e.target.closest('[data-sort]');if(!b)return;const on=b.dataset.on==='true';seg.querySelectorAll('[data-sort]').forEach(x=>x.dataset.on='false');if(!on)b.dataset.on='true'});
    const fv=pop.querySelector('#tx-fval');
    if(fv)fv.addEventListener('input',()=>{const q=fv.value.trim().toLowerCase();pop.querySelectorAll('#tx-cllist .fmopt').forEach(o=>{o.style.display=o.dataset.val.toLowerCase().includes(q)?'':'none'})});
  }
  if(curCol==='Status'){
    const tabs=pop.querySelector('#tx-stabs'),list=pop.querySelector('#tx-stlist');
    if(tabs)tabs.addEventListener('click',e=>{const b=e.target.closest('.txstab');if(!b)return;stSide=b.dataset.side;tabs.querySelectorAll('.txstab').forEach(x=>x.dataset.on=(x===b)?'true':'false');if(list)list.innerHTML=_stListHTML();});
    if(list)list.addEventListener('click',e=>{const it=e.target.closest('.fmopt');if(!it)return;e.stopPropagation();const tok=it.dataset.tok,on=stSel.has(tok);if(on)stSel.delete(tok);else stSel.add(tok);it.dataset.active=on?'false':'true';it.setAttribute('aria-checked',on?'false':'true');const box=it.querySelector('.fmbox');if(box)box.innerHTML=on?'':CHK_INNER;});
  }
  if(curCol==='Incomplete items'&&!pop._ckBound){pop._ckBound=true;pop.addEventListener('click',e=>{const it=e.target.closest('.fmopt[data-chk]');if(!it)return;setTimeout(()=>{pop.querySelectorAll('.fmopt[data-chk]').forEach(o=>{if(o!==it){o.dataset.active='false';o.setAttribute('aria-checked','false');const b=o.querySelector('.fmbox');if(b)b.innerHTML=''}})},0);});}
}
function _fmClick(e){
  const it=e.target.closest('.fmopt');if(!it||!pop.contains(it))return;
  const on=it.dataset.active==='true';
  it.dataset.active=on?'false':'true';
  it.setAttribute('aria-checked',on?'false':'true');
  const box=it.querySelector('.fmbox');
  if(box)box.innerHTML=on?'':'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
}
function _fdClick(e){
  const it=e.target.closest('.fdpreset');if(!it||!pop.contains(it))return;
  pop.querySelectorAll('.fdpreset').forEach(p=>{p.dataset.active='false';p.setAttribute('aria-checked','false');const s=p.querySelector('svg');if(s)s.outerHTML=BLANK_SVG});
  it.dataset.active='true';it.setAttribute('aria-checked','true');
  const s=it.querySelector('svg');if(s)s.outerHTML=CHK_SVG;
  const rng=_dateRangeFor(it.dataset.preset);
  if(rng){const from=pop.querySelector('#fd-from'),to=pop.querySelector('#fd-to');if(from)from.value=rng.from;if(to)to.value=rng.to}
}
function _dateRangeFor(k){
  const t=new Date();t.setHours(0,0,0,0);const fmt=d=>d.toISOString().slice(0,10);
  const d=new Date(t);
  if(k==='today')return {from:fmt(t),to:fmt(t)};
  if(k==='last7'){d.setDate(t.getDate()-7);return {from:fmt(d),to:fmt(t)}}
  if(k==='last30'){d.setDate(t.getDate()-30);return {from:fmt(d),to:fmt(t)}}
  if(k==='next30'){d.setDate(t.getDate()+30);return {from:fmt(t),to:fmt(d)}}
  if(k==='thismonth'){const s=new Date(t.getFullYear(),t.getMonth(),1),e=new Date(t.getFullYear(),t.getMonth()+1,0);return {from:fmt(s),to:fmt(e)}}
  return null;
}
root.querySelectorAll('th[data-col]').forEach(th=>{
  th.addEventListener('click',e=>{
    if(e.target.closest('.fic'))return;
    if(e.target.closest('.colresize'))return;
    if(window._justResized)return;
    if(th.dataset.col==='Comments'||th.dataset.col==='Collaborators')return;
    curCol=th.dataset.col;curType=th.dataset.ftype||'text';
    pop.innerHTML=buildFbody(curCol,curType);
    _wireFbody();
    const wrap=root.getBoundingClientRect();
    const r=th.getBoundingClientRect();
    const w=(curType==='date'||curCol==='Price')?300:(curType==='number')?280:240;
    pop.style.width=w+'px';
    pop.style.left=Math.max(8,Math.min(r.left-wrap.left, wrap.width-w-8))+'px';
    pop.style.top=(r.bottom-wrap.top+4)+'px';
    pop.classList.add('open');
    const first=pop.querySelector('input:not([type=checkbox])');
    if(first&&curType!=='date')setTimeout(()=>first.focus(),50);
  });
});
function closePopTx(){pop.classList.remove('open')}
document.addEventListener('click',e=>{if(!e.target.closest('.fpop')&&!e.target.closest('th'))closePopTx()});
function toggleOpsTx(e){}
function pickOpTx(el){}
function resetFilterTx(){if(!curCol)return;if(curCol==='Price')window._txPriceSort=null;if(curCol==='Client')window._txClientSort=null;delete active[curCol];pop.innerHTML=buildFbody(curCol,curType);_wireFbody();renderChips();renderTable();}
function applyFilterTx(){
  if(!curCol)return;
  let entry=null,summary='';
  if(curCol==='Address'){
    const v=(pop.querySelector('#tx-fval')||{}).value||'';
    const cities=[...pop.querySelectorAll('#tx-citylist .fmopt[data-active="true"]')].map(b=>b.dataset.val);
    const pe=pop.querySelector('#tx-fpriv'),ne=pop.querySelector('#tx-fneeds');
    const priv=!!(pe&&pe.dataset.active==='true'),needs=!!(ne&&ne.dataset.active==='true');
    if(v.trim()||cities.length||priv||needs){
      entry={type:'addr',val:v.trim(),cities,priv,needs};
      const parts=[];
      if(v.trim())parts.push('contains "'+v.trim()+'"');
      if(cities.length)parts.push(cities.length===1?'in '+cities[0]:'in '+cities.length+' cities');
      if(priv)parts.push('private');
      if(needs)parts.push('additional details');
      summary=parts.join(' \u00b7 ');
    }
  } else if(curCol==='Status'){
    const tokens=[...stSel];
    if(tokens.length){entry={type:'status',tokens};summary=tokens.length===1?tokens[0].split('|')[1]:tokens.length+' statuses';const sides=new Set(tokens.map(t=>t.split('|')[0]));const reps=REP_SET.filter(v=>repSides(v).some(s=>sides.has(s)));if(reps.length)active['Representation']={type:'multi',values:reps};}
  } else if(curCol==='Auditing status'){
    const vals=[...pop.querySelectorAll('.fmopt[data-active="true"]')].map(b=>b.dataset.val);
    if(vals.length){entry={type:'audit',values:vals};summary=vals.length===1?vals[0]:vals.length+' selected'}
  } else if(curCol==='Commission breakdown'){
    const vals=[...pop.querySelectorAll('.fmopt[data-active="true"]')].map(b=>b.dataset.val);
    if(vals.length){entry={type:'cb',values:vals};summary=vals.length===1?vals[0]:vals.length+' selected'}
  } else if(curCol==='Incomplete items'){
    const el=pop.querySelector('.fmopt[data-chk][data-active="true"]');const chk=el?el.dataset.chk:'any';
    if(chk!=='any'){entry={type:'chk',chk};summary=chk==='open'?'Has open items':'No open items'}
  } else if(curCol==='Client'){
    const v=((pop.querySelector('#tx-fval')||{}).value||'').trim();
    const vals=[...pop.querySelectorAll('#tx-cllist .fmopt[data-active="true"]')].map(b=>b.dataset.val);
    const sEl=pop.querySelector('#tx-clsort [data-sort][data-on="true"]');window._txClientSort=sEl?sEl.dataset.sort:null;
    if(v||vals.length){entry={type:'client',val:v,values:vals};summary=vals.length?(vals.length===1?'is '+vals[0]:'is any of ('+vals.length+')'):'contains "'+v+'"'}
  } else if(curType==='text'){
    const v=(pop.querySelector('#tx-fval')||{}).value||'';
    if(v.trim()){entry={type:'text',val:v.trim()};summary='contains "'+v.trim()+'"'}
  } else if(curType==='multi'){
    const items=pop.querySelectorAll('.fmopt[data-active="true"]');
    const vals=[...items].map(b=>b.dataset.val);
    if(vals.length){entry={type:'multi',values:vals};summary=vals.length===1?'is '+vals[0]:'is any of ('+vals.length+')'}
  } else if(curCol==='Price'){
    const mn=pxNum((pop.querySelector('#fn-min')||{}).value),mx=pxNum((pop.querySelector('#fn-max')||{}).value);
    const sEl=pop.querySelector('#px-sort [data-sort][data-on="true"]');window._txPriceSort=sEl?sEl.dataset.sort:null;
    if(mn!=null||mx!=null){entry={type:'number',money:true,op:'between',min:mn==null?'':mn,max:mx==null?'':mx};summary=(mn!=null&&mx!=null)?fmtM(mn)+'\u2013'+fmtM(mx):mn!=null?'\u2265 '+fmtM(mn):'\u2264 '+fmtM(mx)}
  } else if(curType==='number'){
    const mn=pop.querySelector('#fn-min').value.trim(),mx=pop.querySelector('#fn-max').value.trim();
    if(mn||mx){entry={type:'number',min:mn,max:mx};summary=mn&&mx?mn+'–'+mx:mn?'≥ '+mn:'≤ '+mx}
  } else if(curType==='date'){
    const from=pop.querySelector('#fd-from').value,to=pop.querySelector('#fd-to').value;
    const preset=[...pop.querySelectorAll('.fdpreset[data-active="true"]')].map(p=>p.dataset.preset)[0]||'';
    if(from||to){entry={type:'date',from,to,preset};const p=DATE_PRESETS.find(d=>d.k===preset);summary=p&&preset!=='custom'?p.lbl:(from&&to?from+' → '+to:from?'from '+from:'until '+to)}
  }
  if(entry)active[curCol]=entry;else delete active[curCol];
  closePopTx();renderChips();renderTable();
  if(entry&&window.sonner)sonner('Filter applied',curCol+' '+summary);
}
function removeFilterTx(col){delete active[col];renderChips();renderTable()}
function _fmtActive(a){
  if(a.type==='status'){return a.tokens&&a.tokens.length>1?a.tokens.length+' statuses':(a.tokens&&a.tokens[0]?a.tokens[0].split('|')[1]:'')}
  if(a.type==='audit'||a.type==='cb'){return a.values&&a.values.length>1?a.values.length+' selected':(a.values?a.values[0]:'')}
  if(a.type==='chk'){return a.chk==='open'?'Has open items':'No open items'}
  if(a.type==='client'){const p=[];if(a.values&&a.values.length)p.push(a.values.length===1?'is '+a.values[0]:a.values.length+' clients');if(a.val)p.push('contains "'+a.val+'"');return p.join(' \u00b7 ')}
  if(a.type==='addr'){const p=[];if(a.val)p.push('contains "'+a.val+'"');if(a.cities&&a.cities.length)p.push(a.cities.length===1?'in '+a.cities[0]:a.cities.length+' cities');if(a.priv)p.push('private');if(a.needs)p.push('additional details');return p.join(' \u00b7 ')}
  if(a.type==='text')return 'contains "'+a.val+'"';
  if(a.type==='multi')return a.values.length===1?'is '+a.values[0]:'is any of '+a.values.length;
  if(a.type==='number'){
    if(a.none)return 'no price set';
    if(a.money){const F=fmtM,mn=a.min===''||a.min==null?null:Number(a.min),mx=a.max===''||a.max==null?null:Number(a.max);
      if(a.op==='gt')return '\u2265 '+F(mn);if(a.op==='lt')return '\u2264 '+F(mx);if(a.op==='eq')return '= '+F(mn);
      return mn!=null&&mx!=null?F(mn)+'\u2013'+F(mx):mn!=null?'\u2265 '+F(mn):'\u2264 '+F(mx);}
    return a.min&&a.max?a.min+'–'+a.max:a.min?'≥ '+a.min:'≤ '+a.max;
  }
  if(a.type==='date'){const p=DATE_PRESETS.find(d=>d.k===a.preset);return p&&a.preset!=='custom'?p.lbl:(a.from&&a.to?a.from+' → '+a.to:a.from?'from '+a.from:'until '+a.to)}
  return '';
}
function renderChips(){
  const keys=Object.keys(active);
  const sheetHTML=window._txSheetChips?window._txSheetChips():'';
  chips.classList.toggle('on',keys.length>0||!!sheetHTML);
  chips.innerHTML=sheetHTML+keys.map(k=>`<span class="chip"><b>${_escH(k)}</b> ${_escH(_fmtActive(active[k]))} <span class="cx" onclick="removeFilterTx('${k.replace(/'/g,"\\'")}')">✕</span></span>`).join('');
  root.querySelectorAll('.fic').forEach(f=>{f.innerHTML='';const t=f.closest('th');if(t)t.classList.remove('filtered')});
  keys.forEach(k=>{const f=document.getElementById('tx-fic-'+k);if(!f)return;
    f.innerHTML='<span class="ficb"></span>';
    f.firstChild.title=k+' '+_fmtActive(active[k]);
    const t=f.closest('th');if(t)t.classList.add('filtered');});
}
window.resetFilterTx=resetFilterTx;


/* ---------- sticky-column icon rail (columns scrolled left) ---------- */
const colIcon={
 txtype:'<svg viewBox="0 0 24 24"><path d="M3 9h18M3 15h18M9 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
 type:'<svg viewBox="0 0 24 24"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
 client:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg>',
 price:'<svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
 status:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
 agent:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg>',
 acceptance:'<span class="ytd">YTD</span>',
 commission:'<svg viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
 coe:'<span class="ytd">YTD</span>',
 audit:'<svg viewBox="0 0 24 24"><path d="M9 11l3 3 5-6"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg>',
 incomplete:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/></svg>',
 comments:'<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/></svg>',
 collabs:'<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 21v-1a6 6 0 0 1 12 0v1M14 21v-1a6 6 0 0 1 8-5"/></svg>'
};
const twrapEl=document.getElementById('tx-twrap'),hrail=document.getElementById('tx-hrail');
function updateRail(){
  const sl=twrapEl.scrollLeft;
  twrapEl.classList.toggle('hscrolled',sl>2);
  /* Anchor the fade + column rail to the REAL right edge of the last frozen column,
     measured in the overlay's own coordinate space. Summing widths (and assuming a
     36px select column that may be hidden, or that nth-child(2) is still Address after
     a reorder) drifts the fade onto an unrelated column. */
  const stickyThs=[...twrapEl.querySelectorAll('thead th')].filter(h=>{const s=getComputedStyle(h);return s.position==='sticky'&&s.left!=='auto'});
  const op=(document.getElementById('tx-hfade').offsetParent||twrapEl.offsetParent||document.body).getBoundingClientRect();
  const lastSticky=stickyThs[stickyThs.length-1];
  const twr=twrapEl.getBoundingClientRect();
  const stickyRight=Math.round((lastSticky?lastSticky.getBoundingClientRect().right:twr.left)-op.left);
  const frozenW=Math.round(lastSticky?lastSticky.getBoundingClientRect().right-twr.left:0);
  const hidden=[];
  root.querySelectorAll('th[data-icon]').forEach(th=>{
    if(th.dataset.icon==='address')return;
    if(th.offsetLeft+th.offsetWidth-sl < frozenW+8){
      hidden.push({name:th.textContent.trim(),icon:th.dataset.icon,x:th.offsetLeft});
    }
  });
  const MAX=5;
  let html=hidden.slice(0,MAX).map(h=>`<button title="${h.name}" onclick="goColTx(${h.x})">${colIcon[h.icon]||''}</button>`).join('');
  if(hidden.length>MAX){
    const rest=hidden.slice(MAX).map(h=>`<div class='hitem' onclick='goColTx(${h.x})' style="display:flex;align-items:center;gap:8px;height:30px;padding:0 8px;font-size:13px;color:var(--neutral-600);cursor:pointer">${colIcon[h.icon]||''} ${h.name}</div>`).join('');
    html+=`<button title="more" onclick="this.nextElementSibling?.remove():null">+${hidden.length-MAX}</button>`;
  }
  hrail.innerHTML=html;
  hrail.classList.toggle('on',html!=='');
  const fade=document.getElementById('tx-hfade');
  fade.classList.toggle('on',sl>2);
  if(sl>2){fade.style.left=stickyRight+'px';fade.style.top=(Math.round(twrapEl.getBoundingClientRect().top-op.top))+'px';fade.style.height=twrapEl.clientHeight+'px'}
  if(html!==''){hrail.style.left=(stickyRight+10)+'px';hrail.style.top=(twrapEl.offsetTop+42)+'px'}
}
function goColTx(x){twrapEl.scrollTo({left:Math.max(0,x-260),behavior:'smooth'})}
twrapEl.addEventListener('scroll',updateRail);
window.addEventListener('resize',updateRail);
updateRail();

/* ---------- column resize (drag both wider and narrower, floor at 60px) — was missing on this page ---------- */
(function(){
  let resizing=null;
  function setupHandles(){
    root.querySelectorAll('#tx-twrap th[data-col],#tx-twrap th[data-icon]').forEach(th=>{
      if(th.querySelector('.colresize'))return;
      if(!th.dataset.defaultWidth){
        th.dataset.defaultWidth=Math.round(th.getBoundingClientRect().width);
      }
      const h=document.createElement('span');
      h.className='colresize';
      h.addEventListener('mousedown',e=>{
        e.preventDefault();
        e.stopPropagation();
        const rect=th.getBoundingClientRect();
        resizing={
          th,
          handle:h,
          startX:e.clientX,
          startWidth:rect.width,
          defaultWidth:parseFloat(th.dataset.defaultWidth)||rect.width
        };
        h.classList.add('active');
        document.body.classList.add('col-resizing');
      });
      th.appendChild(h);
    });
  }
  setupHandles();
  document.addEventListener('mousemove',e=>{
    if(!resizing)return;
    const delta=e.clientX-resizing.startX;
    const MIN_COL_W=60; /* hard floor — shrinkable now, not expand-only, but never below usable width */
    const w=Math.max(MIN_COL_W,Math.round(resizing.startWidth+delta));
    resizing.th.style.width=w+'px';
    resizing.th.style.minWidth=w+'px';
  });
  document.addEventListener('mouseup',()=>{
    if(!resizing)return;
    resizing.handle.classList.remove('active');
    document.body.classList.remove('col-resizing');
    resizing=null;
    window._justResized=true;
    setTimeout(()=>{window._justResized=false},80);
    if(typeof updateRail==='function')updateRail();
  });
})();

/* ---------- column drag-reorder (Address stays pinned; widths follow the column, not its slot) ---------- */
(function(){
  const head=root.querySelector('#tx-twrap thead tr');
  if(!head)return;
  const movable=th=>!!th.dataset.col;
  const ths=()=>[...head.children];
  ths().forEach(th=>{
    if(!movable(th)||th.querySelector('.grip'))return;
    th.insertAdjacentHTML('afterbegin','<span class="grip"><svg viewBox="0 0 12 24"><circle cx="3" cy="6" r="1.4"/><circle cx="3" cy="12" r="1.4"/><circle cx="3" cy="18" r="1.4"/><circle cx="9" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/></svg></span>');
  });
  let start=null,drag=null,target=null,after=false;
  function clearMarks(){ths().forEach(t=>t.classList.remove('coldrop','coldrop-after'))}
  head.addEventListener('pointerdown',e=>{
    const th=e.target.closest('th');
    if(!th||!movable(th))return;
    if(e.target.closest('.colresize')||e.target.closest('.fic'))return;
    start={th,x:e.clientX};
  },true);
  document.addEventListener('pointermove',e=>{
    if(!start)return;
    if(!drag){
      if(Math.abs(e.clientX-start.x)<5)return;
      drag=start.th;drag.classList.add('coldrag');document.body.classList.add('col-dragging');
      closePopTx();
    }
    e.preventDefault();
    clearMarks();target=null;
    const th=ths().filter(movable).find(t=>{
      const b=t.getBoundingClientRect();
      return e.clientX>=b.left&&e.clientX<=b.right;
    });
    if(!th||th===drag)return;
    const r=th.getBoundingClientRect();
    after=e.clientX>r.left+r.width/2;
    target=th;
    th.classList.add(after?'coldrop-after':'coldrop');
  },true);
  window.applyColOrderTx=function(){
    const keys=ths().map((t,i)=>t.dataset.col||(i===0?'_sel':'_menu'));
    root.querySelectorAll('#tx-tb tr').forEach(tr=>{
      const map={};[...tr.children].forEach(c=>map[c.dataset.c]=c);
      keys.forEach(k=>{if(map[k])tr.appendChild(map[k])});
    });
  };
  document.addEventListener('pointerup',()=>{
    if(!start)return;
    const d=drag,t=target,aft=after;
    start=null;drag=null;target=null;
    if(!d){return}
    d.classList.remove('coldrag');document.body.classList.remove('col-dragging');clearMarks();
    if(t&&t!==d){
      const from=ths().indexOf(d);
      t[aft?'after':'before'](d);
      const to=ths().indexOf(d);
      root.querySelectorAll('#tx-tb tr').forEach(tr=>{
        const cells=[...tr.children],cell=cells[from];
        if(!cell)return;
        const ref=cells[from<to?to:to];
        if(from<to)ref.after(cell);else ref.before(cell);
      });
    }
    window._justResized=true;setTimeout(()=>{window._justResized=false},80);
    if(typeof updateRail==='function')updateRail();
  },true);
})();

/* ---------- row ⋮ menu — Open / toggle private / Archive ---------- */
const rmPop=document.createElement('div');rmPop.className='rmpop';document.body.appendChild(rmPop);
function openRowMenu(e,i){
  e.stopPropagation();
  const r=e.currentTarget.getBoundingClientRect();
  rmPop.innerHTML=`
    <div class="rmitem" onclick="rmPop.classList.remove('open')"><svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>Open transaction</div>
    <div class="rmitem" onclick="togglePrivate(${i})"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>${data[i][4]?'Remove privacy':'Mark private'}</div>
    <div class="rmitem danger hold" data-del="${i}" role="button" tabindex="0" aria-label="Hold to delete transaction"><span class="hf"></span><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/></svg><span>Hold to delete</span></div>`;
  bindHoldDelete();
  rmPop.style.top=(r.bottom+4)+'px';
  rmPop.style.left=Math.max(8,r.left-150)+'px';
  rmPop.classList.add('open');
  const pr=rmPop.getBoundingClientRect();
  if(pr.right>window.innerWidth-8)rmPop.style.left=(window.innerWidth-pr.width-8)+'px';
  if(pr.bottom>window.innerHeight-8)rmPop.style.top=(r.top-pr.height-4)+'px';
}
/* Delete is deliberate: press and hold 2s (the fill mirrors the wait), release cancels.
   Reduced motion gets the confirm dialog instead of a timed fill. */
function bindHoldDelete(){
  const el=rmPop.querySelector('.rmitem.hold');
  if(!el)return;
  const i=+el.dataset.del;
  let t=null;
  const stop=()=>{clearTimeout(t);t=null;el.classList.remove('holding')};
  const commit=()=>{stop();rmPop.classList.remove('open');deleteTx(i)};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){
    el.querySelector('span:last-child').textContent='Delete transaction';
    el.addEventListener('click',()=>{rmPop.classList.remove('open');
      askPrivacy('Delete this transaction?',labelOfTx(i)+' will be removed from the workspace.','Delete').then(ok=>{if(ok)deleteTx(i)})});
    return;
  }
  el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture&&el.setPointerCapture(e.pointerId);el.classList.add('holding');t=setTimeout(commit,2000)});
  el.addEventListener('pointerup',stop);
  el.addEventListener('pointercancel',stop);
  el.addEventListener('pointerleave',stop);
  el.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!t){e.preventDefault();el.classList.add('holding');t=setTimeout(commit,2000)}});
  el.addEventListener('keyup',stop);
  el.addEventListener('blur',stop);
}
function labelOfTx(i){const r=data[i];return '\u201c'+(r[2]==='Referral'?'Referral \u2014 '+r[3]:r[0])+'\u201d'}
function deleteTx(i){
  deletedTx.add(i);renderTable();
  if(typeof sonner==='function')sonner('Transaction deleted',labelOfTx(i)+' was removed.');
}
function togglePrivate(i){data[i][4]=data[i][4]?0:1;rmPop.classList.remove('open');renderTable();}

/* ---------- privacy confirm dialog ---------- */
const lkScrim=document.createElement('div');lkScrim.className='lkscrim';lkScrim.style.display='none';
lkScrim.innerHTML='<div class="lkdlg" role="alertdialog" aria-modal="true" aria-labelledby="lkt" aria-describedby="lkd"><h4 id="lkt"></h4><p id="lkd"></p><div class="lkfoot"><button type="button" class="lkbtn" data-a="0">Cancel</button><button type="button" class="lkbtn pri" data-a="1"></button></div></div>';
document.body.appendChild(lkScrim);
let lkDone=null,lkPrev=null;
function lkClose(v){if(!lkDone)return;const f=lkDone;lkDone=null;lkScrim.classList.remove('on');
  setTimeout(()=>{lkScrim.style.display='none';if(lkPrev&&document.contains(lkPrev))lkPrev.focus();lkPrev=null;},150);f(v);}
lkScrim.addEventListener('click',e=>{const b=e.target.closest('.lkbtn');if(b)return lkClose(b.dataset.a==='1');if(e.target===lkScrim)lkClose(false)});
document.addEventListener('keydown',e=>{if(lkDone&&e.key==='Escape'){e.stopPropagation();lkClose(false)}},true);
function askPrivacy(title,desc,cta){
  return new Promise(res=>{
    lkPrev=document.activeElement;
    lkScrim.querySelector('#lkt').textContent=title;
    lkScrim.querySelector('#lkd').textContent=desc;
    lkScrim.querySelector('[data-a="1"]').textContent=cta;
    lkScrim.style.display='flex';lkDone=res;
    void lkScrim.offsetHeight;
    lkScrim.classList.add('on');lkScrim.querySelector('[data-a="1"]').focus();
  });
}
function requestUnlock(e,i){
  e.stopPropagation();
  const btn=e.currentTarget,r=data[i],label=r[2]==='Referral'?('Referral — '+r[3]):r[0];
  askPrivacy('Make this transaction visible?','“'+label+'” will be visible to everyone on your team. You can make it private again from the row menu.','Make visible')
    .then(ok=>{
      if(!ok){btn.blur();return}
      btn.classList.add('unlocking');
      const wait=matchMedia('(prefers-reduced-motion: reduce)').matches?0:190;
      setTimeout(()=>{data[i][4]=0;renderTable();},wait);
    });
}
function requestLock(e,i){
  e.stopPropagation();
  const btn=e.currentTarget;btn.classList.add('locking');
  const wait=matchMedia('(prefers-reduced-motion: reduce)').matches?0:190;
  setTimeout(()=>{data[i][4]=1;renderTable();},wait);
}
/* detail view (separate scope) syncs privacy back by address */
window.setTxPrivacyByAddr=function(addr,v){const i=data.findIndex(r=>r[0]===addr);if(i>-1){data[i][4]=v?1:0;renderTable()}};

/* ---------- status change popover — dot + name, current checked ---------- */
const stPop=document.createElement('div');stPop.className='stpop';document.body.appendChild(stPop);
function openStatusPop(e,i){
  e.stopPropagation();
  const r=e.currentTarget.getBoundingClientRect();
  const cur=data[i][6];
  const side=SIDE(data[i][2]);
  /* current status first (it is the answer to "where is this deal?"), then the rest of
     this side's set — a buyer row never offers listing statuses */
  const opts=[cur,...ST_SET[side].filter(s=>s!==cur)];
  stPop.innerHTML=`<div class="stopth">${side==='buyer'?'Offer status':side==='referral'?'Referral status':side==='dual'?'Deal status':'Listing status'}</div>`+
    opts.map(s=>`<div class="stopt ${s===cur?'current':''}" onclick="setStatus(${i},'${s.replace(/'/g,"\\'")}')"><i style="background:${stDot(s)}"></i>${s}<span class="chk">✓</span></div>`).join('');
  stPop.style.top=(r.bottom+4)+'px';
  stPop.style.left=r.left+'px';
  stPop.style.transformOrigin='top left';
  stPop.classList.add('open');
  const pr=stPop.getBoundingClientRect();
  if(pr.right>window.innerWidth-8){stPop.style.left=(window.innerWidth-pr.width-8)+'px';stPop.style.transformOrigin='top right';}
  if(pr.bottom>window.innerHeight-8){stPop.style.top=(r.top-pr.height-4)+'px';stPop.style.transformOrigin=stPop.style.transformOrigin.replace('top','bottom');}
}
function setStatus(i,st){
  data[i][6]=st;data[i][11]=0;data[i][12]='';
  stPop.classList.remove('open');
  renderTable();
  /* state indication: the new badge blurs/settles in place so the change is legible
     without redrawing the row (occasional action — safe to animate) */
  const b=tb.querySelector('.aud[data-st="'+i+'"]');
  if(b&&!matchMedia('(prefers-reduced-motion: reduce)').matches){b.classList.add('stchg');b.addEventListener('animationend',()=>b.classList.remove('stchg'),{once:true});}
}
document.addEventListener('click',e=>{
  if(!e.target.closest('.rmpop'))rmPop.classList.remove('open');
  if(!e.target.closest('.stpop'))stPop.classList.remove('open');
});
window.addEventListener('scroll',()=>{rmPop.classList.remove('open');stPop.classList.remove('open')},true);
window.closePopTx=closePopTx;
window.pickOpTx=pickOpTx;
window.toggleOpsTx=toggleOpsTx;
window.applyFilterTx=applyFilterTx;
window.removeFilterTx=removeFilterTx;
window.clearSelTx=clearSelTx;
window.goColTx=goColTx;
window.openRowMenu=openRowMenu;
window.togglePrivate=togglePrivate;
window.requestUnlock=requestUnlock;
window.requestLock=requestLock;
window.askPrivacy=askPrivacy;
window.openStatusPop=openStatusPop;
window.setStatus=setStatus;
/* one popover, two contents — scales in from the cell it was opened from */
const escCb=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const cbPop=document.createElement('div');cbPop.className='cbpop';cbPop.setAttribute('role','dialog');document.body.appendChild(cbPop);
function placeCb(btn){
  const r=btn.getBoundingClientRect();
  cbPop.style.left='0px';cbPop.style.top='0px';cbPop.classList.add('on');
  const w=cbPop.offsetWidth,hgt=cbPop.offsetHeight;
  const left=Math.max(8,Math.min(r.left,window.innerWidth-w-10));
  const below=r.bottom+6+hgt<window.innerHeight-8;
  const ox=Math.max(12,Math.min(r.left-left+16,w-12));
  cbPop.style.setProperty('--tox',ox+'px '+(below?'top':'bottom'));
  cbPop.style.left=left+'px';
  cbPop.style.top=(below?r.bottom+6:r.top-hgt-6)+'px';
}
function openCmtPop(e,i,kind){
  e.stopPropagation();
  kind=kind||'tx';
  const isAudit=kind==='audit';
  const n=isAudit?auditCommentsOf(i):commentsOf(i);
  const notes=isAudit?AUDIT_NOTES:CMT_NOTES;
  const lbl=isAudit?'auditing comment':'comment';
  cbPop.innerHTML=n
    ?'<div class="cbh">'+n+' '+lbl+(n>1?'s':'')+'</div><div class="cbnote"><span class="who">'+escCb(COLLAB_POOL[i%COLLAB_POOL.length][0])+' \u00b7 2h ago</span>'+escCb(notes[i%notes.length])+'</div><div class="cbfoot"><button type="button" class="cblink">Open thread</button></div>'
    :'<div class="cbh">No '+lbl+'s yet</div><div class="cbfoot"><button type="button" class="cblink">Add a comment</button></div>';
  placeCb(e.currentTarget);
}
function openCollabPop(e,i){
  e.stopPropagation();
  const c=collabsOf(i);
  document.querySelectorAll('.collabg[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'));
  e.currentTarget.setAttribute('aria-expanded','true');
  cbPop.innerHTML='<div class="cbh">'+c.length+' collaborator'+(c.length>1?'s':'')+'</div>'+
    c.map(p=>'<div class="cbrow"><span class="cav" style="background:var(--neutral-100);color:var(--neutral-500);width:22px;height:22px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;position:relative;overflow:hidden">'+(p[4]?'<img src="'+p[4]+'" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">':ini(p[0]))+'</span>'+'<span class="nm">'+escCb(p[0])+'</span><i>'+escCb(p[1])+'</i></div>').join('')+
    '<div class="cbfoot"><button type="button" class="cblink"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M2.5 20v-1a5.5 5.5 0 0 1 11 0v1"/><path d="M17.5 9.5v1.2M17.5 17.3v1.2M14.1 11.4l1 .6M20.4 15.1l1 .6M14.1 16.7l1-.6M20.4 13l1-.6"/><circle cx="17.5" cy="14" r="2.2"/></svg>Manage access</button></div>';
  placeCb(e.currentTarget);
}
/* co-clients on one side — same dropdown as collaborators, roles on the right */
function openPartiesPop(e,i){
  e.stopPropagation();
  const r=data[i],ps=PARTIES[r[3]]||[r[3]],side=sideWord(r[2]);
  document.querySelectorAll('.pmoreb[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'));
  e.currentTarget.setAttribute('aria-expanded','true');
  const cap=side.charAt(0).toUpperCase()+side.slice(1);
  cbPop.innerHTML='<div class="cbh">'+ps.length+' '+side+'s on this transaction</div>'+
    ps.map((n,k)=>'<div class="cbrow"><span class="cav" style="background:var(--neutral-100);color:var(--neutral-500);width:22px;height:22px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex:none">'+ini(n)+'</span><span class="nm">'+escCb(n)+'</span><i>'+escCb(k===0?cap+' \u00b7 primary':(PARTY_ROLE[n]||'Co-'+side))+'</i></div>').join('')+
    '<div class="cbfoot"><button type="button" class="cblink"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M2.5 20v-1a5.5 5.5 0 0 1 11 0v1"/><path d="M17 11h4M19 9v4"/></svg>Manage clients</button></div>';
  placeCb(e.currentTarget);
}
window.openPartiesPop=openPartiesPop;
/* shared people dropdown for the transaction-detail fact strip — same cbpop design */
window.__peoplePop=function(btn,title,rows,foot){
  cbPop.innerHTML='<div class="cbh">'+escCb(title)+'</div>'+
    rows.map(p=>'<div class="cbrow"><span class="cav" style="background:var(--neutral-100);color:var(--neutral-500);width:22px;height:22px;border-radius:9999px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex:none">'+ini(p[0])+'</span><span class="nm">'+escCb(p[0])+'</span><i>'+escCb(p[1])+'</i></div>').join('')+
    (foot?'<div class="cbfoot"><button type="button" class="cblink"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="7" r="3"/><path d="M2.5 20v-1a5.5 5.5 0 0 1 11 0v1"/><path d="M17 11h4M19 9v4"/></svg>'+escCb(foot)+'</button></div>':'');
  placeCb(btn);
  if(btn&&btn.classList.contains('collabg'))btn.setAttribute('aria-expanded','true');
};
function closeCb(){cbPop.classList.remove('on');document.querySelectorAll('.collabg[aria-expanded="true"],.pmoreb[aria-expanded="true"]').forEach(b=>b.setAttribute('aria-expanded','false'))}
/* commission breakdown: amounts + the approval chain, with the open-breakdown action */
function openCbPop(e,i){
  e.stopPropagation();
  const st=cbStateOf(i),r=data[i];
  const price=Number(String(r[5]||'').replace(/[^0-9.]/g,''))||0;
  const gross=Number(String(r[9]||'').replace(/[^0-9.]/g,''))||Math.round(price*0.025);
  const brok=Math.round(gross*0.2),net=gross-brok;
  const usd=n=>'$'+n.toLocaleString('en-US');
  const done=st[1]==='done';
  const at=st[1]==='pend'?CB_PARTIES.indexOf(st[2]):(done?CB_PARTIES.length:-1);
  const chain=CB_PARTIES.map((p,k)=>{
    const cls=done||k<at?'ok':(k===at?'now':'');
    return '<div class="cbstep '+cls+'"><span class="mk"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg></span>'+escCb(p)+' approval</div>';
  }).join('');
  cbPop.innerHTML='<div class="cbh">'+escCb(st[0])+(st[2]?' \u00b7 '+escCb(st[2]):'')+'</div>'
    +'<div class="cbamt"><span>Gross commission</span><b>'+usd(gross)+'</b></div>'
    +'<div class="cbamt"><span>Brokerage split (20%)</span><b>\u2212'+usd(brok)+'</b></div>'
    +'<div class="cbamt"><span>Agent net</span><b>'+usd(net)+'</b></div>'
    +'<div class="cbsteps">'+chain+'</div>'
    +'<div class="cbfoot"><button type="button" class="cblink" data-cbopen="'+i+'">Open commission breakdown</button></div>';
  placeCb(e.currentTarget);
}
cbPop.addEventListener('click',e=>{
  const b=e.target.closest('[data-cbopen]');
  if(!b)return;
  closeCb();
  if(window.sonner)sonner('Commission breakdown','Opening the full breakdown for this transaction.');
});
window.openCbPop=openCbPop;
document.addEventListener('click',e=>{if(!e.target.closest('.cbpop')&&!e.target.closest('.cmt')&&!e.target.closest('.collabg')&&!e.target.closest('.cbb'))closeCb()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCb()});
window.addEventListener('scroll',closeCb,true);
window.openCmtPop=openCmtPop;
window.openCollabPop=openCollabPop;
window.rmPop=rmPop;
window.stPop=stPop;

/* ============ Save-as-default view ============
   Persists tab, search, filters, hidden columns, and column order so the
   user's chosen setup is what they see next time. Pill appears when the
   current state differs from the saved default. */
(function(){
  const KEY='rds.tx.defaultView.v1';
  const btn=document.getElementById('tx-savevw');
  const head=root.querySelector('#tx-twrap thead tr');
  if(!btn||!head)return;
  const search=document.getElementById('tx-search');
  const schWrap=search&&search.closest('.tsearch');
  const colTh=()=>[...head.children].filter(t=>t.dataset.col);
  /* the order as authored, so columns added after a view was saved keep their intended slot */
  const authoredOrder=colTh().map(t=>t.dataset.col);
  const readState=()=>({
    tab:tabTx,
    q:qTx||'',
    hide:[...(window._txHide||new Set())].sort(),
    order:colTh().map(t=>t.dataset.col),
    filters:JSON.parse(JSON.stringify(active||{}))
  });
  const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  let saved=null;
  try{const raw=localStorage.getItem(KEY);if(raw)saved=JSON.parse(raw)}catch(_){}
  function update(){
    const matches=!!saved&&eq(saved,readState());
    btn.classList.toggle('saved',matches);
    btn.title=matches
      ?'This view is your saved default — click to re-save with any current changes'
      :'Bookmark this view as your default (stored on this device)';
  }
  function save(){
    saved=readState();
    try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(_){}
    update();
    if(typeof sonner==='function')sonner('View bookmarked on this device','This tab, columns, and filters load next time you open Transactions.');
  }
  btn.addEventListener('click',save);

  /* Watch for changes: tab clicks, search input, filter chip changes, column visibility/order */
  root.querySelectorAll('.tabseg .tab[data-tab]').forEach(t=>t.addEventListener('click',()=>setTimeout(update,0)));
  if(search)search.addEventListener('input',()=>setTimeout(update,0));
  const chipsEl=document.getElementById('tx-chips');
  if(chipsEl)new MutationObserver(update).observe(chipsEl,{childList:true,subtree:true});
  new MutationObserver(update).observe(head,{childList:true});
  let lastHide='';
  setInterval(()=>{const h=[...(window._txHide||new Set())].sort().join('|');if(h!==lastHide){lastHide=h;update()}},400);

  /* Apply saved view on first paint */
  function apply(){
    if(!saved)return;
    if(saved.tab){
      const t=root.querySelector('.tabseg .tab[data-tab="'+saved.tab+'"]');
      if(t){
        root.querySelectorAll('.tabseg .tab').forEach(x=>x.classList.remove('active'));
        t.classList.add('active');
        tabTx=saved.tab;
      }
    }
    if(saved.q&&search){search.value=saved.q;qTx=saved.q.toLowerCase();if(schWrap)schWrap.classList.add('hasval')}
    if(saved.hide&&window._txHide){window._txHide.clear();saved.hide.forEach(c=>window._txHide.add(c));if(window._txApplyHide)window._txApplyHide()}
    if(saved.order&&saved.order.length){
      const last=head.lastElementChild;
      const merged=saved.order.filter(c=>authoredOrder.includes(c));
      authoredOrder.forEach((c,idx)=>{
        if(merged.includes(c))return;
        const prev=authoredOrder[idx-1],at=prev?merged.indexOf(prev)+1:0;
        merged.splice(at<0?merged.length:at,0,c);
      });
      merged.forEach(c=>{const th=head.querySelector('th[data-col="'+c+'"]');if(th&&last)last.before(th)});
      if(window.applyColOrderTx)window.applyColOrderTx();
    }
    if(saved.filters&&typeof active==='object'){
      Object.keys(active).forEach(k=>delete active[k]);
      Object.assign(active,saved.filters);
      if(typeof renderChips==='function')renderChips();
    }
    if(typeof renderTable==='function')renderTable();
    if(typeof updateRail==='function')updateRail();
  }
  apply();
  update();
})();
})();

/* ---------- floating switchers: font + theme ---------- */
(function(){
  /* Typography is locked to the Radius pair: Mona Sans (body) + Hubot Sans (tabular/labels).
     No font switcher, no font tweak — body.font-duo is always on. */
  const b=document.body;
  const savedTheme=localStorage.getItem('crm-theme')||'light';
  b.classList.remove('font-geist','font-satoshi');
  b.classList.add('font-duo');
  localStorage.setItem('crm-font','duo');
  if(savedTheme==='dark')b.classList.add('dark');

  const tfab=document.createElement('button');tfab.className='themefab';tfab.title='Toggle theme';
  const sunSvg='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  const moonSvg='<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  const paint=()=>{tfab.innerHTML=b.classList.contains('dark')?sunSvg:moonSvg;};
  paint();
  tfab.addEventListener('click',()=>{b.classList.toggle('dark');localStorage.setItem('crm-theme',b.classList.contains('dark')?'dark':'light');paint();applyTweaks({theme:b.classList.contains('dark')?'dark':'light'},false);});
  document.body.appendChild(tfab);

  /* expose for tweaks bridge */
  window.__applyTheme=(mode)=>{
    const on=mode==='dark';
    b.classList.toggle('dark',on);
    localStorage.setItem('crm-theme',on?'dark':'light');
    paint();
  };
})();

/* ---------- Tweaks bridge (host protocol) ----------
   Defaults live in an EDITMODE block below so the host can persist edits back
   into this file. Values map to the existing body class system. */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "cardSkin": "neutral",
  "txState": "pending",
  "headerTint": "plain",
  "txHeader": "flat",
  "propertyPhoto": "on",
  "boardDensity": "detail",
  "cardLayout": "current",
  "jarvisLine": "off",
  "boardMode": "current",
  "tabStyle": "segmented",
  "txTabs": "2a",
  "multiSelect": "hide",
  "melActions": "chat",
  "traceStyle": "ring",
  "role": "teamLead",
  "colRail": "off",
  "filterLayout": "stacked",
  "msFlow": "new"
}/*EDITMODE-END*/;

function applyTweaks(edits,broadcast){
  if('font' in edits && window.__applyFont) window.__applyFont(edits.font==='inter'?'':edits.font);
  if('role' in edits && window.__applyRole) window.__applyRole(edits.role);
  if('colRail' in edits){window.__colRail=edits.colRail!=='off';if(window.__updateRail)window.__updateRail()}
  if('filterLayout' in edits){window.__filterLayout=edits.filterLayout==='pane'?'pane':'stacked';if(window.__rerenderFilters)window.__rerenderFilters()}
  if('theme' in edits && window.__applyTheme) window.__applyTheme(edits.theme);
  if('cardSkin' in edits && window.__applyCardSkin) window.__applyCardSkin(edits.cardSkin);
  if('txState' in edits && window.__applyTxState) window.__applyTxState(edits.txState);
  if('headerTint' in edits && window.__applyHeaderTint) window.__applyHeaderTint(edits.headerTint);
  if('txHeader' in edits && window.__applyTxHeader) window.__applyTxHeader(edits.txHeader);
  if('propertyPhoto' in edits && window.__applyTxPhoto) window.__applyTxPhoto(edits.propertyPhoto);
  if('boardDensity' in edits && window.__applyDensity) window.__applyDensity(edits.boardDensity);
  if('cardLayout' in edits && window.__applyCardLayout) window.__applyCardLayout(edits.cardLayout);
  if('jarvisLine' in edits && window.__applyJarvisLine) window.__applyJarvisLine(edits.jarvisLine);
  if('boardMode' in edits && window.__applyBoardMode) window.__applyBoardMode(edits.boardMode);
  if('melActions' in edits){
    window.__melActions = edits.melActions === 'chat' ? 'chat' : 'buttons';
    document.body.classList.toggle('mel-chatacts', window.__melActions === 'chat');
    /* live-repaint any Mel messages currently on screen */
    document.querySelectorAll('.msacts').forEach(el => {
      if(window.MEL && window.MEL._repaintActions) window.MEL._repaintActions(el);
    });
  }
  if('multiSelect' in edits){
    const hide = edits.multiSelect === 'hide';
    document.body.classList.toggle('nomulti', hide);
    if(hide){
      document.querySelectorAll('#tx-twrap .rc').forEach(b=>{b.checked=false});
      const a=document.getElementById('tx-all'); if(a){a.checked=false;a.indeterminate=false;}
      const sb=document.getElementById('tx-selbar'); if(sb) sb.classList.remove('on');
    }
  }
  if('traceStyle' in edits) document.body.classList.toggle('trace-ring',edits.traceStyle==='ring');
  if('msFlow' in edits && window.__applyMsFlow) window.__applyMsFlow(edits.msFlow);
  if('txTabs' in edits && window.__applyTxTabs) window.__applyTxTabs(edits.txTabs);
  if('tabStyle' in edits){
    document.body.classList.toggle('tabs-seg',edits.tabStyle!=='classic');
    try{localStorage.setItem('crm-tabstyle',edits.tabStyle)}catch(e){}
  }
  if(broadcast!==false){
    try{window.parent.postMessage({type:'__edit_mode_set_keys',edits},'*');}catch(_){}
  }
}

(function tweaksBridge(){
  /* Panel UI (hidden until host activates edit mode) */
  const style=document.createElement('style');
  style.textContent=`
    .twk-panel{position:fixed;right:16px;top:16px;z-index:2147483646;width:260px;
      background:rgba(250,250,250,.92);color:#171717;
      -webkit-backdrop-filter:blur(20px) saturate(160%);backdrop-filter:blur(20px) saturate(160%);
      border:1px solid rgba(0,0,0,.08);border-radius:14px;
      box-shadow:0 12px 32px rgba(0,0,0,.18);
      font:12px/1.4 Inter,system-ui,-apple-system,sans-serif;overflow:hidden;
      display:none}
    .twk-panel.on{display:block}
    body.dark .twk-panel{background:rgba(28,28,28,.92);color:#fafafa;border-color:rgba(255,255,255,.1);box-shadow:0 12px 32px rgba(0,0,0,.6)}
    .twk-hd{display:flex;align-items:center;justify-content:space-between;padding:10px 8px 10px 14px}
    .twk-hd b{font-size:12px;font-weight:600}
    .twk-x{appearance:none;border:0;background:transparent;color:inherit;opacity:.55;
      width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:14px;line-height:1}
    .twk-x:hover{background:rgba(0,0,0,.06);opacity:1}
    body.dark .twk-x:hover{background:rgba(255,255,255,.08)}
    .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:12px}
    .twk-row{display:flex;flex-direction:column;gap:6px}
    .twk-lbl{font-weight:500;opacity:.72;font-size:11px}
    .twk-seg{display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06);gap:2px}
    body.dark .twk-seg{background:rgba(255,255,255,.06)}
    .twk-seg button{appearance:none;flex:1;border:0;background:transparent;color:inherit;
      font:inherit;font-weight:500;min-height:24px;border-radius:6px;cursor:pointer;
      padding:4px 6px;line-height:1.2;opacity:.7;white-space:nowrap}
    .twk-seg button.on{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.12);opacity:1}
    body.dark .twk-seg button.on{background:#3a3a3a;box-shadow:0 1px 2px rgba(0,0,0,.4)}
    .twk-seg button:hover{opacity:1}
    .twk-sec{display:flex;align-items:center;justify-content:space-between;gap:8px;
      font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;opacity:.55;
      padding:9px 0;border-top:1px solid rgba(0,0,0,.08);cursor:pointer;user-select:none}
    .twk-sec:first-child{border-top:0}
    .twk-sec:hover{opacity:.85}
    .twk-sec svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;
      stroke-linecap:round;stroke-linejoin:round;flex:none;opacity:.7;transition:transform .16s ease}
    .twk-sec.open svg{transform:rotate(180deg)}
    .twk-grp{display:none;flex-direction:column;gap:12px;padding:2px 0 12px}
    .twk-grp.open{display:flex}
    body.dark .twk-sec{border-top-color:rgba(255,255,255,.1)}
    .twk-seg.wrap{flex-wrap:wrap}
    .twk-seg.wrap button{flex:1 1 calc(50% - 4px);min-width:0}
  `;
  document.head.appendChild(style);

  const panel=document.createElement('div');
  panel.className='twk-panel';
  panel.innerHTML=`
    <div class="twk-hd"><b>Tweaks</b><button class="twk-x" data-close>✕</button></div>
    <div class="twk-body">
      <div class="twk-sec">Marketing Studio</div>
      <div class="twk-row">
        <div class="twk-lbl">Flow</div>
        <div class="twk-seg" data-key="msFlow">
          <button data-val="old">Old flow</button>
          <button data-val="new">New flow</button>
        </div>
      </div>
      <div class="twk-sec">Property list</div>
      <div class="twk-row">
        <div class="twk-lbl">Tab set</div>
        <div class="twk-seg wrap" data-key="txTabs">
          <button data-val="2a">6 + More</button>
          <button data-val="1a">4 + More</button>
          <button data-val="1b">All 8</button>
          <button data-val="1c">3 + Status</button>
        </div>
      </div>
      <div class="twk-sec">Property page</div>
      <div class="twk-row">
        <div class="twk-lbl">Transaction state</div>
        <div class="twk-seg" data-key="txState">
          <button data-val="listing">Listing</button>
          <button data-val="pending">Pending</button>
          <button data-val="paid">Paid</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Card header</div>
        <div class="twk-seg" data-key="headerTint">
          <button data-val="gradient">Gradient</button>
          <button data-val="plain">Plain</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Top section</div>
        <div class="twk-seg" data-key="txHeader">
          <button data-val="current">Checklist</button>
          <button data-val="innovative">Photo hero</button>
          <button data-val="flat">Integrated</button>
          <button data-val="banner">Banner</button>
        </div>
      </div>
      <div class="twk-sec">Property board</div>
      <div class="twk-row">
        <div class="twk-lbl">Board mode</div>
        <div class="twk-seg" data-key="boardMode">
          <button data-val="current">Current</button>
          <button data-val="quiet">Quiet</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Board cards</div>
        <div class="twk-seg" data-key="boardDensity">
          <button data-val="detail">Detailed</button>
          <button data-val="compact">Compact</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Board card design</div>
        <div class="twk-seg" data-key="cardLayout">
          <button data-val="current">Current</button>
          <button data-val="minimal">Minimal</button>
          <button data-val="signal">Signal</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Jarvis on card</div>
        <div class="twk-seg" data-key="jarvisLine">
          <button data-val="off">Off</button>
          <button data-val="why">Why now</button>
          <button data-val="act">+ Action</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Filter panel</div>
        <div class="twk-seg" data-key="filterLayout">
          <button data-val="stacked">One panel</button>
          <button data-val="pane">Rail + flyout</button>
        </div>
      </div>
      <div class="twk-sec">Mel copilot</div>
      <div class="twk-row">
        <div class="twk-lbl">Mel action items</div>
        <div class="twk-seg" data-key="melActions">
          <button data-val="buttons">Buttons</button>
          <button data-val="chat">Conversational</button>
        </div>
      </div>
      <div class="twk-row">
        <div class="twk-lbl">Thinking trace</div>
        <div class="twk-seg" data-key="traceStyle">
          <button data-val="mel">Infinity</button>
          <button data-val="ring">Ring</button>
        </div>
      </div>
      <div class="twk-sec">Clients</div>
      <div class="twk-row" data-only="clients">
        <div class="twk-lbl">Viewer role</div>
        <div class="twk-seg wrap" data-key="role">
          <button data-val="teamLead">Team lead</button>
          <button data-val="teamMember">Team member</button>
          <button data-val="groupLead">Group lead</button>
          <button data-val="groupMember">Group member</button>
        </div>
      </div>
      <div class="twk-row" data-only="clients">
        <div class="twk-lbl">Scrolled-column rail</div>
        <div class="twk-seg" data-key="colRail">
          <button data-val="on">Show</button>
          <button data-val="off">Hide</button>
        </div>
      </div>
      <div class="twk-sec">Appearance</div>
      <div class="twk-row">
        <div class="twk-lbl">Theme</div>
        <div class="twk-seg" data-key="theme">
          <button data-val="light">Light</button>
          <button data-val="dark">Dark</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(panel);

  /* collapse each section: header toggles the group of rows beneath it */
  (function collapse(){
    const body=panel.querySelector('.twk-body');
    const CH='<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
    [...body.children].filter(el=>el.classList.contains('twk-sec')).forEach(secEl=>{
      const label=secEl.textContent.trim();
      secEl.innerHTML='<span>'+label+'</span>'+CH;
      const grp=document.createElement('div');
      grp.className='twk-grp';
      let n=secEl.nextElementSibling;
      while(n && !n.classList.contains('twk-sec')){const nx=n.nextElementSibling;grp.appendChild(n);n=nx}
      secEl.insertAdjacentElement('afterend',grp);
      secEl.addEventListener('click',()=>{
        const on=!grp.classList.contains('open');
        grp.classList.toggle('open',on);
        secEl.classList.toggle('open',on);
      });
    });
  })();

  const state={...TWEAK_DEFAULTS};
  /* Restore from localStorage so panel reflects the current in-page state */
  const savedFont=localStorage.getItem('crm-font');
  if(savedFont!==null) state.font=savedFont===''?'inter':savedFont;
  const savedTheme=localStorage.getItem('crm-theme');
  if(savedTheme) state.theme=savedTheme;
  const savedSkin=localStorage.getItem('crm-cardskin2');
  if(savedSkin) state.cardSkin=savedSkin;
  const savedTxs=localStorage.getItem('crm-txstate');
  state.txState=savedTxs||'pending';
  const savedTxp=localStorage.getItem('crm-txphoto');
  if(savedTxp) state.propertyPhoto=savedTxp;
  const savedTxh=localStorage.getItem('crm-txheader');
  /* one-time move to the banner top section; a later manual pick still sticks */
  if(!localStorage.getItem('crm-txheader-v2')){
    try{localStorage.setItem('crm-txheader','banner');localStorage.setItem('crm-txheader-v2','1')}catch(e){}
    state.txHeader='banner';
  }else if(savedTxh) state.txHeader=savedTxh;
  const savedDens=localStorage.getItem('crm-density');
  if(savedDens) state.boardDensity=savedDens;
  const savedMode=localStorage.getItem('crm-boardmode');
  if(savedMode) state.boardMode=savedMode;
  const savedLayout=localStorage.getItem('crm-cardlayout-v2');
  if(savedLayout) state.cardLayout=savedLayout;
  const savedJv=localStorage.getItem('crm-jarvisline');
  if(savedJv) state.jarvisLine=savedJv;
  const savedTabs=localStorage.getItem('crm-tabstyle');
  if(savedTabs) state.tabStyle=savedTabs;
  const savedTxTabs=localStorage.getItem('crm-txtabs');
  if(savedTxTabs) state.txTabs=savedTxTabs;
  const savedMsFlow=localStorage.getItem('crm-msflow');
  if(savedMsFlow) state.msFlow=savedMsFlow;
  applyTweaks(state,false);

  function paintSeg(){
    panel.querySelectorAll('.twk-seg').forEach(seg=>{
      const k=seg.dataset.key;
      seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.val===state[k]));
    });
  }
  paintSeg();

  panel.querySelectorAll('.twk-seg button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const k=btn.parentElement.dataset.key,v=btn.dataset.val;
      state[k]=v;
      applyTweaks({[k]:v},true);
      paintSeg();
    });
  });
  panel.querySelector('[data-close]').addEventListener('click',()=>{
    panel.classList.remove('on');
    try{window.parent.postMessage({type:'__edit_mode_dismissed'},'*');}catch(_){}
  });

  /* Host protocol */
  window.addEventListener('message',e=>{
    const d=e&&e.data;if(!d||!d.type)return;
    if(d.type==='__activate_edit_mode'){panel.classList.add('on');paintSeg();}
    else if(d.type==='__deactivate_edit_mode'){panel.classList.remove('on');}
    else if(d.type==='__edit_mode_set_keys' && d.edits){
      Object.assign(state,d.edits);
      applyTweaks(d.edits,false);
      paintSeg();
    }
  });
  /* Host may attach its listener after this script runs — announce repeatedly for a
     few seconds (and on focus) so clicking Tweaks always finds a live page. */
  const announce=()=>{try{window.parent.postMessage({type:'__edit_mode_available'},'*');}catch(_){}};
  announce();
  let n=0;const anT=setInterval(()=>{announce();if(++n>20)clearInterval(anT);},250);
  window.addEventListener('focus',announce);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)announce()});
})();
