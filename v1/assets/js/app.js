/* Dheco nieuw ontwerp — vanilla JS, geen libraries */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer:fine)').matches;
root.classList.remove('js-off');

/* ====== CONFIG ====== */
// Formspree-klaar: vul hier het endpoint in (bv. 'https://formspree.io/f/xxxxxxx'). Leeg = mailto-fallback naar info@dheco.be
const FORM_ENDPOINT = '';
const MAIL = 'info@dheco.be';

/* ====== header / menu ====== */
const burger = $('.burger'), mnav = $('.mnav');
if (burger) burger.addEventListener('click', () => {
  const o = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', String(!o));
  mnav.classList.toggle('open', !o);
  document.body.style.overflow = o ? '' : 'hidden';
});
$$('.dd > button').forEach(b => b.addEventListener('click', () => {
  const d = b.parentElement, o = d.classList.toggle('open'); b.setAttribute('aria-expanded', String(o));
}));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { $$('.dd.open').forEach(d => d.classList.remove('open')); if (mnav && mnav.classList.contains('open')) burger.click(); } });

/* ====== reveal + split words ====== */
$$('.split-words').forEach(el => {
  const txt = el.innerHTML; let i = 0;
  el.innerHTML = txt.replace(/(<[^>]+>)|([^<\s]+)/g, (m, tag, w) => tag ? tag : `<span class="w"><span style="--i:${i++}">${w}</span></span>`).replace(/<\/span><\/span>(\s)<span class="w">/g, '</span></span>$1<span class="w">');
});
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
$$('.rv,.split-words').forEach(el => io.observe(el));

/* ====== hero ====== */
const hero = $('.hero');
if (hero) {
  const open = () => hero.classList.add('open');
  setTimeout(open, reduce ? 0 : 500);
  const stage = $('.hero-stage');
  addEventListener('pointermove', e => {
    if (!stage || !fine) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    stage.style.setProperty('--shine', (x * 180 - 90) + '%');
  }, { passive: true });
  const upd = () => {
    const h = innerHeight; const y = scrollY;
    hero.style.setProperty('--hp', Math.min(1, y / h).toFixed(3));
  };
  addEventListener('scroll', upd, { passive: true }); upd();
}

/* ====== counters ====== */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, to = +el.dataset.to, from = +(el.dataset.from || 0), dur = 1800;
  if (reduce) { el.textContent = to; return; }
  const t0 = performance.now();
  const tick = t => { const p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(from + (to - from) * k); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: .6 });
$$('[data-to]').forEach(el => cio.observe(el));

/* ====== bento spotlight ====== */
$$('.tile').forEach(t => t.addEventListener('pointermove', e => {
  const r = t.getBoundingClientRect(); t.style.setProperty('--mx', (e.clientX - r.left) + 'px'); t.style.setProperty('--my', (e.clientY - r.top) + 'px');
}));

/* ====== magnetic buttons + cursor ====== */
if (fine && !reduce) {
  const ring = document.createElement('div'), dot = document.createElement('div');
  ring.className = 'cur'; dot.className = 'cur-dot'; document.body.append(ring, dot);
  let x = 0, y = 0, rx = 0, ry = 0, shown = false;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; if (!shown) { shown = true; ring.classList.add('on'); dot.classList.add('on'); rx = x; ry = y; } });
  document.addEventListener('mouseleave', () => { ring.classList.remove('on'); dot.classList.remove('on'); shown = false; });
  (function loop() { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; dot.style.transform = `translate(${x}px,${y}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('pointerover', e => { ring.classList.toggle('big', !!e.target.closest('a,button,.tile,.ba,summary,label')); });
  $$('.btn').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px,${(e.clientY - r.top - r.height / 2) * .28}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
}

/* ====== process (sticky storytelling) ====== */
const steps = $$('.step');
if (steps.length) {
  const imgs = $$('.proc-vis img'), num = $('.proc-vis .num');
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const i = steps.indexOf(e.target);
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    imgs.forEach((m, k) => m.classList.toggle('on', k === i));
    if (num) num.textContent = '0' + (i + 1);
  }), { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(s => so.observe(s));
  steps[0].classList.add('on'); imgs[0] && imgs[0].classList.add('on');
}

/* ====== before / after ====== */
$$('.ba').forEach(ba => {
  const inp = $('input', ba);
  const set = v => ba.style.setProperty('--p', v + '%');
  inp.addEventListener('input', () => set(inp.value)); set(inp.value);
  if (!reduce) { // kleine intro-animatie
    const bo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { bo.disconnect(); let t0 = performance.now(); const f = t => { const p = Math.min(1, (t - t0) / 1600); const v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p); inp.value = v; set(v); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); } }), { threshold: .6 });
    bo.observe(ba);
  }
});

/* ====== reviews ====== */
const rt = $('.rev-track');
if (rt) {
  const card = () => $('.rcard', rt).getBoundingClientRect().width + 16;
  $('[data-rev=prev]').addEventListener('click', () => rt.scrollBy({ left: -card(), behavior: 'smooth' }));
  $('[data-rev=next]').addEventListener('click', () => rt.scrollBy({ left: card(), behavior: 'smooth' }));
  let paused = false, last = 0;
  ['pointerenter', 'focusin', 'touchstart'].forEach(ev => rt.addEventListener(ev, () => paused = true, { passive: true }));
  ['pointerleave', 'focusout'].forEach(ev => rt.addEventListener(ev, () => paused = false));
  if (!reduce) setInterval(() => {
    if (paused || document.hidden) return;
    const r = rt.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    if (rt.scrollLeft + rt.clientWidth >= rt.scrollWidth - 8) rt.scrollTo({ left: 0, behavior: 'smooth' }); else rt.scrollBy({ left: card(), behavior: 'smooth' });
  }, 5200);
}

/* ====== open-now (Europe/Brussels) ====== */
function isOpen() {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Brussels', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value; const wd = g('weekday'), m = +g('hour') * 60 + +g('minute');
  return !['Sat', 'Sun'].includes(wd) && m >= 8 * 60 && m < 16 * 60 + 30;
}
const openNow = isOpen();
$$('[data-open]').forEach(el => { el.classList.toggle('on', openNow); const t = $('.t', el) || el; t.textContent = openNow ? 'Nu bereikbaar' : 'Nu gesloten · ma–vr 8:00–16:30'; });

/* ====== sticky smart CTA ====== */
const scta = $('.scta');
if (scta) {
  const hid = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => { e.isIntersecting ? hid.add(e.target) : hid.delete(e.target); chk(); }), { threshold: .12 });
  ['#offerte-wizard', '#cfg'].forEach(sel => { const t = $(sel); if (t) io.observe(t); });
  const chk = () => scta.classList.toggle('show', scrollY > innerHeight * .6 && !hid.size);
  addEventListener('scroll', chk, { passive: true }); chk();
}

/* ====== page transition fallback ====== */
if (!('startViewTransition' in document)) {
  document.addEventListener('click', e => {
    const a = e.target.closest('a'); if (!a || a.target || e.metaKey || e.ctrlKey || a.origin !== location.origin || a.hash && a.pathname === location.pathname) return;
    e.preventDefault(); document.body.classList.add('leaving'); setTimeout(() => location.href = a.href, 230);
  });
  addEventListener('pageshow', e => { if (e.persisted) document.body.classList.remove('leaving'); });
}

/* ====== map facade ====== */
$$('[data-map]').forEach(b => b.addEventListener('click', () => {
  const f = document.createElement('iframe');
  f.src = 'https://maps.google.com/maps?q=' + encodeURIComponent('Koning Albertstraat 104, 8210 Zedelgem') + '&output=embed';
  f.loading = 'lazy'; f.title = 'Kaart: Dheco, Koning Albertstraat 104, Zedelgem'; f.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3';
  b.parentElement.append(f); b.remove();
}));

/* ====== CONFIGURATOR ====== */
const cfgEl = $('#cfg');
if (cfgEl) {
  const MAT = {
    PVC: { frame: 15, desc: 'Onderhoudsvriendelijk en energiezuinig maatwerk: sterke isolatie, minimale onderhoudsbehoefte, in diverse kleuren en structuren.', colors: [['Wit', '#F4F4F1'], ['Crème', '#E6DCC3'], ['Antraciet', '#3B4046'], ['Eiken decor', '#9A6B40']] },
    Aluminium: { frame: 9, desc: 'Slank, stabiel en kleurvast: ideaal voor grote glaspartijen en hedendaagse architectuur, met weinig onderhoud.', colors: [['Zwart', '#16191C'], ['Antraciet', '#3B4046'], ['Wit', '#ECECEA'], ['Brons', '#6A5646']] },
    Hout: { frame: 13, desc: 'Natuurlijke warmte met tijdloze uitstraling: volledig op maat en af te werken in de kleur of afwerkingslaag die jij verkiest.', colors: [['Naturel eik', '#B98A55'], ['Noten', '#6B4630'], ['Wit geschilderd', '#EDEBE5'], ['Zwart', '#242021']] }
  };
  const S = { soort: 'Raam', mat: 'Aluminium', kleur: 0, vorm: '2', glas: 'Helder', gevel: 'wit', horren: false, rol: false, rolp: 0, open: false };
  const FORMS = { Raam: [['1', '1 vleugel'], ['2', '2 vleugels'], ['vd', 'Vast + draai/kip']], Deur: [['strook', 'Met glasstrook'], ['vol', 'Groot glasvlak'], ['dicht', 'Dicht paneel']] };
  const svg = $('#cfgsvg'); let openT = 0, openTarget = 0, raf = 0;
  const WALL = { wit: '#E9E7E2', steen: '#9A5240', grijs: '#8E959D' };

  const defs = () => `<defs>
   <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfe0f2"/><stop offset=".55" stop-color="#7ea3c9"/><stop offset="1" stop-color="#3f6490"/></linearGradient>
   <linearGradient id="room" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4d9a6"/><stop offset="1" stop-color="#b9855a"/></linearGradient>
   <linearGradient id="refl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
   <pattern id="grain" width="14" height="6" patternUnits="userSpaceOnUse"><path d="M0 1.5h14M0 4.5h9" stroke="#000" stroke-opacity=".13" stroke-width=".8"/></pattern>
   <pattern id="mesh" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 0h4M0 0v4" stroke="#111" stroke-opacity=".38" stroke-width=".5"/></pattern>
   <pattern id="fig" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="#fff" fill-opacity=".5"/><circle cx="9" cy="9" r="2" fill="#fff" fill-opacity=".4"/></pattern>
   <pattern id="brick" width="46" height="22" patternUnits="userSpaceOnUse"><rect width="46" height="22" fill="#7e3f30"/><path d="M0 11h46M23 0v11M0 11v11M46 11v11" stroke="#b9a99a" stroke-width="2"/></pattern>
   <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#000" flood-opacity=".35"/></filter>
  </defs>`;

  const frameFill = (c, mat) => mat === 'Hout' ? `<rect {A} fill="${c}"/><rect {A} fill="url(#grain)"/><rect {A} fill="url(#wood)"/>` : `<rect {A} fill="${c}"/>`;
  const rectFrame = (x, y, w, h, c, mat, rx = 2) => frameFill(c, mat).replaceAll('{A}', `x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"`);
  const glassFill = (id, g) => g === 'Mat' ? '#e8eef4' : 'url(#gl)';
  function pane(x, y, w, h, g, id) {
    let s = `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#room)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${glassFill(id, g)}" fill-opacity="${g === 'Mat' ? .92 : .82}"/>`;
    if (g === 'Figuur') s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#fig)"/>`;
    if (g !== 'Mat') s += `<g style="mix-blend-mode:screen"><polygon points="${x + w * .1},${y + h} ${x + w * .45},${y} ${x + w * .62},${y} ${x + w * .27},${y + h}" fill="url(#refl)"/></g>`;
    return s + '</g>';
  }
  function sashBox(x, y, w, h, c, mat, t, g, hingeLeft, withMesh) {
    // t: 0 dicht … 1 open (perspectief)
    const f = MAT[mat].frame * .62; let pts;
    const k = .5 * t, v = .07 * t;
    if (t === 0) pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
    else if (hingeLeft) pts = [[x, y], [x + w * (1 - k), y + h * v], [x + w * (1 - k), y + h * (1 - v)], [x, y + h]];
    else pts = [[x + w * k, y + h * v], [x + w, y], [x + w, y + h], [x + w * k, y + h * (1 - v)]];
    const P = a => a.map(p => p.join(',')).join(' ');
    const [a, b, cc, d] = pts;
    const innerW = (b[0] - a[0]);
    let s = '';
    // donkere ruimte achter geopend vleugel
    s += `<polygon points="${P(pts)}" fill="${c}" ${mat === 'Hout' ? '' : ''}/>`;
    if (mat === 'Hout') s += `<polygon points="${P(pts)}" fill="url(#grain)"/><polygon points="${P(pts)}" fill="url(#wood)"/>`;
    // glas in vleugel (inset)
    const ins = (pp, d0) => { const cx = pp.reduce((s, p) => s + p[0], 0) / 4, cy = pp.reduce((s, p) => s + p[1], 0) / 4; return pp.map(p => [p[0] + Math.sign(cx - p[0]) * d0, p[1] + Math.sign(cy - p[1]) * d0]); };
    const gp = ins(pts, f);
    s += `<polygon points="${P(gp)}" fill="url(#room)"/><polygon points="${P(gp)}" fill="${g === 'Mat' ? '#e8eef4' : 'url(#gl)'}" fill-opacity="${g === 'Mat' ? .92 : .8}"/>`;
    if (g === 'Figuur') s += `<polygon points="${P(gp)}" fill="url(#fig)"/>`;
    if (g !== 'Mat') { const gx = gp[0][0], gw = gp[1][0] - gp[0][0], gy = gp[0][1], gh = gp[3][1] - gp[0][1]; s += `<polygon points="${gx + gw * .1},${gp[3][1]} ${gx + gw * .42},${gp[0][1]} ${gx + gw * .6},${gp[0][1]} ${gx + gw * .28},${gp[3][1]}" fill="url(#refl)" opacity=".85"/>`; }
    if (withMesh) s += `<polygon points="${P(gp)}" fill="url(#mesh)"/>`;
    // kader-lijn
    s += `<polygon points="${P(pts)}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1"/><polygon points="${P(gp)}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="1"/>`;
    // handgreep
    const hx = hingeLeft ? pts[1][0] - 7 : pts[0][0] + 7, hy = (pts[0][1] + pts[3][1]) / 2;
    s += `<rect x="${hx - 2}" y="${hy - 16}" width="4" height="32" rx="2" fill="#c9ced6" stroke="#6c727c" stroke-width=".6"/>`;
    return s;
  }

  function drawRaam() {
    const m = MAT[S.mat], c = m.colors[S.kleur][1], fw = m.frame;
    const X = 118, Y = 92, W = 244, H = 196;
    let o = '';
    // rolluikkast
    if (S.rol) { o += `<rect x="${X - 8}" y="${Y - 34}" width="${W + 16}" height="30" rx="4" fill="#2f353b"/><rect x="${X - 8}" y="${Y - 34}" width="${W + 16}" height="9" rx="4" fill="#fff" fill-opacity=".08"/>`; }
    // dagkant + kader
    o += `<rect x="${X - 6}" y="${Y - 6}" width="${W + 12}" height="${H + 12}" fill="#000" fill-opacity=".22"/>`;
    o += rectFrame(X, Y, W, H, c, S.mat, 3);
    const gx = X + fw, gy = Y + fw, gw = W - fw * 2, gh = H - fw * 2;
    const hasMesh = S.horren;
    if (S.vorm === '1') {
      o += sashBox(gx, gy, gw, gh, c, S.mat, openT, S.glas, true, hasMesh && openT < .6 ? true : hasMesh);
    } else if (S.vorm === '2') {
      const hw = gw / 2;
      o += sashBox(gx, gy, hw, gh, c, S.mat, 0, S.glas, true, hasMesh);
      o += sashBox(gx + hw, gy, hw, gh, c, S.mat, openT, S.glas, false, hasMesh);
      o += rectFrame(gx + hw - fw * .35, gy, fw * .7, gh, c, S.mat, 0);
    } else { // vast + draai
      const fw1 = gw * .58;
      o += `<g>${pane(gx, gy, fw1, gh, S.glas, 'p')}</g>`;
      if (hasMesh) o += `<rect x="${gx}" y="${gy}" width="${fw1}" height="${gh}" fill="url(#mesh)"/>`;
      o += rectFrame(gx + fw1 - fw * .3, gy, fw * .6, gh, c, S.mat, 0);
      o += sashBox(gx + fw1, gy, gw - fw1, gh, c, S.mat, openT, S.glas, false, hasMesh);
    }
    // vensterbank
    o += `<rect x="${X - 14}" y="${Y + H + 2}" width="${W + 28}" height="10" rx="2" fill="${S.mat === 'Hout' ? '#d6d2c8' : '#cfd3d9'}"/><rect x="${X - 14}" y="${Y + H + 10}" width="${W + 28}" height="3" fill="#000" fill-opacity=".22"/>`;
    // rolluik latten
    if (S.rol) {
      const lh = (H) * S.rolp, n = Math.ceil(lh / 9);
      o += `<g clip-path="url(#rclip)"><clipPath id="rclip"><rect x="${X}" y="${Y}" width="${W}" height="${H}"/></clipPath>`;
      for (let i = 0; i < n; i++) o += `<rect class="slat" x="${X}" y="${Y + i * 9}" width="${W}" height="8.2" fill="#3a4148"/><rect x="${X}" y="${Y + i * 9}" width="${W}" height="2" fill="#fff" fill-opacity=".1"/>`;
      if (n) o += `<rect x="${X}" y="${Y + Math.max(0, lh - 5)}" width="${W}" height="6" fill="#20262b"/>`;
      o += '</g>';
    }
    return o;
  }
  function drawDeur() {
    const m = MAT[S.mat], c = m.colors[S.kleur][1], fw = m.frame;
    const X = 168, Y = 52, W = 150, H = 278;
    let o = `<rect x="${X - 18}" y="${Y - 14}" width="${W + 36}" height="${H + 14}" fill="#000" fill-opacity=".2"/>`;
    o += rectFrame(X, Y, W, H, c, S.mat, 3);
    const lx = X + fw, ly = Y + fw, lw = W - fw * 2, lh = H - fw;
    // binnenruimte (zichtbaar bij open)
    const t = openT;
    o += `<rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="#2a1d14"/><rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" fill="url(#room)" opacity="${.15 + t * .85}"/>`;
    const k = .62 * t, v = .05 * t;
    const pts = [[lx, ly], [lx + lw * (1 - k), ly + lh * v], [lx + lw * (1 - k), ly + lh * (1 - v)], [lx, ly + lh]];
    const P = a => a.map(p => p.join(',')).join(' ');
    o += `<polygon points="${P(pts)}" fill="${c}"/>`;
    if (S.mat === 'Hout') o += `<polygon points="${P(pts)}" fill="url(#grain)"/><polygon points="${P(pts)}" fill="url(#wood)"/>`;
    // glas op deurblad (affine benadering via transform)
    const sx = (1 - k), cy = ly + lh / 2;
    const gel = (gx, gy, gw, gh) => `<g transform="translate(${lx} ${cy}) scale(${sx} ${1 - v * 2 * (1 - 0)}) translate(${-lx} ${-cy})"><rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#room)"/><rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${S.glas === 'Mat' ? '#e8eef4' : 'url(#gl)'}" fill-opacity="${S.glas === 'Mat' ? .93 : .82}"/>${S.glas === 'Figuur' ? `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#fig)"/>` : ''}<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="none" stroke="#000" stroke-opacity=".3"/></g>`;
    const dark = '#000';
    if (S.vorm === 'strook') o += gel(lx + lw * .16, ly + 18, lw * .2, lh - 60);
    else if (S.vorm === 'vol') o += gel(lx + lw * .14, ly + 16, lw * .72, lh * .56);
    else o += `<g transform="translate(${lx} ${cy}) scale(${sx} 1) translate(${-lx} ${-cy})"><rect x="${lx + lw * .14}" y="${ly + 22}" width="${lw * .72}" height="${lh * .38}" rx="3" fill="none" stroke="${dark}" stroke-opacity=".22" stroke-width="1.4"/><rect x="${lx + lw * .14}" y="${ly + lh * .5}" width="${lw * .72}" height="${lh * .36}" rx="3" fill="none" stroke="${dark}" stroke-opacity=".22" stroke-width="1.4"/></g>`;
    // greep
    const hx = pts[1][0] - 12;
    o += `<rect x="${hx - 2.5}" y="${ly + lh * .38}" width="5" height="${lh * .26}" rx="2.5" fill="#cfd4db" stroke="#5f6670" stroke-width=".7"/>`;
    // dorpel
    o += `<rect x="${X - 20}" y="${Y + H}" width="${W + 40}" height="12" fill="#b9bdc4"/>`;
    return o;
  }

  function wallPlants() {
    return `<g opacity=".95"><ellipse cx="62" cy="340" rx="34" ry="12" fill="#1f3a2c"/><ellipse cx="428" cy="342" rx="30" ry="11" fill="#2a4a38"/></g>`;
  }
  function render() {
    const wall = S.gevel === 'steen' ? 'url(#brick)' : WALL[S.gevel];
    let o = defs();
    o += `<rect width="480" height="372" fill="${wall}"/>`;
    if (S.gevel === 'wit') o += `<rect width="480" height="372" fill="url(#room)" opacity=".05"/>`;
    o += `<rect y="336" width="480" height="36" fill="#272d33"/><rect y="336" width="480" height="3" fill="#fff" fill-opacity=".12"/>`;
    o += `<g filter="url(#sh)">${S.soort === 'Raam' ? drawRaam() : drawDeur()}</g>`;
    svg.innerHTML = o;
    if (S.soort === 'Raam' && S.rol) { /* clip refresh */ }
  }
  function anim() { cancelAnimationFrame(raf); const step = () => { const d = openTarget - openT; if (Math.abs(d) < .004) { openT = openTarget; render(); return; } openT += d * (reduce ? 1 : .11); render(); raf = requestAnimationFrame(step); }; step(); }

  function ui() {
    // vormen
    const vf = $('#c-vorm'); vf.innerHTML = FORMS[S.soort].map(([k, l]) => `<button type="button" aria-pressed="${S.vorm === k}" data-k="${k}">${l}</button>`).join('');
    // kleuren
    const cf = $('#c-kleur'); cf.innerHTML = MAT[S.mat].colors.map(([n, c], i) => `<button type="button" aria-pressed="${S.kleur === i}" data-i="${i}" style="--c:${c}" aria-label="${n}"><span>${n}</span></button>`).join('');
    $$('#c-soort button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === S.soort));
    $$('#c-mat button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === S.mat));
    $$('#c-glas button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === S.glas));
    $$('#c-gevel button').forEach(b => b.setAttribute('aria-pressed', b.dataset.k === S.gevel));
    $('#c-extras').hidden = S.soort !== 'Raam';
    $('#c-horren').setAttribute('aria-pressed', S.horren); $('#c-rol').setAttribute('aria-pressed', S.rol);
    $('#c-rolp-wrap').hidden = !(S.rol && S.soort === 'Raam');
    const kn = MAT[S.mat].colors[S.kleur][0], vn = FORMS[S.soort].find(x => x[0] === S.vorm)[1];
    const ex = S.soort === 'Raam' ? [S.horren ? 'horren' : '', S.rol ? 'rolluik/screen' : ''].filter(Boolean).join(' + ') : '';
    $('#c-sum').innerHTML = `<p><strong>${S.soort} in ${S.mat.toLowerCase()}</strong> · ${kn.toLowerCase()} · ${vn.toLowerCase()} · glas: ${S.glas.toLowerCase()}${ex ? ' · ' + ex : ''}</p><p>${MAT[S.mat].desc}</p>`;
    const badge = $('#c-badge'); badge.innerHTML = `<span>${S.mat}</span><span>${kn}</span><span>${vn}</span>`;
    const sum = `${S.soort} · ${S.mat} · ${kn} · ${vn} · glas ${S.glas}${ex ? ' · ' + ex : ''}`;
    const q = new URLSearchParams({ cfg: sum, s: S.soort === 'Raam' ? 'ramen' : 'deuren' });
    $('#c-cta').href = $('#c-cta').dataset.base + '?' + q.toString() + '#offerte-wizard';
    $('#c-open').textContent = S.open ? (S.soort === 'Raam' ? 'Sluit het raam' : 'Sluit de deur') : (S.soort === 'Raam' ? 'Open het raam' : 'Open de deur');
    $('#c-open').setAttribute('aria-pressed', S.open);
  }
  cfgEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const g = b.parentElement.id;
    if (g === 'c-soort') { S.soort = b.dataset.k; S.vorm = FORMS[S.soort][S.soort === 'Raam' ? 1 : 0][0]; S.open = false; openTarget = 0; }
    else if (g === 'c-mat') { S.mat = b.dataset.k; S.kleur = Math.min(S.kleur, MAT[S.mat].colors.length - 1); if (S.mat === 'Hout') S.kleur = Math.min(S.kleur, 0); }
    else if (g === 'c-vorm') S.vorm = b.dataset.k;
    else if (g === 'c-kleur') S.kleur = +b.dataset.i;
    else if (g === 'c-glas') S.glas = b.dataset.k;
    else if (g === 'c-gevel') S.gevel = b.dataset.k;
    else if (b.id === 'c-horren') S.horren = !S.horren;
    else if (b.id === 'c-rol') { S.rol = !S.rol; S.rolp = S.rol ? .45 : 0; $('#c-rolp').value = 45; }
    else if (b.id === 'c-open') { S.open = !S.open; openTarget = S.open ? 1 : 0; }
    ui(); anim();
  });
  $('#c-rolp').addEventListener('input', e => { S.rolp = e.target.value / 100; render(); });
  svg.addEventListener('click', () => { S.open = !S.open; openTarget = S.open ? 1 : 0; ui(); anim(); });
  ui(); render();
  // intro: raam opent kort bij zichtbaar
  new IntersectionObserver((es, ob) => es.forEach(e => { if (e.isIntersecting && !reduce) { ob.disconnect(); setTimeout(() => { openTarget = .75; S.open = true; ui(); anim(); setTimeout(() => { openTarget = 0; S.open = false; ui(); anim(); }, 1800); }, 500); } }), { threshold: .5 }).observe(svg);
}

/* ====== QUOTE WIZARD ====== */
$$('.wiz').forEach(wiz => {
  const form = $('form', wiz), steps = $$('.wstep', wiz), prog = $$('.wprog i', wiz), done = $('.wdone', wiz);
  let cur = 0;
  const qp = new URLSearchParams(location.search);
  // voorinvullen vanuit configurator/links
  const pre = qp.get('s'); if (pre) { const i = $(`input[name=diensten][value="${pre}"]`, wiz); if (i) i.checked = true; }
  const cfgNote = qp.get('cfg'); if (cfgNote) { const n = $('[name=toelichting]', wiz); if (n) n.value = 'Configuratie uit de website: ' + cfgNote + '\n'; const b = $('.cfgbox', wiz); if (b) { b.hidden = false; $('span', b).textContent = cfgNote; } }
  const counts = { ramen: 1, deuren: 1, garagepoorten: 1, horren: 1, 'rolluiken-screens': 1 };
  const LBL = { ramen: 'Ramen', deuren: 'Deuren', garagepoorten: 'Garagepoorten', horren: 'Horren', 'rolluiken-screens': 'Rolluiken / screens' };
  function go(n) {
    cur = n; steps.forEach((s, i) => s.classList.toggle('on', i === n));
    prog.forEach((p, i) => { p.classList.toggle('done', i < n); p.classList.toggle('cur', i === n); });
    $('.wcount', wiz).textContent = `Stap ${n + 1} van 3`;
    if (n === 1) buildCounts();
    const top = wiz.getBoundingClientRect().top + scrollY - (parseInt(getComputedStyle(root).getPropertyValue('--hdr')) + 20);
    if (scrollY > top + 40) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    const f = $('input,select,textarea', steps[n]); if (f && n > 0) setTimeout(() => f.focus({ preventScroll: true }), 350);
  }
  function selected() { return $$('input[name=diensten]:checked', wiz).map(i => i.value); }
  function buildCounts() {
    const box = $('.wcounts', wiz), sel = selected();
    box.innerHTML = sel.map(k => `<div class="stepper-row"><span>${LBL[k]}</span><div class="stepper"><button type="button" data-k="${k}" data-d="-1" aria-label="Minder ${LBL[k]}">−</button><output aria-live="polite">${counts[k]}</output><button type="button" data-k="${k}" data-d="1" aria-label="Meer ${LBL[k]}">+</button></div></div>`).join('');
  }
  wiz.addEventListener('click', e => {
    const st = e.target.closest('.stepper button');
    if (st) { const k = st.dataset.k; counts[k] = Math.max(1, Math.min(40, counts[k] + +st.dataset.d)); st.parentElement.querySelector('output').textContent = counts[k]; }
    const nx = e.target.closest('[data-next]'), pv = e.target.closest('[data-prev]');
    if (nx && valid(cur)) go(cur + 1);
    if (pv) go(cur - 1);
  });
  function valid(n) {
    let ok = true;
    if (n === 0) { const r = $('.werr0', wiz); const has = selected().length && $('input[name=project]:checked', wiz); r.hidden = !!has; ok = !!has; }
    if (n === 1) { const g = $('[name=gemeente]', wiz), p = $('[name=postcode]', wiz); [g, p].forEach(f => { const bad = !f.value.trim() || (f === p && !/^\d{4}$/.test(f.value.trim())); f.closest('.field').classList.toggle('bad', bad); if (bad) ok = false; }); }
    if (n === 2) { $$('[required]', steps[2]).forEach(f => { let bad = f.type === 'checkbox' ? !f.checked : !f.value.trim(); if (f.type === 'email') bad = !/^\S+@\S+\.\S+$/.test(f.value); const fl = f.closest('.field') || f.closest('.check'); if (fl) fl.classList.toggle('bad', bad); if (bad) ok = false; }); }
    if (!ok) { const b = $('.bad input,.bad select', wiz); if (b) b.focus(); }
    return ok;
  }
  form.addEventListener('submit', async e => {
    e.preventDefault(); if (!valid(2)) return;
    if ($('[name=website]', wiz).value) return; // honeypot
    const fd = new FormData(form); const sel = selected();
    const lines = [
      `Project: ${fd.get('project')}`,
      `Interesse in: ${sel.map(k => `${LBL[k]} (${counts[k]})`).join(', ')}`,
      `Ruimtes/plaatsen: ${fd.getAll('ruimtes').join(', ') || '—'}`,
      `Gemeente: ${fd.get('postcode')} ${fd.get('gemeente')}`,
      `Timing: ${fd.get('timing') || '—'}`,
      `Naam: ${fd.get('voornaam')} ${fd.get('familienaam')}${fd.get('bedrijf') ? ' (' + fd.get('bedrijf') + ')' : ''}`,
      `E-mail: ${fd.get('email')}`, `Telefoon: ${fd.get('telefoon')}`,
      `Toelichting: ${fd.get('toelichting') || '—'}`];
    const body = lines.join('\n');
    $('.wsum', wiz).textContent = body;
    let sent = false, msg = '';
    if (FORM_ENDPOINT) {
      try { const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ _subject: 'Offerte-aanvraag via nieuwe website', email: fd.get('email'), message: body }) }); sent = r.ok; } catch (_) { }
      msg = sent ? 'Je aanvraag is verstuurd. We nemen zo snel mogelijk contact met je op.' : 'Versturen is niet gelukt. Mail ons gerust rechtstreeks via ' + MAIL + '.';
    } else {
      const mail = `mailto:${MAIL}?subject=${encodeURIComponent('Offerte-aanvraag via nieuwe website')}&body=${encodeURIComponent(body)}`;
      msg = 'Demo-modus: er is nog geen formulier-endpoint gekoppeld. Je e-mailprogramma opent met je aanvraag klaar om te versturen naar ' + MAIL + '.';
      $('.wmail', wiz).href = mail; $('.wmail', wiz).hidden = false;
      setTimeout(() => { location.href = mail; }, 600);
    }
    $('.wmsg', wiz).textContent = msg;
    form.style.display = 'none'; $('.wprog', wiz).style.display = 'none'; $('.wlabel', wiz).style.display = 'none'; done.classList.add('on');
    const top = wiz.getBoundingClientRect().top + scrollY - 90; scrollTo({ top, behavior: 'smooth' });
  });
  go(0);
});
})();
