// 2D Animasiya — nüvə: 1080×1920 SVG səhnə, kamera, qatlar, rəng/qrein, köməkçilər.
// Hər şey koddan çəkilir; xarici şəkil/model yoxdur. Render: hyperframes (hf-seek hadisəsi ilə kadr-kadr).
export const W = 1080, H = 1920, NS = 'http://www.w3.org/2000/svg';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const sine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
/** Yay (spring) — overshoot: giriş pop-ları üçün. */
export const spring = (t, { sonum = 0.42, tezlik = 9 } = {}) => t >= 1 ? 1 : 1 - Math.exp(-tezlik * sonum * t) * Math.cos(tezlik * Math.sqrt(1 - sonum * sonum) * t);
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
export const yuvarla = (n, d = 2) => Number(n.toFixed(d));

/** Açar kadr yolu: [{t, v:[...]}] → (t) => [...] */
export function yol(keys, ease = easeInOut) {
  return (t) => { let i = 0; while (i < keys.length - 1 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[Math.min(keys.length - 1, i + 1)];
    const k = b === a ? 0 : (b.ease ?? ease)(clamp((t - a.t) / (b.t - a.t)));
    return a.v.map((v, j) => lerp(v, b.v[j], k)); };
}

// ── SVG köməkçiləri ──────────────────────────────────────────────────────────────────────────────
export function el(ad, attr = {}, ...usaq) {
  const e = document.createElementNS(NS, ad);
  for (const [k, v] of Object.entries(attr)) if (v !== undefined && v !== null) e.setAttribute(k, v);
  for (const u of usaq) if (u) e.appendChild(u);
  return e;
}
export const q = (...u) => el('g', {}, ...u);
export const yol2 = (d, attr = {}) => el('path', { d, ...attr });
export const dair = (cx, cy, r, attr = {}) => el('circle', { cx, cy, r, ...attr });
export const ellips = (cx, cy, rx, ry, attr = {}) => el('ellipse', { cx, cy, rx, ry, ...attr });
export const duzb = (x, y, w, h, r = 0, attr = {}) => el('rect', { x, y, width: w, height: h, rx: r, ry: r, ...attr });
export const xett = (x1, y1, x2, y2, attr = {}) => el('line', { x1, y1, x2, y2, ...attr });
/** Transform qur: {x,y,r(deg),sx,sy,ox,oy} */
export function tr(g, { x = 0, y = 0, r = 0, sx = 1, sy = 1, ox = 0, oy = 0 } = {}) {
  g.setAttribute('transform', `translate(${yuvarla(x, 2)} ${yuvarla(y, 2)}) rotate(${yuvarla(r, 2)} ${ox} ${oy}) scale(${yuvarla(sx, 4)} ${yuvarla(sy, 4)})`);
  return g;
}
/** Hamar qapalı əyri (Catmull-Rom → Bezier): [[x,y],...] */
export function egri(pts, qapali = false, geriş = 1) {
  const p = pts.map(([x, y]) => [x, y]); if (p.length < 2) return '';
  const n = p.length, get = (i) => p[qapali ? (i + n) % n : clamp(i, 0, n - 1) | 0] ?? p[Math.max(0, Math.min(n - 1, i))];
  let d = `M ${get(0)[0]} ${get(0)[1]}`;
  const son = qapali ? n : n - 1;
  for (let i = 0; i < son; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6 * geriş, p1[1] + (p2[1] - p0[1]) / 6 * geriş];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6 * geriş, p2[1] - (p3[1] - p1[1]) / 6 * geriş];
    d += ` C ${yuvarla(c1[0])} ${yuvarla(c1[1])} ${yuvarla(c2[0])} ${yuvarla(c2[1])} ${yuvarla(p2[0])} ${yuvarla(p2[1])}`;
  }
  return d + (qapali ? ' Z' : '');
}
/** Rəngi açıq/tünd et (hex → hex). */
export function ton(hex, k) {
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16) & 255, g2 = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(clamp(k > 0 ? v + (255 - v) * k : v * (1 + k), 0, 255));
  return '#' + [f(r), f(g2), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
/** Xətti qradiyent defs-ə əlavə edir, url(#id) qaytarır. */
let _gid = 0;
export function qrad(defs, duraqlar, { x1 = 0, y1 = 0, x2 = 0, y2 = 1 } = {}) {
  const id = `qr${++_gid}`;
  const g = el('linearGradient', { id, x1, y1, x2, y2 });
  for (const [o, c, a] of duraqlar) g.appendChild(el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }));
  defs.appendChild(g); return `url(#${id})`;
}
export function rqrad(defs, duraqlar, { cx = 0.5, cy = 0.5, r = 0.5 } = {}) {
  const id = `rq${++_gid}`; const g = el('radialGradient', { id, cx, cy, r });
  for (const [o, c, a] of duraqlar) g.appendChild(el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }));
  defs.appendChild(g); return `url(#${id})`;
}
/** Yumşaq kölgə filtri. */
export function kolgeFiltr(defs, { id = 'kolge', dy = 10, blur = 18, opak = 0.3 } = {}) {
  const f = el('filter', { id, x: '-40%', y: '-40%', width: '180%', height: '180%' });
  f.appendChild(el('feDropShadow', { dx: 0, dy, stdDeviation: blur, 'flood-color': '#000', 'flood-opacity': opak }));
  defs.appendChild(f); return `url(#${id})`;
}

/**
 * Səhnə qurur. Qaytarır: { kok, defs, fon, uzaq, orta, on, ust, kamera(o), render(t) }
 * Qatlar paralaks üçün: uzaq (0.25), orta (0.6), on (1.0) — kamera sürüşəndə fərqli sürətlə gedir.
 */
export function sahne(kok, { arxa = '#101418', vignette = 0.3, qrein = 0.05 } = {}) {
  kok.innerHTML = '';
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, xmlns: NS, 'shape-rendering': 'geometricPrecision' });
  const defs = el('defs'); svg.appendChild(defs);
  svg.appendChild(duzb(-W, -H, W * 3, H * 3, 0, { fill: arxa }));
  const dunya = q();
  const qatlar = { uzaq: q(), orta: q(), on: q(), ust: q() };
  const PAR = { uzaq: 0.3, orta: 0.65, on: 1, ust: 1 };
  for (const k of ['uzaq', 'orta', 'on']) dunya.appendChild(qatlar[k]);
  svg.appendChild(dunya); svg.appendChild(qatlar.ust);
  // vinyet + qrein
  if (vignette > 0) {
    const vg = rqrad(defs, [[0, '#000', 0], [0.62, '#000', 0], [1, '#000', vignette]], { cx: 0.5, cy: 0.48, r: 0.74 });
    svg.appendChild(duzb(0, 0, W, H, 0, { fill: vg, 'pointer-events': 'none' }));
  }
  if (qrein > 0) {
    const fid = 'qrein';
    const f = el('filter', { id: fid, x: '0', y: '0', width: '100%', height: '100%' });
    f.appendChild(el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: '2', result: 'n' }));
    f.appendChild(el('feColorMatrix', { type: 'saturate', values: '0' }));
    defs.appendChild(f);
    svg.appendChild(duzb(0, 0, W, H, 0, { filter: `url(#${fid})`, opacity: qrein, 'pointer-events': 'none', style: 'mix-blend-mode:overlay' }));
  }
  kok.appendChild(svg);
  const kam = { x: 0, y: 0, z: 1, r: 0 };
  function kamera(o = {}) { Object.assign(kam, o);
    for (const k of ['uzaq', 'orta', 'on']) {
      const p = PAR[k];
      tr(qatlar[k], { x: W / 2 - (W / 2 + kam.x * p) * kam.z, y: H / 2 - (H / 2 + kam.y * p) * kam.z, sx: kam.z, sy: kam.z, r: kam.r, ox: W / 2, oy: H / 2 });
    } }
  kamera({});
  return { svg, defs, kok, qat: qatlar, kamera, kam };
}
