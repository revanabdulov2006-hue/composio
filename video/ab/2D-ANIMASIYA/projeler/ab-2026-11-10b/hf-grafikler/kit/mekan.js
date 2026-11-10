// 2D məkanlar — səhnənin baş verdiyi yerə xitab edən arxa planlar. Hər biri paralaks qatlara bölünür:
//   {uzaq: divar/pəncərə/səma, orta: mebel/rəf/stol, on: ön plan detalları}
// Hamısı koddan; rəng palitrası PALITRA ilə dəyişir (ümumi skill — brend sərbəstdir).
import { el, q, yol2, dair, ellips, duzb, xett, tr, egri, ton, rng, qrad, rqrad, W, H } from './kadr.js';

export const PALITRA = {
  gunduz:  { divar: '#e7e0d2', divarK: '#d2c9b8', doseme: '#cfc6b4', dosemeK: '#b7ad99', isiq: '#fff3dd', kolge: '#2a2a33', gok: ['#bcd8ee', '#e7eef4'] },
  axsam:   { divar: '#3b3a44', divarK: '#2a2932', doseme: '#33323c', dosemeK: '#26252e', isiq: '#ffc98a', kolge: '#14131a', gok: ['#2a2244', '#5a3b57'] },
  tund:    { divar: '#232a2e', divarK: '#1a2024', doseme: '#1e2428', dosemeK: '#161b1f', isiq: '#ffd6a1', kolge: '#0b0e10', gok: ['#121a2a', '#24304a'] },
};

const ufuq = 1180;   // gözün səviyyəsi (horizon) — bütün məkanlarda eyni ki, kadrlar uyğun gəlsin

/** Divar + döşəmə qabığı. */
function qabiq(P, { doseme = true, plintus = true } = {}) {
  const g = q();
  g.appendChild(duzb(-400, -400, W + 800, ufuq + 400, 0, { fill: P.divar }));
  if (doseme) {
    g.appendChild(duzb(-400, ufuq, W + 800, H - ufuq + 400, 0, { fill: P.doseme }));
    g.appendChild(duzb(-400, ufuq, W + 800, 10, 0, { fill: ton(P.dosemeK, -0.1) }));
    // perspektiv kafel xətləri
    for (let i = -6; i <= 6; i++) { const x = W / 2 + i * 150;
      g.appendChild(yol2(`M ${x} ${ufuq} L ${W / 2 + i * 520} ${H + 200}`, { stroke: P.dosemeK, 'stroke-width': 3, opacity: 0.45 })); }
    for (let j = 1; j <= 7; j++) { const y = ufuq + Math.pow(j / 7, 2.1) * (H + 160 - ufuq);
      g.appendChild(xett(-400, y, W + 400, y, { stroke: P.dosemeK, 'stroke-width': 3, opacity: 0.35 })); }
  }
  if (plintus) g.appendChild(duzb(-400, ufuq - 26, W + 800, 26, 0, { fill: ton(P.divar, 0.16) }));
  return g;
}

/** Gecə/gündüz şəhəri olan pəncərə. */
export function pencere(defs, P, { x = W / 2, y = 760, w = 520, h = 380, gece = true, yagis = false, seed = 3 } = {}) {
  const g = q(); const R = rng(seed);
  const gf = qrad(defs, gece ? [[0, '#0e1326'], [0.55, P.gok[0]], [1, P.gok[1]]] : [[0, P.gok[0]], [1, P.gok[1]]], { x1: 0, y1: 0, x2: 0, y2: 1 });
  g.appendChild(duzb(x - w / 2, y - h / 2, w, h, 6, { fill: gf }));
  const kes = el('clipPath', { id: `pc${seed}` }); kes.appendChild(duzb(x - w / 2, y - h / 2, w, h, 6)); defs.appendChild(kes);
  const ic = q(); ic.setAttribute('clip-path', `url(#pc${seed})`);
  let bx = x - w / 2 - 20;
  while (bx < x + w / 2 + 20) {
    const bw = 34 + R() * 70, bh = h * (0.2 + R() * 0.58), by = y + h / 2 - bh;
    ic.appendChild(duzb(bx, by, bw, bh, 2, { fill: gece ? '#0d1222' : '#9fb0c2', opacity: gece ? 0.9 : 0.75 }));
    if (gece) for (let yy = by + 10; yy < y + h / 2 - 8; yy += 18) for (let xx = bx + 7; xx < bx + bw - 8; xx += 14)
      if (R() < 0.4) ic.appendChild(duzb(xx, yy, 7, 9, 1, { fill: R() < 0.82 ? '#ffc46b' : '#9ed0ff', opacity: 0.45 + R() * 0.5 }));
    bx += bw + 8 + R() * 18;
  }
  if (yagis) for (let i = 0; i < 70; i++) { const rx = x - w / 2 + R() * w, ry = y - h / 2 + R() * h;
    ic.appendChild(yol2(`M ${rx} ${ry} l -6 ${22 + R() * 26}`, { stroke: '#cfe4ff', 'stroke-width': 2, opacity: 0.3 })); }
  g.appendChild(ic);
  // çərçivə
  const c = '#20242a';
  g.appendChild(duzb(x - w / 2 - 12, y - h / 2 - 12, w + 24, h + 24, 8, { fill: 'none', stroke: c, 'stroke-width': 16 }));
  g.appendChild(duzb(x - 5, y - h / 2, 10, h, 0, { fill: c }));
  g.appendChild(duzb(x - w / 2, y - 5, w, 10, 0, { fill: c }));
  // pəncərədən düşən işıq
  g.appendChild(yol2(`M ${x - w / 2} ${ufuq} L ${x + w / 2} ${ufuq} L ${x + w / 2 + 180} ${H} L ${x - w / 2 - 110} ${H} Z`,
    { fill: gece ? '#ffc46b' : '#ffffff', opacity: gece ? 0.05 : 0.12 }));
  return g;
}

/** Market rəfi. */
export function raf(P, { x = 0, y = ufuq, w = 420, h = 430, seed = 5, mal = true, renkler = null } = {}) {
  const g = q(); const R = rng(seed);
  const K = renkler ?? ['#e8e2d4', '#55B848', '#f3efe6', '#36504a', '#f2c94c', '#dfe9d8', '#e0834a', '#fbfaf6', '#8fb79f', '#c94f4f', '#4f7fc9'];
  const cer = ton(P.divar, 0.1), cerK = ton(P.divar, -0.12);
  g.appendChild(duzb(x - w / 2, y - h, w, h, 4, { fill: ton(P.divar, -0.06) }));
  const n = 4, step = h / n;
  for (let i = 0; i <= n; i++) { const yy = y - i * step;
    g.appendChild(duzb(x - w / 2 - 6, yy - 12, w + 12, 14, 3, { fill: cer }));
    g.appendChild(duzb(x - w / 2 - 6, yy - 1, w + 12, 4, 0, { fill: cerK }));
    if (i === n || !mal) continue;
    let px = x - w / 2 + 12;
    while (px < x + w / 2 - 24) {
      const pw = 24 + R() * 26, ph = 34 + R() * (step - 54), c = K[(R() * K.length) | 0];
      if (R() < 0.3) { g.appendChild(duzb(px, yy - 12 - ph, pw, ph, pw * 0.44, { fill: c }));
        g.appendChild(duzb(px, yy - 12 - ph * 0.66, pw, ph * 0.26, 2, { fill: '#fbfaf6', opacity: 0.9 })); }
      else { g.appendChild(duzb(px, yy - 12 - ph, pw, ph, 5, { fill: c }));
        g.appendChild(duzb(px + 3, yy - 12 - ph * 0.7, pw - 6, ph * 0.3, 3, { fill: '#fbfaf6', opacity: 0.85 })); }
      px += pw + 8 + R() * 10;
    }
  }
  return g;
}

/** Piştaxta / kassa. */
export function pistaxta(P, { x = W / 2, y = ufuq + 180, w = 520, h = 230, renk = '#6b4a33', ust = '#e9e3d6', kassa = true } = {}) {
  const g = q();
  g.appendChild(duzb(x - w / 2, y - h, w, h, 10, { fill: renk }));
  g.appendChild(duzb(x - w / 2 - 14, y - h - 20, w + 28, 24, 8, { fill: ust }));
  g.appendChild(duzb(x - w / 2 + 20, y - h * 0.55, w - 40, 6, 3, { fill: ton(renk, 0.14) }));
  if (kassa) { const k = q(); tr(k, { x: x + w / 2 - 130, y: y - h - 20 });
    k.appendChild(duzb(-60, -78, 120, 78, 8, { fill: '#2c3238' }));
    k.appendChild(duzb(-46, -66, 92, 40, 4, { fill: '#9fd6ff', opacity: 0.85 }));
    k.appendChild(duzb(-40, -18, 80, 10, 3, { fill: '#454c54' })); g.appendChild(k); }
  return g;
}

/** Ofis stolu + monitor + əşyalar. */
export function ofisStolu(P, { x = W / 2, y = ufuq + 210, w = 620, h = 40, ayaq = true, monitorEkran = null } = {}) {
  const g = q();
  g.appendChild(duzb(x - w / 2, y - h, w, h, 8, { fill: '#8a6244' }));
  g.appendChild(duzb(x - w / 2, y - h, w, 10, 5, { fill: ton('#8a6244', 0.18) }));
  if (ayaq) for (const s of [-1, 1]) g.appendChild(duzb(x + s * (w / 2 - 40), y, 22, 240, 6, { fill: '#5d4430' }));
  const m = q(); tr(m, { x, y: y - h });
  m.appendChild(duzb(-16, -34, 32, 34, 4, { fill: '#2b3137' }));
  m.appendChild(duzb(-70, -42, 140, 12, 6, { fill: '#2b3137' }));
  m.appendChild(duzb(-190, -300, 380, 262, 12, { fill: '#1d2227' }));
  const ek = duzb(-176, -288, 352, 232, 6, { fill: monitorEkran ?? '#f7f9fb' }); m.appendChild(ek);
  g.appendChild(m); g.userData = { monitor: ek };
  return g;
}

/** Kitab rəfi (ofis/ev). */
export function kitabRaf(P, { x = 0, y = ufuq, w = 300, h = 520, seed = 7 } = {}) {
  const g = q(); const R = rng(seed); const ag = '#6b4a2f';
  g.appendChild(duzb(x - w / 2, y - h, w, h, 6, { fill: ton(ag, -0.3) }));
  const K = ['#c25b4a', '#3c6e9e', '#d9a441', '#4f8a5b', '#8e5aa8', '#e2e0d7', '#2f3b47', '#b8773f'];
  for (let r = 0; r < 4; r++) { const yy = y - 24 - r * (h - 40) / 4;
    g.appendChild(duzb(x - w / 2 + 8, yy, w - 16, 10, 3, { fill: ag }));
    let px = x - w / 2 + 16;
    while (px < x + w / 2 - 28) { const bw = 13 + R() * 16, bh = 64 + R() * 38;
      g.appendChild(duzb(px, yy - bh, bw, bh, 2, { fill: K[(R() * K.length) | 0] })); px += bw + 3; } }
  return g;
}

/** Asma lövhə / vurğu nişanı (brenddən asılı mətn). */
export function lovhe(P, { x = W / 2, y = 520, metin = 'MARKET', w = 300, h = 76, renk = '#55B848', yazi = '#ffffff' } = {}) {
  const g = q();
  g.appendChild(duzb(x - w / 2, y - h / 2, w, h, h / 2, { fill: renk }));
  const t = el('text', { x, y: y + h * 0.17, 'text-anchor': 'middle', fill: yazi, 'font-family': 'Archivo', 'font-weight': 800, 'font-size': h * 0.46, 'letter-spacing': h * 0.06 });
  t.textContent = metin.toUpperCase(); g.appendChild(t);
  for (const s of [-1, 1]) g.appendChild(xett(x + s * w * 0.3, y - h / 2, x + s * w * 0.3, y - h / 2 - 60, { stroke: ton(P.divar, -0.25), 'stroke-width': 5 }));
  return g;
}

/** Tavan işıq paneli. */
export function tavanIsiq(defs, P, { x = W / 2, y = 180, w = 300 } = {}) {
  const g = q();
  g.appendChild(duzb(x - w / 2, y, w, 22, 6, { fill: '#cfd4d8' }));
  g.appendChild(duzb(x - w / 2 + 8, y + 16, w - 16, 10, 5, { fill: '#fff6e4' }));
  const r = rqrad(defs, [[0, P.isiq, 0.3], [1, P.isiq, 0]], { cx: 0.5, cy: 0, r: 0.6 });
  g.appendChild(yol2(`M ${x - w / 2 - 40} ${y + 22} L ${x + w / 2 + 40} ${y + 22} L ${x + w * 1.1} ${ufuq} L ${x - w * 1.1} ${ufuq} Z`, { fill: r, opacity: 0.5 }));
  return g;
}

/** Küçə fonu (vitrin önü). */
export function kuce(defs, P, { gece = true, seed = 4 } = {}) {
  const g = q(); const R = rng(seed);
  const gf = qrad(defs, gece ? [[0, '#121a2a'], [1, '#4a3350']] : [[0, P.gok[0]], [1, P.gok[1]]]);
  g.appendChild(duzb(-400, -400, W + 800, ufuq + 400, 0, { fill: gf }));
  let bx = -200;
  while (bx < W + 200) { const bw = 150 + R() * 200, bh = 420 + R() * 520;
    g.appendChild(duzb(bx, ufuq - bh, bw, bh, 4, { fill: gece ? '#161d2e' : '#b9c4d0' }));
    for (let yy = ufuq - bh + 30; yy < ufuq - 50; yy += 56) for (let xx = bx + 22; xx < bx + bw - 30; xx += 46)
      if (R() < 0.5) g.appendChild(duzb(xx, yy, 24, 30, 3, { fill: gece ? (R() < 0.8 ? '#ffc46b' : '#9ed0ff') : '#dfe8f0', opacity: gece ? 0.3 + R() * 0.55 : 0.6 }));
    bx += bw + 16; }
  g.appendChild(duzb(-400, ufuq, W + 800, H - ufuq + 400, 0, { fill: gece ? '#23262c' : '#6e7279' }));
  for (let i = 0; i < 7; i++) g.appendChild(duzb(W / 2 - 300 + i * 100, ufuq + 160, 60, 14, 6, { fill: '#cfcfcf', opacity: 0.5 }));
  return g;
}

/**
 * Hazır məkan: tur = 'market' | 'ofis' | 'anbar' | 'kafe' | 'ev' | 'kuce'
 * Qaytarır {uzaq, orta, on} — sahne().qat-lara əlavə olunur. opt: {isiq:'gunduz'|'axsam'|'tund', gece, seed, lovhe}
 */
export function mekan(defs, tur, opt = {}) {
  const P = PALITRA[opt.isiq ?? (tur === 'kuce' ? 'axsam' : 'gunduz')];
  const uzaq = q(), orta = q(), on = q();
  const gece = opt.gece ?? (opt.isiq === 'axsam' || opt.isiq === 'tund');
  if (tur === 'kuce') { uzaq.appendChild(kuce(defs, P, { gece, seed: opt.seed ?? 4 })); return { uzaq, orta, on, P, ufuq }; }
  uzaq.appendChild(qabiq(P));
  if (tur === 'market') {
    uzaq.appendChild(pencere(defs, P, { x: W / 2 + 60, y: 790, w: 470, h: 330, gece, yagis: gece, seed: opt.seed ?? 3 }));
    uzaq.appendChild(tavanIsiq(defs, P, { x: W / 2 - 240, y: 150 }));
    uzaq.appendChild(tavanIsiq(defs, P, { x: W / 2 + 280, y: 150 }));
    if (opt.lovhe !== false) uzaq.appendChild(lovhe(P, { x: W / 2 - 300, y: 560, metin: opt.lovhe ?? 'MARKET', renk: opt.lovheRenk ?? '#55B848' }));
    orta.appendChild(raf(P, { x: 180, y: ufuq, w: 460, h: 460, seed: (opt.seed ?? 5) + 1 }));
    orta.appendChild(raf(P, { x: 900, y: ufuq, w: 420, h: 420, seed: (opt.seed ?? 5) + 7 }));
    on.appendChild(pistaxta(P, { x: W / 2 - 40, y: H - 60, w: 760, h: 300 }));
  }
  if (tur === 'ofis') {
    uzaq.appendChild(pencere(defs, P, { x: 790, y: 760, w: 440, h: 360, gece, yagis: gece, seed: opt.seed ?? 3 }));
    uzaq.appendChild(kitabRaf(P, { x: 220, y: ufuq, w: 320, h: 560, seed: (opt.seed ?? 7) }));
    uzaq.appendChild(tavanIsiq(defs, P, { x: W / 2, y: 140, w: 360 }));
    orta.appendChild(ofisStolu(P, { x: W / 2, y: ufuq + 250, w: 700 }));
  }
  if (tur === 'anbar') {
    uzaq.appendChild(tavanIsiq(defs, P, { x: W / 2 - 230, y: 120 }));
    uzaq.appendChild(tavanIsiq(defs, P, { x: W / 2 + 250, y: 120 }));
    for (const [x, w2, h2, s] of [[150, 420, 620, 2], [560, 420, 620, 8], [960, 420, 620, 14]])
      orta.appendChild(raf(P, { x, y: ufuq, w: w2, h: h2, seed: s, renkler: ['#b98d5c', '#c79a64', '#a97b4a', '#d6ab76'] }));
  }
  if (tur === 'kafe' || tur === 'ev') {
    uzaq.appendChild(pencere(defs, P, { x: 280, y: 740, w: 420, h: 360, gece, seed: opt.seed ?? 3 }));
    uzaq.appendChild(kitabRaf(P, { x: 880, y: ufuq, w: 280, h: 480, seed: 11 }));
    orta.appendChild(ofisStolu(P, { x: W / 2 + 40, y: ufuq + 230, w: 560 }));
  }
  return { uzaq, orta, on, P, ufuq };
}
export { ufuq };
