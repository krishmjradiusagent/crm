(function(){
  var PAGE={
    transactions:{icon:'transactions',steps:['Loading transactions','Loading filters and saved views','Checking approvals and documents']},
    clients:{icon:'clients',steps:['Loading clients','Loading filters','Sorting by last touch']},
    mywork:{icon:'mywork',steps:['Loading tasks','Loading appointments','Checking what is due today']},
    mel:{icon:'mel',steps:['Waking Mel','Loading your recent threads']}
  };
  var TAB={
    transactions:{'All':'Loading all transactions','Active listings':'Loading active listings','Pending':'Loading pending transactions',
      'Closing soon':'Loading closings','Closed':'Loading closed transactions','Needs attention':'Loading approvals',
      'Referrals':'Loading referrals','Drafts':'Loading drafts'},
    clients:{},mywork:{},mel:{}
  };
  var PAGE_EL={mywork:'mw-page',clients:'cl-page',transactions:'tx-page',mel:'mel-page'};
  var busy=false, booting=true, last=null;

  var SV=function(p){return '<svg viewBox="0 0 24 24">'+p+'</svg>'};
  var ICONS=[
    {key:'mywork',svg:SV('<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M2 12h20"/>')},
    {key:'search',svg:SV('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>')},
    {key:'clients',svg:SV('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>')},
    {key:'transactions',svg:SV('<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>')},
    {key:'reporting',svg:SV('<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>')},
    {key:'agents',svg:SV('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M15 8h3M15 12h3M6 16c.5-1.5 1.8-2 3-2s2.5.5 3 2"/>')},
    {key:'mel',svg:SV('<path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5"/><circle cx="12" cy="12" r="3.4"/>')}
  ];
  function icons(){return ICONS.slice()}
  function pick(list,key){for(var i=0;i<list.length;i++)if(list[i].key===key)return i;return 3}
  /* ring shows the other rails; center shows the page being loaded */

  function cluster(w,list,centerIdx){
    var h=Math.round(w*1.155), g=12, lr=w+g, dx=Math.round(lr/2), dy=Math.round(h*.75)+g;
    var ring=[[-lr,0],[-dx,-dy],[dx,-dy],[lr,0],[dx,dy],[-dx,dy]];
    var faint=[[-lr*2,0],[lr*2,0],[-lr*1.5,-dy],[lr*1.5,-dy],[-lr*1.5,dy],[lr*1.5,dy],[-lr,-dy*2],[lr,-dy*2],[-lr,dy*2],[lr,dy*2],[0,-dy*2],[0,dy*2]];
    var cw=lr*2+w, ch=dy*4+h, html='';
    faint.forEach(function(p,i){
      html+='<div class="rlhex rlhex--faint" style="--x:'+p[0]+'px;--y:'+p[1]+'px;--d:'+(i*26)+'ms"></div>';
    });
    var order=[]; // ring hexes carry the other sidebar icons
    for(var i=0,k=0;i<list.length;i++){ if(i===centerIdx)continue; order.push(list[i]); }
    ring.forEach(function(p,i){
      var it=order[i%order.length];
      html+='<div class="rlhex" data-ring="'+i+'" style="--x:'+p[0]+'px;--y:'+p[1]+'px;--d:'+(120+i*55)+'ms">'+
        '<span class="rlico">'+(it?it.svg:'')+'</span></div>';
    });
    html+='<div class="rlhex rlhex--c" style="--x:0px;--y:0px;--d:60ms"><span class="rlico" data-c>'+
      (list[centerIdx]?list[centerIdx].svg:'')+'</span></div>';
    return '<div class="rlcluster" style="--w:'+w+'px;--h:'+h+'px;--ic:'+Math.round(w*.34)+'px;--cw:'+cw+'px;--ch:'+ch+'px">'+html+'</div>';
  }

  function show(o){
    if(busy)return; busy=true;
    var list=icons();
    var el=document.createElement('div');
    el.className='rload rload--'+o.mode;
    if(o.rect){
      el.style.top=o.rect.top+'px';el.style.left=o.rect.left+'px';
      el.style.width=o.rect.width+'px';el.style.height=o.rect.height+'px';
    }
    var brand='';
    if(o.mode==='boot'){
      var w=document.querySelector('.sidebar .logo img');
      if(w)brand='<div class="rlbrand">'+w.outerHTML+'</div>';
    }
    var ci=pick(list,o.icon);
    el.innerHTML=brand+cluster(o.hex,list,ci)+
      '<div class="rlstatus">'+o.steps[0]+'</div>';
    document.body.appendChild(el);
    var status=el.querySelector('.rlstatus');
    var rings=el.querySelectorAll('.rlhex[data-ring]');
    var n=o.steps.length, slice=o.dur/n, timers=[];
    rings[0]&&rings[0].classList.add('on');
    for(var i=1;i<n;i++)(function(i){
      timers.push(setTimeout(function(){
        status.textContent=o.steps[i];
        status.classList.remove('sw');void status.offsetWidth;status.classList.add('sw');
        rings.forEach(function(r,ri){r.classList.toggle('on',ri===i%rings.length)});
      },slice*i));
    })(i);
    timers.push(setTimeout(function(){
      el.classList.add('out');
      setTimeout(function(){el.remove();busy=false},300);
    },o.dur));
  }

  function pageLoader(p){
    var cfg=PAGE[p]; if(!cfg)return;
    var host=document.getElementById(PAGE_EL[p]);
    var r=host?host.getBoundingClientRect():null;
    if(!r||!r.width)return;
    show({mode:'page',hex:68,icon:cfg.icon,steps:cfg.steps,dur:1500,
      rect:{top:r.top,left:r.left,width:r.width,height:r.height}});
  }
  function tabLoader(p,label){
    var cfg=PAGE[p]; if(!cfg)return;
    var host=document.getElementById(PAGE_EL[p]);
    var r=host?host.getBoundingClientRect():null;
    if(!r||!r.width)return;
    var first=(TAB[p]&&TAB[p][label])||('Loading '+String(label||'').toLowerCase());
    show({mode:'page',hex:52,icon:cfg.icon,steps:[first,'Applying filters'],dur:900,
      rect:{top:r.top,left:r.left,width:r.width,height:r.height}});
  }

  /* boot: covers the whole app, sidebar included */
  show({mode:'boot',hex:76,icon:'transactions',dur:4400,
    steps:['Loading your workspace','Loading navigation','Applying your theme','Syncing clients and deals','Almost ready']});
  setTimeout(function(){booting=false;last=document.body.getAttribute('data-page')},4600);

  document.addEventListener('click',function(e){
    if(booting)return;
    var nav=e.target.closest&&e.target.closest('.sidebar > .nav[data-page]');
    if(nav){var p=nav.getAttribute('data-page'); if(p!==last){last=p;setTimeout(function(){pageLoader(p)},0)} return}
    var tb=e.target.closest&&e.target.closest('.tab[data-tab]');
    if(tb&&tb.closest('main.content')){
      var p2=document.body.getAttribute('data-page');
      if(!tb.classList.contains('active'))setTimeout(function(){tabLoader(p2,tb.getAttribute('data-tab'))},0);
    }
  },true);

  var orig=window.showPage;
  if(typeof orig==='function'){
    window.showPage=function(p){orig(p); if(!booting&&p!==last){last=p;pageLoader(p)}};
  }
})();
