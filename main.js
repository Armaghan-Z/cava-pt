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

  // Progress bars
  const bars = [...document.querySelectorAll('.bar__fill')];
  if (!reduce) bars.forEach(b => { b.dataset.w = b.style.width; b.style.width = '0'; });
  onView(bars, b => { if (b.dataset.w) b.style.width = b.dataset.w; }, 0.3);

  // ROM rings (circles use pathLength="100"; final offset is in the markup)
  const rings = [...document.querySelectorAll('.ring__fill')];
  if (!reduce) rings.forEach(r => { r.dataset.o = r.getAttribute('stroke-dashoffset'); r.style.strokeDashoffset = '100'; });
  onView(rings, r => { if (r.dataset.o) r.style.strokeDashoffset = r.dataset.o; }, 0.3);

  // Spotlight hover on dark cards
  document.querySelectorAll('[data-spotlight]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  // Exercise demo videos: a wrapper stays hidden until data-video-src holds an embed URL
  document.querySelectorAll('[data-video-src]').forEach(box => {
    const src = box.dataset.videoSrc.trim();
    if (!src) return;
    box.querySelector('iframe').src = src;
    box.hidden = false;
  });

  // Illustrative ROM tracker (home hero): flexion baseline 50°, week 12 goal 60°, long-term goal 80°
  const dial = document.querySelector('[data-dial]');
  if (dial) {
    const NS = 'http://www.w3.org/2000/svg';
    const cx = 160, cy = 170, r = 130;
    const pt = (v, rad) => {
      const a = (180 - v * 2) * Math.PI / 180;
      return [cx + rad * Math.cos(a), cy - rad * Math.sin(a)];
    };
    const ticks = dial.querySelector('.dial__ticks');
    for (let v = 0; v <= 90; v += 2.5) {
      const major = v % 15 === 0;
      const [x1, y1] = pt(v, r - 14);
      const [x2, y2] = pt(v, r - (major ? 28 : 20));
      const line = document.createElementNS(NS, 'line');
      Object.entries({ x1, y1, x2, y2, stroke: major ? '#BAC4D3' : 'rgba(255,255,255,.28)', 'stroke-width': major ? 2 : 1, 'stroke-linecap': 'round' })
        .forEach(([k, val]) => line.setAttribute(k, val));
      ticks.appendChild(line);
      if (major) {
        const [tx, ty] = pt(v, r - 44);
        const t = document.createElementNS(NS, 'text');
        Object.entries({ x: tx, y: ty + 4, 'text-anchor': 'middle', 'font-size': 11, fill: '#8E9AAD', 'font-family': 'JetBrains Mono, monospace' })
          .forEach(([k, val]) => t.setAttribute(k, val));
        t.textContent = v + '°';
        ticks.appendChild(t);
      }
    }

    const fill = dial.querySelector('.dial__fill');
    const needle = dial.querySelector('.dial__needle');
    const valueEl = dial.querySelector('.dial__value');
    const weekEl = dial.querySelector('.dial__week');
    const set = v => {
      fill.style.strokeDashoffset = 100 - (v / 90) * 100;
      needle.setAttribute('transform', `rotate(${-90 + v * 2} ${cx} ${cy})`);
      valueEl.textContent = Math.round(v) + '°';
    };
    const tween = (from, to, dur) => new Promise(done => {
      const start = performance.now();
      const step = now => {
        const t = Math.min((now - start) / dur, 1);
        const e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        set(from + (to - from) * e);
        t < 1 ? requestAnimationFrame(step) : done();
      };
      requestAnimationFrame(step);
    });
    const wait = ms => new Promise(res => setTimeout(res, ms));

    if (reduce) {
      set(80); weekEl.textContent = 'Long-term goal';
    } else {
      set(0);
      // Plays once: baseline, then the week 12 goal, then the long-term goal
      onView([dial], async () => {
        weekEl.textContent = 'Baseline, week 8';
        await tween(0, 50, 1100);
        await wait(700);
        weekEl.textContent = 'Goal, week 12';
        await tween(50, 60, 900);
        await wait(700);
        weekEl.textContent = 'Long-term goal';
        await tween(60, 80, 1100);
      }, 0.3);
    }
  }
})();
