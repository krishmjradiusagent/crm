

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
    if(!holder||holder.closest('.sidebar'))return;
    const img=holder.querySelector('img');
    if(!img||!img.getAttribute('src'))return;
    prev.innerHTML=`<img src="${img.getAttribute('src')}" alt="">`;
    place(holder);
  });
  document.addEventListener('mouseout',e=>{
    const holder=e.target.closest('.agav,.avatar,.pav');
    if(!holder||holder.closest('.sidebar'))return;
    if(holder.contains(e.relatedTarget))return;
    prev.classList.remove('on');
  });
  window.addEventListener('scroll',()=>prev.classList.remove('on'),true);
})();

(function(){
const root=document.getElementById('cl-page');
/* ---------- data ---------- */
const stages=[["New client","#6da544"],["Met with client","#d9a514"],["Pre-approved/listing prepped","#8b5cf6"],["Showings/tours","#d6549e"],["Sending/receiving offers","#2563eb"],["In contract","#dc2626"],["Closed","#7c6ef2"],["Archived","#a3a3a3"]];
const data=[
["Mason Martinez","(470) 225-8467","mason.martinez@example.com","Seller",1,"Emily Robinson",3,"2h ago",1],
["Nora Morris","(622) 690-9765","nora.morris@example.com","Seller",1,"Emily Robinson",1,"2h ago",0],
["Ava Stewart","(315) 111-7072","ava.stewart@example.com","Buyer",4,"Daniel Scott",6,"3h ago",0],
["Elena Miller","(212) 555-0184","elena.miller@example.com","Landlord",1,"Donald Scott",5,"4h ago",0],
["Aria Jackson","(646) 555-0142","aria.jackson@example.com","Seller",1,"Michael Allen",2,"5h ago",0],
["Olivia Allen","(470) 225-8467","olivia.allen@example.com","Buyer",0,"Ashutosh iOSacc",8,"6h ago",0],
["Samuel Davis","(622) 690-9765","samuel.davis@example.com","Buyer",0,"Aashin R. Ironman",3,"8h ago",1],
["Zoe Green","(315) 111-7072","zoe.green@example.com","Buyer",0,"Ashutosh iOSacc",5,"9h ago",0],
["Liam Carter","(917) 555-0173","liam.carter@example.com","Seller",2,"Emily Robinson",1,"12h ago",0],
["Maya Patel","(408) 555-0111","maya.patel@example.com","Buyer",3,"Daniel Scott",6,"1d ago",0],
["Noah Kim","(206) 555-0132","noah.kim@example.com","Seller",4,"Michael Allen",2,"1d ago",0],
["Isabella Rossi","(305) 555-0177","isabella.rossi@example.com","Buyer",5,"Emily Robinson",7,"2d ago",0],
["Ethan Brooks","(512) 555-0155","ethan.brooks@example.com","Landlord",1,"Donald Scott",1,"2d ago",0],
["Sofia Nguyen","(702) 555-0121","sofia.nguyen@example.com","Buyer",6,"Ashutosh iOSacc",5,"3d ago",0],
["Lucas Wright","(303) 555-0166","lucas.wright@example.com","Seller",2,"Aashin R. Ironman",3,"3d ago",0],
["Amelia Flores","(415) 555-0199","amelia.flores@example.com","Buyer",1,"Daniel Scott",6,"4d ago",0],
["Henry Adams","(617) 555-0143","henry.adams@example.com","Seller",0,"Emily Robinson",2,"5d ago",0],
["Chloe Bennett","(213) 555-0188","chloe.bennett@example.com","Buyer",3,"Michael Allen",10,"6d ago",0],
["Jack Turner","(602) 555-0117","jack.turner@example.com","Seller",7,"Donald Scott",1,"8d ago",0],
["Grace Lee","(718) 555-0165","grace.lee@example.com","Buyer",1,"Ashutosh iOSacc",5,"9d ago",0],
["Ruby Sanders","(504) 555-0139","ruby.sanders@example.com","Seller",2,"Emily Robinson",2,"10d ago",0],
["Owen Foster","(312) 555-0158","owen.foster@example.com","Buyer",1,"Daniel Scott",3,"12d ago",0]
];
/* ---------- client scope (who am I looking at) ---------- */
const ME='Ashutosh iOSacc';
const TEAM=['Emily Robinson','Daniel Scott','Michael Allen','Donald Scott','Aashin R. Ironman'];
const GROUPS=[
  {n:'Downtown listings',m:['Emily Robinson','Daniel Scott']},
  {n:'Relocation desk',m:['Michael Allen','Donald Scott']},
  {n:'Luxury waterfront',m:['Emily Robinson','Aashin R. Ironman','Michael Allen']}
];
const active={};
let SCOPE={kind:'all',key:null};
let ROLE='teamLead';
function inScope(r){
  const ag=r[5];
  if(SCOPE.kind==='mine')return ag===ME;
  if(SCOPE.kind==='member')return ag===SCOPE.key;
  if(SCOPE.kind==='group'){const g=GROUPS.find(x=>x.n===SCOPE.key);return !!g&&g.m.includes(ag);}
  return true;
}
const ini=n=>n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
const ini1=n=>(n[0]||'').toUpperCase();
const agtone={"Emily Robinson":["#e0e7ff","#3730a3"],"Daniel Scott":["#dcfce7","#166534"],"Donald Scott":["#fef9c3","#854d0e"],"Michael Allen":["#fce7f3","#9d174d"],"Ashutosh iOSacc":["#e5e5e5","#404040"],"Aashin R. Ironman":["#dbeafe","#1d4ed8"]};
/* Dark analogues — deep tinted bgs + light-on-dark fg matched per identity */
const agtoneDark={"Emily Robinson":["#1e1b4b","#a5b4fc"],"Daniel Scott":["#052e16","#86efac"],"Donald Scott":["#451a03","#fcd34d"],"Michael Allen":["#500724","#f9a8d4"],"Ashutosh iOSacc":["#333333","#e5e5e5"],"Aashin R. Ironman":["#172554","#93c5fd"]};
const agImg={"Emily Robinson":"https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Donald Scott":"https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Aashin R. Ironman":"https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop"};
const collabPool=["Alex Kim","Priya Shah","Marco Vega","Jenna Reyes","Ravi Patel","Sara Malik","Tom Hong","Nina Lee","Kai Odell","Zara Chen","Ben Cole","Ivy Wu"];
const collabTone=["#eff3ff","#edfdf3","#fef9e3","#fdf3f9","#edf4fe","#f9f3ff","#fff1f2","#e5fdf8","#fefce1","#eff8fe","#fae7fe","#feebd4"];
/* Dark analogues — desaturated deep tints, one per light index */
const collabToneDark=["#1e2340","#153a25","#3a3010","#2e1a26","#1a2e3f","#2a1f3a","#3a2226","#153a33","#3f3818","#1a2f3f","#3a2540","#3a2818"];
const collabImg={"Alex Kim":"https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Jenna Reyes":"https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Sara Malik":"https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop"};
const collabRole={"Alex Kim":"TC","Priya Shah":"Lender","Marco Vega":"Vendor","Jenna Reyes":"Assistant","Ravi Patel":"TC","Sara Malik":"Lender","Tom Hong":"Vendor","Nina Lee":"Assistant","Kai Odell":"TC","Zara Chen":"Lender","Ben Cole":"Vendor","Ivy Wu":"Assistant"};
const coAgentPool=["Daniel Scott","Michael Allen","Donald Scott","Emily Robinson"];
const coAgentRole={"Daniel Scott":"Co-agent · buyer side","Michael Allen":"Co-agent · listing side","Donald Scott":"Co-agent · showings","Emily Robinson":"Co-agent · referral"};
const coAgentCount=i=>[0,2,1,0,1,3,0,2][Math.abs(i)%8];
/* co-clients: other principals in the same household/deal, with how they relate to the primary client */
const coClientPool=[["Ritu Sharma","Spouse"],["Harold Vance","Father"],["Lena Vance","Mother"],["Devin Cole","Son"],["Ana Cole","Daughter"],["Priya Nair","Sibling"],["Owen Blake","Trustee"],["Marta Diaz","Co-signer"]];
const coClientCount=i=>[0,2,1,3,0,1,2,4][Math.abs(i)%8];
function coClientsOf(i){const n=coClientCount(i);const out=[];for(let k=0;k<n;k++)out.push(coClientPool[(i+k)%coClientPool.length]);return out;}
const clientImg={"Mason Martinez":"https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Ava Stewart":"https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop","Liam Carter":"https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=96&h=96&fit=crop"};
const avImg=(n,map)=>map[n]?`<img class="avatar-image" src="${map[n]}" alt="" onerror="this.remove()">`:'';
const tb=document.getElementById('cl-tb');
const CAP=6;
function renderTable(){
  const dark=document.body.classList.contains('dark');
  const cT=dark?collabToneDark:collabTone;
  const aT=dark?agtoneDark:agtone;
  const cFg=dark?'#f5f5f5':'#404040';
  tb.innerHTML='';
  data.filter(r=>inScope(r)&&passesCl(r)).forEach((r,ri)=>{
    const [name,ph,em,ty,st,ag,co,la,priv]=r;
    const names=collabPool.slice(0,Math.max(0,co));
    const shown=names.slice(0,3);
    const overflow=co>3?co-3:0;
    const avs=shown.map((n,i)=>`<span class="avatar" title="${n} — ${collabRole[n]}" style="background:var(--neutral-100);color:var(--neutral-500);z-index:${shown.length-i};position:relative"><span class="avatar-fallback">${ini(n)}</span>${avImg(n,collabImg)}</span>`).join('')+(overflow?`<span class="more" style="z-index:0;position:relative">+${overflow}</span>`:'');
    const listHtml=(names.length?`<div class="collabhead">${names.length} collaborator${names.length>1?'s':''}</div>`:'')+ (names.map((n,i)=>`<div class="collabrow"><span class="avatar" style="background:var(--neutral-100);color:var(--neutral-500)"><span class="avatar-fallback">${ini(n)}</span>${avImg(n,collabImg)}</span><span class="collabname">${n}</span><span class="collabrole">${collabRole[n]}</span></div>`).join('')||'<div class="collabempty">No collaborators</div>')+`<div class="collabfoot"><button type="button" class="collabmanage"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>Manage access</button></div>`;
    const cc=coClientsOf(data.indexOf(r));
    const ccShown=cc.slice(0,3);
    const ccAvs=ccShown.map(([n,role],i)=>`<span class="avatar" title="${n} — ${role}" style="background:var(--neutral-100);color:var(--neutral-500);z-index:${ccShown.length-i};position:relative"><span class="avatar-fallback">${ini(n)}</span></span>`).join('')+(cc.length>3?`<span class="more" style="z-index:0;position:relative">+${cc.length-3}</span>`:'');
    const ccList=`<div class="collabhead">${cc.length} co-client${cc.length===1?'':'s'}</div>`+cc.map(([n,role])=>`<div class="collabrow"><span class="avatar" style="background:var(--neutral-100);color:var(--neutral-500)"><span class="avatar-fallback">${ini(n)}</span></span><span class="collabname">${n}</span><span class="collabrole">${role}</span></div>`).join('')+`<div class="collabfoot"><button type="button" class="collabmanage"><svg viewBox="0 0 24 24"><path d="M3 21v-1a5 5 0 0 1 10 0v1"/><circle cx="8" cy="7" r="3"/><path d="M19 8v6M22 11h-6"/></svg>Manage co-clients</button></div>`;
    tb.insertAdjacentHTML('beforeend',`<tr data-i="${data.indexOf(r)}">
      <td data-c="_sel"><input type="checkbox" class="rc"></td>
      <td data-c="Name" title="${name}"><span class="agcell"><span class="agav" style="background:${cT[ri%cT.length]};color:${cFg}">${ini(name)}${avImg(name,clientImg)}</span><span class="name">${name}</span></span></td>
      <td data-c="Phone" class="mono"><span class="phcell" data-ph="${ph}" data-who="${name}">${ph}<svg class="phchev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></td>
      <td data-c="Email" class="sub">${em}</td>
      <td data-c="Type"><span class="badge">${ty}</span></td>
      <td data-c="Status"><span class="st" style="--stc:${stages[st][1]}"><i></i>${stages[st][0]}</span></td>
      <td data-c="Agent" class="sub"><span class="agcell"><span class="agav" style="background:${aT[ag][0]};color:${aT[ag][1]}">${ini(ag)}${avImg(ag,agImg)}</span>${ag.split(' ')[0]} ${ag.split(' ')[1]||''}</span></td>
      <td data-c="coclients">${cc.length?`<span class="avg collabtrig" data-list='${encodeURIComponent(ccList)}' onclick="showCollab(event,this)" title="View all co-clients">${ccAvs}<svg class="avchev lucide" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>`:'<span class="sub">—</span>'}</td>
      <td data-c="collabs"><span class="avg collabtrig" data-list='${encodeURIComponent(listHtml)}' onclick="showCollab(event,this)" title="View all collaborators">${co?avs:'<span class="avgn">0</span>'}<svg class="avchev lucide" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span></td>
      <td data-c="Last activity" class="mono">${la}</td>
      <td data-c="Created at" class="mono sub">Jul ${10+(Math.abs(name.length*3)%12)}, 2026</td>
      <td data-c="Updated at" class="mono sub">Jul 22, 2026</td>
      <td data-c="_menu"><span class="rowmenu">⋯</span></td>
    </tr>`);
  });
  root.querySelectorAll('.rc').forEach(c=>c.addEventListener('change',sync));
  if(window.applyColOrderCl)window.applyColOrderCl();
}

/* ---------- selection ---------- */
const bar=document.getElementById('cl-selbar'),cnt=document.getElementById('cl-selcount');
function sync(){
  const boxes=[...root.querySelectorAll('.rc')];
  const n=boxes.filter(c=>c.checked).length;
  bar.classList.toggle('on',n>0);
  cnt.textContent=n+' selected';
  boxes.forEach(c=>c.closest('tr').classList.toggle('selected',c.checked));
  if(bar.classList.contains('tray'))renderTray(bar);
  if(n===0){hidePanel(bar);hideTray(bar)}
}
renderTable(); /* now that sync is defined, render + bind row checkboxes */

/* ---------- kanban board (pipeline stages) ---------- */
const board=document.getElementById('cl-board');
let order=data.map((_,i)=>i); /* board card order, independent of table sort */
const icMail='<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>';
const icPhone='<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';
function renderBoard(){
  if(typeof syncSelBtn==='function')syncSelBtn();
  board.classList.toggle('mn',cardLayout==='minimal');
  board.classList.toggle('sg',cardLayout==='signal');
  const sgOn=cardLayout==='signal'&&board.classList.contains('on');
  if(document.getElementById('cl-pvt'))document.getElementById('cl-pvt').classList.toggle('on',sgOn);
  if(document.getElementById('cl-swpbtn'))document.getElementById('cl-swpbtn').classList.toggle('on',sgOn);
  if(cardLayout==='signal'){renderSignalBoard();return;}
  const dark=document.body.classList.contains('dark');
  const cT=dark?collabToneDark:collabTone;
  const aT=dark?agtoneDark:agtone;
  const cFg=dark?'#f5f5f5':'#404040';
  board.innerHTML=stages.map((s,si)=>{
    const ids=order.filter(i=>data[i][4]===si&&!isArch(i)&&inScope(data[i])&&passesCl(data[i]));
    const cards=ids.map(i=>{
      const [name,ph,em,ty,st,ag,co,la,priv]=data[i];
      const f=info(i);
      const collabs=collabPool.slice(0,Math.min(3,Math.max(0,co)));
      const extra=co>3?co-3:0;
      const collabAll=collabPool.slice(0,Math.max(0,co));
      const nCo=coAgentCount(i);
      const coAgents=coAgentPool.slice(0,nCo);
      const pplRow=(n,tone,fg,map,role)=>`<span class="kpr kppl"><span class="kcagav" style="background:${tone};color:${fg}">${ini(n)}${avImg(n,map)}</span><span>${n}</span><i>${role}</i></span>`;
      const collabChip=co?`<span class="kchip kcpeep" title="Collaborators"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg><b>${co}</b><span class="kpop"><span class="kpk">${co} collaborator${co>1?'s':''}</span>${collabAll.map((n,ci)=>pplRow(n,cT[ci%cT.length],cFg,collabImg,collabRole[n])).join('')}</span></span>`:'';
      const spk='<svg viewBox="0 0 24 24"><path d="M12 3.2l1.85 4.95L18.8 10l-4.95 1.85L12 16.8l-1.85-4.95L5.2 10l4.95-1.85z"/></svg>';
      const searchPop=`<span class="kpop" data-wide><span class="kpk">${f.searchAddrs} saved search${f.searchAddrs===1?'':'es'}</span>${f.searchCards.map(sc=>`<span class="kpsc"><span class="kpsh"><span class="kpst">Search in ${sc.areas[0]}, CA</span><span class="kpso">${sc.owner}</span></span><span class="kpsm"><svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>${sc.areas.length} area${sc.areas.length>1?'s':''}<em>·</em><span class="kpsf">${spk}${sc.freq}</span></span><span class="kpstags">${sc.areas.map(a=>`<span class="kpstag">${a}</span>`).join('')}</span></span>`).join('')}</span>`;
      const homePop=`<span class="kpop" data-wide><span class="kpk">${f.hvAddrs} home value${f.hvAddrs===1?'':'s'}</span>${f.hvList.map(x=>`<span class="kpsc"><span class="kpsh"><span class="kpst">${x}</span></span><span class="kpsm"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/></svg>Tracking value<em>·</em><span class="kpsf">${spk}Monthly</span></span></span>`).join('')}</span>`;
      const adChips=`<span class="kchip kcminad" title="${f.searchAddrs} search address${f.searchAddrs===1?'':'es'}"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>${f.searchAddrs}${searchPop}</span>
          <span class="kchip kcminad" title="${f.hvAddrs} home value address${f.hvAddrs===1?'':'es'}"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/></svg>${f.hvAddrs}${homePop}</span>
          ${co?`<span class="kchip kcminad" title="Collaborators"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg>${co}<span class="kpop"><span class="kpk">${co} collaborator${co>1?'s':''}</span>${collabAll.map((n,ci)=>pplRow(n,cT[ci%cT.length],cFg,collabImg,collabRole[n])).join('')}</span></span>`:''}
          ${nCo?`<span class="kchip kcminad" title="Co-agents"><svg viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 4.4 3.4 8.4 8 10 4.6-1.6 8-5.6 8-10V6z"/><circle cx="12" cy="10" r="2.4"/><path d="M8.2 16.6a4.2 4.2 0 0 1 7.6 0"/></svg>${nCo}<span class="kpop"><span class="kpk">${nCo} co-agent${nCo>1?'s':''}</span>${coAgents.map(n=>pplRow(n,aT[n]?aT[n][0]:cT[0],aT[n]?aT[n][1]:cFg,agImg,coAgentRole[n])).join('')}</span></span>`:''}`;
      const sparkle='<svg class="aisp" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3.2l1.85 4.95L18.8 10l-4.95 1.85L12 16.8l-1.85-4.95L5.2 10l4.95-1.85z"/></svg>';
      const tRows=f.taskList.map((t,ti)=>({t,ai:(i+ti)%2===0,when:nexts[(i+ti)%nexts.length].replace('Showing ','').replace('Call back ','')}));
      const tToday=tRows.slice(0,Math.ceil(tRows.length/2)),tUp=tRows.slice(Math.ceil(tRows.length/2));
      const taskRow=r=>`<span class="kpr${r.ai?' aitask':''}">${r.ai?sparkle:'<b>·</b>'}<span>${r.t}</span><i>${r.when}</i></span>`;
      const overdue=i%5===0&&f.tasks>0;
      const counts=[f.searchAddrs?`${f.searchAddrs} search${f.searchAddrs>1?'es':''}`:'',f.hvAddrs?`${f.hvAddrs} home${f.hvAddrs>1?'s':''}`:'',co?`${co} collab`:'',nCo?`${nCo} co-agent${nCo>1?'s':''}`:''].filter(Boolean).join(' · ');
      const coagChip=nCo?`<span class="kchip kcpeep" title="Co-agents"><svg viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 4.4 3.4 8.4 8 10 4.6-1.6 8-5.6 8-10V6z"/><circle cx="12" cy="10" r="2.4"/><path d="M8.2 16.6a4.2 4.2 0 0 1 7.6 0"/></svg><b>${nCo}</b><span class="kpop"><span class="kpk">${nCo} co-agent${nCo>1?'s':''}</span>${coAgents.map(n=>pplRow(n,aT[n]?aT[n][0]:cT[0],aT[n]?aT[n][1]:cFg,agImg,coAgentRole[n])).join('')}</span></span>`:'';
      const jvBlock=jarvisLine==='off'?'':`<div class="kcwhy"><svg viewBox="0 0 24 24"><path d="M12 3.2l1.85 4.95L18.8 10l-4.95 1.85L12 16.8l-1.85-4.95L5.2 10l4.95-1.85z"/></svg><p>${whyNow(i).why}</p></div>`;
      return `<div class="kcard${isSel(i)?' sel':''}" draggable="true" tabindex="0" data-i="${i}" style="--stg:${s[1]}">
        <div class="kctop">
          <span class="kck" data-bck role="checkbox" aria-checked="${isSel(i)?'true':'false'}" aria-label="Select ${name}" tabindex="-1"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span>
          <span class="kcav" style="background:${cT[i%cT.length]};color:${cFg}">${ini(name)}${avImg(name,clientImg)}</span>
          <div class="kcid">
            <div class="kctitle"><span class="kcnm">${name}</span></div>
            <div class="kcsub" style="margin-top:3px">${cTypes(i,ty).map(t=>`<span class="kctag${t==='Contact'?' contact':''}">${t}</span>`).join('')}${xtra(i).tags.map(t=>`<span class="kctag xtra">${t}</span>`).join('')}</div>
          </div>
          <div class="kcright">
            <div class="kcacts">
              <span class="kcabtn" data-menu title="More"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></svg></span>
            </div>
            <span class="kcchev" data-exp title="Expand"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></span>
          </div>
        </div>
        ${jvBlock}
        <div class="kcmin">${adChips}</div>
        <div class="kcminf">
          <span class="kcag" title="Agent — ${ag}"><span class="kcagav" style="background:${aT[ag][0]};color:${aT[ag][1]}">${ini(ag)}${avImg(ag,agImg)}</span>${ag.split(' ')[0]}</span>
          <span class="sp"></span>
                    <span class="kcminsep"></span>
          <span class="kcago" title="Last activity">${la}</span>
        </div>
        <div class="kchov">
        <div class="kcquiet">
          ${f.unread?`<span class="qi unread" title="${f.unread} unread"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.7L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>${f.unread}</span>`:''}
          ${f.tasks?`<span class="qi ${i%5===0?'over':''}" title="${f.tasks} open task${f.tasks>1?'s':''}${i%5===0?' · overdue':''}"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>${f.tasks}</span>`:''}
          ${f.appts?`<span class="qi" title="${f.appts} upcoming"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>${f.appts}</span>`:''}
          <span class="sp"></span>
          <span title="Agent — ${ag}">${ag.split(' ')[0]}</span>
          <span class="kctxdot"></span>
          <span class="${isStale(la)?'stale':''}" title="Last activity">${la}</span>
        </div>
        <div class="kcexp">
          <div class="kcxtabs">${["Mel","Property","People","Lists"].map((t,ti)=>`<span class="kcxt${ti===0?" on":""}" data-xt="${t.toLowerCase()}">${t}</span>`).join("")}</div>
          <div class="kcxp on" data-xp="mel">
            <div class="melsum">
              <div class="melsumh">${sparkle}<span>Summary</span><span class="sp"></span><span class="melall" data-stop title="Open full summary">See more</span></div>
              <p class="melsump">${f.melSummary}</p>
              <div class="melfacts" style="display:none">${f.melFacts.map(k=>`<span class="melfact"><b>${k.k}</b>${k.v}</span>`).join('')}</div>
            </div>
            <div class="melswrow">
              <div class="melsw" data-sw="${f.aiReplies?'on':''}"><span>AI replies</span><span class="sp"></span><span class="swt${f.aiReplies?' on':''}"><i></i></span></div>
              <span class="melswdiv" aria-hidden="true"></span>
              <div class="melsw" data-sw="${f.autoProspect?'on':''}"><span>Auto-prospect</span><span class="sp"></span><span class="swt${f.autoProspect?' on':''}"><i></i></span></div>
            </div>
            <div class="melck"><span>Campaigns</span><em></em></div>
            <div class="mecl">${f.campaigns.map(c=>`<div class="melcamp" tabindex="0" role="button" aria-label="Open campaign ${c.name}, ${c.statusLabel}"><span class="melcn">${c.name}</span><span class="melst ${c.tone}">${c.statusLabel}</span></div>`).join('')}${xtra(i).camps.map(c=>`<div class="melcamp" tabindex="0" role="button" aria-label="Open campaign ${c}, just assigned"><span class="melcn">${c}</span><span class="melst">Assigned</span></div>`).join('')}</div>
            <div class="melasn" data-stop><button type="button" class="melasnb" data-assign aria-haspopup="menu" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Assign campaign</button><div class="melasnm" role="menu">${assignable.map(a=>`<div class="melasni" role="menuitem" tabindex="0" data-assign-pick="${a}">${a}</div>`).join('')}</div></div>
          </div>
          <div class="kcxp" data-xp="property">
          ${f.searchCards.length?`<div class="kcxr"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg><span><b>${f.searchCards[0].label}</b></span>${f.searchCards.length>1?`<span class="kchip kcmore" title="Other saved searches">+${f.searchCards.length-1}<span class="kpop"><span class="kpk">Saved searches (${f.searchCards.length})</span>${f.searchCards.map((sc,sci)=>`<span class="kpr"><b>${sc.label}</b><span>${budgets[(i+sci)%budgets.length]}</span><i>${sc.areas.length} area${sc.areas.length>1?"s":""} · ${sc.freq}</i></span>`).join("")}</span></span>`:""}</div>`:""}
          ${f.hvCards.length?`<div class="kcxr"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z"/><path d="M9 21v-6h6v6"/></svg><span><b>${f.hvCards[0].est}</b> est. · ${f.hvCards[0].addr}</span><span class="kctrend">${f.hvCards[0].chg}</span>${f.hvCards.length>1?`<span class="kchip kcmore" title="Other tracked homes">+${f.hvCards.length-1}<span class="kpop"><span class="kpk">Home values (${f.hvCards.length})</span>${f.hvCards.map(hv=>`<span class="kpr"><b>${hv.est}</b><span>${hv.addr}</span><i>${hv.chg} · ${hv.cad}</i></span>`).join("")}</span></span>`:""}</div>`:""}
          </div>
          <div class="kcxp" data-xp="lists">
          ${f.lists.length?`<div class="kcxr"><svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg><span>${f.lists[0]}</span></div>`:''}
          ${xtra(i).lists.map(l=>`<div class="kcxr"><svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg><span>${l}</span></div>`).join('')}
          </div>
          <div class="kcxp" data-xp="people">
          ${co?`<div class="kcxr"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/></svg><span class="kcxppl">${collabAll.slice(0,6).map((n,ci)=>`<span class="kcagav" title="${n} — ${collabRole[n]}" style="background:${cT[ci%cT.length]};color:${cFg}">${ini(n)}${avImg(n,collabImg)}</span>`).join('')}<em>${co} collaborator${co>1?'s':''}</em></span></div>`:''}
          ${nCo?`<div class="kcxr"><svg viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 4.4 3.4 8.4 8 10 4.6-1.6 8-5.6 8-10V6z"/><circle cx="12" cy="10" r="2.4"/><path d="M8.2 16.6a4.2 4.2 0 0 1 7.6 0"/></svg><span class="kcxppl">${coAgents.map(n=>`<span class="kcagav" title="${n} — ${coAgentRole[n]}" style="background:${aT[n]?aT[n][0]:cT[0]};color:${aT[n]?aT[n][1]:cFg}">${ini(n)}${avImg(n,agImg)}</span>`).join('')}<em>${nCo} co-agent${nCo>1?'s':''}</em></span></div>`:''}
          <div class="kcxr"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg><span>${em}</span></div>
          <div class="kcxr"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg><span class="mono">${ph}</span></div>
          </div>
        </div>
        <div class="kcfoot">
          <span class="kcag" title="Agent — ${ag}"><span class="kcagav" style="background:${aT[ag][0]};color:${aT[ag][1]}">${ini(ag)}${avImg(ag,agImg)}</span>${ag.split(' ')[0]}</span>
          <span class="sp"></span>
          <span class="kchip kcsecb${f.unread?" act":""}" data-sec="messages" title="${f.unread?f.unread+' unread':'Messages'}"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.7L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>${f.unread?'<span class="kcdot"></span>':""}</span>
                    ${f.tasks?`<span class="kchip kcsecb${overdue?" od":""}" data-sec="tasks" title="${f.tasks} open task${f.tasks>1?'s':''}"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><b>${f.tasks}</b></span>`:""}
          ${f.appts?`<span class="kchip kcsecb" data-sec="appts" title="${f.appts} upcoming"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><b>${f.appts}</b></span>`:""}
        </div>
        <div class="kcsecs">
          <div class="kcsec" data-sp="messages">
            <div class="kcsk">${f.unread?f.unread+" unread":"Last message"}</div>
            <span class="convo" data-go="messages" style="padding:6px;border:1px solid var(--neutral-200);border-radius:9px"><span class="pav" style="width:22px;height:22px;font-size:10px">${ini(name)}<i></i></span><span class="cmeta"><span class="cname" style="font-size:12px">${name}</span><span class="csnip" style="font-size:11px">${f.lastMsg}</span></span><span class="ctime" style="font-size:11px">${f.msgWhen}</span></span>
          </div>
          ${f.tasks?`<div class="kcsec" data-sp="tasks">${["Overdue","Today","Upcoming"].map(g=>{const rows=f.taskCards.filter(t=>t.grp===g);return rows.length?`<div class="kcsk${g==="Overdue"?" od":""}">${g}</div>${rows.map(t=>`<div class="mtask${g==="Overdue"?" over":""}"><div class="mtk"><span class="mck"></span><span class="mtt">${t.t}</span>${t.ai?'<span class="mai">AI</span>':""}</div><div class="mtm"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span>${t.rem}</span><svg viewBox="0 0 24 24"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/></svg><span>${t.time}</span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span>${t.date}</span></div></div>`).join("")}`:""}).join("")}</div>`:""}
          ${f.appts?`<div class="kcsec" data-sp="appts"><div class="kcsk">Upcoming</div>${f.apptCards.map(a=>`<div class="mtask"><div class="mtk"><span class="mdt"><b>${a.m}</b><i>${a.d}</i></span><span class="mline"><span class="mtt">${a.t}</span><span class="msub">${a.note}</span></span></div><div class="mtm"><svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span>${a.rem}</span><span class="sp"></span><svg viewBox="0 0 24 24"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/></svg><span>${a.time}</span></div></div>`).join("")}</div>`:""}
        </div>
        </div>
      </div>`;
    }).join('')||'<div class="kempty">No clients in this stage</div>';
    return `<section class="kcol" data-stage="${si}">
      <div class="kcolh"><i style="background:${s[1]}"></i><span class="kcoln" title="${s[0]}">${s[0]}</span><span class="kcolc">${ids.length}</span><span class="kcolv" title="Pipeline value in this stage">${colValue(ids)}</span><span class="sp"></span>
        <button type="button" class="kcolall${ids.length&&ids.every(x=>isSel(x))?' clr':''}" data-colall="${si}">${ids.length&&ids.every(x=>isSel(x))?'Clear':'Select all'}</button>
        <span class="kcabtn" style="opacity:1" title="Add client"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>
        <span class="kcabtn" style="opacity:1" title="Stage options"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></span>
      </div>
      <div class="kcolb" data-stage="${si}">${cards}</div>
    </section>`;
  }).join('');
  bindDrag();
}
let dragI=null;
let density='detail';
let cardLayout='current';
/* stale = no activity in 7+ days; "3d ago" / "2w ago" / "Jul 12" style strings */
const isStale=la=>{
  const m=/^(\d+)\s*([dwm])/.exec(String(la).trim());
  if(!m)return false;
  const n=+m[1];
  return m[2]==='d'?n>=7:true;
};
/* stage header forecast — sum of each client's transaction price */
const colValue=ids=>{
  const t=ids.reduce((a,i)=>a+(+String(info(i).price).replace(/[^\d]/g,'')||0),0);
  if(!t)return '';
  return '· $'+(t>=1e6?(t/1e6).toFixed(1)+'M':Math.round(t/1e3)+'K');
};
/* per-client pipeline detail — what an agent needs at a glance on the board */
const areas=["Palo Alto","Sunnyvale","Menlo Park","Mountain View","Cupertino","Redwood City","Los Altos","Burlingame"];
const budgets=["$1.2M – 1.4M","$850K – 1M","$2.1M – 2.4M","$1.6M – 1.8M","$740K – 900K","$3.0M – 3.4M"];
const nexts=["Showing Tue 2:00 PM","Call back Thu","Offer review Fri","Listing photos Mon","Docs due Wed","Follow up Jul 28"];
const tagsBy={Buyer:["Pre-approved","Portal active"],Seller:["Listing prep"],Landlord:["Lease ready"]};
const ar=(a,k)=>{const o=[a];if(k%3===0){const b=areas[(k+1)%areas.length];if(b!==a&&!o.includes(b))o.push(b);}return o;};
const addrs=["275 Miramar Ave, SF","1408 Cowper St","88 King St #1204","640 Alma St","3120 Alexis Dr","19 Bayview Ct","210 Laurel Ave","77 Sand Hill Cir"];
const prices=["$1,250,000","$860,000","$2,240,000","$1,680,000","$740,000","$3,150,000"];
const txStat=["Pending","Active","Under contract","Pending"];
const assignable=["Nurture — first-time buyers","Listing alerts — Noe Valley","Seller check-in","Welcome new buyers","Quarterly market note"];
const listPool=["Hot buyers","Q3 nurture","Open house Jul 26","Referral sphere","Luxury watch","Past clients"];
const acts=["Status changed to Sending/Receiving Offers","Offer submitted","New search criteria added","Transaction created from recent offer","Call logged — 6 min","Note shared with TC"];
/* a client can hold several roles at once (buyer + seller, seller + landlord, …); Contact = no active role */
const cTypes=(i,ty)=>{
  const combo=[[ty],[ty],[ty,'Seller'],[ty],[ty,'Landlord'],['Contact'],[ty,'Tenant'],[ty]][i%8];
  return [...new Set(combo)].slice(0,3);
};
const info=i=>{
  const [name,ph,em,ty]=data[i];
  return {
    budget:budgets[i%budgets.length],
    detail:ty==='Buyer'?`${2+(i%3)} bd`:`${3+(i%4)} bd`,
    area:areas[i%areas.length],
    next:nexts[i%nexts.length],
    unread:[0,3,0,1,0,0,2,0,5,0,1,0,0,4,0,2,0,0,1,0,3,0][i]||0,
    tag:(tagsBy[ty]||[])[i%((tagsBy[ty]||['']).length)]||'',
    price:prices[i%prices.length],
    address:addrs[i%addrs.length],
    txStatus:txStat[i%txStat.length],
    tasks:[0,2,1,0,3,0,1,0,2,0,1,4,0,1,0,2,0,1,0,3,0,1][i]||0,
    appts:[1,0,0,2,0,1,0,0,1,0,2,0,0,1,0,0,1,0,2,0,0,1][i]||0,
    apptWhen:nexts[(i+2)%nexts.length],
    taskList:["Send updated disclosures","Confirm lender pre-approval","Book photographer","Chase signed addendum"].slice(0,[0,2,1,0,3,0,1,0,2,0,1,4,0,1,0,2,0,1,0,3,0,1][i]||0),
    apptList:[nexts[(i+2)%nexts.length],nexts[(i+4)%nexts.length]].slice(0,[1,0,0,2,0,1,0,0,1,0,2,0,0,1,0,0,1,0,2,0,0,1][i]||0),
    lastMsg:["Can we push the showing to Thursday?","Thanks — reviewing the docs tonight.","Sending over the pre-approval now.","Is the seller open to a Sep 1 close?"][i%4],
    msgWhen:["12m ago","2h ago","Yesterday","3d ago"][i%4],
    /* buyers/tenants save several target cities; sellers/landlords list several homes */
    scope:(ty==='Seller'||ty==='Landlord')
      ? [addrs[i%addrs.length],addrs[(i+3)%addrs.length]].slice(0,1+(i%2))
      : [areas[i%areas.length],areas[(i+2)%areas.length],areas[(i+4)%areas.length]].slice(0,1+(i%3)),
    scopeKind:(ty==='Seller'||ty==='Landlord')?'Homes':'Search areas',
    lists:listPool.slice(i%3,(i%3)+((i%4)===0?0:1+(i%3))),
    searches:(i%3)===0?0:1,
    /* addresses the client saved for area search vs. homes they track a value on */
    searchAddrs:[3,1,2,0,4,2,1,3][i%8],
    hvAddrs:[1,2,0,1,3,1,2,0][i%8],
    searchList:[areas[i%areas.length],areas[(i+2)%areas.length],areas[(i+4)%areas.length],areas[(i+6)%areas.length]].slice(0,[3,1,2,0,4,2,1,3][i%8]),
    searchCards:[areas[i%areas.length],areas[(i+2)%areas.length],areas[(i+4)%areas.length],areas[(i+6)%areas.length]].slice(0,[3,1,2,0,4,2,1,3][i%8]).map((a,si)=>({
      areas:ar(a,i+si),
      label:(i+si)%3===1?["Skyline apartment","Westside investor pad","Peninsula family home","Downtown loft"][(i+si)%4]:ar(a,i+si).join(' · '),
      freq:['Daily','Weekly','Instant'][(i+si)%3],
      owner:['Daniel','Kira','You'][(i+si)%3]
    })),
    hvList:[addrs[i%addrs.length],addrs[(i+3)%addrs.length],addrs[(i+5)%addrs.length]].slice(0,[1,2,0,1,3,1,2,0][i%8]),
    campaign:(i%3===0)?null:{name:["Nurture — first-time buyers","Listing alerts — Noe Valley","Seller check-in"][i%3],stat:["42% open · 3 replies","61% open · 1 reply","28% open"][i%3]},
    aiSummary:["Warm — wants a Thursday showing, budget firm.","Reviewing docs; decision expected this week.","Quiet 9 days — worth a check-in call."][i%3],
    /* rolling relationship summary Mel keeps current, plus the facts it pulled out */
    melSummary:[
      "Buying with a firm ceiling; wants a Thursday showing and moves fast when the layout fits. Financing is clean — pre-approval already on file.",
      "Mid-transaction and reading everything closely. Docs are with them now; expects to decide this week without much nudging.",
      "Gone quiet for 9 days after a strong start. Still watching the same three areas — a check-in call is the right next touch."
    ][i%3],
    melUpdated:["2h ago","yesterday","4h ago"][i%3],
    melFacts:[
      {k:"Budget",v:budgets[i%budgets.length]},
      {k:"Area",v:areas[i%areas.length]},
      {k:"Timeline",v:["30–60 days","This quarter","Watching"][i%3]},
      {k:"Financing",v:["Pre-approved","Lender pending","Cash"][i%3]}
    ],
    aiReplies:i%3!==2,
    autoProspect:i%4===0,
    campaigns:[
      {name:["Nurture — first-time buyers","Listing alerts — Noe Valley","Seller check-in"][i%3],statusLabel:"Active",tone:"act"},
      {name:["Welcome new buyers","Just-listed alerts","Quarterly market note"][(i+1)%3],statusLabel:["Scheduled","Since Aug 2","Sent"][(i+2)%3],tone:["sch","sch","snt"][(i+2)%3]}
    ].slice(0,(i%3===0)?1:2),
    taskCards:["Follow up on pre-approval status (Email)","Confirm lender pre-approval","Book listing photographer","Chase signed addendum"].slice(0,[0,2,1,0,3,0,1,0,2,0,1,4,0,1,0,2,0,1,0,3,0,1][i]||0).map((t,ti)=>({t,rem:"30 min before",time:["2:00 PM","9:30 AM","4:15 PM"][(i+ti)%3],date:["12/23/2026","07/29/2026","08/04/2026"][(i+ti)%3],ai:(i+ti)%2===0,grp:(i%5===0&&ti===0)?"Overdue":(ti%2===0?"Today":"Upcoming")})),
    apptCards:[{m:"Jan",d:"16",t:"Showing — 456 Sunset Blvd"},{m:"Jan",d:"17",t:"Offer review call"}].slice(0,[1,0,0,2,0,1,0,0,1,0,2,0,0,1,0,0,1,0,2,0,0,1][i]||0).map((a,ai2)=>({...a,note:["Walk-through w/ Violet. Backyard + kitchen are…","Review counter terms before signing."][ai2%2],rem:["30 min before","10 min before"][ai2%2],time:["2:00 PM","4:00 PM"][ai2%2]})),
    searchNames:["Skyline apartment","Westside investor pad","Peninsula family home","Downtown loft"],
    hvCards:[addrs[i%addrs.length],addrs[(i+3)%addrs.length],addrs[(i+5)%addrs.length]].slice(0,[1,2,0,1,3,1,2,0][i%8]).map((a,hi)=>({addr:a,est:["$814,166","$1,240,500","$962,300"][(i+hi)%3],chg:["+3.2%","+1.4%","−0.8%"][(i+hi)%3],cad:["Quarterly","Monthly","Off"][(i+hi)%3]})),
    activity:acts[i%acts.length]
  };
};
/* Mel-tab switches + inline actions: act locally, never bubble into card expand/collapse */
document.addEventListener('click',e=>{
  const va=e.target.closest('.melall');
  if(va){e.stopPropagation();va.closest('.melsum').classList.toggle('sumopen');return;}
  const sw=e.target.closest('.melsw');
  if(sw){e.stopPropagation();const t=sw.querySelector('.swt');t.classList.toggle('on');sw.dataset.sw=t.classList.contains('on')?'on':'';return;}
  const ab=e.target.closest('[data-assign]');
  if(ab){e.stopPropagation();const w=ab.closest('.melasn');const open=!w.classList.contains('open');document.querySelectorAll('.melasn.open').forEach(o=>{o.classList.remove('open');o.querySelector('[data-assign]').setAttribute('aria-expanded','false');});w.classList.toggle('open',open);ab.setAttribute('aria-expanded',String(open));return;}
  const ap=e.target.closest('[data-assign-pick]');
  if(ap){e.stopPropagation();const w=ap.closest('.melasn');const list=w.parentNode.querySelector('.mecl');const nm=ap.dataset.assignPick;if(list&&![...list.children].some(r=>r.querySelector('.melcn').textContent===nm)){const row=document.createElement('div');row.className='melcamp';row.tabIndex=0;row.setAttribute('role','button');row.innerHTML='<span class="melcn"></span><span class="melst sch">Scheduled</span>';row.querySelector('.melcn').textContent=nm;row.setAttribute('aria-label','Open campaign '+nm+', Scheduled');list.appendChild(row);}w.classList.remove('open');w.querySelector('[data-assign]').setAttribute('aria-expanded','false');return;}
  if(!e.target.closest('.melasn'))document.querySelectorAll('.melasn.open').forEach(o=>{o.classList.remove('open');o.querySelector('[data-assign]').setAttribute('aria-expanded','false');});
  if(e.target.closest('[data-stop]')||e.target.closest('.melcamp'))e.stopPropagation();
},true);
const ghost=document.createElement('div');ghost.className='kghost';
function bindDrag(){
  board.querySelectorAll('.kcard').forEach(c=>{
    c.addEventListener('dragstart',e=>{dragI=+c.dataset.i;c.classList.add('dragging');e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',c.dataset.i)});
    c.addEventListener('dragend',()=>{c.classList.remove('dragging');ghost.remove();board.querySelectorAll('.kcolb').forEach(b=>b.classList.remove('dragover'))});
  });
  board.querySelectorAll('.kcolb').forEach(b=>{
    b.addEventListener('dragover',e=>{
      e.preventDefault();b.classList.add('dragover');
      const after=[...b.querySelectorAll('.kcard:not(.dragging)')].find(el=>e.clientY<el.getBoundingClientRect().top+el.offsetHeight/2);
      const empty=b.querySelector('.kempty');if(empty)empty.remove();
      after?b.insertBefore(ghost,after):b.appendChild(ghost);
    });
    b.addEventListener('dragleave',e=>{if(!b.contains(e.relatedTarget)){b.classList.remove('dragover')}});
    b.addEventListener('drop',e=>{
      e.preventDefault();
      if(dragI===null)return;
      const target=+b.dataset.stage;
      const before=ghost.nextElementSibling&&ghost.nextElementSibling.classList.contains('kcard')?+ghost.nextElementSibling.dataset.i:null;
      data[dragI][4]=target;
      order=order.filter(i=>i!==dragI);
      const at=before===null?order.length:order.indexOf(before);
      order.splice(at<0?order.length:at,0,dragI);
      dragI=null;ghost.remove();
      renderBoard();renderTable();
    });
  });
}
document.getElementById('cl-vtoggle').addEventListener('click',e=>{
  const b=e.target.closest('.vtbtn');if(!b)return;
  const isBoard=b.dataset.view==='board';
  document.querySelectorAll('#cl-vtoggle .vtbtn').forEach(x=>x.classList.toggle('on',x===b));
  document.getElementById('cl-twrap').style.display=isBoard?'none':'';
  board.classList.toggle('on',isBoard);
  ['cl-hrail','cl-hfade'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=isBoard?'none':''});
  if(isBoard)renderBoard();
});
/* chip popovers render in a body-level fixed layer so column scroll overflow can't clip them */
const kpopEl=document.createElement('div');kpopEl.className='kpopfx';document.body.appendChild(kpopEl);
let kpopChip=null,kpopT=null;
const hideKpop=()=>{kpopEl.classList.remove('on');kpopChip=null;};
const hideKpopSoon=()=>{clearTimeout(kpopT);kpopT=setTimeout(hideKpop,160);};
const onChipHover=e=>{
  const chip=e.target.closest('.kchip');
  if(!chip){if(!e.target.closest('.kpopfx'))hideKpopSoon();return;}
  clearTimeout(kpopT);
  if(chip===kpopChip)return;
  const src=chip.querySelector('.kpop');
  if(!src){hideKpop();return;}
  kpopChip=chip;kpopEl.innerHTML=src.innerHTML;kpopEl.classList.toggle('wide',src.hasAttribute('data-wide'));kpopEl.classList.add('on');
  const r=chip.getBoundingClientRect(),h=kpopEl.offsetHeight,w=kpopEl.offsetWidth;
  let top=r.top-h-7,below=false;
  if(top<8){top=r.bottom+7;below=true;}
  kpopEl.classList.toggle('below',below);kpopEl.classList.toggle('above',!below);
  kpopEl.style.top=top+'px';
  kpopEl.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
};
board.addEventListener('mouseover',onChipHover);
board.addEventListener('mouseleave',hideKpopSoon);
kpopEl.addEventListener('mouseenter',()=>clearTimeout(kpopT));
kpopEl.addEventListener('mouseleave',hideKpop);
kpopEl.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go&&kpopChip){
    const card=kpopChip.closest('.kcard');
    const nm=card?data[+card.dataset.i][0]:'';
    sonner(go.dataset.go==='messages'?'Opening messenger':'Opening timeline',nm);
  }
  hideKpop();
});
board.addEventListener('scroll',hideKpop,true);

/* ---------- minimal layout: hover reveal in a fixed layer ---------- */
const khov=document.createElement('div');khov.className='khovfx';document.body.appendChild(khov);
khov.addEventListener('mouseover',onChipHover);
let khovI=null,khovT=null;
const hideKhov=()=>{clearTimeout(khovT);khov.classList.remove('on');khov.innerHTML='';
  if(khovI!=null){const c=board.querySelector(`.kcard[data-i="${khovI}"]`);if(c)c.classList.remove('hovopen');}
  khovI=null;hideKpop();};
const hideKhovSoon=()=>{clearTimeout(khovT);khovT=setTimeout(hideKhov,140);};
function showKhov(card){
  const i=+card.dataset.i;
  if(i===khovI){clearTimeout(khovT);return;}
  hideKhov();
  const src=card.querySelector('.kchov');if(!src)return;
  khovI=i;card.classList.add('hovopen');
  khov.innerHTML=src.innerHTML;
  khov.classList.add('on');khov.classList.remove('above');
  const r=card.getBoundingClientRect();
  khov.style.width=r.width+'px';
  khov.style.left=r.left+'px';
  const h=khov.offsetHeight;
  if(r.bottom+h>innerHeight-8&&r.top-h>8){khov.classList.add('above');khov.style.maxHeight=(r.top-16)+'px';khov.style.top=(r.top-khov.offsetHeight)+'px';}
  else{khov.style.maxHeight=Math.max(120,innerHeight-r.bottom-16)+'px';khov.style.top=r.bottom+'px';}
}
board.addEventListener('mouseover',e=>{
  if(cardLayout!=='minimal'||!board.classList.contains('mn'))return;
  const card=e.target.closest('.kcard');
  if(card)showKhov(card); else if(!e.target.closest('.khovfx'))hideKhovSoon();
});
board.addEventListener('mouseleave',hideKhovSoon);
khov.addEventListener('mouseenter',()=>clearTimeout(khovT));
khov.addEventListener('mouseleave',hideKhovSoon);
board.addEventListener('scroll',hideKhov,true);
window.addEventListener('resize',hideKhov);
khov.addEventListener('click',e=>{
  if(khovI==null)return;
  const i=khovI,nm=data[i][0];
  const qa=e.target.closest('[data-qa]');
  if(qa){
    const a=qa.dataset.qa;
    if(a==='call')sonner('Calling '+nm,data[i][1]);
    else if(a==='text')sonner('New message to '+nm,data[i][1]);
    else if(a==='email')sonner('New email to '+nm,data[i][2]);
    else if(a==='log')sonner('Log activity',nm);
    else if(a==='stage'){const c=board.querySelector(`.kcard[data-i="${i}"]`);if(c)moveStage(i,c);}
    return;
  }
  const mb=e.target.closest('[data-menu]');
  if(mb){openCardMenu(i,mb,board.querySelector(`.kcard[data-i="${i}"]`)||khov);return;}
  const go=e.target.closest('[data-go]');
  if(go){sonner(go.dataset.go==='messages'?'Opening messenger':'Opening timeline',nm);return;}
  sonner('Opening client',nm);
});

board.addEventListener('click',e=>{
  const card=e.target.closest('.kcard'); if(!card)return;
  const va=e.target.closest('.melall')||e.target.closest('.melsump');
  if(va){va.closest('.melsum').classList.toggle('sumopen');return;}
  const i=+card.dataset.i;
  const nm=data[i][0];
  const qa=e.target.closest('[data-qa]');
  if(qa){
    const a=qa.dataset.qa;
    if(a==='call')sonner('Calling '+nm,data[i][1]);
    else if(a==='text')sonner('New message to '+nm,data[i][1]);
    else if(a==='email')sonner('New email to '+nm,data[i][2]);
    else if(a==='log')sonner('Log activity',nm);
    else if(a==='stage')moveStage(i,card);
    return;
  }
  const xt=e.target.closest('[data-xt]');
  if(xt){const sc=xt.closest('.kcexp');sc.querySelectorAll('[data-xt]').forEach(t=>t.classList.remove('on'));sc.querySelectorAll('.kcxp').forEach(p=>p.classList.remove('on'));xt.classList.add('on');const p=sc.querySelector('[data-xp="'+xt.dataset.xt+'"]');if(p)p.classList.add('on');return;}
  const secb=e.target.closest('[data-sec]');
  if(secb){
    const key=secb.dataset.sec,wrap=secb.closest('.kchov').querySelector('.kcsecs'),was=secb.classList.contains('on');
    const scope=secb.closest('.kchov');
    scope.querySelectorAll('[data-sec]').forEach(c=>c.classList.remove('on'));
    scope.querySelectorAll('.kcsec').forEach(p=>p.classList.remove('on'));
    if(was){wrap.classList.remove('on');}
    else{secb.classList.add('on');const p=wrap.querySelector('[data-sp="'+key+'"]');if(p)p.classList.add('on');wrap.classList.add('on');}
    return;
  }
  if(e.target.closest('[data-exp]')){card.classList.toggle('open');return;}
  const mb=e.target.closest('[data-menu]');
  if(mb){openCardMenu(i,mb,card);return;}
  if(e.target.closest('[data-go]')){window.sonner&&sonner('Opening timeline',nm);return;}
  window.sonner&&sonner('Opening client',nm);
});
/* ---------- quiet mode: stage move + keyboard nav (j/k, 1–8, Enter, m) ---------- */
const stgPop=document.createElement('div');stgPop.className='kpopfx';document.body.appendChild(stgPop);
function moveStage(i,card){
  stgPop.innerHTML='<span class="kpk">Move to stage</span>'+stages.map((s,si)=>`<span class="kpr" data-stg="${si}"><b>${si+1}</b>${s[0]}</span>`).join('');
  const r=card.getBoundingClientRect();
  stgPop.classList.add('on');
  stgPop.style.top=Math.min(r.top,innerHeight-stgPop.offsetHeight-8)+'px';
  stgPop.style.left=Math.max(8,Math.min(r.left,innerWidth-stgPop.offsetWidth-8))+'px';
  stgPop._i=i;
}
stgPop.addEventListener('click',e=>{
  const r=e.target.closest('[data-stg]');if(!r)return;
  setStage(stgPop._i,+r.dataset.stg);
  stgPop.classList.remove('on');
});
document.addEventListener('click',e=>{if(!e.target.closest('[data-menu]')&&!e.target.closest('.kpopfx')&&!e.target.closest('.kcmenu'))stgPop.classList.remove('on')});

/* ---------- card ⋮ menu: Move stage · Mark as private ---------- */
const kcMenu=document.createElement('div');kcMenu.className='rmpop kcmenu';document.body.appendChild(kcMenu);
let kcMenuFor=null;
const hideKcMenu=()=>{kcMenu.classList.remove('open');kcMenuFor=null;};
function openCardMenu(i,anchor,card){
  if(kcMenuFor===i){hideKcMenu();return;}
  kcMenuFor=i;
  const priv=!!data[i][8];
  kcMenu.innerHTML=
    `<div class="rmitem" data-kcm="stage"><svg viewBox="0 0 24 24"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>Move stage</div>`+
    `<div class="rmitem" data-kcm="priv"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>${priv?'Remove private':'Mark as private'}</div>`;
  kcMenu._i=i;kcMenu._card=card;
  kcMenu.classList.add('open');
  const r=anchor.getBoundingClientRect(),h=kcMenu.offsetHeight,w=kcMenu.offsetWidth;
  let top=r.bottom+6;if(top+h>innerHeight-8)top=Math.max(8,r.top-h-6);
  kcMenu.style.top=top+'px';
  kcMenu.style.left=Math.max(8,Math.min(r.right-w,innerWidth-w-8))+'px';
}
kcMenu.addEventListener('click',e=>{
  const it=e.target.closest('[data-kcm]');if(!it)return;
  const i=kcMenu._i;hideKcMenu();
  if(it.dataset.kcm==='stage'){const c=board.querySelector(`.kcard[data-i="${i}"]`)||kcMenu._card;moveStage(i,c);return;}
  data[i][8]=!data[i][8];
  renderBoard();renderTable();
  sonner(data[i][8]?'Marked as private':'Private removed',data[i][0]);
});
document.addEventListener('click',e=>{if(!e.target.closest('.kcmenu')&&!e.target.closest('[data-menu]'))hideKcMenu()},true);
addEventListener('resize',hideKcMenu);
window.addEventListener('scroll',hideKcMenu,true);
function setStage(i,si){
  data[i][4]=si;
  renderBoard();renderTable();
  sonner(data[i][0]+' → '+stages[si][0]);
  focusCard(i);
}
let kbI=null;
function focusCard(i){
  board.querySelectorAll('.kcard.kbf').forEach(c=>c.classList.remove('kbf'));
  if(i==null){kbI=null;return;}
  const el=board.querySelector(`.kcard[data-i="${i}"]`);
  if(!el)return;
  kbI=i;el.classList.add('kbf');
  const b=el.closest('.kcolb'),er=el.getBoundingClientRect(),br=b.getBoundingClientRect();
  if(er.top<br.top)b.scrollTop+=er.top-br.top-8;
  else if(er.bottom>br.bottom)b.scrollTop+=er.bottom-br.bottom+8;
}
window.__applyDensity=v=>{density=v==='compact'?'compact':'detail';
  try{localStorage.setItem('crm-density',density)}catch(e){}
  if(document.getElementById('cl-board'))renderBoard();
};

window.__applyCardLayout=v=>{cardLayout=['minimal','signal'].includes(v)?v:'current';
  if(window.__hideKhov)window.__hideKhov();
  sgSel.clear();
  try{localStorage.setItem('crm-cardlayout-v2',cardLayout)}catch(e){}
  if(document.getElementById('cl-board'))renderBoard();
};


/* ================================================================
   SIGNAL BOARD — the board's job is to move work forward.
   Every card answers three things and nothing else:
     who · what's the deal · why this one, now (Jarvis)
   Everything reference-grade lives in the client profile.
   ================================================================ */
let jarvisLine='why';     /* off | why | act  — Jarvis on the card */
let pivot='stage';        /* stage | agent | temp | list */
let sgSel=new Set();      /* bulk selection (secondary) */
let sweepOn=false,sweepAt=0,sweepQueue=[];

const sgIcon={
  spark:'<svg class="sgsp" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.7 4.6 4.6 1.7-4.6 1.7L12 15.1l-1.7-4.6L5.7 8.8l4.6-1.7L12 2.5zM18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
  chat:'<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.7-.7L3 21l1.9-4.9A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>',
  mail:'<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  pen:'<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  check:'<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  user:'<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>',
  ext:'<svg viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></svg>',
  dots:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>',
  tick:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
  play:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  done:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></svg>'
};

/* days-since-touch as a number, for sorting + temperature */
const ageDays=la=>{const m=/^(\d+)\s*([hdwm])/.exec(String(la).trim());if(!m)return 30;const n=+m[1];return m[2]==='h'?0:m[2]==='d'?n:m[2]==='w'?n*7:n*30;};
/* temperature is derived, never hand-set: engagement beats recency */
const tempOf=i=>{const f=info(i),d=ageDays(data[i][7]);
  if(f.unread>=2||(f.unread&&f.appts))return 'hot';
  if(d>=7)return 'cold';
  return 'warm';};
const tempMeta={hot:['Hot','#DC2626'],warm:['Warm','#EA580C'],cold:['Cold','#A3A3A3']};

/* Jarvis: one line that earns the card its place in your day, plus one action. */
const whyNow=i=>{
  const f=info(i),la=data[i][7],d=ageDays(la),over=f.tasks&&i%5===0;
  if(over)return{tone:'red',why:`${f.tasks} task${f.tasks>1?'s':''} overdue — this is what's holding the deal.`,act:'Clear tasks',ic:'check'};
  if(f.unread)return{tone:'red',why:`Waiting on you since ${f.msgWhen} — “${f.lastMsg}”`,act:'Reply',ic:'chat'};
  if(d>=14)return{tone:'red',why:`Silent ${la.replace(' ago','')}. At this stage that usually means they're talking to someone else.`,act:'Call now',ic:'phone'};
  if(d>=7)return{tone:'amber',why:`No contact in ${la.replace(' ago','')} — nudge before the trail goes cold.`,act:'Send nudge',ic:'chat'};
  if(f.appts)return{tone:'none',why:`${f.next}. Confirm the details so it doesn't slip.`,act:'Confirm',ic:'cal'};
  if(f.tasks)return{tone:'none',why:`${f.tasks} open task${f.tasks>1?'s':''} before this can advance.`,act:'Open tasks',ic:'check'};
  return{tone:'none',why:`On track — next up is ${String(f.next).toLowerCase()}.`,act:'Log activity',ic:'pen'};
};

/* pivot: same cards, regrouped. Columns stay droppable only when grouped by stage. */
const sgGroups=()=>{
  if(pivot==='agent'){
    const seen=[];order.forEach(i=>{if(!seen.includes(data[i][5]))seen.push(data[i][5])});
    return seen.map(a=>({label:a,color:(agtone[a]||['#e5e5e5','#404040'])[1],ids:order.filter(i=>data[i][5]===a&&passesCl(data[i])),drop:null}));
  }
  if(pivot==='temp'){
    return ['hot','warm','cold'].map(t=>({label:tempMeta[t][0],color:tempMeta[t][1],ids:order.filter(i=>tempOf(i)===t&&passesCl(data[i])),drop:null}));
  }
  if(pivot==='list'){
    return listPool.slice(0,4).map(l=>({label:l,color:'#5A5FF2',ids:order.filter(i=>info(i).lists.includes(l)&&passesCl(data[i])),drop:null}));
  }
  return stages.map((s,si)=>({label:s[0],color:s[1],ids:order.filter(i=>data[i][4]===si&&passesCl(data[i])),drop:si}));
};

function sgCard(i,dark){
  const [name,ph,em,ty,,ag,co,la,priv]=data[i];
  const f=info(i),w=whyNow(i),t=tempOf(i),d=ageDays(la);
  const cT=dark?collabToneDark:collabTone,aT=dark?agtoneDark:agtone;
  const cFg=dark?'#f5f5f5':'#404040';
  const roles=cTypes(i,ty);
  const over=f.tasks&&i%5===0;
  const alarms=[
    f.unread?`<span class="sgal unread" title="${f.unread} unread message${f.unread>1?'s':''}">${sgIcon.chat}${f.unread}</span>`:'',
    f.tasks?`<span class="sgal${over?' over':''}" title="${f.tasks} open task${f.tasks>1?'s':''}${over?' · overdue':''}">${sgIcon.check}${f.tasks}</span>`:''
  ].join('');
  const jline=jarvisLine==='off'?'':`<div class="sgwhy">${sgIcon.spark}<div style="min-width:0"><p>${w.why}</p>${jarvisLine==='act'?`<button class="sgdo" data-act="${w.act}">${sgIcon[w.ic]}${w.act}</button>`:''}</div></div>`;
  return `<div class="sgcard${sgSel.has(i)?' sel':''}" draggable="true" data-i="${i}" data-tone="${w.tone}" tabindex="0">
    <span class="sgrail"></span>
    <div class="sgbody">
      <div class="sgtop">
        <span class="sgavw"><span class="sgav" style="background:${cT[i%cT.length]};color:${cFg}">${ini(name)}${avImg(name,clientImg)}</span><span class="sgck" data-ck title="Select">${sgIcon.tick}</span></span>
        <span class="sgnm" title="${name}">${name}</span>
        <span class="sgty ${roles[0].toLowerCase()}">${roles[0]}</span>
        <span class="sgmore" data-more title="More">${sgIcon.dots}</span>
      </div>
      <div class="sgdeal"><span class="sgadr" title="${f.address}">${f.address}</span></div>
      ${jline}
    </div>
    <div class="sgfoot">
      <span class="sgown" title="Owning agent — ${ag}"><span class="sgownav" style="background:${(aT[ag]||['#e5e5e5'])[0]};color:${(aT[ag]||['','#404040'])[1]}">${ini(ag)}${avImg(ag,agImg)}</span>${ag.split(' ')[0]}</span>
      <span class="sgdot"></span>
      <span class="sgage${d>=7?' stale':''}" title="Days since last touch">${la.replace(' ago','')}</span>
      <span class="sp"></span>
      ${alarms}
      <span class="sgvd" data-exp>View details${sgIcon.chev}</span>
    </div>
    <div class="sgexp">
      <div class="sgxr">${sgIcon.chat}<div><q>${f.lastMsg}</q><i>${name.split(' ')[0]} · ${f.msgWhen}</i></div></div>
      ${f.tasks?`<div class="sgxr">${sgIcon.check}<div>${f.taskList.slice(0,2).map(x=>`<div>${x}</div>`).join('')}${f.tasks>2?`<i>+${f.tasks-2} more</i>`:''}</div></div>`:''}
      <div class="sgxr">${sgIcon.cal}<div>Next — <b>${f.next}</b></div></div>
      <div class="sgacts">
        <button class="sgab" data-qa="Call">${sgIcon.phone}Call</button>
        <button class="sgab" data-qa="Text">${sgIcon.chat}Text</button>
        <button class="sgab" data-qa="Email">${sgIcon.mail}Email</button>
        <button class="sgab" data-qa="Log">${sgIcon.pen}Log</button>
        <button class="sgab mv" data-mv>${sgIcon.arrow}Move</button>
      </div>
      <span class="sgprof" data-prof>Open full profile${sgIcon.ext}</span>
    </div>
  </div>`;
}

function renderSignalBoard(){
  const dark=document.body.classList.contains('dark');
  const gs=sgGroups();
  board.innerHTML=gs.map(g=>{
    const stale=g.ids.filter(i=>ageDays(data[i][7])>=7).length;
    const cards=g.ids.map(i=>sgCard(i,dark)).join('')||`<div class="kempty">Nothing here</div>`;
    return `<section class="kcol"${g.drop!==null?` data-stage="${g.drop}"`:''}>
      <div class="kcolh"><i style="background:${g.color}"></i><span class="kcoln" title="${g.label}">${g.label}</span><span class="kcolc">${g.ids.length}</span>
        <span class="kcolwip${stale?' on':''}" title="${stale} with no contact in 7+ days">${stale} stale</span><span class="sp"></span>
        <span class="kcabtn" style="opacity:1" title="Add client"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>
      </div>
      <div class="kcolb"${g.drop!==null?` data-stage="${g.drop}"`:''}>${cards}</div>
    </section>`;
  }).join('');
  bindSgDrag();
  paintSgBar();
}

/* drag: only meaningful when columns are stages */
function bindSgDrag(){
  board.querySelectorAll('.sgcard').forEach(c=>{
    c.addEventListener('dragstart',e=>{dragI=+c.dataset.i;c.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    c.addEventListener('dragend',()=>{c.classList.remove('dragging');ghost.remove();board.querySelectorAll('.kcolb').forEach(b=>b.classList.remove('dragover'))});
  });
  board.querySelectorAll('.kcolb[data-stage]').forEach(b=>{
    b.addEventListener('dragover',e=>{
      e.preventDefault();b.classList.add('dragover');
      const after=[...b.querySelectorAll('.sgcard:not(.dragging)')].find(el=>e.clientY<el.getBoundingClientRect().top+el.offsetHeight/2);
      const empty=b.querySelector('.kempty');if(empty)empty.remove();
      after?b.insertBefore(ghost,after):b.appendChild(ghost);
    });
    b.addEventListener('dragleave',e=>{if(!b.contains(e.relatedTarget))b.classList.remove('dragover')});
    b.addEventListener('drop',e=>{
      e.preventDefault();if(dragI===null)return;
      const target=+b.dataset.stage;
      const before=ghost.nextElementSibling&&ghost.nextElementSibling.classList.contains('sgcard')?+ghost.nextElementSibling.dataset.i:null;
      const moved=data[dragI][4]!==target;
      data[dragI][4]=target;
      order=order.filter(i=>i!==dragI);
      const at=before===null?order.length:order.indexOf(before);
      order.splice(at<0?order.length:at,0,dragI);
      const nm=data[dragI][0];dragI=null;ghost.remove();
      renderBoard();renderTable();
      if(moved)sonner('Moved to '+stages[target][0],nm);
    });
  });
}

/* ---- stage menu (Move) ---- */
const sgMenu=document.createElement('div');sgMenu.className='sgmenu';document.body.appendChild(sgMenu);
let sgMenuFor=null;
const hideSgMenu=()=>{sgMenu.classList.remove('on');sgMenuFor=null;};
function openStageMenu(anchor,forIds){
  sgMenuFor=forIds;
  const cur=forIds.length===1?data[forIds[0]][4]:-1;
  sgMenu.innerHTML=`<span class="sgmk">Move ${forIds.length>1?forIds.length+' clients':'to stage'}</span>`+
    stages.map((s,si)=>`<span class="sgmi${si===cur?' cur':''}" data-st="${si}"><i style="background:${s[1]}"></i>${s[0]}${si===cur?' · current':''}</span>`).join('');
  sgMenu.classList.add('on');
  const r=anchor.getBoundingClientRect(),h=sgMenu.offsetHeight,w=sgMenu.offsetWidth;
  let top=r.bottom+6;if(top+h>innerHeight-8)top=Math.max(8,r.top-h-6);
  sgMenu.style.top=top+'px';
  sgMenu.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
}
sgMenu.addEventListener('click',e=>{
  const mi=e.target.closest('.sgmi[data-st]');if(!mi||mi.classList.contains('cur'))return;
  const si=+mi.dataset.st,ids=sgMenuFor||[];
  ids.forEach(i=>{data[i][4]=si});
  const label=ids.length>1?ids.length+' clients':data[ids[0]][0];
  hideSgMenu();sgSel.clear();renderBoard();renderTable();
  sonner('Moved to '+stages[si][0],label);
});
document.addEventListener('click',e=>{if(!e.target.closest('.sgmenu')&&!e.target.closest('[data-mv]')&&!e.target.closest('[data-bulkmv]'))hideSgMenu()},true);
addEventListener('resize',hideSgMenu);

/* ---- bulk bar (secondary) ---- */
const sgBar=document.createElement('div');sgBar.className='sgbar';
sgBar.innerHTML=`<b></b><button class="sgbb" data-bulkmv>${sgIcon.arrow}Move to stage</button><button class="sgbb" data-bulkmsg>${sgIcon.chat}Message all</button><button class="sgbx" data-bulkx>✕</button>`;
function paintSgBar(){
  const host=document.getElementById('cl-page')||document.body;
  if(!sgBar.parentElement)host.appendChild(sgBar);
  sgBar.classList.toggle('on',sgSel.size>0&&cardLayout==='signal');
  board.classList.toggle('picking',sgSel.size>0);
  sgBar.querySelector('b').textContent=sgSel.size+' selected';
}
sgBar.addEventListener('click',e=>{
  if(e.target.closest('[data-bulkmv]'))return openStageMenu(e.target.closest('[data-bulkmv]'),[...sgSel]);
  if(e.target.closest('[data-bulkmsg]')){sonner('Drafting message',sgSel.size+' clients');sgSel.clear();renderBoard();return;}
  if(e.target.closest('[data-bulkx]')){sgSel.clear();renderBoard();}
});

/* ---- one click handler for the whole signal board ---- */
board.addEventListener('click',e=>{
  if(cardLayout!=='signal')return;
  const card=e.target.closest('.sgcard');if(!card)return;
  const i=+card.dataset.i,nm=data[i][0];
  if(e.target.closest('[data-ck]')){sgSel.has(i)?sgSel.delete(i):sgSel.add(i);card.classList.toggle('sel',sgSel.has(i));paintSgBar();return;}
  const xt=e.target.closest('[data-xt]');
  if(xt){const sc=xt.closest('.kcexp');sc.querySelectorAll('[data-xt]').forEach(t=>t.classList.remove('on'));sc.querySelectorAll('.kcxp').forEach(p=>p.classList.remove('on'));xt.classList.add('on');const p=sc.querySelector('[data-xp="'+xt.dataset.xt+'"]');if(p)p.classList.add('on');return;}
  const secb=e.target.closest('[data-sec]');
  if(secb){
    const key=secb.dataset.sec,wrap=secb.closest('.kchov').querySelector('.kcsecs'),was=secb.classList.contains('on');
    const scope=secb.closest('.kchov');
    scope.querySelectorAll('[data-sec]').forEach(c=>c.classList.remove('on'));
    scope.querySelectorAll('.kcsec').forEach(p=>p.classList.remove('on'));
    if(was){wrap.classList.remove('on');}
    else{secb.classList.add('on');const p=wrap.querySelector('[data-sp="'+key+'"]');if(p)p.classList.add('on');wrap.classList.add('on');}
    return;
  }
  if(e.target.closest('[data-exp]')){card.classList.toggle('open');return;}
  if(e.target.closest('[data-mv]')){openStageMenu(e.target.closest('[data-mv]'),[i]);return;}
  if(e.target.closest('[data-more]')){openStageMenu(e.target.closest('[data-more]'),[i]);return;}
  const act=e.target.closest('[data-act]');
  if(act){sonner(act.dataset.act,nm);return;}
  const qa=e.target.closest('[data-qa]');
  if(qa){sonner(qa.dataset.qa,nm);return;}
  if(e.target.closest('[data-prof]')){sonner('Opening profile',nm);return;}
});

/* ---- pivot bar + sweep launcher, injected next to the view toggle ---- */
(function sgChrome(){
  const vt=document.getElementById('cl-vtoggle');if(!vt)return;
  const pv=document.createElement('div');pv.className='pvt';pv.id='cl-pvt';
  pv.innerHTML=[['stage','Stage'],['agent','Agent'],['temp','Temperature'],['list','List']]
    .map(([k,l])=>`<span class="pvtb${k==='stage'?' on':''}" data-pv="${k}">${l}</span>`).join('');
  pv.addEventListener('click',e=>{
    const b=e.target.closest('.pvtb');if(!b)return;
    pivot=b.dataset.pv;sgSel.clear();
    pv.querySelectorAll('.pvtb').forEach(x=>x.classList.toggle('on',x===b));
    renderBoard();
  });
  const sw=document.createElement('button');sw.className='swpbtn';sw.id='cl-swpbtn';
  sw.innerHTML=`${sgIcon.play}Sweep`;sw.title='Work the board one client at a time';
  sw.addEventListener('click',openSweep);
  vt.parentElement.insertBefore(pv,vt);
  vt.parentElement.insertBefore(sw,vt);
})();

/* ================= SWEEP MODE =================
   The board, one card at a time, ranked by urgency. Keyboard-first:
   J/K or ←/→ to move, 1-4 to act, Enter to advance, Esc to leave. */
const swp=document.createElement('div');swp.className='swp';document.body.appendChild(swp);
function sweepRank(){
  const w={red:0,amber:1,none:2};
  return [...order].sort((a,b)=>{
    const wa=whyNow(a),wb=whyNow(b);
    return w[wa.tone]-w[wb.tone]||ageDays(data[b][7])-ageDays(data[a][7]);
  });
}
function openSweep(){sweepQueue=sweepRank();sweepAt=0;sweepOn=true;swp.classList.add('on');paintSweep();}
function closeSweep(){sweepOn=false;swp.classList.remove('on');swp.innerHTML='';renderBoard();}
function paintSweep(){
  const dark=document.body.classList.contains('dark');
  if(sweepAt>=sweepQueue.length){
    swp.innerHTML=`<div class="swpc"><div class="swpdone">${sgIcon.done}<h4>Board swept</h4><p>${sweepQueue.length} clients reviewed. Nothing is waiting on you.</p><button class="swpnav pri" data-close>Back to board</button></div></div>`;
    return;
  }
  const i=sweepQueue[sweepAt];
  const [name,ph,em,ty,st,ag,co,la]=data[i];
  const f=info(i),w=whyNow(i),cT=dark?collabToneDark:collabTone,cFg=dark?'#f5f5f5':'#404040';
  const pct=Math.round(sweepAt/sweepQueue.length*100);
  swp.innerHTML=`<div class="swpc">
    <div class="swphd"><span class="swpn">${sweepAt+1} of ${sweepQueue.length}</span><span class="sp"></span><span class="swpn">${stages[st][0]}</span><button class="swpx" data-close>✕</button></div>
    <div class="swpbar"><i style="width:${pct}%"></i></div>
    <div class="swpb">
      <div class="swpid">
        <span class="swpav" style="background:${cT[i%cT.length]};color:${cFg}">${ini(name)}${avImg(name,clientImg)}</span>
        <div style="min-width:0"><div class="swpnm">${name}</div><div class="swpsub">${cTypes(i,ty)[0]} · ${f.address}</div></div>
      </div>
      <div class="swpwhy">${sgIcon.spark}<p>${w.why}</p></div>
      <div class="swprow">${sgIcon.cal}<div>Next — <b>${f.next}</b></div></div>
      <div class="swprow">${sgIcon.chat}<div><b>${name.split(' ')[0]}:</b> ${f.lastMsg} <span style="color:var(--neutral-400)">· ${f.msgWhen}</span></div></div>
      <div class="swpacts">
        <button class="swpnav pri" data-sact="${w.act}">${sgIcon[w.ic]}${w.act}</button>
        <button class="swpnav" data-sact="Call">${sgIcon.phone}Call</button>
        <button class="swpnav" data-sact="Text">${sgIcon.chat}Text</button>
        <button class="swpnav" data-smove>${sgIcon.arrow}Move stage</button>
      </div>
    </div>
    <div class="swpft">
      <span class="swpk"><span class="swpkbd">J</span><span class="swpkbd">K</span>move</span>
      <span class="swpk"><span class="swpkbd">esc</span>close</span>
      <span class="sp"></span>
      <button class="swpnav" data-prev>Back</button>
      <button class="swpnav pri" data-next>Next${sgIcon.arrow}</button>
    </div>
  </div>`;
}
swp.addEventListener('click',e=>{
  if(e.target===swp||e.target.closest('[data-close]'))return closeSweep();
  const i=sweepQueue[sweepAt];
  if(e.target.closest('[data-next]')){sweepAt++;paintSweep();return;}
  if(e.target.closest('[data-prev]')){sweepAt=Math.max(0,sweepAt-1);paintSweep();return;}
  if(e.target.closest('[data-smove]')){openStageMenu(e.target.closest('[data-smove]'),[i]);return;}
  const a=e.target.closest('[data-sact]');
  if(a){sonner(a.dataset.sact,data[i][0]);sweepAt++;paintSweep();}
});
document.addEventListener('keydown',e=>{
  if(!sweepOn)return;
  if(/^(INPUT|TEXTAREA)$/.test(e.target.tagName))return;
  if(e.key==='Escape')return closeSweep();
  if(e.key==='j'||e.key==='J'||e.key==='ArrowRight'||e.key==='Enter'){sweepAt++;paintSweep();e.preventDefault();}
  if(e.key==='k'||e.key==='K'||e.key==='ArrowLeft'){sweepAt=Math.max(0,sweepAt-1);paintSweep();e.preventDefault();}
});

window.__applyJarvisLine=v=>{jarvisLine=v==='off'?'off':'why';
  try{localStorage.setItem('crm-jarvisline',jarvisLine)}catch(e){}
  if(document.getElementById('cl-board'))renderBoard();};
try{const sj=localStorage.getItem('crm-jarvisline');if(sj)jarvisLine=sj==='off'?'off':'why'}catch(e){}

window.__hideKhov=hideKhov;
window.renderClientBoard=renderBoard;
document.getElementById('cl-all').addEventListener('change',e=>{root.querySelectorAll('.rc').forEach(c=>c.checked=e.target.checked);sync()});
function clearSel(){root.querySelectorAll('.rc,#cl-all').forEach(c=>c.checked=false);sync()}
/* shared collab popover */
const collabPop=document.createElement('div');
collabPop.className='collabpop';
document.body.appendChild(collabPop);
function showCollab(e,el){
  e.stopPropagation();
  const r=el.getBoundingClientRect();
  document.querySelectorAll('.avg.open').forEach(a=>a.classList.remove('open'));
  el.classList.add('open');
  collabPop._trig=el;
  collabPop.innerHTML=decodeURIComponent(el.dataset.list);
  collabPop.style.top=(r.bottom+6)+'px';
  collabPop.style.left=r.left+'px';
  collabPop.classList.add('open');
  /* flip if off-screen right */
  const pr=collabPop.getBoundingClientRect();
  if(pr.right>window.innerWidth-8)collabPop.style.left=(window.innerWidth-pr.width-8)+'px';
  if(pr.bottom>window.innerHeight-8)collabPop.style.top=(r.top-pr.height-6)+'px';
}
const closeCollab=()=>{collabPop.classList.remove('open');document.querySelectorAll('.avg.open').forEach(a=>a.classList.remove('open'));};
document.addEventListener('click',e=>{
  if(e.target.closest('.collabmanage')){closeCollab();window.sonner&&sonner('Manage access');return;}
  if(!e.target.closest('.avg')&&!e.target.closest('.collabpop'))closeCollab();
});
window.addEventListener('scroll',closeCollab,true);

/* ---------- phone hover: call / text ---------- */
const phPop=document.createElement('div');
phPop.className='phonepop';
phPop.innerHTML='<div class="phnum"></div>'
 +'<button class="phact" data-act="call"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Call</button>'
 +'<button class="phact" data-act="text"><svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>Text</button>'
 +'<button class="phact" data-act="copy"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy number</button>';
document.body.appendChild(phPop);
let phAnchor=null,phHide=null;
function phOpen(el){
  clearTimeout(phHide);
  if(phAnchor&&phAnchor!==el)phAnchor.classList.remove('on');
  phAnchor=el;el.classList.add('on');
  phPop.querySelector('.phnum').textContent=el.dataset.ph;
  const r=el.getBoundingClientRect();
  phPop.classList.add('open');
  phPop.style.top=(r.bottom+6)+'px';
  phPop.style.left=r.left+'px';
  const pr=phPop.getBoundingClientRect();
  if(pr.right>window.innerWidth-8)phPop.style.left=(window.innerWidth-pr.width-8)+'px';
  if(pr.bottom>window.innerHeight-8)phPop.style.top=(r.top-pr.height-6)+'px';
}
function phClose(){
  phHide=setTimeout(()=>{
    phPop.classList.remove('open');
    if(phAnchor)phAnchor.classList.remove('on');
    phAnchor=null;
  },160);
}
document.addEventListener('mouseover',e=>{
  const cell=e.target.closest('.phcell');
  if(cell){phOpen(cell);return}
  if(e.target.closest('.phonepop')){clearTimeout(phHide);return}
  if(phAnchor)phClose();
});
phPop.addEventListener('click',e=>{
  const b=e.target.closest('.phact');if(!b||!phAnchor)return;
  const num=phAnchor.dataset.ph,who=phAnchor.dataset.who;
  if(b.dataset.act==='call')sonner('Calling '+who,num);
  else if(b.dataset.act==='text')sonner('New message to '+who,num);
  else{navigator.clipboard&&navigator.clipboard.writeText(num);sonner('Number copied',num)}
  phPop.classList.remove('open');
  if(phAnchor)phAnchor.classList.remove('on');
  phAnchor=null;
});
window.addEventListener('scroll',()=>{phPop.classList.remove('open');if(phAnchor)phAnchor.classList.remove('on');phAnchor=null},true);

/* ---------- header filter popover ---------- */
root.querySelectorAll('th[data-col]').forEach(th=>{
  th.querySelector('.fic').insertAdjacentHTML('beforebegin','<svg class="sorticon" viewBox="0 0 24 24"><path d="m7 15 5 5 5-5M7 9l5-5 5 5"/></svg>');
});
const pop=document.getElementById('cl-fpop');let curCol=null;
root.querySelectorAll('th[data-col]').forEach(th=>{
  th.addEventListener('click',e=>{
    if(e.target.closest('.fic'))return;
    if(e.target.closest('.colresize'))return;
    if(window._justResized)return;
    curCol=th.dataset.col;
    openColFilter(th);
  });
});
function closePop(){pop.classList.remove('open')}
document.addEventListener('click',e=>{if(!e.target.closest('.fpop')&&!e.target.closest('th'))closePop()});

/* active filter chips — ✕ icon-only removal */
const chips=document.getElementById('cl-chips');
function toggleOps(e){document.getElementById('cl-foplist').classList.toggle('open');e.stopPropagation()}
/* ===== Clients per-column filters (B): DS text / multi / date bodies, live-apply, real row filtering ===== */
const CL_FTYPE={Name:'text',Phone:'text',Email:'text',Type:'multi',Status:'multi',Agent:'multi','Last activity':'date','Created at':'date','Updated at':'date'};
const CL_COLIDX={Name:0,Phone:1,Email:2,Type:3,Agent:5};
const CL_OPS=['contains','does not contain','is empty','is not empty'];
const CL_DATE_PRESETS=[{k:'today',lbl:'Today'},{k:'last7',lbl:'Last 7 days'},{k:'last30',lbl:'Last 30 days'},{k:'thismonth',lbl:'This month'}];
const CL_CHKIN='<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#fff" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
const CL_MARK='<span class="clmk"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';
function clEsc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function clChk(on){return `<span class="clbox">${on?CL_CHKIN:''}</span>`}
function clColValues(col){
  if(col==='Status')return stages.map(s=>s[0]);
  const idx=CL_COLIDX[col];if(idx==null)return [];
  const s=new Set();data.forEach(r=>{const v=r[idx];if(v!=null&&v!=='')s.add(v)});
  return [...s].sort();
}
function clCellVal(r,col){if(col==='Status')return stages[r[4]][0];const idx=CL_COLIDX[col];return idx==null?'':r[idx]}
function clRowDate(r,col){
  const t=new Date();t.setHours(0,0,0,0);
  if(col==='Last activity'){const m=String(r[7]).match(/(\d+)\s*([hdwm])/);const d=new Date(t);if(m){const n=+m[1],u=m[2];if(u==='d')d.setDate(t.getDate()-n);else if(u==='w')d.setDate(t.getDate()-n*7);else if(u==='m')d.setMonth(t.getMonth()-n)}return d}
  if(col==='Created at')return new Date(2026,6,10+(Math.abs(String(r[0]).length*3)%12));
  if(col==='Updated at')return new Date(2026,6,22);
  return t;
}
function clDateRange(k){const t=new Date();t.setHours(0,0,0,0);const f=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const d=new Date(t);
  if(k==='today')return{from:f(t),to:f(t)};
  if(k==='last7'){d.setDate(t.getDate()-7);return{from:f(d),to:f(t)}}
  if(k==='last30'){d.setDate(t.getDate()-30);return{from:f(d),to:f(t)}}
  if(k==='thismonth'){const s=new Date(t.getFullYear(),t.getMonth(),1),e=new Date(t.getFullYear(),t.getMonth()+1,0);return{from:f(s),to:f(e)}}
  return null;}
function clDatePass(dt,a){const p=s=>{const x=String(s).split('-').map(Number);return new Date(x[0],x[1]-1,x[2])};let from=a.from?p(a.from):null,to=a.to?p(a.to):null;if(from){from.setHours(0,0,0,0);if(dt<from)return false}if(to){to.setHours(23,59,59,999);if(dt>to)return false}return true}
function passesCl(r){
  for(const col in active){const a=active[col];if(!a)continue;const type=CL_FTYPE[col];
    if(type==='multi'){if(a.values&&a.values.length&&!a.values.includes(clCellVal(r,col)))return false}
    else if(type==='date'){if((a.from||a.to)&&!clDatePass(clRowDate(r,col),a))return false}
    else if(type==='text'){if(!(col in CL_COLIDX))continue;const v=String(clCellVal(r,col)||'').toLowerCase(),q=(a.val||'').toLowerCase();
      if(a.op==='contains'){if(q&&!v.includes(q))return false}
      else if(a.op==='does not contain'){if(q&&v.includes(q))return false}
      else if(a.op==='is empty'){if(v!=='')return false}
      else if(a.op==='is not empty'){if(v==='')return false}}
  }
  return true;
}
function clBoardSync(){const b=document.getElementById('cl-board');if(b&&b.classList.contains('on')&&typeof renderBoard==='function')renderBoard()}
function clFmt(k){const a=active[k],t=CL_FTYPE[k];
  if(t==='multi')return a.values.length===1?'is '+a.values[0]:'is any of '+a.values.length;
  if(t==='date'){const p=CL_DATE_PRESETS.find(d=>d.k===a.preset);return p?p.lbl:(a.from&&a.to?a.from+' → '+a.to:a.from?'from '+a.from:'until '+a.to)}
  if(a.op==='is empty')return 'is empty';if(a.op==='is not empty')return 'is not empty';
  return (a.op||'contains')+(a.val?' "'+a.val+'"':'');
}
function clFoot(){return '<div class="fpfoot"><button type="button" class="fpclr" onclick="clearColFilter()">Clear</button></div>'}
function clBody(col){
  const type=CL_FTYPE[col]||'text',cur=active[col]||{};
  const head=`<div class="fhead"><svg viewBox="0 0 24 24"><path d="M4 7h16M7 12h10M10 17h4"/></svg> <span id="cl-fcol">${clEsc(col)}</span></div>`;
  if(type==='multi'){
    const vals=clColValues(col),sel=new Set(cur.values||[]);
    const opts=vals.map(v=>`<div class="fmopt" role="menuitemcheckbox" aria-checked="${sel.has(v)}" data-val="${clEsc(v)}" data-active="${sel.has(v)}">${clChk(sel.has(v))}<span class="fmlab">${clEsc(v)}</span></div>`).join('')||'<div class="clmpty">No values</div>';
    return head+`<input type="text" class="clms" id="cl-multisearch" placeholder="Search ${clEsc(col)}"><div class="clmlist" id="cl-multilist">${opts}</div>`+clFoot();
  }
  if(type==='date'){
    const p=cur.preset||'';
    const presets=CL_DATE_PRESETS.map(d=>`<div class="fdpreset" role="menuitemradio" aria-checked="${p===d.k}" data-preset="${d.k}" data-active="${p===d.k}"><span>${d.lbl}</span>${p===d.k?CL_MARK:''}</div>`).join('');
    return head+`<div class="clpresets">${presets}</div><div class="rds-menu__sep"></div><div class="cllbl">Custom range</div><div class="fdrange"><input type="date" class="clms" id="cl-dfrom" value="${clEsc(cur.from||'')}"><span class="fdsep">to</span><input type="date" class="clms" id="cl-dto" value="${clEsc(cur.to||'')}"></div>`+clFoot();
  }
  const op=cur.op||'contains',noVal=op==='is empty'||op==='is not empty';
  return head+`<div class="dsselect" id="cl-fopsel"><button type="button" class="dstrigger" onclick="toggleOps(event)"><span id="cl-foplabel">${op}</span><svg class="lucide" style="width:14px;height:14px" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button><div class="dslist" id="cl-foplist">${CL_OPS.map(o=>`<div class="dsopt${o===op?' selected':''}" onclick="pickOp(this)"><span class="dsradio"></span>${o}</div>`).join('')}</div></div><input type="text" id="cl-fval" placeholder="Enter value..." value="${clEsc(cur.val||'')}"${noVal?' style="display:none"':''}>`+clFoot();
}
function pickOp(el){
  el.parentElement.querySelectorAll('.dsopt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected');
  const op=el.textContent.trim();
  document.getElementById('cl-foplabel').textContent=op;
  document.getElementById('cl-foplist').classList.remove('open');
  const fval=document.getElementById('cl-fval');if(fval)fval.style.display=(op==='is empty'||op==='is not empty')?'none':'';
  liveApply();
}
function clWire(){
  const ms=pop.querySelector('#cl-multisearch');
  if(ms)ms.addEventListener('input',()=>{const q=ms.value.trim().toLowerCase();pop.querySelectorAll('#cl-multilist .fmopt').forEach(o=>{o.style.display=(o.dataset.val||'').toLowerCase().includes(q)?'':'none'})});
  const ml=pop.querySelector('#cl-multilist');
  if(ml)ml.addEventListener('click',e=>{const it=e.target.closest('.fmopt');if(!it)return;const on=it.dataset.active==='true';it.dataset.active=on?'false':'true';it.setAttribute('aria-checked',String(!on));const b=it.querySelector('.clbox');if(b)b.innerHTML=on?'':CL_CHKIN;liveApply()});
  const pr=pop.querySelector('.clpresets');
  if(pr)pr.addEventListener('click',e=>{const it=e.target.closest('.fdpreset');if(!it)return;
    pop.querySelectorAll('.fdpreset').forEach(p=>{p.dataset.active='false';p.setAttribute('aria-checked','false');const s=p.querySelector('.clmk');if(s)s.remove()});
    it.dataset.active='true';it.setAttribute('aria-checked','true');it.insertAdjacentHTML('beforeend',CL_MARK);
    const rng=clDateRange(it.dataset.preset),f=pop.querySelector('#cl-dfrom'),t=pop.querySelector('#cl-dto');if(rng){if(f)f.value=rng.from;if(t)t.value=rng.to}
    liveApply()});
  const df=pop.querySelector('#cl-dfrom'),dt=pop.querySelector('#cl-dto');
  [df,dt].forEach(inp=>inp&&inp.addEventListener('input',()=>{pop.querySelectorAll('.fdpreset').forEach(p=>{p.dataset.active='false';p.setAttribute('aria-checked','false');const s=p.querySelector('.clmk');if(s)s.remove()});liveApply()}));
  const fv=pop.querySelector('#cl-fval');if(fv)fv.addEventListener('input',liveApply);
}
/* open the per-column filter: floating DS popover under the header, or inline in the Filters panel */
function openColFilter(anchor,inSheet){
  if(!curCol)return;
  pop.innerHTML=clBody(curCol);
  clWire();
  const type=CL_FTYPE[curCol]||'text';
  if(inSheet){
    anchor.insertAdjacentElement('afterend',pop);
    pop.style.position='';pop.style.left='';pop.style.top='';pop.style.width='';
    pop.classList.add('open');
  } else {
    if(pop.parentElement!==document.body)document.body.appendChild(pop);
    const r=anchor.getBoundingClientRect(),W=type==='date'?300:type==='multi'?260:280;
    const left=Math.max(8,Math.min(r.left,window.innerWidth-W-8));
    pop.style.position='fixed';pop.style.width=W+'px';pop.style.left=left+'px';pop.style.top=(r.bottom+6)+'px';
    pop.classList.add('open');
  }
  const first=pop.querySelector('#cl-fval:not([style*="none"]), #cl-multisearch');
  if(first)requestAnimationFrame(()=>first.focus());
}
function liveApply(){
  if(!curCol)return;
  const type=CL_FTYPE[curCol]||'text';let entry=null;
  if(type==='multi'){const vals=[...pop.querySelectorAll('#cl-multilist .fmopt[data-active="true"]')].map(o=>o.dataset.val);if(vals.length)entry={values:vals}}
  else if(type==='date'){const from=(pop.querySelector('#cl-dfrom')||{}).value||'',to=(pop.querySelector('#cl-dto')||{}).value||'',preset=[...pop.querySelectorAll('.fdpreset[data-active="true"]')].map(p=>p.dataset.preset)[0]||'';if(from||to)entry={from,to,preset}}
  else {const op=(pop.querySelector('#cl-foplabel')||{}).textContent||'contains',noVal=op==='is empty'||op==='is not empty',val=(pop.querySelector('#cl-fval')||{}).value||'';if(noVal||val.trim())entry={op,val:noVal?'':val}}
  if(entry)active[curCol]=entry;else delete active[curCol];
  renderChips();renderTable();clBoardSync();
}
function clearColFilter(){
  if(curCol)delete active[curCol];
  renderChips();renderTable();clBoardSync();
  closePop();
}
function removeFilter(col){delete active[col];renderChips();renderTable();clBoardSync()}
function renderChips(){
  const keys=Object.keys(active);
  chips.classList.toggle('on',keys.length>0);
  chips.innerHTML=keys.map(k=>`<span class="chip"><b>${clEsc(k)}</b> ${clEsc(clFmt(k))} <span class="cx" onclick="removeFilter('${k.replace(/'/g,"\\'")}')">✕</span></span>`).join('');
  const pill=document.getElementById('cl-fspill');
  if(pill){pill.hidden=!keys.length;pill.textContent=keys.length}
  const cbtn=document.getElementById('cl-fsclr');
  if(cbtn)cbtn.disabled=!keys.length;
  root.querySelectorAll('.fic').forEach(f=>{f.innerHTML='';const t=f.closest('th');if(t)t.classList.remove('filtered')});
  keys.forEach(k=>{const f=document.getElementById('cl-fic-'+k);if(!f)return;
    f.innerHTML='<span class="ficb"></span>';
    f.firstChild.title=k+' '+clFmt(k);
    const t=f.closest('th');if(t)t.classList.add('filtered');});
}

/* ---------- sticky name + minimized-column icon rail ---------- */
const colIcon={
 phone:'<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
 email:'<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
 type:'<svg viewBox="0 0 24 24"><path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
 status:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',
 agent:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg>',
 collabs:'<svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 21v-1a6 6 0 0 1 12 0v1M14 21v-1a6 6 0 0 1 8-5.6"/></svg>',
 coclients:'<svg viewBox="0 0 24 24"><path d="M3 21v-1a5 5 0 0 1 10 0v1"/><circle cx="8" cy="7" r="3"/><path d="M16 21v-1a5 5 0 0 1 5-5"/><circle cx="17" cy="9" r="2.5"/></svg>',
 activity:'<svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
 created:'<span class="ytd">YTD</span>',
 updated:'<svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>'
};
const twrapEl=document.getElementById('cl-twrap'),hrail=document.getElementById('cl-hrail');
if(window.__colRail===undefined)window.__colRail=false;
function updateRail(){
  const sl=twrapEl.scrollLeft;
  twrapEl.classList.toggle('hscrolled',sl>2);
  const nameTh=root.querySelector('th:nth-child(2)');
  const stickyRight=36+nameTh.getBoundingClientRect().width;
  const hidden=[];
  root.querySelectorAll('th[data-icon]').forEach(th=>{
    if(th.offsetLeft+th.offsetWidth-sl < stickyRight+8){
      hidden.push({name:th.dataset.col||th.textContent.trim(),icon:th.dataset.icon,x:th.offsetLeft});
    }
  });
  const MAX=5;
  let html=hidden.slice(0,MAX).map(h=>`<button title="${h.name}" onclick="goCol(${h.x})">${colIcon[h.icon]||''}</button>`).join('');
  if(hidden.length>MAX){
    const rest=hidden.slice(MAX).map(h=>`<div class='hitem' onclick='goCol(${h.x})'>${colIcon[h.icon]||''} ${h.name}</div>`).join('');
    html+=`<button class="hmore" onclick="this.querySelector('.hpop').classList.toggle('open');event.stopPropagation()">+${hidden.length-MAX}<div class="hpop">${rest}</div></button>`;
  }
  hrail.innerHTML=html;
  hrail.classList.toggle('on',html!==''&&window.__colRail!==false);
  const fade=document.getElementById('cl-hfade');
  fade.classList.toggle('on',sl>2);
  if(sl>2){
    fade.style.left=stickyRight+'px';
    fade.style.top=twrapEl.offsetTop+'px';
    fade.style.height=twrapEl.clientHeight+'px';
  }
  if(html!==''){
    hrail.style.left=(stickyRight+10)+'px';
    hrail.style.top=(twrapEl.offsetTop+42)+'px';
  }
}
window.__updateRail=updateRail;
function goCol(x){twrapEl.scrollTo({left:Math.max(0,x-260),behavior:'smooth'})}
twrapEl.addEventListener('scroll',updateRail);
window.addEventListener('resize',updateRail);
updateRail();

/* ---------- column resize (drag both wider and narrower, floor at 60px) ---------- */
(function(){
  let resizing=null;
  /* attach handle to every resizable th (skip checkbox + trailing 32px action col) */
  function setupHandles(){
    root.querySelectorAll('#cl-twrap th[data-col],#cl-twrap th[data-icon]').forEach(th=>{
      if(th.querySelector('.colresize'))return;
      /* measure default (natural) width once, store on the element */
      if(!th.dataset.defaultWidth){
        th.dataset.defaultWidth=Math.round(th.getBoundingClientRect().width);
      }
      const h=document.createElement('span');
      h.className='colresize';
      /* stop mousedown from bubbling to th (which would trigger filter popover on click) */
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
  /* re-attach after dark-mode re-render (renderTable() doesn't touch thead but be safe) */
  const _origUpdate=window.updateRail;
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
    /* swallow the click event that follows the drag so filter popover doesn't open */
    window._justResized=true;
    setTimeout(()=>{window._justResized=false},80);
    /* column widths changed → sticky icon-rail positions may need refresh */
    if(typeof updateRail==='function')updateRail();
  });
})();

/* ---------- column drag-reorder (clients) — mirrors transactions ---------- */
(function(){
  const head=root.querySelector('#cl-twrap thead tr');
  if(!head)return;
  const movable=th=>!!th.dataset.col;
  const ths=()=>[...head.children];
  const key=(t,i)=>t.dataset.col||t.dataset.icon||(i===0?'_sel':'_menu');
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
      if(typeof closePop==='function')closePop();
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
  window.applyColOrderCl=function(){
    const keys=ths().map((t,i)=>key(t,i));
    root.querySelectorAll('#cl-tb tr').forEach(tr=>{
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
      root.querySelectorAll('#cl-tb tr').forEach(tr=>{
        const cells=[...tr.children],cell=cells[from];
        if(!cell)return;
        const ref=cells[to];
        if(from<to)ref.after(cell);else ref.before(cell);
      });
    }
    window._justResized=true;setTimeout(()=>{window._justResized=false},80);
    if(typeof updateRail==='function')updateRail();
  },true);
})();

/* ---------- smart lists popover ---------- */
const smartLists=[
 {n:"Hot clients",c:24,d:"High engagement this week",on:false},
 {n:"Super tenants",c:31,d:"Tenant leads, active",on:false},
 {n:"Buyer list",c:86,d:"All buyer-type clients",on:false},
 {n:"Status – new client",c:42,d:"Pipeline stage: new",on:false},
 {n:"Daniel's buyer clients",c:19,d:"All the buyer clients",on:false},
 {n:"Met with client",c:27,d:"Status: met with client",on:false},
 {n:"Stale 2+ days",c:63,d:"Last activity over 2 days",on:false},
 {n:"In contract",c:11,d:"Deals in contract stage",on:false},
 {n:"Cash buyers",c:41,d:"Financing: cash",on:false},
 {n:"Closing this month",c:9,d:"Close date within 30 days",on:false},
 {n:"Expired listings",c:33,d:"Listing expired, no relist",on:false},
 {n:"Investors \u2013 multi-unit",c:17,d:"2+ units owned",on:false},
 {n:"Referral \u2013 Q3 nurture push",c:58,d:"Referral source, no touch 14d",on:false},
 {n:"Relocation",c:22,d:"Moving from out of state",on:false},
 {n:"First-time buyers",c:74,d:"No prior purchase",on:false},
 {n:"Sellers \u2013 pre-list",c:29,d:"Seller side, not listed yet",on:false},
 {n:"Open house sign-ins",c:137,d:"Source: open house",on:false}
];
const plainLists=[
 {n:"Spring open house",c:24,d:"Manual list · 24 clients",on:false},
 {n:"Holiday card 2026",c:112,d:"Manual list · 112 clients",on:false},
 {n:"Past clients – referrals",c:38,d:"Manual list · 38 clients",on:false},
 {n:"Luxury \u2013 $2M+",c:17,d:"Manual list · 17 clients",on:false},
 {n:"Newsletter opt-in",c:209,d:"Manual list · 209 clients",on:false},
 {n:"Sphere \u2013 friends & family",c:46,d:"Manual list · 46 clients",on:false}
];
/* Clients tab row.
   Home is permanent and unfiltered. Viewing any list is unlimited: tapping one
   in the "+ Smart list" menu filters the table and opens it as a single dashed
   PREVIEW tab that the next pick replaces. Keeping a list as a permanent tab is
   capped at 4 — only then do we ask which tab to replace. One entry point, no
   overflow button. */
const MAXKEEP=3;
smartLists.forEach(s=>s.kind='smart');
plainLists.forEach(s=>s.kind='lists');
const kept=[smartLists[0],smartLists[2],plainLists[0]];
kept.forEach(s=>s.keep=true);
let curSeg='smart',slq='',activeList=null,preview=null,swapFor=null;
const slwrap=document.getElementById('cl-sllist'),slpop=document.getElementById('cl-slpop'),
      smarttab=document.getElementById('cl-smarttab'),tabseg=document.getElementById('cl-tabseg'),
      slqInput=document.getElementById('cl-slq'),slkept=document.getElementById('cl-slkept'),
      step1=document.getElementById('cl-slstep1'),step2=document.getElementById('cl-slstep2'),
      swapWrap=document.getElementById('cl-slswap'),swapName=document.getElementById('cl-slswapname'),
      slback=document.getElementById('cl-slback');
const ALL=()=>[...smartLists,...plainLists];
const PINIC='<svg viewBox="0 0 24 24"><path d="M12 17v5"/><path d="M9 10.76V4h6v6.76a2 2 0 0 0 .55 1.38L18 15H6l2.45-2.86A2 2 0 0 0 9 10.76Z"/></svg>';
const XIC='\u2715';
function count(s){return s.c!=null?s.c:null}

function renderTabs(){
  tabseg.querySelectorAll('.sltab').forEach(t=>t.remove());
  const vis=preview&&!preview.keep
    ?kept.slice(0,MAXKEEP-1).concat(preview)
    :kept.slice(0,MAXKEEP);
  vis.forEach(s=>{
    const c=count(s),temp=s===preview&&!s.keep;
    smarttab.insertAdjacentHTML('beforebegin',
      '<div class="tab sltab'+(s===activeList?' active':'')+(temp?' temp':'')+'" data-n="'+s.n+'" title="'+s.n+'">'+
      '<span class="tname">'+s.n+'</span>'+(c?'<span class="tcount">'+c+'</span>':'')+
      (temp?'<span class="tkeep" title="Keep as tab">'+PINIC+'</span>':'')+
      '<span class="tx" title="Close">'+XIC+'</span></div>');
  });
  const home=tabseg.querySelector('[data-home]');
  home.classList.toggle('active',!activeList);
  /* names shrink before the row ever wraps */
  const bar=tabseg.closest('.tabs'),names=tabseg.querySelectorAll('.tname');
  [150,120,96,72].some(w=>{names.forEach(n=>n.style.maxWidth=w+'px');return bar.scrollWidth<=bar.clientWidth+1});
  tabseg.querySelectorAll('.sltab').forEach(t=>{
    const s=ALL().find(x=>x.n===t.dataset.n);
    t.addEventListener('click',e=>{
      if(e.target.closest('.tkeep')){keepList(s);return}
      if(e.target.closest('.tx')){closeTab(s);return}
      activeList=s;renderTabs();renderSL();
    });
  });
  home.onclick=()=>{activeList=null;renderTabs();renderSL()};
}

function closeTab(s){
  const i=kept.indexOf(s);
  if(i>-1){kept.splice(i,1);s.keep=false}
  if(preview===s)preview=null;
  if(activeList===s)activeList=null;
  renderTabs();renderSL();
}
function keepList(s){
  if(s.keep)return;
  if(kept.length>=MAXKEEP){openSwap(s);return}
  s.keep=true;kept.push(s);if(preview===s)preview=null;
  renderTabs();renderSL();
}
function openSwap(s){
  swapFor=s;swapName.textContent='Keeping \u201c'+s.n+'\u201d \u2014 3 tabs is the max.';
  swapWrap.innerHTML=kept.map(k=>{const c=count(k);return '<div class="slitem" data-n="'+k.n+'">'+
    '<span class="slmeta"><span class="slname">'+k.n+'</span><span class="sldesc">'+k.d+'</span></span>'+
    (c?'<span class="sln">'+c+'</span>':'')+'</div>'}).join('');
  swapWrap.querySelectorAll('.slitem').forEach(el=>el.addEventListener('click',e=>{
    e.stopPropagation();
    const old=kept.find(k=>k.n===el.dataset.n),i=kept.indexOf(old);
    old.keep=false;swapFor.keep=true;kept.splice(i,1,swapFor);
    if(preview===swapFor)preview=null;
    if(activeList===old)activeList=swapFor;
    showStep(1);slpop.classList.remove('open');smarttab.classList.remove('open');
    renderTabs();renderSL();
  }));
  showStep(2);
}
function showStep(n){step1.hidden=n!==1;step2.hidden=n!==2}
slback.addEventListener('click',e=>{e.stopPropagation();showStep(1);slqInput.focus()});

root.querySelectorAll('.slsegbtn').forEach(b=>b.addEventListener('click',e=>{
  root.querySelectorAll('.slsegbtn').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');curSeg=b.dataset.seg;renderSL();e.stopPropagation();
}));
slqInput.addEventListener('input',()=>{slq=slqInput.value.trim().toLowerCase();renderSL()});

function renderSL(){
  const data=(curSeg==='smart'?smartLists:plainLists).filter(s=>!slq||s.n.toLowerCase().includes(slq));
  const row=s=>{const c=count(s);return '<div class="slitem'+(s===activeList?' on':'')+'" data-n="'+s.n+'">'+
    '<span class="slmeta"><span class="slname">'+s.n+'</span><span class="sldesc">'+s.d+'</span></span>'+
    (c?'<span class="sln">'+c+'</span>':'')+
    '<span class="slpin'+(s.keep?' on':'')+'" title="'+(s.keep?'Remove tab':'Keep as tab')+'">'+PINIC+'</span></div>'};
  const kp=data.filter(s=>s.keep),rest=data.filter(s=>!s.keep);
  slwrap.innerHTML=data.length
    ?(kp.length?'<div class="slhead">KEPT AS TABS</div>'+kp.map(row).join(''):'')+
     (rest.length?'<div class="slhead">'+(curSeg==='smart'?'ALL SMART LISTS':'ALL LISTS')+'</div>'+rest.map(row).join(''):'')
    :'<div class="slempty">No lists match \u201c'+slqInput.value+'\u201d</div>';
  slkept.textContent=kept.length+' of '+MAXKEEP+' kept as tabs';
  slwrap.querySelectorAll('.slitem').forEach(el=>{
    const s=ALL().find(x=>x.n===el.dataset.n);
    el.addEventListener('click',e=>{
      e.stopPropagation();
      if(e.target.closest('.slpin')){s.keep?closeTab(s):keepList(s);return}
      activeList=s;if(!s.keep)preview=s;
      slpop.classList.remove('open');smarttab.classList.remove('open');smarttab.setAttribute('aria-expanded','false');
      renderTabs();renderSL();
    });
  });
}

smarttab.addEventListener('click',e=>{
  e.stopPropagation();
  const c=root.getBoundingClientRect(),r=smarttab.getBoundingClientRect();
  slpop.style.left=Math.min(Math.max(8,r.left-c.left),c.width-330)+'px';
  slpop.style.top=(r.bottom-c.top+8)+'px';
  const open=!slpop.classList.contains('open');
  slpop.classList.toggle('open',open);
  smarttab.classList.toggle('open',open);
  smarttab.setAttribute('aria-expanded',String(open));
  if(open){showStep(1);slq='';slqInput.value='';renderSL();slqInput.focus()}
});
document.addEventListener('click',e=>{
  if(!e.target.closest('.slpop')&&!e.target.closest('#cl-smarttab')){
    slpop.classList.remove('open');smarttab.classList.remove('open');smarttab.setAttribute('aria-expanded','false');
  }
});
renderTabs();renderSL();
let _tabRz;addEventListener('resize',()=>{clearTimeout(_tabRz);_tabRz=setTimeout(renderTabs,120)});

/* ---------- new client menu ---------- */
document.getElementById('cl-pheadmorebtn').addEventListener('click',e=>{
  document.getElementById('cl-pheadmoremenu').classList.toggle('open');e.stopPropagation();
});
document.addEventListener('click',e=>{if(!e.target.closest('#cl-pheadmore'))document.getElementById('cl-pheadmoremenu').classList.remove('open')});
document.getElementById('cl-newclientbtn').addEventListener('click',e=>{
  document.getElementById('cl-ncmenu').classList.toggle('open');e.stopPropagation();
});
document.addEventListener('click',e=>{if(!e.target.closest('.ncwrap'))document.getElementById('cl-ncmenu').classList.remove('open')});

/* ---------- client scope switcher (page header) ----------
   Roles: teamLead + groupLead get the switcher. A plain team member / group
   member only ever sees their own book, so the control is hidden for them. */
(function(){
  const wrap=document.getElementById('cl-scwrap'),btn=document.getElementById('cl-scopebtn'),
        menu=document.getElementById('cl-scopemenu'),list=document.getElementById('cl-scopelist'),
        lbl=document.getElementById('cl-scopelabel'),cnt=document.getElementById('cl-scopecount'),
        ico=document.getElementById('cl-scopeicon'),q=document.getElementById('cl-scopeq'),
        reset=document.getElementById('cl-scopereset');
  const ICON={
    all:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    mine:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 16 0v1"/></svg>',
    group:'<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
  };
  const TICK='<svg class="sctick" viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>';
  const count=f=>data.filter(f).length;
  const nAll=()=>data.length, nMine=()=>count(r=>r[5]===ME),
        nMember=n=>count(r=>r[5]===n),
        nGroup=g=>count(r=>g.m.includes(r[5]));
  const av=n=>{const t=(document.body.classList.contains('dark')?agtoneDark:agtone)[n]||['#e5e5e5','#404040'];
    return `<span class="scav" style="background:${t[0]};color:${t[1]}">${ini(n)}${avImg(n,agImg)}</span>`;};
  const icoWrap=k=>`<span class="scic">${ICON[k]}</span>`;

  /* Options for the current role. Group lead sees their group's book + the
     agents inside the group; team lead also sees saved groups. */
  function options(){
    const o=[];
    if(ROLE==='groupLead'){
      o.push({s:'Scope',kind:'all',key:null,label:'All group clients',icon:'group',n:nAll()});
      o.push({s:'Scope',kind:'mine',key:null,label:'My clients',icon:'mine',n:nMine()});
      TEAM.slice(0,3).forEach(m=>o.push({s:'Group members',kind:'member',key:m,label:m,avatar:1,n:nMember(m)}));
    }else{
      o.push({s:'Scope',kind:'all',key:null,label:'All clients',icon:'all',n:nAll()});
      o.push({s:'Scope',kind:'mine',key:null,label:'My clients',icon:'mine',n:nMine()});
      TEAM.forEach(m=>o.push({s:'Team members',kind:'member',key:m,label:m,avatar:1,n:nMember(m)}));
      GROUPS.forEach(g=>o.push({s:'Groups',kind:'group',key:g.n,label:g.n,icon:'group',n:nGroup(g),sub:g.m.length+' agents'}));
    }
    return o;
  }
  let opts=[],cursor=0,wasLead=true;

  function paintTrigger(){
    const cur=opts.find(o=>o.kind===SCOPE.kind&&o.key===SCOPE.key)||opts[0];
    if(!cur)return;
    lbl.textContent=cur.label;
    cnt.textContent=cur.n;
    ico.innerHTML=cur.avatar?av(cur.label):`<span class="scic" style="width:18px;height:18px;background:transparent">${ICON[cur.icon]}</span>`;
    btn.setAttribute('aria-label','Client scope: '+cur.label);
  }
  function draw(){
    const term=q.value.trim().toLowerCase();
    const vis=opts.filter(o=>!term||o.label.toLowerCase().includes(term));
    let sec='',h='';
    vis.forEach((o,i)=>{
      if(o.s!==sec){sec=o.s;h+=`<div class="scgrp">${sec}</div>`;}
      const on=o.kind===SCOPE.kind&&o.key===SCOPE.key;
      h+=`<div class="scrow" role="radio" aria-checked="${on}" tabindex="-1" data-i="${opts.indexOf(o)}">
        ${o.avatar?av(o.label):icoWrap(o.icon)}
        <span class="scnm">${o.label}</span>
        <span class="scn">${o.n}</span>${TICK}</div>`;
    });
    list.innerHTML=h||'<div class="scempty">No people or groups match</div>';
    cursor=0;paintCursor();
  }
  const rows=()=>[...list.querySelectorAll('.scrow')];
  function paintCursor(){rows().forEach((r,i)=>r.classList.toggle('cursor',i===cursor));
    const r=rows()[cursor];if(r)r.scrollIntoView?null:null;}
  function pick(i){
    const o=opts[i];if(!o)return;
    SCOPE={kind:o.kind,key:o.key};
    paintTrigger();open(false);btn.focus();
    renderTable();if(document.getElementById('cl-board'))renderBoard();
  }
  function open(v){
    menu.classList.toggle('open',v);btn.setAttribute('aria-expanded',v);
    if(v){q.value='';draw();
      const sel=rows().findIndex(r=>r.getAttribute('aria-checked')==='true');
      cursor=sel<0?0:sel;paintCursor();q.focus();}
  }
  btn.addEventListener('click',e=>{e.stopPropagation();open(!menu.classList.contains('open'))});
  btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();open(true)}});
  q.addEventListener('input',draw);
  menu.addEventListener('keydown',e=>{
    const n=rows().length;
    if(e.key==='Escape'){e.preventDefault();open(false);btn.focus()}
    else if(e.key==='ArrowDown'&&n){e.preventDefault();cursor=(cursor+1)%n;paintCursor()}
    else if(e.key==='ArrowUp'&&n){e.preventDefault();cursor=(cursor+n-1)%n;paintCursor()}
    else if(e.key==='Home'&&n){e.preventDefault();cursor=0;paintCursor()}
    else if(e.key==='End'&&n){e.preventDefault();cursor=n-1;paintCursor()}
    else if(e.key==='Enter'&&n){e.preventDefault();pick(+rows()[cursor].dataset.i)}
  });
  list.addEventListener('click',e=>{const r=e.target.closest('.scrow');if(r)pick(+r.dataset.i)});
  list.addEventListener('mousemove',e=>{const r=e.target.closest('.scrow');
    if(r){cursor=rows().indexOf(r);paintCursor()}});
  reset.addEventListener('click',()=>{const i=opts.findIndex(o=>o.kind==='all');pick(i<0?0:i)});
  document.addEventListener('click',e=>{if(!e.target.closest('#cl-scwrap'))open(false)});

  window.__applyRole=role=>{
    ROLE=['teamLead','teamMember','groupLead','groupMember'].includes(role)?role:'teamLead';
    const lead=ROLE==='teamLead'||ROLE==='groupLead';
    wrap.hidden=!lead;
    /* Leads read their count off the scope pill in the switcher, so the static
       header total is redundant for them. Solo books keep it, with a real count. */
    const pc=document.getElementById('cl-pcount'),pv=document.getElementById('cl-pvsep');
    if(pc)pc.hidden=lead;
    if(pv)pv.hidden=!lead;
    if(pc&&!lead)pc.textContent=nMine().toLocaleString();
    if(!lead){SCOPE={kind:'mine',key:null};open(false);}
    else if(wasLead===false)SCOPE={kind:'all',key:null};
    wasLead=lead;
    opts=options();
    if(!opts.some(o=>o.kind===SCOPE.kind&&o.key===SCOPE.key))SCOPE={kind:lead?'all':'mine',key:null};
    if(lead)paintTrigger();
    renderTable();if(document.getElementById('cl-board'))renderBoard();
  };
  opts=options();paintTrigger();
  (function initCount(){
    const lead=ROLE==='teamLead'||ROLE==='groupLead',
          pc=document.getElementById('cl-pcount'),pv=document.getElementById('cl-pvsep');
    if(pc){pc.hidden=lead;if(!lead)pc.textContent=nMine().toLocaleString();}
    if(pv)pv.hidden=!lead;
  })();
})();

/* ---------- filters: the original clients field-picker, hosted in the new side panel ----------
   Nothing about the filter model changes — same "Add a filter" search, same field groups,
   same operator + value editor. The popover shell is replaced by the shared side sheet so
   Clients matches Transactions structurally. */
const fbtn=document.getElementById('cl-filterbtn'),spop=document.getElementById('cl-scopepop');
const clSheet=(function(){
  const scrim=document.createElement('div');scrim.className='fscrim';
  const sheet=document.createElement('aside');
  sheet.className='fsheet';sheet.id='cl-fsheet';sheet.dataset.mode='stacked';
  sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-hidden','true');
  sheet.setAttribute('aria-label','Filters');
  sheet.innerHTML='<div class="fsh"><span class="ptitle">Filters</span><span class="fspill" id="cl-fspill" hidden>0</span>'
    +'<span class="sp"></span><button type="button" class="fsx" aria-label="Close filters"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>'
    +'<div class="fsbody" id="cl-fsbody"></div>'
    +'<div class="fsfoot"><button type="button" class="rst" id="cl-fsclr">Clear all</button><span class="sp"></span>'
    +'<button type="button" class="fsapply" id="cl-fsdone">Done</button></div>';
  document.body.append(scrim,sheet);
  const body=sheet.querySelector('#cl-fsbody');
  /* move the existing filter DOM in, so every handler bound to it keeps working */
  const pop=document.getElementById('cl-fpop');
  const search=spop.querySelector('.scopesearch');
  const groups=[...spop.querySelectorAll('.fgroup')];
  body.append(search,...groups);
  document.body.appendChild(pop);
  spop.remove();
  const isOpen=()=>sheet.classList.contains('on');
  function open(){
    scrim.classList.add('on');sheet.classList.add('on');sheet.setAttribute('aria-hidden','false');
    const q=document.getElementById('cl-fieldsearch');if(q)q.focus();
  }
  function close(){scrim.classList.remove('on');sheet.classList.remove('on');sheet.setAttribute('aria-hidden','true');pop.classList.remove('open')}
  scrim.addEventListener('click',close);
  sheet.querySelector('.fsx').addEventListener('click',close);
  document.getElementById('cl-fsdone').addEventListener('click',close);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&isOpen())pop.classList.contains('open')?pop.classList.remove('open'):close()});
  document.getElementById('cl-fsclr').addEventListener('click',()=>{
    Object.keys(active).forEach(k=>delete active[k]);
    renderChips();renderTable();clBoardSync();pop.classList.remove('open');
    if(window.sonner)sonner('Filters cleared');
  });
  return {open,close,toggle:()=>isOpen()?close():open(),isOpen,sheet,pill:sheet.querySelector('#cl-fspill')};
})();
window.clSheet=clSheet;
fbtn.addEventListener('click',e=>{e.stopPropagation();clSheet.toggle()});
fbtn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fbtn.click()}});
root.querySelectorAll('.scopeitem').forEach(s=>s.addEventListener('click',()=>{
  root.querySelectorAll('.scopeitem').forEach(x=>x.classList.remove('selected'));s.classList.add('selected');
}));
/* field groups collapse + field → column filter (the nodes now live in the side sheet) */
const clFsheet=clSheet.sheet;
clFsheet.querySelectorAll('.fghead').forEach(h=>h.addEventListener('click',e=>{
  const g=h.parentElement,b=g.querySelector('.fgbody'),open=b.style.display!=='none';
  b.style.display=open?'none':'block';
  h.querySelector('.chevbtn').style.transform=open?'rotate(-90deg)':'rotate(0)';
  e.stopPropagation();
}));
clFsheet.querySelectorAll('.fielditem').forEach(f=>f.addEventListener('click',e=>{
  curCol=f.dataset.field;
  clFsheet.querySelectorAll('.fielditem').forEach(x=>x.classList.toggle('picked',x===f));
  openColFilter(f,true);
  e.stopPropagation();
}));
document.getElementById('cl-fieldsearch').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();
  clFsheet.querySelectorAll('.fielditem').forEach(f=>{f.style.display=f.dataset.field.toLowerCase().includes(q)?'flex':'none'});
  if(q)clFsheet.querySelectorAll('.fgbody').forEach(b=>b.style.display='block');
});

/* ---------- account context line ----------
   Default: name only. The subline appears only for states an agent would be
   harmed by missing — acting on someone else's book, or a broken integration. */
window.setAccountNote=function(kind,text){
  const n=document.getElementById('pnote');if(!n)return;
  if(!kind){n.hidden=true;n.className='pnote';n.innerHTML='';return}
  n.hidden=false;n.className='pnote '+kind;
  n.innerHTML='<i></i><span></span>';n.querySelector('span').textContent=text;
  n.title=text;
};
/* prototype states: setAccountNote('warn','Google disconnected')
                     setAccountNote('warn','MLS sync failed')
                     setAccountNote('acting','Viewing as Emily Robinson')
                     setAccountNote(null) */

/* ---------- profile menu ---------- */
document.querySelector('#profilecard .profiletop').addEventListener('click',e=>{
  document.getElementById('pmenu').classList.toggle('open');e.stopPropagation();
});
document.addEventListener('click',e=>{if(!e.target.closest('.pwrap'))document.getElementById('pmenu').classList.remove('open')});
document.getElementById('logoutbtn').addEventListener('click',e=>{
  e.stopPropagation();
  document.getElementById('pmenu').classList.remove('open');
  sonner('Signing out','Ashutosh iOSacc');
});

/* ---- rail tooltips: label each collapsed icon with its own row text ---- */
(function railTips(){
  const sb=document.querySelector('.sidebar');if(!sb)return;
  sb.querySelectorAll('.nav,.srch,.mel').forEach(el=>{
    if(el.closest('.flyout')||el.classList.contains('mel')||el.classList.contains('morewrap'))return;
    const t=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim();
    if(t) el.setAttribute('data-tip',t);
  });
  const prof=document.getElementById('profilecard');if(prof)prof.setAttribute('data-tip','Ashutosh iOSacc');
})();

/* ---------- sidebar collapse toggle ---------- */
document.querySelectorAll('.content .phead .sbtoggle').forEach(b=>b.addEventListener('click',()=>{
  document.querySelector('.app').classList.toggle('collapsed');
  setTimeout(updateRail,200);
}));

/* ---------- more flyout + messages collapse ---------- */
const more=document.getElementById('more');
more.addEventListener('click',e=>{more.classList.toggle('open');e.stopPropagation()});
document.addEventListener('click',e=>{if(!e.target.closest('#more'))more.classList.remove('open')});

window.closePop=closePop;
window.pickOp=pickOp;
window.clearColFilter=clearColFilter;
window.openColFilter=openColFilter;
window.toggleOps=toggleOps;
window.clearColFilter=clearColFilter;
window.removeFilter=removeFilter;
window.clearSel=clearSel;
window.goCol=goCol;
/* ================= multi-select + bulk assign (detail board only) =================
   Select mode is off by default: the board behaves exactly as before until the agent
   turns it on from the toolbar. Options are fixed to the approved set:
   Assign campaign · Move to stage · Add to smart list · Add tag · Archive. */
var pickMode=false;
var bulkSel=new Set();
var archived=new Set();
var extraMap=new Map();
var lastPick=null;               /* {si,i} anchor for shift-range */
function isSel(i){return typeof bulkSel!=='undefined'&&!!bulkSel&&bulkSel.has(i)}
function isArch(i){return typeof archived!=='undefined'&&!!archived&&archived.has(i)}
function xtra(i){
  if(typeof extraMap==='undefined'||!extraMap)return{tags:[],lists:[],camps:[],collabs:[]};
  return extraMap.get(i)||{tags:[],lists:[],camps:[],collabs:[]};
}
function xtraOf(i){let x=extraMap.get(i);if(!x){x={tags:[],lists:[],camps:[],collabs:[]};extraMap.set(i,x)}if(!x.collabs)x.collabs=[];return x}

const bulkCollabPool=[["Siddhant Agarwal","Lender"],["Hello TC","T.C."],["Priya Raman","T.C."],["James Whitfield","Co-agent"],["Dana Brooks","Lender"],["Marcus Lee","Co-agent"],["Elena Ruiz","Escrow officer"]];
const bulkTags=["Pre-approved","Hot lead","Nurture","Investor","Referral","Relocation","First-time buyer","Do not contact"];
const bIcon={
  check:'<svg viewBox="0 0 24 24"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/></svg>',
  spark:'<svg viewBox="0 0 24 24"><path d="M12 3.2l1.85 4.95L18.8 10l-4.95 1.85L12 16.8l-1.85-4.95L5.2 10l4.95-1.85z"/></svg>',
  arrow:'<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  user:'<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  list:'<svg viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  tag:'<svg viewBox="0 0 24 24"><path d="M20.6 13.4 12 22l-9-9V3h10z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
  arch:'<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="5" rx="1.5"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/><path d="M10 13h4"/></svg>',
  warn:'<svg viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
  search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>',
  collab:'<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  phone:'<svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/></svg>',
  chev:'<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>'
};

/* ---- toolbar toggle ---- */
const selBtn=document.createElement('button');
selBtn.type='button';selBtn.className='selbtn';selBtn.id='cl-selbtn';
selBtn.setAttribute('aria-pressed','false');
selBtn.title='Select multiple cards (S)';
selBtn.innerHTML=bIcon.check+'<span>Select</span>';
(function(){const vt=document.getElementById('cl-vtoggle');if(vt&&vt.parentElement)vt.parentElement.insertBefore(selBtn,vt);})();
function syncSelBtn(){
  const ok=board.classList.contains('on')&&cardLayout==='current';
  selBtn.classList.toggle('show',ok);
  if(!ok&&pickMode)exitPick(true);
}
selBtn.addEventListener('click',()=>{pickMode?exitPick():enterPick()});
document.getElementById('cl-vtoggle').addEventListener('click',()=>setTimeout(syncSelBtn,0));

function enterPick(){
  pickMode=true;selBtn.classList.add('on');selBtn.setAttribute('aria-pressed','true');
  selBtn.querySelector('span').textContent='Selecting';
  board.classList.add('pick');paintBulk();
}
function exitPick(quiet){
  pickMode=false;bulkSel.clear();lastPick=null;
  selBtn.classList.remove('on');selBtn.setAttribute('aria-pressed','false');
  selBtn.querySelector('span').textContent='Select';
  board.classList.remove('pick');hideBlkPop();hidePanel(blkBar);hideTray(blkBar);paintBulk();
  if(!quiet)renderBoard();
}

/* ---- selection interaction (capture: pre-empts the normal card handlers) ---- */
const colIds=si=>[...board.querySelectorAll(`.kcolb[data-stage="${si}"] .kcard`)].map(c=>+c.dataset.i);
function setSel(i,on){on?bulkSel.add(i):bulkSel.delete(i);const c=board.querySelector(`.kcard[data-i="${i}"]`);if(c){c.classList.toggle('sel',on);const k=c.querySelector('.kck');if(k)k.setAttribute('aria-checked',on?'true':'false')}}
function repaintColBtns(){board.querySelectorAll('.kcolall').forEach(b=>{const ids=colIds(+b.dataset.colall),all=ids.length&&ids.every(isSel);b.textContent=all?'Clear':'Select all';b.classList.toggle('clr',!!all)})}
board.addEventListener('click',e=>{
  if(!pickMode||cardLayout!=='current')return;
  const all=e.target.closest('[data-colall]');
  if(all){
    e.preventDefault();e.stopPropagation();
    const ids=colIds(+all.dataset.colall),on=!(ids.length&&ids.every(isSel));
    ids.forEach(i=>setSel(i,on));repaintColBtns();paintBulk();return;
  }
  const card=e.target.closest('.kcard');if(!card)return;
  e.preventDefault();e.stopPropagation();
  const i=+card.dataset.i,si=data[i][4];
  if(e.shiftKey&&lastPick&&lastPick.si===si){
    const ids=colIds(si),a=ids.indexOf(lastPick.i),b=ids.indexOf(i);
    if(a>-1&&b>-1){ids.slice(Math.min(a,b),Math.max(a,b)+1).forEach(x=>setSel(x,true));}
  }else{
    setSel(i,!isSel(i));
  }
  lastPick={si,i};repaintColBtns();paintBulk();
},true);
document.addEventListener('keydown',e=>{
  if((e.key==='s'||e.key==='S')&&!pickMode&&!e.metaKey&&!e.ctrlKey&&selBtn.classList.contains('show')){
    const t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable);
    if(!typing){e.preventDefault();enterPick();return;}
  }
  if(!pickMode)return;
  if(e.key==='Escape'){e.preventDefault();if(blkBar.classList.contains('panel'))hidePanel(blkBar);else if(blkBar.classList.contains('tray'))hideTray(blkBar);else exitPick();return;}
  if(e.key===' '||e.key==='Spacebar'){
    const c=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.kcard');
    if(c){e.preventDefault();const i=+c.dataset.i;setSel(i,!isSel(i));lastPick={si:data[i][4],i};repaintColBtns();paintBulk();}
  }
});

/* ---- bulk bar ---- */
const blkBar=document.createElement('div');
blkBar.className='blkbar';blkBar.setAttribute('role','toolbar');blkBar.setAttribute('aria-label','Bulk actions');
blkBar.innerHTML=`<div class="blktray"></div><div class="blkpanel"></div><div class="blkrow">`+
  `<button type="button" class="blkcount" data-blktray aria-expanded="false"><b></b>${bIcon.chev}</button><em></em>`+
  `<span class="blksep"></span>`+
  `<button type="button" class="blkb" data-blk="camp">${bIcon.spark}Assign campaign</button>`+
  `<button type="button" class="blkb" data-blk="ctype">${bIcon.user}Change client type</button>`+
  `<button type="button" class="blkb" data-blk="list">${bIcon.list}Add to smart list</button>`+
  `<button type="button" class="blkb" data-blk="tag">${bIcon.tag}Add tag</button>`+
  `<span class="blksep"></span>`+
  `<button type="button" class="blkib" data-blk="collab" data-tip="Assign collaborator" aria-label="Assign collaborator">${bIcon.collab}</button>`+
  `<button type="button" class="blkib" data-blk="invite" data-tip="Invite to Avengers app" aria-label="Invite to Avengers app">${bIcon.phone}</button>`+
  `<button type="button" class="blkib dstr" data-blk="archive" data-tip="Archive" aria-label="Archive">${bIcon.arch}</button>`+
  `<span class="blksep"></span><button type="button" class="blkx" data-blkx aria-label="Clear selection">✕</button></div>`;
function paintBulk(){
  const host=document.getElementById('cl-page')||document.body;
  if(!blkBar.parentElement)host.appendChild(blkBar);
  const n=bulkSel.size;
  blkBar.classList.toggle('on',pickMode&&n>0);
  blkBar.querySelector('.blkcount b').textContent=n+' selected';
  const stagesHit=new Set([...bulkSel].map(i=>data[i][4])).size;
  blkBar.querySelector('em').textContent=stagesHit>1?'across '+stagesHit+' stages':'';
  if(blkBar.classList.contains('tray'))renderTray(blkBar);
  if(n===0){hideBlkPop();hidePanel(blkBar);hideTray(blkBar)}
}
/* ---- shared bar engine: same tray + inline panel for board and table ---- */
const tableBar=document.getElementById('cl-selbar');
const isBoardBar=bar=>bar===blkBar;
function barIds(bar){
  return isBoardBar(bar)?[...bulkSel]
    :[...root.querySelectorAll('.rc')].filter(c=>c.checked).map(c=>+c.closest('tr').dataset.i);
}
function bindBar(bar){
  bar.addEventListener('click',e=>{
    if(e.target.closest('[data-blkx]'))return isBoardBar(bar)?exitPick():clearSel();
    if(e.target.closest('[data-blktray]'))return toggleTray(bar);
    const rm=e.target.closest('[data-untick]');
    if(rm){
      const i=+rm.dataset.untick;
      if(isBoardBar(bar)){setSel(i,false);lastPick=null;repaintColBtns();paintBulk()}
      else{const c=root.querySelector('tr[data-i="'+i+'"] .rc');if(c){c.checked=false;sync()}}
      return;
    }
    const opt=e.target.closest('[data-val]');
    if(opt){
      const kind=bar.__pkind,cfg=panelCfg[kind]||{};
      if(cfg.multi){opt.classList.toggle('on');const v=opt.dataset.val;bar.__psel.has(v)?bar.__psel.delete(v):bar.__psel.add(v);syncPanelCta(bar)}
      else applyBulk(kind,opt.dataset.val,bar);
      return;
    }
    if(e.target.closest('[data-pcancel]'))return hidePanel(bar);
    if(e.target.closest('[data-papply]'))return applyBulk(bar.__pkind,bar.__pkind==='invite'?null:[...bar.__psel],bar);
    const b=e.target.closest('[data-blk]');if(!b)return;
    const k=b.dataset.blk;
    if(k==='archive')return applyBulk('archive',null,bar);
    openPanel(k,bar);
  });
  bar.__psel=new Set();
}

/* ---- selection tray (count → list of selected clients) ---- */
const initialsOf=s=>s.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
function hideTray(bar){
  (bar?[bar]:[blkBar,tableBar]).forEach(b=>{
    if(!b)return;b.classList.remove('tray');
    const t=b.querySelector('[data-blktray]');if(t)t.setAttribute('aria-expanded','false');
  });
}
function toggleTray(bar){
  hidePanel(bar);
  const on=!bar.classList.contains('tray');
  bar.classList.toggle('tray',on);
  bar.querySelector('[data-blktray]').setAttribute('aria-expanded',on?'true':'false');
  if(on)renderTray(bar);
}
function renderTray(bar){
  const t=bar.querySelector('.blktray');if(!t)return;
  const ids=barIds(bar);
  t.innerHTML='<div class="blkph">Selected clients <em>'+ids.length+'</em></div>'+
    '<div class="blktrl">'+ids.map(i=>
      '<div class="blktr"><span class="av" style="width:24px;height:24px;border-radius:50%;background:rgba(90,95,242,.4);color:#fff;font:600 9.5px var(--font);display:flex;align-items:center;justify-content:center;flex:none">'+initialsOf(data[i][0])+'</span>'+
      '<span>'+data[i][0]+'</span><span class="sub">'+data[i][3]+' · '+stages[data[i][4]][0]+'</span>'+
      '<button type="button" class="rm" data-untick="'+i+'" aria-label="Remove '+data[i][0]+' from selection">✕</button></div>').join('')+
    '</div>';
}

/* ---- inline action panel (no modal) ---- */
const panelCfg={
  camp:{t:'Assign campaign',ph:'Search campaigns',opts:()=>assignable.map(v=>[v,'']),cta:'Assign'},
  ctype:{t:'Change client type',ph:'Search client types',opts:()=>[...new Set(data.map(r=>r[3]))].map(v=>[v,''])},
  list:{t:'Add to smart list',ph:'Search smart lists',opts:()=>listPool.map(v=>[v,''])},
  tag:{t:'Add tag',ph:'Search tags',opts:()=>bulkTags.map(v=>[v,''])},
  collab:{t:'Assign collaborator',ph:'Search collaborators by name or role',opts:()=>bulkCollabPool,multi:true,cta:'Assign',avatar:true},
  invite:{t:'Invite to Avengers app',msg:'Sends an app invite by email. Clients who already have the app are skipped.',cta:'Send invite'}
};
function hidePanel(bar){
  (bar?[bar]:[blkBar,tableBar]).forEach(b=>{
    if(!b)return;b.classList.remove('panel');b.__pkind=null;if(b.__psel)b.__psel.clear();
  });
}
function syncPanelCta(bar){const b=bar.querySelector('[data-papply]');if(b)b.disabled=bar.__psel.size===0}
function openPanel(kind,bar){
  if(bar.__pkind===kind)return hidePanel(bar);
  hideTray(bar);
  bar.__pkind=kind;bar.__psel.clear();
  const cfg=panelCfg[kind],p=bar.querySelector('.blkpanel'),ids=barIds(bar),n=ids.length;
  const head='<div class="blkph">'+cfg.t+' <em>'+n+' client'+(n>1?'s':'')+'</em></div>';
  if(cfg.msg){
    p.innerHTML=head+'<div class="blkpmsg">'+cfg.msg+'</div>'+
      '<div class="blkpf"><button type="button" class="blkgh" data-pcancel>Cancel</button><button type="button" class="blkap" data-papply>'+cfg.cta+'</button></div>';
    bar.classList.add('panel');return;
  }
  const types=new Set(ids.map(i=>data[i][3]));
  const warn=kind==='ctype'&&types.size>1?'<div class="blkpmsg">Selection spans '+types.size+' client types — one type applies to all.</div>':'';
  p.innerHTML=head+warn+
    '<label class="blkpsr">'+bIcon.search+'<input type="text" placeholder="'+cfg.ph+'" aria-label="'+cfg.ph+'"></label>'+
    '<div class="blkopts" role="listbox"></div>'+
    (cfg.multi?'<div class="blkpf"><button type="button" class="blkgh" data-pcancel>Cancel</button><button type="button" class="blkap" data-papply disabled>'+cfg.cta+'</button></div>':'');
  const list=p.querySelector('.blkopts'),input=p.querySelector('input');
  const paint=q=>{
    const rows=cfg.opts().filter(o=>(o[0]+' '+o[1]).toLowerCase().includes(q.toLowerCase()));
    list.innerHTML=rows.length?rows.map(o=>
      '<button type="button" class="blkopt'+(bar.__psel.has(o[0])?' on':'')+'" role="option" data-val="'+o[0]+'">'+
      (cfg.avatar?'<span class="av">'+initialsOf(o[0])+'</span>':'')+
      '<span>'+o[0]+'</span>'+(o[1]?'<span class="sub">'+o[1]+'</span>':'')+
      (cfg.multi?'<span class="bx"></span>':'')+'</button>').join('')
      :'<div class="blkpmsg">No match</div>';
  };
  paint('');
  input.addEventListener('input',()=>paint(input.value));
  bar.classList.add('panel');
  input.focus();
}
bindBar(blkBar);if(tableBar)bindBar(tableBar);

/* ---- searchable option popover ---- */
const blkPop=document.createElement('div');blkPop.className='blkpop';blkPop.setAttribute('role','dialog');
document.body.appendChild(blkPop);
let blkKind=null;
const hideBlkPop=()=>{blkPop.classList.remove('on');blkKind=null};
const popCfg={
  camp:{title:'Assign campaign',ph:'Search campaigns',opts:()=>assignable},
  list:{title:'Add to smart list',ph:'Search smart lists',opts:()=>listPool},
  tag:{title:'Add tag',ph:'Search tags',opts:()=>bulkTags},
  ctype:{title:'Change client type',ph:'Search client types',opts:()=>[...new Set(data.map(r=>r[3]))]}
};
function openBlkPop(anchor,kind){
  if(blkKind===kind)return hideBlkPop();
  blkKind=kind;
  const cfg=popCfg[kind];
  const types=new Set([...bulkSel].map(i=>data[i][3]));
  const warn=kind==='ctype'&&types.size>1
    ? `<div class="blkpw">${bIcon.warn}<span>Your selection spans ${types.size} client types. Changing applies one type to all ${bulkSel.size} clients.</span></div>`:'';
  blkPop.innerHTML=`<div class="blkpk">${cfg.title} · ${bulkSel.size} client${bulkSel.size>1?'s':''}</div>${warn}`+
    `<label class="blkps">${bIcon.search}<input type="text" placeholder="${cfg.ph}" aria-label="${cfg.ph}"></label>`+
    `<div class="blkpl" role="listbox"></div>`;
  const list=blkPop.querySelector('.blkpl'),input=blkPop.querySelector('input');
  const paint=q=>{
    const rows=cfg.opts().filter(o=>o.toLowerCase().includes(q.toLowerCase()));
    list.innerHTML=rows.length?rows.map(o=>{
      const si=-1;
      const dot=si>-1?`<i style="background:${stages[si][1]}"></i>`:'';
      const num=si>-1?`<em>${si+1}</em>`:'';
      return `<button type="button" class="blkpi" role="option" data-val="${o}">${dot}<span>${o}</span>${num}</button>`;
    }).join(''):`<div class="blkpe">No match</div>`;
  };
  paint('');
  input.addEventListener('input',()=>paint(input.value));
  list.addEventListener('click',e=>{const b=e.target.closest('[data-val]');if(b)applyBulk(kind,b.dataset.val)});
  blkPop.classList.add('on');
  const r=anchor.getBoundingClientRect(),w=268;
  blkPop.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
  blkPop.style.top='';blkPop.style.bottom=(innerHeight-r.top+8)+'px';
  input.focus();
}
document.addEventListener('click',e=>{
  if(!blkPop.classList.contains('on'))return;
  if(!e.target.closest('.blkpop')&&!e.target.closest('[data-blk]'))hideBlkPop();
},true);
addEventListener('resize',hideBlkPop);

/* ---- apply + undo ---- */
function applyBulk(kind,val,bar){
  const src=bar||blkBar;
  const ids=barIds(src);if(!ids.length)return;
  const n=ids.length,who=n+' client'+(n>1?'s':'');
  let undo,title,desc;
  if(kind==='ctype'){
    const prev=ids.map(i=>[i,data[i][3]]);
    ids.forEach(i=>{data[i][3]=val});
    undo=()=>prev.forEach(([i,t])=>{data[i][3]=t});
    title='Client type set to '+val;desc=who;
  }else if(kind==='collab'){
    const vals=[].concat(val||[]);if(!vals.length)return;
    const touched=[];
    ids.forEach(i=>{const x=xtraOf(i);vals.forEach(v=>{if(!x.collabs.includes(v)){x.collabs.push(v);touched.push([i,v])}})});
    undo=()=>touched.forEach(([i,v])=>{const x=xtraOf(i);x.collabs=x.collabs.filter(c=>c!==v)});
    title=vals.length>1?vals.length+' collaborators assigned':vals[0]+' assigned';desc=who;
  }else if(kind==='invite'){
    undo=null;title='Invite sent';desc=who+' · Avengers app';
  }else if(kind==='archive'){
    ids.forEach(i=>archived.add(i));
    undo=()=>ids.forEach(i=>archived.delete(i));
    title='Archived '+who;desc='Removed from the board';
  }else{
    const key=kind==='camp'?'camps':kind==='list'?'lists':'tags';
    const touched=[];
    ids.forEach(i=>{const x=xtraOf(i);if(!x[key].includes(val)){x[key].push(val);touched.push(i)}});
    undo=()=>touched.forEach(i=>{const x=xtraOf(i);x[key]=x[key].filter(v=>v!==val)});
    title=kind==='camp'?'Campaign assigned':kind==='list'?'Added to '+val:'Tagged “'+val+'”';
    desc=kind==='camp'?val+' · '+who:who;
  }
  hideBlkPop();hidePanel(src);hideTray(src);
  if(isBoardBar(src)){bulkSel.clear();lastPick=null}
  renderBoard();renderTable();paintBulk();
  if(!isBoardBar(src))clearSel();
  bulkToast(title,desc,undo?()=>{undo();renderBoard();renderTable();sonner('Undone',title)}:null);
}

/* toast with a 30s Undo — bulk edits are the one place an agent needs a way back */
function bulkToast(title,desc,onUndo){
  let w=document.querySelector('.sonner');
  if(!w){w=document.createElement('div');w.className='sonner';document.body.appendChild(w)}
  const t=document.createElement('div');t.className='snr';
  t.innerHTML='<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div style="flex:1;min-width:0"><div class="snrt"></div><div class="snrd"></div></div><button type="button" class="snru">Undo</button><span class="snrx">✕</span>';
  t.querySelector('.snrt').textContent=title;
  const d=t.querySelector('.snrd');if(desc){d.textContent=desc}else{d.remove()}
  const kill=()=>{t.classList.remove('in');setTimeout(()=>t.remove(),180)};
  t.querySelector('.snrx').onclick=kill;
  const ub=t.querySelector('.snru');
  if(onUndo){ub.onclick=()=>{onUndo();kill()}}else{ub.remove()}
  t.style.pointerEvents='auto';
  w.appendChild(t);requestAnimationFrame(()=>t.classList.add('in'));
  setTimeout(kill,30000);
}
syncSelBtn();

window.showCollab=showCollab;
root.addEventListener('click',e=>{
  const t=e.target.closest('.avg.collabtrig');
  if(!t)return;
  if(t.classList.contains('open')){closeCollab();return;}
  showCollab(e,t);
},true);
})();
/* page visibility + theme fab owned by the project shell */
/* Tweaks bridge intentionally omitted — the project shell already provides it. */
