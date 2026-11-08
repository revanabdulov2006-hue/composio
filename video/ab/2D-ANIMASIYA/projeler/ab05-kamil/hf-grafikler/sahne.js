// AB05 — Kamil bəy: 4 ayda 2-ci filial. 2D personajlar (insan.js) + sürətli motion keçidləri və DOM overlay-ları.
import { clamp, lerp, easeInOut, easeOut, spring, q, el, duzb, yol2, dair, tr, ton } from './kit/kadr.js';
import { lovhe, PALITRA } from './kit/mekan.js';
import { insan } from './kit/insan.js';
import { sahibkar, ekspeditor } from './kit/komanda.js';
import { yonet2d } from './kit/yonet2d.js';
import { PLAN } from './veri.js';

const YER = 1900, YER2 = 1850;
const kamil = (o = {}) => sahibkar({ boy: 1.0, ...o });
const isci = (o = {}) => insan({ ten: '#d9a47a', sacRenk: '#24170f', sac: 'modern', big: 'nazik', bigRenk: '#24170f',
  geyim: 'koynek', ic: '#e9e4d8', onluk: '#2E7D32', onlukLogo: 'M', alt: '#2e3a46', ayak: '#3a2a22', boy: 0.96, ...o });
const firma = (o = {}) => ekspeditor({ boy: 1.0, ...o });
const S = (i) => PLAN.planlar.flatMap((p) => p.cumleler)[i - 1];   // cümlə i (1-dən)

/* ---------------- keçidlər: hər planın başında flash + sürətli kamera punch ---------------- */
PLAN.yazi.gecisler = PLAN.planlar.slice(1).filter((p) => p.gecis !== 'beyaz').map((p) => ({ tip: 'flash', s: p.s + 0.02 }));
PLAN.yazi.hud = [];
PLAN.yazi.alt.forEach((a) => (a.y = 1580));
if (PLAN.yazi.baslik) PLAN.yazi.baslik.y = 330;
const punch = (tl, z0 = 1.22, z1 = 1.04, d = 0.45) => lerp(z0, z1, easeOut(clamp(tl / d)));

/* ---------------- DOM overlay qatı ---------------- */
const css = document.createElement('style');
css.textContent = `
#ov{position:absolute;inset:0;pointer-events:none;font-family:'Archivo'}
.ab-flash{background:rgba(255,255,255,.5)!important}
#ov .o{position:absolute;opacity:0;will-change:transform,opacity,filter}
.chip{display:inline-flex;align-items:center;gap:16px;padding:20px 30px;border-radius:999px;background:linear-gradient(180deg,#EAF6EC,#D3EBD8);color:#123B24;font-weight:800;font-size:40px;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.chip.red{background:linear-gradient(180deg,#f6e3df,#ecd0ca);color:#5a2219}
.chip .ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#C77B6B;color:#fff;font-size:30px}
.chip .ok{background:#55B848}
.bub{padding:34px 54px;border-radius:44px;background:#fff;color:#1b1f1c;font-weight:800;font-size:96px;box-shadow:0 24px 60px rgba(0,0,0,.4)}
.bub:after{content:'';position:absolute;left:120px;bottom:-34px;border:22px solid transparent;border-top:24px solid #fff;border-left:22px solid #fff}
.hud{color:#fff;text-shadow:0 3px 18px rgba(0,0,0,.6)}
.hud .et{font-family:'Geist';font-weight:600;font-size:28px;letter-spacing:.18em;text-transform:uppercase;opacity:.9}
.hud .dg{font-weight:800;font-size:150px;line-height:1;margin-top:6px}
.hud .dg span{color:#7BD86A}
.qm{width:86px;height:86px;border-radius:50%;background:#C77B6B;color:#fff;font-weight:800;font-size:60px;display:grid;place-items:center;box-shadow:0 10px 26px rgba(0,0,0,.35)}
.tel{width:470px;height:930px;border-radius:70px;background:#0b0f0d;padding:16px;box-shadow:0 40px 90px rgba(0,0,0,.55)}
.tel .ek{width:100%;height:100%;border-radius:56px;background:linear-gradient(180deg,#123B24,#08180F);overflow:hidden;position:relative}
.tel .row{position:absolute;left:30px;right:30px;height:120px;border-radius:30px;background:linear-gradient(180deg,#EAF6EC,#D3EBD8);display:flex;align-items:center;gap:22px;padding:0 26px;color:#123B24;font-weight:800;font-size:34px}
.tel .row .ok{width:58px;height:58px;border-radius:50%;background:#55B848;display:grid;place-items:center;flex:none}
.big{left:60px;right:60px;text-align:center;color:#fff;font-weight:800;line-height:1.05;letter-spacing:-.015em;text-shadow:0 4px 26px rgba(0,0,0,.5)}
.big .g{color:#7BD86A}
.big .w{display:inline-block;margin:0 .1em}
.mk{position:relative;display:inline-block;z-index:0}
.mk i{position:absolute;left:-.08em;right:-.08em;top:.14em;bottom:.06em;background:#55B848;border-radius:10px;transform-origin:left center;z-index:-1}
.stamp{border:12px solid #55B848;border-radius:36px;padding:6px 40px;color:#7BD86A;font-weight:800;font-size:150px;letter-spacing:.02em;transform:rotate(-5deg)}
`;
document.head.appendChild(css);
const ov = document.createElement('div'); ov.id = 'ov'; document.getElementById('root').insertBefore(ov, document.getElementById('beyaz'));
const O = (html, x, y, extra = '') => { const d = document.createElement('div'); d.className = 'o ' + extra; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; ov.appendChild(d); return d; };
const CHK = '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

// elementlər
const hudAgo = O('<div class="hud"><div class="et">4 ay əvvəl</div></div>', 70, 250);
const bubble = O('<div class="bub">Yoruldum.</div>', 300, 560);
const chips = [['İşçilər', 120, 640], ['Firmalar', 560, 520], ['Mal girişi', 330, 770]].map(([t, x, y]) => O(`<div class="chip red"><span class="ic">?</span>${t}</div>`, x, y));
const hud7 = O('<div class="hud"><div class="et">Hər gün</div><div class="dg"><span id="c7">0</span> saat</div></div>', 70, 300);
const pile = ['Faktura', 'Borc', 'İşçi', 'Srok', 'Mal'].map((t, k) => O(`<div class="chip red" style="font-size:34px;padding:16px 26px">${t}</div>`, 0, 0));
const noSys = O('<div class="chip red" style="font-size:44px"><span class="ic">✕</span>Sistem yox</div>', 290, 360);
const tel = O(`<div class="tel"><div class="ek">
  <div style="position:absolute;left:0;right:0;top:70px;text-align:center"><img src="ab-logo.png" style="width:150px;height:150px"></div>
  <div style="position:absolute;left:0;right:0;top:236px;text-align:center;color:#fff;font-weight:800;font-size:40px">AsanBiznesim</div>
  ${['Tapşırıqlar', 'Firma borcları', 'Mal girişi'].map((t, k) => `<div class="row" id="row${k}" style="top:${340 + k * 150}px"><span class="ok">${CHK}</span>${t}</div>`).join('')}
  <div class="row" id="row3" style="top:790px;background:#55B848;color:#fff;justify-content:center">Hamısı bir yerdə</div>
 </div></div>`, 560, 330);
const hud4 = O('<div class="hud"><div class="et">4 ay sonra</div><div class="dg"><span>2-ci</span> filial</div></div>', 70, 260);
const msg = O(`<div style="font-size:84px"><span class="w">Uğuru</span> <span class="w">çox</span><br><span class="w">işləmək</span> <span class="w">yox,</span><br><span class="w"><span class="mk"><i></i>sistemli</span></span> <span class="w">işləmək</span><br><span class="w g">gətirir.</span></div>`, 0, 640, 'big');
const ctaLab = O('<div class="chip" style="font-size:36px">Şərhlərə yaz</div>', 0, 590);
const stamp = O('<div class="stamp">SİSTEM</div>', 0, 730);
const ctaQ = O('<div style="font-size:76px">Sən də <span class="g">sistemə</span> keç?</div>', 0, 380, 'big');
const ctaLogo = O('<div style="display:flex;align-items:center;gap:22px;color:#fff;font-weight:800;font-size:46px"><img src="ab-logo.png" style="width:110px;height:110px">asanbiznesim.com</div>', 0, 1010);

const show = (d, a, { y = 0, x = 0, s = 1, bl = 0, r = 0 } = {}) => { d.style.opacity = clamp(a).toFixed(3); d.style.display = a > 0.002 ? (d.dataset.flex ? 'flex' : 'block') : 'none';
  d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`; d.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none'; };
const pop = (t, a, d = 0.5) => spring(clamp((t - a) / d) * 1.0, { sonum: 0.45, tezlik: 10 });
const win = (t, a, b, fi = 0.18, fo = 0.18) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
const centerX = (d) => { d.style.left = '0px'; d.style.right = '0px'; d.dataset.flex = 1; d.style.justifyContent = 'center'; };
[ctaLab, stamp, ctaLogo].forEach(centerX);
const planBy = (ad) => PLAN.planlar.find((p) => p.ad === ad);

function overlay(t) {
  const L = (i) => S(i);
  // yorgun
  { const p = planBy('yorgun'); const w = win(t, p.s, p.e);
    show(hudAgo, w * easeOut(clamp((t - p.s) / 0.3)), { y: (1 - easeOut(clamp((t - p.s) / 0.3))) * 20 });
    const yb = L(3).e - 0.75; const k = pop(t, yb, 0.55); show(bubble, w * clamp(k * 1.5), { s: lerp(0.4, 1, k), r: -3 }); }
  // qaos
  { const p = planBy('qaos'); const w = win(t, p.s, p.e); const c = L(4); const dur = c.e - c.s;
    chips.forEach((d, k) => { const a = c.s + dur * (0.42 + k * 0.19); const x = pop(t, a, 0.5);
      show(d, w * clamp(x * 1.6), { s: lerp(0.5, 1, x), y: Math.sin(t * 2 + k) * 8 }); }); }
  // saat
  { const p = planBy('saat'); const w = win(t, p.s, p.e); const c = L(5);
    show(hud7, w * easeOut(clamp((t - p.s) / 0.3)), { y: (1 - easeOut(clamp((t - p.s) / 0.3))) * 30 });
    const v = Math.round(7 * easeInOut(clamp((t - c.s - 0.3) / Math.max(0.6, c.e - c.s - 0.6)))); const e7 = document.getElementById('c7'); if (e7) e7.textContent = v; }
  // yuk — tapşırıqlar Kamilin üstünə yağır
  { const p = planBy('yuk'); const w = win(t, p.s, p.e); const c = L(7);
    pile.forEach((d, k) => { const a = c.s + 0.15 + k * 0.28; const u = clamp((t - a) / 0.42); const fall = easeOut(u);
      const tx = 360 + (k % 2 ? 60 : -40) + k * 6, ty = lerp(-200, 980 - k * 92, fall);
      d.style.left = tx + 'px'; d.style.top = '0px'; show(d, w * clamp(u * 4), { y: ty, r: (k % 2 ? 6 : -5) * (1 - fall * 0.4) }); });
    const ns = pop(t, L(7).s - 0.05, 0.5); show(noSys, w * clamp(ns * 1.5), { s: lerp(0.5, 1, ns) }); }
  // hell — telefon insert
  { const p = planBy('hell'); const w = win(t, p.s, p.e, 0.2, 0.2); const x = pop(t, p.s + 0.25, 0.6);
    show(tel, w * clamp(x * 1.4), { x: (1 - x) * 420, r: lerp(10, 4, x) });
    const c = L(9); const dur = c.e - c.s;
    [0, 1, 2].forEach((k) => { const r = document.getElementById('row' + k); const u = pop(t, c.s + dur * (0.02 + k * 0.17), 0.45);
      r.style.opacity = clamp(u * 1.5); r.style.transform = `translateX(${(1 - u) * 260}px)`; });
    const r3 = document.getElementById('row3'); const u3 = pop(t, c.s + dur * 0.72, 0.5); r3.style.opacity = clamp(u3 * 1.5); r3.style.transform = `scale(${lerp(0.6, 1, u3)})`; }
  // filial
  { const p = planBy('filial'); const w = win(t, p.s, p.e); const c = L(10); const a = c.s + (c.e - c.s) * 0.62; const x = pop(t, a, 0.5);
    show(hud4, w * clamp(x * 1.5), { s: lerp(0.6, 1, x) }); }
  // mesaj
  { const p = planBy('mesaj'); const w = win(t, p.s, p.e, 0.15, 0.2); show(msg, w);
    const ws = msg.querySelectorAll('.w'); const c = L(11);
    ws.forEach((d, k) => { const u = easeOut(clamp((t - (c.s - 0.05 + k * ((c.e - c.s) * 0.11))) / 0.32)); d.style.opacity = u; d.style.transform = `translateY(${(1 - u) * 40}px)`; d.style.filter = u > 0.99 ? 'none' : `blur(${(1 - u) * 10}px)`; });
    msg.querySelector('.mk i').style.transform = `scaleX(${easeOut(clamp((t - (c.s + (c.e - c.s) * 0.55)) / 0.35))})`; }
  // cta
  { const p = planBy('cta'); const w = win(t, p.s, PLAN.sure + 1, 0.18, 0.01);
    const q1 = easeOut(clamp((t - p.s) / 0.35)); show(ctaQ, w * q1, { y: (1 - q1) * 30 });
    const c = L(13); const lb = easeOut(clamp((t - c.s + 0.1) / 0.3)); show(ctaLab, w * lb, { y: (1 - lb) * 20 });
    const sx = clamp((t - (c.s + 0.25)) / 0.35); const sc = sx < 1 ? lerp(2.3, 1, easeOut(sx)) : 1 + 0.05 * Math.exp(-(t - c.s - 0.6) * 9) * Math.cos((t - c.s - 0.6) * 30);
    show(stamp, w * clamp(sx * 3), { s: sc });
    const lg = easeOut(clamp((t - (c.s + 0.9)) / 0.4)); show(ctaLogo, w * lg, { y: (1 - lg) * 30 }); }
}

/* ---------------- 2-ci filial vitrini ---------------- */
function vitrin(P, { x = 540, ad = 'MARKET', lent = false } = {}) {
  const g = q(), w = 700, top = 640, bot = 1240;
  g.appendChild(duzb(x - w / 2, top, w, bot - top, 10, { fill: '#e9e2d3', stroke: '#2a1f19', 'stroke-width': 5 }));
  g.appendChild(duzb(x - w / 2 - 20, top - 20, w + 40, 40, 10, { fill: '#2E7D32', stroke: '#2a1f19', 'stroke-width': 5 }));
  for (let k = 0; k < 9; k++) g.appendChild(yol2(`M ${x - w / 2 + k * (w / 9)} ${top + 20} h ${w / 9} v 54 a ${w / 18} ${w / 18} 0 0 1 ${-w / 9} 0 z`, { fill: k % 2 ? '#ffffff' : '#55B848', stroke: '#2a1f19', 'stroke-width': 3 }));
  g.appendChild(lovhe(P, { x, y: top - 70, metin: ad, w: 380, h: 92, renk: '#55B848' }));
  g.appendChild(duzb(x - w / 2 + 40, top + 130, 380, 330, 8, { fill: '#9fd6ff', stroke: '#2a1f19', 'stroke-width': 5, opacity: 0.9 }));
  for (let k = 0; k < 3; k++) g.appendChild(duzb(x - w / 2 + 60, top + 180 + k * 90, 340, 14, 4, { fill: '#b98d5c' }));
  g.appendChild(duzb(x + w / 2 - 230, top + 150, 180, 450, 8, { fill: '#6b4a33', stroke: '#2a1f19', 'stroke-width': 5 }));
  g.appendChild(dair(x + w / 2 - 70, top + 380, 8, { fill: '#f2d36b' }));
  if (lent) { g.appendChild(duzb(x - w / 2 - 40, top + 470, w + 80, 26, 6, { fill: '#e53935' })); g.appendChild(yol2(`M ${x - 40} ${top + 482} l -50 -40 v 80 z M ${x + 40} ${top + 482} l 50 -40 v 80 z`, { fill: '#c62828' })); }
  return g;
}

const K = (fn, z = 1.12, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy, z: k.z * z }; };

yonet2d(PLAN, {
  giris(ctx) {
    const m = ctx.mekan('kuce', { isiq: 'axsam', gece: true, seed: 9 });
    const v = vitrin(m.P, { ad: 'MARKET 2', lent: true }); tr(v, { x: 119, y: 330, sx: 0.78, sy: 0.78 }); m.orta.appendChild(v);
    const a = kamil(); m.on.appendChild(a.g); a.ifade({ gulus: 0.75, qas: 0.3, baxis: [0, 0] });
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.poz({ x: 540, y: YER, kolL: [6, 10], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', basDon: Math.sin(tl * 0.8) * 0.15, nefes: Math.sin(tl * 2), t: tl, danis: 0 }); },
      kamera: (tl) => ({ x: 0, y: lerp(60, 0, easeOut(clamp(tl / 2))), z: lerp(1.28, 1.05, easeOut(clamp(tl / 1.2))) }) };
  },
  yorgun(ctx) {
    const m = ctx.mekan('market', { isiq: 'axsam', lovhe: 'MARKET' });
    const a = kamil(); m.on.insertBefore(a.g, m.on.firstChild); a.ifade({ gulus: -0.55, qas: 0.7, egim: -0.5, goz: 0.55, baxis: [0, 0.5] });
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.poz({ x: 520, y: YER2, kolL: [10, 150], elL: ['tutma', 'bloknot'], kolR: [118, 132], elR: 'acik', basEg: 0.22, basDon: -0.1, govdeEg: 0.15, nefes: Math.sin(tl * 1.3) * 1.4, t: tl, danis: 0 }); },
      kamera: K((tl) => ({ x: lerp(-40, 20, clamp(tl / 3)), y: -40, z: punch(tl, 1.35, 1.18) })) };
  },
  qaos(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: 'MARKET' });
    const a = kamil(), i = isci(), f = firma();
    m.on.insertBefore(a.g, m.on.firstChild); m.on.appendChild(i.g); m.on.appendChild(f.g);
    i.ifade({ gulus: 0.1, qas: 0.5, baxis: [0.6, 0] }); f.ifade({ gulus: 0.2, qas: 0.3, baxis: [-0.6, 0] });
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const look = Math.sin(tl * 2.6); a.ifade({ gulus: -0.35, qas: 0.6, egim: -0.3, baxis: [look * 0.8, 0] });
        a.poz({ x: 540, y: YER2, kolL: [40 + Math.sin(tl * 5) * 8, 60], elL: 'acik', kolR: [40 + Math.cos(tl * 5) * 8, 60], elR: 'acik', basDon: look * 0.5, nefes: Math.sin(tl * 3), t: tl, danis: 0 });
        i.poz({ x: 190, y: YER, kolL: [8, 10], kolR: [40 + Math.sin(tl * 4) * 10, 55], elR: 'isare', basDon: 0.4, nefes: Math.sin(tl * 2 + 1), t: tl, danis: 1 });
        f.poz({ x: 900, y: YER, kolL: [12, 148], elL: ['tutma', 'qovluq'], kolR: [35 + Math.sin(tl * 3) * 10, 60], elR: 'isare', basDon: -0.4, nefes: Math.sin(tl * 2), t: tl, danis: 1 }); },
      kamera: K((tl) => ({ x: Math.sin(tl * 1.2) * 30, y: 0, z: punch(tl, 1.25, 1.02) })) };
  },
  saat(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'tund' });
    const a = kamil(); m.on.appendChild(a.g); a.ifade({ gulus: -0.4, qas: 0.5, egim: -0.3, baxis: [0, 0.6], goz: 0.7 });
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.poz({ x: 620, y: YER, kolL: [12, 150], elL: ['tutma', 'bloknot'], kolR: [10, 140 + Math.sin(tl * 9) * 7], elR: ['tutma', 'qelem'], basEg: 0.2, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(60, 0, clamp(tl / 3)), y: 0, z: punch(tl, 1.3, 1.1, 0.5) })) };
  },
  yuk(ctx) {
    const m = ctx.mekan('anbar', { isiq: 'gunduz' });
    const a = kamil(); m.on.appendChild(a.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const c = S(7); const ag = clamp((tt - c.s) / (c.e - c.s));
        a.ifade({ gulus: lerp(-0.1, -0.6, ag), qas: lerp(0.3, 0.8, ag), egim: -0.4, baxis: [0, -0.4] });
        a.yeri(tl, { x: lerp(380, 560, clamp(tl / 2.5)), y: YER, hiz: 1.6, siddet: lerp(1, 0.6, ag), kolL: [12, 148], elL: ['tutma', 'karton'], kolR: [12, 148], elR: 'acik' }); },
      kamera: K((tl) => ({ x: 0, y: 0, z: punch(tl, 1.2, 1.0) })) };
  },
  hell(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'gunduz' });
    const a = kamil(); m.on.appendChild(a.g); a.ifade({ gulus: 0.8, qas: 0.35, baxis: [0.5, 0.2] });
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.poz({ x: 330, y: YER, kolL: [6, 10], kolR: [12, 145], elR: ['tutma', 'telefon'], basDon: 0.35, basEg: 0.05, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 30, clamp(tl / 6)), y: 0, z: punch(tl, 1.18, 1.05, 0.6) })) };
  },
  filial(ctx) {
    const m = ctx.mekan('kuce', { isiq: 'gunduz', gece: false, seed: 9 });
    const v = vitrin(m.P, { ad: 'MARKET 2' }); tr(v, { x: 81, y: 220, sx: 0.85, sy: 0.85 }); m.orta.appendChild(v);
    const a = kamil(); m.on.appendChild(a.g); a.ifade({ gulus: 0.85, qas: 0.4, baxis: [0, 0] });
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const u = easeInOut(clamp(tl / 1.8));
        if (u < 1) a.yeri(tl, { x: lerp(-120, 540, u), y: YER, hiz: 2.2 });
        else a.poz({ x: 540, y: YER, kolL: [6, 10], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-60, 0, easeOut(clamp(tl / 2))), y: 0, z: lerp(1.15, 1.02, easeOut(clamp(tl / 2.5))) })) };
  },
  mesaj(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'tund' });
    const sh = duzb(-600, -600, 2400, 3200, 0, { fill: '#08180F', opacity: 0.78 }); m.on.appendChild(sh);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); },
      kamera: (tl) => ({ x: 0, y: 0, z: lerp(1.3, 1.15, clamp(tl / 3)) }) };
  },
  cta(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: 'MARKET' });
    const a = kamil(); m.on.insertBefore(a.g, m.on.firstChild); a.ifade({ gulus: 0.8, qas: 0.3 });
    const sh = duzb(-600, -600, 2400, 3200, 0, { fill: '#08180F', opacity: 0.55 }); m.on.appendChild(sh);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.poz({ x: 540, y: YER2 + 330, kolL: [6, 10], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', nefes: Math.sin(tl * 2), t: tl }); },
      kamera: (tl) => ({ x: 0, y: 0, z: punch(tl, 1.2, 1.0) }) };
  },
}, { arxa: '#08180F' });
