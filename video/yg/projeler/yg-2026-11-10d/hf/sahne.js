// YG 2026-11-10d — "Yeni müştəri, yoxsa daimi müştəri?"
// Vizual standart (video/README §1): hər bölmənin öz fonu, hər kəsikdə real keçid (whip / panel / zoom / iris / şter),
// kinetik tipoqrafiya (Archivo + Fraunces + Jakarta), daim hərəkətli kamera, film qrain, fiqurlar, real UI.
// 2D personaj yalnız 3 səhnədə (qayit, mohur, panel) — satış tipli video.
import { clamp, lerp, easeInOut, easeOut, spring, duzb } from './kit/kadr.js';
import { insan } from './kit/insan.js';
import { kofeshop } from './kit/komanda.js';
import { pistaxta } from './kit/mekan.js';
import { yonet2d } from './kit/yonet2d.js';
import { PLAN } from './veri.js';

PLAN.yazi.baslik = null; PLAN.yazi.hud = []; PLAN.yazi.alt = []; PLAN.yazi.gecisler = [];
const P = (ad) => PLAN.planlar.find((p) => p.ad === ad);
const S = (i) => PLAN.planlar.flatMap((p) => p.cumleler)[i - 1];
const eo = (x) => { x = clamp(x); return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); };           // expo out
const ei = (x) => { x = clamp(x); return x <= 0 ? 0 : Math.pow(2, 10 * x - 10); };            // expo in
const io = (x) => easeInOut(clamp(x));
const sp = (t, a, d = 0.55) => spring(clamp((t - a) / d), { sonum: 0.5, tezlik: 11 });
const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- CSS
const css = document.createElement('style');
css.textContent = `
#ov{position:absolute;inset:0;pointer-events:none}
.sc{position:absolute;inset:0;overflow:hidden;display:none}
.sc .a{position:absolute;will-change:transform,opacity,filter}
#grain{background:url(grain.png);mix-blend-mode:overlay;opacity:.17}
#vig{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 45%,transparent 55%,rgba(0,0,0,.42) 100%);pointer-events:none}
.ser{font-family:Fraunces;font-weight:300;letter-spacing:-.03em;line-height:1;font-variation-settings:"opsz" 144}
.ser i{font-style:italic;font-weight:900}
.gro{font-family:Archivo;font-weight:800;letter-spacing:-.025em;line-height:.9;text-transform:uppercase}
.ui{font-family:Jakarta;font-weight:700}
.lm{display:block;overflow:hidden;padding:.06em 0 .14em;margin:-.06em 0 -.14em}
.li{display:inline-block;will-change:transform}
.ch{display:inline-block;will-change:transform,opacity}
.mk{position:relative;display:inline-block;z-index:0}
.mk>b{position:absolute;left:-.06em;right:-.06em;top:.18em;bottom:.04em;border-radius:.08em;transform-origin:left center;z-index:-1;transform:scaleX(0)}
.ctr{text-align:center;left:0;right:0}
.fig{position:absolute;width:60px;height:150px}
.fig svg{overflow:visible}
.fig .lg{transform-box:fill-box;transform-origin:50% 0}
.tag{display:inline-block;padding:18px 40px 14px;border-radius:22px;font-family:Archivo;font-weight:800;font-size:110px;letter-spacing:-.02em;line-height:1;text-transform:uppercase;box-shadow:0 30px 70px rgba(0,0,0,.45)}
.bar{position:absolute;bottom:0;width:100%;border-radius:26px 26px 6px 6px}
.ph{position:absolute;border-radius:58px;background:#0e0c0b;padding:14px;box-shadow:0 50px 120px rgba(0,0,0,.6),inset 0 0 0 2px #3a3330}
.ph img{display:block;width:100%;border-radius:46px}
.list{width:720px;border-radius:44px;background:#fffdfa;padding:34px 30px 26px;box-sizing:border-box;box-shadow:0 40px 90px rgba(0,0,0,.5);font-family:Jakarta;color:#1c1917}
.list .hd{display:flex;align-items:center;gap:18px;font-family:Fraunces;font-weight:900;font-size:50px;margin:0 6px 22px}
.list .hd img{width:72px;height:72px}
.list .r{display:flex;align-items:center;gap:20px;height:112px;border-radius:28px;background:#f6efe6;margin-bottom:14px;padding:0 24px;font-weight:800;font-size:36px}
.list .r .av{width:68px;height:68px;border-radius:50%;background:#e8703a;color:#fff;display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:36px;flex:none}
.list .r .d{margin-left:auto;font-weight:700;font-size:28px;padding:10px 18px;border-radius:999px;white-space:nowrap}
.list .r .ok{background:#e3f1df;color:#2f6b2a}.list .r .wr{background:#fde3d3;color:#b23a12}
.list .sm{text-align:right;font-weight:600;font-size:22px;color:#a8a097;letter-spacing:.12em;margin-top:6px}
.stampDev{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ff9a5e,#e8703a 55%,#c2410c);border:10px solid #3b1a0b;display:grid;place-items:center;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.ring{width:150px;height:150px;border-radius:50%;border:8px solid #ffb877}
.pill{display:inline-flex;align-items:center;gap:16px;padding:20px 34px;border-radius:999px;background:#fffdfa;color:#1c1917;font-family:Jakarta;font-weight:800;font-size:40px;box-shadow:0 18px 44px rgba(0,0,0,.35);white-space:nowrap}
.pill .n{min-width:56px;height:56px;border-radius:28px;background:#e8703a;color:#fff;display:grid;place-items:center;font-size:30px;padding:0 10px}
.cmt{width:900px;height:150px;border-radius:75px;background:#fffdfa;display:flex;align-items:center;gap:26px;padding:0 30px 0 26px;box-sizing:border-box;box-shadow:0 40px 90px rgba(59,26,11,.45)}
.cmt .av{width:96px;height:96px;border-radius:50%;background:#1c1714;display:grid;place-items:center;flex:none}
.cmt .av img{width:64px;height:64px}
.cmt .tx{font-family:Jakarta;font-weight:700;font-size:58px;color:#1c1917;flex:1;white-space:nowrap}
.cmt .cr{display:inline-block;width:5px;height:60px;background:#e8703a;vertical-align:-8px;margin-left:4px}
.cmt .go{font-family:Jakarta;font-weight:800;font-size:40px;color:#c2410c}
.mq{white-space:nowrap;font-family:Archivo;font-weight:800;font-size:320px;line-height:1;letter-spacing:-.02em;color:transparent;-webkit-text-stroke:3px rgba(255,247,238,.32)}
.tpan{position:absolute;top:-400px;height:2720px;width:1500px}
`;
document.head.appendChild(css);

// ---------------------------------------------------------------- DOM qurucuları
const root = document.getElementById('root');
const cam = document.getElementById('cam');
const ov = document.createElement('div'); ov.id = 'ov'; cam.appendChild(ov);
const trL = document.getElementById('tr');
const grain = document.getElementById('grain');
const vig = document.createElement('div'); vig.id = 'vig'; root.insertBefore(vig, grain);

const SC = {};
const scene = (ad, bg = 'transparent') => { const d = document.createElement('div'); d.className = 'sc'; d.style.background = bg; ov.appendChild(d); SC[ad] = d; return d; };
const put = (sc, html, x, y, cls = '', st = '') => { const d = document.createElement('div'); d.className = 'a ' + cls; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; if (st) d.style.cssText += st; sc.appendChild(d); return d; };
const set = (d, { o = 1, x = 0, y = 0, s = 1, sx = 1, sy = 1, r = 0, bl = 0 } = {}) => {
  d.style.opacity = clamp(o).toFixed(3); d.style.visibility = o > 0.002 ? 'visible' : 'hidden';
  d.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(s * sx).toFixed(4)},${(s * sy).toFixed(4)}) rotate(${r.toFixed(2)}deg)`;
  d.style.filter = bl > 0.3 ? `blur(${bl.toFixed(1)}px)` : 'none';
};
// sətir maskası: [{h, c?, st?}] → hər sətir alt-alta, maska içindən sürüşür
const LM = (lines) => lines.map((l) => `<span class="lm ${l.c || ''}" style="${l.st || ''}"><span class="li">${l.h}</span></span>`).join('');
const linesAnim = (box, t, a, b, step = 0.09, dist = 115) => box.querySelectorAll('.li').forEach((d, k) => {
  const u = eo((t - (a + k * step)) / 0.6); const out = ei((t - (b - 0.32 + k * 0.035)) / 0.32);
  d.style.transform = `translateY(${((1 - u) * dist - out * dist).toFixed(1)}%) rotate(${((1 - u) * 4).toFixed(2)}deg)`;
});
// hərf-hərf
const CH = (s) => [...s].map((c) => c === ' ' ? '<span class="ch">&nbsp;</span>' : `<span class="ch">${c}</span>`).join('');
const charsAnim = (box, t, a, step = 0.028, mode = 'up') => box.querySelectorAll('.ch').forEach((d, k) => {
  const u = eo((t - (a + k * step)) / 0.5);
  if (mode === 'up') { d.style.transform = `translateY(${((1 - u) * 70).toFixed(1)}%) rotate(${((1 - u) * 14).toFixed(1)}deg)`; d.style.opacity = clamp(u * 1.4).toFixed(3); }
  else { const s = lerp(1.8, 1, u); d.style.transform = `scale(${s.toFixed(3)})`; d.style.opacity = clamp(u * 2).toFixed(3); }
});
const markAnim = (box, t, a, d = 0.45) => box.querySelectorAll('.mk>b').forEach((b, k) => { b.style.transform = `scaleX(${io((t - a - k * 0.12) / d).toFixed(3)})`; });

// fiqur (piktoqram insan)
const FIG = (c) => `<svg viewBox="0 0 60 150" width="60" height="150"><circle cx="30" cy="16" r="14" fill="${c}"/>`
  + `<path d="M8 54Q8 35 30 35Q52 35 52 54V95Q52 101 46 101H14Q8 101 8 95Z" fill="${c}"/>`
  + `<rect class="lg" x="13" y="97" width="14" height="50" rx="7" fill="${c}"/><rect class="lg" x="33" y="97" width="14" height="50" rx="7" fill="${c}"/></svg>`;
const fig = (sc, c, x, y, sc_ = 1) => { const d = put(sc, FIG(c), x, y, 'fig'); d.dataset.s = sc_; return d; };
const walk = (d, t, sp_ = 1, k = 0) => { const lg = d.querySelectorAll('.lg'); const ph = t * 9 * sp_ + k;
  if (lg[0]) { lg[0].style.transform = `rotate(${(Math.sin(ph) * 20).toFixed(1)}deg)`; lg[1].style.transform = `rotate(${(-Math.sin(ph) * 20).toFixed(1)}deg)`; }
  return Math.abs(Math.sin(ph)) * -7; };
const still = (d) => d.querySelectorAll('.lg').forEach((l) => { l.style.transform = 'rotate(0deg)'; });

// ---------------------------------------------------------------- SƏHNƏLƏR
const C = { ink: '#1c1714', cream: '#f4ece1', paper: '#efe5d7', terra: '#e8703a', rust: '#c2410c', sand: '#d9b99a', slate: '#5b6b73', coal: '#3a302b', glow: '#ff8a4c' };

// 1. HOOK — split versus
const hk = scene('hook', C.ink);
const hL = put(hk, '', 0, 0, '', `width:540px;height:1920px;background:linear-gradient(170deg,#f6efe6,#eadfce)`);
const hR = put(hk, '', 540, 0, '', `width:540px;height:1920px;background:radial-gradient(120% 80% at 30% 30%,#f08a4f,#e8703a 50%,#b93d0c)`);
const hW1 = put(hk, `<div class="gro" style="font-size:168px;color:${C.ink}">${CH('YENİ')}</div>`, 60, 430);
const hW2 = put(hk, `<div class="gro" style="font-size:150px;color:#fff4ea">${CH('DAİMİ')}</div>`, 590, 440);
const hD1 = put(hk, `<div class="ser" style="font-size:52px;color:${C.coal}">${LM([{ h: '<i>qazanmaq</i>' }])}</div>`, 64, 620);
const hD2 = put(hk, `<div class="ser" style="font-size:52px;color:#fff4ea">${LM([{ h: '<i>qaytarmaq</i>' }])}</div>`, 596, 620);
const hVs = put(hk, `<div style="width:190px;height:190px;border-radius:50%;background:${C.ink};display:grid;place-items:center;box-shadow:0 24px 60px rgba(0,0,0,.45)"><span class="ser" style="font-size:58px;color:#fff4ea"><i>yoxsa</i></span></div>`, 445, 805);
const hFL = [C.rust, C.coal, C.slate].map((c, k) => fig(hk, c, -100, 1060 + k * 8, 1));
const hFR = [C.cream, '#fff4ea', C.sand, '#3b1a0b'].map((c) => fig(hk, c, 780, 1080, 1));
const hBand = put(hk, '', 0, 1420, '', `width:1080px;height:520px;background:${C.ink}`);
const hQ = put(hk, `<div class="ser" style="font-size:96px;color:#fff4ea;text-align:center">${LM([{ h: 'Hansı daha' }, { h: '<i style="color:#ff8a4c">önəmlidir?</i>' }])}</div>`, 0, 1530, 'ctr');

// 2. GÜC — tünd, hərəkətli orb + axan kütlə
const gc = scene('guc', 'radial-gradient(110% 70% at 70% 30%,#3a1a0c 0%,#191311 60%)');
const gOrb = put(gc, '<div style="width:900px;height:900px;border-radius:50%;background:#c2410c;filter:blur(170px);opacity:.42"></div>', 0, 0);
const gT = put(gc, `<div style="text-align:left">${LM([
  { h: 'Çox biznes bütün', c: 'ser', st: 'font-size:76px;color:#f4ece1' },
  { h: 'gücünü', c: 'ser', st: 'font-size:76px;color:#f4ece1' },
  { h: 'YENİYƏ', c: 'gro', st: `font-size:200px;color:${C.terra}` },
  { h: '<i>verir.</i>', c: 'ser', st: 'font-size:76px;color:#f4ece1' }])}</div>`, 80, 170);
const gTags = [['reklam', C.terra, '#fff4ea', -6, 120, 900], ['endirim', '#fff4ea', C.ink, 4, 330, 1080], ['flayer', C.sand, C.ink, -3, 170, 1260]]
  .map(([w, bg, fg, r, x, y]) => { const d = put(gc, `<span class="tag" style="background:${bg};color:${fg}">${w}</span>`, x, y); d.dataset.r = r; return d; });
const gCrowd = Array.from({ length: 9 }, (_, k) => fig(gc, [C.cream, C.sand, C.terra, C.slate, '#8a6a55'][k % 5], -200, 1560, 1));

// 3. AMMA — krem kağız, xətli
const am = scene('amma', `repeating-linear-gradient(0deg,transparent 0 118px,rgba(28,23,20,.07) 118px 120px),linear-gradient(170deg,#f6efe6,#eadfce)`);
const amRule = put(am, '', 150, 0, '', 'width:3px;height:1920px;background:rgba(194,65,12,.25)');
const amA = put(am, `<div class="ser" style="font-size:190px;color:${C.ink}">${CH('Amma')}</div>`, 190, 520);
const amB = put(am, `<div class="ser" style="font-size:100px;color:${C.ink};line-height:1.05">${LM([
  { h: '<i style="color:#c2410c">araşdırmalar</i>' },
  { h: '<span class="mk"><b style="background:rgba(232,112,58,.32)"></b>başqa şey</span>' },
  { h: 'deyir.' }])}</div>`, 190, 800);

// 4. STAT — sütun qrafiki
const st = scene('stat', 'radial-gradient(100% 60% at 50% 70%,#2a211c 0%,#120e0c 70%)');
put(st, '', 0, 0, '', 'width:1080px;height:1920px;background-image:linear-gradient(rgba(244,236,225,.045) 2px,transparent 2px);background-size:100% 120px');
const stT = put(st, `<div class="ser" style="font-size:80px;color:#f4ece1;text-align:center">${LM([
  { h: 'Yeni müştəri' }, { h: '<i style="color:#ff8a4c">beş dəfədən çox</i>' }, { h: 'baha başa gəlir' }])}</div>`, 0, 170, 'ctr');
const BASE = 1440;
const stBA = put(st, `<div class="bar" style="height:100%;background:linear-gradient(180deg,#ff9a5e,#e8703a 40%,#a83508)"></div>`, 200, 0, '', 'width:280px');
const stBB = put(st, `<div class="bar" style="height:100%;background:linear-gradient(180deg,#fff4ea,#d9c7b3)"></div>`, 600, 0, '', 'width:280px');
const stN = put(st, `<div class="gro" style="font-size:190px;color:#fff4ea;width:280px;text-align:center">5×</div>`, 200, 0);
const stN2 = put(st, `<div class="gro" style="font-size:110px;color:#1c1714;width:280px;text-align:center">1×</div>`, 600, 0);
const stLA = put(st, `<div class="ui" style="font-size:42px;color:#f4ece1;width:280px;text-align:center">Yeni<br>müştəri</div>`, 200, BASE + 30);
const stLB = put(st, `<div class="ui" style="font-size:42px;color:#f4ece1;width:280px;text-align:center">Mövcud<br>müştəri</div>`, 600, BASE + 30);
const stUp = put(st, `<div class="ser" style="font-size:54px;color:#ff8a4c"><i>bəzən 25 dəfəyə qədər</i></div>`, 0, 0, 'ctr', 'text-align:center');
const stSrc = put(st, `<div class="ui" style="font-size:28px;font-weight:600;color:rgba(244,236,225,.5);text-align:center">Mənbə: Harvard Business Review</div>`, 0, 1720, 'ctr');

// 5. QAYIT — 2D kafe + söz ticker
const qy = scene('qayit');
put(qy, '', 0, 0, '', 'width:1080px;height:760px;background:linear-gradient(180deg,rgba(20,15,12,.92) 0%,rgba(20,15,12,.7) 60%,transparent 100%)');
const qyT = put(qy, `<div class="ser" style="font-size:78px;color:#f4ece1;text-align:center">${LM([{ h: 'Qayıdan müştəri' }])}</div>`, 0, 170, 'ctr');
const qyW = ['səni tanıyır', 'sənə güvənir', 'dostunu gətirir'].map((w) =>
  put(qy, `<div class="gro" style="font-size:118px;color:#fff4ea;text-align:center;white-space:nowrap"><span class="mk"><b style="background:${C.rust}"></b>${w}</span></div>`, 0, 300, 'ctr'));

// 6. QAPI — iki yarı
const qp = scene('qapi', C.ink);
const qpGlow = put(qp, '', 600, 300, '', 'width:280px;height:520px;border-radius:140px 140px 18px 18px;background:linear-gradient(180deg,#fff4ea,#ffc99e 60%,#e8703a);box-shadow:0 0 120px 30px rgba(255,160,90,.45)');
const qpFig = fig(qp, C.cream, 0, 0, 1);
const qpT1 = put(qp, `<div>${LM([{ h: 'YENİ', c: 'gro', st: 'font-size:150px;color:#fff4ea' }, { h: '<i>qapını açır</i>', c: 'ser', st: 'font-size:72px;color:#ff8a4c' }])}</div>`, 80, 150);
const qpB = put(qp, '', 0, 960, '', `width:1080px;height:960px;background:radial-gradient(120% 90% at 30% 20%,#f08a4f,#e8703a 50%,#b93d0c)`);
const qpT2 = put(qp, `<div>${LM([{ h: 'DAİMİ', c: 'gro', st: `font-size:150px;color:${C.ink}` }, { h: '<i>işini ayaqda saxlayır</i>', c: 'ser', st: 'font-size:72px;color:#3b1a0b' }])}</div>`, 80, 1010);
const qpSlab = put(qp, `<div style="width:760px;height:84px;border-radius:20px;background:${C.ink};display:flex;align-items:center;justify-content:center;gap:18px;box-shadow:0 24px 50px rgba(59,26,11,.45)"><img src="logo.png" style="width:56px;height:56px"><span class="ui" style="font-size:36px;color:#f4ece1">sənin biznesin</span></div>`, 160, 1330);
const qpCols = [0, 1, 2, 3, 4].map((k) => fig(qp, ['#3b1a0b', '#fff4ea', C.ink, '#fff4ea', '#3b1a0b'][k], 210 + k * 150, 1470, 1.25));

// 7. BƏS — qara, sual
const bs = scene('bes', '#0b0908');
const bsT1 = put(bs, `<div class="ser" style="font-size:104px;color:#f4ece1;text-align:center">${LM([{ h: 'Bəs onu necə' }])}</div>`, 0, 700, 'ctr');
const bsT2 = put(bs, `<div class="gro" style="font-size:112px;color:#ff8a4c;text-align:center;line-height:.95">${CH('GERİ')}<br>${CH('QAYTARIRSAN?')}</div>`, 0, 860, 'ctr');
const bsLogo = put(bs, '<img src="logo.png" style="width:150px;height:150px">', 465, 1330);

// 8. MÖHÜR — 2D kassa
const mh = scene('mohur');
put(mh, '', 0, 0, '', 'width:1080px;height:640px;background:linear-gradient(180deg,rgba(20,15,12,.9),rgba(20,15,12,.55) 65%,transparent)');
const mhT1 = put(mh, `<div class="ser" style="font-size:76px;color:#f4ece1;text-align:center">${LM([{ h: 'Hər gəlişində' }])}</div>`, 0, 170, 'ctr');
const mhT2 = put(mh, `<div class="gro" style="font-size:150px;color:#fff4ea;text-align:center">${CH('MÖHÜR')}</div>`, 0, 280, 'ctr');
const mhDev = put(mh, '<div class="stampDev"><img src="logo.png" style="width:90px;height:90px;filter:brightness(0) invert(1)"></div>', 640, 1030);
const mhRings = [0, 1, 2].map(() => put(mh, '<div class="ring"></div>', 640, 1030));
const mhPlus = put(mh, '<div class="pill"><span class="n">+1</span>möhür</div>', 560, 860);

// 9. HƏDİYYƏ — real foto + real ekranlar
const hd = scene('hediyye', '#120e0c');
const hdBg = put(hd, '<img src="card.jpg" style="width:1300px;height:1806px;object-fit:cover;filter:blur(38px) brightness(.55) saturate(1.2)">', -110, 57);
const hdP1 = put(hd, '<div class="ph" style="width:360px;position:relative"><img src="scr2.png"></div>', 0, 760);
const hdP2 = put(hd, '<div class="ph" style="width:360px;position:relative"><img src="scr4.png"></div>', 0, 760);
const hdHero = put(hd, '<img src="card.jpg" style="width:700px;border-radius:44px;box-shadow:0 60px 140px rgba(0,0,0,.65);display:block">', 190, 640);
const hdT = put(hd, `<div style="text-align:center">${LM([{ h: 'Hədiyyə yaxınlaşdıqca', c: 'ser', st: 'font-size:76px;color:#f4ece1' }, { h: 'GETMƏK İSTƏMİR', c: 'gro', st: 'font-size:100px;color:#fff4ea' }])}</div>`, 0, 200, 'ctr');

// 10. PANEL — 2D sahibkar + siyahı
const pn = scene('panel');
put(pn, '', 0, 0, '', 'width:1080px;height:640px;background:linear-gradient(180deg,rgba(20,15,12,.9),rgba(20,15,12,.55) 65%,transparent)');
const pnT = put(pn, `<div style="text-align:center">${LM([{ h: 'Kim gəlir, <i style="color:#ff8a4c">kim itib</i>', c: 'ser', st: 'font-size:84px;color:#f4ece1' }, { h: 'HAMISI GÖZ ÖNÜNDƏ', c: 'gro', st: 'font-size:84px;color:#fff4ea' }])}</div>`, 0, 170, 'ctr');
const ROWS = [['A', 'Aysel', 'bu gün', 'ok'], ['M', 'Murad', 'dünən', 'ok'], ['L', 'Leyla', '3 həftədir yox', 'wr'], ['E', 'Elvin', '5 həftədir yox', 'wr']];
const pnList = put(pn, `<div class="list"><div class="hd"><img src="logo.png">Müştərilərin</div>${ROWS.map(([a, n, d, c], k) => `<div class="r" id="lr${k}"><div class="av">${a}</div>${n}<span class="d ${c}">${d}</span></div>`).join('')}<div class="sm">NÜMUNƏ</div></div>`, 320, 660);

// 11. CTA — terrakota, marquee, şərh sahəsi
const ct = scene('cta', 'radial-gradient(120% 80% at 40% 25%,#f39a62 0%,#e8703a 45%,#a83508 100%)');
const ctM1 = put(ct, `<div class="mq">KART · KART · KART · KART · KART ·</div>`, 0, 1060);
const ctM2 = put(ct, `<div class="mq">KART · KART · KART · KART · KART ·</div>`, 0, 1380);
const ctT = put(ct, `<div style="text-align:center">${LM([{ h: 'Başlamaq istəyirsənsə,', c: 'ser', st: 'font-size:80px;color:#fff4ea' }, { h: 'ŞƏRHLƏRƏ YAZ', c: 'gro', st: 'font-size:118px;color:#2a1209' }])}</div>`, 0, 260, 'ctr');
const ctC = put(ct, `<div class="cmt"><div class="av"><img src="logo.png"></div><div class="tx"><span id="ctx"></span><span class="cr" id="ccr"></span></div><div class="go">Göndər</div></div>`, 90, 720);
const ctB = put(ct, `<div style="display:flex;align-items:center;gap:22px;justify-content:center"><img src="logo.png" style="width:110px;height:110px"><span class="ui" style="font-size:52px;color:#fff4ea;font-weight:800">yenegel.app</span></div>`, 0, 1690, 'ctr');

// ---------------------------------------------------------------- KEÇİDLƏR
// plan başlanğıcında (kəsik anı) keçid tipi
const TR = { guc: ['whip', 1], amma: ['panels', [C.terra, C.cream, C.ink]], stat: ['zoom'], qayit: ['iris', 740, 1010, C.terra],
  qapi: ['shutter', C.cream], bes: ['whipv', -1], mohur: ['iris', 540, 1405, C.cream], hediyye: ['panels', [C.ink, C.rust, C.sand]],
  panel: ['whip', -1], cta: ['zoom'] };
const tp = [0, 1, 2].map(() => { const d = document.createElement('div'); d.className = 'tpan'; trL.appendChild(d); return d; });
const tIris = document.createElement('div'); tIris.style.cssText = 'position:absolute;inset:0'; trL.appendChild(tIris);
const tSh = [0, 1].map(() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:0;width:1080px;height:960px'; trL.appendChild(d); return d; });
const tFlash = document.createElement('div'); tFlash.style.cssText = 'position:absolute;inset:0;background:radial-gradient(70% 50% at 50% 50%,rgba(255,214,170,.9),rgba(255,150,80,0) 70%);mix-blend-mode:screen;opacity:0'; trL.appendChild(tFlash);

function transitions(t) {
  let cx = 0, cy = 0, cs = 1, cb = 0, csx = 1, csy = 1;
  tp.forEach((d) => { d.style.display = 'none'; }); tIris.style.display = 'none'; tSh.forEach((d) => { d.style.display = 'none'; });
  let flash = 0;
  for (const p of PLAN.planlar) {
    const tr = TR[p.ad]; if (!tr) continue; const c = p.s; const dt = t - c;
    if (dt < -0.45 || dt > 0.55) continue;
    const typ = tr[0];
    if (typ === 'whip' || typ === 'whipv') {
      const dir = tr[1]; const D = typ === 'whip' ? 1 : 0;
      if (dt < 0) { const k = ei((dt + 0.24) / 0.24); const off = -dir * k * 1100; if (D) cx += off; else cy += off; cb = Math.max(cb, k * 26); if (D) csx += k * 0.18; else csy += k * 0.18; }
      else { const k = 1 - eo(dt / 0.34); const off = dir * k * 1100; if (D) cx += off; else cy += off; cb = Math.max(cb, k * 26); if (D) csx += k * 0.18; else csy += k * 0.18; }
      flash = Math.max(flash, 0.35 * Math.max(0, 1 - Math.abs(dt) / 0.18));
    } else if (typ === 'zoom') {
      if (dt < 0) { const k = ei((dt + 0.3) / 0.3); cs *= 1 + k * 1.6; cb = Math.max(cb, k * 30); }
      else { const k = 1 - eo(dt / 0.42); cs *= 1 - k * 0.38; cb = Math.max(cb, k * 24); }
      flash = Math.max(flash, 0.7 * Math.max(0, 1 - Math.abs(dt) / 0.2));
    } else if (typ === 'panels') {
      const cols = tr[1];
      tp.forEach((d, k) => { d.style.display = 'block'; d.style.background = cols[k];
        const a = dt + 0.36 - k * 0.06; // giriş
        let x;
        if (dt < 0.02) x = lerp(1180, -210, eo(a / 0.36));
        else x = lerp(-210, -1800, ei((dt - 0.02 - (2 - k) * 0.05) / 0.36));
        d.style.transform = `translateX(${x.toFixed(1)}px) skewX(-14deg)`; });
    } else if (typ === 'iris') {
      const [, x, y, col] = tr; tIris.style.display = 'block'; tIris.style.background = col;
      if (dt < 0) { const r = lerp(0, 2300, ei((dt + 0.32) / 0.32) ** 0.6); tIris.style.clipPath = `circle(${r.toFixed(0)}px at ${x}px ${y}px)`; tIris.style.webkitMaskImage = 'none'; }
      else { const r = lerp(0, 2300, eo(dt / 0.5)); tIris.style.clipPath = 'none';
        tIris.style.webkitMaskImage = `radial-gradient(circle at 540px 960px, transparent ${r.toFixed(0)}px, #000 ${(r + 2).toFixed(0)}px)`; }
    } else if (typ === 'shutter') {
      const col = tr[1];
      tSh.forEach((d, k) => { d.style.display = 'block'; d.style.background = col;
        const sgn = k === 0 ? -1 : 1; let y;
        if (dt < 0) y = sgn * 960 * (1 - eo((dt + 0.3) / 0.3)); else y = sgn * 960 * ei(dt / 0.34);
        d.style.top = (k === 0 ? 0 : 960) + 'px'; d.style.transform = `translateY(${y.toFixed(1)}px)`; });
    }
  }
  tFlash.style.opacity = flash.toFixed(3);
  return { cx, cy, cs, cb, csx, csy };
}

// ---------------------------------------------------------------- KADR
function overlay(t) {
  const cur = PLAN.planlar.find((p) => t >= p.s && t < p.e) ?? PLAN.planlar[PLAN.planlar.length - 1];
  for (const k in SC) SC[k].style.display = k === cur.ad ? 'block' : 'none';
  // kamera: hər səhnədə yavaş push-in + drift, üstəlik keçid
  const u = clamp((t - cur.s) / (cur.e - cur.s));
  const k = transitions(t);
  const push = 1 + 0.045 * io(u);
  const dx = Math.sin(t * 0.37) * 8, dy = Math.cos(t * 0.29) * 6;
  cam.style.transform = `translate(${(k.cx + dx).toFixed(1)}px,${(k.cy + dy).toFixed(1)}px) scale(${(push * k.cs * k.csx).toFixed(4)},${(push * k.cs * k.csy).toFixed(4)})`;
  cam.style.filter = k.cb > 0.4 ? `blur(${k.cb.toFixed(1)}px)` : 'none';
  const f = Math.floor(t * 24); grain.style.backgroundPosition = `${(hash(f) * 512) | 0}px ${(hash(f + 99) * 512) | 0}px`;

  const fn = DRAW[cur.ad]; if (fn) fn(t, cur);
}

const DRAW = {
  hook(t, p) {
    const c = S(1); const half = c.s + (c.e - c.s) * 0.52;
    set(hL, { y: -1920 * (1 - eo(t / 0.55)) }); set(hR, { y: 1920 * (1 - eo((t - 0.05) / 0.55)) });
    charsAnim(hW1, t, 0.35, 0.05); charsAnim(hW2, t, 0.5, 0.05);
    linesAnim(hD1, t, 0.75, p.e + 1); linesAnim(hD2, t, 0.85, p.e + 1);
    const v = sp(t, 1.0, 0.6); set(hVs, { o: clamp(v * 2), s: lerp(0.2, 1, v), r: lerp(-90, 0, v) + Math.sin(t * 2) * 3 });
    hFL.forEach((d, k) => { const a = 0.6 + k * 0.35; const q = eo((t - a) / 1.4); const x = lerp(-160, 80 + k * 140, q); const b = q < 0.98 ? walk(d, t, 1, k) : (still(d), 0);
      set(d, { x, y: b + 40, s: 1.75 }); });
    hFR.forEach((d, k) => { const th = t * 1.6 + k * Math.PI / 2; const z = (Math.sin(th) + 1) / 2; const b = walk(d, t, 0.9, k * 2);
      set(d, { x: Math.cos(th) * 160, y: Math.sin(th) * 60 + b + 40, s: lerp(1.1, 1.75, z), o: clamp((t - 0.9) / 0.4) * lerp(0.55, 1, z) }); d.style.zIndex = Math.round(z * 10); });
    const bq = eo((t - 1.7) / 0.6); set(hBand, { y: (1 - bq) * 520 });
    linesAnim(hQ, t, 1.9, p.e + 1, 0.12);
    // "daima geri qaytarmaq" deyiləndə sağ tərəf öndə
    const w = io((t - half) / 0.5); set(hW1, { o: 1 - w * 0.25 });
  },
  guc(t, p) {
    const c = S(2); const d = c.e - c.s;
    set(gOrb, { x: 200 + Math.sin(t * 0.8) * 160, y: 500 + Math.cos(t * 0.6) * 200 });
    linesAnim(gT, t, c.s + 0.02, p.e + 1, 0.11);
    const at = [0.56, 0.72, 0.87].map((f) => c.s + d * f - 0.12);
    gTags.forEach((el, k) => { const q = sp(t, at[k], 0.5); const shk = t > at[k] ? Math.sin((t - at[k]) * 40) * 10 * Math.exp(-(t - at[k]) * 7) : 0;
      set(el, { o: clamp(q * 3), s: lerp(2.3, 1, clamp(q)), r: +el.dataset.r + shk * 0.3, x: shk }); });
    gCrowd.forEach((el, k) => { const x = ((t - p.s) * 330 + k * 165) % 1500 - 200; const b = walk(el, t, 1.1, k);
      set(el, { x, y: b + (k % 2) * 30, s: 1 + (k % 3) * 0.08, o: clamp((t - p.s - 0.1) / 0.3) }); });
  },
  amma(t, p) {
    const c = S(3);
    set(amRule, { sy: eo((t - p.s) / 0.6) }); amRule.style.transformOrigin = 'top';
    charsAnim(amA, t, c.s - 0.05, 0.05);
    linesAnim(amB, t, c.s + 0.4, p.e + 1, 0.12);
    markAnim(amB, t, c.s + 1.05, 0.5);
  },
  stat(t, p) {
    const c = S(4); const d = c.e - c.s;
    linesAnim(stT, t, c.s - 0.05, p.e + 1, 0.12);
    const hb = 120 * eo((t - (c.s + 0.5)) / 0.7); const ha = 600 * eo((t - (c.s + d * 0.45)) / 1.1);
    stBB.style.top = (BASE - hb) + 'px'; stBB.style.height = hb + 'px'; set(stBB, { o: hb > 1 ? 1 : 0 });
    stBA.style.top = (BASE - ha) + 'px'; stBA.style.height = ha + 'px'; set(stBA, { o: ha > 1 ? 1 : 0 });
    stN2.style.top = (BASE - hb - 130) + 'px'; set(stN2, { o: clamp((hb - 60) / 40), y: 0 }); stN2.firstChild.style.color = '#fff4ea';
    const n = Math.max(1, Math.round(5 * clamp(ha / 600))); stN.firstChild.textContent = n + '×';
    stN.style.top = (BASE - ha - 210) + 'px'; set(stN, { o: clamp((ha - 40) / 60), s: 1 + 0.06 * Math.exp(-Math.max(0, t - (c.s + d * 0.45 + 1.1)) * 6) });
    set(stLA, { o: eo((t - c.s - 0.3) / 0.4), y: (1 - eo((t - c.s - 0.3) / 0.4)) * 30 }); set(stLB, { o: eo((t - c.s - 0.4) / 0.4), y: (1 - eo((t - c.s - 0.4) / 0.4)) * 30 });
    const uq = eo((t - (c.s + d * 0.45 + 1.0)) / 0.5); stUp.style.top = (BASE - 600 - 300) + 'px'; set(stUp, { o: uq, y: (1 - uq) * 20 });
    set(stSrc, { o: 0.9 * eo((t - c.s - 0.8) / 0.5) });
  },
  qayit(t, p) {
    const c = S(5); const d = c.e - c.s;
    linesAnim(qyT, t, p.s + 0.1, p.e + 1);
    const sw = [c.s + d * 0.28, c.s + d * 0.52, c.s + d * 0.76];
    qyW.forEach((el, k) => { const a = sw[k] - 0.15; const b = k < 2 ? sw[k + 1] - 0.15 : p.e + 2;
      const inn = eo((t - a) / 0.45), out = ei((t - b) / 0.3);
      set(el, { o: t >= a - 0.01 && t < b + 0.3 ? 1 : 0, y: (1 - inn) * 120 - out * 120, bl: (1 - inn) * 8 + out * 8 });
      el.style.clipPath = 'inset(0 -40px 0 -40px)'; markAnim(el, t, a + 0.25, 0.4); });
  },
  qapi(t, p) {
    const c = S(6); const d = c.e - c.s; const mid = c.s + d * 0.45;
    linesAnim(qpT1, t, p.s + 0.12, p.e + 1, 0.1);
    const g = eo((t - p.s - 0.2) / 0.6); set(qpGlow, { o: g, sy: lerp(0.2, 1, g) }); qpGlow.style.transformOrigin = 'bottom';
    const wq = clamp((t - (p.s + 0.4)) / 1.6); const x = lerp(60, 710, io(wq)); const inside = clamp((wq - 0.85) / 0.15);
    const b = wq < 1 ? walk(qpFig, t, 1, 0) : 0; set(qpFig, { x, y: 640 + b, s: lerp(1.9, 1.1, inside), o: 1 - inside });
    const bq = eo((t - mid) / 0.55); set(qpB, { y: (1 - bq) * 960 });
    linesAnim(qpT2, t, mid + 0.15, p.e + 1, 0.1); set(qpT2, { y: (1 - bq) * 960 });
    qpCols.forEach((el, k) => { const q = eo((t - (mid + 0.45 + k * 0.12)) / 0.5); set(el, { y: (1 - q) * 520, s: 1.25, o: clamp(q * 2) }); });
    const lift = eo((t - (mid + 1.0)) / 0.5); set(qpSlab, { y: (1 - bq) * 960 + 40 - lift * 40, o: bq });
  },
  bes(t, p) {
    const c = S(7);
    linesAnim(bsT1, t, c.s - 0.05, p.e + 1);
    charsAnim(bsT2, t, c.s + 0.4, 0.035, 'stamp');
    const l = sp(t, c.e - 0.35, 0.5); set(bsLogo, { o: clamp(l * 2), s: lerp(0.3, 1, l) });
  },
  mohur(t, p) {
    const c = S(8); const d = c.e - c.s; const hit = c.s + d * 0.62;
    linesAnim(mhT1, t, p.s + 0.15, p.e + 1);
    charsAnim(mhT2, t, c.s + d * 0.55, 0.05, 'stamp');
    const x = sp(t, p.s + 0.3, 0.5);
    set(mhDev, { o: clamp(x * 2), s: lerp(0.4, 1, x) * (1 + 0.1 * Math.exp(-Math.max(0, t - hit) * 8) * (t > hit ? 1 : 0)) });
    mhRings.forEach((r, k) => { const u = clamp((t - hit - k * 0.18) / 0.9); set(r, { o: u > 0 && u < 1 ? 1 - u : 0, s: 1 + u * 1.8 }); });
    const pl = sp(t, hit + 0.1, 0.5); set(mhPlus, { o: clamp(pl * 2), s: lerp(0.4, 1, pl), y: (1 - pl) * 40 - clamp(t - hit) * 30 });
  },
  hediyye(t, p) {
    const c = S(9); const u = clamp((t - p.s) / (p.e - p.s));
    set(hdBg, { x: lerp(0, -60, u), s: 1.05 + u * 0.05 });
    linesAnim(hdT, t, p.s + 0.12, p.e + 1, 0.12);
    const h = eo((t - p.s - 0.05) / 0.7); set(hdHero, { y: (1 - h) * 500 + Math.sin(t * 1.3) * 8, r: lerp(7, -1.5, h), s: lerp(0.9, 1, h) });
    const a = eo((t - p.s - 0.35) / 0.8); set(hdP1, { x: lerp(-400, -40, a) - u * 30, y: 60, r: -9, s: 0.92, o: a, bl: 2 });
    set(hdP2, { x: lerp(1100, 760, a) + u * 30, y: 40, r: 9, s: 0.92, o: a, bl: 2 });
  },
  panel(t, p) {
    const c = S(10);
    linesAnim(pnT, t, p.s + 0.12, p.e + 1, 0.12);
    const x = sp(t, p.s + 0.25, 0.65); set(pnList, { x: (1 - x) * 600, r: lerp(10, 2, x), s: 0.95 });
    ROWS.forEach((_, k) => { const r = document.getElementById('lr' + k); const q = sp(t, p.s + 0.4 + k * 0.14, 0.5);
      r.style.opacity = clamp(q * 1.5); r.style.transform = `translateX(${((1 - q) * 220).toFixed(1)}px)`;
      if (k >= 2) { const pul = 0.5 + 0.5 * Math.sin((t - p.s) * 7); r.style.background = t > p.s + 1.5 ? `rgba(253,227,211,${(0.55 + 0.45 * pul).toFixed(2)})` : '#f6efe6'; } });
  },
  cta(t, p) {
    const c = S(11); const d = c.e - c.s;
    set(ctM1, { x: -((t - p.s) * 160) % 900 }); set(ctM2, { x: -900 + ((t - p.s) * 160) % 900 });
    linesAnim(ctT, t, p.s + 0.1, PLAN.sure + 2, 0.14);
    const q = sp(t, p.s + 0.45, 0.6); set(ctC, { o: clamp(q * 2), y: (1 - q) * 160, s: lerp(0.9, 1, q) });
    const word = 'kart'; const n = clamp(Math.floor((t - (c.s + d * 0.7)) / 0.12) + 1, 0, 4);
    document.getElementById('ctx').textContent = word.slice(0, n);
    document.getElementById('ccr').style.opacity = Math.floor(t * 3) % 2 || n < 4 ? 1 : 0;
    const bq = eo((t - (c.s + d * 0.5)) / 0.5); set(ctB, { o: bq, y: (1 - bq) * 40 });
  },
};

// ---------------------------------------------------------------- 2D
const YER = 1900;
const sahib = (o = {}) => kofeshop({ boy: 1.0, onlukLogo: 'Y', onluk: '#c2410c', ...o });
const musteri = (o = {}) => insan({ ten: '#e2ae8a', sacRenk: '#2a1a10', sac: 'qadin', geyim: 'pencek', ust: '#2f5a6b', ic: '#f3ece2', alt: '#33303a', ayak: '#4a2e22', boy: 0.93, ...o });
const dost = (o = {}) => insan({ ten: '#d9a07a', sacRenk: '#3b2416', sac: 'modern', geyim: 'pencek', ust: '#7a3b2e', ic: '#efe6da', alt: '#2c2f38', ayak: '#3a2a20', boy: 1.0, ...o });
const K = (fn, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy }; };
const qar = (m, op) => { m.on.appendChild(duzb(-600, -600, 2400, 3200, 0, { fill: '#1c1714', opacity: op })); };
const kafe = (ctx, isiq) => ctx.mekan('kafe', { isiq });
const pist = (m, x = 540, w = 900) => m.on.appendChild(pistaxta(m.P, { x, y: 1920 - 40, w, h: 300, renk: '#6b3f22', ust: '#efe4d4', kassa: true }));
const duz = (ctx) => { const m = ctx.mekan('ofis', { isiq: 'tund' }); qar(m, 1);
  return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); }, kamera: () => ({ x: 0, y: 0, z: 1 }) }; };

yonet2d(PLAN, {
  hook: duz, guc: duz, amma: duz, stat: duz, qapi: duz, bes: duz, hediyye: duz, cta: duz,
  // 2D 1/3 — sahibkar daimi müştərini tanıyır, dostu da gəlir
  qayit(ctx) {
    const m = kafe(ctx, 'axsam'); const a = sahib(); const b = musteri(); const f = dost();
    m.on.appendChild(a.g); pist(m, 760, 560); m.on.appendChild(b.g); m.on.appendChild(f.g); qar(m, 0.18);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const c = S(5); const d = c.e - c.s; const fr = c.s + d * 0.7;
        a.ifade({ gulus: 0.9, qas: 0.3, baxis: [-0.7, 0.1] });
        a.poz({ x: 800, y: YER - 20, kolL: [10, 150], kolR: [lerp(12, 120, io((tt - c.s - 0.3) / 0.4)), 30], elR: 'acik', basDon: -0.4, nefes: Math.sin(tl * 2), t: tl });
        b.ifade({ gulus: 0.8, baxis: [0.7, 0] });
        b.poz({ x: 470, y: YER - 10, kolL: [8, 12], kolR: [10, 14], basDon: 0.4, nefes: Math.sin(tl * 2 + 1), t: tl });
        const fq = clamp((tt - fr) / 1.1); f.ifade({ gulus: 0.6, baxis: [0.8, 0] });
        f.yeri(tl, { x: lerp(-160, 250, io(fq)), y: YER - 25, hiz: fq < 1 ? 2.2 : 0, cevir: 1 }); },
      kamera: K((tl) => ({ x: lerp(30, -20, clamp(tl / 4)), y: 0, z: lerp(1.18, 1.08, eo(tl / 1.2)) }), 260) };
  },
  // 2D 2/3 — kassada möhür
  mohur(ctx) {
    const m = kafe(ctx, 'gunduz'); const b = musteri(); m.on.appendChild(b.g); qar(m, 0.22);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const c = S(8); const hit = c.s + (c.e - c.s) * 0.62;
        const r = io((tt - (hit - 0.9)) / 0.7);
        b.ifade({ gulus: lerp(0.4, 0.9, clamp((tt - hit) / 0.4)), baxis: [0.6, 0.2] });
        b.poz({ x: 400, y: YER - 10, kolL: [8, 12], elL: 'acik', kolR: [lerp(14, 72, r), lerp(140, 40, r)], elR: ['tutma', 'telefon'], basDon: 0.4, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 30, clamp(tl / 4)), y: 0, z: lerp(1.3, 1.08, eo(tl / 0.8)) }), 300) };
  },
  // 2D 3/3 — sahibkar panelə baxır
  panel(ctx) {
    const m = kafe(ctx, 'gunduz'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.45);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); a.ifade({ gulus: 0.75, qas: 0.4, baxis: [0.6, 0.3] });
        a.poz({ x: 240, y: YER - 20, kolL: [8, 12], kolR: [14, 145], elR: ['tutma', 'telefon'], basDon: 0.4, basEg: 0.05, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-40, 10, clamp(tl / 3.5)), y: 0, z: lerp(1.22, 1.06, eo(tl / 1.0)) }), 360) };
  },
}, { arxa: '#1c1714' });
