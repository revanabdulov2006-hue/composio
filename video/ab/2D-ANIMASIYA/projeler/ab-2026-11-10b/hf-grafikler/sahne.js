// AB 2026-11-10b — Xərclər/analiz: ay sonu pul hara getdi. 2D personajlar (insan.js) + sürətli motion keçidləri və DOM overlay-ları.
import { clamp, lerp, easeInOut, easeOut, spring, duzb } from './kit/kadr.js';
import { insan } from './kit/insan.js';
import { sahibkar } from './kit/komanda.js';
import { yonet2d } from './kit/yonet2d.js';
import { PLAN } from './veri.js';

const YER = 1900, YER2 = 1850;
const sahib = (o = {}) => sahibkar({ boy: 1.0, ...o });
const _musteri = (o = {}) => insan({ ten: '#e2ae8a', sacRenk: '#2a1a10', sac: 'qadin', geyim: 'pencek', ust: '#7a3346', ic: '#efe6dc',
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
.fak{width:420px;height:560px;background:#fbf8f1;border-radius:14px;box-shadow:0 30px 60px rgba(0,0,0,.5);padding:34px 36px;box-sizing:border-box;color:#2a1f19;font-family:'Geist';font-weight:600;position:relative}
.fak .h{font-family:'Archivo';font-weight:800;font-size:52px;letter-spacing:.04em;border-bottom:5px solid #2a1f19;padding-bottom:14px;margin-bottom:24px}
.fak .ln{height:18px;border-radius:9px;background:#d9d2c4;margin:22px 0}
.fak .ln.s{width:60%}
.tel .row .d.red{color:#b8483a}
.tel .row,.tel .row .d{white-space:nowrap}
.tel .row{gap:14px;padding:0 22px}.tel .row .d{font-size:25px}
`;
document.head.appendChild(css);
const ov = document.createElement('div'); ov.id = 'ov'; document.getElementById('root').insertBefore(ov, document.getElementById('beyaz'));
const O = (html, x, y, extra = '') => { const d = document.createElement('div'); d.className = 'o ' + extra; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; ov.appendChild(d); return d; };
const CHK = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const BELL = '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>';
const SUD = (dt) => `<div class="sud"><div class="tp"></div><div class="bd"><div class="bn">SÜD</div><div class="dt">${dt}</div></div></div>`;

// ---- əlavə stil
const css2 = document.createElement('style');
css2.textContent = `
.cash{width:120px;height:66px;border-radius:10px;background:linear-gradient(135deg,#9fe08f,#55B848);border:5px solid #1f4d2a;box-shadow:0 14px 30px rgba(0,0,0,.4);position:relative}
.cash:before{content:'';position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px;border-radius:50%;border:5px solid #1f4d2a}
.walt{width:340px;height:240px;position:relative;filter:drop-shadow(0 30px 50px rgba(0,0,0,.55))}
.walt .bk{position:absolute;left:0;right:0;bottom:0;height:200px;border-radius:30px;background:linear-gradient(180deg,#6b3f22,#4a2a16);border:7px solid #2a1709}
.walt .fl{position:absolute;right:-8px;top:96px;width:130px;height:84px;border-radius:22px;background:#7a4a29;border:7px solid #2a1709}
.walt .fl:after{content:'';position:absolute;right:20px;top:24px;width:26px;height:26px;border-radius:50%;background:#e0b04a}
.drw{width:720px;height:330px;border-radius:26px;background:linear-gradient(180deg,#3a3f44,#24282c);border:8px solid #111;box-shadow:0 40px 80px rgba(0,0,0,.6);display:flex;gap:14px;padding:26px;box-sizing:border-box}
.drw span{flex:1;border-radius:12px;background:#15181b;box-shadow:inset 0 8px 18px rgba(0,0,0,.7)}
.defter{width:560px;height:640px;border-radius:18px;background:#fbf8f1;box-shadow:0 30px 70px rgba(0,0,0,.55);padding:56px 50px 40px 90px;box-sizing:border-box;position:relative;font-family:'Geist';font-weight:600;color:#2a1f19}
.defter:before{content:'';position:absolute;left:60px;top:0;bottom:0;width:4px;background:#e2a49a}
.defter .r{height:74px;border-bottom:3px solid #c9d6e6;display:flex;align-items:flex-end;padding-bottom:8px;font-size:40px;gap:14px}
.defter .r .x{margin-left:auto;font-family:'Archivo';font-weight:800;color:#d8402f;font-size:48px}
.tel .lst{position:absolute;left:30px;right:30px;top:190px}
.ttl{position:absolute;left:0;right:0;top:150px;text-align:center;color:#fff;font-weight:800;font-size:44px}
.cal{width:340px;border-radius:34px;background:#fff;box-shadow:0 30px 60px rgba(0,0,0,.45);overflow:hidden;text-align:center;font-weight:800}
.cal .tp{background:#55B848;color:#fff;font-size:44px;padding:20px 0}
.cal .bd{font-size:150px;color:#123B24;padding:10px 0 24px;display:flex;align-items:center;justify-content:center;gap:10px}
.cal .ck{width:96px;height:96px;border-radius:50%;background:#55B848;display:grid;place-items:center}
`;
document.head.appendChild(css2);
const CHK2 = CHK.replace('width="30" height="30"', 'width="60" height="60"');

// hook: pul cüzdandan uçur
const hookWal = O('<div class="walt"><div class="bk"></div><div class="fl"></div></div>', 370, 1000);
const hookCash = [[-420, -200, -24], [-200, -330, 14], [200, -300, -8], [420, -180, 22], [-560, -60, 6], [560, -80, -16], [0, -360, 18]].map(([dx, dy, r]) => { const d = O('<div class="cash"></div>', 480, 1040); d.dataset.dx = dx; d.dataset.dy = dy; d.dataset.r = r; return d; });
// kassa: boş siyirmə
const drw = O('<div class="drw"><span></span><span></span><span></span><span></span></div>', 180, 300);
const kQ = O('<div class="qm" style="width:130px;height:130px;font-size:90px">?</div>', 800, 220);
// xerc: cüzdan mərkəzdə, xərclər hər tərəfə
const xWal = O('<div class="walt"><div class="bk"></div><div class="fl"></div></div>', 370, 840);
const xc = [['İcarə', -1, 470], ['İşıq', 1, 640], ['İşçi maaşı', -1, 1180], ['Xırda alışlar', 1, 1350]].map(([t, side, y]) => {
  const d = O(`<div class="chip red" style="font-size:52px;padding:24px 40px"><span class="ic" style="width:60px;height:60px;font-size:38px">−</span>${t}</div>`, side < 0 ? 90 : 0, y);
  if (side > 0) { d.style.left = 'auto'; d.style.right = '90px'; } d.dataset.side = side; return d; });
// defter
const defter = O(`<div class="defter">${[['İcarə', ''], ['Kommunal', ''], ['', '?'], ['Maaş', ''], ['', '?'], ['', '?']].map(([a, x]) => `<div class="r">${a}${x ? `<span class="x">${x}</span>` : ''}</div>`).join('')}</div>`, 260, 520);
// hiss
const msgH = O(`<div style="font-size:92px"><span class="w">Qazanc,</span> <span class="w">ya</span> <span class="w">ziyan?</span><br><span class="w">Yalnız</span><br><span class="w"><span class="mk r"><i></i>hisslə.</span></span></div>`, 0, 620, 'big');
// kecid (yumşaq körpü)
const msgK = O(`<div style="font-size:90px"><span class="w">Cavab</span><br><span class="w">təxminlə</span> <span class="w">yox,</span><br><span class="w"><span class="mk"><i></i>dəqiq</span></span> <span class="w g">olmalıdır.</span></div>`, 0, 640, 'big');
// hell — xərclər ekranı (nümunə)
const tel = O(`<div class="tel"><div class="ek">
  <div class="hd"><img src="ab-logo.png">Xərclər</div>
  <div class="lst">${['İcarə', 'Kommunal', 'İşçi ödənişi', 'Marketinq', 'Digər'].map((t, k) => `<div class="row" id="xr${k}" style="top:${k * 140}px;font-size:34px"><span class="dot"></span>${t}<span class="d">${CHK.replace('stroke="#fff"', 'stroke="#2c8a3a"')}</span></div>`).join('')}</div>
 </div></div>`, 520, 330);
// analiz
const tel2 = O(`<div class="tel"><div class="ek">
  <div class="hd"><img src="ab-logo.png">Analiz</div>
  <div class="tabs" style="top:170px"><span id="tb0">Gün</span><span id="tb1">Həftə</span><span id="tb2">Ay</span></div>
  <div class="bars" style="top:300px;height:520px">${[[0.62, 'Alınan'], [0.3, 'Ziyan'], [0.8, 'Ödəniş'], [0.5, 'Xərc']].map(([h, l], k) => `<div class="b${k == 1 ? '' : ' g'}" id="bar${k}" style="height:${h * 100}%"><div class="l" style="font-size:22px">${l}</div></div>`).join('')}</div>
 </div></div>`, 290, 300);
const an = [['Nə aldın', 120], ['Nə ziyan etdin', 0], ['Nə ödədin', 0]].map(([t], k) => O(`<div class="chip" style="font-size:42px"><span class="ic ok">${CHK}</span>${t}</div>`, 0, 1300 + k * 0));
// rahat
const cal = O('<div class="cal"><div class="tp">Bu gün</div><div class="bd"><div class="ck">' + CHK2 + '</div></div></div>', 640, 520);
// cta
const ctaQ = O('<div style="font-size:84px">Şərhlərə <span class="g">yaz</span></div>', 0, 520, 'big');
const stamp = O('<div class="stamp">SİSTEM</div>', 0, 700);
const ctaLogo = O('<div style="display:flex;align-items:center;gap:22px;color:#fff;font-weight:800;font-size:50px"><img src="ab-logo.png" style="width:120px;height:120px">asanbiznesim.com</div>', 0, 1010);
const show = (d, a, { y = 0, x = 0, s = 1, bl = 0, r = 0 } = {}) => { d.style.opacity = clamp(a).toFixed(3); d.style.display = a > 0.002 ? (d.dataset.flex ? 'flex' : 'block') : 'none';
  d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`; d.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none'; };
const pop = (t, a, d = 0.5) => spring(clamp((t - a) / d), { sonum: 0.45, tezlik: 10 });
const win = (t, a, b, fi = 0.18, fo = 0.18) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
const centerX = (d) => { d.style.left = '0px'; d.style.right = '0px'; d.dataset.flex = 1; d.style.justifyContent = 'center'; };
const planBy = (ad) => PLAN.planlar.find((p) => p.ad === ad);
const words = (box, c, step) => box.querySelectorAll('.w').forEach((d, k, all) => { const u = easeOut(clamp((t0 - (c.s - 0.05 + k * step)) / 0.32)); d.style.opacity = u; d.style.transform = `translateY(${(1 - u) * 40}px)`; d.style.filter = u > 0.99 ? 'none' : `blur(${(1 - u) * 10}px)`; });
let t0 = 0;

[stamp, ctaLogo, ...an].forEach(centerX);
function overlay(t) {
  t0 = t; const L = S;
  { const p = planBy('hook'); const w = win(t, p.s, p.e, 0.01); const x = pop(t, 0.05, 0.5);
    show(hookWal, w * clamp(x * 1.5), { s: lerp(0.5, 1, x), r: Math.sin(t * 6) * 3 });
    hookCash.forEach((d, k) => { const u = easeOut(clamp((t - 0.25 - k * 0.12) / 0.9));
      show(d, w * clamp(u * 4) * (1 - clamp((u - 0.85) / 0.15) * 0.3), { x: +d.dataset.dx * u, y: +d.dataset.dy * u, r: +d.dataset.r * u * 3, s: lerp(0.6, 1.15, u) }); }); }
  { const p = planBy('kassa'); const w = win(t, p.s, p.e); const c = L(2); const d = c.e - c.s;
    const x = pop(t, c.s + d * 0.25, 0.5); show(drw, w * clamp(x * 1.5), { y: (1 - x) * 160, s: lerp(0.85, 1, x) });
    const q = pop(t, c.s + d * 0.6, 0.5); show(kQ, w * clamp(q * 1.5), { s: lerp(0.3, 1, q), y: Math.sin(t * 3) * 10 }); }
  { const p = planBy('xerc'); const w = win(t, p.s, p.e); const c = L(3); const d = c.e - c.s;
    const x = pop(t, p.s + 0.05, 0.45); show(xWal, w * clamp(x * 1.5), { s: lerp(0.6, 1, x) * (1 + 0.04 * Math.sin(t * 9)) });
    xc.forEach((el, k) => { const u = pop(t, c.s + d * (0.02 + k * 0.17), 0.5); show(el, w * clamp(u * 1.6), { x: (1 - u) * -el.dataset.side * 380, s: lerp(0.5, 1, u), r: (1 - u) * 12 * el.dataset.side }); });
    const go = easeInOut(clamp((t - (c.s + d * 0.78)) / 0.5)); if (go > 0) xc.forEach((el, k) => { el.style.transform += ` translateX(${go * el.dataset.side * 700}px)`; el.style.opacity = (+el.style.opacity * (1 - go)).toFixed(3); }); }
  { const p = planBy('defter'); const w = win(t, p.s, p.e); const c = L(4); const d = c.e - c.s;
    const x = pop(t, p.s + 0.1, 0.55); show(defter, w * clamp(x * 1.5), { s: lerp(0.4, 0.82, x), r: lerp(-14, -3, x), y: -40 });
    defter.querySelectorAll('.r').forEach((r, k) => { const u = clamp((t - (c.s + d * (0.05 + k * 0.08))) / 0.25); r.style.opacity = u; });
    defter.querySelectorAll('.x').forEach((r, k) => { const u = pop(t, c.s + d * (0.5 + k * 0.1), 0.4); r.style.display = 'inline-block'; r.style.transform = `scale(${lerp(0, 1, u)})`; }); }
  { const p = planBy('hiss'); show(msgH, win(t, p.s, p.e, 0.15, 0.2)); const c = L(5); words(msgH, c, (c.e - c.s) * 0.11);
    msgH.querySelector('.mk i').style.transform = `scaleX(${easeOut(clamp((t - (c.s + (c.e - c.s) * 0.62)) / 0.35))})`; }
  { const p = planBy('kecid'); show(msgK, win(t, p.s, p.e, 0.25, 0.15)); const c = L(6); words(msgK, c, (c.e - c.s) * 0.12);
    msgK.querySelector('.mk i').style.transform = `scaleX(${easeOut(clamp((t - (c.s + (c.e - c.s) * 0.55)) / 0.35))})`; }
  { const p = planBy('hell'); const w = win(t, p.s, p.e, 0.2, 0.2); const x = pop(t, p.s + 0.25, 0.6);
    show(tel, w * clamp(x * 1.4), { x: (1 - x) * 420, r: lerp(10, 3, x) });
    const c = L(7); const d = c.e - c.s;
    [0, 1, 2, 3, 4].forEach((k) => { const r = document.getElementById('xr' + k); const u = pop(t, c.s + d * (0.22 + k * 0.13), 0.45);
      r.style.opacity = clamp(u * 1.5); r.style.transform = `translateX(${(1 - u) * 260}px)`; }); }
  { const p = planBy('analiz'); const w = win(t, p.s, p.e); const c = L(8); const d = c.e - c.s; const x = pop(t, p.s + 0.1, 0.6);
    show(tel2, w * clamp(x * 1.4), { y: (1 - x) * 300 - 60, s: lerp(0.8, 0.86, x) });
    const tab = t < c.s + d * 0.1 ? 0 : t < c.s + d * 0.2 ? 1 : 2; [0, 1, 2].forEach((k) => document.getElementById('tb' + k).classList.toggle('on', k === tab));
    const re = [c.s + d * 0.02, c.s + d * 0.12, c.s + d * 0.22]; const lastRe = re.filter((q) => t >= q).pop() ?? re[0];
    [0, 1, 2, 3].forEach((k) => { const b = document.getElementById('bar' + k); b.style.transform = `scaleY(${easeOut(clamp((t - (lastRe + k * 0.08)) / 0.45))})`; });
    an.forEach((el, k) => { const a = c.s + d * (0.3 + k * 0.17); const b = k < 2 ? c.s + d * (0.3 + (k + 1) * 0.17) : p.e; const u = pop(t, a, 0.45);
      show(el, w * clamp(u * 1.6) * (1 - clamp((t - b) / 0.12)), { s: lerp(0.5, 1, u), y: (1 - u) * 40 }); }); }
  { const p = planBy('rahat'); const w = win(t, p.s, p.e); const c = L(9); const d = c.e - c.s;
    const x = pop(t, c.s + d * 0.45, 0.55); show(cal, w * clamp(x * 1.5), { s: lerp(0.3, 1, x), r: lerp(-15, 4, x) }); }
  { const p = planBy('cta'); const w = win(t, p.s, PLAN.sure + 1, 0.18, 0.01); const c = L(10);
    const q1 = easeOut(clamp((t - p.s - 0.05) / 0.35)); show(ctaQ, w * q1, { y: (1 - q1) * 30 });
    const sx = clamp((t - (c.s + 0.55)) / 0.35); const sc = sx < 1 ? lerp(2.3, 1, easeOut(sx)) : 1 + 0.05 * Math.exp(-(t - c.s - 0.9) * 9) * Math.cos((t - c.s - 0.9) * 30);
    show(stamp, w * clamp(sx * 3), { s: sc });
    const lg = easeOut(clamp((t - (c.s + 1.3)) / 0.4)); show(ctaLogo, w * lg, { y: (1 - lg) * 30 }); }
}

const K = (fn, z = 1.12, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy, z: k.z * z }; };
const qaranlıq = (m, op) => { const sh = duzb(-600, -600, 2400, 3200, 0, { fill: '#08180F', opacity: op }); m.on.appendChild(sh); };
const sade = (mek, isiq, op, kam) => (ctx) => { const m = ctx.mekan(mek, { isiq, lovhe: false }); qaranlıq(m, op);
  return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); }, kamera: kam }; };

yonet2d(PLAN, {
  hook: sade('market', 'axsam', 0.55, (tl) => ({ x: lerp(-60, 40, easeOut(clamp(tl / 3))), y: 0, z: lerp(1.45, 1.2, easeOut(clamp(tl / 2.5))) })),
  kassa(ctx) {
    const m = ctx.mekan('market', { isiq: 'axsam', lovhe: false });
    const a = sahib(); m.on.insertBefore(a.g, m.on.firstChild);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const c = S(2); const sok = clamp((tt - (c.s + (c.e - c.s) * 0.5)) / 0.5);
        a.ifade({ gulus: lerp(0.3, -0.5, sok), qas: lerp(0.3, 0.8, sok), egim: -0.35 * sok, goz: lerp(1, 1.15, sok), baxis: [0, 0.4] });
        a.poz({ x: 540, y: YER2 + 120, kolL: [30 + 40 * sok, 120], kolR: [150 - 40 * sok, 120], elL: 'acik', elR: 'acik', basEg: 0.1 * sok, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: Math.sin(tl * 0.9) * 25, y: 0, z: punch(tl, 1.28, 1.06) }), 1.12, 300) };
  },
  xerc: sade('ofis', 'tund', 0.82, (tl) => ({ x: 0, y: 0, z: lerp(1.3, 1.12, clamp(tl / 5)) })),
  defter(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'axsam' }); qaranlıq(m, 0.35);
    const a = sahib(); m.on.appendChild(a.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        const look = Math.sin(tl * 2.2);
        a.ifade({ gulus: -0.35, qas: 0.7, egim: -0.4, baxis: [look * 0.6, 0.4] });
        a.poz({ x: 540, y: YER + 330, kolL: [12, 150], elL: ['tutma', 'bloknot'], kolR: [135 + Math.sin(tl * 3) * 8, 120], elR: ['tutma', 'qelem'], basDon: look * 0.3, basEg: 0.12, nefes: Math.sin(tl * 2.5), t: tl }); },
      kamera: K((tl) => ({ x: lerp(40, -30, clamp(tl / 4)), y: 0, z: punch(tl, 1.25, 1.04) })) };
  },
  hiss: sade('market', 'tund', 0.8, (tl) => ({ x: 0, y: 0, z: lerp(1.3, 1.15, clamp(tl / 3)) })),
  kecid: sade('ofis', 'gunduz', 0.7, (tl) => ({ x: lerp(-30, 30, clamp(tl / 3)), y: 0, z: lerp(1.2, 1.1, clamp(tl / 3)) })),
  hell(ctx) {
    const m = ctx.mekan('ofis', { isiq: 'gunduz' });
    const a = sahib(); m.on.appendChild(a.g);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: 0.75, qas: 0.35, baxis: [0.5, 0.2] });
        a.poz({ x: 300, y: YER, kolL: [6, 10], kolR: [12, 145], elR: ['tutma', 'telefon'], basDon: 0.35, basEg: 0.05, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 30, clamp(tl / 6)), y: 0, z: punch(tl, 1.18, 1.05, 0.6) })) };
  },
  analiz: sade('ofis', 'axsam', 0.55, (tl) => ({ x: lerp(-40, 40, clamp(tl / 6)), y: 0, z: lerp(1.25, 1.1, easeOut(clamp(tl / 2))) })),
  rahat(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: false });
    const a = sahib(); m.on.insertBefore(a.g, m.on.firstChild);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: 0.85, qas: 0.3, baxis: [0.4, 0] });
        a.poz({ x: 360, y: YER2 + 120, kolL: [6, 10], kolR: [40 + Math.sin(tl * 2) * 6, 140], elR: ['tutma', 'fincan'], basDon: 0.25, nefes: Math.sin(tl * 2), t: tl, danis: 0 }); },
      kamera: K((tl) => ({ x: lerp(30, -20, clamp(tl / 4)), y: 0, z: punch(tl, 1.2, 1.04) }), 1.12, 300) };
  },
  cta(ctx) {
    const m = ctx.mekan('market', { isiq: 'gunduz', lovhe: false });
    const a = sahib(); m.on.insertBefore(a.g, m.on.firstChild); qaranlıq(m, 0.55);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); a.ifade({ gulus: 0.8, qas: 0.3 });
        a.poz({ x: 540, y: YER2 + 330, kolL: [6, 10], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', nefes: Math.sin(tl * 2), t: tl }); },
      kamera: (tl) => ({ x: 0, y: 0, z: punch(tl, 1.2, 1.0) }) };
  },
}, { arxa: '#08180F' });
