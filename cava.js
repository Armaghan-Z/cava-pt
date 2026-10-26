/* CAVA PT — illustrations, term popovers, scroll scenes, chat and intake.
   Everything here is progressive: pages read fine with JS off. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let uid = 0;

  /* ---------- Term popovers ---------- */
  const TERMS = {
    'anteroposterior': 'An X-ray taken from front to back, so the picture shows the arm straight on.',
    'lateral x-rays': 'X-rays taken from the side. Doctors pair them with front views to see the break from two angles.',
    'displaced proximal forearm fracture': 'A break in the forearm bones near the elbow where the broken ends have moved out of line.',
    'open reduction and internal fixation (orif)': 'A surgery where the doctor opens the skin, lines the broken bones back up, and holds them in place with metal plates and screws.',
    'cock-up plaster splint': 'A hard plaster support that holds the wrist tilted slightly back so it can rest and heal.',
    'certified mental performance consultant': 'A trained professional who helps athletes handle fear, stress and confidence so they can perform their best.',
    'wrist orthotics and ergonomic assistive devices': 'Custom braces and helpful tools, like a padded keyboard rest, that support the wrist and take strain off it during daily tasks.',
    'kinesiophobia': 'A fear of moving because you are afraid of getting hurt again.',
    'radius': 'The forearm bone on the thumb side.',
    'ulna': 'The forearm bone on the pinky side.',
    'dorsal': 'The back side. On the hand, it is the side with your knuckles and nails.',
    'neurovascular': 'Having to do with nerves and blood vessels. Intact means feeling and blood flow are normal.',
    'range of motion': 'How far a joint can move in each direction, usually measured in degrees.',
    'flexion': 'Bending a joint. For the wrist, it means bending the palm down toward the inside of the forearm.',
    'radial deviation': 'Tilting the wrist sideways toward the thumb.',
    'supination': 'Turning the forearm so the palm faces up.',
    'pronation': 'Turning the forearm so the palm faces down.'
  };
  const pop = document.createElement('div');
  pop.className = 'term-pop';
  pop.id = 'term-pop';
  pop.setAttribute('role', 'tooltip');
  pop.hidden = true;
  document.body.appendChild(pop);
  let active = null, pinned = false;
  const place = el => {
    const r = el.getBoundingClientRect();
    pop.style.left = '0px'; pop.style.top = '0px';
    const w = pop.offsetWidth, h = pop.offsetHeight;
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    let top = r.top - h - 10;
    pop.classList.toggle('below', top < 8);
    if (top < 8) top = r.bottom + 10;
    pop.style.left = `${left}px`;
    pop.style.top = `${top + scrollY}px`;
    pop.style.setProperty('--ax', `${r.left + r.width / 2 - left}px`);
  };
  const show = (el, pin = false) => {
    const def = TERMS[el.dataset.term];
    if (!def) return;
    active?.setAttribute('aria-expanded', 'false');
    active = el; pinned = pin;
    pop.innerHTML = `<b>${el.textContent.trim()}</b>${def}`;
    pop.hidden = false;
    el.setAttribute('aria-expanded', 'true');
    place(el);
  };
  const hide = () => {
    pop.hidden = true; pinned = false;
    active?.setAttribute('aria-expanded', 'false');
    active = null;
  };
  $$('.term').forEach(el => {
    if (!el.dataset.term) el.dataset.term = el.textContent.trim().toLowerCase();
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-describedby', 'term-pop');
    el.setAttribute('aria-expanded', 'false');
    el.addEventListener('mouseenter', () => { if (!pinned) show(el); });
    el.addEventListener('mouseleave', () => { if (!pinned && active === el) hide(); });
    el.addEventListener('focus', () => show(el));
    el.addEventListener('blur', () => { if (active === el) hide(); });
    el.addEventListener('click', e => { e.stopPropagation(); (active === el && pinned) ? hide() : show(el, true); });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(el, true); }
      if (e.key === 'Escape') hide();
    });
  });
  document.addEventListener('click', e => { if (active && !pop.contains(e.target)) hide(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && active) hide(); });
  addEventListener('resize', () => active && place(active));

  /* ---------- Player figure (flat 2D) ---------- */
  const C = { skin: '#B9784F', skin2: '#8F5A39', jersey: '#FF7A3D', shorts: '#1A2540', ball: '#E8762B', line: '#0B1220' };
  const lerp = (a, b, t) => a + (b - a) * t;
  const mix = (A, B, t) => Object.fromEntries(Object.keys(A).map(k => [k, [lerp(A[k][0], B[k][0], t), lerp(A[k][1], B[k][1], t)]]));
  const seg = (a, b, c, w) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const figure = (P, hurt = 0) => {
    const mid = [lerp(P.n[0], P.p[0], .78), lerp(P.n[1], P.p[1], .78)];
    return `<g>
      ${seg(P.n, P.le, C.skin2, 13)}${seg(P.le, P.lh, C.skin2, 12)}
      ${seg(P.p, P.lk, C.skin2, 16)}${seg(P.lk, P.lf, C.skin2, 14)}${seg(P.lf, [P.lf[0] - 10, P.lf[1]], '#fff', 12)}
      ${seg(P.n, P.p, C.jersey, 32)}${seg(mid, P.p, C.shorts, 34)}
      ${seg(P.p, P.rk, C.skin, 16)}${seg(P.rk, P.rf, C.skin, 14)}${seg(P.rf, [P.rf[0] + 10, P.rf[1]], '#fff', 12)}
      <circle cx="${P.h[0]}" cy="${P.h[1]}" r="19" fill="${C.skin}"/>
      <path d="M${P.h[0] - 19} ${P.h[1] - 3}a19 19 0 0 1 38 0z" fill="${C.line}"/>
      ${seg(P.n, P.re, C.skin, 13)}${seg(P.re, P.rh, hurt ? '#E2483D' : C.skin, 12)}
      ${hurt ? `<circle cx="${lerp(P.re[0], P.rh[0], .5)}" cy="${lerp(P.re[1], P.rh[1], .5)}" r="${14 + hurt * 10}" fill="none" stroke="#FF7A3D" stroke-width="3" opacity="${hurt}"/>` : ''}
    </g>`;
  };
  const hoop = `<g>
    <rect x="684" y="196" width="10" height="208" rx="3" fill="#596476"/>
    <rect x="652" y="96" width="12" height="140" rx="3" fill="#E8EDF5" stroke="#596476" stroke-width="3"/>
    <rect x="664" y="190" width="24" height="8" fill="#596476"/>
    <path d="M572 196 l10 46 h52 l10 -46" fill="none" stroke="#C7C0B2" stroke-width="3" stroke-dasharray="6 5"/>
    <rect x="566" y="188" width="88" height="9" rx="4" fill="#FF7A3D"/>
  </g>`;
  const court = `<rect width="800" height="450" fill="#F5F3EE"/><rect y="404" width="800" height="46" fill="#ECE8DF"/><line x1="0" y1="404" x2="800" y2="404" stroke="#C7C0B2" stroke-width="3"/>`;

  const POSES = {
    approach: { h: [200, 232], n: [205, 254], p: [196, 322], re: [232, 288], rh: [252, 318], le: [180, 288], lh: [168, 312], rk: [228, 362], rf: [214, 400], lk: [180, 364], lf: [150, 396] },
    takeoff: { h: [420, 186], n: [418, 208], p: [405, 276], re: [446, 172], rh: [470, 138], le: [394, 238], lh: [384, 262], rk: [434, 318], rf: [422, 364], lk: [392, 330], lf: [382, 374] },
    catch: { h: [528, 158], n: [530, 180], p: [512, 248], re: [556, 150], rh: [584, 192], le: [508, 214], lh: [494, 240], rk: [528, 296], rf: [514, 336], lk: [500, 292], lf: [488, 334] },
    fall: { h: [520, 258], n: [540, 268], p: [508, 326], re: [568, 232], rh: [586, 194], le: [516, 296], lh: [496, 306], rk: [534, 364], rf: [516, 396], lk: [492, 354], lf: [474, 390] },
    down: { h: [462, 328], n: [472, 348], p: [448, 394], re: [500, 366], rh: [524, 380], le: [486, 366], lh: [512, 380], rk: [490, 376], rf: [540, 398], lk: [478, 384], lf: [528, 402] },
    dunk: { h: [548, 140], n: [546, 162], p: [524, 230], re: [574, 132], rh: [604, 178], le: [522, 196], lh: [508, 222], rk: [540, 278], rf: [528, 318], lk: [512, 272], lf: [500, 316] },
    land: { h: [500, 262], n: [502, 284], p: [492, 346], re: [530, 300], rh: [548, 274], le: [476, 300], lh: [458, 278], rk: [524, 372], rf: [514, 402], lk: [470, 374], lf: [478, 402] }
  };
  const BALL = { approach: [256, 352], takeoff: [474, 126], catch: [606, 236], fall: [632, 380], down: [700, 392], dunk: [608, 214], land: [640, 392] };

  const scene = (el, keys, hurtAt = []) => {
    const svg = el.querySelector('svg') || el.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', el.dataset.label || '');
    const draw = t => {
      const i = Math.min(Math.floor(t), keys.length - 2), f = t - i;
      const P = mix(POSES[keys[i]], POSES[keys[i + 1]], f);
      const b = [lerp(BALL[keys[i]][0], BALL[keys[i + 1]][0], f), lerp(BALL[keys[i]][1], BALL[keys[i + 1]][1], f)];
      const hurt = hurtAt.length ? Math.max(0, ...hurtAt.map(k => 1 - Math.abs(t - k))) : 0;
      svg.innerHTML = `${court}${hoop}<circle cx="${b[0]}" cy="${b[1]}" r="15" fill="${C.ball}"/><path d="M${b[0] - 15} ${b[1]}h30M${b[0]} ${b[1] - 15}v30" stroke="#7A3A12" stroke-width="2"/>${figure(P, hurt)}`;
    };
    return draw;
  };

  /* ---------- X-ray art ---------- */
  const xray = (view, state) => {
    const id = `x${++uid}`;
    const ap = view === 'ap';
    const bones = ap
      ? [{ n: 'radius', x: 82, w: 22, y0: 70, y1: 360, f: 150 }, { n: 'ulna', x: 140, w: 20, y0: 40, y1: 350, f: 134 }]
      : [{ n: 'ulna', x: 124, w: 22, y0: 40, y1: 352, f: 134, back: 1 }, { n: 'radius', x: 100, w: 20, y0: 72, y1: 360, f: 150 }];
    const shift = state === 'broken';
    const part = (b, top) => {
      const zig = `${b.x - 30},${b.f} ${b.x - 12},${b.f - 7} ${b.x},${b.f + 5} ${b.x + 12},${b.f - 6} ${b.x + 30},${b.f + 2}`;
      const poly = top ? `${b.x - 30},0 ${b.x + 30},0 ${zig.split(' ').reverse().join(' ')}` : `${zig} ${b.x + 30},420 ${b.x - 30},420`;
      const cid = `${id}${b.n}${top ? 't' : 'b'}`;
      return `<clipPath id="${cid}"><polygon points="${poly}"/></clipPath>
        <g clip-path="url(#${cid})"><rect x="${b.x - b.w / 2}" y="${b.y0}" width="${b.w}" height="${b.y1 - b.y0}" rx="${b.w / 2}" fill="url(#${id}g)"/>
        <ellipse cx="${b.x}" cy="${b.y1 - 6}" rx="${b.w * .85}" ry="14" fill="url(#${id}g)"/>${b.n === 'ulna' ? `<ellipse cx="${b.x}" cy="${b.y0 + 10}" rx="${b.w * .8}" ry="16" fill="url(#${id}g)"/>` : `<ellipse cx="${b.x}" cy="${b.y0 + 6}" rx="${b.w * .75}" ry="9" fill="url(#${id}g)"/>`}</g>`;
    };
    const fx = b => `<path class="fx" pathLength="1" d="M${b.x - b.w / 2 - 2} ${b.f}l${b.w * .3} -7l${b.w * .25} 12l${b.w * .25} -11l${b.w * .3} 6" fill="none" stroke="#fff" stroke-width="2.4" ${state === 'fixed' ? 'opacity=".25"' : ''}/>`;
    const plate = b => `<g><rect x="${b.x + (ap ? (b.n === 'radius' ? -b.w / 2 - 7 : b.w / 2 - 1) : -4)}" y="${b.f - 46}" width="8" height="92" rx="3" fill="#F2F7FF"/>${[-34, -14, 14, 34].map(d => `<rect x="${b.x - b.w / 2 - 6}" y="${b.f + d - 2}" width="${b.w + 12}" height="4" rx="2" fill="#DCE8FF"/>`).join('')}</g>`;
    return `<svg viewBox="0 0 220 420" role="img" aria-label="${ap ? 'Front (AP)' : 'Side (lateral)'} view X-ray, ${state === 'fixed' ? 'bones lined up with plates and screws' : state === 'broken' ? 'both bones broken and shifted' : 'bones intact'}">
      <defs><radialGradient id="${id}bg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#16305E"/><stop offset="1" stop-color="#060F24"/></radialGradient>
      <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#9FB8D8"/><stop offset=".5" stop-color="#EAF2FF"/><stop offset="1" stop-color="#9FB8D8"/></linearGradient>
      <filter id="${id}f"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect width="220" height="420" fill="url(#${id}bg)"/>
      <path d="M50 0 C40 120 46 260 58 420 H170 C182 260 186 120 176 0Z" fill="#8FB0E0" opacity=".12"/>
      <path d="M70 0 Q112 30 158 0" fill="none" stroke="#C9D8F0" stroke-width="16" opacity=".6"/>
      <g filter="url(#${id}f)">${bones.map(b => `<g opacity="${b.back ? .7 : 1}">${part(b, 1)}<g class="frag" data-dx="${b.n === 'radius' ? 9 : 7}" data-dy="${b.n === 'radius' ? 7 : 5}" data-r="${b.n === 'radius' ? 4 : 3}" ${shift ? `transform="translate(${b.n === 'radius' ? 9 : 7} ${b.n === 'radius' ? 7 : 5}) rotate(${b.n === 'radius' ? 4 : 3} ${b.x} ${b.f})"` : ''}>${part(b, 0)}</g>${state !== 'intact' ? fx(b) : ''}${state === 'fixed' ? plate(b) : ''}</g>`).join('')}
      <g opacity=".85">${[0, 1, 2, 3].map(i => `<circle cx="${(ap ? 86 : 102) + i * (ap ? 17 : 9)}" cy="${388 + (i % 2) * 6}" r="${ap ? 9 : 8}" fill="url(#${id}g)"/>`).join('')}</g></g>
      <text x="12" y="22" fill="#9FB8D8" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="1">${ap ? 'AP' : 'LAT'} · R</text>
    </svg>`;
  };
  $$('[data-xray]').forEach(el => {
    const [view, state] = el.dataset.xray.split(':');
    el.innerHTML = xray(view, state);
  });

  /* ---------- Dorsal hand ---------- */
  $$('[data-hand]').forEach(el => {
    const shape = `<path d="M120 300 C110 250 112 205 120 180 L120 92 a14 14 0 0 1 28 0 L148 170 L152 70 a14 14 0 0 1 28 0 L180 168 L186 78 a14 14 0 0 1 28 0 L212 176 L222 104 a13 13 0 0 1 26 3 L236 210 C248 196 262 176 280 168 a14 14 0 0 1 16 20 C276 222 258 252 238 280 C226 300 224 330 222 360 H130 C128 340 126 320 120 300Z"/>`;
    el.innerHTML = `<svg viewBox="60 40 300 340" role="img" aria-label="Back of the right hand, showing swelling over the hand and fingers">
      <g class="hand-swell" fill="#FF7A3D" opacity=".35">${shape}</g>
      <g fill="#C98A5E" stroke="#8F5A39" stroke-width="3">${shape}</g>
      <g fill="#E9C2A0">${[134, 166, 200, 235].map((x, i) => `<rect x="${x - 8}" y="${[86, 66, 74, 100][i]}" width="16" height="12" rx="5"/>`).join('')}</g>
      <g stroke="#8F5A39" stroke-width="2" opacity=".5" fill="none"><path d="M134 175q8 6 16 0M166 172q8 6 16 0M198 174q8 6 16 0"/></g>
    </svg>`;
    const btn = el.parentElement.querySelector('[data-swell-toggle]');
    const set = on => { el.classList.toggle('swollen', on); if (btn) { btn.setAttribute('aria-pressed', String(on)); btn.textContent = on ? 'Hide swelling' : 'Show swelling'; } };
    btn?.addEventListener('click', () => set(!el.classList.contains('swollen')));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { set(true); io.disconnect(); } }, { threshold: .6 });
      io.observe(el);
    } else set(true);
  });

  /* ---------- Before / after slider ---------- */
  $$('.ba').forEach(ba => {
    const input = $('input', ba);
    const upd = () => ba.style.setProperty('--pos', `${input.value}%`);
    input.addEventListener('input', upd);
    upd();
  });

  /* ---------- Looping ROM clipart ---------- */
  const ROM = {
    flex: { label: 'Wrist flexion and extension', arc: '0 to 60°' },
    curl: { label: 'Wrist curl with light weight', arc: '0 to 60°', weight: 1 },
    ext: { label: 'Wrist extension with light weight', arc: '0 to 60°', weight: 1, up: 1 },
    circles: { label: 'Slow wrist circles', arc: 'Full circle' },
    prosup: { label: 'Forearm supination and pronation', arc: 'about 80° each way' },
    dev: { label: 'Radial deviation', arc: '15 to 20°' },
    wall: { label: 'Wall press', arc: 'Weight shift' },
    grip: { label: 'Grip squeeze with putty', arc: 'Squeeze and release' },
    chop: { label: 'Diagonal band chop', arc: 'High to low' },
    ball: { label: 'Ball handling', arc: 'Dribble' },
    shoot: { label: 'Progressive shooting', arc: 'Wrist flick' }
  };
  const romSvg = type => {
    const r = ROM[type] || ROM.flex;
    const forearm = `<rect x="40" y="128" width="130" height="26" rx="13" fill="#B9784F"/>`;
    const table = `<rect x="20" y="154" width="160" height="12" rx="4" fill="#C7C0B2"/><rect x="30" y="166" width="10" height="44" fill="#C7C0B2"/>`;
    const hand = `<g class="rom-hand"><rect x="166" y="126" width="54" height="30" rx="14" fill="#C98A5E"/><rect x="210" y="130" width="26" height="12" rx="6" fill="#C98A5E"/>${r.weight ? '<rect x="200" y="112" width="12" height="58" rx="4" fill="#1A2540"/>' : ''}</g>`;
    const arc = `<path d="M232 141 A64 64 0 0 0 214 96" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/><path d="M232 141 A64 64 0 0 1 214 186" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/>`;
    let body;
    switch (type) {
      case 'prosup': body = `<rect x="30" y="128" width="150" height="26" rx="13" fill="#B9784F"/><g class="rom-flip"><ellipse cx="210" cy="141" rx="30" ry="22" fill="#C98A5E"/><ellipse cx="210" cy="141" rx="18" ry="12" fill="#E9C2A0"/></g><path d="M210 92 a49 49 0 1 1 -1 0" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/>`; break;
      case 'dev': body = `<rect x="150" y="40" width="26" height="150" rx="13" fill="#B9784F" transform="rotate(90 163 115)"/><g class="rom-dev"><rect x="160" y="100" width="70" height="34" rx="14" fill="#C98A5E"/><rect x="176" y="84" width="14" height="22" rx="7" fill="#C98A5E"/></g><path d="M240 117 A80 80 0 0 0 226 72" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/>`; break;
      case 'circles': body = `${table}${forearm}<g class="rom-circle">${hand}</g><circle cx="196" cy="141" r="40" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/>`; break;
      case 'wall': body = `<rect x="226" y="20" width="14" height="200" fill="#C7C0B2"/><g class="rom-wall"><circle cx="90" cy="60" r="16" fill="#B9784F"/><line x1="92" y1="78" x2="80" y2="160" stroke="#FF7A3D" stroke-width="26" stroke-linecap="round"/><line x1="96" y1="92" x2="214" y2="100" stroke="#B9784F" stroke-width="12" stroke-linecap="round"/><rect x="212" y="84" width="14" height="32" rx="6" fill="#C98A5E"/><line x1="80" y1="160" x2="70" y2="214" stroke="#1A2540" stroke-width="16" stroke-linecap="round"/></g>`; break;
      case 'grip': body = `${forearm.replace('y="128"', 'y="118"')}<g class="rom-grip"><circle cx="196" cy="131" r="26" fill="#45E3BF"/></g><g class="rom-fingers"><rect x="172" y="110" width="44" height="14" rx="7" fill="#C98A5E"/><rect x="172" y="138" width="44" height="14" rx="7" fill="#C98A5E"/></g>`; break;
      case 'chop': body = `<circle cx="130" cy="44" r="16" fill="#B9784F"/><line x1="130" y1="62" x2="130" y2="150" stroke="#FF7A3D" stroke-width="28" stroke-linecap="round"/><line x1="130" y1="150" x2="112" y2="214" stroke="#1A2540" stroke-width="16" stroke-linecap="round"/><line x1="130" y1="150" x2="150" y2="214" stroke="#1A2540" stroke-width="16" stroke-linecap="round"/><line x1="236" y1="20" x2="160" y2="80" stroke="#0B7A68" stroke-width="3" class="rom-band"/><g class="rom-chop"><line x1="130" y1="80" x2="196" y2="40" stroke="#B9784F" stroke-width="12" stroke-linecap="round"/><circle cx="198" cy="38" r="8" fill="#C98A5E"/></g><path d="M200 34 Q236 120 180 196" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/>`; break;
      case 'ball': body = `${forearm.replace('y="128"', 'y="70"')}<rect x="166" y="68" width="54" height="30" rx="14" fill="#C98A5E" class="rom-pat"/><circle class="rom-bounce" cx="194" cy="130" r="22" fill="#E8762B"/><line x1="20" y1="214" x2="260" y2="214" stroke="#C7C0B2" stroke-width="3"/>`; break;
      case 'shoot': body = `<rect x="110" y="120" width="26" height="100" rx="13" fill="#B9784F"/><g class="rom-shoot"><rect x="108" y="70" width="30" height="54" rx="14" fill="#C98A5E"/></g><circle class="rom-arc-ball" cx="123" cy="56" r="18" fill="#E8762B"/><path d="M140 50 Q200 0 240 60" fill="none" stroke="#0B7A68" stroke-width="3" stroke-dasharray="4 5"/>`; break;
      default: body = `${table}${forearm}<g class="${r.up ? 'rom-ext' : 'rom-flex'}">${hand}</g>${arc}`;
    }
    return `<svg viewBox="0 0 260 230" role="img" aria-label="${r.label}. Range: ${r.arc}">${body}<text x="14" y="24" font-family="JetBrains Mono, monospace" font-size="12" fill="#065A4D">${r.arc}</text></svg>`;
  };
  $$('[data-rom]').forEach(el => { el.innerHTML = romSvg(el.dataset.rom); });

  /* ---------- Icons for intervention cards ---------- */
  $$('[data-icon]').forEach(el => {
    const I = {
      brace: '<rect x="18" y="22" width="44" height="40" rx="12" fill="#45E3BF"/><rect x="18" y="34" width="44" height="6" fill="#0B1220"/><rect x="18" y="46" width="44" height="6" fill="#0B1220"/><rect x="28" y="8" width="24" height="18" rx="8" fill="#B9784F"/>',
      water: '<path d="M40 8 C28 26 18 38 18 50 a22 22 0 0 0 44 0 C62 38 52 26 40 8Z" fill="#45E3BF"/><path d="M30 52 a10 10 0 0 0 10 10" stroke="#0B1220" stroke-width="4" fill="none" stroke-linecap="round"/>',
      laser: '<rect x="10" y="30" width="34" height="20" rx="6" fill="#45E3BF"/><path d="M44 40 H72" stroke="#FF7A3D" stroke-width="4"/><circle cx="72" cy="40" r="5" fill="#FF7A3D"/>'
    };
    el.innerHTML = `<svg viewBox="0 0 80 72" aria-hidden="true">${I[el.dataset.icon] || ''}</svg>`;
  });

  /* ---------- GSAP scroll scenes ---------- */
  const injuryEl = $('#injury-scene');
  const drawInjury = injuryEl && scene(injuryEl, ['approach', 'takeoff', 'catch', 'fall', 'down'], [2.6, 3]);
  const heroEl = $('#hero-scene');
  const drawHero = heroEl && scene(heroEl, ['approach', 'takeoff', 'dunk', 'land']);
  drawInjury?.(reduce ? 2.6 : 0);
  drawHero?.(reduce ? 2 : 0);

  const steps = (wrap, t) => $$('[data-step]', wrap).forEach((s, i, all) => s.classList.toggle('on', Math.min(Math.round(t), all.length - 1) === i));
  if (injuryEl) steps(injuryEl.closest('.scene'), reduce ? 2 : 0);
  if (heroEl) steps(heroEl.closest('.scene'), reduce ? 2 : 0);

  if (!window.gsap || !window.ScrollTrigger || reduce) {
    document.documentElement.classList.add('no-motion');
    return finish();
  }
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  const pinOr = (desk, mobileStart = 'top 75%', mobileEnd = 'bottom 25%') => desk ? { pin: true, start: 'top top', end: '+=220%', scrub: .6 } : { start: mobileStart, end: mobileEnd, scrub: .6 };

  mm.add({ desk: '(min-width: 768px)', mob: '(max-width: 767px)' }, ctx => {
    const desk = ctx.conditions.desk;
    [[injuryEl, drawInjury, 4], [heroEl, drawHero, 3]].forEach(([el, draw, n]) => {
      if (!el) return;
      const wrap = el.closest('.scene');
      const st = { t: 0 };
      gsap.to(st, { t: n, ease: 'none', onUpdate: () => { draw(st.t); steps(wrap, st.t * ($$('[data-step]', wrap).length - 1) / n); }, scrollTrigger: { trigger: wrap, ...pinOr(desk) } });
    });

    const xr = $('#xray-scene');
    if (xr) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: xr, ...pinOr(desk, 'top 70%', 'center 30%') } });
      tl.from($$('.fx', xr), { strokeDashoffset: 1, strokeDasharray: 1, duration: 1, stagger: .2 })
        .add($$('.frag', xr).map(g => {
          const end = g.getAttribute('transform');
          return gsap.fromTo(g, { attr: { transform: end.replace(/translate\([^)]*\)/, 'translate(0 0)').replace(/rotate\(\S+/, 'rotate(0') } }, { attr: { transform: end }, duration: 1 });
        }), '>-.1')
        .from($$('[data-step]', xr), { opacity: .25, duration: .4, stagger: .5 }, 0);
      $$('.fx', xr).forEach(p => { p.style.strokeDasharray = 1; });
    }

    const goals = $('#goals');
    if (goals) {
      const items = $$('.goal', goals);
      if (desk) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: goals, pin: true, start: 'top top', end: `+=${items.length * 70}%`, scrub: .5 } });
        items.forEach(it => tl.from(it, { autoAlpha: 0, y: 30, duration: 1 }).from($('.goal__check', it), { scale: 0, rotate: -40, duration: .5 }, '<.5'));
      } else {
        items.forEach(it => gsap.from(it, { autoAlpha: 0, y: 24, duration: .6, scrollTrigger: { trigger: it, start: 'top 85%' } }));
      }
    }
  });
  finish();

  /* ---------- Things that don't depend on GSAP ---------- */
  function finish() {
    initChat();
    initIntake();
    initLetters();
  }

  function initLetters() {
    const h = $('.cava-word');
    if (!h) return;
    requestAnimationFrame(() => setTimeout(() => h.classList.add('open'), reduce ? 0 : 500));
  }

  /* ---------- Ask CAVA (scripted demo assistant) ---------- */
  function initChat() {
    const root = $('#ask-cava');
    if (!root) return;
    const QA = [
      [['what is pt', 'physical therapy', 'what is physical therapy'], 'Physical therapy is a type of healthcare that helps people get their movement and body function back. It builds strength and stability and lowers pain after an injury or surgery.'],
      [['first visit', 'expect', 'visit', 'appointment'], 'At your first visit we look over your X-rays with you, check how your bones, joints and muscles are healing, and make a plan around your needs and schedule.'],
      [['how often', 'sessions', 'per week', 'times a week', 'frequency'], 'Sessions of PT every other day, around 3 to 4 times a week. Each exercise is usually 2 to 3 sets of 10 to 15 reps.'],
      [['pain', 'hurt', 'swelling', 'stop'], 'Stop doing exercises immediately if pain or swelling occurs. Weights should make your muscles feel tired, not hurt.'],
      [['jackson', 'injury', 'what happened', 'dunk'], 'Jackson caught his right arm on the rim going up for a dunk. The fall caused a complete fracture of both the radius and ulna.'],
      [['orif', 'surgery', 'plates', 'screws'], 'ORIF stands for Open Reduction and Internal Fixation. Jackson\'s broken bones were moved back into line and held with metal plates and screws.'],
      [['splint', 'cast', 'immobil'], 'After surgery Jackson wore a cock-up plaster splint for weeks 1 to 8 to protect the hardware. He could only gently move his fingers and shoulder.'],
      [['goal', 'flexion', 'degrees', 'rom', 'range of motion'], 'Jackson\'s ROM goals: wrist flexion from 50 to 60 degrees and radial deviation from 15 to 20 degrees, then 75 to 80 degrees of flexion by month 6.'],
      [['kinesiophobia', 'fear', 'scared', 'anxiety', 'confidence'], 'Kinesiophobia is a fear of moving because you\'re afraid of getting hurt again. It\'s common and treatable. Jackson works with a Certified Mental Performance Consultant on it.'],
      [['exercise', 'exercises', 'home', 'at home'], 'Jackson\'s plan starts with wrist flexion off a table, slow wrist circles, and forearm supination and pronation, then adds resistance. See the Care Plan and Exercises pages for sets, reps and videos.'],
      [['plan', 'care plan', 'phases', 'weeks'], 'The plan has phases: weeks ~1 to 6 for range of motion, weeks ~6 to 12 for resistance, and a return-to-sport phase after that with surgeon clearance.'],
      [['basketball', 'return', 'play again', 'court'], 'Getting back to basketball takes time because the fracture was severe. Return-to-sport drills only start after the surgeon clears him.'],
      [['network', 'specialist', 'surgeon', 'hand therapist', 'trainer', 'team of'], 'Jackson\'s care network includes an orthopedic surgeon, an occupational or certified hand therapist, a Certified Mental Performance Consultant, and later an athletic trainer or strength coach.'],
      [['orthotic', 'brace', 'devices', 'typing'], 'Jackson has access to custom wrist orthotics and ergonomic assistive devices to protect his arm during daily activities like typing or studying.'],
      [['hydrotherapy', 'laser', 'inflammation'], 'Advanced recovery options like high-intensity contrast hydrotherapy or low-level laser therapy are used to help soft tissue heal and control inflammation.'],
      [['book', 'sign up', 'start', 'intake', 'join', 'contact'], 'You can start with the intake form on the home page. It takes about a minute.'],
      [['story', 'founded', 'started', 'who started', 'why cava', 'about'], 'CAVA started with four friends, Colby, Ashu, Vasanth, and Armaghan, who all enjoy playing sports. Read the full story on the Our Story page.'],
      [['team', 'founders', 'who are you', 'colby', 'ashu', 'vasanth', 'armaghan'], 'The founders are Colby, Ashutosh (Ashu), Vasanth and Armaghan.'],
      [['prevent', 'prevention', 'avoid injury'], 'CAVA focuses on athletes: we help you recover, rebuild, and reach your full potential in your sport, with plans built around your schedule.'],
      [['cost', 'price', 'free'], 'CAVA gives athletes access to free exercise plans and personalized rehabilitation plans.'],
      [['hi', 'hello', 'hey'], 'Hi! Ask me about physical therapy, Jackson\'s story, his care plan, or how to get started.']
    ];
    const FALLBACK = 'I don\'t have an answer for that one yet. Try the intake form below and our team will follow up.';
    const log = $('.chat__log', root), form = $('.chat__form', root), input = $('input', form);
    const panel = $('.chat__panel', root), fab = $('.chat__fab', root);
    const open = o => { panel.hidden = !o; fab.setAttribute('aria-expanded', String(o)); if (o) input.focus(); };
    fab.addEventListener('click', () => open(panel.hidden));
    $('.chat__close', root).addEventListener('click', () => { open(false); fab.focus(); });
    root.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { open(false); fab.focus(); } });
    const add = (who, text) => {
      const m = document.createElement('div');
      m.className = `chat__msg chat__msg--${who}`;
      m.textContent = text;
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    };
    const answer = q => {
      const s = ` ${q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ')} `;
      let best = null, score = 0;
      QA.forEach(([keys, a]) => {
        const sc = keys.reduce((n, k) => n + (s.includes(` ${k}`) ? k.length : 0), 0);
        if (sc > score) { score = sc; best = a; }
      });
      return best || FALLBACK;
    };
    // HOOK: to use a real model later, send `q` to your own server endpoint here
    // (for example fetch('/api/ask', { method: 'POST', body: JSON.stringify({ q }) })).
    // Never put an API key in this file; the key must live on the server.
    const ask = q => {
      if (!q.trim()) return;
      add('user', q);
      const typing = add('bot', '');
      typing.classList.add('chat__typing');
      typing.innerHTML = '<span></span><span></span><span></span>';
      setTimeout(() => { typing.classList.remove('chat__typing'); typing.textContent = answer(q); log.scrollTop = log.scrollHeight; }, reduce ? 50 : 700);
    };
    form.addEventListener('submit', e => { e.preventDefault(); ask(input.value); input.value = ''; });
    $$('.chat__chips button', root).forEach(b => b.addEventListener('click', () => ask(b.textContent)));
  }

  /* ---------- Intake form ---------- */
  function initIntake() {
    const f = $('#intake');
    if (!f) return;
    // TODO(team): to collect real responses, set GOOGLE_FORM_URL and post the fields there.
    const GOOGLE_FORM_URL = '';
    const steps = $$('.step', f), bar = $('.intake__bar span', f), count = $('.intake__count', f);
    let i = 0;
    f.classList.add('stepped');
    const go = n => {
      i = Math.max(0, Math.min(steps.length - 1, n));
      steps.forEach((s, k) => { s.hidden = k !== i; });
      bar.style.width = `${(i / (steps.length - 1)) * 100}%`;
      count.textContent = `Step ${i + 1} of ${steps.length}`;
      if (steps[i].dataset.summary !== undefined) summary();
      $('input, button, textarea', steps[i])?.focus({ preventScroll: true });
    };
    const summary = () => {
      const d = new FormData(f);
      const rows = [['Name', d.get('name')], ['Sport', d.get('sport')], ['Level', d.get('level')], ['Area', d.getAll('area').join(', ')], ['Pain', `${d.get('pain')} / 10`], ['Goals', d.getAll('goals').join(', ')], ['Days', d.getAll('days').join(', ')]];
      $('.intake__summary', f).innerHTML = rows.map(([k, v]) => `<li><span class="k">${k}</span><span class="v">${(v || '—').toString().replace(/[<>&]/g, '')}</span></li>`).join('');
    };
    f.addEventListener('click', e => {
      if (e.target.closest('[data-next]')) { e.preventDefault(); go(i + 1); }
      if (e.target.closest('[data-back]')) { e.preventDefault(); go(i - 1); }
    });
    f.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'text') { e.preventDefault(); go(i + 1); } });
    const pain = $('input[name="pain"]', f), out = $('.pain-out', f);
    pain?.addEventListener('input', () => { out.textContent = pain.value; });
    f.addEventListener('submit', e => {
      e.preventDefault();
      if (GOOGLE_FORM_URL) { /* send to the Google Form here */ }
      f.hidden = true;
      $('#intake-done').hidden = false;
    });
    go(0);
  }
})();
