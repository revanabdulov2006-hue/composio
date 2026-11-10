// YG 2026-11-10b — "Bu 3 səbəbdən müştərilər heç vaxt qayıtmır". 2D personaj (insan.js) + YENƏGƏL motion qatı (krem/terracotta, Fraunces).
import { clamp, lerp, easeInOut, easeOut, spring, duzb } from './kit/kadr.js';
import { insan } from './kit/insan.js';
import { kofeshop } from './kit/komanda.js';
import { pistaxta, lovhe } from './kit/mekan.js';
import { yonet2d } from './kit/yonet2d.js';
import { PLAN } from './veri.js';

const YER = 1900;
const sahib = (o = {}) => kofeshop({ boy: 1.0, onlukLogo: 'Y', onluk: '#c2410c', ...o });
const musteri = (o = {}) => insan({ ten: '#e2ae8a', sacRenk: '#2a1a10', sac: 'qadin', geyim: 'pencek', ust: '#2f5a6b', ic: '#f3ece2',
  alt: '#33303a', ayak: '#4a2e22', boy: 0.93, ...o });
const S = (i) => PLAN.planlar.flatMap((p) => p.cumleler)[i - 1];
const planBy = (ad) => PLAN.planlar.find((p) => p.ad === ad);

PLAN.yazi.baslik = null; PLAN.yazi.hud = []; PLAN.yazi.alt = [];
PLAN.yazi.gecisler = PLAN.planlar.slice(1).filter((p) => p.gecis === 'kesme').map((p) => ({ tip: 'flash', s: p.s + 0.02 }));
const punch = (tl, z0 = 1.22, z1 = 1.04, d = 0.45) => lerp(z0, z1, easeOut(clamp(tl / d)));

const css = document.createElement('style');
css.textContent = `
.ab-flash{background:rgba(250,245,239,.45)!important}
#ov{position:absolute;inset:0;pointer-events:none}
#ov .o{position:absolute;opacity:0;will-change:transform,opacity,filter}
#bgm{position:absolute;inset:0;background:radial-gradient(120% 70% at 50% 38%,#2b2621 0%,#1c1714 70%);opacity:0}
#bgm .grid{position:absolute;inset:-200px;background-image:linear-gradient(rgba(250,245,239,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(250,245,239,.04) 1px,transparent 1px);background-size:72px 72px}
#bgm .orb{position:absolute;border-radius:50%;filter:blur(120px)}
#bgc{position:absolute;inset:0;background:#faf5ef;opacity:0}
#bgt{position:absolute;inset:0;background:radial-gradient(110% 70% at 50% 45%,#f08a4f 0%,#e8703a 45%,#c2410c 100%);opacity:0}
.pay{left:50px;right:50px;text-align:center;font-family:Fraunces;font-weight:300;color:#faf5ef;letter-spacing:-.025em;line-height:1.0;font-variation-settings:"opsz" 144;text-shadow:0 6px 30px rgba(0,0,0,.45)}
.pay b{font-weight:900}
.pay i{font-style:italic;font-weight:900;color:#ff8a4c}
.pay.ink{color:#1c1917;text-shadow:none}.pay.ink i{color:#c2410c}
.pay .w{display:inline-block;margin:0 .09em}
.num{width:150px;height:150px;border-radius:50%;background:#e8703a;color:#fff7ee;font-family:Fraunces;font-weight:900;font-size:84px;display:grid;place-items:center;box-shadow:0 18px 50px rgba(194,65,12,.55);letter-spacing:-.03em}
.chip{display:inline-flex;align-items:center;gap:18px;padding:22px 36px;border-radius:999px;background:#fffdfa;color:#1c1917;font-family:Jakarta;font-weight:800;font-size:42px;box-shadow:0 18px 44px rgba(0,0,0,.35);white-space:nowrap}
.chip .ic{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#e8703a;color:#fff;font-size:32px;flex:none}
.chip.red{background:#3b1a0b;color:#ffd9c4}.chip.red .ic{background:#d8402f}
.qm{width:110px;height:110px;border-radius:50%;background:#fffdfa;color:#c2410c;font-family:Fraunces;font-weight:900;font-size:80px;display:grid;place-items:center;box-shadow:0 12px 30px rgba(0,0,0,.35)}
.gh{width:600px;height:150px;border-radius:36px;background:rgba(255,253,250,.95);display:flex;align-items:center;gap:26px;padding:0 34px;box-sizing:border-box;box-shadow:0 20px 50px rgba(0,0,0,.4);font-family:Jakarta;font-weight:800;font-size:40px;color:#1c1917}
.gh .av{width:92px;height:92px;border-radius:50%;background:#d9cfc4;display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:56px;color:#847c70;flex:none}
.gh .sb{font-weight:600;font-size:30px;color:#847c70;margin-top:4px}
.cup{width:250px;height:250px;border-radius:50%;background:#fffdfa;display:grid;place-items:center;box-shadow:0 20px 60px rgba(0,0,0,.45);position:relative}
.cup .n{position:absolute;right:-16px;top:-16px;width:96px;height:96px;border-radius:50%;background:#e8703a;color:#fff;font-family:Fraunces;font-weight:900;font-size:50px;display:grid;place-items:center}
.eq{font-family:Fraunces;font-weight:900;font-size:180px;color:#e8703a;line-height:1}
.ph{width:900px;border-radius:44px;overflow:hidden;box-shadow:0 50px 110px rgba(0,0,0,.6)}
.ph img{display:block;width:100%}
.stampDev{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ff9a5e,#e8703a 55%,#c2410c);border:10px solid #3b1a0b;display:grid;place-items:center;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.ring{width:150px;height:150px;border-radius:50%;border:8px solid #ffb877}
.list{width:700px;border-radius:44px;background:#fffdfa;padding:34px 30px 26px;box-sizing:border-box;box-shadow:0 40px 90px rgba(0,0,0,.5);font-family:Jakarta;color:#1c1917}
.list .hd{display:flex;align-items:center;gap:18px;font-family:Fraunces;font-weight:900;font-size:50px;margin:0 6px 22px}
.list .hd img{width:72px;height:72px}
.list .r{display:flex;align-items:center;gap:20px;height:116px;border-radius:28px;background:#f6efe6;margin-bottom:14px;padding:0 24px;font-weight:800;font-size:36px}
.list .r .av{width:70px;height:70px;border-radius:50%;background:#e8703a;color:#fff;display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:38px;flex:none}
.list .r .d{margin-left:auto;font-weight:700;font-size:28px;padding:10px 18px;border-radius:999px;white-space:nowrap}
.list .r .ok{background:#e3f1df;color:#2f6b2a}.list .r .wr{background:#fde3d3;color:#b23a12}
.list .r.warn{background:#fff1e8}
.list .nm{text-align:right;font-weight:600;font-size:22px;color:#a8a097;letter-spacing:.12em;margin-top:6px}
.big30{font-family:Fraunces;font-weight:900;color:#fff7ee;font-size:520px;line-height:.85;letter-spacing:-.05em;text-align:center;left:0;right:0;text-shadow:0 30px 80px rgba(59,26,11,.45)}
.coin{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ffe2a8,#f2b24a 60%,#c98a1f);border:8px solid #8a5a12;display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:58px;color:#6b430c}
.stamp{border:14px solid #e8703a;border-radius:40px;padding:4px 54px;color:#ff8a4c;font-family:Fraunces;font-weight:900;font-size:190px;letter-spacing:.02em;transform:rotate(-5deg);background:rgba(28,23,20,.55)}
.brand{display:flex;align-items:center;gap:24px;color:#faf5ef;font-family:Jakarta;font-weight:800;font-size:54px}
.brand img{width:130px;height:130px}
`;
document.head.appendChild(css);
const root = document.getElementById('root');
const ov = document.createElement('div'); ov.id = 'ov'; root.insertBefore(ov, document.getElementById('beyaz'));
const bgm = document.createElement('div'); bgm.id = 'bgm';
bgm.innerHTML = '<div class="grid"></div><div class="orb" style="width:900px;height:900px;left:90px;top:420px;background:#c2410c;opacity:.30"></div><div class="orb" style="width:600px;height:600px;left:600px;top:1300px;background:#d97706;opacity:.12"></div>';
ov.appendChild(bgm);
const bgc = document.createElement('div'); bgc.id = 'bgc'; ov.appendChild(bgc);
const bgt = document.createElement('div'); bgt.id = 'bgt'; ov.appendChild(bgt);
const O = (html, x, y, extra = '') => { const d = document.createElement('div'); d.className = 'o ' + extra; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; ov.appendChild(d); return d; };
const centerX = (d) => { d.style.left = '0px'; d.style.right = '0px'; d.dataset.flex = 1; d.style.justifyContent = 'center'; };
const W_ = (s) => s.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');
const CHK = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CUPSVG = (c = '#c2410c') => `<svg width="130" height="130" viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 24h34v14a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z"/><path d="M46 28h4a6 6 0 0 1 0 12h-5"/><path d="M22 8c-2 3 2 5 0 9M30 8c-2 3 2 5 0 9M38 8c-2 3 2 5 0 9"/></svg>`;

// ---- elementlər
// hook
const hT = O(`<div style="font-size:118px">${W_('Bu')} <span class="w"><i style="font-size:180px;line-height:.8">3</i></span> ${W_('səbəbdən')}<br>${W_('müştərilər')}<br><b>${W_('heç vaxt')}</b><br><span class="w"><i>qayıtmır.</i></span></div>`, 0, 250, 'pay');
// bir
const n1 = O('<div class="num">01</div>', 465, 210);
const b1 = O(`<div style="font-size:96px">${W_('Səni yox,')}<br><span class="w"><i>yaxın</i></span> ${W_('olanı seçib.')}</div>`, 0, 400, 'pay');
const b2 = O(`<div style="font-size:96px">${W_('Yeni kafe açılır —')}<br><span class="w"><i>ora</i></span> ${W_('keçir.')}</div>`, 0, 400, 'pay');
const yk = O('<div class="chip"><span class="ic">✦</span>Yeni kafe açıldı</div>', 520, 760);
// iki
const n2 = O('<div class="num">02</div>', 465, 210);
const i1 = O(`<div style="font-size:100px">${W_('Sən onları')}<br><span class="w"><i>tanımırsan.</i></span></div>`, 0, 400, 'pay');
const i2 = O(`<div style="font-size:92px">${W_('İtdiyini də')}<br><span class="w"><i>görmürsən.</i></span></div>`, 0, 400, 'pay');
const ghosts = [0, 1, 2].map((k) => O(`<div class="gh"><div class="av">?</div><div>Müştəri<div class="sb">Son gəliş: ?</div></div></div>`, 240, 690 + k * 175));
const qms = [[170, 820, -8], [820, 760, 10], [760, 1080, -6]].map(([x, y, r]) => { const d = O('<div class="qm">?</div>', x, y); d.dataset.r = r; return d; });
// uc
const n3 = O('<div class="num">03</div>', 465, 250);
const u1 = O(`<div style="font-size:100px">${W_('Onuncu gəliş')}<br>${W_('= birinci')} <span class="w"><i>gəliş.</i></span></div>`, 0, 450, 'pay');
const u2 = O(`<div style="font-size:100px">${W_('Getmək ona')}<br><span class="w"><i>heç nə</i></span> ${W_('itirtmir.')}</div>`, 0, 450, 'pay');
const cupA = O(`<div class="cup">${CUPSVG()}<div class="n">1</div></div>`, 150, 900);
const eq = O('<div class="eq">=</div>', 490, 950);
const cupB = O(`<div class="cup">${CUPSVG()}<div class="n">10</div></div>`, 680, 900);
const zero = O('<div class="chip red"><span class="ic">0</span>itirəcəyi heç nə yoxdur</div>', 0, 1320);
// kecid
const kLogo = O('<img src="logo.png" style="width:300px;height:300px">', 390, 520);
const kT = O(`<div style="font-size:108px">${W_('Biz bunu')}<br><span class="w"><i>sadə</i></span> ${W_('bir yolla')}<br>${W_('həll etdik.')}</div>`, 0, 900, 'pay ink');
// toxun
const tT = O(`<div style="font-size:92px">${W_('Telefonu kassada')}<br><span class="w"><i>möhürə</i></span> ${W_('toxundurur.')}</div>`, 0, 230, 'pay');
const dev = O('<div class="stampDev"><img src="logo.png" style="width:90px;height:90px;filter:brightness(0) invert(1)"></div>', 640, 1030);
const rings = [0, 1, 2].map(() => O('<div class="ring"></div>', 640, 1030));
const plus = O('<div class="chip"><span class="ic">+1</span>möhür</div>', 560, 860);
// kart
const kpT = O(`<div style="font-size:84px">${W_('Hər gəliş')} <span class="w"><i>kartda</i></span> ${W_('yığılır.')}</div>`, 0, 150, 'pay');
const kpT2 = O(`<div style="font-size:88px">${W_('İndi getsə,')}<br><span class="w"><i>yığdığını</i></span> ${W_('itirər.')}</div>`, 0, 130, 'pay');
const ph = O('<div class="ph"><img src="card.jpg"></div>', 90, 360);
const gift = O('<div class="chip"><span class="ic">🎁</span>Hədiyyəyə 1 möhür qaldı</div>', 0, 1640);
const lose = O('<div class="chip red"><span class="ic">−7</span>möhür itər</div>', 0, 1640);
// panel
const pT = O(`<div style="font-size:92px">${W_('Kim gəlir,')}<br><span class="w"><i>kim itib</i></span> ${W_('— görürsən.')}</div>`, 0, 200, 'pay');
const ROWS = [['A', 'Aysel', 'bu gün', 'ok'], ['M', 'Murad', 'dünən', 'ok'], ['L', 'Leyla', '3 həftədir yox', 'wr'], ['E', 'Elvin', '5 həftədir yox', 'wr']];
const list = O(`<div class="list"><div class="hd"><img src="logo.png">Müştərilərin</div>${ROWS.map(([a, n, d, c], k) => `<div class="r${c === 'wr' ? ' warn' : ''}" id="lr${k}"><div class="av">${a}</div>${n}<span class="d ${c}">${d}</span></div>`).join('')}<div class="nm">NÜMUNƏ</div></div>`, 330, 640);
// qiymet
const qT = O(`<div style="font-size:96px;color:#fff7ee">${W_('Bütün bunlar')}<br>${W_('gündə cəmi')}</div>`, 0, 300, 'pay');
const q30 = O('<div>30</div>', 0, 640, 'big30');
const qQ = O(`<div style="font-size:120px;color:#fff7ee"><span class="w"><b>qəpik</b></span></div>`, 0, 1140, 'pay');
const coins = [[120, 1430, -12], [830, 1380, 14], [470, 1560, 0]].map(([x, y, r]) => { const d = O('<div class="coin">₼</div>', x, y); d.dataset.r = r; return d; });
// cta
const cT = O(`<div style="font-size:96px">${W_('Biznesin üçün')}<br>${W_('istəyirsənsə, şərhlərə')}</div>`, 0, 230, 'pay');
const cS = O('<div class="stamp">YENƏ</div>', 0, 560);
const cY = O(`<div style="font-size:110px"><span class="w"><b>yaz.</b></span></div>`, 0, 860, 'pay');
const cB = O('<div class="brand"><img src="logo.png">yenegel.app</div>', 0, 1600);
[yk, zero, gift, lose, cS, cB].forEach(centerX); yk.style.left = 'auto'; yk.style.right = '0'; delete yk.dataset.flex;
yk.style.left = '470px'; yk.style.right = 'auto';

const show = (d, a, { y = 0, x = 0, s = 1, bl = 0, r = 0 } = {}) => { d.style.opacity = clamp(a).toFixed(3); d.style.display = a > 0.002 ? (d.dataset.flex ? 'flex' : 'block') : 'none';
  d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`; d.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none'; };
const pop = (t, a, d = 0.5) => spring(clamp((t - a) / d), { sonum: 0.45, tezlik: 10 });
const win = (t, a, b, fi = 0.18, fo = 0.18) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
const words = (box, t, a, step, w = 1) => box.querySelectorAll('.w').forEach((d, k) => { const u = easeOut(clamp((t - (a + k * step)) / 0.3)); d.style.opacity = u * w; d.style.transform = `translateY(${(1 - u) * 40}px)`; d.style.filter = u > 0.99 ? 'none' : `blur(${(1 - u) * 10}px)`; });
const txt = (box, t, a, b, step = 0.07) => { show(box, win(t, a - 0.05, b, 0.05, 0.2)); words(box, t, a, step); };

function overlay(t) {
  // fonlar
  const bgOn = (ads) => Math.max(...ads.map((a) => { const p = planBy(a); return win(t, p.s, p.e, 0.12, 0.12); }));
  bgm.style.opacity = bgOn(['uc', 'kartim']).toFixed(3);
  bgc.style.opacity = bgOn(['kecid']).toFixed(3);
  bgt.style.opacity = bgOn(['qiymet']).toFixed(3);
  { const p = planBy('hook'); txt(hT, t, 0.1, p.e, 0.11);
    const i3 = hT.querySelector('i'); i3.style.display = 'inline-block'; i3.style.transform = `scale(${lerp(1.6, 1, easeOut(clamp((t - 0.2) / 0.45)))})`; }
  { const p = planBy('bir'); const c2 = S(2), c3 = S(3); const w = win(t, p.s, p.e);
    const x = pop(t, p.s + 0.05, 0.5); show(n1, w * clamp(x * 2), { s: lerp(0.3, 1, x) });
    txt(b1, t, c2.s + 0.6, c3.s - 0.05); txt(b2, t, c3.s, p.e);
    const yy = pop(t, c3.s + 0.15, 0.5); show(yk, w * clamp(yy * 2), { s: lerp(0.4, 1, yy), r: lerp(-10, 3, yy) }); }
  { const p = planBy('iki'); const c4 = S(4), c5 = S(5); const w = win(t, p.s, p.e);
    const x = pop(t, p.s + 0.05, 0.5); show(n2, w * clamp(x * 2), { s: lerp(0.3, 1, x) });
    txt(i1, t, c4.s + 0.45, c5.s + (c5.e - c5.s) * 0.55); txt(i2, t, c5.s + (c5.e - c5.s) * 0.58, p.e);
    qms.forEach((d, k) => { const u = pop(t, c4.s + 0.8 + k * 0.2, 0.45); show(d, w * clamp(u * 2) * (1 - clamp((t - c5.s - 0.2) / 0.3)), { s: lerp(0.2, 1, u), r: +d.dataset.r + Math.sin(t * 3 + k) * 6, y: Math.sin(t * 2.4 + k) * 10 }); });
    ghosts.forEach((d, k) => { const u = pop(t, c5.s + 0.1 + k * 0.22, 0.5); const fade = clamp((t - (c5.s + (c5.e - c5.s) * 0.55 + k * 0.25)) / 0.6);
      show(d, w * clamp(u * 2) * (1 - fade * 0.88), { x: (1 - u) * 300 + fade * 60, s: lerp(0.8, 1, u), bl: fade * 6 }); }); }
  { const p = planBy('uc'); const c6 = S(6), c7 = S(7); const w = win(t, p.s, p.e);
    const x = pop(t, p.s + 0.05, 0.5); show(n3, w * clamp(x * 2), { s: lerp(0.3, 1, x) });
    txt(u1, t, c6.s + 0.15, c7.s - 0.05); txt(u2, t, c7.s, p.e);
    const a = pop(t, c6.s + 0.4, 0.5), b = pop(t, c6.s + 1.1, 0.5), e = pop(t, c6.s + 0.8, 0.4);
    const dim = 1 - 0.5 * clamp((t - c7.s) / 0.4);
    show(cupA, w * clamp(a * 2) * dim, { s: lerp(0.3, 1, a) }); show(cupB, w * clamp(b * 2) * dim, { s: lerp(0.3, 1, b) }); show(eq, w * clamp(e * 2) * dim, { s: lerp(0.3, 1, e) });
    const z = pop(t, c7.s + 0.4, 0.5); show(zero, w * clamp(z * 2), { s: lerp(0.5, 1, z), y: (1 - z) * 50 }); }
  { const p = planBy('kecid'); const w = win(t, p.s, p.e, 0.15, 0.15); const c = S(8);
    const x = pop(t, p.s + 0.1, 0.6); show(kLogo, w * clamp(x * 2), { s: lerp(0.3, 1, x), r: lerp(-30, 0, x) });
    txt(kT, t, c.s + 0.05, p.e, 0.09); }
  { const p = planBy('toxun'); const c = S(9); const d = c.e - c.s; const w = win(t, p.s, p.e);
    txt(tT, t, c.s + 0.05, p.e, 0.08);
    const x = pop(t, c.s + 0.4, 0.5); const hit = c.s + d * 0.58;
    const mv = easeInOut(clamp((t - (hit - 0.7)) / 0.7)) * (1 - easeInOut(clamp((t - hit - 0.25) / 0.6)) * 0.6);
    show(dev, w * clamp(x * 2), { s: lerp(0.4, 1, x) * (1 + 0.08 * Math.exp(-Math.max(0, t - hit) * 8) * (t > hit ? 1 : 0)), });
    rings.forEach((r, k) => { const u = clamp((t - hit - k * 0.18) / 0.9); show(r, w * (u > 0 && u < 1 ? (1 - u) : 0), { s: 1 + u * 1.6 }); });
    const pl = pop(t, hit + 0.1, 0.5); show(plus, w * clamp(pl * 2), { s: lerp(0.4, 1, pl), y: (1 - pl) * 40 - clamp(t - hit) * 30 }); }
  { const p = planBy('kartim'); const c10 = S(10), c11 = S(11); const w = win(t, p.s, p.e);
    txt(kpT, t, c10.s + 0.02, c11.s - 0.05, 0.07); txt(kpT2, t, c11.s, p.e, 0.07);
    const x = pop(t, p.s + 0.05, 0.6); const shake = t > c11.s ? Math.sin((t - c11.s) * 30) * 6 * Math.exp(-(t - c11.s) * 3) : 0;
    show(ph, w * clamp(x * 2), { y: (1 - x) * 300 + Math.sin(t * 1.4) * 8, s: lerp(0.85, 0.96, x) + (t - p.s) * 0.01, r: lerp(6, -1, x) + shake * 0.3 });
    const g = pop(t, c10.s + 0.9, 0.5); show(gift, w * clamp(g * 2) * (1 - clamp((t - c11.s) / 0.15)), { s: lerp(0.4, 1, g) });
    const l = pop(t, c11.s + 0.35, 0.45); show(lose, w * clamp(l * 2), { s: lerp(0.4, 1, l), x: shake }); }
  { const p = planBy('panel'); const c = S(12); const d = c.e - c.s; const w = win(t, p.s, p.e);
    txt(pT, t, c.s + 0.02, p.e, 0.08);
    const x = pop(t, p.s + 0.1, 0.6); show(list, w * clamp(x * 2), { x: (1 - x) * 500, s: 0.95, r: lerp(8, 2, x), y: 0 });
    ROWS.forEach((_, k) => { const r = document.getElementById('lr' + k); const u = pop(t, p.s + 0.2 + k * 0.17, 0.45); r.style.opacity = clamp(u * 1.5); r.style.transform = `translateX(${(1 - u) * 200}px)`; }); }
  { const p = planBy('qiymet'); const c = S(13); const w = win(t, p.s, p.e, 0.12, 0.15);
    txt(qT, t, c.s - 0.05, p.e, 0.08);
    const x = pop(t, c.s + 0.25, 0.6); show(q30, w * clamp(x * 2), { s: lerp(0.5, 1, x) });
    const cnt = Math.round(30 * easeOut(clamp((t - c.s - 0.2) / 0.8))); q30.firstChild.textContent = String(cnt);
    txt(qQ, t, c.s + 0.7, p.e);
    coins.forEach((d, k) => { const u = pop(t, c.s + 0.5 + k * 0.15, 0.5); show(d, w * clamp(u * 2), { s: lerp(0.3, 1, u), r: +d.dataset.r + Math.sin(t * 2 + k) * 8, y: (1 - u) * 200 + Math.sin(t * 2.2 + k) * 12 }); }); }
  { const p = planBy('cta'); const c = S(14); const w = win(t, p.s, PLAN.sure + 1, 0.15, 0.01);
    txt(cT, t, c.s + 0.02, PLAN.sure + 1, 0.08);
    const sx = clamp((t - (c.s + 0.9)) / 0.3); const sc = sx < 1 ? lerp(2.3, 1, easeOut(sx)) : 1 + 0.05 * Math.exp(-(t - c.s - 1.2) * 9) * Math.cos((t - c.s - 1.2) * 30);
    show(cS, w * clamp(sx * 3), { s: sc });
    txt(cY, t, c.s + 1.5, PLAN.sure + 1);
    const lg = easeOut(clamp((t - (c.s + 1.8)) / 0.4)); show(cB, w * lg, { y: (1 - lg) * 30 }); }
}
let DEVX = 230, DEVY = 60;

const K = (fn, z = 1.12, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy, z: k.z * z }; };
const qar = (m, op, fill = '#1c1714') => { m.on.appendChild(duzb(-600, -600, 2400, 3200, 0, { fill, opacity: op })); };
const kafe = (ctx, isiq, o = {}) => { const m = ctx.mekan('kafe', { isiq });
    return m; };
const pist = (m) => m.on.appendChild(pistaxta(m.P, { x: 540, y: 1920 - 40, w: 900, h: 300, renk: '#6b3f22', ust: '#efe4d4', kassa: true }));
const sade = (kam) => (ctx) => { const m = ctx.mekan('ofis', { isiq: 'tund' }); qar(m, 1);
  return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); }, kamera: kam }; };

yonet2d(PLAN, {
  hook(ctx) {
    const m = kafe(ctx, 'axsam'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.5);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: -0.45, qas: 0.6, egim: -0.4, baxis: [0.7, 0.1] });
        a.poz({ x: 540, y: YER - 20, kolL: [10, 150], kolR: [12, 150], elL: 'acik', elR: 'acik', basDon: 0.45, basEg: 0.08, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-40, 30, easeOut(clamp(tl / 3))), y: 0, z: lerp(1.35, 1.15, easeOut(clamp(tl / 2.5))) }), 1.0, 100) };
  },
  bir(ctx) {
    const m = ctx.mekan('kuce', { isiq: 'axsam' });
    m.uzaq.appendChild(lovhe(m.P, { x: 760, y: 1000, metin: 'YENİ KAFE', w: 330, renk: '#d97706' }));
    const b = musteri(); m.on.appendChild(b.g); qar(m, 0.35);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const c3 = S(3); const go = clamp((tt - c3.s) / (seg.e - c3.s));
        const x = lerp(260, 560, clamp(tl / (c3.s - seg.s))) + go * 520;
        b.ifade({ gulus: 0.35, baxis: [0.8, 0] });
        b.yeri(tl, { x, y: YER - 40, hiz: 2.2, cevir: 1 }); },
      kamera: K((tl) => ({ x: lerp(-20, 60, clamp(tl / 6)), y: 0, z: 1.12 }), 1.0, 120) };
  },
  iki(ctx) {
    const m = kafe(ctx, 'gunduz'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.55);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const look = Math.sin(tl * 1.8);
        a.ifade({ gulus: -0.3, qas: 0.8, egim: -0.5, baxis: [look * 0.7, -0.2] });
        a.poz({ x: 540, y: YER - 20, kolL: [40, 60], elL: 'acik', kolR: [35, 70], elR: 'acik', basDon: look * 0.4, basEg: 0.06, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: Math.sin(tl * 0.7) * 30, y: 0, z: punch(tl, 1.3, 1.15) }), 1.0, 180) };
  },
  uc: sade((tl) => ({ x: 0, y: 0, z: 1 })),
  kecid: sade((tl) => ({ x: 0, y: 0, z: 1 })),
  toxun(ctx) {
    const m = kafe(ctx, 'gunduz', { lovhe: 'KAFE' }); const b = musteri(); m.on.appendChild(b.g); qar(m, 0.25);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const c = S(9); const hit = c.s + (c.e - c.s) * 0.58;
        const r = easeInOut(clamp((tt - (hit - 1.0)) / 0.7));
        b.ifade({ gulus: lerp(0.4, 0.85, clamp((tt - hit) / 0.4)), baxis: [0.6, 0.2] });
        b.poz({ x: 400, y: YER - 10, kolL: [8, 12], elL: 'acik', kolR: [lerp(14, 72, r), lerp(140, 40, r)], elR: ['tutma', 'telefon'], basDon: 0.4, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-20, 30, clamp(tl / 5)), y: 0, z: punch(tl, 1.25, 1.08) }), 1.0, 300) };
  },
  kartim: sade((tl) => ({ x: 0, y: 0, z: 1 })),
  panel(ctx) {
    const m = kafe(ctx, 'gunduz'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.5);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: 0.8, qas: 0.3, baxis: [0.6, 0.3] });
        a.poz({ x: 250, y: YER - 20, kolL: [8, 12], kolR: [14, 145], elR: ['tutma', 'telefon'], basDon: 0.4, basEg: 0.05, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 20, clamp(tl / 4)), y: 0, z: punch(tl, 1.2, 1.06) }), 1.0, 360) };
  },
  qiymet: sade((tl) => ({ x: 0, y: 0, z: 1 })),
  cta(ctx) {
    const m = kafe(ctx, 'gunduz'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.75);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); a.ifade({ gulus: 0.85, qas: 0.3 });
        a.poz({ x: 540, y: YER - 20, kolL: [8, 12], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: 0, y: 0, z: punch(tl, 1.2, 1.05) }), 1.0, 220) };
  },
}, { arxa: '#1c1714' });
