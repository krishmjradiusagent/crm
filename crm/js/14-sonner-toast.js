window.sonner=function(title,desc){
  let w=document.querySelector('.sonner');
  if(!w){w=document.createElement('div');w.className='sonner';document.body.appendChild(w)}
  const t=document.createElement('div');t.className='snr';
  t.innerHTML='<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg><div><div class="snrt"></div><div class="snrd"></div></div><span class="snrx">✕</span>';
  t.querySelector('.snrt').textContent=title;
  const d=t.querySelector('.snrd'); if(desc){d.textContent=desc}else{d.remove()}
  const kill=()=>{t.classList.remove('in');setTimeout(()=>t.remove(),180)};
  t.querySelector('.snrx').onclick=kill;
  w.appendChild(t);requestAnimationFrame(()=>t.classList.add('in'));
  setTimeout(kill,3200);
};
