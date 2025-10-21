(function(){
  fetch('/api/ping').then(r=>r.json()).then(j=>{
    document.getElementById('ping').textContent = 'OK — ' + j.now;
  }).catch(err=>{
    document.getElementById('ping').textContent = 'Error al contactar API';
  });
})();
