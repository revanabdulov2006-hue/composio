// AB 2026-11-09 — Sroklar: rəfdə xarab süd. 2D personajlar (insan.js) + sürətli motion keçidləri və DOM overlay-ları.
import { clamp, lerp, easeInOut, easeOut, spring, duzb } from './kit/kadr.js';
import { insan } from './kit/insan.js';
import { sahibkar } from './kit/komanda.js';
import { yonet2d } from './kit/yonet2d.js';
import { PLAN } from './veri.js';

const YER = 1900, YER2 = 1850;
const sahib = (o = {}) => sahibkar({ boy: 1.0, ...o });
const musteri = (o = {}) => insan({ ten: '#e2ae8a', sacRenk: '#2a1a10', sac: 'qadin', geyim: 'pencek', ust: '#7a3346', ic: '#efe6dc',
  alt: '#33303a', ayak: '#4a2e22', boy: 0.93, ...o });
const S = (i) => PLAN.planlar.flatMap((p) => p.cumleler)[i - 1];

PLAN.yazi.gecisler = PLAN.planlar.slice(1).filter((p) => p.gecis !== 'beyaz').map((p) => ({ tip: 'flash', s: p.s + 0.02 }));
PLAN.yazi.hud = [];
PLAN.yazi.alt.forEach((a) => (a.y = 1580));
if (PLAN.yazi.baslik) PLAN.yazi.baslik.y = 300;
const punch = (tl, z0 = 1.22, z1 = 1.04, d = 0.45) => lerp(z0, z1, easeOut(clamp(tl / d)));

const css = document.createElement('style');
css.textContent = `
#ov{position:absolute;inset:0;pointer-events:none;font-family:'Archivo'}
.ab-flash{background:rgba(255,255,255,.5)!important}
#ov .o{position:absolute;opacity:0;will-change:transform,opacity,filter}
.chip{display:inline-flex;align-items:center;gap:16px;padding:20px 30px;border-radius:999px;background:linear-gradient(180deg,#EAF6EC,#D3EBD8);color:#123B24;font-weight:800;font-size:40px;box-shadow:0 18px 40px rgba(0,0,0,.35);white-space:nowrap}
.chip.red{background:linear-gradient(180deg,#f6e3df,#ecd0ca);color:#5a2219}
.chip .ic{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:#C77B6B;color:#fff;font-size:30px;flex:none}
.chip .ok{background:#55B848}
.qm{width:86px;height:86px;border-radius:50%;background:#C77B6B;color:#fff;font-weight:800;font-size:60px;display:grid;place-items:center;box-shadow:0 10px 26px rgba(0,0,0,.35)}
.sud{width:300px;height:470px;position:relative;filter:drop-shadow(0 30px 50px rgba(0,0,0,.5))}
.sud .tp{position:absolute;left:30px;right:30px;top:0;height:90px;background:#e9eef2;border:7px solid #2a1f19;border-bottom:none;clip-path:polygon(0 100%,50% 0,100% 100%);}
.sud .bd{position:absolute;left:0;right:0;top:84px;bottom:0;background:linear-gradient(90deg,#ffffff 0 62%,#e3e9ee 62%);border:7px solid #2a1f19;border-radius:14px;overflow:hidden}
.sud .bn{position:absolute;left:0;right:0;top:60px;height:120px;background:#3d7fd0;color:#fff;font-weight:800;font-size:78px;display:grid;place-items:center;letter-spacing:.04em}
.sud .dt{position:absolute;left:24px;right:24px;bottom:34px;padding:10px 0;text-align:center;font-family:'Geist';font-weight:600;font-size:34px;color:#2a1f19;border:4px dashed #8b8b8b;border-radius:10px}
.stmp{position:absolute;border:10px solid #d8402f;border-radius:26px;padding:4px 26px;color:#d8402f;font-weight:800;font-size:76px;letter-spacing:.02em;background:rgba(255,255,255,.9);white-space:nowrap}
.bub{padding:28px 46px;border-radius:40px;background:#fff;color:#1b1f1c;font-weight:800;font-size:70px;box-shadow:0 24px 60px rgba(0,0,0,.4);white-space:nowrap}
.bub:after{content:'';position:absolute;left:110px;bottom:-30px;border:20px solid transparent;border-top:22px solid #fff;border-left:20px solid #fff}
.tel{width:500px;height:960px;border-radius:72px;background:#0b0f0d;padding:16px;box-shadow:0 40px 90px rgba(0,0,0,.55)}
.tel .ek{width:100%;height:100%;border-radius:58px;background:linear-gradient(180deg,#123B24,#08180F);overflow:hidden;position:relative}
.tel .hd{position:absolute;left:0;right:0;top:64px;display:flex;align-items:center;justify-content:center;gap:16px;color:#fff;font-weight:800;font-size:38px}
.tel .hd img{width:70px;height:70px}
.tel .sb{position:absolute;left:34px;right:34px;top:170px;color:#9fd6a8;font-family:'Geist';font-weight:600;font-size:24px;letter-spacing:.16em;text-transform:uppercase;display:flex;justify-content:space-between}
.tel .row{position:absolute;left:30px;right:30px;height:118px;border-radius:28px;background:linear-gradient(180deg,#EAF6EC,#D3EBD8);display:flex;align-items:center;gap:20px;padding:0 26px;color:#123B24;font-weight:800;font-size:36px}
.tel .row .dot{width:22px;height:22px;border-radius:50%;background:#55B848;flex:none}
.tel .row .d{margin-left:auto;font-family:'Geist';font-weight:600;font-size:30px;color:#2c5a3c}
.tel .row.warn{background:linear-gradient(180deg,#fff1d6,#f7dfb0);color:#5a3a10}
.tel .row.warn .dot{background:#e89a2c}
.nt{position:absolute;left:20px;right:20px;top:40px;border-radius:30px;background:#fff;padding:22px 24px;display:flex;gap:18px;align-items:center;box-shadow:0 20px 40px rgba(0,0,0,.45);color:#1b1f1c}
.nt .bl{width:64px;height:64px;border-radius:18px;background:#e89a2c;display:grid;place-items:center;flex:none}
.nt .t1{font-weight:800;font-size:32px}
.nt .t2{font-family:'Geist';font-weight:600;font-size:26px;color:#555;margin-top:4px}
.nmn{position:absolute;right:30px;bottom:30px;font-family:'Geist';font-weight:600;font-size:22px;letter-spacing:.14em;color:#9fd6a8;opacity:.8}
.bars{position:absolute;left:40px;right:40px;top:330px;height:470px;display:flex;align-items:flex-end;gap:26px}
.bars .b{flex:1;border-radius:18px 18px 8px 8px;background:linear-gradient(180deg,#e2715f,#b8483a);transform-origin:bottom center;position:relative}
.bars .b.g{background:linear-gradient(180deg,#7BD86A,#3f9a36)}
.bars .l{position:absolute;bottom:-50px;left:0;right:0;text-align:center;font-family:'Geist';font-weight:600;font-size:24px;color:#cfe7d4}
.tabs{position:absolute;left:30px;right:30px;top:230px;display:flex;gap:12px}
.tabs span{flex:1;text-align:center;padding:14px 0;border-radius:999px;background:rgba(255,255,255,.1);color:#cfe7d4;font-weight:800;font-size:28px}
.tabs span.on{background:#55B848;color:#fff}
.big{left:60px;right:60px;text-align:center;color:#fff;font-weight:800;line-height:1.08;letter-spacing:-.015em;text-shadow:0 4px 26px rgba(0,0,0,.5)}
.big .g{color:#7BD86A}
.big .w{display:inline-block;margin:0 .1em}
.mk{position:relative;display:inline-block;z-index:0}
.mk i{position:absolute;left:-.08em;right:-.08em;top:.14em;bottom:.06em;background:#55B848;border-radius:10px;transform-origin:left center;z-index:-1}
.mk.r i{background:#d8402f}
.stamp{border:12px solid #55B848;border-radius:36px;padding:6px 40px;color:#7BD86A;font-weight:800;font-size:150px;letter-spacing:.02em;transform:rotate(-5deg)}
`;
document.head.appendChild(css);
const ov = document.createElement('div'); ov.id = 'ov'; document.getElementById('root').insertBefore(ov, document.getElementById('beyaz'));
const O = (html, x, y, extra = '') => { const d = document.createElement('div'); d.className = 'o ' + extra; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; ov.appendChild(d); return d; };
const CHK = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const BELL = '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
const SUD = (dt) => `<div class="sud"><div class="tp"></div><div class="bd"><div class="bn">SÜD</div><div class="dt">${dt}</div></div></div>`;

// hook
const hookSud = O(SUD('Son tarix: 06.11'), 390, 760);
const hookStmp = O('<div class="stmp">SROKU BİTİB</div>', 0, 1290);
// kassa
const kasSud = O(SUD('Son tarix: 06.11'), 620, 600);
const kasBub = O('<div class="bub">Bu xarabdır!</div>', 120, 470);
// yaddaş
const mallar = [['Süd', 90, 520], ['Qatıq', 600, 450], ['Pendir', 160, 760], ['Kolbasa', 610, 700], ['Kərə yağı', 300, 980]]
  .map(([t, x, y]) => O(`<div class="chip red"><span class="ic">?</span>${t}</div>`, x, y));
// ziyan
const ziy = [['✕', 'Mal ziyana gedir'], ['✕', 'Müştərinin etibarı'], ['!', 'Cərimə riski']].map(([i, t], k) => O(`<div class="chip red" style="font-size:50px;padding:24px 36px"><span class="ic" style="width:58px;height:58px;font-size:36px">${i}</span>${t}</div>`, 0, 1130 + k * 165));
// mesaj1
const msg1 = O(`<div style="font-size:92px"><span class="w">Ziyanın</span> <span class="w">çoxu</span><br><span class="w">bahalıqdan</span> <span class="w">yox,</span><br><span class="w"><span class="mk r"><i></i>unutmaqdan</span></span><br><span class="w">gəlir.</span></div>`, 0, 600, 'big');
// hell — telefon
const tel = O(`<div class="tel"><div class="ek">
  <div class="hd"><img src="ab-logo.png">AsanBiznesim</div>
  <div class="sb"><span>Sroklar</span><span>Nümunə</span></div>
  ${[['Süd', '12.11'], ['Qatıq', '18.11'], ['Pendir', '25.11'], ['Kərə yağı', '02.12']].map(([t, d], k) => `<div class="row" id="row${k}" style="top:${230 + k * 140}px"><span class="dot"></span>${t}<span class="d">${d}</span></div>`).join('')}
  <div class="nt" id="ntf"><div class="bl">${BELL}</div><div><div class="t1">Srok yaxınlaşır</div><div class="t2">Süd · 3 gün qalıb</div></div></div>
 </div></div>`, 520, 330);
// rahat
const rh = [['Vaxtında satıldı'], ['Rəfdə xarab mal yoxdur']].map(([t], k) => O(`<div class="chip" style="font-size:44px"><span class="ic ok">${CHK}</span>${t}</div>`, 0, 470 + k * 150));
// analiz
const tel2 = O(`<div class="tel"><div class="ek">
  <div class="hd"><img src="ab-logo.png">Analiz</div>
  <div class="sb"><span>Ziyan olan mallar</span><span>Nümunə</span></div>
  <div class="tabs"><span>Gün</span><span class="on">Həftə</span><span>Ay</span></div>
  <div class="bars">${[[0.85, 'Süd'], [0.6, 'Qatıq'], [0.4, 'Pendir'], [0.22, 'Çörək']].map(([h, l], k) => `<div class="b" id="bar${k}" style="height:${h * 100}%"><div class="l">${l}</div></div>`).join('')}</div>
 </div></div>`, 290, 330);
// mesaj2
const msg2 = O(`<div style="font-size:96px"><span class="w">Dəftəri</span> <span class="w">unut,</span><br><span class="w">srokları</span><br><span class="w"><span class="mk"><i></i>sistem</span></span> <span class="w g">izləsin.</span></div>`, 0, 640, 'big');
// cta
const ctaLab = O('<div class="chip" style="font-size:40px">Şərhlərə yaz</div>', 0, 560);
const stamp = O('<div class="stamp">SİSTEM</div>', 0, 710);
const ctaQ = O('<div style="font-size:72px">Sroklar <span class="g">sistemdə</span> olsun</div>', 0, 380, 'big');
const ctaLogo = O('<div style="display:flex;align-items:center;gap:22px;color:#fff;font-weight:800;font-size:46px"><img src="ab-logo.png" style="width:110px;height:110px">asanbiznesim.com</div>', 0, 1010);

const show = (d, a, { y = 0, x = 0, s = 1, bl = 0, r = 0 } = {}) => { d.style.opacity = clamp(a).toFixed(3); d.style.display = a > 0.002 ? (d.dataset.flex ? 'flex' : 'block') : 'none';
  d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`; d.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none'; };
const pop = (t, a, d = 0.5) => spring(clamp((t - a) / d), { sonum: 0.45, tezlik: 10 });
const win = (t, a, b, fi = 0.18, fo = 0.18) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
const centerX = (d) => { d.style.left = '0px'; d.style.right = '0px'; d.dataset.flex = 1; d.style.justifyContent = 'center'; };
[hookStmp, ctaLab, stamp, ctaLogo, ...ziy, ...rh].forEach(centerX);
const planBy = (ad) => PLAN.planlar.find((p) => p.ad === ad);
const words = (box, c, step) => box.querySelectorAll('.w').forEach((d, k, all) => { const u = easeOut(clamp((t0 - (c.s - 0.05 + k * step)) / 0.32)); d.style.opacity = u; d.style.transform = `translateY(${(1 - u) * 40}px)`; d.style.filter = u > 0.99 ? 'none' : `blur(${(1 - u) * 10}px)`; });
let t0 = 0;

function overlay(t) {
  t0 = t; const L = S;
  { const p = planBy('hook'); const w = win(t, p.s, p.e, 0.01); const x = pop(t, 0.15, 0.55);
    show(hookSud, w * clamp(x * 1.5), { s: lerp(0.5, 1, x), r: Math.sin(t * 2.2) * 2.5, y: Math.sin(t * 1.7) * 8 });
    const sx = clamp((t - 1.2) / 0.3); show(hookStmp, w * clamp(sx * 3), { s: sx < 1 ? lerp(2.2, 1, easeOut(sx)) : 1, r: -6 }); }
  { const p = planBy('kassa'); const w = win(t, p.s, p.e); const c = L(2); const d = c.e - c.s;
    const x = pop(t, c.s + d * 0.35, 0.5); show(kasSud, w * clamp(x * 1.5), { s: lerp(0.4, 0.62, x), r: lerp(-20, 8, x) });
    const b = pop(t, c.s + d * 0.72, 0.5); show(kasBub, w * clamp(b * 1.5), { s: lerp(0.4, 1, b), r: -3 }); }
  { const p = planBy('yaddas'); const w = win(t, p.s, p.e); const c = L(3); const d = c.e - c.s;
    mallar.forEach((el, k) => { const x = pop(t, c.s + d * (0.3 + k * 0.1), 0.5); show(el, w * clamp(x * 1.6), { s: lerp(0.5, 1, x), y: Math.sin(t * 2 + k) * 10 }); }); }
  { const p = planBy('ziyan'); const w = win(t, p.s, p.e); const c = L(4); const d = c.e - c.s;
    ziy.forEach((el, k) => { const x = pop(t, c.s + d * (0.08 + k * 0.3), 0.5); show(el, w * clamp(x * 1.6), { x: (1 - x) * (k % 2 ? 400 : -400), s: lerp(0.8, 1, x) }); }); }
  { const p = planBy('mesaj1'); show(msg1, win(t, p.s, p.e, 0.15, 0.2)); const c = L(5); words(msg1, c, (c.e - c.s) * 0.13);
    msg1.querySelector('.mk i').style.transform = `scaleX(${easeOut(clamp((t - (c.s + (c.e - c.s) * 0.55)) / 0.35))})`; }
  { const p = planBy('hell'); const w = win(t, p.s, p.e, 0.2, 0.2); const x = pop(t, p.s + 0.25, 0.6);
    show(tel, w * clamp(x * 1.4), { x: (1 - x) * 420, r: lerp(10, 3, x) });
    const c = L(6); const d = c.e - c.s;
    [0, 1, 2, 3].forEach((k) => { const r = document.getElementById('row' + k); const u = pop(t, c.s + d * (0.3 + k * 0.13), 0.45);
      r.style.opacity = clamp(u * 1.5); r.style.transform = `translateX(${(1 - u) * 260}px)`; });
    const c7 = L(7); const n = pop(t, c7.s + 0.2, 0.55); const nt = document.getElementById('ntf');
    nt.style.opacity = clamp(n * 1.5); nt.style.transform = `translateY(${(1 - n) * -200}px)`;
    const r0 = document.getElementById('row0'); r0.classList.toggle('warn', t > c7.s + 0.5); }
  { const p = planBy('rahat'); const w = win(t, p.s, p.e); const c = L(8); const d = c.e - c.s;
    rh.forEach((el, k) => { const x = pop(t, c.s + d * (0.15 + k * 0.45), 0.5); show(el, w * clamp(x * 1.6), { s: lerp(0.5, 1, x) }); }); }
  { const p = planBy('analiz'); const w = win(t, p.s, p.e); const x = pop(t, p.s + 0.15, 0.6);
    show(tel2, w * clamp(x * 1.4), { y: (1 - x) * 300, s: lerp(0.9, 1, x) });
    [0, 1, 2, 3].forEach((k) => { const b = document.getElementById('bar' + k); b.style.transform = `scaleY(${easeOut(clamp((t - (p.s + 0.6 + k * 0.18)) / 0.5))})`; }); }
  { const p = planBy('mesaj2'); show(msg2, win(t, p.s, p.e, 0.15, 0.2)); const c = L(10); words(msg2, c, (c.e - c.s) * 0.14);
    msg2.querySelector('.mk i').style.transform = `scaleX(${easeOut(clamp((t - (c.s + (c.e - c.s) * 0.5)) / 0.35))})`; }
  { const p = planBy('cta'); const w = win(t, p.s, PLAN.sure + 1, 0.18, 0.01); const c = L(11);
    const q1 = easeOut(clamp((t - p.s) / 0.35)); show(ctaQ, w * q1, { y: (1 - q1) * 30 });
    const lb = easeOut(clamp((t - c.s - 0.1) / 0.3)); show(ctaLab, w * lb, { y: (1 - lb) * 20 });
    const sx = clamp((t - (c.s + 0.5)) / 0.35); const sc = sx < 1 ? lerp(2.3, 1, easeOut(sx)) : 1 + 0.05 * Math.exp(-(t - c.s - 0.85) * 9) * Math.cos((t - c.s - 0.85) * 30);
    show(stamp, w * clamp(sx * 3), { s: sc });
    const lg = easeOut(clamp((t - (c.s + 1.2)) / 0.4)); show(ctaLogo, w * lg, { y: (1 - lg) * 30 }); }
}

const K = (fn, z = 1.12, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy, z: k.z * z }; };
const qaranlıq = (m, op) => { const sh = duzb(-600, -600, 2400, 3200, 0, { fill: '#08180F', opacity: op }); m.on.appendChild(sh); };

yonet2d(PLAN, {
  hook(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: false, seed: 4 });
    qaranlıq(m, 0.35);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); },
      kamera: (tl) => ({ x: lerp(-80, 40, easeOut(clamp(tl / 3))), y: 0, z: lerp(1.45, 1.2, easeOut(clamp(tl / 2.5))) }) };
  },
  kassa(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: 'MARKET' });
    const a = sahib(), mu = musteri();
    m.on.insertBefore(a.g, m.on.firstChild); m.on.appendChild(mu.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const c = S(2); const sok = clamp((tt - (c.s + (c.e - c.s) * 0.6)) / 0.4);
        a.ifade({ gulus: lerp(0.5, -0.4, sok), qas: lerp(0.2, 0.7, sok), egim: -0.3 * sok, baxis: [0.6, 0] });
        mu.ifade({ gulus: lerp(0.2, -0.7, sok), qas: lerp(0.2, 0.6, sok), egim: 0.8 * sok, ac: 0.4 * sok, baxis: [lerp(0, 0.4, sok), lerp(0.4, 0, sok)] });
        a.poz({ x: 340, y: YER2, kolL: [10, 148], kolR: [10, 148], elR: 'acik', basDon: 0.35, nefes: Math.sin(tl * 2), t: tl, danis: 0 });
        mu.poz({ x: 800, y: YER, kolL: [8, 12], kolR: [lerp(20, 55, sok) + Math.sin(tl * 4) * 6, lerp(140, 60, sok)], elR: sok > 0.5 ? 'isare' : 'acik', basDon: -0.4, basEg: 0.1 * (1 - sok), nefes: Math.sin(tl * 2 + 1), t: tl, danis: sok > 0.5 ? 1 : 0 }); },
      kamera: K((tl) => ({ x: Math.sin(tl * 0.9) * 25, y: 0, z: punch(tl, 1.28, 1.04) })) };
  },
  yaddas(ctx) {
    const m = ctx.mekan('anbar', { isiq: 'gunduz' });
    const a = sahib(); m.on.appendChild(a.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const look = Math.sin(tl * 2.4);
        a.ifade({ gulus: -0.35, qas: 0.65, egim: -0.4, baxis: [look * 0.8, -0.3] });
        a.poz({ x: 540, y: YER, kolL: [12, 150], elL: ['tutma', 'bloknot'], kolR: [135 + Math.sin(tl * 3) * 8, 120], elR: 'acik', basDon: look * 0.45, nefes: Math.sin(tl * 2.5), t: tl }); },
      kamera: K((tl) => ({ x: lerp(50, -30, clamp(tl / 4)), y: 0, z: punch(tl, 1.25, 1.03) })) };
  },
  ziyan(ctx) {
    const m = ctx.mekan('market', { isiq: 'axsam', lovhe: 'MARKET' });
    const a = sahib(); m.on.insertBefore(a.g, m.on.firstChild);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: -0.6, qas: 0.75, egim: -0.5, goz: 0.6, baxis: [0, 0.5] });
        a.poz({ x: 540, y: YER2, kolL: [10, 150], kolR: [10, 150], elR: 'acik', basEg: 0.22, govdeEg: 0.12, nefes: Math.sin(tl * 1.3) * 1.4, t: tl }); },
      kamera: K((tl) => ({ x: 0, y: lerp(-40, 0, clamp(tl / 4)), z: punch(tl, 1.3, 1.1) }), 1.12, 260) };
  },
  mesaj1(ctx) {
    const m = ctx.mekan('market', { isiq: 'tund', lovhe: false }); qaranlıq(m, 0.8);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); },
      kamera: (tl) => ({ x: 0, y: 0, z: lerp(1.3, 1.15, clamp(tl / 3)) }) };
  },
  hell(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'gunduz' });
    const a = sahib(); m.on.appendChild(a.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: 0.75, qas: 0.35, baxis: [0.5, 0.2] });
        a.poz({ x: 300, y: YER, kolL: [6, 10], kolR: [12, 145], elR: ['tutma', 'telefon'], basDon: 0.35, basEg: 0.05, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 30, clamp(tl / 6)), y: 0, z: punch(tl, 1.18, 1.05, 0.6) })) };
  },
  rahat(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: 'MARKET', seed: 8 });
    const a = sahib(), mu = musteri({ ust: '#2f6b5a' }); m.on.insertBefore(a.g, m.on.firstChild); m.on.appendChild(mu.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: 0.85, qas: 0.3, baxis: [0.5, 0] }); mu.ifade({ gulus: 0.7, qas: 0.3, baxis: [-0.5, 0] });
        a.poz({ x: 360, y: YER2, kolL: [8, 12], kolR: [40 + Math.sin(tl * 4) * 8, 55], elR: 'acik', basDon: 0.35, nefes: Math.sin(tl * 2), t: tl, danis: 1 });
        const u = easeInOut(clamp(tl / 1.6));
        if (u < 1) mu.yeri(tl, { x: lerp(1200, 790, u), y: YER, hiz: 2 });
        else mu.poz({ x: 790, y: YER, kolL: [12, 148], elL: ['tutma', 'karton'], kolR: [8, 12], basDon: -0.4, nefes: Math.sin(tl * 2 + 1), t: tl }); },
      kamera: K((tl) => ({ x: lerp(40, 0, easeOut(clamp(tl / 2))), y: 0, z: punch(tl, 1.22, 1.03) })) };
  },
  analiz(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'axsam' }); qaranlıq(m, 0.45);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); },
      kamera: (tl) => ({ x: lerp(-40, 40, clamp(tl / 4)), y: 0, z: lerp(1.25, 1.1, easeOut(clamp(tl / 2))) }) };
  },
  mesaj2(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'tund' }); qaranlıq(m, 0.78);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); },
      kamera: (tl) => ({ x: 0, y: 0, z: lerp(1.3, 1.15, clamp(tl / 3)) }) };
  },
  cta(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: 'MARKET' });
    const a = sahib(); m.on.insertBefore(a.g, m.on.firstChild); qaranlıq(m, 0.55);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); a.ifade({ gulus: 0.8, qas: 0.3 });
        a.poz({ x: 540, y: YER2 + 330, kolL: [6, 10], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', nefes: Math.sin(tl * 2), t: tl }); },
      kamera: (tl) => ({ x: 0, y: 0, z: punch(tl, 1.2, 1.0) }) };
  },
}, { arxa: '#08180F' });
