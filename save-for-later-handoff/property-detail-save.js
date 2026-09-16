/* Property detail Save for later logic.
   Extracted from CRM/index.html lines ~22505-22603.
   Depends on window.psSaved from saved-share.js. */

(function(){
  const page=document.getElementById('pd-page');
  const list=document.getElementById('ps-page');
  const back=document.getElementById('pd-back');
  if(!page||!list||!back){console.warn('[property-detail] missing #pd-page, #ps-page or #pd-back');return;}
  const saveBtn=document.getElementById('pd-save');
  let current=null;

  function syncSaveBtn(){
    if(!saveBtn||!window.psSaved)return;
    const on=!!(current&&window.psSaved.has(current.id));
    saveBtn.classList.toggle('on',on);
    saveBtn.setAttribute('aria-pressed',on?'true':'false');
    saveBtn.querySelector('.lb').textContent=on?'Saved for later':'Save for later';
    saveBtn.querySelector('i').className=on?'ph ph-check':'ph ph-bookmark-simple';
  }

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
    if(window.psSaved&&window.psSaved.list().length){retireHint();return;}
    hint.hidden=false;
  }
  if(hint)document.getElementById('pd-savehintx').addEventListener('click',retireHint);
  if(saveBtn){
    if(!window.psSaved){console.warn('[property-detail] window.psSaved missing - save button disabled');saveBtn.disabled=true;}
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
  window.openPropertyDetail=function(prop){
    if(!prop||!prop.id){console.warn('[property-detail] openPropertyDetail() called without a property');return;}
    current={id:prop.id,title:prop.title,price:prop.price};
    syncSaveBtn();
    openPd();
  };

  document.querySelectorAll('#ps-page .ps-card[data-ps-id]').forEach(card=>{
    card.addEventListener('click',e=>{
      if(e.target.closest('.ps-select'))return;
      current={id:card.dataset.psId,title:card.dataset.psTitle,price:card.dataset.psPrice};
      syncSaveBtn();
      openPd();
    });
  });
  back.addEventListener('click',closePd);
  document.querySelectorAll('.sidebar > .nav[data-page]').forEach(n=>n.addEventListener('click',closePd));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&page.classList.contains('on'))closePd();});
})();
