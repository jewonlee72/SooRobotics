/* Mobile navigation: on small screens the desktop link row is hidden
 * (class "hidden md:flex") and this script adds a hamburger button that
 * opens a dropdown with the same links. Desktop layout is untouched. */
(function () {
  const nav = document.querySelector('nav');
  if (!nav) return;
  const links = nav.querySelector('div');
  if (!links) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.className = 'md:hidden text-slate-500 hover:text-blue-600 transition text-xl leading-none px-1';
  btn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  nav.appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'md:hidden hidden fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex flex-col space-y-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]';
  links.querySelectorAll('a').forEach((a) => {
    const c = a.cloneNode(true);
    c.className = (a.className.includes('text-blue-600') && !a.className.includes('hover:')) ? 'text-blue-600' : 'hover:text-blue-600 transition';
    panel.appendChild(c);
  });
  document.body.appendChild(panel);

  function place() { panel.style.top = nav.getBoundingClientRect().bottom + 'px'; }
  function toggle(open) {
    const show = open == null ? panel.classList.contains('hidden') : open;
    place();
    panel.classList.toggle('hidden', !show);
    btn.setAttribute('aria-expanded', String(show));
    btn.innerHTML = show ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  }
  btn.addEventListener('click', () => toggle());
  window.addEventListener('resize', () => { if (window.innerWidth >= 768) toggle(false); else place(); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target) && !panel.contains(e.target)) toggle(false); });
})();
