/* ================= transaction detail page ================= */
(function(){
const P=document.getElementById('txd-page');
const LIST=document.getElementById('tx-page');
const $=id=>document.getElementById(id);
const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const DOT={green:'#6da544',amber:'#d9a514',blue:'#5a5ff2',red:'#dc2626',none:'#a3a3a3'};

/* ---- model ---- */
let head={addr:'5670 Kearny Mesa Road, San Diego',price:'$1,450,000',comm:'$14,500',acc:'Jul 23',coe:'Aug 12',coeD:'2026-08-12',client:'Nora Zeglaya',parties:['Nora Zeglaya','James Collins','Marcus Webb'],rep:'Seller & Buyer',txtype:'Sale',txcontract:'Nor Cal Standard Residential Purchase',ag:'Ashutosh iOSacc',st:'Pending',stc:'#2563eb',priv:0};
/* detail panel mirrors the table's per-side status model: the rail shows this side's
   lifecycle, the dropdown shows this side's full set (incl. off-lifecycle terminals) */
const DDOT={'Prospect':'#db2777','Listing agreement signed':'#5a5ff2','Coming soon':'#84a12a','Active on market':'#6da544','Back on market':'#6da544','Listing canceled':'#dc2626','Listing expired':'#dc2626','New offer':'#0f766e','Pending signature':'#5a5ff2','Executed':'#155e75','Submitted to listing agent':'#155e75','Offer rejected':'#dc2626','Offer withdrawn':'#dc2626','Pre-pending':'#2563eb','Pending':'#2563eb','In escrow':'#2563eb','Closed':'#a3a3a3','Void':'#dc2626'};
const DSIDE=()=>{const t=head.rep;return (t==='Referral'||t==='—'||!t)?'referral':(t==='Buyer'||t==='Tenant')?'buyer':'listing'};
const DLIFE={
 listing:['Prospect','Listing agreement signed','Coming soon','Active on market','Pending','In escrow','Closed'],
 buyer:['New offer','Pending signature','Executed','Submitted to listing agent','Pending','In escrow','Closed'],
 referral:['Pre-pending','Pending','In escrow','Closed']
};
const DSET={
 listing:['Prospect','Listing agreement signed','Coming soon','Active on market','Back on market','Pending','In escrow','Closed','Listing canceled','Listing expired','Void'],
 buyer:['New offer','Pending signature','Executed','Submitted to listing agent','Pending','In escrow','Closed','Offer rejected','Offer withdrawn','Void'],
 referral:['Pre-pending','Pending','In escrow','Closed','Void']
};
const lifeList=()=>DLIFE[DSIDE()].map(n=>[n,DDOT[n]||'#a3a3a3']);
const stagesDList=()=>DSET[DSIDE()].map(n=>[n,DDOT[n]||'#a3a3a3']);
const forms=[
 {n:'AD Disclosure Regarding Agency Relationship',s:'filled',c:false},
 {n:'RLA Residential Listing Agreement',s:'progress',c:false},
 {n:'MLSA Multiple Listing Service Addendum',s:'filled',c:false},
 {n:'BCA Broker Compensation Advisory',s:'progress',c:false},
 {n:'PRBS-S Possible Representation of More than One Seller/Buyer',s:'none',c:false},
 {n:'FHDA Fair Housing & Discrimination Advisory',s:'none',c:false},
 {n:'SA Sellers Advisory',s:'filled',c:false},
 {n:'CCPA Consumer Privacy Act Advisory',s:'none',c:false},
 {n:'Radius Affiliated Business Disclosure',s:'none',c:false}
];
const FS={filled:['Filled',DOT.green],progress:['In progress',DOT.amber],none:['Not started',null]};
let envs=[
 {n:'Envelope 1',s:'progress',date:'March 11, 2026',open:1,sopen:0,
  recips:[{n:'You (Agent)',e:'vanessa.brown@radius.com',st:'ok',w:'Signed on March 23, 2026'},
   {n:'Nora Collins (Seller)',e:'nora.collins@gmail.com',st:'wait',w:'Waiting for signature'},
   {n:'James Collins (Co-seller)',e:'james.collins@example.com',st:'wait',w:'Waiting for signature'}],
  docs:['KLA_Keysafe/Lockbox Addendum and Tenant Permission to Access Property_Seller Representation','RCSD-S #1_Representative Capacity Signature Disclosure For Seller Representation (ST)'],
  you:'You signed on March 23, 2026'},
 {n:'Seller disclosures',s:'progress',date:'March 14, 2026',open:1,sopen:0,
  recips:[{n:'You (Agent)',e:'vanessa.brown@radius.com',st:'wait',w:'Waiting for signature'},
   {n:'Nora Collins (Seller)',e:'nora.collins@gmail.com',st:'wait',w:'Waiting for signature'}],
  docs:['SPQ Seller Property Questionnaire','TDS Real Estate Transfer Disclosure Statement']},
 {n:'Agency disclosure',s:'done',date:'March 2, 2026',open:0,sopen:0,
  recips:[{n:'You (Agent)',e:'vanessa.brown@radius.com',st:'ok',w:'Signed on March 2, 2026'},
   {n:'Nora Collins (Seller)',e:'nora.collins@gmail.com',st:'ok',w:'Signed on March 3, 2026'}],
  docs:['AD Disclosure Regarding Real Estate Agency Relationship'],you:'You signed on March 2, 2026'},
 {n:'Compensation advisory',s:'draft',date:'March 18, 2026',open:0,sopen:0,
  recips:[{n:'Nora Collins (Seller)',e:'nora.collins@gmail.com',st:'wait',w:'Not sent yet'}],
  docs:['BCA Broker Compensation Advisory']}
];
const EG={progress:['In-progress envelopes','#c07a12'],draft:['Draft envelopes','#737373'],done:['Completed envelopes','#41701f'],declined:['Declined envelopes','#a52020']};
const ES={progress:['In progress',DOT.amber,'Remind'],draft:['Draft',DOT.none,'Fill & sign'],done:['Completed',DOT.green,'Download'],declined:['Declined',DOT.red,'Resend']};
let envFilter='all';

const CL=[
 {n:'Listing checklist',total:19,items:[
  ['Signed listing agreement','approved',1],['Agency disclosure','approved',1],['Sellers advisory','approved',1],
  ['MLS profile sheet','progress',1],['Broker compensation advisory','progress',1],
  ['Property profile / vesting','missing',0],['Wire fraud advisory','missing',0],['Fair housing advisory','missing',0],['Square footage disclosure','missing',0],
  ['Lockbox authorization','progress',1],['Sign installation order','progress',0],['Photography release','progress',0],
  ['Seller net sheet','progress',0],['Marketing plan','progress',0],['Showing instructions','progress',0],
  ['Keybox receipt','progress',0],['Listing input form','progress',1],['Owner identification','progress',1],['Trust certification','progress',0]
 ]},
 {n:'Sales documents',total:56,items:[
  ['Residential purchase agreement','progress',1],['Counter offer #1','progress',1],['Buyer pre-approval letter','progress',1],
  ['Proof of funds','progress',0],['Escrow instructions','progress',0],['Earnest money receipt','progress',0],
  ['Contingency removal','progress',0],['Addendum #1','progress',0],['Addendum #2','progress',0],
  ['Verification of property condition','progress',0],['Buyer inspection advisory','progress',0],['Final walkthrough','progress',0]
 ]},
 {n:'Disclosures',total:25,items:[
  ['Transfer disclosure statement','approved',1],['Seller property questionnaire','approved',1],['Natural hazard disclosure','progress',1],
  ['Lead-based paint disclosure','progress',0],['Water heater / smoke detector','progress',0],['Mello-Roos disclosure','progress',0],
  ['Megans law advisory','progress',0],['Earthquake safety booklet','progress',0]
 ]},
 {n:'Reports',total:11,items:[
  ['Home inspection report','progress',1],['Termite report','progress',0],['Roof certification','progress',0],
  ['Sewer lateral report','progress',0],['Preliminary title report','approved',1]
 ]},
 {n:'Closing documents',total:8,items:[
  ['Estimated closing statement','progress',0],['Final settlement statement','progress',0],['Grant deed','progress',0],
  ['Commission disbursement authorization','progress',0],['Keys and remotes receipt','progress',0]
 ]}
];
const CS={approved:['Approved',DOT.green],progress:['In progress',DOT.none],missing:['Missing',DOT.amber],rejected:['Rejected',DOT.red]};
const CMT={ '0-3':2 };
let openGroup=0;

const SECTIONS=[
 {id:'property',t:'Property',fields:[
  ['Address','5670 Kearny Mesa Road, San Diego'],['MLS ID','',1],['APN','369-142-08'],['County','San Diego'],
  ['Listing type','Residential'],['Transaction type','Sale'],['Representation','Seller & Buyer']
 ]},
 {id:'people',t:'People',people:[
  ['Listing agent',[['Name','Ashutosh iOSacc'],['Email','ashutosh@radiusagent.com'],['Phone','(415) 555-0142'],['Brokerage','Radius Agent Realty']]],
  ['Seller 1',[['Name','Nora Collins'],['Email','nora.collins@gmail.com'],['Phone','(619) 555-0188'],['Brokerage','—']]],
  ['Seller 2',[['Name','James Collins'],['Email','james.collins@gmail.com'],['Phone','(619) 555-0190'],['Brokerage','—']]],
  ['Buyer agent',[['Name','Ashutosh iOSacc'],['Email','ashutosh@radiusagent.com'],['Phone','(415) 555-0142'],['Brokerage','Radius Agent Realty']]],
  ['Buyer',[['Name','Marcus Webb'],['Email',''],['Phone',''],['Brokerage','—']]]
 ]},
 {id:'contacts',t:'Contacts',contacts:[
  ['Transaction coordinator','Priya Raman'],['Title company','Chicago Title'],['Lender',''],['Escrow officer','']
 ]},
 {id:'terms',t:'Terms & commission',fields:[
  ['Listing start','Aug 1'],['On market','Aug 3'],['Acceptance','Jul 23'],['Closing','Aug 12'],
  ['Expiration','',1],['Purchase price','$1,450,000'],['Commission type','Percentage'],['Commission rate','1%'],
  ['Gross commission','$14,500','ro'],['Referral fee','']
 ]}
];
let reminded=false, uploadsLeft=4;
let unorg=[];
const DEALMAIL='tx-4821@docs.radiusagent.com';

/* ---- popovers ---- */
const pop=document.createElement('div');pop.className='txd-pop';document.body.appendChild(pop);
function showPop(anchor,html,w){
 pop.innerHTML=html; pop.style.minWidth=(w||190)+'px'; pop.classList.add('on');
 const r=anchor.getBoundingClientRect(),pr=pop.getBoundingClientRect();
 pop.style.left=Math.max(8,Math.min(r.left,window.innerWidth-pr.width-8))+'px';
 pop.style.top=(r.bottom+6+pr.height>window.innerHeight-8?r.top-pr.height-6:r.bottom+6)+'px';
}
const hidePop=()=>pop.classList.remove('on');
document.addEventListener('click',e=>{if(!e.target.closest('.txd-pop'))hidePop()},true);

function editPop(anchor,val,cb){
 showPop(anchor,'<input value="'+esc(val)+'">',200);
 const i=pop.querySelector('input');i.focus();i.select();
 i.addEventListener('keydown',ev=>{if(ev.key==='Enter'){cb(i.value);hidePop()}if(ev.key==='Escape')hidePop()});
 i.addEventListener('blur',()=>{cb(i.value);hidePop()});
}

/* ---- header ---- */
function ini(n){return n.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
function renderHead(){
 $('txd-title').textContent=head.addr+(head.city?', '+head.city:'');
 /* contract actions depend on the represented side + whether the contract is accepted */
 document.body.classList.toggle('txd-lside',['Seller','Landlord','Seller & Buyer'].indexOf(head.rep)>=0);
 document.body.classList.toggle('txd-cxa',!!head.cx);
 /* banner top section mirrors the same record (text only — markup stays literal) */
 if($('txb-addr')){
  const full=head.addr+(head.city?', '+head.city:'');
  $('txb-addr').textContent=full;
  $('txb-type').textContent=head.txtype||'—';
  $('txb-stat').innerHTML='<i style="background:'+head.stc+'"></i>'+esc(head.st);
  $('txb-price').textContent=head.price||'—';
  $('txb-rep').textContent=head.rep||'—';
  $('txb-price2').textContent=head.price||'—';
  $('txb-comm2').textContent=head.comm||'—';
  $('txb-dates').textContent=(head.coe||'—')+' · accepted '+(head.acc||'—');
  $('txb-client').textContent=(head.parties&&head.parties[0])||head.client||'—';
  $('txb-agent').textContent=head.ag||'—';
  $('txb-contract').textContent=head.txcontract||head.txtype||'—';
  const h=$('txb-h'),ci=full.indexOf(',');
  if(h&&ci>0)h.innerHTML=esc(full.slice(0,ci))+'<b>'+esc(full.slice(ci+1).trim())+'</b>';
  else if(h)h.innerHTML=esc(full);
 }
 $('txd-status').innerHTML='<span>'+esc(head.st)+'</span><svg class="stcar" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>';
 $('txd-status').style.background='color-mix(in srgb,'+head.stc+' 11%,var(--white))';
 $('txd-status').style.borderColor='color-mix(in srgb,'+head.stc+' 26%,var(--white))';
 $('txd-status').style.color='color-mix(in srgb,'+head.stc+' 72%,black)';
 document.body.classList.toggle('txd-priv',!!head.priv);
 renderRail();
 const blocked=typeof missingDetails==='function'&&missingDetails()>0;
 $('txd-metrics').innerHTML=
  '<div class="txd-m"><span class="l">Sale price</span><span class="v" data-f="price">'+esc(head.price||'—')+'</span></div>'+
  '<div class="txd-m"><span class="l">Gross commission</span><span class="v" data-f="comm">'+esc(head.comm||'—')+'</span></div>'+
  '<div class="txd-m"><span class="l">Acceptance date</span><span class="v" data-f="acc">'+esc(head.acc||'—')+'</span></div>'+
  '<div class="txd-m"><span class="l">Closing date</span><span class="v" data-f="coe">'+esc(head.coe||'—')+'</span></div>';
 const ps=(head.parties&&head.parties.length?head.parties:[head.client]);
 const dual=head.rep==='Seller & Buyer';
 const partyLabel=dual?'Clients':(head.rep==='—'?'Client':head.rep+(ps.length>1?'s':''));
 $('txd-idchips').innerHTML='<span class="txd-repb rds-badge rds-badge--secondary">'+esc(head.txtype||'—')+'</span>'+
  (head.mls
   ? '<span class="txd-mls on" id="txd-mlschip" title="Connected to MLS — details sync from the listing"><svg viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/></svg>MLS '+esc(head.mls)+'</span>'
   : '<span class="txd-mls" id="txd-mlschip" title="Connect this transaction to its MLS listing"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Add MLS #</span>');
 $('txd-factstrip').innerHTML=
  '<div class="txd-f"><span class="fl">'+esc(partyLabel)+'</span><span class="fv" title="'+esc(ps.join(', '))+'">'+
   '<span class="txd-av" style="background:#fce7f3;color:#9d174d">'+ini(ps[0])+'</span>'+
   '<span class="lnk" data-f="client">'+esc(ps[0])+'</span>'+
   (ps.length>1?'<button type="button" class="txd-npill" id="txd-clmore">+'+(ps.length-1)+'<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>':'')+'</span></div>'+
  '<div class="txd-f"><span class="fl">Agents</span><span class="fv">'+
   '<span class="txd-av" style="background:#e0e7ff;color:#3730a3">'+ini(head.ag)+'</span>'+esc(head.ag)+
   '<button type="button" class="txd-npill" id="txd-agmore">+1<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button></span></div>'+
  '<div class="txd-f"><span class="fl">Collaborators</span><span class="fv" title="Ruth Baker — TC, +10 more">'+
   '<button type="button" class="collabg txd-collabg" id="txd-collab" aria-expanded="false" title="Ruth Baker, Dillon Reeves, Priya Raman and 8 more">'+
    '<span class="cav" style="background:#fef9c3;color:#854d0e">RB</span>'+
    '<span class="cav" style="background:#e0e7ff;color:#3730a3">DR</span>'+
    '<span class="cav" style="background:#dcfce7;color:#166534">PR</span>'+
    '<span class="cnum">+8</span>'+
    '<svg class="cchev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button></span></div>'+
  '<div class="txd-f"><span class="fl">Representation</span><span class="fv"><span class="txd-repb rds-badge'+(dual?' rds-badge--indigo dual':' rds-badge--secondary')+'">'+esc(head.rep||'—')+'</span></span></div>'+
  '<div class="txd-f"><span class="fl">Transaction type</span><span class="fv" title="'+esc(head.txcontract||head.txtype||'—')+'"><span class="txd-tt">'+esc(head.txcontract||head.txtype||'—')+'</span></span></div>';
 renderHero();
 renderChk();
 if(typeof window.__renderFlatbar==='function') window.__renderFlatbar();
}
window.__renderChk=()=>renderChk();
/* ---- commission payment checklist (read-only for agents) ----
   Gates are owned by the auditor in Soul; the agent reads state only. Team and
   group CDA gates only exist when the agent belongs to one — otherwise the row
   is gone and the count shrinks with it. */
const CHK_SCENARIOS={
 inprogress:{received:'done',compliant:'done',agentcda:'wait',teamcda:'wait',groupcda:'done',payment:'wait'},
 complete:{received:'done',compliant:'done',agentcda:'done',teamcda:'done',groupcda:'done',payment:'done'},
 notcompliant:{received:'done',compliant:'bad',agentcda:'wait',teamcda:'wait',groupcda:'done',payment:'wait'},
 noteam:{received:'done',compliant:'done',agentcda:'done',teamcda:null,groupcda:null,payment:'wait'}
};
const CHK_GATES=[
 ['received','Commission Received'],
 ['compliant','Checklist Compliant'],
 ['agentcda','Agent CDA Approved'],
 ['teamcda','[Team Name] CDA Approved'],
 ['groupcda','[Group Name] CDA Approved'],
 ['payment','Agent Payment']
];
const CHK_ICO={
 done:'<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>',
 bad:'<svg viewBox="0 0 24 24"><path d="M12 7v6M12 17h.01"/></svg>'
};
window.__txState=(function(){try{const v=localStorage.getItem('crm-txstate');return (v==='paid'||v==='pending')?v:'pending'}catch(err){return 'pending'}})();
const CHK_GATE_LABELS=['Commission Received','Checklist Compliant','Agent CDA Approved','[Team Name] CDA Approved','[Group Name] CDA Approved','Agent Payment'];
/* which gates are cleared in each lifecycle state — auditors own these, agents only read */
const CHK_BY_STATE={
 listing:[0,0,0,0,0,0],
 pending:[1,1,0,0,1,0],
 paid:[1,1,1,1,1,1]
};
const TICK='<svg viewBox="0 0 24 24"><path d="m4 12.5 5 5L20 6.5"/></svg>';
function renderChk(){
 const el=$('txd-chk'),el2=$('txd-chk2');if(!el&&!el2)return;
 const st=window.__txState||'pending';
 const flags=CHK_BY_STATE[st]||CHK_BY_STATE.pending;
 const done=flags.reduce((a,b)=>a+b,0),all=done===flags.length;
 const rows=CHK_GATE_LABELS.map((t,i)=>{
  const ok=flags[i];
  const tag=ok?(i===5?'<b class="tag rel">Released</b>':''):'<b class="tag">Pending</b>';
  return '<span class="g '+(ok?'done':'wait')+'">'+(ok?TICK:'<i class="ring"></i>')+esc(t)+tag+'</span>';
 }).join('');
 let note;
 if(all){
  note='<div class="txd-chknote paid"><div><span class="t">Commission paid</span>'+
   '<span class="b">Funds released to agent <strong>Aug 14, 2026</strong> via <strong>Payload</strong>.</span></div></div>';
 }else{
  const waiting=CHK_GATE_LABELS.filter((t,i)=>!flags[i]&&i!==5).map(t=>t.replace(' CDA Approved','').replace(' Approved','')+' Commission');
  const list=waiting.length>1?waiting.slice(0,-1).join(', ')+' and '+waiting[waiting.length-1]:(waiting[0]||'auditor');
  note='<div class="txd-chknote"><div><span class="t">What\u2019s holding up payment</span>'+
   '<span class="b">Waiting on '+esc(list)+' approval.</span></div></div>';
 }
 const cnt=all?'<span class="cn ok">100%</span>':'<span class="cn'+(done?'':' idle')+'">'+done+'/6</span>';
 const html='<div class="ch"><h4>Commission Payment Checklist</h4>'+cnt+'</div><div class="cl">'+rows+'</div>'+note;
 if(el)el.innerHTML=html;
 if(el2)el2.innerHTML=html;
 const dot=$('txd-csdot');if(dot)dot.classList.toggle('off',all);
 const cc=$('txd-cscount');if(cc){cc.textContent=all?'100%':done+'/6';cc.classList.toggle('ok',all)}
}
/* lifecycle state drives the status pill, the gates and which contract action shows */
const TX_STATE_META={
 listing:['Active listing','#2563eb'],
 pending:['Incomplete \u00b7 Pending','#e39c2a'],
 paid:['Closed \u00b7 Paid','#17855c']
};
/* stage → contract gate: which contract action the row offers.
   pre  = Accept contract + Cancel listing (not yet under contract)
   in   = Cancel contract only (contract accepted)
   done = Download CDA (terminal) */
const STAGE_GATE={'Prospect':'pre','Listing agreement signed':'pre','Coming soon':'pre','Active on market':'pre','Back on market':'pre','New offer':'pre','Pending signature':'pre','Executed':'pre','Submitted to listing agent':'pre','Pre-pending':'pre','Pending':'in','In escrow':'in','Closed':'done','Listing canceled':'done','Listing expired':'done','Offer rejected':'done','Offer withdrawn':'done','Void':'done'};
window.__applyTxGate=function(stage){
 const g=STAGE_GATE[stage]||'in';
 const cls=g==='pre'?'txs-listing':g==='done'?'txs-paid':'txs-pending';
 const b=document.body;
 b.classList.remove('txs-listing','txs-pending','txs-paid');
 b.classList.add(cls);
 b.classList.toggle('txd-nocomments',false);
};
window.__applyTxState=function(v){
 const st=TX_STATE_META[v]?v:'pending';
 window.__txState=st;
 const b=document.body;
 b.classList.remove('txs-listing','txs-pending','txs-paid');
 b.classList.add('txs-'+st);
 b.classList.toggle('txd-nocomments',st==='listing');
 head.st=TX_STATE_META[st][0];head.stc=TX_STATE_META[st][1];
 renderHead();
 const sel=$('txd-switchsel');if(sel&&sel.value!==st)sel.value=st;
 try{localStorage.setItem('crm-txstate',st)}catch(err){}
};
window.__applyHeaderTint=function(v){document.body.classList.toggle('txd-plaintop',v==='plain')};
/* ---- flat-bar (integrated top) ---- */
window.__renderFlatbar=function(){
 const el=document.getElementById('txd-flatbar');
 if(!el) return;
 const flat=document.body.classList.contains('txd-flat');
 el.style.display=flat?'flex':'none';
 if(!flat){el.innerHTML='';return}
 const price=(head&&head.price)||'—';
 const comm=(head&&head.comm)||'—';
 const rate=(head&&head.rate)||'1%';
 const brok='\u2212$'+((comm.replace(/[^0-9.]/g,'')*0.15)||0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',');
 const lastCmt='Ruth Baker \u00b7 \u201cLender is waiting on updated proof of funds from the buyer.\u201d';
 const cmtCount=3;
 el.innerHTML=
  '<div class="fbcell" id="txd-fb-comm" title="Commission breakdown" role="button" tabindex="0">'+
   '<span class="fbl">Commission</span>'+
   '<span class="fbv">'+esc(rate)+' \u00b7 '+esc(comm)+' \u00b7 brokerage split '+brok+'</span>'+
   '<svg class="fbarr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>'+
  '</div>'+
  '<div class="fbcell" id="txd-fb-cmt" title="View comments" role="button" tabindex="0">'+
   '<span class="fbl">Comments</span>'+
   '<span class="fbv">'+esc(lastCmt)+'</span>'+
   '<span class="fbdot" aria-label="'+cmtCount+' unread"></span>'+
   '<svg class="fbarr" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>'+
  '</div>';
 const commBtn=document.getElementById('txd-comm');
 const cmtBtn=document.getElementById('txd-comments');
 const fbC=document.getElementById('txd-fb-comm');
 const fbM=document.getElementById('txd-fb-cmt');
 if(fbC&&commBtn) fbC.onclick=()=>commBtn.click();
 if(fbM&&cmtBtn) fbM.onclick=()=>cmtBtn.click();
};
/* ---- property photo hero + lightbox ---- */
const PHOTO_IDS=[106399,1396122,2724749,1643383,1571460,2404843,3288103,1080721,2062431,1428348,3935350,1918291];
const photoUrl=(id,w)=>'https://images.pexels.com/photos/'+id+'/pexels-photo-'+id+'.jpeg?auto=compress&cs=tinysrgb&w='+w;
let lbIdx=0;
function renderHero(){
 const el=$('txd-hero');if(!el)return;
 el.innerHTML='<img crossorigin="anonymous" src="'+photoUrl(PHOTO_IDS[0],700)+'" alt="'+esc(head.addr||'Property')+'">'+
  '<span class="hct"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 5-5 4 4 2-2 3 3"/></svg>1/'+PHOTO_IDS.length+'</span>'+
  '<span class="hst"><i style="background:'+head.stc+'"></i>'+esc(head.st)+'</span>'+
  '<button class="hgo" title="Open property page" aria-label="Open property page"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></svg></button>';
 el.title='View '+PHOTO_IDS.length+' photos';
 el.onclick=e=>{if(e.target.closest('.hgo')){e.stopPropagation();sonner('Property page','Opening '+(head.addr||'listing'));return}openLb(0)};
}
function lbEl(){
 let lb=document.getElementById('txd-lb');
 if(lb)return lb;
 lb=document.createElement('div');lb.id='txd-lb';lb.className='txd-lb';
 lb.innerHTML='<div class="fig"><img crossorigin="anonymous" alt="">'+
  '<button class="lbnav prev" aria-label="Previous photo"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>'+
  '<button class="lbnav next" aria-label="Next photo"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></button>'+
  '<button class="lbx" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button>'+
  '<span class="lbct"></span></div>';
 document.body.appendChild(lb);
 lb.addEventListener('click',e=>{
  if(e.target===lb||e.target.closest('.lbx'))return closeLb();
  if(e.target.closest('.prev'))return stepLb(-1);
  if(e.target.closest('.next'))return stepLb(1);
 });
 document.addEventListener('keydown',e=>{
  if(!lb.classList.contains('on'))return;
  if(e.key==='Escape')closeLb();
  if(e.key==='ArrowLeft')stepLb(-1);
  if(e.key==='ArrowRight')stepLb(1);
 });
 return lb;
}
function paintLb(){
 const lb=lbEl();
 lb.querySelector('.fig img').src=photoUrl(PHOTO_IDS[lbIdx],1400);
 lb.querySelector('.lbct').textContent=(lbIdx+1)+' / '+PHOTO_IDS.length;
}
function openLb(i){lbIdx=i;const lb=lbEl();paintLb();lb.classList.add('on')}
function stepLb(d){lbIdx=(lbIdx+d+PHOTO_IDS.length)%PHOTO_IDS.length;paintLb()}
function closeLb(){const lb=document.getElementById('txd-lb');if(lb)lb.classList.remove('on')}
function daysChip(){
 if(!head.coeD)return '';
 const d=Math.round((new Date(head.coeD+'T00:00:00')-new Date(new Date().toDateString()))/864e5);
 if(d<0)return '<span class="txd-days late">'+Math.abs(d)+' days overdue</span>';
 if(d===0)return '<span class="txd-days late">today</span>';
 return '<span class="txd-days'+(d<=14?' soon':'')+'">in '+d+' day'+(d>1?'s':'')+'</span>';
}
function renderRail(){
 const stagesD=lifeList();
 const cur=stagesD.findIndex(s=>s[0]===head.st);
 const blocked=typeof missingDetails==='function'&&missingDetails()>0;
 $('txd-rail').innerHTML=
  '<div class="txd-railtrack">'+stagesD.map((s,i)=>{
   const cls=i<cur?'done':i===cur?'cur':'';
   const pip=(blocked&&i===stagesD.length-1)?'<span class="pip"></span>':'';
   return '<span class="txd-seg '+cls+'" data-seg="'+i+'" title="'+esc(s[0])+'">'+(i===cur?'<span class="fill"></span>':'')+pip+'</span>';
  }).join('')+'</div>'+
  '<div class="txd-raillabels">'+stagesD.map((s,i)=>
   '<span class="'+(i<cur?'done':i===cur?'cur':'')+'" data-seg="'+i+'">'+esc(s[0])+'</span>').join('')+'</div>';
}
$('txd-rail').addEventListener('click',e=>{
 const s=e.target.closest('[data-seg]');if(!s)return;
 const st=lifeList()[+s.dataset.seg];head.st=st[0];head.stc=st[1];renderHead();
});
$('txd-metrics').addEventListener('click',e=>{
 const b=e.target.closest('[data-f]');if(!b)return;
 const k=b.dataset.f;editPop(b,head[k]||'',v=>{head[k]=v.trim()||'—';renderHead()});
});
$('txd-factstrip').addEventListener('click',e=>{
 const b=e.target.closest('[data-f]');
 if(b&&b.dataset.f!=='client'){const k=b.dataset.f;editPop(b,head[k]||'',v=>{head[k]=v.trim()||'—';renderHead()});return}
 if(e.target.closest('#txd-collab')){
  e.stopPropagation();
  const rows=[['Ruth Baker','T.C. \u00b7 primary'],['Dillon Reeves','Lender'],['Priya Raman','T.C.'],['Marta Chen','Escrow officer'],['Owen Blake','Co-agent'],['Sara Diaz','Inspector'],['Tim Cho','Lender'],['Dana Ruiz','T.C.'],['Marcus Lee','Co-agent'],['Elena Ruiz','Escrow officer'],['James Whitfield','Co-agent']];
  window.__peoplePop(e.target.closest('#txd-collab'),rows.length+' collaborators',rows,'Manage access');return;
 }
 if(e.target.closest('#txd-clmore')){
  e.stopPropagation();
  const ps=(head.parties&&head.parties.length?head.parties:[head.client]);
  const rows=ps.map((n,k)=>[n,k===0?'Client \u00b7 primary':'Co-client']);
  window.__peoplePop(e.target.closest('#txd-clmore'),ps.length+' clients on this transaction',rows,'Manage clients');return;
 }
 if(e.target.closest('#txd-agmore')){
  e.stopPropagation();
  const rows=[[head.ag,'Primary agent'],['Marcus Lee','Co-agent']];
  window.__peoplePop(e.target.closest('#txd-agmore'),'2 agents on this transaction',rows,'Manage agents');return;
 }
});
$('txd-status').addEventListener('click',e=>{
 showPop($('txd-status'),stagesDList().map(st=>'<div class="pi'+(st[0]===head.st?' cur':'')+'" data-st="'+st[0]+'" data-c="'+st[1]+'"><i style="background:'+st[1]+'"></i>'+st[0]+'<span class="chk">✓</span></div>').join(''),200);
 pop.querySelectorAll('[data-st]').forEach(el=>el.onclick=()=>{head.st=el.dataset.st;head.stc=el.dataset.c;hidePop();window.__applyTxGate(el.dataset.st);renderHead()});
});
$('txd-idchips').addEventListener('click',e=>{
 const c=e.target.closest('#txd-mlschip');if(!c)return;
 editPop(c,head.mls||'',v=>{
  v=v.trim();
  head.mls=v||'';
  const prop=SECTIONS.find(s=>s.id==='property');
  const row=prop.fields.find(f=>f[0]==='MLS ID');
  if(row)row[1]=head.mls;
  if(head.mls)sonner('Connected to MLS '+head.mls,'Listing details will sync from the MLS record');
  renderHead();renderSections();renderNext();
 });
});
$('txd-comm').addEventListener('click',()=>showPop($('txd-comm'),
 '<div class="kv"><span>Sale price</span><b>'+esc(head.price)+'</b></div>'+
 '<div class="kv"><span>Commission rate</span><b>1%</b></div>'+
 '<div class="kv"><span>Gross commission</span><b>'+esc(head.comm)+'</b></div>'+
 '<div class="kv"><span>Brokerage split</span><b>−$2,175</b></div>'+
 '<div class="kv"><span>Referral fee</span><b>—</b></div>'+
 '<div class="kv tot"><span>Your net</span><b>$12,325</b></div>',240));
const _cs=$('txd-commsplit');
if(_cs){
 /* dialog-in-a-dropdown: anchored panel, dialog chrome, nothing behind it blocked */
 const dp=$('txd-cspop');
 const place=()=>{
  const r=_cs.getBoundingClientRect(),h=dp.offsetHeight,w=dp.offsetWidth;
  dp.style.left=Math.max(12,Math.min(r.left,window.innerWidth-w-12))+'px';
  dp.style.top=(r.bottom+8+h>window.innerHeight-12&&r.top-8-h>12?r.top-8-h:r.bottom+8)+'px';
 };
 const close=()=>{dp.classList.remove('on');_cs.setAttribute('aria-expanded','false')};
 const open=()=>{
  hidePop();
  if($('txd-chk2')&&!$('txd-chk2').innerHTML)renderChk();
  dp.classList.add('on');_cs.setAttribute('aria-expanded','true');place();
 };
 _cs.setAttribute('aria-haspopup','dialog');_cs.setAttribute('aria-expanded','false');
 _cs.addEventListener('click',e=>{e.stopPropagation();dp.classList.contains('on')?close():open()});
 $('txd-cspop-x').addEventListener('click',close);
 document.addEventListener('click',e=>{if(dp.classList.contains('on')&&!e.target.closest('#txd-cspop')&&!e.target.closest('#txd-commsplit'))close()},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dp.classList.contains('on')){close();_cs.focus()}});
 window.addEventListener('resize',()=>{if(dp.classList.contains('on'))place()});
 window.addEventListener('scroll',()=>{if(dp.classList.contains('on'))place()},true);
}
/* ---- banner top section (view-only overview; collapses to the bar row) ---- */
(function(){
 const bn=$('txd-banner'); if(!bn)return;
 const tg=$('txb-toggle');
 const setMin=v=>{document.body.classList.toggle('txb-min',v);tg.setAttribute('aria-expanded',v?'false':'true');try{localStorage.setItem('crm-txbmin',v?'1':'0')}catch(e){}};
 try{if(localStorage.getItem('crm-txbmin')==='1')setMin(true)}catch(e){}
 tg.addEventListener('click',()=>setMin(!document.body.classList.contains('txb-min')));
 $('txb-back').addEventListener('click',()=>$('txd-back').click());
 $('txb-comments').addEventListener('click',()=>$('txd-cpanel').classList.toggle('on'));
 $('txb-comm').addEventListener('click',()=>showPop($('txb-comm'),
  '<div class="kv"><span>Sale price</span><b>'+esc(head.price)+'</b></div>'+
  '<div class="kv"><span>Commission rate</span><b>1%</b></div>'+
  '<div class="kv"><span>Gross commission</span><b>'+esc(head.comm)+'</b></div>'+
  '<div class="kv"><span>Brokerage split</span><b>−$2,175</b></div>'+
  '<div class="kv"><span>Referral fee</span><b>—</b></div>'+
  '<div class="kv tot"><span>Your net</span><b>$12,325</b></div>',240));
 $('txb-split').addEventListener('click',()=>showPop($('txb-split'),
  '<div class="kv"><span>You (Agent)</span><b>85% · $12,325</b></div>'+
  '<div class="kv"><span>Brokerage</span><b>15% · $2,175</b></div>'+
  '<div class="kv"><span>Team lead</span><b>—</b></div>'+
  '<div class="kv"><span>Referral partner</span><b>—</b></div>'+
  '<div class="kv tot"><span>Gross commission</span><b>'+esc(head.comm)+'</b></div>',240));
})();
$('txd-more').addEventListener('click',()=>{
 showPop($('txd-more'),
  ['Duplicate transaction',head.priv?'Make visible':'Make private','Export transaction','Archive'].map(t=>'<div class="pi">'+t+'</div>').join('')+'<div class="pi" style="color:var(--status-red)">Delete</div>',200);
 const items=pop.querySelectorAll('.pi');
 if(items[1])items[1].addEventListener('click',()=>{hidePop();head.priv?askUnlockDetail():setDetailPrivacy(1)});
});
function setDetailPrivacy(v){
 head.priv=v?1:0;document.body.classList.toggle('txd-priv',!!head.priv);renderHead();
 if(window.setTxPrivacyByAddr)window.setTxPrivacyByAddr(head.addr,head.priv);
}
function askUnlockDetail(){
 const btn=$('txd-lock');
 const ask=window.askPrivacy||((t,d,c)=>Promise.resolve(window.confirm(t)));
 ask('Make this transaction visible?','“'+head.addr+'” will be visible to everyone on your team. You can make it private again from the ⋯ menu.','Make visible')
  .then(ok=>{
   if(!ok){btn.blur();return}
   btn.classList.add('unlocking');
   const wait=matchMedia('(prefers-reduced-motion: reduce)').matches?0:190;
   setTimeout(()=>setDetailPrivacy(0),wait);
  });
}
$('txd-lock').addEventListener('click',askUnlockDetail);
$('txd-envmore').addEventListener('click',()=>showPop($('txd-envmore'),'<div class="pi">Add pre-signed paperwork</div>',210));

/* ---- next action ---- */
function missingDetails(){let n=0;SECTIONS.forEach(s=>(s.fields||[]).forEach(f=>{if(f[2]===1&&!f[1])n++}));return n}
function renderNext(){
 const md=missingDetails();
 let txt=null,btn=null,act=null;
 /* next-action banner removed by request — tab counts still carry the signal */
 const strip=$('txd-next');
 renderRail();
 $('txd-detct').textContent=md;$('txd-detct').style.display=md?'':'none';
 $('txd-checkct').textContent=uploadsLeft;$('txd-checkct').style.display=uploadsLeft?'':'none';
 if(!txt){strip.classList.add('gone');setTimeout(()=>{strip.classList.add('hide');strip.classList.remove('gone')},200);return}
 strip.classList.remove('hide','gone');
 strip.classList.toggle('block',false);
 $('txd-nexttext').textContent=txt;$('txd-nextbtn').textContent=btn;$('txd-nextbtn').onclick=act;
 $('txd-detct').textContent=md;$('txd-detct').style.display=md?'':'none';
 $('txd-checkct').textContent=uploadsLeft;$('txd-checkct').style.display=uploadsLeft?'':'none';
}

/* ---- documents ---- */
const MISS={filled:0,progress:3,none:5};
function renderForms(){
 const all=forms.every(f=>f.c),n0=forms.filter(f=>f.c).length;
 const cb=(on,attr)=>'<span class="txd-cb'+(on?' on':'')+'" '+attr+'><svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg></span>';
 $('txd-forms').innerHTML='<div class="txd-selrow">'+cb(all,'data-call="1"')+'<span>Select all</span><span style="flex:1"></span>'+
  '<button class="lk ic" data-fdel="1" title="Delete selected" aria-label="Delete selected"'+(n0?'':' disabled')+'><svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></button>'+
  '<button class="lk ic act" data-fdl="1" title="Download selected" aria-label="Download selected"'+(n0?'':' disabled')+'><svg viewBox="0 0 24 24"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg></button></div>'+
 forms.map((f,i)=>{
  const m=MISS[f.s];
  return '<div class="txd-frow">'+cb(f.c,'data-c="'+i+'"')+
   '<div class="nm3" title="'+esc(f.n)+'">'+esc(f.n)+'</div>'+
   '<button class="txd-fill '+(m?'warn':'ok')+'" data-fv="'+i+'">'+(m?m+' missing':'Filled')+
   '<span class="vf">'+(m?'View &amp; fill':'Review')+'<svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></span></button>'+
   '<button class="txd-menu" data-fm="'+i+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></button></div>';
 }).join('');
 const n=forms.filter(f=>f.c).length;
 const b=$('txd-createenv');b.textContent='Create envelope ('+n+')';b.disabled=!n;
 const bar=$('txd-selbar');bar.classList.toggle('on',n>0);$('txd-selcount').textContent=n+' selected';
}
$('txd-forms').addEventListener('click',e=>{
 const sa=e.target.closest('[data-call]');if(sa){const all=forms.every(f=>f.c);forms.forEach(f=>f.c=!all);renderForms();return}
 const v=e.target.closest('[data-fv]');if(v){sonner('Opening form',forms[+v.dataset.fv].n);return}
 const c=e.target.closest('[data-c]');if(c){forms[+c.dataset.c].c=!forms[+c.dataset.c].c;renderForms();return}
 const m=e.target.closest('[data-fm]');if(m){showPop(m,['Convert to template','Download','Delete'].map(t=>'<div class="pi">'+t+'</div>').join(''),180);return}
});
$('txd-selclear').addEventListener('click',()=>{forms.forEach(f=>f.c=false);renderForms()});
$('txd-createenv').addEventListener('click',()=>{
 const picked=forms.filter(f=>f.c);if(!picked.length)return;
 envs.unshift({n:'Envelope '+(envs.length+1),s:'draft',date:'Today',open:1,sopen:1,recips:[{n:'Nora Collins (Seller)',e:'nora.collins@gmail.com',st:'wait',w:'Not sent yet'}],docs:picked.map(p=>p.n)});
 forms.forEach(f=>f.c=false);renderForms();renderEnvs();renderNext();goTab('envs');
});
function renderEnvs(){
 const counts={all:envs.length};envs.forEach(x=>counts[x.s]=(counts[x.s]||0)+1);
 const order=[['all','All'],['progress','In progress'],['draft','Draft'],['done','Completed'],['declined','Declined'],['voided','Voided'],['expired','Expired']];
 if(!counts[envFilter]&&envFilter!=='declined'&&envFilter!=='voided'&&envFilter!=='expired')envFilter='all';
 const PIN=['all','progress','draft','done'];
 const live=order.filter(o=>counts[o[0]]>0),vis=live.filter(o=>PIN.includes(o[0])),rest=order.filter(o=>!vis.includes(o));
 const chip=o=>'<button class="txd-chip'+(envFilter===o[0]?' on':'')+'" data-ef="'+o[0]+'">'+o[1]+'<span class="n">'+counts[o[0]]+'</span></button>';
 const hid=rest.find(o=>o[0]===envFilter);
 $('txd-envchips').innerHTML=vis.map(chip).join('')+(rest.length?'<span class="txd-moreg">'+
  '<button class="txd-chip txd-chipmore'+(hid?' on':'')+'" id="txd-envmoretab" aria-haspopup="menu" aria-expanded="false">'+(hid?hid[1]+'<span class="n">'+(counts[hid[0]]||0)+'</span>':'More')+
  '<svg class="chev" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>'+
  '<div class="txd-morepop" id="txd-envmorepop" hidden>'+rest.map(o=>'<button class="mi'+(envFilter===o[0]?' on':'')+(counts[o[0]]?'':' zero')+'" data-ef="'+o[0]+'">'+o[1]+'<span class="n">'+(counts[o[0]]||0)+'</span></button>').join('')+'</div></span>':'');
 $('txd-envchips').style.display=envs.length?'':'none';
 const list=envs.map((x,i)=>[x,i]).filter(x=>envFilter==='all'||x[0].s===envFilter);
 $('txd-envs').innerHTML=list.length?list.map(x=>envCard(x[0],x[1])).join(''):'<div class="txd-empty"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg><div class="e1">No envelopes yet</div><div class="e2">Select forms on the left and create an envelope.</div></div>';
}
const ICO_DL='<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 20h16"/></svg>';
const ICO_SIGN='<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
const ICO_SEND='<svg viewBox="0 0 24 24"><path d="M12 7v5l3 2"/><circle cx="12" cy="12" r="9"/></svg>';
function envCard(e,i){
 const done=e.recips.filter(r=>r.st==='ok').length,tot=e.recips.length;
 const cls=e.s;
 const badge=e.s==='done'?['green','All signatures complete']:e.s==='draft'?['gray','Draft — not sent']:e.s==='declined'?['red','Signature declined']:['amber','Other signatures pending'];
 const waiting=e.recips.filter(r=>r.st!=='ok');
 const mo=s=>String(s).replace(/\b(January|February|March|April|June|July|August|September|October|November|December)\b/g,m=>m.slice(0,3));
 const tag=e.s==='done'?['ok','All signed']:e.s==='draft'?['draft','Not sent']:e.s==='declined'?['red','Declined']:['wait','Waiting on '+waiting.map(r=>r.n.split(' ')[0]).join(', ')];
 const rail=e.s==='done'?'ok':e.s==='draft'?'draft':'wait';
 const avs='<span class="txd-avs">'+e.recips.map(r=>'<span class="av '+(r.st==='ok'?'ok':'wait')+'" title="'+esc(r.n)+' — '+esc(mo(r.w))+'">'+(r.st==='ok'?'<svg viewBox="0 0 24 24"><path d="m5 13 4 4L19 7"/></svg>':esc(r.n.trim()[0]))+'</span>').join('')+'</span>';
 return '<div class="txd-ecard '+cls+(e.sopen?'':' closed')+'">'+
  '<div class="ehd"><span class="d">'+esc(e.n)+'</span><span class="sub">'+esc(mo(e.date))+'</span>'+
   '<span class="n '+badge[0]+'">'+done+' of '+tot+' signed</span>'+
   '<button class="txd-menu" data-em="'+i+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></button></div>'+
  e.docs.map(d=>'<div class="txd-drow '+rail+'">'+
   '<span class="bd"><span class="dt2" title="'+esc(d)+'">'+esc(d)+'</span></span></div>').join('')+
  '<div class="txd-grp" data-st="'+i+'">Signature detail<span class="n">'+done+' of '+tot+'</span>'+
   '<span class="mi">Wrong email?</span>'+
   '<svg class="car" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></div>'+
  e.recips.map(r=>{
     const ok=r.st==='ok';
     const role=/agent/i.test(r.n)?'agent':/co-seller|co seller|cobuyer|co-buyer/i.test(r.n)?'coseller':/seller/i.test(r.n)?'seller':/buyer/i.test(r.n)?'buyer':'';
     return '<div class="txd-erow rcp '+(ok?'ok':'wait')+'"><span class="rail"></span>'+
      '<span class="b"><span class="p"><span class="av '+role+'">'+esc(r.n.trim()[0])+'</span>'+esc(r.n)+'</span><span class="s">'+esc(r.e)+'</span></span>'+
      '<span class="r '+(ok?'ok':'wait')+'">'+esc(mo(r.w))+'</span>'+
      '<button class="ed" data-ee="'+i+'" title="Edit email address"><svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button></div>';
   }).join('')+
  '<div class="txd-ef"><button class="txd-pb'+(e.s==='draft'?'':' sec')+'" data-ea="'+i+'">'+
   (e.s==='done'?ICO_DL:e.s==='draft'?ICO_SIGN:ICO_SEND)+
   '<span>'+(e.acted||(e.s==='done'?'Download':e.s==='draft'?'Fill &amp; sign':'Send reminder'))+'</span></button>'+
   '<span style="flex:1"></span>'+avs+'<span class="txd-tag '+tag[0]+'">'+esc(tag[1])+'</span></div></div>';
}
$('txd-envchips').addEventListener('click',e=>{
 const mb=e.target.closest('#txd-envmoretab');
 if(mb){const p=$('txd-envmorepop'),o=mb.getAttribute('aria-expanded')==='true';mb.setAttribute('aria-expanded',String(!o));p.hidden=o;return}
 const c=e.target.closest('[data-ef]');if(c){envFilter=c.dataset.ef;renderEnvs()}
});
document.addEventListener('click',e=>{if(e.target.closest('.txd-moreg'))return;const p=$('txd-envmorepop');if(p&&!p.hidden){p.hidden=true;$('txd-envmoretab').setAttribute('aria-expanded','false')}});
$('txd-envs').addEventListener('click',e=>{
 const st=e.target.closest('[data-st]');if(st){const en=envs[+st.dataset.st];en.sopen=en.sopen?0:1;st.closest('.txd-ecard').classList.toggle('closed',!en.sopen);return}
 const ee=e.target.closest('[data-ee]');if(ee){sonner('Edit email address','Update the recipient email before resending.');return}
 const a=e.target.closest('[data-ea]');
 if(a){const en=envs[+a.dataset.ea];if(en.s==='progress'){en.acted='Reminded';reminded=true;renderNext()}renderEnvs();return}
 const m=e.target.closest('[data-em]');if(m)showPop(m,['Void envelope','Download','View history'].map(t=>'<div class="pi">'+t+'</div>').join(''),180);
});

/* ---- unorganized files (Rechat parity: upload anything, file it later) ---- */
function renderUnorg(){
 $('txd-unorglist').innerHTML=unorg.length?unorg.map((f,i)=>
  '<div class="txd-row"><span class="nm" title="'+esc(f.n)+'">'+esc(f.n)+'</span>'+
   '<span class="txd-state" style="color:var(--neutral-500)">'+esc(f.src)+'</span>'+
   '<button class="txd-lbtn" data-file="'+i+'">File to checklist</button>'+
   '<button class="txd-menu" data-um="'+i+'"><svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></button></div>').join('')
  :'<div class="txd-drop" id="txd-unorgdrop"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5-5 5 5M12 5v13"/></svg>'+
   '<div class="d1">Drop anything that doesn\'t have a checklist slot yet</div>'+
   '<div class="d2">Upload here, or email it to the address above — file it to the checklist later.</div></div>';
}
$('txd-unorgup').addEventListener('click',()=>{
 unorg.unshift({n:'Scanned addendum '+(unorg.length+1)+'.pdf',src:'Uploaded just now'});
 renderUnorg();
});
$('txd-unorglist').addEventListener('click',e=>{
 if(e.target.closest('#txd-unorgdrop')){$('txd-unorgup').click();return}
 const f=e.target.closest('[data-file]');
 if(f){const it=unorg.splice(+f.dataset.file,1)[0];renderUnorg();sonner('Filed to checklist',it.n+' moved into Auditing dashboard');goTab('check');return}
 const m=e.target.closest('[data-um]');
 if(m)showPop(m,['Rename','Download','Delete'].map(t=>'<div class="pi">'+t+'</div>').join(''),160);
});
$('txd-mailcopy').addEventListener('click',()=>{
 if(navigator.clipboard)navigator.clipboard.writeText(DEALMAIL).catch(()=>{});
 sonner('Address copied','Anything emailed here lands in Unorganized files');
});

/* ---- checklist ---- */
function renderGroups(q){
 q=(q||'').toLowerCase();
 $('txd-groups').innerHTML=CL.map((g,gi)=>{
  const appr=g.items.filter(i=>i[1]==='approved').length;
  let items=g.items.filter(i=>!q||i[0].toLowerCase().includes(q));
  const shown=items.slice(0,12);
  return '<div class="txd-grp2'+((gi===openGroup||q)?' open':'')+'" data-g="'+gi+'">'+
   '<div class="txd-gh"><svg class="cv" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg><span class="gn">'+g.n+'</span><span class="gp">'+appr+' of '+g.total+'</span></div>'+
   '<div class="txd-gb2">'+shown.map((it,ii)=>{
     const st=CS[it[1]],cm=CMT[gi+'-'+ii];
     const nc=(ITC[gi+'-'+ii]||[]).length||cm||0;
     return '<div class="txd-row" data-item="'+gi+'-'+ii+'"><span class="nm">'+esc(it[0])+'</span>'+
      '<span class="txd-doc" data-open="'+gi+'-'+ii+'">'+(it[2]?it[2]+' doc'+(it[2]>1?'s':''):'No documents')+' \u203a</span>'+
      '<span class="txd-state" style="min-width:92px;justify-content:flex-end"><i style="background:'+st[1]+'"></i>'+st[0]+'</span>'+
      '<button class="txd-ibtn" data-cmt="'+gi+'-'+ii+'" title="'+(nc?nc+' comment'+(nc>1?'s':''):'Add comment')+'" aria-label="'+(nc?nc+' comments':'Add comment')+'"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'+(nc?'<i class="n">'+nc+'</i>':'')+'</button>'+
      '<button class="txd-ibtn" data-up="'+gi+'-'+ii+'" title="Upload" aria-label="Upload"><svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5-5 5 5M12 5v13"/></svg></button>'+
      '<button class="txd-ibtn" data-as="'+gi+'-'+ii+'" title="Assign" aria-label="Assign"><svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg></button></div>';
    }).join('')+
    (items.length>shown.length?'<div class="txd-showall">Show all '+g.total+'</div>':'')+
   '</div></div>';
 }).join('');
}
function doUpload(key){
 const [gi,ii]=key.split('-').map(Number),it=CL[gi].items[ii];
 seedItem(key);
 IDOCS[key]=IDOCS[key].concat([{n:it[0].replace(/[^A-Za-z0-9 ()]/g,'')+'.pdf',m:'Uploaded just now \u00b7 You'}]);
 if(it[1]==='missing'){it[1]='progress';uploadsLeft=Math.max(0,uploadsLeft-1)}
 it[2]=(it[2]||0)+1;
 renderGroups($('txd-clsearch').value);renderNext();
 if(curItem===key)renderItem();
 sonner('Document uploaded',it[0]);
}
function doAssign(anchor,key){
 showPop(anchor,['Dillion Dennis \u00b7 T.C.','Ashuthosh iOSacc \u00b7 Agent','milan seller \u00b7 Seller','Escrow officer'].map(t=>'<div class="pi" data-assignee="'+t.split(' \u00b7 ')[0]+'">'+t+'</div>').join(''),240);
 const pop=document.querySelector('.txd-pop');
 if(pop)pop.addEventListener('click',ev=>{const p=ev.target.closest('[data-assignee]');if(!p)return;
  IASG[key]=p.dataset.assignee;pop.remove();
  if(curItem===key)renderItem();
  sonner('Assigned',p.dataset.assignee+' will be asked for this document')});
}
$('txd-groups').addEventListener('click',e=>{
 const up=e.target.closest('[data-up]');
 if(up){doUpload(up.dataset.up);return}
 const as=e.target.closest('[data-as]');
 if(as){doAssign(as,as.dataset.as);return}
 const cmb=e.target.closest('[data-cmt]');
 if(cmb){openItem(cmb.dataset.cmt,true);return}
 const op=e.target.closest('[data-open]');
 if(op){openItem(op.dataset.open);return}
 const nm=e.target.closest('.nm');
 if(nm&&nm.parentElement.dataset.item){openItem(nm.parentElement.dataset.item);return}
 const h=e.target.closest('.txd-gh');
 if(h){const g=h.parentElement;openGroup=+g.dataset.g;g.classList.toggle('open');}
});
$('txd-clsearch').addEventListener('input',e=>renderGroups(e.target.value));
$('txd-clsel').addEventListener('click',()=>showPop($('txd-clsel'),['Nor Cal Standard Residential Listing','So Cal Residential Listing','Buyer representation','Lease'].map((t,i)=>'<div class="pi'+(i?'':' cur')+'">'+t+'<span class="chk">✓</span></div>').join(''),280));

/* ---- checklist item side panel ---- */
const IDOCS={},IASG={},ITC={'0-2':[['Dillion Dennis','Seller signed copy is missing page 3.','2d']]};
let curItem=null;
function itemOf(key){const [gi,ii]=key.split('-').map(Number);return {g:CL[gi],it:CL[gi].items[ii]}}
function seedItem(key){
 const {it}=itemOf(key);
 if(!IDOCS[key]){
  const n=it[2]||0;IDOCS[key]=[];
  for(let k=0;k<n;k++)IDOCS[key].push({n:it[0].replace(/[^A-Za-z0-9 ()]/g,'').slice(0,40)+(n>1?' ('+(k+1)+')':'')+'.pdf',m:'Uploaded '+(k+2)+'d ago \u00b7 Dillion Dennis'});
 }
 if(!ITC[key]){
  const c=CMT[key]||0;ITC[key]=[];
  for(let k=0;k<c;k++)ITC[key].push(['Dillion Dennis','Please double-check this before I approve it.',(k+1)+'d']);
 }
 return IDOCS[key];
}
function renderItem(){
 if(!curItem)return;
 seedItem(curItem);
 const {g,it}=itemOf(curItem),files=IDOCS[curItem]||[],cs=ITC[curItem]||[];
 $('txd-ititle').textContent=it[0];
 $('txd-isub').innerHTML=CS[it[1]][0]+' \u00b7 '+esc(g.n)+(IASG[curItem]?' \u00b7 assigned to '+esc(IASG[curItem]):'');
 $('txd-ipbody').innerHTML=
  '<div class="txd-isec">Documents</div>'+
  (files.length?files.map(f=>'<div class="txd-ifile"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg><span>'+esc(f.n)+'</span><span class="mt">'+esc(f.m)+'</span></div>').join('')
   :'<div class="txd-iempty"><span class="ic"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></span>No documents yet \u2014 upload one or assign it to someone.</div>')+
  '<div class="txd-isec">Comments</div>'+
  (cs.length?cs.map(c=>'<div class="txd-cm"><span class="txd-av" style="background:var(--neutral-100);color:var(--neutral-600)">'+ini(c[0])+'</span><div class="bd"><div class="l1"><span class="nm3">'+esc(c[0])+'</span><span class="tm">'+c[2]+'</span></div><div class="tx">'+esc(c[1])+'</div></div></div>').join('')
   :'<div class="txd-iempty" style="padding:18px">No comments yet.</div>');
}
function openItem(key,focusComment){
 curItem=key;renderItem();
 $('txd-ipanel').classList.add('on');$('txd-iscrim').classList.add('on');
 if(focusComment)setTimeout(()=>$('txd-iinput').focus(),180);
}
function closeItem(){curItem=null;$('txd-ipanel').classList.remove('on');$('txd-iscrim').classList.remove('on')}
$('txd-iclose').addEventListener('click',closeItem);
$('txd-iscrim').addEventListener('click',closeItem);
$('txd-iup').addEventListener('click',()=>curItem&&doUpload(curItem));
$('txd-iassign').addEventListener('click',e=>curItem&&doAssign(e.currentTarget,curItem));
$('txd-isend').addEventListener('click',()=>{
 const i=$('txd-iinput');if(!curItem||!i.value.trim())return;
 ITC[curItem]=(ITC[curItem]||[]).concat([['Ashuthosh iOSacc',i.value.trim(),'now']]);
 i.value='';renderItem();renderGroups($('txd-clsearch').value);
});
$('txd-iinput').addEventListener('keydown',e=>{if(e.key==='Enter')$('txd-isend').click()});

/* ---- details ---- */
function fieldRow(label,val,flag,path){
 const amber=flag===1&&!val;
 const ro=flag==='ro';
 return '<div class="txd-fr"><span class="fl">'+(amber?'<i></i>':'')+esc(label)+'</span>'+
  '<span class="fv'+(val?'':' ph')+(ro?' ro':'')+'" '+(ro?'':'data-p="'+path+'"')+'>'+(val?esc(val):'Set value…')+'<span class="txd-saved">Saved</span></span></div>';
}
function renderSections(){
 $('txd-sections').innerHTML=SECTIONS.map((s,si)=>{
  let body='';
  if(s.fields)body=s.fields.map((f,fi)=>fieldRow(f[0],f[1],f[2],si+'.f.'+fi)).join('');
  if(s.people)body=s.people.map((p,pi)=>'<div class="txd-sub">'+p[0]+'</div>'+p[1].map((f,fi)=>fieldRow(f[0],f[1],0,si+'.p.'+pi+'.'+fi)).join('')).join('');
  if(s.contacts)body=s.contacts.map((c,ci)=>c[1]
   ? fieldRow(c[0],c[1],0,si+'.c.'+ci)
   : '<div class="txd-ghostrow"><span class="fl" style="color:var(--neutral-500)">'+c[0]+'</span><span style="color:var(--neutral-400)">— required, not added</span><button class="txd-lbtn" data-addc="'+si+'.'+ci+'" style="margin-left:auto">Add</button></div>').join('');
  return '<div class="txd-sec" id="txd-sec-'+s.id+'"><div class="txd-sech">'+s.t+'</div><div class="txd-fgrid">'+body+'</div></div>';
 }).join('')+'<div style="height:24px"></div>';
}
function setVal(path,v){
 const p=path.split('.'),s=SECTIONS[+p[0]];
 if(p[1]==='f')s.fields[+p[2]][1]=v;
 else if(p[1]==='p')s.people[+p[2]][1][+p[3]][1]=v;
 else s.contacts[+p[2]][1]=v;
}
$('txd-sections').addEventListener('click',e=>{
 const add=e.target.closest('[data-addc]');
 if(add){const [si,ci]=add.dataset.addc.split('.').map(Number);SECTIONS[si].contacts[ci][1]='';renderSections();return}
 const fv=e.target.closest('.fv[data-p]');
 if(!fv||fv.querySelector('input'))return;
 const path=fv.dataset.p,cur=fv.classList.contains('ph')?'':fv.firstChild.textContent;
 fv.innerHTML='<input value="'+esc(cur)+'">';
 const i=fv.querySelector('input');i.focus();i.select();
 const done=()=>{
  const v=i.value.trim();setVal(path,v);
  fv.classList.toggle('ph',!v);
  fv.innerHTML=(v?esc(v):'Set value…')+'<span class="txd-saved on">Saved</span>';
  const sv=fv.querySelector('.txd-saved');
  setTimeout(()=>{sv.classList.remove('on');sv.classList.add('fade');sv.style.opacity='0'},900);
  const row=fv.closest('.txd-fr'),dot=row.querySelector('.fl i');if(v&&dot)dot.remove();
  renderNext();
 };
 i.addEventListener('keydown',ev=>{if(ev.key==='Enter')i.blur();if(ev.key==='Escape'){renderSections()}});
 i.addEventListener('blur',done,{once:true});
});
$('txd-detnav').addEventListener('click',e=>{
 const a=e.target.closest('[data-s]');if(!a)return;
 $('txd-detnav').querySelectorAll('a').forEach(x=>x.classList.toggle('on',x===a));
 const el=document.getElementById('txd-sec-'+a.dataset.s),sc=$('txd-scroll');
 sc.scrollTo({top:el.offsetTop-70,behavior:'smooth'});
});

/* ---- comments ---- */
const comments=[
 ['Priya Raman','Escrow opened. I\'ll add the prelim once title sends it.','2h'],
 ['Ashutosh iOSacc','Nora is signing the disclosure packet tonight.','yesterday'],
 ['Marta Chen','Square footage disclosure is still missing from the listing checklist.','2d']
];
function renderComments(){
 $('txd-cpbody').innerHTML=comments.map(c=>'<div class="txd-cm"><span class="txd-av" style="background:var(--neutral-100);color:var(--neutral-600)">'+ini(c[0])+'</span>'+
  '<div class="bd"><div class="l1"><span class="nm3">'+esc(c[0])+'</span><span class="tm">'+c[2]+'</span></div><div class="tx">'+esc(c[1])+'</div></div></div>').join('');
}
$('txd-comments').addEventListener('click',()=>$('txd-cpanel').classList.toggle('on'));
$('txd-cclose').addEventListener('click',()=>$('txd-cpanel').classList.remove('on'));
$('txd-csend').addEventListener('click',()=>{
 const i=$('txd-cinput');if(!i.value.trim())return;
 comments.unshift([head.ag,i.value.trim(),'now']);i.value='';renderComments();
});
$('txd-cinput').addEventListener('keydown',e=>{if(e.key==='Enter')$('txd-csend').click()});

/* ---- tabs ---- */
function openDetails(o){$('txd-tab-details').classList.toggle('on',o!==false);$('txd-dscrim').classList.toggle('on',o!==false)}
function goTab(t){
 if(t==='details'){openDetails(true);return}
 P.querySelectorAll('.txd-tb').forEach(x=>x.classList.toggle('on',x.dataset.t===t));
 ['docs','envs','check'].forEach(k=>$('txd-tab-'+k).style.display=k===t?'':'none');
 /* one envelopes card, two homes — rides along with the active tab */
 const ec=$('txd-envcard');
 if(ec){if(t==='envs'){$('txd-envcols').appendChild(ec);ec.style.gridColumn='1/-1'}else if(t==='docs'&&ec.parentElement!==$('txd-doccols')){$('txd-doccols').appendChild(ec);ec.style.gridColumn=''}}
 $('txd-selbar').style.display=t==='docs'?'':'none';
 $('txd-scroll').scrollTop=0;
}
P.querySelectorAll('.txd-tb').forEach(b=>b.addEventListener('click',()=>goTab(b.dataset.t)));
$('txd-dtab').addEventListener('click',()=>openDetails(true));
$('txd-dclose').addEventListener('click',()=>openDetails(false));
$('txd-dscrim').addEventListener('click',()=>openDetails(false));

/* ---- open / close ---- */
let melCloned=false;
function cloneMel(){
 if(melCloned)return;melCloned=true;
 const fade=LIST.querySelector('.melfade'),bar=LIST.querySelector('.melbar');
 if(fade)P.appendChild(fade.cloneNode(true));
 if(bar)P.appendChild(bar.cloneNode(true));
}
window.openTxDetail=function(el){
 try{const d=JSON.parse(decodeURIComponent(el.dataset.txd));Object.assign(head,d)}catch(err){}
 if(head.price==='—'||!head.price)head.price='$1,450,000';
 if(head.comm==='—'||!head.comm)head.comm='$14,500';
 if(!head.coe||head.coe==='—')head.coe='Aug 12';
 if(!head.client||head.client==='—')head.client='Nora Morris';
 SECTIONS[0].fields[0][1]=head.addr+(head.city?', '+head.city:'');
 SECTIONS[3].fields[5][1]=head.price;
 SECTIONS[3].fields[3][1]=head.coe;
 SECTIONS[3].fields[2][1]=(head.acc&&head.acc!=='—')?head.acc:'Jul 23';
 SECTIONS[1].people[1][1][0][1]=head.client;
 cloneMel();
 LIST.style.display='none';P.classList.add('on');
 if(window.__applyTxState)window.__applyTxState(window.__txState);
 renderHead();renderForms();renderEnvs();renderUnorg();renderGroups();renderSections();renderComments();renderNext();goTab('docs');openDetails(false);
};
$('txd-switchsel').addEventListener('change',e=>window.__applyTxState(e.target.value));
$('txd-rename').addEventListener('click',()=>editPop($('txd-title'),head.addr,v=>{head.addr=v.trim()||head.addr;renderHead()}));
/* transaction-scoped Tasks button + notifications bell in the title row */
$('txd-tkbtn').addEventListener('click',()=>{if(window.openTasksSheet)openTasksSheet(head.addr)});
(function(){
 const bell=$('txd-bell'),panel=$('txd-npanel'),scrim=$('txd-nscrim'),body=$('txd-npbody');
 const sync=()=>{const left=body.querySelectorAll('.txd-nrow.unread').length;bell.dataset.unread=left;bell.setAttribute('aria-label','Notifications on this transaction, '+left+' unread')};
 const open=()=>{panel.classList.add('open');scrim.classList.add('open');bell.classList.add('open');bell.setAttribute('aria-expanded','true')};
 const close=()=>{panel.classList.remove('open');scrim.classList.remove('open');bell.classList.remove('open');bell.setAttribute('aria-expanded','false')};
 bell.addEventListener('click',e=>{e.stopPropagation();panel.classList.contains('open')?close():open()});
 $('txd-nclose').addEventListener('click',close);
 scrim.addEventListener('click',close);
 $('txd-nmarkall').addEventListener('click',()=>{body.querySelectorAll('.txd-nrow.unread').forEach(r=>r.classList.remove('unread'));sync()});
 body.addEventListener('click',e=>{const row=e.target.closest('.txd-nrow');if(!row)return;row.classList.remove('unread');sync()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))close()});
})();
$('txd-edit').addEventListener('click',()=>goTab('details'));
$('txd-accept').addEventListener('click',()=>{head.cx=true;renderHead();goTab('details');sonner('Contract accepted','Fill in the contract details \u2014 cancel listing is replaced by cancel contract')});
$('txd-cancell').addEventListener('click',()=>sonner('Cancel listing','This would ask you to confirm before cancelling the listing'));
$('txd-cancelc').addEventListener('click',()=>sonner('Cancel contract','This would ask you to confirm before cancelling the contract'));
$('txd-dl').addEventListener('click',()=>sonner('Downloading CDA','Commission disbursement authorisation for this transaction'));
$('txd-back').addEventListener('click',()=>{P.classList.remove('on');$('txd-cpanel').classList.remove('on');closeItem();LIST.style.display=''});
$('txd-sbtoggle').addEventListener('click',()=>{document.querySelector('.app').classList.toggle('collapsed');if(window.updateRail)setTimeout(updateRail,200)});
})();
