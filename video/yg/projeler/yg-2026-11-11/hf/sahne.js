// YG 2026-11-11 — "Müştərin tətbiq yükləməyəcək" (şəbəkə). Vizual standart: video/README §1. 2D yalnız 2 səhnədə (kims, mohur).
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

// ---------------------------------------------------------------- əlavə CSS
const css2 = document.createElement('style');
css2.textContent = `
.tile{position:absolute;width:92px;height:92px;border-radius:24px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.18),0 8px 18px rgba(0,0,0,.35)}
.scr{position:absolute;left:14px;top:14px;right:14px;bottom:14px;border-radius:46px;overflow:hidden;background:#11171a}
.frm{width:640px;border-radius:40px;background:#fffdfa;padding:40px 40px 34px;box-sizing:border-box;box-shadow:0 40px 90px rgba(59,26,11,.35);font-family:Jakarta;color:#1c1917}
.frm .h{font-family:Jakarta;font-weight:800;font-size:46px;margin-bottom:26px}
.frm .f{height:92px;border-radius:22px;background:#f1ebe3;margin-bottom:18px;display:flex;align-items:center;padding:0 28px;font-weight:600;font-size:32px;color:#9c9388}
.frm .b{height:96px;border-radius:999px;background:#1c1714;color:#fff4ea;display:grid;place-items:center;font-weight:800;font-size:34px;margin-top:8px}
.kraft{width:640px;height:400px;border-radius:30px;background:linear-gradient(160deg,#d8b98f,#c49c6c);box-shadow:0 40px 90px rgba(59,26,11,.35);padding:40px;box-sizing:border-box}
.kraft .h{font-family:Fraunces;font-weight:900;font-size:52px;color:#3b1a0b;margin-bottom:26px}
.kraft .dots{display:grid;grid-template-columns:repeat(5,86px);gap:22px}
.kraft .dots i{width:86px;height:86px;border-radius:50%;border:5px dashed rgba(59,26,11,.45);box-sizing:border-box;display:block}
.dl{width:760px;height:190px;border-radius:44px;background:#fffdfa;display:flex;align-items:center;gap:28px;padding:0 32px;box-sizing:border-box;box-shadow:0 40px 100px rgba(0,0,0,.55)}
.dl .ic{width:126px;height:126px;border-radius:32px;background:linear-gradient(145deg,#8fa3ad,#5b6b73);flex:none;display:grid;place-items:center;font-family:Archivo;font-weight:800;font-size:64px;color:#fff}
.dl .nm{font-family:Jakarta;font-weight:800;font-size:44px;color:#1c1917;flex:1}
.dl .nm small{display:block;font-weight:600;font-size:28px;color:#9c9388;margin-top:4px}
.dl .btn{position:relative;width:200px;height:84px;border-radius:999px;background:#e8e1d8;overflow:hidden;display:grid;place-items:center;font-family:Jakarta;font-weight:800;font-size:34px;color:#1c1917}
.dl .btn b{position:absolute;left:0;top:0;bottom:0;background:#5b6b73;width:0}
.dl .btn span{position:relative}
.strike{position:absolute;height:16px;border-radius:8px;background:#e8703a;transform-origin:left center;box-shadow:0 6px 20px rgba(0,0,0,.35)}
.clock{width:150px;height:150px;border-radius:50%;background:#fffdfa;box-shadow:0 20px 50px rgba(0,0,0,.45);position:relative}
.clock i{position:absolute;left:72px;bottom:75px;width:6px;border-radius:3px;background:#1c1714;transform-origin:50% 100%}
.qrc{width:520px;height:520px;border-radius:48px;background:#fffdfa;box-shadow:0 40px 100px rgba(59,26,11,.35);display:grid;place-items:center}
.qrc img{width:420px;height:420px}
.vf{position:absolute;width:90px;height:90px;border:12px solid #e8703a;box-sizing:border-box}
.node{position:absolute;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;background:#fffdfa;display:grid;place-items:center;box-shadow:0 18px 40px rgba(0,0,0,.45);font-family:Archivo;font-weight:800;font-size:58px;color:#1c1714}
.nl{position:absolute;transform:translateX(-50%);font-family:Jakarta;font-weight:700;font-size:30px;color:#f4ece1;white-space:nowrap}
.lst{width:640px;border-radius:44px;background:#fffdfa;padding:34px 28px 24px;box-sizing:border-box;box-shadow:0 40px 90px rgba(0,0,0,.4);font-family:Jakarta;color:#1c1917}
.lst .hd{font-family:Jakarta;font-weight:800;font-size:42px;margin:0 8px 24px}
.lst .r{display:flex;align-items:center;gap:20px;height:128px;border-radius:30px;background:#f6efe6;margin-bottom:14px;padding:0 22px;font-weight:800;font-size:36px}
.lst .r .av{width:80px;height:80px;border-radius:24px;display:grid;place-items:center;font-family:Archivo;font-size:40px;color:#fff;flex:none}
.lst .r .d{margin-left:auto;font-weight:700;font-size:26px;padding:10px 18px;border-radius:999px;white-space:nowrap;background:#fde3d3;color:#b23a12}
.lst .r .d.ok{background:#e3f1df;color:#2f6b2a}
.strip{position:absolute;top:0;width:360px;height:1920px;overflow:hidden}
.vw{position:absolute;left:50%;top:50%;font-family:Archivo;font-weight:800;font-size:200px;letter-spacing:-.02em;text-transform:uppercase;white-space:nowrap;transform-origin:0 0}
`;
document.head.appendChild(css2);
const P_ = (ad) => PLAN.planlar.find((p) => p.ad === ad);

// ---------------------------------------------------------------- SƏHNƏLƏR
const C = { ink: '#1c1714', cream: '#f4ece1', paper: '#efe5d7', terra: '#e8703a', rust: '#c2410c', sand: '#d9b99a', slate: '#5b6b73', coal: '#3a302b', glow: '#ff8a4c', navy: '#121a20' };

// 1. HOOK — tünd isti, yükləmə kartı kəsilir
const hk = scene('hook', 'radial-gradient(120% 80% at 30% 20%,#3a1a0c 0%,#120d0b 65%)');
const hOrb = put(hk, '<div style="width:820px;height:820px;border-radius:50%;background:#e8703a;filter:blur(190px);opacity:.38"></div>', 0, 0);
const hT1 = put(hk, `<div class="ser" style="font-size:84px;color:#f4ece1;text-align:center">${LM([{ h: 'Müştərin sənin' }, { h: '<i style="color:#ff8a4c">kafen üçün</i>' }])}</div>`, 0, 210, 'ctr');
const hB1 = put(hk, `<div class="gro" style="font-size:190px;color:#fff4ea;text-align:center">${CH('TƏTBİQ')}</div>`, 0, 470, 'ctr');
const hB2 = put(hk, `<div class="gro" style="font-size:98px;color:${C.terra};text-align:center">${CH('YÜKLƏMƏYƏCƏK')}</div>`, 0, 660, 'ctr');
const hDl = put(hk, `<div class="dl"><div class="ic">K</div><div class="nm">Kafe tətbiqi<small>Yüklə və qeydiyyatdan keç</small></div><div class="btn"><b id="hpb"></b><span id="hbt">YÜKLƏ</span></div></div>`, 160, 1010);
const hSt = put(hk, '<div class="strike" style="width:820px"></div>', 130, 1095);
const hFig = [C.cream, C.sand, C.terra, '#8a6a55', C.slate].map((c) => fig(hk, c, -200, 1380, 1));

// 2. DOLU — soyuq boz, telefon tətbiqlərlə dolur
const dl = scene('dolu', 'radial-gradient(110% 70% at 50% 60%,#33404a 0%,#151b20 75%)');
const dT = put(dl, `<div style="text-align:center">${LM([{ h: 'Telefonunda onsuz da', c: 'ser', st: 'font-size:72px;color:#e6edf0' }, { h: 'ONLARLA TƏTBİQ', c: 'gro', st: 'font-size:126px;color:#fff' }])}</div>`, 0, 160, 'ctr');
const dT2 = put(dl, `<div class="ser" style="font-size:96px;color:#e6edf0;text-align:center">${LM([{ h: 'vaxtı isə <i style="color:#ff8a4c">yoxdur</i>' }])}</div>`, 0, 210, 'ctr');
const dPh = put(dl, '<div class="ph" style="width:500px;height:960px;box-sizing:border-box"><div class="scr" id="dscr"></div></div>', 290, 520);
const TCOL = ['#8fa3ad', '#b7c3c9', '#5b6b73', '#a99a8c', '#6f8794', '#cfd6d9', '#7d8b74', '#9b8fa8'];
const dTiles = [];
{ const scr = document.getElementById('dscr');
  for (let k = 0; k < 28; k++) { const d = document.createElement('div'); d.className = 'tile'; d.style.background = TCOL[k % TCOL.length];
    const col = k % 4, row = Math.floor(k / 4); d.dataset.x = 26 + col * 110; d.dataset.y = 70 + row * 118; scr.appendChild(d); dTiles.push(d); } }
const dOver = Array.from({ length: 9 }, (_, k) => { const d = put(dl, '', 0, 0, 'tile', `background:${TCOL[(k * 3) % 8]}`); return d; });
const dClock = put(dl, '<div class="clock"><i id="dh1" style="height:44px"></i><i id="dh2" style="height:60px;width:4px;left:73px"></i></div>', 820, 480);

// 3. QEYD — krem kağız, formalar üst-üstə
const qd = scene('qeyd', `repeating-linear-gradient(0deg,transparent 0 118px,rgba(28,23,20,.07) 118px 120px),linear-gradient(170deg,#f6efe6,#e7dccb)`);
const qdRule = put(qd, '', 120, 0, '', 'width:3px;height:1920px;background:rgba(194,65,12,.25)');
const qdY = put(qd, `<div class="ser" style="font-size:100px;color:${C.ink}"><i>yeni</i></div>`, 170, 200);
const qdW = ['QEYDİYYAT', 'PAROL', 'KART'].map((w) => put(qd, `<div class="gro" style="font-size:150px;color:${C.rust};white-space:nowrap">${w}</div>`, 170, 320, '', 'clip-path:inset(0 -60px 0 -60px)'));
const qdF1 = put(qd, `<div class="frm"><div class="h">Qeydiyyat</div><div class="f">Ad, soyad</div><div class="f">Telefon nömrəsi</div><div class="b">Davam et</div></div>`, 220, 720);
const qdF2 = put(qd, `<div class="frm"><div class="h">Parol yarat</div><div class="f" style="letter-spacing:.3em;color:#1c1917">••••••••</div><div class="f">Parolu təkrarla</div><div class="b">Təsdiqlə</div></div>`, 220, 760);
const qdF3 = put(qd, `<div class="kraft"><div class="h">Möhür kartı</div><div class="dots">${'<i></i>'.repeat(10)}</div></div>`, 220, 900);

// 4. KİMSƏSİZ — 2D, müştəri gedir (fon 2D)
const km = scene('kims');
put(km, '', 0, 0, '', 'width:1080px;height:720px;background:linear-gradient(180deg,rgba(18,13,11,.92),rgba(18,13,11,.6) 65%,transparent)');
const kmT1 = put(km, `<div class="ser" style="font-size:84px;color:#f4ece1;text-align:center">${LM([{ h: 'Heç birinə <i style="color:#ff8a4c">qoşulmur</i>' }])}</div>`, 0, 180, 'ctr');
const kmT2 = put(km, `<div style="text-align:center">${LM([{ h: 'sənin bonusların da', c: 'ser', st: 'font-size:72px;color:#f4ece1' }, { h: 'KİMSƏSİZ QALIR', c: 'gro', st: 'font-size:108px;color:#fff4ea' }])}</div>`, 0, 170, 'ctr');
const kmCard = put(km, `<div class="kraft" style="width:520px;height:330px;padding:34px"><div class="h" style="font-size:44px">Bonus kartı</div><div class="dots" style="grid-template-columns:repeat(5,70px);gap:18px">${'<i style="width:70px;height:70px"></i>'.repeat(10)}</div></div>`, 470, 1000);

// 5. KÖRPÜ — tam terrakota
const kp = scene('kopru', 'radial-gradient(120% 80% at 40% 30%,#f39a62 0%,#e8703a 45%,#a83508 100%)');
const kpBig = put(kp, '<div class="mq" style="-webkit-text-stroke:3px rgba(255,244,234,.28)">BAŞQA CÜR · BAŞQA CÜR · BAŞQA CÜR ·</div>', 0, 1300);
const kpT = put(kp, `<div class="ser" style="font-size:132px;color:#fff4ea;line-height:1.02">${LM([{ h: 'Biz bunu' }, { h: '<span class="mk"><b style="background:#2a1209"></b><i style="color:#fff4ea">başqa cür</i></span>' }, { h: 'qurduq.' }])}</div>`, 110, 560);
const kpLogo = put(kp, '<div style="width:170px;height:170px;border-radius:50%;background:#1c1714;display:grid;place-items:center;box-shadow:0 24px 60px rgba(59,26,11,.5)"><img src="logo.png" style="width:110px;height:110px"></div>', 800, 380);

// 6. MÖHÜR — 2D kassa
const mh = scene('mohur');
put(mh, '', 0, 0, '', 'width:1080px;height:660px;background:linear-gradient(180deg,rgba(20,15,12,.9),rgba(20,15,12,.55) 65%,transparent)');
const mhT1 = put(mh, `<div class="ser" style="font-size:76px;color:#f4ece1;text-align:center">${LM([{ h: 'Kassada telefonunu' }])}</div>`, 0, 170, 'ctr');
const mhT2 = put(mh, `<div class="gro" style="font-size:118px;color:#fff4ea;text-align:center;line-height:.95">${CH('MÖHÜRƏ')}<br>${CH('TOXUNDURUR')}</div>`, 0, 280, 'ctr');
const mhDev = put(mh, '<div class="stampDev"><img src="logo.png" style="width:90px;height:90px;filter:brightness(0) invert(1)"></div>', 640, 1030);
const mhRings = [0, 1, 2].map(() => put(mh, '<div class="ring"></div>', 640, 1030));
const mhPlus = put(mh, '<div class="pill"><span class="n">+1</span>möhür</div>', 560, 860);

// 7. ƏLAVƏ — real foto fon + real ekran
const el7 = scene('elave', '#120e0c');
const elBg = put(el7, '<img src="card.jpg" style="width:1300px;height:1806px;object-fit:cover;filter:blur(30px) brightness(.5) saturate(1.25)">', -110, 57);
const elT = put(el7, `<div style="text-align:center">${LM([{ h: 'Kart telefonuna', c: 'ser', st: 'font-size:80px;color:#f4ece1' }, { h: '<i style="color:#ff8a4c">əlavə olunur</i>', c: 'ser', st: 'font-size:80px;color:#f4ece1' }])}</div>`, 0, 150, 'ctr');
const elPh = put(el7, '<div class="ph" style="width:470px"><img src="scr1.png"></div>', 305, 430);
const elNo = put(el7, `<div class="gro" style="font-size:96px;color:#fff4ea;text-align:center;text-shadow:0 10px 40px rgba(0,0,0,.6)">HEÇ NƏ <span style="color:#ff8a4c">YÜKLƏMƏDƏN</span></div>`, 0, 1330, 'ctr');
const elBtn = put(el7, '<div style="padding:22px 46px;border-radius:999px;background:#e8e1d8;font-family:Jakarta;font-weight:800;font-size:46px;color:#1c1917;box-shadow:0 24px 60px rgba(0,0,0,.5)">YÜKLƏ</div>', 700, 1040);
const elSt = put(el7, '<div class="strike" style="width:300px"></div>', 690, 1078);

// 8. QR — krem nöqtəli
const qr = scene('qr', 'radial-gradient(circle,rgba(28,23,20,.13) 2.5px,transparent 3px) 0 0/48px 48px,linear-gradient(180deg,#fbf6ee,#efe2cf)');
const qrT = put(qr, `<div style="text-align:center">${LM([{ h: 'İstəsə,', c: 'ser', st: `font-size:80px;color:${C.ink}` }, { h: 'QR KODLA DA', c: 'gro', st: `font-size:136px;color:${C.rust}` }])}</div>`, 0, 150, 'ctr');
const qrC = put(qr, '<div class="qrc"><img src="qr.svg"></div>', 280, 620);
const qrVF = [[0, 0, '0', '0'], [1, 0, 'r', '0'], [0, 1, '0', 'b'], [1, 1, 'r', 'b']].map(([i, j]) => {
  const d = put(qr, '', 0, 0, 'vf'); d.style.borderRight = i ? '' : 'none'; d.style.borderLeft = i ? 'none' : ''; d.style.borderBottom = j ? '' : 'none'; d.style.borderTop = j ? 'none' : ''; d.dataset.i = i; d.dataset.j = j; return d; });
const qrLas = put(qr, '', 300, 640, '', 'width:480px;height:8px;border-radius:4px;background:#e8703a;box-shadow:0 0 30px 8px rgba(232,112,58,.55)');
const qrB = put(qr, `<div class="ser" style="font-size:80px;color:${C.ink};text-align:center">${LM([{ h: '<i>qoşula bilər</i>' }])}</div>`, 0, 1270, 'ctr');

// 9. ŞƏBƏKƏ — tünd göy-qara, düyün qrafiki
const sb = scene('sebeke', 'radial-gradient(90% 60% at 50% 58%,#1d2a33 0%,#0b0f12 75%)');
const sbT = put(sb, `<div style="text-align:center">${LM([{ h: 'Ən maraqlısı isə', c: 'ser', st: 'font-size:76px;color:#e6edf0' }])}</div>`, 0, 170, 'ctr');
const sbW = put(sb, `<div class="gro" style="font-size:200px;color:${C.terra};text-align:center">${CH('ŞƏBƏKƏ')}</div>`, 0, 280, 'ctr');
const NC = [540, 1080];
const NODES = [['K', 'kafe', 230, 760], ['R', 'restoran', 850, 780], ['B', 'bərbər', 170, 1240], ['S', 'salon', 900, 1260], ['K', 'kafe', 540, 650], ['R', 'restoran', 540, 1490]];
const sbSvg = put(sb, `<svg width="1080" height="1920" viewBox="0 0 1080 1920">${NODES.map(([, , x, y], k) => `<line id="sl${k}" x1="${NC[0]}" y1="${NC[1]}" x2="${x}" y2="${y}" stroke="#ff8a4c" stroke-width="6" stroke-linecap="round" stroke-dasharray="900" stroke-dashoffset="900" opacity=".8"/>`).join('')}${NODES.map(([, , x, y], k) => `<line id="sm${k}" x1="${x}" y1="${y}" x2="${NODES[(k + 1) % NODES.length][2]}" y2="${NODES[(k + 1) % NODES.length][3]}" stroke="rgba(244,236,225,.22)" stroke-width="3" stroke-dasharray="900" stroke-dashoffset="900"/>`).join('')}</svg>`, 0, 0);
const sbN = NODES.map(([l, n, x, y]) => put(sb, `<div class="node">${l}</div><div class="nl" style="top:88px">${n}</div>`, x, y));
const sbC = put(sb, '<div style="width:220px;height:220px;margin:-110px 0 0 -110px;border-radius:50%;background:#e8703a;display:grid;place-items:center;box-shadow:0 0 90px 20px rgba(232,112,58,.45)"><img src="logo.png" style="width:140px;height:140px;filter:brightness(0) invert(1)"></div>', NC[0], NC[1]);
const sbFig = [0, 1, 2, 3].map((k) => fig(sb, [C.cream, C.sand, '#fff4ea', C.sand][k], 0, 0, 1));

// 10. GÖRÜR — kəhrəba gradient + siyahı UI, sonra krem "qeydiyyatsız"
const gr = scene('gorur', 'linear-gradient(160deg,#ffcf9e 0%,#f39a62 45%,#d95f25 100%)');
const grBlob = put(gr, '<div style="width:900px;height:900px;border-radius:50%;background:#fff4ea;filter:blur(160px);opacity:.45"></div>', 0, 0);
const grT = put(gr, `<div style="text-align:center">${LM([{ h: 'Başqa kafedə kartı olan müştəri', c: 'ser', st: 'font-size:60px;color:#2a1209' }, { h: 'SƏNİ DƏ GÖRÜR', c: 'gro', st: 'font-size:140px;color:#fff4ea' }])}</div>`, 0, 150, 'ctr');
const GROWS = [['K', 'Kafe', '#e8703a', 'Kartın var', 1], ['R', 'Restoran', '#5b6b73', 'Yeni', 0], ['B', 'Bərbər', '#3a302b', 'Yeni', 0], ['S', 'Sənin kafen', '#c2410c', 'Yeni', 0]];
const grL = put(gr, `<div class="lst"><div class="hd">Şəhərin ünvanları</div>${GROWS.map(([a, n, c, d, ok], k) => `<div class="r" id="gr${k}"><div class="av" style="background:${c}">${a}</div>${n}<span class="d ${ok ? 'ok' : ''}">${d}</span></div>`).join('')}</div>`, 220, 560);
const grIris = put(gr, '', 0, 0, '', 'width:1080px;height:1920px;background:linear-gradient(170deg,#f6efe6,#e7dccb)');
const grQ1 = put(gr, `<div class="ser" style="font-size:96px;color:${C.ink};text-align:center">${LM([{ h: '<i>yenidən</i>' }])}</div>`, 0, 660, 'ctr');
const grQ2 = put(gr, `<div class="gro" style="font-size:128px;color:${C.ink};white-space:nowrap">QEYDİYYAT<span class="ser" style="text-transform:none;font-size:150px;color:${C.rust}"><i id="grsiz">sız</i></span></div>`, 0, 800, 'ctr', 'text-align:center');
const grSt = put(gr, '<div class="strike" style="width:760px;height:18px"></div>', 60, 860);
const grPills = ['kafe', 'restoran', 'bərbər'].map((w, k) => put(gr, `<div class="pill"><img src="logo.png" style="width:52px;height:52px">${w}</div>`, [130, 400, 700][k], 1180 + (k % 2) * 120));

// 11. HAMISI — üç zolaq (split)
const hm = scene('hamisi', C.ink);
const HW = [['KAFE', '#e8703a', '#fff4ea'], ['RESTORAN', '#f4ece1', '#1c1714'], ['BƏRBƏR', '#3a302b', '#ffb877']];
const hmS = HW.map(([w, bg, fg], k) => put(hm, `<div class="vw" style="color:${fg};transform:rotate(-90deg) translate(-50%,-50%)">${w}</div>`, k * 360, 0, 'strip', `background:${bg}`));
const hmCard = put(hm, `<div style="width:820px;padding:56px 40px;border-radius:56px;background:#fffdfa;box-shadow:0 50px 120px rgba(0,0,0,.55);text-align:center"><img src="logo.png" style="width:150px;height:150px"><div class="ser" style="font-size:104px;color:${C.ink};margin-top:18px">hamısı <i style="color:${C.rust}">bir yerdə</i></div></div>`, 130, 720);

// 12. CTA — krem, terrakota marquee, şərh
const ct = scene('cta', 'radial-gradient(120% 80% at 50% 20%,#fffaf3 0%,#f4ece1 55%,#e7d6bf 100%)');
const ctM1 = put(ct, `<div class="mq" style="-webkit-text-stroke:3px rgba(232,112,58,.45)">KART · KART · KART · KART · KART ·</div>`, 0, 1080);
const ctM2 = put(ct, `<div class="mq" style="-webkit-text-stroke:3px rgba(232,112,58,.45)">KART · KART · KART · KART · KART ·</div>`, 0, 1400);
const ctT = put(ct, `<div style="text-align:center">${LM([{ h: 'Kafen üçün istəyirsənsə,', c: 'ser', st: `font-size:74px;color:${C.ink}` }, { h: 'ŞƏRHLƏRƏ YAZ', c: 'gro', st: `font-size:124px;color:${C.rust}` }])}</div>`, 0, 260, 'ctr');
const ctC = put(ct, `<div class="cmt"><div class="av"><img src="logo.png"></div><div class="tx"><span id="ctx"></span><span class="cr" id="ccr"></span></div><div class="go">Göndər</div></div>`, 90, 720);
const ctB = put(ct, `<div style="display:flex;align-items:center;gap:22px;justify-content:center"><img src="logo.png" style="width:110px;height:110px"><span class="ui" style="font-size:52px;color:#1c1714;font-weight:800">yenegel.app</span></div>`, 0, 1690, 'ctr');

// ---------------------------------------------------------------- KEÇİDLƏR
const TR = { dolu: ['whip', 1], qeyd: ['panels', [C.slate, C.terra, C.cream]], kims: ['iris', 540, 1150, C.ink], kopru: ['whipv', -1],
  mohur: ['zoom'], elave: ['shutter', C.terra], qr: ['panels', [C.ink, C.sand, C.cream]], sebeke: ['iris', 540, 880, C.navy],
  gorur: ['whip', -1], hamisi: ['zoom'], cta: ['whipv', 1] };
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
    const c = S(1); const d = c.e - c.s;
    set(hOrb, { x: 120 + Math.sin(t * 0.9) * 180, y: 300 + Math.cos(t * 0.7) * 160 });
    linesAnim(hT1, t, 0.05, p.e + 1, 0.1);
    charsAnim(hB1, t, 0.3, 0.045, 'stamp');
    charsAnim(hB2, t, 0.75, 0.035);
    const q = sp(t, 0.55, 0.6); set(hDl, { o: clamp(q * 2), y: (1 - q) * 300, r: lerp(6, 0, q) });
    // yükləmə başlayır, 1.75-də dayanır və üstündən xətt
    const pr = clamp((t - 1.05) / 0.9) * 0.42; document.getElementById('hpb').style.width = (pr * 100).toFixed(1) + '%';
    document.getElementById('hbt').textContent = t < 1.05 ? 'YÜKLƏ' : t < 2.0 ? Math.round(pr * 100) + '%' : 'LƏĞV';
    const s = io((t - 2.0) / 0.3); set(hSt, { sx: s, o: s > 0 ? 1 : 0, r: -4 });
    const fall = ei((t - 2.35) / 0.5); set(hDl, { o: clamp(q * 2) * (1 - fall * 0.5), y: (1 - q) * 300 + fall * 80, r: lerp(6, 0, q) - fall * 5 });
    hFig.forEach((el, k) => { const x = ((t + 0.3) * 260 + k * 190) % 1400 - 220; const b = walk(el, t, 1.1, k);
      set(el, { x, y: b + (k % 2) * 24, s: 1.3, o: clamp((t - 0.4) / 0.3) }); });
  },
  dolu(t, p) {
    const c = S(2); const d = c.e - c.s; const sw = c.s + d * 0.6;
    linesAnim(dT, t, p.s + 0.08, sw, 0.1);
    linesAnim(dT2, t, sw + 0.1, p.e + 1);
    const ph = eo((t - p.s) / 0.6); set(dPh, { y: (1 - ph) * 400, r: lerp(-8, -2, ph) + Math.sin(t * 1.2) * 0.8 });
    dTiles.forEach((el, k) => { const a = p.s + 0.25 + k * 0.045; const u = sp(t, a, 0.45);
      el.style.left = el.dataset.x + 'px'; el.style.top = el.dataset.y + 'px';
      el.style.transform = `translateY(${((1 - clamp(u)) * -700).toFixed(1)}px) scale(${lerp(0.6, 1, clamp(u)).toFixed(3)})`; el.style.opacity = u > 0.01 ? 1 : 0; });
    dOver.forEach((el, k) => { const a = p.s + 1.6 + k * 0.09; const u = clamp((t - a) / 0.9); const g = u * u;
      set(el, { x: 330 + ((k * 137) % 420), y: lerp(380, 1420 + (k % 3) * 70, g), r: k * 23 + u * 140, o: u > 0 ? 1 : 0, s: 1.15 }); });
    const ck = sp(t, sw, 0.5); set(dClock, { o: clamp(ck * 2), s: lerp(0.3, 1, ck) });
    document.getElementById('dh1').style.transform = `rotate(${(t * 220).toFixed(1)}deg)`; document.getElementById('dh2').style.transform = `rotate(${(t * 900).toFixed(1)}deg)`;
  },
  qeyd(t, p) {
    const c = S(3); const d = c.e - c.s;
    set(qdRule, { sy: eo((t - p.s) / 0.6) }); qdRule.style.transformOrigin = 'top';
    set(qdY, { o: eo((t - p.s - 0.1) / 0.4), x: (1 - eo((t - p.s - 0.1) / 0.4)) * -60 });
    const at = [c.s - 0.05, c.s + d * 0.42, c.s + d * 0.72];
    qdW.forEach((el, k) => { const a = at[k]; const b = k < 2 ? at[k + 1] : p.e + 2;
      const inn = eo((t - a) / 0.3), out = ei((t - (b - 0.18)) / 0.18);
      set(el, { o: t >= a - 0.01 && t < b ? inn * (1 - out) : 0, y: (1 - inn) * 120 - out * 120, bl: (1 - inn) * 6 + out * 6 }); });
    [qdF1, qdF2, qdF3].forEach((el, k) => { const a = at[k]; const u = sp(t, a, 0.5);
      const push = k < 2 ? eo((t - at[k + 1]) / 0.4) : 0;
      set(el, { o: clamp(u * 3), s: lerp(1.6, 1, clamp(u)) * (1 - push * 0.08), r: [-5, 4, -3][k] + (1 - clamp(u)) * 10, y: -push * 60 + k * 0 }); });
  },
  kims(t, p) {
    const c = S(4); const d = c.e - c.s; const sw = c.s + d * 0.42;
    linesAnim(kmT1, t, p.s + 0.12, sw, 0.1);
    linesAnim(kmT2, t, sw + 0.05, p.e + 1, 0.12);
    set(kmT2, { o: t > sw ? 1 : 0 });
    const q = sp(t, sw + 0.2, 0.6); const g = clamp((t - sw - 0.6) / 1.2);
    set(kmCard, { o: clamp(q * 2) * (1 - g * 0.25), y: (1 - q) * 300 + g * 30, r: lerp(12, 4, q) + g * 6 });
    kmCard.style.filter = `grayscale(${g.toFixed(2)}) brightness(${(1 - g * 0.35).toFixed(2)})`;
  },
  kopru(t, p) {
    const c = S(5);
    set(kpBig, { x: -((t - p.s) * 300) % 900 });
    linesAnim(kpT, t, c.s - 0.12, p.e + 1, 0.1);
    markAnim(kpT, t, c.s + 0.45, 0.4);
    const l = sp(t, c.s + 0.1, 0.6); set(kpLogo, { o: clamp(l * 2), s: lerp(0.3, 1, l), r: lerp(-120, 0, l) + (t - p.s) * 12 });
  },
  mohur(t, p) {
    const c = S(6); const d = c.e - c.s; const hit = c.s + d * 0.55;
    linesAnim(mhT1, t, p.s + 0.12, p.e + 1);
    charsAnim(mhT2, t, c.s + d * 0.35, 0.035, 'stamp');
    const x = sp(t, p.s + 0.3, 0.5);
    set(mhDev, { o: clamp(x * 2), s: lerp(0.4, 1, x) * (1 + 0.1 * Math.exp(-Math.max(0, t - hit) * 8) * (t > hit ? 1 : 0)) });
    mhRings.forEach((r, k) => { const u = clamp((t - hit - k * 0.18) / 0.9); set(r, { o: u > 0 && u < 1 ? 1 - u : 0, s: 1 + u * 1.8 }); });
    const pl = sp(t, hit + 0.1, 0.5); set(mhPlus, { o: clamp(pl * 2), s: lerp(0.4, 1, pl), y: (1 - pl) * 40 - clamp(t - hit) * 30 });
  },
  elave(t, p) {
    const c = S(7); const d = c.e - c.s; const u = clamp((t - p.s) / (p.e - p.s));
    set(elBg, { x: lerp(0, -70, u), s: 1.05 + u * 0.06 });
    linesAnim(elT, t, p.s + 0.12, p.e + 1, 0.12);
    const h = eo((t - p.s - 0.05) / 0.75); set(elPh, { y: (1 - h) * 700 + Math.sin(t * 1.3) * 8, r: lerp(9, -2, h), s: lerp(0.85, 1, h) });
    const b = sp(t, c.s + d * 0.45, 0.45); set(elBtn, { o: clamp(b * 2), s: lerp(0.4, 1, b), r: -6 });
    const s = io((t - (c.s + d * 0.62)) / 0.25); set(elSt, { sx: s, o: s > 0 ? 1 : 0, r: -6 });
    linesAnim(elNo, t, 99, 99); const n = eo((t - (c.s + d * 0.55)) / 0.45); set(elNo, { o: n, y: (1 - n) * 60, bl: (1 - n) * 10 });
  },
  qr(t, p) {
    const c = S(8); const d = c.e - c.s;
    linesAnim(qrT, t, p.s + 0.1, p.e + 1, 0.12);
    const q = sp(t, p.s + 0.2, 0.6); set(qrC, { o: clamp(q * 2), s: lerp(0.6, 1, q), r: lerp(-10, 0, q) });
    const v = eo((t - p.s - 0.55) / 0.5);
    qrVF.forEach((el) => { const i = +el.dataset.i, j = +el.dataset.j; const sp_ = lerp(120, 0, v) + Math.sin(t * 5) * 6;
      set(el, { x: 250 + i * 490 + (i ? sp_ : -sp_), y: 590 + j * 490 + (j ? sp_ : -sp_), o: v }); });
    const ls = (t - p.s - 0.6) / 1.1; set(qrLas, { y: (Math.abs(((ls % 2) + 2) % 2 - 1)) * 470 * -1 + 470, o: ls > 0 ? 1 : 0 });
    linesAnim(qrB, t, c.s + d * 0.6, p.e + 1);
  },
  sebeke(t, p) {
    const c = S(9);
    linesAnim(sbT, t, p.s + 0.08, p.e + 1);
    charsAnim(sbW, t, c.s + 0.35, 0.05, 'stamp');
    const cq = sp(t, p.s + 0.15, 0.55); set(sbC, { o: clamp(cq * 2), s: lerp(0.3, 1, cq) * (1 + 0.03 * Math.sin(t * 6)) });
    NODES.forEach((n, k) => { const a = p.s + 0.35 + k * 0.14; const lu = eo((t - a) / 0.45);
      document.getElementById('sl' + k).setAttribute('stroke-dashoffset', (900 * (1 - lu)).toFixed(0));
      document.getElementById('sm' + k).setAttribute('stroke-dashoffset', (900 * (1 - eo((t - a - 0.5) / 0.5))).toFixed(0));
      const nq = sp(t, a + 0.3, 0.5); set(sbN[k], { o: clamp(nq * 2), s: lerp(0.3, 1, nq) }); });
    sbFig.forEach((el, k) => { const n = NODES[k]; const u = ((t - p.s) * 0.55 + k * 0.27) % 1; const b = walk(el, t, 1.2, k);
      set(el, { x: lerp(NC[0], n[2], u) - 30, y: lerp(NC[1], n[3], u) - 120 + b, s: 0.75, o: clamp((t - p.s - 0.9) / 0.3) }); });
  },
  gorur(t, p) {
    const c = S(10); const d = c.e - c.s; const cut = c.s + d * 0.56;
    set(grBlob, { x: 100 + Math.sin(t * 0.8) * 200, y: 700 + Math.cos(t * 0.6) * 260 });
    linesAnim(grT, t, p.s + 0.1, cut, 0.12);
    const x = sp(t, p.s + 0.3, 0.65); set(grL, { y: (1 - x) * 700, r: lerp(8, -2, x), s: 0.98 + 0.03 * clamp((t - p.s) / 3) });
    GROWS.forEach((_, k) => { const r = document.getElementById('gr' + k); const q = sp(t, p.s + 0.55 + k * 0.16, 0.5);
      r.style.opacity = clamp(q * 1.5); r.style.transform = `translateX(${((1 - q) * 240).toFixed(1)}px)`;
      if (k === 3) r.style.boxShadow = t > p.s + 1.6 ? `0 0 0 ${(4 + 3 * Math.sin((t - p.s) * 7)).toFixed(1)}px #e8703a` : 'none'; });
    // daxili iris keçidi → krem "qeydiyyatsız"
    const ir = eo((t - cut + 0.1) / 0.45); grIris.style.clipPath = `circle(${(ir * 2300).toFixed(0)}px at 540px 1150px)`; set(grIris, { o: ir > 0 ? 1 : 0 });
    const ln = t > cut - 0.1; [grQ1, grQ2, grSt, ...grPills].forEach((e) => { e.style.display = ln ? 'block' : 'none'; });
    if (ln) {
      linesAnim(grQ1, t, cut + 0.1, p.e + 1);
      const q2 = eo((t - cut - 0.2) / 0.45); set(grQ2, { o: q2, y: (1 - q2) * 90 });
      const s = io((t - cut - 0.75) / 0.3); set(grSt, { sx: s, o: s > 0 ? 1 : 0, r: -2 });
      const z = sp(t, cut + 1.05, 0.5); document.getElementById('grsiz').style.cssText = `display:inline-block;transform:scale(${lerp(0, 1, clamp(z)) * (z > 1 ? z : 1)}) rotate(${lerp(-30, 0, clamp(z))}deg);transform-origin:20% 80%`;
      grPills.forEach((e, k) => { const u = sp(t, cut + 0.9 + k * 0.15, 0.5); set(e, { o: clamp(u * 2), y: (1 - u) * 160 + Math.sin(t * 2 + k) * 8, r: [-4, 3, -2][k] }); });
    }
  },
  hamisi(t, p) {
    const c = S(11); const d = c.e - c.s; const mg = c.s + d * 0.55;
    const at = [c.s - 0.15, c.s + d * 0.17, c.s + d * 0.36];
    const m = io((t - mg) / 0.5);
    hmS.forEach((el, k) => { const u = eo((t - at[k]) / 0.45); const dir = k % 2 ? 1 : -1;
      set(el, { y: dir * (1 - u) * 1920 + Math.sin(t * 1.5 + k) * 10, o: u > 0 ? 1 : 0, sx: 1 - m * 0.15, x: (540 - (k * 360 + 180)) * m * 0.15 });
      el.querySelector('.vw').style.marginTop = (dir * -(t - p.s) * 60).toFixed(1) + 'px'; });
    const q = sp(t, mg + 0.1, 0.6); set(hmCard, { o: clamp(q * 2), s: lerp(0.5, 1, q), r: lerp(-8, 0, q) });
  },
  cta(t, p) {
    const c = S(12); const d = c.e - c.s;
    set(ctM1, { x: -((t - p.s) * 160) % 900 }); set(ctM2, { x: -900 + ((t - p.s) * 160) % 900 });
    linesAnim(ctT, t, p.s + 0.1, PLAN.sure + 2, 0.14);
    const q = sp(t, p.s + 0.45, 0.6); set(ctC, { o: clamp(q * 2), y: (1 - q) * 160, s: lerp(0.9, 1, q) });
    const word = 'kart'; const n = clamp(Math.floor((t - (c.s + d * 0.72)) / 0.12) + 1, 0, 4);
    document.getElementById('ctx').textContent = word.slice(0, n);
    document.getElementById('ccr').style.opacity = Math.floor(t * 3) % 2 || n < 4 ? 1 : 0;
    const bq = eo((t - (c.s + d * 0.4)) / 0.5); set(ctB, { o: bq, y: (1 - bq) * 40 });
  },
};

// ---------------------------------------------------------------- 2D (yalnız 2 səhnə: kims, mohur)
const YER = 1900;
const sahib = (o = {}) => kofeshop({ boy: 1.0, onlukLogo: 'Y', onluk: '#c2410c', ...o });
const musteri = (o = {}) => insan({ ten: '#d9a07a', sacRenk: '#2a1a10', sac: 'modern', geyim: 'pencek', ust: '#2f5a6b', ic: '#f3ece2', alt: '#33303a', ayak: '#4a2e22', boy: 1.0, ...o });
const qadin = (o = {}) => insan({ ten: '#e2ae8a', sacRenk: '#2a1a10', sac: 'qadin', geyim: 'pencek', ust: '#7a3b2e', ic: '#f3ece2', alt: '#33303a', ayak: '#4a2e22', boy: 0.93, ...o });
const K = (fn, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy }; };
const qar = (m, op) => { m.on.appendChild(duzb(-600, -600, 2400, 3200, 0, { fill: '#1c1714', opacity: op })); };
const kafe = (ctx, isiq) => ctx.mekan('kafe', { isiq });
const pist = (m, x = 540, w = 900) => m.on.appendChild(pistaxta(m.P, { x, y: 1920 - 40, w, h: 300, renk: '#6b3f22', ust: '#efe4d4', kassa: true }));
const duz = (ctx) => { const m = ctx.mekan('ofis', { isiq: 'tund' }); qar(m, 1);
  return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); }, kamera: () => ({ x: 0, y: 0, z: 1 }) }; };

yonet2d(PLAN, {
  hook: duz, dolu: duz, qeyd: duz, kopru: duz, elave: duz, qr: duz, sebeke: duz, gorur: duz, hamisi: duz, cta: duz,
  // 2D 1/2 — müştəri kassaya baxır, başını bulayır və gedir
  kims(ctx) {
    const m = kafe(ctx, 'axsam'); const a = sahib(); const b = musteri();
    m.on.appendChild(a.g); pist(m, 800, 520); m.on.appendChild(b.g); qar(m, 0.2);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const c = S(4); const go = c.s + 0.9;
        a.ifade({ gulus: lerp(0.6, 0.0, clamp((tt - go) / 0.6)), qas: 0.4, baxis: [-0.7, 0.1] });
        a.poz({ x: 860, y: YER - 20, kolL: [10, 150], kolR: [lerp(12, 110, io((tt - c.s) / 0.4)), 40], elR: 'acik', basDon: -0.4, nefes: Math.sin(tl * 2), t: tl });
        b.ifade({ gulus: 0.1, qas: -0.3, baxis: [tt < go ? 0.7 : -0.7, 0] });
        if (tt < go) b.poz({ x: 560, y: YER - 10, kolL: [8, 12], kolR: [10, 14], basDon: Math.sin(tl * 6) * 0.5, nefes: Math.sin(tl * 2 + 1), t: tl });
        else { const w = clamp((tt - go) / 2.4); b.yeri(tl, { x: lerp(560, -260, io(w)), y: YER - 10, hiz: 2.2, cevir: -1 }); } },
      kamera: K((tl) => ({ x: lerp(30, -30, clamp(tl / 4)), y: 0, z: lerp(1.2, 1.08, eo(tl / 1.2)) }), 260) };
  },
  // 2D 2/2 — kassada telefonu möhürə toxundurur
  mohur(ctx) {
    const m = kafe(ctx, 'gunduz'); const b = qadin(); m.on.appendChild(b.g); qar(m, 0.22);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const c = S(6); const hit = c.s + (c.e - c.s) * 0.55;
        const r = io((tt - (hit - 0.9)) / 0.7);
        b.ifade({ gulus: lerp(0.4, 0.9, clamp((tt - hit) / 0.4)), baxis: [0.6, 0.2] });
        b.poz({ x: 400, y: YER - 10, kolL: [8, 12], elL: 'acik', kolR: [lerp(14, 72, r), lerp(140, 40, r)], elR: ['tutma', 'telefon'], basDon: 0.4, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 30, clamp(tl / 4)), y: 0, z: lerp(1.3, 1.08, eo(tl / 0.8)) }), 300) };
  },
}, { arxa: '#1c1714' });
