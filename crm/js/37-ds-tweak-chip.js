(function(){
  const B=document.body;
  const KEYS=[['dsMetrics','txd-ds-metrics','Metrics → StatCard'],['dsTabs','txd-ds-tabs','Tabs → DS Tabs']];
  KEYS.forEach(([k,cls])=>{try{if(localStorage.getItem('crm-'+k)==='1')B.classList.add(cls)}catch(e){}});
  /* Floating DS-tweak chip hidden per request; saved DS-tweak state above still applies. */
})();
