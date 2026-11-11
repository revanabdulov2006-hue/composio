// AB 2026-11-11 — İşçilər: "Sən olmayanda market necə işləyir?"
// Öz səhnə mühərriki: hər bölmənin öz fonu, real keçidlər, kinetik tipoqrafiya, canlı kamera. 2D personaj yalnız 3 səhnədə.
import { clamp, lerp, easeOut, easeIn, easeInOut, spring, el, duzb } from './kit/kadr.js';
import { insan } from './kit/insan.js';
import { sahibkar } from './kit/komanda.js';
import { mekan } from './kit/mekan.js';

const SURE = 44.55;
const C = [[0, 1.73], [2.17, 4.52], [4.83, 10.03], [10.46, 15.59], [15.72, 19.45], [19.91, 21.48], [21.73, 27.10], [27.55, 31.93], [32.30, 36.87], [37.30, 39.93], [40.26, 43.73]];
const B = [0, 1.95, 4.67, 10.25, 15.65, 19.68, 21.61, 27.33, 32.11, 37.08, 40.09, SURE];
const GECIS = [null, 'whipH', 'iris', 'panel', 'zoom', 'shutter', 'bar', 'whipV', 'panel2', 'iris2', 'split'];
const TD = { whipH: 0.42, iris: 0.6, panel: 0.7, zoom: 0.55, shutter: 0.6, bar: 0.5, whipV: 0.42, panel2: 0.7, iris2: 0.6, split: 0.55 };

const G = '#55B848', G2 = '#7BD86A', DG = '#0B2416';
const root = document.getElementById('root');
const css = document.createElement('style');
css.textContent = `
.sc{position:absolute;inset:0;overflow:hidden;display:none;will-change:transform,filter,clip-path}
.cam{position:absolute;inset:0;transform-origin:50% 50%}
.ab{position:absolute}
.cond{font-family:'Cond';font-stretch:64%;font-weight:850;text-transform:uppercase;line-height:.86;letter-spacing:-.005em}
.ser{font-family:'Fraunces';font-style:italic;font-weight:400;line-height:1}
.ser8{font-family:'Fraunces';font-style:italic;font-weight:800;line-height:1}
.ui{font-family:'Jakarta';font-weight:700}
.ln{display:block;overflow:hidden;padding:.2em .04em .12em;margin:-.2em -.04em -.12em}
.ln>span{display:inline-block;will-change:transform}
.ch{display:inline-block;will-change:transform,opacity}
.w{display:inline-block;will-change:transform,opacity,filter}
.ctr{left:0;right:0;text-align:center}
.mk{position:relative;display:inline-block;z-index:0}
.mk>i{position:absolute;left:-.06em;right:-.06em;top:.12em;bottom:.04em;border-radius:.08em;transform:scaleX(0);transform-origin:left center;z-index:-1}
.st{position:relative;display:inline-block}
.st>i{position:absolute;left:-.04em;right:-.04em;top:52%;height:.09em;border-radius:.05em;background:#E0503C;transform:scaleX(0);transform-origin:left center}
.grain{position:absolute;inset:0;pointer-events:none;opacity:.055;image-rendering:pixelated;width:1080px;height:1920px}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 75% 60% at 50% 48%,transparent 55%,rgba(0,0,0,.5))}
.blob{position:absolute;border-radius:50%;filter:blur(90px)}
/* telefon */
.ph{position:absolute;width:560px;height:1140px;border-radius:84px;background:linear-gradient(145deg,#2b2f33,#0c0e10 40%,#1c1f22);padding:18px;box-shadow:0 60px 120px rgba(0,0,0,.6),inset 0 0 0 3px #3a3f44}
.ph .scr{position:relative;width:100%;height:100%;border-radius:68px;overflow:hidden}
.ph .isl{position:absolute;left:50%;top:22px;width:150px;height:44px;margin-left:-75px;border-radius:24px;background:#000;z-index:5}
.nt{position:absolute;left:22px;right:22px;border-radius:34px;background:rgba(245,247,245,.94);padding:22px 24px;display:flex;gap:18px;align-items:center;box-shadow:0 18px 40px rgba(0,0,0,.35);color:#141a16}
.av{width:72px;height:72px;border-radius:50%;flex:none;display:grid;place-items:center;font-family:'Jakarta';font-weight:800;font-size:34px;color:#fff}
.nt .nm{font-family:'Jakarta';font-weight:800;font-size:28px;display:flex;justify-content:space-between}
.nt .nm b{font-weight:600;color:#777;font-size:22px}
.nt .tx{font-family:'Jakarta';font-weight:600;font-size:31px;margin-top:4px}
/* web pəncərə */
.win{position:absolute;border-radius:36px;background:#fff;box-shadow:0 50px 110px rgba(4,40,16,.45);overflow:hidden;font-family:'Jakarta';color:#12301c}
.win .bar{height:74px;background:#f1f4f2;display:flex;align-items:center;gap:12px;padding:0 28px;border-bottom:2px solid #e3e8e4}
.win .bar i{width:18px;height:18px;border-radius:50%;background:#e06a5a}.win .bar i+i{background:#e8b84a}.win .bar i+i+i{background:#58c06a}
.win .url{margin-left:22px;flex:1;height:44px;border-radius:22px;background:#fff;border:2px solid #e3e8e4;display:flex;align-items:center;padding-left:22px;font-weight:600;font-size:22px;color:#6b7a70}
.btn{display:inline-flex;align-items:center;gap:10px;padding:18px 28px;border-radius:20px;background:${G};color:#fff;font-weight:800;font-size:28px}
.tg{width:92px;height:52px;border-radius:26px;background:#d5dcd7;position:relative;flex:none}
.tg i{position:absolute;top:6px;left:6px;width:40px;height:40px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.25)}
.prow{display:flex;align-items:center;gap:20px;height:96px;border-bottom:2px solid #edf1ee;font-weight:700;font-size:34px;padding:0 6px}
.prow .ic{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;flex:none}
.lock{position:relative;width:26px;height:20px;border-radius:5px;background:currentColor;margin-top:12px}
.lock:before{content:'';position:absolute;left:4px;top:-14px;width:12px;height:14px;border:4px solid currentColor;border-bottom:none;border-radius:10px 10px 0 0}
.tile{position:absolute;border-radius:30px;padding:26px;box-sizing:border-box;font-family:'Jakarta';font-weight:800;font-size:32px}
.card{position:absolute;border-radius:30px;background:#fff;box-shadow:0 24px 60px rgba(10,60,25,.18);font-family:'Jakarta';color:#12301c}
.trow{display:flex;align-items:center;gap:20px;height:118px;padding:0 30px;border-bottom:2px solid #eef3ef;font-weight:700;font-size:34px}
.chk{width:56px;height:56px;border-radius:50%;border:4px solid #cbd6ce;flex:none;display:grid;place-items:center;box-sizing:border-box}
.chk.on{background:${G};border-color:${G}}
.toast{position:absolute;border-radius:28px;background:#123B24;color:#fff;font-family:'Jakarta';font-weight:700;font-size:30px;padding:22px 30px;display:flex;align-items:center;gap:16px;white-space:nowrap;box-shadow:0 20px 40px rgba(0,0,0,.35)}
.ok{width:44px;height:44px;border-radius:50%;background:${G};display:grid;place-items:center;flex:none}
`;
document.head.appendChild(css);
const CHK = (c = '#fff', s = 30) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`;

// ---------- köməkçilər
const H = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };
const put = (par, html, css = '') => { const d = H(html); if (css) d.style.cssText += css; par.appendChild(d); return d; };
const win = (t, a, b, fi = 0.2, fo = 0.2) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
const pop = (t, a, d = 0.5, o) => spring(clamp((t - a) / d), o || { sonum: 0.5, tezlik: 10 });
const sx = (d, { x = 0, y = 0, s = 1, r = 0, o = 1, bl = 0 } = {}) => { d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`; d.style.opacity = clamp(o).toFixed(3); d.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : 'none'; d.style.visibility = o <= 0.002 ? 'hidden' : 'visible'; };
// sətir maskası: <span class=ln><span>..</span></span>
const lines = (arr) => arr.map((h) => `<span class="ln"><span>${h}</span></span>`).join('');
const linesIn = (box, t, a, step = 0.12, d = 0.5, out = null) => box.querySelectorAll('.ln>span').forEach((s, k) => {
  const u = easeOut(clamp((t - a - k * step) / d)); let y = (1 - u) * 115;
  if (out !== null) { const v = easeIn(clamp((t - out - k * 0.06) / 0.35)); y -= v * 115; }
  s.style.transform = `translateY(${y}%)`; });
const chars = (s) => [...s].map((c) => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join('');
const charsIn = (box, t, a, step = 0.035, d = 0.4, mode = 'drop', out = null) => box.querySelectorAll('.ch').forEach((c, k) => {
  const u = clamp((t - a - k * step) / d), e = mode === 'slam' ? spring(u, { sonum: 0.45, tezlik: 11 }) : easeOut(u);
  let o = clamp(u * 3), y = mode === 'drop' ? (1 - e) * -90 : 0, s = mode === 'slam' ? lerp(2.4, 1, e) : 1, r = mode === 'drop' ? (1 - e) * (k % 2 ? 12 : -12) : 0;
  if (out !== null) { const v = easeIn(clamp((t - out - k * 0.02) / 0.3)); o *= 1 - v; y += v * 60; }
  c.style.opacity = o.toFixed(3); c.style.transform = `translateY(${y}px) scale(${s}) rotate(${r}deg)`; });
const words = (s) => s.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
const wordsIn = (box, t, a, step = 0.12, d = 0.4, out = null) => box.querySelectorAll('.w').forEach((w, k) => {
  const u = easeOut(clamp((t - a - k * step) / d)); let o = u, y = (1 - u) * 50, bl = (1 - u) * 14;
  if (out !== null) { const v = easeIn(clamp((t - out) / 0.3)); o *= 1 - v; y -= v * 40; bl += v * 12; }
  w.style.opacity = o.toFixed(3); w.style.transform = `translateY(${y}px)`; w.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none'; });
const bar = (box, t, a, d = 0.4, sel = '.mk>i') => box.querySelectorAll(sel).forEach((i, k) => { i.style.transform = `scaleX(${easeInOut(clamp((t - a - k * 0.5) / d))})`; });

// toxum noise (qrain) — hər kadrda dəyişir, deterministik
const gr = document.createElement('canvas'); gr.width = 270; gr.height = 480; gr.className = 'grain';
const gctx = gr.getContext('2d'); const gimg = gctx.createImageData(270, 480);
function grain(t) { let s = (Math.floor(t * 30) * 2654435761) >>> 0 || 7; const d = gimg.data;
  for (let i = 0; i < d.length; i += 4) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; const v = s & 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  gctx.putImageData(gimg, 0, 0); }

// 2D səhnə (insan.js + mekan.js)
function svg2d(tur, isiq, opt = {}) {
  const svg = el('svg', { viewBox: '0 0 1080 1920', width: 1080, height: 1920, style: 'position:absolute;left:0;top:0;overflow:visible' });
  const defs = el('defs'); svg.appendChild(defs);
  const m = mekan(defs, tur, { isiq, ...opt });
  const uz = el('g'), or = el('g'), on = el('g'); uz.appendChild(m.uzaq); or.appendChild(m.orta); on.appendChild(m.on);
  svg.appendChild(uz); svg.appendChild(or); svg.appendChild(on);
  return { svg, uz, or, on, m };
}
const par = (g, x, y, s = 1) => g.setAttribute('transform', `translate(${540 + x} ${960 + y}) scale(${s}) translate(-540 -960)`);

// ---------- SƏHNƏLƏR
const SC = [];
function scene(bg, build) { const d = put(root, `<div class="sc"></div>`); d.style.background = bg; const cam = put(d, `<div class="cam"></div>`); const o = build(cam, d) || {}; SC.push({ d, cam, ...o }); return o; }

// 1 HOOK — tünd market, qaranlıq
scene('#050a07', (cam, d) => {
  const s2 = svg2d('market', 'tund', { lovhe: false }); cam.appendChild(s2.svg); s2.svg.style.filter = 'blur(7px) brightness(.42) saturate(.7)';
  put(cam, `<div class="ab" style="inset:0;background:radial-gradient(ellipse 70% 45% at 50% 42%,rgba(85,184,72,.22),transparent 70%)"></div>`);
  const t1 = put(d, `<div class="ab cond ctr" style="top:520px;font-size:430px;color:#fff">${chars('SƏN')}</div>`);
  const t2 = put(d, `<div class="ab ser ctr" style="top:880px;font-size:170px;color:${G2}">${lines(['olmayanda'])}</div>`);
  const t3 = put(d, `<div class="ab ui ctr" style="top:1110px;font-size:74px;color:#fff;font-weight:800">${words('market necə işləyir?')}</div>`);
  put(d, `<div class="vig"></div>`);
  return { upd(tl, t) {
    cam.style.transform = `scale(${lerp(1.18, 1.05, easeOut(clamp(t / 2)))}) translateX(${Math.sin(t * 0.8) * 14}px)`;
    par(s2.or, -30 * t, 0, 1); par(s2.on, -60 * t, 30, 1.05);
    charsIn(t1, t, 0.02, 0.07, 0.42, 'slam');
    t1.style.transform = `scale(${lerp(1.0, 1.06, t / 2)})`;
    linesIn(t2, t, 0.42, 0.1, 0.45); wordsIn(t3, t, 0.8, 0.13, 0.35);
  } };
});

// 2 SƏFƏR — gündüz küçə, sahibkar yeriyir (2D #1)
let sefA;
scene('#bcd8ee', (cam, d) => {
  const s2 = svg2d('kuce', 'gunduz', { gece: false }); cam.appendChild(s2.svg);
  sefA = sahibkar({ boy: 1.0 }); s2.on.appendChild(sefA.g);
  const t1 = put(d, `<div class="ab cond ctr" style="top:250px;font-size:200px;color:#0f2a18"><span class="mk"><i style="background:${G2}"></i>${chars('BİR GÜNLÜYƏ')}</span></div>`);
  const t2 = put(d, `<div class="ab ser ctr" style="top:450px;font-size:120px;color:#0f2a18">${lines(['şəhərdən çıxdın.'])}</div>`);
  return { upd(tl, t) {
    const k = tl;
    cam.style.transform = `scale(${lerp(1.12, 1.2, k / 2.7)}) translate(${lerp(30, -30, k / 2.7)}px,0)`;
    par(s2.uz, -40 * k, 0, 1);
    sefA.yeri(t, { x: lerp(330, 760, k / 2.9), y: 1700, hiz: 2.1 }); sefA.ifade({ gulus: 0.25, qas: 0.2, baxis: [0.6, 0] });
    charsIn(t1, t, 2.12, 0.035, 0.35, 'drop', 4.3); bar(t1, t, 2.75, 0.45);
    linesIn(t2, t, 3.15, 0.1, 0.45, 4.35); t2.style.visibility = t < 4.75 ? 'visible' : 'hidden';
  } };
});

// 3 ZƏNG — hərəkətli gradient + telefon bildirişləri
scene('#06120b', (cam, d) => {
  const b1 = put(cam, `<div class="blob" style="width:900px;height:900px;background:#1c6b34;left:-200px;top:200px;opacity:.7"></div>`);
  const b2 = put(cam, `<div class="blob" style="width:800px;height:800px;background:#0e3b5a;left:500px;top:1100px;opacity:.6"></div>`);
  const b3 = put(cam, `<div class="blob" style="width:600px;height:600px;background:#b8483a;left:600px;top:100px;opacity:.0"></div>`);
  const ph = put(cam, `<div class="ph" style="left:260px;top:560px"><div class="scr" style="background:linear-gradient(160deg,#1a3a28,#0a1510 60%,#132a3c)"><div class="isl"></div>
    <div class="ab ui ctr" style="top:120px;color:#fff;font-size:150px;font-weight:600;letter-spacing:-.02em">14:20</div>
    <div class="ab ui ctr" style="top:300px;color:#cfe3d5;font-size:30px;font-weight:600">Çərşənbə, 11 noyabr</div>
    <div class="nt call" style="top:420px;background:#1f2a24;color:#fff"><div class="av" style="background:${G}">E</div><div style="flex:1"><div class="nm" style="color:#fff">Elvin<b style="color:#9fb8a8">zəng edir</b></div><div class="tx" style="color:#cfe3d5">Mobil</div></div></div>
    ${['Mal gəlib.', 'Hara yazım?', 'Firmaya pulu verim?', 'Nə sifariş edim?'].map((m, k) => `<div class="nt msg" style="top:${420 + k * 150}px"><div class="av" style="background:${k % 2 ? '#3d7fd0' : G}">E</div><div style="flex:1"><div class="nm">Elvin<b>indi</b></div><div class="tx">${m}</div></div></div>`).join('')}
  </div></div>`);
  const badge = put(cam, `<div class="ab ui" style="left:740px;top:520px;width:110px;height:110px;border-radius:55px;background:#E0503C;color:#fff;font-size:58px;font-weight:800;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.4)">1</div>`);
  const t1 = put(d, `<div class="ab cond ctr" style="top:150px;font-size:250px;color:#fff">${chars('TELEFON')}</div>`);
  const t2 = put(d, `<div class="ab ser ctr" style="top:365px;font-size:130px;color:${G2}">${lines(['susmur.'])}</div>`);
  put(d, `<div class="vig"></div>`);
  const call = ph.querySelector('.call'), msgs = [...ph.querySelectorAll('.msg')];
  const MT = [5.95, 6.95, 7.85, 9.02];
  return { upd(tl, t) {
    const zoom = easeInOut(clamp((t - 7.4) / 1.0));
    cam.style.transform = `scale(${lerp(1.0, 1.22, zoom) + tl * 0.006}) translate(${Math.sin(t * 0.7) * 18}px,${lerp(0, -260, zoom)}px) rotate(${lerp(-2, 1.5, zoom)}deg)`;
    sx(b1, { x: Math.sin(t * 0.6) * 160, y: Math.cos(t * 0.5) * 120, o: 0.7 }); sx(b2, { x: Math.cos(t * 0.55) * 180, y: Math.sin(t * 0.7) * 140, o: 0.6 });
    sx(b3, { o: 0.35 * clamp((t - 6) / 2), x: Math.sin(t) * 60 });
    const vib = t > 4.8 && t < 6.0 ? Math.sin(t * 90) * 6 : 0; const pin = pop(t, 4.7, 0.6);
    sx(ph, { x: vib, y: (1 - pin) * 900, r: lerp(8, -3, pin) + vib * 0.2 });
    sx(call, { o: win(t, 4.95, 6.0, 0.15, 0.2), s: 1 + 0.03 * Math.sin(t * 14) });
    msgs.forEach((m, k) => { const u = pop(t, MT[k], 0.5); const sh = msgs.slice(k + 1).filter((_, j) => t > MT[k + 1 + j]).length;
      sx(m, { o: clamp(u * 2), y: (1 - u) * -80 + 0 * sh, s: lerp(0.85, 1, u) }); });
    const n = 1 + MT.filter((a) => t > a).length; badge.textContent = n; const bp = pop(t, [4.9, ...MT][n - 1], 0.4);
    sx(badge, { o: clamp((t - 4.9) / 0.1), s: lerp(1.5, 1, bp), y: lerp(0, -260, zoom) * 0 });
    charsIn(t1, t, 4.75, 0.04, 0.38, 'drop', 7.25); linesIn(t2, t, 5.2, 0.1, 0.45, 7.3);
  } };
});

// 4 SİRR — krem kağız, dəftər
scene('#efe7d6', (cam, d) => {
  put(cam, `<div class="ab" style="inset:-100px;background:radial-gradient(ellipse at 30% 20%,#fbf6ea,#e6dcc6 80%)"></div>`);
  const nb = put(cam, `<div class="ab" style="left:170px;top:760px;width:740px;height:960px;border-radius:18px;background:#fbf8f0;box-shadow:0 40px 90px rgba(80,60,30,.35);overflow:hidden">
    <div class="ab" style="left:84px;top:0;bottom:0;width:4px;background:#e2a49a"></div>
    ${Array.from({ length: 13 }, (_, k) => `<div class="ab" style="left:0;right:0;top:${110 + k * 66}px;height:3px;background:#cdd9e8"></div>`).join('')}
    ${[['Borclar', 0], ['Xərclər', 5]].map(([h, r]) => `<div class="ab ser8 hd" style="left:120px;top:${40 + r * 66 + 66}px;font-size:66px;color:#1f2a44"><span class="mk"><i style="background:#c8ef7a;opacity:.9"></i>${h}</span></div>`).join('')}
    ${[1, 2, 3, 6, 7, 8, 9].map((r, k) => `<div class="ab scr" style="left:${130 + (k % 2) * 20}px;top:${66 + r * 66 + 66 + 30}px;width:${380 + ((k * 97) % 160)}px;height:12px;border-radius:6px;background:#3a4a6a;opacity:.55"></div>`).join('')}
  </div>`);
  const t1 = put(d, `<div class="ab cond" style="left:80px;top:170px;font-size:200px;color:#14201a">${lines(['İŞÇİYƏ', '<span class="st"><i></i>HƏR ŞEYİ</span>'])}</div>`);
  const t2 = put(d, `<div class="ab ser" style="left:86px;top:560px;font-size:110px;color:#1f5a2e">${lines(['göstərə bilmirsən.'])}</div>`);
  const t3 = put(d, `<div class="ab ser8 ctr" style="top:120px;font-size:92px;color:#14201a;white-space:nowrap">${words('Hamısı açıq yazılıb.')}</div>`);
  put(d, `<div class="vig" style="opacity:.5"></div>`);
  const scr = [...nb.querySelectorAll('.scr')];
  return { upd(tl, t) {
    const push = easeInOut(clamp((t - 12.7) / 0.9));
    cam.style.transform = `scale(${lerp(1.02, 1.32, push) + tl * 0.006}) translate(${Math.sin(t * 0.6) * 10}px,${lerp(0, -200, push)}px) rotate(${lerp(-1.2, 0.8, push)}deg)`;
    const nin = pop(t, 10.3, 0.7); sx(nb, { y: (1 - nin) * 700, r: lerp(-10, -2, nin) });
    scr.forEach((s, k) => { s.style.transform = `scaleX(${easeOut(clamp((t - 10.6 - k * 0.12) / 0.4))})`; s.style.transformOrigin = 'left'; });
    linesIn(t1, t, 10.45, 0.14, 0.45, 12.65); t1.style.opacity = t2.style.opacity = t < 13.1 ? 1 : 0; bar(t1, t, 11.75, 0.35, '.st>i');
    linesIn(t2, t, 11.2, 0.1, 0.45, 12.75);
    const o3 = clamp((t - 12.95) / 0.01); t3.style.opacity = o3; wordsIn(t3, t, 13.0, 0.16, 0.38);
    t3.style.transform = `translateY(${push * 330 * 0}px)`;
    bar(nb, t, 13.95, 0.4, '.hd .mk>i');
    nb.querySelectorAll('.hd .mk>i').forEach((i, k) => i.style.transform = `scaleX(${easeInOut(clamp((t - (k ? 14.6 : 13.95)) / 0.4))})`);
  } };
});

// 5 YORĞUN — axşam ev, sahibkar telefonda (2D #2)
let yA;
scene('#2a2244', (cam, d) => {
  const s2 = svg2d('ev', 'axsam'); cam.appendChild(s2.svg);
  yA = sahibkar({ boy: 1.0 }); s2.on.appendChild(yA.g);
  put(cam, `<div class="ab" style="inset:0;background:linear-gradient(180deg,rgba(20,12,40,.75),rgba(20,12,40,.1) 45%,transparent)"></div>`);
  const clk = put(d, `<div class="ab cond ctr" style="top:190px;font-size:280px;color:#fff;font-stretch:72%;font-variant-numeric:tabular-nums">09:00</div>`);
  const t1 = put(d, `<div class="ab ser ctr" style="top:470px;font-size:120px;color:#ffd6a1"><span class="st"><i></i>istirahət</span></div>`);
  const t2 = put(d, `<div class="ab cond ctr" style="top:620px;font-size:150px;color:#fff">${lines(['BÜTÜN GÜN TELEFONDA'])}</div>`);
  return { upd(tl, t) {
    cam.style.transform = `scale(${lerp(1.25, 1.12, easeOut(clamp(tl / 2.5)))}) translate(${lerp(-30, 30, tl / 4)}px,140px)`;
    const sag = clamp((t - 16.5) / 2);
    yA.ifade({ gulus: lerp(-0.2, -0.55, sag), qas: 0.75, egim: -0.45, goz: lerp(1, 0.75, sag), baxis: [0.1, 0.5] });
    yA.poz({ x: 540, y: 1720, kolL: [10, 12], kolR: [14, 148], elR: ['tutma', 'telefon'], basEg: 0.12 + 0.08 * sag, basDon: -0.1, govdeEg: 0.04 * sag, nefes: Math.sin(t * 1.6), t, danis: 0 });
    const m = lerp(9 * 60, 21 * 60, easeInOut(clamp((t - 15.9) / 3.0)));
    clk.textContent = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60 / 5) * 5).padStart(2, '0')}`;
    const ci = pop(t, 15.7, 0.5); sx(clk, { o: clamp(ci * 2), s: lerp(0.7, 1, ci), y: (1 - ci) * -60 });
    const ti = easeOut(clamp((t - 15.95) / 0.4)); sx(t1, { o: ti, y: (1 - ti) * 40 }); bar(t1, t, 16.55, 0.35, '.st>i');
    linesIn(t2, t, 17.2, 0.1, 0.45);
  } };
});

// 6 KÖRPÜ — hərəkətli gradient, işıq sızması
let korpuBar;
scene('#03140a', (cam, d) => {
  const b1 = put(cam, `<div class="blob" style="width:1100px;height:1100px;background:#1f7a36;left:-300px;top:300px"></div>`);
  const b2 = put(cam, `<div class="blob" style="width:900px;height:900px;background:#0d3d4a;left:400px;top:-200px"></div>`);
  const lk = put(cam, `<div class="ab" style="inset:0;mix-blend-mode:screen;background:radial-gradient(circle at 80% 20%,rgba(190,255,170,.55),transparent 40%),radial-gradient(circle at 10% 90%,rgba(255,220,150,.35),transparent 40%)"></div>`);
  const dots = Array.from({ length: 26 }, (_, k) => put(cam, `<div class="ab" style="width:${6 + (k % 4) * 3}px;height:${6 + (k % 4) * 3}px;border-radius:50%;background:#cfffc2;left:${(k * 211) % 1080}px;top:${(k * 389) % 1920}px;opacity:.5;filter:blur(1px)"></div>`));
  const t1 = put(d, `<div class="ab ui ctr" style="top:640px;font-size:78px;color:#fff;font-weight:600">${words('Bunun daha')}</div>`);
  const t2 = put(d, `<div class="ab ser ctr" style="top:740px;font-size:280px;color:#fff"><span class="mk"><i style="background:${G}"></i>${lines(['sakit'])}</span></div>`);
  const t3 = put(d, `<div class="ab ui ctr" style="top:1080px;font-size:78px;color:#fff;font-weight:600">${words('bir yolu var.')}</div>`);
  korpuBar = t2.querySelector('.mk>i');
  put(d, `<div class="vig"></div>`);
  return { upd(tl, t) {
    cam.style.transform = `scale(${1.05 + tl * 0.03}) rotate(${tl * 0.8}deg)`;
    sx(b1, { x: Math.sin(t * 0.9) * 200, y: Math.cos(t * 0.7) * 160 }); sx(b2, { x: Math.cos(t * 0.8) * 200, y: Math.sin(t * 0.6) * 200 });
    lk.style.opacity = 0.6 + 0.4 * Math.sin(t * 2.2);
    dots.forEach((p, k) => sx(p, { y: -((t * (40 + k * 7)) % 600), x: Math.sin(t + k) * 20, o: 0.5 }));
    wordsIn(t1, t, 19.9, 0.14, 0.4); linesIn(t2, t, 20.3, 0.1, 0.5); bar(t2, t, 20.55, 0.4); wordsIn(t3, t, 20.75, 0.12, 0.38);
  } };
});

// 7 İCAZƏ — tam yaşıl, real web UI
scene(G, (cam, d) => {
  put(cam, `<div class="ab" style="inset:-200px;background:repeating-linear-gradient(115deg,rgba(255,255,255,.05) 0 40px,transparent 40px 120px)" id="str"></div>`);
  put(cam, `<div class="ab" style="inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(255,255,255,.25),transparent 60%),radial-gradient(ellipse at 50% 110%,rgba(10,60,25,.45),transparent 60%)"></div>`);
  const logo = put(d, `<div class="ab" style="left:0;right:0;top:700px;display:flex;flex-direction:column;align-items:center;gap:26px"><div style="width:300px;height:300px;border-radius:80px;background:#0B2416;display:grid;place-items:center;box-shadow:0 40px 90px rgba(5,50,20,.35)"><img src="logo.png" style="width:240px;height:240px"></div><div class="ui" style="font-size:84px;color:#fff;font-weight:800;letter-spacing:-.01em">AsanBiznesim</div></div>`);
  const w = put(cam, `<div class="win" style="left:90px;top:640px;width:900px;height:1100px">
    <div class="bar"><i></i><i></i><i></i><div class="url">asanbiznesim.com</div></div>
    <div style="padding:40px 44px">
      <div style="display:flex;align-items:center;justify-content:space-between"><div style="font-size:56px;font-weight:800">İşçilər</div><div class="btn add">+ İşçi əlavə et</div></div>
      <div class="emp" style="margin-top:36px;display:flex;align-items:center;gap:24px;padding:26px;border-radius:26px;background:#eef7ef;border:3px solid ${G}">
        <div class="av" style="background:${G};width:96px;height:96px;font-size:44px">E</div><div><div style="font-size:40px;font-weight:800">Elvin</div><div style="font-size:28px;font-weight:600;color:#5a7a64;margin-top:4px">Satıcı</div></div></div>
      <div style="font-size:36px;font-weight:800;margin:44px 0 10px">İcazələr</div>
      ${[['Fakturalar', 1, '#e3f3e5'], ['Sroklar', 1, '#e3f3e5'], ['Tədarükçülər', 1, '#e3f3e5'], ['Borclar', 0, '#fbe6e2'], ['Xərclər', 0, '#fbe6e2'], ['Analizlər', 0, '#fbe6e2']].map(([n, on, c]) => `<div class="prow" data-on="${on}"><div class="ic" style="background:${c};color:${on ? '#2c8a3a' : '#c0503f'}">${on ? CHK('#2c8a3a', 30) : '<div class="lock"></div>'}</div>${n}<div style="margin-left:auto" class="tg"><i></i></div></div>`).join('')}
    </div></div>`);
  const rip = put(d, `<div class="ab" style="width:60px;height:60px;border-radius:50%;border:6px solid #fff;left:0;top:0;opacity:0"></div>`);
  const t1 = put(d, `<div class="ab cond ctr" style="top:110px;font-size:160px;color:#fff">${lines(['YALNIZ', 'LAZIM OLAN'])}</div>`);
  const t2 = put(d, `<div class="ab ser ctr" style="top:400px;font-size:105px;color:#0c3a1a">${lines(['bölmələr.'])}</div>`);
  const emp = w.querySelector('.emp'), rows = [...w.querySelectorAll('.prow')], add = w.querySelector('.add'), strp = cam.querySelector('#str');
  const RT = [24.75, 25.15, 25.55, 26.0, 26.3, 26.6];
  return { upd(tl, t) {
    const lg = pop(t, 21.65, 0.55); const lgOut = easeInOut(clamp((t - 22.55) / 0.45));
    sx(logo, { s: lerp(0.4, 1, lg) * lerp(1, 0.5, lgOut), y: lerp(0, -560, lgOut), o: clamp(lg * 2) * (1 - clamp((t - 22.9) / 0.2)) });
    const wi = pop(t, 22.6, 0.7); const pan = easeInOut(clamp((t - 24.35) / 0.8));
    cam.style.transform = `scale(${lerp(1.0, 1.1, pan) + tl * 0.004}) translate(${Math.sin(t * 0.6) * 10}px,${lerp(80, -60, pan)}px) rotate(${lerp(1, -0.8, pan)}deg)`;
    sx(w, { y: (1 - wi) * 1300, r: (1 - wi) * 8, o: clamp(wi * 3) });
    strp.style.transform = `translateX(${(t * 60) % 160}px)`;
    const press = clamp((t - 23.15) / 0.12) * (1 - clamp((t - 23.35) / 0.15)); add.style.transform = `scale(${1 - press * 0.08})`;
    const ab = add.getBoundingClientRect(); const ru = clamp((t - 23.2) / 0.5);
    rip.style.left = (ab.left + ab.width / 2 - 30) + 'px'; rip.style.top = (ab.top + ab.height / 2 - 30 - 0) + 'px';
    rip.style.transform = `scale(${1 + ru * 3})`; rip.style.opacity = ru > 0 && ru < 1 ? (1 - ru) : 0;
    const ei = pop(t, 23.5, 0.5); sx(emp, { o: clamp(ei * 2), x: (1 - ei) * 500 });
    rows.forEach((r, k) => { const u = pop(t, 24.0 + k * 0.08, 0.45); sx(r, { o: clamp(u * 2), x: (1 - u) * 200 });
      const on = +r.dataset.on, a = RT[k], tg = r.querySelector('.tg'), dot = tg.firstChild;
      if (on) { const v = easeOut(clamp((t - a) / 0.25)); tg.style.background = v > 0.5 ? G : '#d5dcd7'; dot.style.transform = `translateX(${v * 40}px)`; r.style.color = '#12301c'; }
      else { const sh = clamp((t - a) / 0.4); r.style.transform += ` translateX(${Math.sin(sh * 30) * 10 * (1 - sh) * (sh > 0)}px)`; r.style.opacity = (+r.style.opacity * lerp(1, 0.55, sh)).toFixed(3); } });
    linesIn(t1, t, 24.7, 0.1, 0.45); linesIn(t2, t, 25.1, 0.1, 0.45);
  } };
});

// 8 GÖRMÜR — anbar, işçi + işçinin telefonu (2D #3)
let iA;
scene('#e7e0d2', (cam, d) => {
  const s2 = svg2d('anbar', 'gunduz'); cam.appendChild(s2.svg);
  iA = insan({ ten: '#d9a47a', sacRenk: '#1f150e', sac: 'modern', big: 'nazik', bigRenk: '#1f150e', geyim: 'koynek', ic: '#eef2ee', onluk: '#2f8a3a', onlukLogo: 'E', alt: '#2e3440', ayak: '#3a2a22', boy: 0.98 });
  s2.on.appendChild(iA.g);
  const ph = put(cam, `<div class="ph" style="left:470px;top:620px;transform-origin:50% 50%"><div class="scr" style="background:#f4f7f5"><div class="isl"></div>
    <div class="ab ui" style="left:40px;top:110px;font-size:44px;color:#12301c;font-weight:800">Salam, Elvin</div>
    <div class="tile t0" style="left:30px;top:200px;width:235px;height:235px;background:${G};color:#fff">Fakturalar<div style="position:absolute;right:22px;bottom:22px" class="ok0">${CHK('#fff', 40)}</div></div>
    <div class="tile t1" style="left:279px;top:200px;width:235px;height:235px;background:#e3f3e5;color:#12301c">Sroklar</div>
    <div class="tile t2" style="left:30px;top:450px;width:235px;height:235px;background:#e9ecea;color:#9aa59e">Borclar<div style="position:absolute;left:24px;bottom:30px;color:#9aa59e"><div class="lock"></div></div></div>
    <div class="tile t3" style="left:279px;top:450px;width:235px;height:235px;background:#e9ecea;color:#9aa59e">Xərclər<div style="position:absolute;left:24px;bottom:30px;color:#9aa59e"><div class="lock"></div></div></div>
    <div class="toast tA" style="left:22px;top:730px"><div class="ok">${CHK('#fff', 26)}</div>Faktura yazıldı</div>
    <div class="toast tB" style="left:22px;top:840px"><div class="ok">${CHK('#fff', 26)}</div>Mal qəbul edildi</div>
  </div></div>`);
  const t1 = put(d, `<div class="ab cond" style="left:70px;top:150px;font-size:170px;color:#14201a">${lines(['<span class="st"><i></i>BORCLAR</span>', '<span class="st"><i></i>XƏRCLƏR</span>'])}</div>`);
  const t2 = put(d, `<div class="ab ser8" style="left:76px;top:470px;font-size:120px;color:#2c8a3a">${lines(['görmür.'])}</div>`);
  const tiles = [0, 1, 2, 3].map((k) => ph.querySelector('.t' + k)), tA = ph.querySelector('.tA'), tB = ph.querySelector('.tB');
  return { upd(tl, t) {
    const pan = easeInOut(clamp((t - 29.6) / 0.9));
    cam.style.transform = `scale(${lerp(1.18, 1.08, pan) + tl * 0.004}) translate(${lerp(120, -60, pan)}px,${lerp(80, 60, pan)}px)`;
    const box = Math.sin(t * 2.2) * 0.5;
    iA.ifade({ gulus: 0.55, qas: 0.3, baxis: [0.4, 0.1] });
    iA.poz({ x: 260, y: 1740, kolL: [12, 146], kolR: [12, 146], elL: ['tutma', 'karton'], elR: ['tutma', 'karton'], basDon: 0.25 + box * 0.1, nefes: Math.sin(t * 2), t });
    const pi = pop(t, 27.45, 0.7); sx(ph, { x: (1 - pi) * 700, r: lerp(14, 4, pi) - pan * 2 });
    tiles.forEach((d2, k) => { const u = pop(t, 27.75 + k * 0.1, 0.45); sx(d2, { s: lerp(0.6, 1, u), o: clamp(u * 2) }); });
    const p0 = Math.exp(-Math.max(0, t - 28.9) * 5) * (t > 28.9); tiles[0].style.transform += ` scale(${1 + p0 * 0.08})`;
    const a = pop(t, 29.0, 0.45); sx(tA, { o: clamp(a * 2), y: (1 - a) * 60 }); const b = pop(t, 29.95, 0.45); sx(tB, { o: clamp(b * 2), y: (1 - b) * 60 });
    [2, 3].forEach((k, j) => { const sh = clamp((t - 30.75 - j * 0.35) / 0.45); tiles[k].style.transform += ` translateX(${Math.sin(sh * 28) * 12 * (1 - sh) * (sh > 0)}px)`; tiles[k].style.filter = sh > 0 ? `blur(${sh * 3}px)` : 'none'; });
    linesIn(t1, t, 30.45, 0.15, 0.45); bar(t1, t, 30.95, 0.3, '.st>i');
    t1.querySelectorAll('.st>i').forEach((i, k) => i.style.transform = `scaleX(${easeInOut(clamp((t - 30.95 - k * 0.3) / 0.3))})`);
    linesIn(t2, t, 31.35, 0.1, 0.4);
  } };
});

// 9 TAPŞIRIQ — açıq nanə fon, tapşırıq lövhəsi, sayğac
let tapCircle;
scene('#e9f4ea', (cam, d) => {
  const grid = put(cam, `<div class="ab" style="inset:-200px;background-image:radial-gradient(#b9d8be 2.5px,transparent 2.5px);background-size:44px 44px;opacity:.8"></div>`);
  put(cam, `<div class="ab" style="inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(255,255,255,.85),transparent 65%)"></div>`);
  const card = put(cam, `<div class="card" style="left:80px;top:640px;width:920px">
    <div style="padding:36px 34px 20px;font-size:46px;font-weight:800">Bu günün tapşırıqları</div>
    ${[['Rəfləri doldur', 'E', G, 'Elvin'], ['Srokları yoxla', 'A', '#3d7fd0', 'Aynur'], ['Fakturanı yaz', 'E', G, 'Elvin']].map(([n, i, c, w]) => `<div class="trow"><div class="chk"></div><div style="flex:1">${n}<div style="font-size:24px;font-weight:600;color:#6d8a75;margin-top:4px">${w}</div></div><div class="av" style="background:${c};width:76px;height:76px;font-size:34px">${i}</div></div>`).join('')}
  </div>`);
  const ring = put(cam, `<div class="ab" style="left:340px;top:1300px;width:400px;height:400px">
    <svg width="400" height="400" viewBox="0 0 400 400" style="position:absolute;inset:0"><circle cx="200" cy="200" r="170" fill="#fff" stroke="#d7e8da" stroke-width="26"/><circle class="arc" cx="200" cy="200" r="170" fill="none" stroke="${G}" stroke-width="26" stroke-linecap="round" stroke-dasharray="1068" stroke-dashoffset="1068" transform="rotate(-90 200 200)"/></svg>
    <div class="ab cond ctr num" style="top:120px;font-size:170px;color:#12301c;font-stretch:72%">0/3</div></div>`);
  tapCircle = ring;
  const t1 = put(d, `<div class="ab ser ctr" style="top:180px;font-size:120px;color:#1f5a2e">${lines(['Tapşırığı ver,'])}</div>`);
  const t2 = put(d, `<div class="ab cond ctr" style="top:330px;font-size:200px;color:#12301c">${lines(['UZAQDAN İZLƏ'])}</div>`);
  const rows = [...card.querySelectorAll('.trow')], arc = ring.querySelector('.arc'), num = ring.querySelector('.num');
  const DT = [35.05, 35.65, 36.25];
  return { upd(tl, t) {
    const sh = easeInOut(clamp((t - 34.5) / 0.8));
    cam.style.transform = `scale(${lerp(1.06, 1.0, sh) + tl * 0.004}) translate(${Math.sin(t * 0.5) * 12}px,${lerp(120, -40, sh)}px)`;
    grid.style.transform = `translate(${(t * 22) % 44}px,${(t * 14) % 44}px)`;
    const ci = pop(t, 32.2, 0.6); sx(card, { y: (1 - ci) * 900, r: (1 - ci) * -6, s: lerp(1, 0.94, sh) });
    rows.forEach((r, k) => { const u = pop(t, 32.6 + k * 0.45, 0.45); sx(r, { o: clamp(u * 2), x: (1 - u) * -300 });
      const av = r.querySelector('.av'); const v = pop(t, 32.8 + k * 0.45, 0.5); av.style.transform = `scale(${lerp(0, 1, v)})`;
      const c = r.querySelector('.chk'); const on = t > DT[k]; c.classList.toggle('on', on); c.innerHTML = on ? CHK('#fff', 30) : ''; c.style.transform = `scale(${on ? lerp(1.4, 1, easeOut(clamp((t - DT[k]) / 0.3))) : 1})`;
      r.style.color = on ? '#7f9686' : '#12301c'; });
    const ri = pop(t, 34.6, 0.6); sx(ring, { s: lerp(0.3, 1, ri), o: clamp(ri * 2) });
    const done = DT.filter((a) => t > a).length; num.textContent = `${done}/3`;
    const ap = clamp(DT.reduce((s, a) => s + easeOut(clamp((t - a) / 0.4)), 0) / 3); arc.setAttribute('stroke-dashoffset', 1068 * (1 - ap));
    linesIn(t1, t, 32.2, 0.1, 0.45, 34.4); t1.style.visibility = t < 34.9 ? 'visible' : 'hidden'; linesIn(t2, t, 32.55, 0.1, 0.45);
    t2.style.transform = `translateY(${lerp(0, -60, sh)}px)`; t1.style.transform = `translateY(${lerp(0, -60, sh)}px)`;
  } };
});

// 10 YOL — gün batımı, yol, bildiriş
scene('#2b1a3e', (cam, d) => {
  put(cam, `<div class="ab" style="inset:-100px;background:linear-gradient(180deg,#2b1a3e 0%,#8a3b5c 32%,#f08a4b 52%,#ffd18a 60%)"></div>`);
  const sun = put(cam, `<div class="ab" style="left:390px;top:920px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,#fff6d8,#ffc66a 60%,rgba(255,180,90,0) 72%)"></div>`);
  const h1 = put(cam, `<svg class="ab" width="1400" height="500" viewBox="0 0 1400 500" style="left:-160px;top:900px"><path d="M0 300 C200 180 380 240 520 200 C700 150 860 260 1040 190 C1200 140 1320 220 1400 200 L1400 500 L0 500 Z" fill="#5a2a4e"/></svg>`);
  const h2 = put(cam, `<svg class="ab" width="1500" height="500" viewBox="0 0 1500 500" style="left:-210px;top:1000px"><path d="M0 260 C250 200 420 300 640 230 C860 170 1060 290 1260 220 C1380 190 1460 230 1500 220 L1500 500 L0 500 Z" fill="#3a1d3c"/></svg>`);
  const road = put(cam, `<div class="ab" style="left:-200px;right:-200px;top:1180px;height:900px;background:#1c1424"></div>`);
  const rd = put(cam, `<svg class="ab" width="1080" height="760" viewBox="0 0 1080 760" style="left:0;top:1180px"><polygon points="500,0 580,0 1180,760 -100,760" fill="#2c2233"/><g class="dash"></g></svg>`);
  const dash = rd.querySelector('.dash');
  const nt = put(d, `<div class="nt" style="top:900px;left:90px;right:90px;padding:28px 30px"><div class="av" style="background:#0B2416;width:88px;height:88px;border-radius:24px"><img src="logo.png" style="width:72px;height:72px"></div><div style="flex:1"><div class="nm" style="font-size:30px">AsanBiznesim<b>indi</b></div><div class="tx" style="font-size:33px">Bu günün tapşırıqları tamamlandı</div></div></div>`);
  const t1 = put(d, `<div class="ab cond ctr" style="top:200px;font-size:200px;color:#fff">${lines(['MARKET', 'İŞLƏYİR.'])}</div>`);
  const t2 = put(d, `<div class="ab ser ctr" style="top:570px;font-size:115px;color:#ffe1b0">${lines(['sən isə yoldasan.'])}</div>`);
  put(d, `<div class="vig"></div>`);
  return { upd(tl, t) {
    cam.style.transform = `scale(${1.08 + tl * 0.03}) translate(${Math.sin(t * 0.7) * 10}px,${-tl * 12}px)`;
    sx(sun, { y: tl * 18, s: 1 + tl * 0.02 }); sx(h1, { x: -tl * 18 }); sx(h2, { x: -tl * 40 });
    let s = ''; for (let k = 0; k < 9; k++) { const z = ((k + (t * 1.6) % 1) / 9); const y = Math.pow(z, 2.2) * 760; const w = 6 + z * 40, hgt = 10 + z * 120; s += `<rect x="${540 - w / 2}" y="${y}" width="${w}" height="${hgt}" fill="#ffd18a" opacity="${0.3 + z * 0.6}"/>`; }
    dash.innerHTML = s;
    const n = pop(t, 38.0, 0.55); sx(nt, { o: clamp(n * 2), y: (1 - n) * -500, s: lerp(0.9, 1, n) });
    linesIn(t1, t, 37.25, 0.1, 0.45); linesIn(t2, t, 38.35, 0.1, 0.45);
  } };
});

// 11 CTA
scene('#020805', (cam, d) => {
  const gl = put(cam, `<div class="ab" style="inset:0;background:radial-gradient(circle at 50% 46%,rgba(85,184,72,.42),transparent 52%)"></div>`);
  const rays = put(cam, `<div class="ab" style="left:-460px;top:-60px;width:2000px;height:2000px;background:repeating-conic-gradient(from 0deg at 50% 50%,rgba(123,216,106,.07) 0deg 6deg,transparent 6deg 18deg);border-radius:50%"></div>`);
  const t1 = put(d, `<div class="ab ser ctr" style="top:560px;font-size:120px;color:#fff">${lines(['Şərhlərə yaz'])}</div>`);
  const t2 = put(d, `<div class="ab cond ctr" style="top:740px;font-size:330px;color:${G2}">${chars('SİSTEM')}</div>`);
  const ring = put(d, `<div class="ab" style="left:240px;top:640px;width:600px;height:600px;border-radius:50%;border:10px solid ${G2};opacity:0"></div>`);
  const lg = put(d, `<div class="ab" style="left:0;right:0;top:1180px;display:flex;align-items:center;justify-content:center;gap:24px"><div style="width:120px;height:120px;border-radius:32px;background:#0B2416;box-shadow:0 0 0 3px rgba(123,216,106,.5);display:grid;place-items:center"><img src="logo.png" style="width:100px;height:100px"></div><div class="ui" style="font-size:58px;color:#fff;font-weight:800">asanbiznesim.com</div></div>`);
  put(d, `<div class="vig"></div>`);
  return { upd(tl, t) {
    const hit = Math.exp(-Math.max(0, t - 41.3) * 7) * (t > 41.3);
    cam.style.transform = `scale(${1.04 + tl * 0.015 + hit * 0.04})`;
    rays.style.transform = `rotate(${t * 6}deg)`; gl.style.opacity = 0.8 + hit * 0.6;
    linesIn(t1, t, 40.3, 0.1, 0.45); charsIn(t2, t, 40.95, 0.06, 0.4, 'slam');
    d.style.transform = `translate(${Math.sin(t * 70) * 8 * hit}px,${Math.cos(t * 60) * 8 * hit}px)`;
    const ru = clamp((t - 41.3) / 0.7); ring.style.opacity = ru > 0 && ru < 1 ? 1 - ru : 0; ring.style.transform = `scale(${0.5 + ru * 1.4})`;
    const l = pop(t, 42.1, 0.55); sx(lg, { o: clamp(l * 2), y: (1 - l) * 80 });
  } };
});

// ---------- KEÇİD qatları
const ovl = put(root, `<div class="ab" style="inset:0;pointer-events:none;z-index:20"></div>`);
const panels = ['#55B848', '#0B2416', '#f3ede0'].map((c) => put(ovl, `<div class="ab" style="left:-700px;top:-600px;width:2600px;height:3200px;background:${c};display:none"></div>`));
const blinds = Array.from({ length: 8 }, (_, k) => put(ovl, `<div class="ab" style="left:${k * 135}px;top:0;width:136px;height:1920px;background:#03140a;transform-origin:${k % 2 ? 'top' : 'bottom'};display:none"></div>`));
const irisRing = put(ovl, `<div class="ab" style="border-radius:50%;border:14px solid ${G2};display:none"></div>`);
const matchB = put(ovl, `<div class="ab" style="background:${G};display:none;border-radius:20px"></div>`);
const flash = put(ovl, `<div class="ab" style="inset:0;background:#fff;opacity:0"></div>`);
const splitL = [0, 1].map(() => put(ovl, `<div class="ab" style="left:0;right:0;height:8px;background:${G2};display:none"></div>`));
root.appendChild(gr); gr.style.zIndex = 30;
const fade = put(root, `<div class="ab" style="inset:0;background:#000;z-index:40;opacity:0"></div>`);
const mbA = document.getElementById('mbAg'), mbB = document.getElementById('mbBg');

function reset(sc) { sc.d.style.display = 'none'; sc.d.style.transform = ''; sc.d.style.filter = ''; sc.d.style.clipPath = ''; sc.d.style.webkitMaskImage = sc.d.style.maskImage = ''; sc.d.style.opacity = 1; sc.d.style.zIndex = 1; }
function show(sc, t) { sc.d.style.display = 'block'; sc.upd?.(t - B[SC.indexOf(sc)], t); }

function renderAt(t) {
  SC.forEach(reset);
  [...panels, ...blinds, irisRing, matchB, ...splitL].forEach((p) => (p.style.display = 'none')); flash.style.opacity = 0;
  let i = B.findIndex((b, k) => t >= b && t < B[k + 1]); if (i < 0) i = SC.length - 1;
  // aktiv keçid?
  let tr = null;
  for (let k = 1; k < SC.length; k++) { const d = TD[GECIS[k]]; if (t >= B[k] - d / 2 && t < B[k] + d / 2) { tr = { k, p: (t - (B[k] - d / 2)) / d, type: GECIS[k] }; break; } }
  if (!tr) { show(SC[i], t); }
  else {
    const A = SC[tr.k - 1], Bs = SC[tr.k], p = tr.p, ty = tr.type;
    if (ty === 'whipH' || ty === 'whipV') {
      const hor = ty === 'whipH';
      if (p < 0.5) { show(A, t); const u = easeIn(p * 2); A.d.style.transform = hor ? `translateX(${-u * 1300}px) scaleX(${1 + u * 0.25})` : `translateY(${-u * 2200}px) scaleY(${1 + u * 0.25})`; mbA.setAttribute('stdDeviation', hor ? `${u * 70} 0` : `0 ${u * 70}`); A.d.style.filter = 'url(#mbA)'; }
      else { show(Bs, t); const u = 1 - easeOut((p - 0.5) * 2); Bs.d.style.transform = hor ? `translateX(${u * 1300}px) scaleX(${1 + u * 0.25})` : `translateY(${u * 2200}px) scaleY(${1 + u * 0.25})`; mbB.setAttribute('stdDeviation', hor ? `${u * 70} 0` : `0 ${u * 70}`); Bs.d.style.filter = 'url(#mbB)'; }
    } else if (ty === 'iris' || ty === 'iris2') {
      show(A, t); show(Bs, t); Bs.d.style.zIndex = 2;
      let cx = 540, cy = 1100; if (ty === 'iris2' && tapCircle) { const r = tapCircle.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; } else if (ty === 'iris') { cx = 540; cy = 1150; }
      const r = easeInOut(p) * 2300; Bs.d.style.webkitMaskImage = Bs.d.style.maskImage = `radial-gradient(circle ${Math.max(1, r)}px at ${cx}px ${cy}px, #000 98%, transparent 100%)`;
      A.d.style.transform = `scale(${1 + p * 0.15})`;
      Bs.d.style.transform = '';
      irisRing.style.display = 'block'; irisRing.style.left = (cx - r - 14) + 'px'; irisRing.style.top = (cy - r - 14) + 'px'; irisRing.style.width = irisRing.style.height = (2 * r) + 'px'; irisRing.style.opacity = 1 - p;
    } else if (ty === 'panel' || ty === 'panel2') {
      const dir = ty === 'panel' ? 1 : -1; const cols = ty === 'panel' ? ['#55B848', '#0B2416', '#f3ede0'] : ['#2a2244', '#55B848', '#e9f4ea'];
      show(p < 0.5 ? A : Bs, t);
      panels.forEach((pn, k) => { pn.style.display = 'block'; pn.style.background = cols[k]; const u = easeInOut(clamp((p - k * 0.09) / 0.72));
        pn.style.transform = `rotate(${dir * 18}deg) translateX(${dir * lerp(2400, -2700, u)}px)`; });
    } else if (ty === 'zoom') {
      if (p < 0.5) { show(A, t); const u = easeIn(p * 2); A.d.style.transform = `scale(${1 + u * 5})`; A.d.style.filter = `blur(${u * 24}px)`; A.d.style.transformOrigin = '50% 62%'; A.d.style.opacity = 1 - clamp((u - 0.7) / 0.3); }
      else { show(Bs, t); const u = easeOut((p - 0.5) * 2); Bs.d.style.transform = `scale(${lerp(1.7, 1, u)})`; Bs.d.style.filter = `blur(${(1 - u) * 20}px)`; flash.style.opacity = (1 - u) * 0.3; }
    } else if (ty === 'shutter') {
      show(p < 0.5 ? A : Bs, t);
      blinds.forEach((b, k) => { b.style.display = 'block'; const u = p < 0.5 ? easeInOut(clamp((p * 2 - k * 0.04) / 0.7)) : 1 - easeInOut(clamp(((p - 0.5) * 2 - k * 0.04) / 0.7)); b.style.transform = `scaleY(${u})`; });
    } else if (ty === 'bar') {
      show(A, t);
      const r0 = korpuBar.getBoundingClientRect(); const u = easeInOut(clamp(p / 0.6));
      matchB.style.display = 'block'; matchB.style.left = lerp(r0.left, -20, u) + 'px'; matchB.style.top = lerp(r0.top, -20, u) + 'px';
      matchB.style.width = lerp(r0.width, 1120, u) + 'px'; matchB.style.height = lerp(r0.height, 1960, u) + 'px'; matchB.style.borderRadius = lerp(20, 0, u) + 'px';
      if (p > 0.6) { show(Bs, t); A.d.style.display = 'none'; matchB.style.opacity = 1 - clamp((p - 0.6) / 0.4); } else matchB.style.opacity = 1;
    } else if (ty === 'split') {
      show(A, t); show(Bs, t); Bs.d.style.zIndex = 2; const u = easeInOut(p);
      { const q = (1 - u) * 50; Bs.d.style.webkitMaskImage = Bs.d.style.maskImage = `linear-gradient(180deg, transparent ${q}%, #000 ${q}%, #000 ${100 - q}%, transparent ${100 - q}%)`; } A.d.style.transform = `scale(${1 + u * 0.2})`; A.d.style.filter = `blur(${u * 8}px)`;
      splitL.forEach((l, k) => { l.style.display = 'block'; l.style.top = (k ? 960 + u * 960 : 960 - u * 960 - 8) + 'px'; l.style.opacity = 1 - u * 0.6; });
    }
  }
  grain(t);
  fade.style.opacity = Math.max(1 - clamp(t / 0.12), clamp((t - (SURE - 0.35)) / 0.35));
}

await Promise.all([document.fonts.load("850 66px 'Cond'"), document.fonts.load("italic 400 66px 'Fraunces'"), document.fonts.load("italic 800 66px 'Fraunces'"), document.fonts.load("700 30px 'Jakarta'"), document.fonts.load("600 30px 'Jakarta'"), document.fonts.load("800 30px 'Jakarta'")]);
await Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
renderAt(0);
window.__renderAt = renderAt; window.__bitdi = true;
