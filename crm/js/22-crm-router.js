(function(){
  const pages={mywork:'mw-page',clients:'cl-page',transactions:'tx-page',mel:'mel-page'};
  function showPage(p){
    const txd=document.getElementById('txd-page');
    if(txd)txd.classList.remove('on');
    Object.entries(pages).forEach(([k,id])=>{
      const el=document.getElementById(id); if(el) el.style.display = (k===p)?'flex':'none';
    });
    document.body.classList.toggle('melopen', p==='mel');
    document.querySelectorAll('.sidebar > .nav').forEach(n=>n.classList.toggle('active', n.dataset.page===p));
    document.body.setAttribute('data-page',p);
    /* both pages compute sticky-rail geometry off offsetWidth, which is 0 while hidden */
    requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));
  }
  function syncTweakRows(p){
    document.querySelectorAll('.twk-row[data-only]').forEach(r=>{
      r.style.display = (r.dataset.only===p)?'':'none';
    });
  }
  const _sp=showPage; showPage=function(p){_sp(p);syncTweakRows(p)};
  window.showPage=showPage;
  document.querySelectorAll('.sidebar > .nav[data-page]').forEach(n=>{
    n.addEventListener('click',()=>showPage(n.dataset.page));
  });
  /* header Tasks pill button in tx phead — opens the DS side sheet, not a page */
  const tkBtn=document.getElementById('tx-tkbtn');
  if(tkBtn)tkBtn.addEventListener('click',()=>{if(window.openTasksSheet)openTasksSheet();});
  showPage('transactions');
})();
