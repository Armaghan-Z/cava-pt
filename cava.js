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

  /* ---------- Cartoon player + gym (original SVG, drawn per frame) ---------- */
  const C = { skin: '#B9784F', skin2: '#94603F', jersey: '#FF7A3D', jersey2: '#E0612A', shorts: '#1A2540', trim: '#FFFFFF', band: '#45E3BF', ball: '#E8762B', ink: '#0B1220' };
  const lerp = (a, b, t) => a + (b - a) * t;
  const pt = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const ease = f => lerp(f, f * f * (3 - 2 * f), .55);
  const mix = (A, B, t) => Object.fromEntries(Object.keys(A).map(k => [k, pt(A[k], B[k], t)]));
  const r1 = n => Math.round(n * 10) / 10;
  const OL = `stroke="${C.ink}" stroke-width="5" paint-order="stroke" stroke-linejoin="round"`;
  // Tapered capsule from a (radius ra) to b (radius rb), outlined
  const limb = (a, b, ra, rb, fill) => {
    const L = dist(a, b) || 1, dx = (b[0] - a[0]) / L, dy = (b[1] - a[1]) / L, nx = -dy, ny = dx;
    const p = (q, r, s) => `${r1(q[0] + nx * r * s)} ${r1(q[1] + ny * r * s)}`;
    return `<path d="M${p(a, ra, 1)} L${p(b, rb, 1)} A${rb} ${rb} 0 0 0 ${p(b, rb, -1)} L${p(a, ra, -1)} A${ra} ${ra} 0 0 0 ${p(a, ra, 1)}Z" fill="${fill}" ${OL}/>`;
  };
  const dot = (c, r, fill, extra = '') => `<circle cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r}" fill="${fill}" ${OL} ${extra}/>`;
  const shoe = (k, f, fill) => {
    const L = dist(k, f) || 1; let tx = -(f[1] - k[1]) / L, ty = (f[0] - k[0]) / L;
    if (tx < 0) { tx = -tx; ty = -ty; }
    const heel = [f[0] - tx * 5, f[1] - ty * 5 + 2], toe = [f[0] + tx * 15, f[1] + ty * 15 + 2];
    return `${limb(pt(k, f, .8), f, 6.5, 6.5, '#F4F6FA')}${limb(heel, toe, 8.5, 7, fill)}<path d="M${r1(heel[0])} ${r1(heel[1] + 5)} L${r1(toe[0])} ${r1(toe[1] + 5)}" stroke="${C.band}" stroke-width="3" stroke-linecap="round"/>`;
  };

  const figure = (P, mood) => {
    const sx = P.p[0] - P.n[0], sy = P.p[1] - P.n[1], sl = Math.hypot(sx, sy) || 1, qx = -sy / sl, qy = sx / sl;
    const off = (c, r) => [c[0] + qx * r, c[1] + qy * r];
    const spineDeg = Math.atan2(sy, sx) * 180 / Math.PI - 90;
    const sh = [off(P.n, -15), off(P.n, 15)], hp = [off(P.p, -15), off(P.p, 15)];
    const ctr = pt(P.n, P.p, .45);
    const jersey = `<path d="M${r1(sh[0][0])} ${r1(sh[0][1])} Q${r1(ctr[0] - qx * 21)} ${r1(ctr[1] - qy * 21)} ${r1(hp[0][0])} ${r1(hp[0][1])} L${r1(hp[1][0])} ${r1(hp[1][1])} Q${r1(ctr[0] + qx * 21)} ${r1(ctr[1] + qy * 21)} ${r1(sh[1][0])} ${r1(sh[1][1])} Z" fill="${C.jersey}" ${OL}/>
      <path d="M${r1(sh[0][0] + (P.p[0] - P.n[0]) * .12)} ${r1(sh[0][1] + (P.p[1] - P.n[1]) * .12)} Q${r1(P.n[0] + sx * .22)} ${r1(P.n[1] + sy * .22)} ${r1(sh[1][0] + sx * .12)} ${r1(sh[1][1] + sy * .12)}" fill="none" stroke="${C.trim}" stroke-width="3"/>
      <text x="${r1(ctr[0])}" y="${r1(ctr[1] + 6)}" font-family="Archivo, sans-serif" font-weight="900" font-size="17" fill="${C.trim}" text-anchor="middle" stroke="${C.ink}" stroke-width="1" transform="rotate(${r1(spineDeg)} ${r1(ctr[0])} ${r1(ctr[1])})">23</text>`;
    const short = (k, fill) => limb(pt(P.p, k, .05), pt(P.p, k, .55), 15, 12.5, fill);

    // Head
    const tilt = Math.atan2(P.h[1] - P.n[1], P.h[0] - P.n[0]) * 180 / Math.PI + 90;
    const [hx, hy] = P.h;
    const hurt = mood === 'hurt', focus = mood === 'focus', happy = mood === 'happy';
    const eye = hurt
      ? `<path d="M${hx + 4} ${hy - 6} l6 4 l-6 4" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<ellipse cx="${hx + 8}" cy="${hy - 2}" rx="4.2" ry="5" fill="#fff" stroke="${C.ink}" stroke-width="1.5"/><circle cx="${hx + 9.6}" cy="${hy - 1.6}" r="2.3" fill="${C.ink}"/>`;
    const brow = `<path d="M${hx + 3} ${hy - (focus ? 9 : 11)} L${hx + 13} ${hy - (focus ? 7 : 12)}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>`;
    const mouth = hurt ? `<ellipse cx="${hx + 11}" cy="${hy + 10}" rx="3.6" ry="4.6" fill="#5A1A14" stroke="${C.ink}" stroke-width="1.5"/>`
      : happy ? `<path d="M${hx + 5} ${hy + 7} q6 7 13 0" fill="#fff" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>`
      : `<path d="M${hx + 7} ${hy + 10} l${focus ? 9 : 8} ${focus ? 0 : -1}" stroke="${C.ink}" stroke-width="2.4" stroke-linecap="round"/>`;
    const head = `<g transform="rotate(${r1(tilt)} ${r1(hx)} ${r1(hy)})">
      <circle cx="${hx - 4}" cy="${hy + 2}" r="6" fill="${C.skin}" ${OL}/>
      <circle cx="${hx}" cy="${hy}" r="20" fill="${C.skin}" ${OL}/>
      <circle cx="${hx + 19}" cy="${hy + 2}" r="4.5" fill="${C.skin}"/>
      <path d="M${hx - 20} ${hy - 2} Q${hx - 20} ${hy - 26} ${hx + 2} ${hy - 25} Q${hx + 20} ${hy - 24} ${hx + 18} ${hy - 9} L${hx - 18} ${hy - 7}Z" fill="${C.ink}"/>
      <path d="M${hx - 20} ${hy - 7} L${hx + 19} ${hy - 9}" stroke="${C.band}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${hx - 4}" cy="${hy + 2}" r="2.4" fill="${C.skin2}"/>
      ${eye}${brow}${mouth}
      ${hurt ? `<path d="M${hx - 22} ${hy - 14} q-5 8 0 10 q5 -2 0 -10Z" fill="#9FD8F5" stroke="${C.ink}" stroke-width="1.5"/>` : ''}
    </g>`;

    return `<g>
      ${limb(P.n, P.le, 8, 7, C.skin2)}${limb(P.le, P.lh, 7, 6, C.skin2)}${dot(P.lh, 8, C.skin2)}
      ${limb(P.p, P.lk, 11, 9, C.skin2)}${limb(P.lk, P.lf, 9, 6.5, C.skin2)}${shoe(P.lk, P.lf, '#DDE3EC')}${short(P.lk, '#121B30')}
      ${limb(P.n, pt(P.n, P.h, .7), 7, 7, C.skin)}
      ${limb(P.p, P.rk, 11, 9, C.skin)}${limb(P.rk, P.rf, 9, 6.5, C.skin)}${shoe(P.rk, P.rf, '#FFFFFF')}
      ${jersey}${short(P.rk, C.shorts)}
      <path d="M${r1(hp[0][0])} ${r1(hp[0][1])} L${r1(hp[1][0])} ${r1(hp[1][1])}" stroke="${C.shorts}" stroke-width="9" stroke-linecap="round"/>
      ${head}
      ${limb(P.n, P.re, 8.5, 7.5, C.skin)}${limb(P.re, P.rh, 7.5, 6.5, C.skin)}${limb(pt(P.re, P.rh, .68), pt(P.re, P.rh, .86), 8, 8, C.band)}
      ${dot(P.rh, 8.5, C.skin)}
    </g>`;
  };

  const gym = (() => {
    let planks = '';
    for (let i = 0; i < 9; i++) planks += `<line x1="0" y1="${410 + i * 5 + i * i * .4}" x2="800" y2="${410 + i * 5 + i * i * .4}" stroke="#C99E6B" stroke-width="1" opacity=".55"/>`;
    for (let i = 0; i < 14; i++) planks += `<line x1="${(i * 67) % 800}" y1="${412 + (i % 6) * 6}" x2="${(i * 67) % 800 + 40}" y2="${412 + (i % 6) * 6}" stroke="#B88A55" stroke-width="1" opacity=".4"/>`;
    let seats = '';
    for (let r = 0; r < 4; r++) seats += `<rect x="0" y="${270 + r * 30}" width="${300 - r * 40}" height="30" fill="${r % 2 ? '#D9D3C7' : '#E1DBD0'}"/>`;
    return `<defs><linearGradient id="gwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8EDF4"/><stop offset="1" stop-color="#F3EFE6"/></linearGradient>
      <linearGradient id="gfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6C394"/><stop offset="1" stop-color="#D3A86F"/></linearGradient>
      <radialGradient id="gball" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F7A15B"/><stop offset="1" stop-color="#D9621E"/></radialGradient></defs>
      <rect width="800" height="404" fill="url(#gwall)"/>
      <rect y="232" width="800" height="10" fill="#0B7A68" opacity=".18"/>
      ${seats}
      <g opacity=".85"><rect x="40" y="40" width="150" height="56" rx="6" fill="#0B1220"/><text x="115" y="77" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="900" font-size="26" fill="#45E3BF" letter-spacing="2">CAVA</text></g>
      ${[230, 300, 370].map((x, i) => `<path d="M${x} 20 l26 0 l-13 34z" fill="${['#FF7A3D', '#45E3BF', '#4338CA'][i]}" stroke="${C.ink}" stroke-width="2"/>`).join('')}
      <line x1="210" y1="20" x2="420" y2="20" stroke="${C.ink}" stroke-width="2"/>
      <rect y="404" width="800" height="46" fill="url(#gfloor)"/>${planks}
      <path d="M520 404 L800 404 L800 450 L470 450 Z" fill="#FF7A3D" opacity=".28"/>
      <path d="M520 404 L470 450" stroke="#fff" stroke-width="3"/>
      <line x1="0" y1="404" x2="800" y2="404" stroke="#B88A55" stroke-width="2"/>`;
  })();

  const hoop = (bend, stretch) => {
    const net = (() => {
      const top = [574, 590, 606, 622, 638], bot = [588, 598, 608, 618, 628], by = 236 + stretch * 22, sq = stretch * 6;
      let d = '';
      top.forEach((x, i) => { d += `M${x} 194 L${bot[i] - sq * (i - 2) * .3} ${by}`; });
      for (let k = 1; k <= 3; k++) {
        const y = 194 + (by - 194) * k / 4, w = lerp(32, 20 - sq, k / 4);
        d += `M${606 - w} ${y} ${[...Array(6)].map((_, j) => `L${r1(606 - w + j * w * 2 / 5)} ${r1(y + (j % 2 ? 4 : 0))}`).join(' ')}`;
      }
      return `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".95"/><path d="${d}" fill="none" stroke="#9AA6B8" stroke-width=".8" stroke-linecap="round"/>`;
    })();
    return {
      back: `<rect x="700" y="160" width="14" height="244" rx="4" fill="#3A4456" stroke="${C.ink}" stroke-width="3"/>
        <rect x="696" y="330" width="22" height="74" rx="6" fill="#1A2540" stroke="${C.ink}" stroke-width="3"/>
        <path d="M707 176 L664 196 M707 200 L664 214" stroke="#3A4456" stroke-width="7" stroke-linecap="round"/>
        <rect x="652" y="86" width="16" height="152" rx="4" fill="#F4F6FA" stroke="${C.ink}" stroke-width="3"/>
        <rect x="652" y="226" width="16" height="16" rx="4" fill="#FF7A3D" stroke="${C.ink}" stroke-width="3"/>
        <g transform="rotate(${r1(bend)} 652 194)"><ellipse cx="610" cy="194" rx="40" ry="7" fill="none" stroke="#B9461A" stroke-width="5"/></g>`,
      front: `<g transform="rotate(${r1(bend)} 652 194)">${net}<path d="M570 194 A40 7 0 0 0 650 194" fill="none" stroke="${C.ink}" stroke-width="9"/><path d="M570 194 A40 7 0 0 0 650 194" fill="none" stroke="#FF7A3D" stroke-width="5"/><rect x="646" y="189" width="8" height="10" fill="#3A4456"/></g>`
    };
  };

  const ballArt = (b, rot, squash, ghost = 1) => `<g opacity="${ghost}" transform="translate(${r1(b[0])} ${r1(b[1])}) scale(${r1(1 + (1 - squash) * .5) / 1} ${r1(squash)}) rotate(${r1(rot)})">
    <circle r="15" fill="url(#gball)" stroke="${C.ink}" stroke-width="3"/>
    <path d="M-15 0 H15 M0 -15 V15 M-10 -11 Q-3 0 -10 11 M10 -11 Q3 0 10 11" fill="none" stroke="${C.ink}" stroke-width="1.8"/></g>`;

  const POSES = {
    dribble: { h: [200, 232], n: [205, 254], p: [196, 322], re: [232, 288], rh: [252, 318], le: [180, 288], lh: [172, 316], rk: [228, 362], rf: [214, 398], lk: [180, 364], lf: [150, 396] },
    dribble2: { h: [270, 236], n: [273, 258], p: [262, 324], re: [298, 290], rh: [318, 318], le: [248, 290], lh: [236, 314], rk: [248, 366], rf: [222, 396], lk: [292, 362], lf: [306, 398] },
    gather: { h: [372, 266], n: [369, 288], p: [348, 346], re: [392, 304], rh: [408, 280], le: [382, 312], lh: [400, 288], rk: [382, 372], rf: [374, 398], lk: [338, 380], lf: [326, 398] },
    takeoff: { h: [430, 196], n: [427, 218], p: [412, 286], re: [452, 186], rh: [474, 152], le: [402, 248], lh: [392, 272], rk: [442, 326], rf: [430, 372], lk: [398, 338], lf: [390, 382] },
    rise: { h: [500, 166], n: [497, 188], p: [482, 254], re: [522, 148], rh: [546, 116], le: [472, 220], lh: [462, 248], rk: [504, 296], rf: [494, 340], lk: [468, 298], lf: [452, 336] },
    catch: { h: [530, 160], n: [530, 182], p: [512, 248], re: [558, 150], rh: [584, 192], le: [508, 216], lh: [494, 242], rk: [528, 296], rf: [514, 336], lk: [500, 292], lf: [488, 334] },
    fall: { h: [520, 258], n: [540, 268], p: [508, 326], re: [568, 232], rh: [586, 194], le: [516, 296], lh: [496, 306], rk: [534, 364], rf: [516, 396], lk: [492, 354], lf: [474, 390] },
    down: { h: [440, 304], n: [442, 327], p: [446, 390], re: [468, 352], rh: [494, 364], le: [460, 342], lh: [482, 360], rk: [490, 368], rf: [540, 396], lk: [484, 380], lf: [532, 402] },
    dunk: { h: [548, 146], n: [546, 168], p: [526, 234], re: [574, 136], rh: [604, 178], le: [522, 200], lh: [508, 226], rk: [542, 280], rf: [530, 320], lk: [512, 276], lf: [500, 318] },
    hang: { h: [566, 204], n: [566, 226], p: [556, 294], re: [584, 206], rh: [598, 192], le: [548, 258], lh: [540, 286], rk: [566, 338], rf: [560, 376], lk: [548, 336], lf: [540, 374] },
    land: { h: [500, 266], n: [502, 288], p: [492, 348], re: [532, 296], rh: [552, 268], le: [476, 302], lh: [456, 276], rk: [524, 374], rf: [516, 398], lk: [470, 376], lf: [476, 398] }
  };
  const BALL = { dribble: 'bounce', dribble2: 'bounce', gather: [410, 272], takeoff: [478, 140], rise: [552, 104], catch: [606, 236], fall: [636, 372], down: [700, 390], dunk: [606, 190], hang: [610, 300], land: [652, 390] };
  const MOOD = { dribble: 'calm', dribble2: 'calm', gather: 'focus', takeoff: 'focus', rise: 'focus', catch: 'hurt', fall: 'hurt', down: 'hurt', dunk: 'focus', hang: 'happy', land: 'happy' };

  const scene = (el, keys, hurtAt = []) => {
    const svg = el.querySelector('svg') || el.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    svg.setAttribute('viewBox', '0 0 800 450');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', el.dataset.label || '');
    const n = keys.length - 1;
    const poseAt = t => {
      const i = Math.min(Math.floor(t), n - 1), f = ease(Math.min(1, t - i));
      return { i, f, P: mix(POSES[keys[i]], POSES[keys[i + 1]], f) };
    };
    const ballAt = (t, P, i, f) => {
      const A = BALL[keys[i]], B = BALL[keys[i + 1]];
      if (A === 'bounce') {
        const hand = [P.rh[0] + 4, P.rh[1] + 16], to = B === 'bounce' ? hand : B;
        const base = pt(hand, to, B === 'bounce' ? 0 : f * f);
        const hop = B === 'bounce' ? Math.sin(Math.PI * f * 2) ** 2 : Math.sin(Math.PI * Math.min(f * 2, 1)) * (1 - f);
        return [base[0], base[1] + (389 - base[1]) * hop];
      }
      return pt(A, B === 'bounce' ? [P.rh[0] + 4, P.rh[1] + 16] : B, f);
    };
    const draw = t => {
      t = Math.max(0, Math.min(n, t));
      const { i, f, P } = poseAt(t);
      const b = ballAt(t, P, i, f);
      const hurt = hurtAt.length ? Math.max(0, ...hurtAt.map(k => 1 - Math.abs(t - k) * 1.4)) : 0;
      const mood = hurt > .25 ? 'hurt' : MOOD[keys[f < .5 ? i : i + 1]];
      const nearRim = Math.max(0, 1 - dist(P.rh, [596, 193]) / 26);
      const bend = Math.max(hurt * 7, nearRim * 5);
      const stretch = Math.max(0, 1 - Math.abs(b[1] - 236) / 40) * (Math.abs(b[0] - 608) < 24 ? 1 : 0);
      const H = hoop(bend, stretch);
      // Motion trail + speed lines scale with how far the body travels in this segment
      const speed = dist(POSES[keys[i]].p, POSES[keys[i + 1]].p) / 120 * Math.sin(Math.PI * f);
      const trail = [.05, .1, .15].map((d, k) => {
        if (t - d < 0) return '';
        const q = poseAt(t - d);
        return ballArt(ballAt(t - d, q.P, q.i, q.f), 0, 1, .18 - k * .05);
      }).join('');
      const lines = speed > .12 ? [0, 1, 2].map(k => `<line x1="${r1(P.p[0] - 50 - k * 8)}" y1="${r1(P.n[1] + 10 + k * 22)}" x2="${r1(P.p[0] - 90 - k * 16)}" y2="${r1(P.n[1] + 10 + k * 22)}" stroke="${C.ink}" stroke-width="3" stroke-linecap="round" opacity="${r1(Math.min(.5, speed))}"/>`).join('') : '';
      const air = 404 - Math.max(P.lf[1], P.rf[1]);
      const sh = `<ellipse cx="${r1((P.lf[0] + P.rf[0]) / 2)}" cy="410" rx="${r1(Math.max(18, 46 - air * .12))}" ry="5" fill="${C.ink}" opacity="${r1(Math.max(.06, .22 - air * .0012))}"/>`;
      const squash = b[1] > 382 ? .82 : 1;
      const rot = t * 420;
      const ballFront = b[0] < 560;
      const burstAt = pt(P.re, P.rh, .5);
      const burst = hurt > .35 && t < hurtAt[1] + .4 ? `<g transform="translate(${r1(burstAt[0])} ${r1(burstAt[1])}) scale(${r1(.45 + hurt * .4)})"><path d="M0 -26 L7 -9 L24 -12 L12 1 L22 16 L4 10 L-4 26 L-8 9 L-25 12 L-12 -2 L-22 -16 L-5 -10Z" fill="#FFD23F" stroke="${C.ink}" stroke-width="2.5" opacity=".9"/></g>` : '';
      const ouch = mood === 'hurt' && t > hurtAt[hurtAt.length - 1] - .6 ? [0, 1, 2].map(k => `<path d="M${r1(P.rh[0] + 12 + k * 8)} ${r1(P.rh[1] - 14 - k * 4)} l6 -8" stroke="#E2483D" stroke-width="3" stroke-linecap="round"/>`).join('') : '';
      svg.innerHTML = `${gym}${H.back}${sh}${lines}${trail}${ballFront ? '' : ballArt(b, rot, squash)}${H.front}${burst}${figure(P, mood)}${ballFront ? ballArt(b, rot, squash) : ''}${ouch}`;
    };
    draw.n = n;
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

  /* ---------- Cartoon ROM demos with a live protractor ---------- */
  const polar = (c, r, deg) => [c[0] + r * Math.cos(deg * Math.PI / 180), c[1] - r * Math.sin(deg * Math.PI / 180)];
  const sector = (c, r, a0, a1) => {
    const p0 = polar(c, r, a0), p1 = polar(c, r, a1);
    return `M${r1(c[0])} ${r1(c[1])} L${r1(p0[0])} ${r1(p0[1])} A${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 0 : 1} ${r1(p1[0])} ${r1(p1[1])}Z`;
  };
  const ticks = (c, r, a0, a1, step = 15) => {
    let d = '';
    for (let a = a0; a <= a1; a += step) { const p = polar(c, r, a), q = polar(c, r + (a % 45 ? 5 : 9), a); d += `M${r1(p[0])} ${r1(p[1])}L${r1(q[0])} ${r1(q[1])}`; }
    return `<path d="${d}" stroke="#065A4D" stroke-width="2" stroke-linecap="round"/>`;
  };
  const readout = (x, y, deg, label) => `<text x="${x}" y="${y}" font-family="Archivo, sans-serif" font-weight="900" font-size="30" fill="${C.ink}">${Math.round(Math.abs(deg))}°</text><text x="${x}" y="${y + 18}" font-family="JetBrains Mono, monospace" font-size="11" letter-spacing="1" fill="#065A4D">${label.toUpperCase()}</text>`;

  const ROM2 = {
    // Side view: forearm on a table, wrist bends up (extension) and down (flexion)
    wrist: (opts = {}) => {
      const W = [196, 132], lo = opts.lo ?? -60, hi = opts.hi ?? 55;
      const bell = opts.weight ? `<circle cx="244" cy="132" r="19" fill="#3A4456" ${OL}/><circle cx="244" cy="132" r="7" fill="#8E9AAD"/>` : '';
      const hand = `${bell}${limb(W, [236, 132], 14, 12, C.skin)}${limb([224, 120], [246, 124], 6, 5, C.skin)}${limb([236, 142], [252, 140], 6.5, 6, C.skin)}${limb([234, 120], [250, 112], 5.5, 5, C.skin)}`;
      const base = `<rect x="0" y="0" width="320" height="230" fill="#F5F3EE"/>
        <rect x="18" y="148" width="182" height="16" rx="5" fill="#C99E6B" ${OL}/><rect x="34" y="164" width="12" height="54" fill="#B88A55" ${OL}/><rect x="170" y="164" width="12" height="54" fill="#B88A55" ${OL}/>
        ${ticks(W, 82, -60, 60)}
        ${limb([40, 132], W, 15, 12, C.skin)}${limb([96, 132], [150, 132], 15.5, 14, C.band)}`;
      return {
        frame: p => {
          const a = lerp(lo, hi, p);
          return `${base}<path d="${sector(W, 78, 0, a)}" fill="${C.band}" fill-opacity=".35" stroke="#0B7A68" stroke-width="2"/>
            <g transform="rotate(${r1(-a)} ${W[0]} ${W[1]})">${hand}</g>${dot(W, 6, '#fff')}
            ${readout(18, 40, a, a >= 0 ? 'Extension' : 'Flexion')}`;
        }
      };
    },
    // Forearm from above + end-on dial: palm turns down (pronation) and up (supination)
    prosup: () => {
      const D = [250, 96];
      const base = `<rect width="320" height="230" fill="#F5F3EE"/>
        <circle cx="${D[0]}" cy="${D[1]}" r="48" fill="#fff" ${OL}/>${ticks(D, 48, -90, 90, 15).replace('stroke-width="2"', 'stroke-width="2" transform="rotate(-90 ' + D[0] + ' ' + D[1] + ')"')}
        <text x="${D[0] - 70}" y="${D[1] + 70}" font-family="JetBrains Mono, monospace" font-size="10" fill="#596476">PALM DOWN</text><text x="${D[0] + 14}" y="${D[1] + 70}" font-family="JetBrains Mono, monospace" font-size="10" fill="#596476">PALM UP</text>
        ${limb([20, 196], [100, 196], 15, 12, C.skin)}`;
      return {
        frame: p => {
          const a = lerp(-80, 80, p), w = 6 + 15 * Math.abs(Math.sin(a * Math.PI / 180)), up = a > 0;
          const handFill = up ? '#E2B48C' : C.skin;
          const needle = polar(D, 40, 90 - a), back = polar(D, 40, 270 - a), palm = polar(D, 16, -a);
          return `${base}
            <path d="${sector(D, 46, 90, 90 - a)}" fill="${C.band}" fill-opacity=".35" stroke="#0B7A68" stroke-width="2"/>
            ${limb(back, needle, 10, 10, C.skin)}${dot(palm, 5, up ? C.band : '#94603F')}
            <ellipse cx="132" cy="196" rx="32" ry="${r1(w)}" fill="${handFill}" ${OL}/>
            ${up ? `<path d="M114 196 q18 ${r1(w * .5)} 36 0" fill="none" stroke="#94603F" stroke-width="2"/>` : `<path d="M122 ${r1(196 - w * .5)} v${r1(w)} M134 ${r1(196 - w * .6)} v${r1(w * 1.2)} M146 ${r1(196 - w * .5)} v${r1(w)}" stroke="#94603F" stroke-width="1.6"/>`}
            ${readout(18, 40, a, up ? 'Supination' : 'Pronation')}`;
        }
      };
    },
    // Standing player pulls a band from high on one side to low across the body
    chop: () => {
      const A = [22, 26], S = [176, 96];
      const legs = `${limb([176, 150], [156, 204], 11, 9, C.skin2)}${shoe([156, 180], [156, 206], '#DDE3EC')}${limb([176, 150], [198, 204], 11, 9, C.skin)}${shoe([198, 180], [198, 206], '#fff')}`;
      const arc = `<path d="M${polar(S, 80, 140).map(r1).join(' ')} A80 80 0 0 1 ${polar(S, 80, -35).map(r1).join(' ')}" fill="none" stroke="#0B7A68" stroke-width="2.5" stroke-dasharray="5 6"/>`;
      return {
        frame: p => {
          const th = lerp(140, -35, p), H = polar(S, 74, th), E = polar(S, 40, th + 18);
          const stretch = dist(A, H) / 220;
          const sh = [S[0] + p * 6, S[1]];
          return `<rect width="320" height="230" fill="#F5F3EE"/><rect x="0" y="0" width="14" height="230" fill="#C7C0B2"/><circle cx="${A[0]}" cy="${A[1]}" r="6" fill="#3A4456"/>
            <rect y="208" width="320" height="22" fill="#E6C394"/>${arc}
            <path d="${sector(S, 80, 140, th)}" fill="${C.band}" fill-opacity=".25"/>
            <line x1="${A[0]}" y1="${A[1]}" x2="${r1(H[0])}" y2="${r1(H[1])}" stroke="${C.band}" stroke-width="${r1(7 - stretch * 3)}" stroke-linecap="round"/>
            ${legs}${limb(sh, [176, 150], 18, 16, C.jersey)}${limb([176, 140], [176, 152], 17, 17, C.shorts)}
            ${limb(sh, E, 8, 7, C.skin2)}${limb(E, H, 7, 6, C.skin2)}
            <circle cx="${r1(sh[0] + 2)}" cy="60" r="18" fill="${C.skin}" ${OL}/><path d="M${r1(sh[0] - 16)} 56 Q${r1(sh[0])} 34 ${r1(sh[0] + 18)} 52Z" fill="${C.ink}"/><path d="M${r1(sh[0] - 17)} 53 L${r1(sh[0] + 19)} 50" stroke="${C.band}" stroke-width="5" stroke-linecap="round"/>
            <circle cx="${r1(sh[0] + 10)}" cy="62" r="2.4" fill="${C.ink}"/>
            ${limb(sh, polar(S, 36, th + 8), 8.5, 7.5, C.skin)}${limb(polar(S, 36, th + 8), H, 7.5, 6.5, C.skin)}
            <rect x="${r1(H[0] - 10)}" y="${r1(H[1] - 5)}" width="20" height="10" rx="5" fill="#1A2540" ${OL}/>
            ${readout(26, 132, 140 - th, 'Arc')}`;
        }
      };
    }
  };
  const ROM_MAP = { flex: ['wrist', {}], curl: ['wrist', { weight: 1, lo: -55, hi: 15 }], ext: ['wrist', { weight: 1, lo: -5, hi: 55 }], prosup: ['prosup'], chop: ['chop'] };
  const live = [];
  $$('[data-rom]').forEach(el => {
    const m = ROM_MAP[el.dataset.rom];
    if (!m) return;
    const r = ROM2[m[0]](m[1]);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 320 230');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', (ROM[el.dataset.rom] || {}).label + '. Animated demo with the angle shown in degrees.');
    el.replaceChildren(svg);
    const item = { svg, r, on: false, period: 4200 + Math.random() * 600 };
    svg.innerHTML = r.frame(reduce ? 1 : 0);
    live.push(item);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { item.on = e.isIntersecting; }).observe(el);
  });
  if (live.length && !reduce) {
    const loop = now => {
      live.forEach(it => { if (it.on) it.svg.innerHTML = it.r.frame((1 - Math.cos(2 * Math.PI * now / it.period)) / 2); });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Video facades: inline when hosted, YouTube tab when opened from a file ---------- */
  $$('[data-yt]').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.yt;
    if (!/^https?:$/.test(location.protocol)) { window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener'); return; }
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    f.title = btn.getAttribute('aria-label');
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    btn.replaceWith(f);
  }));

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
  const drawInjury = injuryEl && scene(injuryEl, ['dribble', 'dribble2', 'gather', 'takeoff', 'catch', 'fall', 'down'], [4.4, 5, 6]);
  const heroEl = $('#hero-scene');
  const drawHero = heroEl && scene(heroEl, ['dribble', 'dribble2', 'gather', 'rise', 'dunk', 'hang', 'land']);
  drawInjury?.(reduce ? 4.4 : 0);
  drawHero?.(reduce ? 4 : 0);

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
    [[injuryEl, drawInjury], [heroEl, drawHero]].forEach(([el, draw]) => {
      if (!el) return;
      const n = draw.n;
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
      [['bring', 'wear', 'prepare'], 'Bring any X-rays or doctor notes you have, and wear clothes you can move in.'],
      [['how often', 'sessions', 'per week', 'times a week', 'frequency'], 'Most plans have PT sessions every other day, around 3 to 4 times a week. Your PT sets the exact number for you.'],
      [['how long', 'recovery time', 'weeks', 'months'], 'It depends on the injury. Flexibility often comes back in a few weeks, while strength for sports can take a few months.'],
      [['pain', 'hurt', 'swelling', 'stop', 'sore'], 'Stop doing exercises immediately if pain or swelling occurs. Weights should make your muscles feel tired, not hurt.'],
      [['injury', 'injuries', 'treat', 'knee', 'shoulder', 'ankle', 'back', 'wrist', 'sprain', 'fracture'], 'We work with athletes recovering from many injuries, like broken bones, sprains, sore knees and shoulder problems. The intake form helps us learn about yours.'],
      [['surgery', 'after surgery', 'post op'], 'After surgery, PT starts once your surgeon says it is safe. We begin with gentle range of motion, then add strength.'],
      [['exercise', 'exercises', 'home', 'at home'], 'Every plan includes exercises you can do at home. See the Exercises page for videos and simple step-by-step demos.'],
      [['return', 'play again', 'back to sport', 'game'], 'We bring sport drills back slowly and only after your doctor clears you, so you return safely.'],
      [['prevent', 'prevention', 'avoid injury'], 'Strength, mobility and good form all help prevent injuries. We build those into every plan.'],
      [['fear', 'scared', 'anxiety', 'confidence', 'kinesiophobia'], 'Being afraid to get hurt again is called kinesiophobia. It is common and treatable, and our network includes mental performance consultants who can help.'],
      [['network', 'specialist', 'surgeon', 'hand therapist', 'trainer', 'experts'], 'CAVA gives athletes and weekend warriors access to a wide network of interdisciplinary experts, like surgeons, hand therapists, trainers and mental performance consultants.'],
      [['cost', 'price', 'free'], 'CAVA gives athletes access to free exercise plans and personalized rehabilitation plans.'],
      [['book', 'sign up', 'start', 'intake', 'join', 'contact'], 'You can start with the intake form on the home page. It takes about a minute.'],
      [['jackson', 'patient story', 'dunk'], 'Jackson broke both bones in his forearm when his arm caught on the rim during a dunk. Read his full story on the Patient Story page.'],
      [['orif', 'plates', 'screws'], 'ORIF stands for Open Reduction and Internal Fixation. Broken bones are moved back into line and held with metal plates and screws.'],
      [['range of motion', 'rom', 'flexion', 'degrees'], 'Range of motion is how far a joint can move, measured in degrees. We measure it with a goniometer at every visit to track progress.'],
      [['story', 'founded', 'started', 'why cava', 'about'], 'CAVA started with four friends, Colby, Ashu, Vasanth, and Armaghan, who all enjoy playing sports. Read more on the Our Story page.'],
      [['team', 'founders', 'who are you'], 'The founders are Colby, Ashutosh (Ashu), Vasanth and Armaghan.'],
      [['hi', 'hello', 'hey'], 'Hi! Ask me about physical therapy, what to expect, exercises, or how to get started.']
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
