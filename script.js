// Small JS: mobile menu + year
document.addEventListener('DOMContentLoaded', function(){
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const btn = document.querySelector('.mobile-menu');
  const nav = document.querySelector('.nav');
  if(btn && nav){
    btn.addEventListener('click', ()=> {
      nav.style.display = nav.style.display === 'block' ? '' : 'block';
    });
  }
});
