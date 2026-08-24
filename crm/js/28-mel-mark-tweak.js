/* Mel mark tweak — swaps every Mel avatar between the infinity mark and the Radius orb. */
(function(){
  var MARKS = {infinity:'assets/mel-icon.svg', orb:'assets/mel-orb.svg'};
  var KEY = 'radius-mel-mark';
  function cur(){ try{ return localStorage.getItem(KEY)==='orb' ? 'orb' : 'infinity'; }catch(e){ return 'infinity'; } }
  function isMel(img){
    if(img.closest && img.closest('.markpick')) return false;
    if(img.dataset && img.dataset.melMark) return true;
    var s = img.getAttribute('src')||'';
    return /mel-icon\.svg|mel-orb\.svg/.test(s) || img.classList.contains('melmark');
  }
  function swap(img, v){
    img.dataset.melMark = '1';
    if(img.getAttribute('src') !== MARKS[v]) img.setAttribute('src', MARKS[v]);
  }
  function applyAll(v){
    document.querySelectorAll('img').forEach(function(img){ if(isMel(img)) swap(img, v); });
    document.querySelectorAll('.markopt').forEach(function(b){ b.classList.toggle('is-on', b.dataset.mark===v); });
    document.body.classList.toggle('mel-orb', v==='orb');
  }
  document.addEventListener('click', function(e){
    var sMenu = document.getElementById('pke-schedmenu');
    var sModal = document.getElementById('pke-schedmodal');
    if(e.target.closest && e.target.closest('#pke-sendmenu')){
      e.stopPropagation();
      if(sMenu){ sMenu.classList.toggle('open'); }
      return;
    }
    var schedItem = e.target.closest && e.target.closest('.pkeschedmenu .itm');
    if(schedItem){
      var kind = schedItem.dataset.schedule;
      if(sMenu) sMenu.classList.remove('open');
      if(kind === 'custom'){
        if(sModal){
          var now = new Date();
          var d = document.getElementById('pke-sdate'), t = document.getElementById('pke-stime');
          if(d && !d.value){ var iso = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,10); d.value = iso; }
          if(t && !t.value){ t.value = '09:00'; }
          sModal.classList.add('open');
        }
      } else {
        if(window.sonner) sonner('Post scheduled', schedItem.textContent.replace(/\s+/g,' ').trim());
      }
      return;
    }
    if(sMenu && sMenu.classList.contains('open') && !e.target.closest('#pke-schedmenu') && !e.target.closest('#pke-sendmenu')){
      sMenu.classList.remove('open');
    }
    if(e.target.closest && (e.target.closest('#pke-schedclose') || e.target.closest('#pke-schedcancel') || e.target.closest('.pkeschedscrim'))){
      if(sModal) sModal.classList.remove('open');
    }
    if(e.target.closest && e.target.closest('#pke-schedgo')){
      var dv = document.getElementById('pke-sdate'), tv = document.getElementById('pke-stime');
      var when = (dv && dv.value ? dv.value : '') + (tv && tv.value ? ' \u00b7 ' + tv.value : '');
      if(window.sonner) sonner('Post scheduled', when || 'Choose a date and time');
      if(sModal) sModal.classList.remove('open');
    }
    if(e.target.closest && e.target.closest('#pke-sendnow')){
      if(window.sonner) sonner('Sent', 'Post published to Instagram');
    }
    if(e.target.closest && e.target.closest('#pke-sbtoggle')){
      var app = document.querySelector('.app');
      if(app){ app.classList.toggle('collapsed'); }
    }
    if(e.target.closest && e.target.closest('#ms-navstudio')){
      var app2 = document.querySelector('.app');
      if(app2){ app2.classList.add('collapsed'); }
    }
    if(e.target.closest && (e.target.closest('.sidebar > .mel') || e.target.closest('.sidebar .melchev'))){
      var appMel = document.querySelector('.app');
      if(appMel){ appMel.classList.add('collapsed'); }
    }
    if(e.target.closest && e.target.closest('.sidebar .nav[data-page]')){
      var app3 = document.querySelector('.app');
      if(app3){ app3.classList.remove('collapsed'); }
    }
    if(e.target.closest && e.target.closest('#pke-close')){
      var edit = document.getElementById('pk-edit'); var page = document.querySelector('.melpage');
      if(edit){ edit.classList.remove('open','gen','manual','dirty'); }
      if(page){ page.classList.remove('pkediton'); page.classList.add('packeton'); }
    }
    if(e.target.closest && (e.target.closest('#pke-shclose') || e.target.closest('#pke-shexpand'))){
      var ed = document.getElementById('pk-edit');
      if(ed){ ed.classList.toggle('side-collapsed'); }
    }
    var b = e.target.closest && e.target.closest('.markopt');
    if(!b) return;
    var v = b.dataset.mark;
    try{ localStorage.setItem(KEY, v); }catch(err){}
    applyAll(v);
  });
  new MutationObserver(function(ms){
    var v = cur();
    if(v === 'infinity') return;
    ms.forEach(function(m){ m.addedNodes.forEach(function(n){
      if(n.nodeType !== 1) return;
      if(n.tagName === 'IMG'){ if(isMel(n)) swap(n, v); return; }
      if(n.querySelectorAll) n.querySelectorAll('img').forEach(function(img){ if(isMel(img)) swap(img, v); });
    }); });
  }).observe(document.body, {childList:true, subtree:true});
  applyAll(cur());
})();
