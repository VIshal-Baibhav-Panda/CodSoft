// login.js - store username in localStorage and redirect to chat
(function(){
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const btn = document.getElementById('btnLogin');

  // Prefill if already saved
  const prev = localStorage.getItem('codsoft_user');
  if (prev) {
    try {
      const obj = JSON.parse(prev);
      if (obj.name) nameInput.value = obj.name;
      if (obj.email) emailInput.value = obj.email;
    } catch(e){}
  }

  function saveAndGo(){
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (!name) {
      alert('Please enter your name');
      nameInput.focus();
      return;
    }
    const obj = { name, email: email || null, ts: new Date().toISOString() };
    localStorage.setItem('codsoft_user', JSON.stringify(obj));
    window.location.href = '/';
  }

  btn.addEventListener('click', saveAndGo);
  nameInput.addEventListener('keydown', (e)=>{ if (e.key==="Enter"){ e.preventDefault(); saveAndGo(); }});
  emailInput.addEventListener('keydown', (e)=>{ if (e.key==="Enter"){ e.preventDefault(); saveAndGo(); }});
})();
