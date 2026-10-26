/* CAVA PT — shared interactions */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Run fn once per element the first time it scrolls into view
  const onView = (els, fn, threshold = 0.15) => {
    if (!('IntersectionObserver' in window)) return els.forEach(fn);
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      fn(e.target);
      io.unobserve(e.target);
    }), { threshold, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  };

  // Mobile menu
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const setOpen = open => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('open')) setOpen(false); });
  document.addEventListener('click', e => { if (nav?.classList.contains('open') && !nav.contains(e.target)) setOpen(false); });

  // Scroll progress + nav depth
  const progress = document.querySelector('.progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    nav?.classList.toggle('nav--scrolled', scrollY > 24);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Staggered reveal
  const reveals = [...document.querySelectorAll('.reveal')];
  reveals.forEach(el => {
    const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 5) * 70}ms`;
  });
  onView(reveals, el => el.classList.add('in'), 0.1);

  // Count-up numbers (markup holds the final value as a no-JS fallback)
  const counters = [...document.querySelectorAll('[data-count]')];
  if (!reduce) counters.forEach(el => { el.textContent = '0'; });
  onView(counters, el => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target; return; }
    const start = performance.now(), dur = 1400;
    const tick = now => {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, 0.5);

  // Spotlight hover on dark cards
  document.querySelectorAll('[data-spotlight]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();
