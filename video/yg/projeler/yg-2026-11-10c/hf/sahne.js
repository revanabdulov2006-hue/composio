// YG 2026-11-10c — "Starbucks, McDonalds kimi zəncirlər insanları necə geri gətirir?"
// Satış tipli video: əsas səhnələr motion-qrafik, yalnız 3 səhnə 2D personaj (toxun, panel, cta).
// Şəkil aktivləri g/*.png (Gemini Image). Fayl yoxdursa inline SVG ehtiyatı görünür.
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
const FLASH = ['hook2', 'bir', 'iki', 'uc', 'toxun', 'panel', 'cta'];
PLAN.yazi.gecisler = PLAN.planlar.filter((p) => FLASH.includes(p.ad)).map((p) => ({ tip: 'flash', s: p.s + 0.02 }));
const punch = (tl, z0 = 1.22, z1 = 1.04, d = 0.45) => lerp(z0, z1, easeOut(clamp(tl / d)));

const css = document.createElement('style');
css.textContent = `
.ab-flash{background:rgba(250,245,239,.42)!important}
#ov{position:absolute;inset:0;pointer-events:none}
#ov .o{position:absolute;opacity:0;will-change:transform,opacity,filter}
#bgm{position:absolute;inset:0;background:radial-gradient(120% 70% at 50% 38%,#2b2621 0%,#1c1714 70%);opacity:0}
#bgm .grid{position:absolute;inset:-200px;background-image:linear-gradient(rgba(250,245,239,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(250,245,239,.04) 1px,transparent 1px);background-size:72px 72px}
#bgm .orb{position:absolute;border-radius:50%;filter:blur(120px)}
#bgm img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.75}
#bgc{position:absolute;inset:0;background:#faf5ef;opacity:0}
.pay{left:50px;right:50px;text-align:center;font-family:Fraunces;font-weight:300;color:#faf5ef;letter-spacing:-.025em;line-height:1.0;font-variation-settings:"opsz" 144;text-shadow:0 6px 30px rgba(0,0,0,.45)}
.pay b{font-weight:900}
.pay i{font-style:italic;font-weight:900;color:#ff8a4c}
.pay.ink{color:#1c1917;text-shadow:none}.pay.ink i{color:#c2410c}
.pay .w{display:inline-block;margin:0 .09em}
.num{width:150px;height:150px;border-radius:50%;background:#e8703a;color:#fff7ee;font-family:Fraunces;font-weight:900;font-size:84px;display:grid;place-items:center;box-shadow:0 18px 50px rgba(194,65,12,.55);letter-spacing:-.03em}
.chip{display:inline-flex;align-items:center;gap:18px;padding:22px 36px;border-radius:999px;background:#fffdfa;color:#1c1917;font-family:Jakarta;font-weight:800;font-size:40px;box-shadow:0 18px 44px rgba(0,0,0,.35);white-space:nowrap}
.chip .ic{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#e8703a;color:#fff;font-size:30px;flex:none}
.chip.red{background:#3b1a0b;color:#ffd9c4}.chip.red .ic{background:#d8402f}
.chip.gh{background:rgba(255,253,250,.14);color:#f3e7dc;box-shadow:none;border:3px solid rgba(250,245,239,.22)}
.chip.gh .ic{background:rgba(250,245,239,.2)}
.nm{display:inline-block;padding:12px 26px;border-radius:999px;background:rgba(255,253,250,.9);color:#1c1917;font-family:Jakarta;font-weight:800;font-size:38px;box-shadow:0 14px 34px rgba(0,0,0,.35)}
.tile{position:relative;border-radius:54px;overflow:hidden;background:radial-gradient(120% 110% at 35% 25%,#332b26 0%,#201a17 70%);box-shadow:0 26px 64px rgba(0,0,0,.5);border:3px solid rgba(250,245,239,.1)}
.tile .fb{position:absolute;inset:0;display:grid;place-items:center}
.tile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.hero{position:relative;width:680px;height:680px;border-radius:72px;overflow:hidden;background:radial-gradient(110% 100% at 45% 28%,#413630 0%,#241d19 74%);box-shadow:0 40px 100px rgba(0,0,0,.55);border:3px solid rgba(250,245,239,.12)}
.hero .fb{position:absolute;inset:0;display:grid;place-items:center}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.big3{font-family:Fraunces;font-weight:900;color:#ff8a4c;font-size:560px;line-height:.82;letter-spacing:-.05em;text-align:center;left:0;right:0;text-shadow:0 30px 80px rgba(194,65,12,.5)}
.srow{display:flex;gap:20px}
.slot{width:140px;height:140px;border-radius:40px;background:rgba(250,245,239,.08);border:4px solid rgba(250,245,239,.18);display:grid;place-items:center;position:relative;overflow:hidden}
.slot.on{background:radial-gradient(120% 120% at 35% 25%,#ffb877,#e8703a 60%,#c2410c);border-color:#ffb877;box-shadow:0 14px 36px rgba(232,112,58,.5)}
.slot img{position:absolute;inset:8px;width:calc(100% - 16px);height:calc(100% - 16px);object-fit:contain}
.prof{width:760px;border-radius:46px;background:#fffdfa;padding:34px 34px 28px;box-sizing:border-box;box-shadow:0 40px 90px rgba(0,0,0,.5);font-family:Jakarta;color:#1c1917}
.prof .hd{display:flex;align-items:center;gap:24px;margin-bottom:24px}
.prof .av{width:104px;height:104px;border-radius:50%;background:#e8703a;color:#fff;display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:54px;flex:none}
.prof .nm2{font-family:Fraunces;font-weight:900;font-size:56px}
.prof .r{display:flex;align-items:center;gap:18px;height:104px;border-radius:26px;background:#f6efe6;margin-bottom:14px;padding:0 26px;font-weight:800;font-size:36px}
.prof .r .k{margin-left:auto;font-weight:700;font-size:30px;color:#8a7f73}
.noti{width:800px;border-radius:44px;background:#fffdfa;padding:30px 34px;box-sizing:border-box;box-shadow:0 40px 90px rgba(0,0,0,.55);font-family:Jakarta;color:#1c1917;display:flex;align-items:center;gap:26px}
.noti .ap{width:96px;height:96px;border-radius:26px;background:#e8703a;display:grid;place-items:center;flex:none}
.noti .ap img{width:66px;height:66px;filter:brightness(0) invert(1)}
.noti .t1{font-weight:900;font-size:40px}
.noti .t2{font-weight:700;font-size:32px;color:#8a7f73;margin-top:6px}
.pz{width:430px;border-radius:40px;background:rgba(250,245,239,.1);border:4px solid rgba(250,245,239,.18);padding:30px 0 34px;box-sizing:border-box;text-align:center;font-family:Jakarta;color:#f3e7dc}
.pz .lb{font-weight:800;font-size:38px;opacity:.85}
.pz .vl{font-family:Fraunces;font-weight:900;font-size:92px;margin-top:10px;line-height:1}
.pz.win{background:radial-gradient(120% 120% at 40% 20%,#ff9a5e,#e8703a 60%,#c2410c);border-color:#ffb877;color:#fff7ee;box-shadow:0 26px 64px rgba(232,112,58,.45)}
.ph{width:900px;border-radius:44px;overflow:hidden;box-shadow:0 50px 110px rgba(0,0,0,.6)}
.ph img{display:block;width:100%}
.stampDev{width:150px;height:150px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ff9a5e,#e8703a 55%,#c2410c);border:10px solid #3b1a0b;display:grid;place-items:center;box-shadow:0 20px 50px rgba(0,0,0,.5)}
.ring{width:150px;height:150px;border-radius:50%;border:8px solid #ffb877}
.list{width:720px;border-radius:44px;background:#fffdfa;padding:34px 30px 26px;box-sizing:border-box;box-shadow:0 40px 90px rgba(0,0,0,.5);font-family:Jakarta;color:#1c1917}
.list .hd{display:flex;align-items:center;gap:18px;font-family:Fraunces;font-weight:900;font-size:50px;margin:0 6px 22px}
.list .hd img{width:72px;height:72px}
.list .r{display:flex;align-items:center;gap:20px;height:116px;border-radius:28px;background:#f6efe6;margin-bottom:14px;padding:0 24px;font-weight:800;font-size:36px}
.list .r .av{width:70px;height:70px;border-radius:50%;background:#e8703a;color:#fff;display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:38px;flex:none}
.list .r .d{margin-left:auto;font-weight:700;font-size:28px;padding:10px 18px;border-radius:999px;white-space:nowrap}
.list .r .ok{background:#e3f1df;color:#2f6b2a}.list .r .wr{background:#fde3d3;color:#b23a12}
.list .r.warn{background:#fff1e8}
.list .sm{text-align:right;font-weight:600;font-size:22px;color:#a8a097;letter-spacing:.12em;margin-top:6px}
.stamp{border:14px solid #e8703a;border-radius:40px;padding:4px 54px;color:#ff8a4c;font-family:Fraunces;font-weight:900;font-size:186px;letter-spacing:.02em;transform:rotate(-5deg);background:rgba(28,23,20,.55)}
.brand{display:flex;align-items:center;gap:24px;color:#faf5ef;font-family:Jakarta;font-weight:800;font-size:54px}
.brand img{width:130px;height:130px}
.loopw{position:absolute;left:0;top:0;width:100%;height:100%}
`;
document.head.appendChild(css);
const root = document.getElementById('root');
const ov = document.createElement('div'); ov.id = 'ov'; root.insertBefore(ov, document.getElementById('beyaz'));
const bgm = document.createElement('div'); bgm.id = 'bgm';
bgm.innerHTML = '<div class="grid"></div><div class="orb" style="width:900px;height:900px;left:90px;top:420px;background:#c2410c;opacity:.30"></div>'
  + '<div class="orb" style="width:600px;height:600px;left:600px;top:1300px;background:#d97706;opacity:.12"></div>'
  + '<img src="g/fon-doku.png" onerror="this.remove()">';
ov.appendChild(bgm);
const bgc = document.createElement('div'); bgc.id = 'bgc'; ov.appendChild(bgc);
const O = (html, x, y, extra = '') => { const d = document.createElement('div'); d.className = 'o ' + extra; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; ov.appendChild(d); return d; };
const centerX = (d) => { d.style.left = '0px'; d.style.right = '0px'; d.dataset.flex = 1; d.style.justifyContent = 'center'; };
const W_ = (s) => s.split(' ').map((w) => `<span class="w">${w}</span>`).join(' ');

// ---- inline SVG ehtiyatları (Gemini şəkli yüklənsə üstünü örtür)
const sv = (p, c = '#e8703a', w = 3.2, sz = 150) => `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const P_STAR = '<path d="M12 2.8l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7l-5.9 3.1 1.2-6.5L2.5 9.7l6.6-.9z" fill="#e8703a" stroke="#ffb877"/>';
const P_GIFT = '<rect x="3.2" y="9.2" width="17.6" height="11.6" rx="2.2"/><path d="M3.2 13.4h17.6M12 9.2v11.6"/><path d="M12 9.2C10.4 6 7 5.2 6 6.8S8 9.2 12 9.2zM12 9.2C13.6 6 17 5.2 18 6.8S16 9.2 12 9.2z"/>';
const P_BELL = '<path d="M18 16.2v-5.1a6 6 0 1 0-12 0v5.1l-2.2 3h16.4z"/><path d="M9.9 21.2a2.2 2.2 0 0 0 4.2 0"/>';
const P_TAG = '<path d="M20.4 12.6l-7.8 7.8a2 2 0 0 1-2.8 0l-6-6a2 2 0 0 1 0-2.8L11.6 3.8l8.8 8.8z"/><circle cx="15.7" cy="8.3" r="1.5"/>';
const P_READ = '<circle cx="12" cy="15.5" r="4.6"/><path d="M7.4 9.6a6.6 6.6 0 0 1 9.2 0M4.6 6.4a10.6 10.6 0 0 1 14.8 0"/>';
const P_CHART = '<rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2.6"/><path d="M7.4 16v-3.2M11.3 16v-6M15.2 16v-4.2M18.8 16v-7"/>';
const P_PHONE = '<rect x="6.5" y="3" width="11" height="18.4" rx="2.8"/><path d="M10.2 5.8h3.6"/><rect x="8.8" y="9" width="6.4" height="4" rx="1.3" fill="#ff9a5e" stroke="none" opacity=".92"/>';
const P_CUP = '<path d="M5.5 8.2h11v7.4a5.2 5.2 0 0 1-5.2 5.2h-.6a5.2 5.2 0 0 1-5.2-5.2z"/><path d="M16.5 10.2h1.6a2.4 2.4 0 0 1 0 4.8h-1.6"/><path d="M8.6 2.6c-.8 1.2.8 2 0 3.6M12 2.6c-.8 1.2.8 2 0 3.6"/>';
const TILE = (name, path, size = 270, col = '#ff9a5e') => O(
  `<div class="tile" style="width:${size}px;height:${size}px"><div class="fb">${sv(path, col, 2.6, size * 0.56)}</div><img src="g/${name}.png" onerror="this.remove()"></div>`, 0, 0);

// ---- elementlər -------------------------------------------------------------
// hook
const hBrand = O('<div style="display:flex;gap:22px;justify-content:center"><span class="nm">Starbucks</span><span class="nm">McDonald\'s</span></div>', 0, 200);
const HEROSVG = `<svg viewBox="0 0 100 100" width="680" height="680" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <g id="hloop" style="transform-origin:50px 50px">
    <circle cx="50" cy="50" r="36" stroke="#e8703a" stroke-width="3.4"/>
    <path d="M58.5 14l-9-5.6v11.2z" fill="#e8703a" stroke="none"/>
    <path d="M41.5 86l9 5.6v-11.2z" fill="#e8703a" stroke="none"/>
  </g>
  <g transform="translate(26,27) scale(2)" stroke="#ff9a5e" stroke-width="2.2">
    <path d="M5.5 8.2h11v7.4a5.2 5.2 0 0 1-5.2 5.2h-.6a5.2 5.2 0 0 1-5.2-5.2z"/>
    <path d="M16.5 10.2h1.6a2.4 2.4 0 0 1 0 4.8h-1.6"/>
    <path d="M8.6 2.6c-.8 1.2.8 2 0 3.6M12 2.6c-.8 1.2.8 2 0 3.6"/>
  </g></svg>`;
const hHero = O(`<div class="hero"><div class="fb">${HEROSVG}</div><img src="g/hero-loop.png" onerror="this.remove()"></div>`, 200, 500);
const hT = O(`<div style="font-size:98px">${W_('İnsanları necə')}<br><span class="w"><i>geri</i></span> ${W_('gətirirlər?')}</div>`, 0, 1320, 'pay');
// hook2
const h2T = O(`<div style="font-size:92px">${W_('Ən çox işlətdikləri')}</div>`, 0, 420, 'pay');
const h2N = O('<div>3</div>', 0, 620, 'big3');
const h2U = O(`<div style="font-size:112px"><span class="w"><b>üsul.</b></span></div>`, 0, 1250, 'pay');
// bir
const n1 = O('<div class="num">01</div>', 465, 230);
const b1 = O(`<div style="font-size:98px">${W_('Sənə')} <span class="w"><i>yarımçıq</i></span><br>${W_('bir şey verirlər.')}</div>`, 0, 460, 'pay');
const b1bar = O('<div style="width:760px;height:46px;border-radius:999px;background:rgba(250,245,239,.12);overflow:hidden"><div id="b1f" style="height:100%;width:0%;border-radius:999px;background:linear-gradient(90deg,#f08a4f,#c2410c)"></div></div>', 160, 1000);
const b1chip = O('<div class="chip gh"><span class="ic">◷</span>bitməyən iş adamı rahat buraxmır</div>', 0, 1130);
// ulduz
const uT = O(`<div style="font-size:90px">${W_('Beş ulduz var.')}<br><span class="w"><i>Biri</i></span> ${W_('qalır.')}</div>`, 0, 300, 'pay');
const srow = O(`<div class="srow">${[0, 1, 2, 3, 4, 5].map((k) => `<div class="slot${k < 5 ? ' on' : ''}" id="sl${k}">${k < 5 ? sv(P_STAR, '#fff7ee', 1.6, 86) : ''}<img src="g/ikon-ulduz.png" onerror="this.remove()" style="${k < 5 ? '' : 'display:none'}"></div>`).join('')}</div>`, 0, 800);
const uGift = TILE('ikon-hediyye', P_GIFT, 260); uGift.style.left = '410px'; uGift.style.top = '1030px';
const uChip = O('<div class="chip"><span class="ic">★</span>hədiyyəyə 1 ulduz</div>', 0, 1400);
// ulduz2
const u2T = O(`<div style="font-size:94px">${W_('Səni')} <span class="w"><i>o bir ulduz</i></span><br>${W_('qaytarır.')}</div>`, 0, 300, 'pay');
const u2Slot = O(`<div class="slot" id="u2s" style="width:330px;height:330px;border-radius:84px">${sv(P_STAR, 'rgba(255,184,119,.5)', 1.3, 190)}</div>`, 375, 720);
const u2Arc = O(`<svg width="700" height="300" viewBox="0 0 70 30" fill="none" stroke="#ff8a4c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path id="u2p" d="M6 27C6 13 18 5 34 5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>
  <path id="u2h" d="M34 3.2l-5.2 8.4h10.4z" fill="#ff8a4c" stroke="none" opacity="0"/></svg>`, 200, 1070);
const u2Chip = O('<div class="chip red"><span class="ic">✕</span>qəhvənin dadı yox</div>', 0, 1480);
// iki
const n2 = O('<div class="num">02</div>', 465, 230);
const i1 = O(`<div style="font-size:104px">${W_('Onlar səni')}<br><span class="w"><i>tanıyır.</i></span></div>`, 0, 470, 'pay');
const iAv = O(`<div style="position:relative;width:320px;height:320px">
  <div style="width:320px;height:320px;border-radius:50%;background:radial-gradient(120% 120% at 35% 25%,#ff9a5e,#e8703a 60%,#c2410c);display:grid;place-items:center;font-family:Fraunces;font-weight:900;font-size:160px;color:#fff7ee;box-shadow:0 26px 64px rgba(232,112,58,.45)">A</div>
  <div id="iavc" style="position:absolute;right:-6px;bottom:6px;width:112px;height:112px;border-radius:50%;background:#fffdfa;display:grid;place-items:center;box-shadow:0 14px 34px rgba(0,0,0,.45)">
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2f6b2a" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div></div>`, 380, 900);
// tani
const tT = O(`<div style="font-size:88px">${W_('Nə içdiyini')} <span class="w"><i>bilirlər.</i></span></div>`, 0, 280, 'pay');
const prof = O(`<div class="prof"><div class="hd"><div class="av">A</div><div><div class="nm2">Aysel</div></div></div>`
  + `<div class="r" id="pr0">Həmişə latte<span class="k">12 dəfə</span></div>`
  + `<div class="r" id="pr1">Adətən səhər<span class="k">09:20</span></div>`
  + `<div class="r" id="pr2">Son gəliş<span class="k">cümə</span></div>`
  + `<div class="sm">NÜMUNƏ</div></div>`, 160, 700);
// zeng
const zT = O(`<div style="font-size:88px">${W_('Yoxa çıxsan,')}<br><span class="w"><i>təklif</i></span> ${W_('gəlir.')}</div>`, 0, 280, 'pay');
const zPh = TILE('ikon-telefon', P_PHONE, 300); zPh.style.left = '390px'; zPh.style.top = '760px';
const zBell = TILE('ikon-zeng', P_BELL, 190); zBell.style.left = '700px'; zBell.style.top = '700px';
const zNoti = O(`<div class="noti"><div class="ap"><img src="logo.png"></div><div><div class="t1">Latte-n səni gözləyir</div><div class="t2">bu gün hədiyyə kuponu var</div></div></div>`, 140, 1200);
// uc
const n3 = O('<div class="num">03</div>', 465, 230);
const c1 = O(`<div style="font-size:92px">${W_('Ən yaxşı qiymət')}<br><span class="w"><i>yalnız</i></span> ${W_('tətbiqdə.')}</div>`, 0, 450, 'pay');
const pzA = O('<div class="pz"><div class="lb">Kassada</div><div class="vl">adi</div></div>', 80, 1060);
const pzB = O('<div class="pz win"><div class="lb">Tətbiqdə</div><div class="vl">endirim</div></div>', 570, 1060);
// etiket
const eT = O(`<div style="font-size:92px">${W_('Endirim üçün')}<br><span class="w"><i>məcbur</i></span> ${W_('qayıdır.')}</div>`, 0, 330, 'pay');
const eArc = O(`<svg width="860" height="620" viewBox="0 0 86 62" fill="none" stroke="#ff8a4c" stroke-width="2.2" stroke-linecap="round">`
  + `<path id="ea0" d="M8 8C8 40 30 52 42 52" stroke-dasharray="120" stroke-dashoffset="120"/>`
  + `<path id="ea1" d="M78 8C78 40 56 52 44 52" stroke-dasharray="120" stroke-dashoffset="120"/>`
  + `<path id="ea2" d="M43 2C43 24 43 38 43 50" stroke-dasharray="120" stroke-dashoffset="120"/></svg>`, 110, 740);
const eApp = O(`<div class="tile" style="width:220px;height:220px;border-radius:56px"><div class="fb"><img src="logo.png" style="width:130px;height:130px"></div></div>`, 430, 1250);
// kecid (krem fon)
const kT = O(`<div style="font-size:92px">${W_('Üçünün də bir adı var:')}</div>`, 0, 640, 'pay ink');
const kBig = O(`<div style="font-size:120px">${W_('qayıtmaq üçün')}<br><span class="w"><i>səbəb.</i></span></div>`, 0, 950, 'pay ink');
// kecid2
const k2Logo = O('<img src="logo.png" style="width:300px;height:300px">', 390, 520);
const k2T = O(`<div style="font-size:100px">${W_('Milyonluq sistem')}<br><span class="w"><i>lazım deyil.</i></span></div>`, 0, 930, 'pay ink');
// toxun (2D)
const tx = O(`<div style="font-size:88px">${W_('Kassada telefonu')}<br><span class="w"><i>möhürə</i></span> ${W_('toxundurur.')}</div>`, 0, 230, 'pay');
const dev = O('<div class="stampDev"><img src="logo.png" style="width:90px;height:90px;filter:brightness(0) invert(1)"></div>', 640, 1030);
const rings = [0, 1, 2].map(() => O('<div class="ring"></div>', 640, 1030));
const plus = O('<div class="chip"><span class="ic">+1</span>möhür</div>', 540, 860);
// kartim
const kpT = O(`<div style="font-size:84px">${W_('Hər gəliş')} <span class="w"><i>kartında</i></span> ${W_('yığılır.')}</div>`, 0, 150, 'pay');
const ph = O('<div class="ph"><img src="card.jpg"></div>', 90, 360);
const gift2 = O('<div class="chip"><span class="ic">🎁</span>hədiyyə yaxınlaşır</div>', 0, 1660);
// panel (2D)
const pT = O(`<div style="font-size:90px">${W_('Kim gəlir,')} <span class="w"><i>kim itib</i></span><br>${W_('— görürsən.')}</div>`, 0, 200, 'pay');
const ROWS = [['A', 'Aysel', 'bu gün', 'ok'], ['M', 'Murad', 'dünən', 'ok'], ['L', 'Leyla', '3 həftədir yox', 'wr'], ['E', 'Elvin', '5 həftədir yox', 'wr']];
const list = O(`<div class="list"><div class="hd"><img src="logo.png">Müştərilərin</div>${ROWS.map(([a, n, d, c], k) => `<div class="r${c === 'wr' ? ' warn' : ''}" id="lr${k}"><div class="av">${a}</div>${n}<span class="d ${c}">${d}</span></div>`).join('')}<div class="sm">NÜMUNƏ</div></div>`, 320, 640);
// cta (2D)
const cS = O('<div class="stamp">YENƏ</div>', 0, 400);
const cG = O('<div class="chip"><span class="ic">✓</span>ilk 30 gün pulsuz</div>', 0, 760);
const cB = O('<div class="brand"><img src="logo.png">yenegel.app</div>', 0, 1620);

[hBrand, h2T, h2U, b1chip, srow, uChip, u2Chip, zNoti, eT, gift2, cS, cG, cB].forEach(centerX);
zNoti.style.left = '140px'; zNoti.style.right = 'auto'; delete zNoti.dataset.flex;
eT.style.left = '50px'; eT.style.right = '50px'; delete eT.dataset.flex;

const show = (d, a, { y = 0, x = 0, s = 1, bl = 0, r = 0 } = {}) => { d.style.opacity = clamp(a).toFixed(3); d.style.display = a > 0.002 ? (d.dataset.flex ? 'flex' : 'block') : 'none';
  d.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`; d.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none'; };
const pop = (t, a, d = 0.5) => spring(clamp((t - a) / d), { sonum: 0.45, tezlik: 10 });
const win = (t, a, b, fi = 0.18, fo = 0.18) => clamp((t - a) / fi) * (1 - clamp((t - (b - fo)) / fo));
const words = (box, t, a, step, w = 1) => box.querySelectorAll('.w').forEach((d, k) => { const u = easeOut(clamp((t - (a + k * step)) / 0.3)); d.style.opacity = u * w; d.style.transform = `translateY(${(1 - u) * 40}px)`; d.style.filter = u > 0.99 ? 'none' : `blur(${(1 - u) * 10}px)`; });
const txt = (box, t, a, b, step = 0.07) => { show(box, win(t, a - 0.05, b, 0.05, 0.2)); words(box, t, a, step); };

function overlay(t) {
  const bgOn = (ads) => Math.max(...ads.map((a) => { const p = planBy(a); return win(t, p.s, p.e, 0.12, 0.12); }));
  bgm.style.opacity = bgOn(['hook', 'hook2', 'bir', 'ulduz', 'ulduz2', 'iki', 'tani', 'zeng', 'uc', 'etiket', 'kartim']).toFixed(3);
  bgc.style.opacity = bgOn(['kecid', 'kecid2']).toFixed(3);

  { const p = planBy('hook'); const w = win(t, 0, p.e, 0.01, 0.15);
    const bq = pop(t, 0.15, 0.55); show(hBrand, w * clamp(bq * 2), { s: lerp(0.6, 1, bq), y: (1 - bq) * -40 });
    const hq = pop(t, 0.35, 0.7); show(hHero, w * clamp(hq * 1.6), { s: lerp(0.78, 1, hq) + Math.sin(t * 1.1) * 0.006, y: (1 - hq) * 60, r: lerp(-3, 0, hq) });
    const lp = document.getElementById('hloop');
    if (lp) { const u = easeOut(clamp((t - 0.55) / 0.9)); lp.style.opacity = u.toFixed(2); lp.style.transform = `rotate(${lerp(-40, 0, u) + t * 6}deg) scale(${lerp(0.7, 1, u)})`; }
    txt(hT, t, 1.25, p.e, 0.09); }

  { const p = planBy('hook2'); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(h2T, t, p.s + 0.05, p.e, 0.07);
    const x = clamp((t - (p.s + 0.45)) / 0.34); const sc = x < 1 ? lerp(2.6, 1, easeOut(x)) : 1 + 0.04 * Math.exp(-(t - p.s - 0.8) * 8) * Math.cos((t - p.s - 0.8) * 26);
    show(h2N, w * clamp(x * 3), { s: sc });
    txt(h2U, t, p.s + 1.15, p.e, 0.07); }

  { const p = planBy('bir'); const w = win(t, p.s, p.e, 0.12, 0.14);
    const x = pop(t, p.s + 0.05, 0.5); show(n1, w * clamp(x * 2), { s: lerp(0.3, 1, x) });
    txt(b1, t, p.s + 0.3, p.e, 0.07);
    const f = easeOut(clamp((t - (p.s + 0.85)) / 0.9)); show(b1bar, w * clamp((t - (p.s + 0.8)) / 0.25));
    document.getElementById('b1f').style.width = (f * 83).toFixed(1) + '%';
    const cq = pop(t, p.s + 1.3, 0.5); show(b1chip, w * clamp(cq * 2), { s: lerp(0.5, 1, cq), y: (1 - cq) * 36 }); }

  { const p = planBy('ulduz'); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(uT, t, p.s + 0.05, p.e, 0.07);
    const rq = pop(t, p.s + 0.3, 0.55); show(srow, w * clamp(rq * 2), { s: lerp(0.7, 1, rq) });
    for (let k = 0; k < 6; k++) { const el = document.getElementById('sl' + k); const u = pop(t, p.s + 0.45 + k * 0.17, 0.45);
      el.style.opacity = clamp(u * 1.6).toFixed(3); el.style.transform = `scale(${lerp(0.3, 1, u)})`;
      if (k === 5) { const pul = 1 + 0.07 * Math.sin((t - p.s) * 7); el.style.transform = `scale(${lerp(0.3, pul, u)})`; el.style.borderColor = `rgba(255,184,119,${0.35 + 0.4 * Math.sin((t - p.s) * 7)})`; } }
    const gq = pop(t, p.s + 1.6, 0.5); show(uGift, w * clamp(gq * 2), { s: lerp(0.4, 1, gq), r: lerp(-14, 4, gq) });
    const cq = pop(t, p.s + 2.0, 0.5); show(uChip, w * clamp(cq * 2), { s: lerp(0.5, 1, cq) }); }

  { const p = planBy('ulduz2'); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(u2T, t, p.s + 0.05, p.e, 0.07);
    const sq = pop(t, p.s + 0.3, 0.55); const pul = 1 + 0.05 * Math.sin((t - p.s) * 6);
    show(u2Slot, w * clamp(sq * 2), { s: lerp(0.4, pul, sq) });
    const el = document.getElementById('u2s'); if (el) el.style.borderColor = `rgba(255,184,119,${0.3 + 0.45 * Math.abs(Math.sin((t - p.s) * 3))})`;
    show(u2Arc, w * clamp((t - (p.s + 0.75)) / 0.25));
    const pp = document.getElementById('u2p'), ph2 = document.getElementById('u2h');
    if (pp) { const u = easeInOut(clamp((t - (p.s + 0.85)) / 0.85)); pp.style.strokeDashoffset = String(100 * (1 - u)); ph2.style.opacity = clamp((u - 0.85) * 7).toFixed(2); }
    const cq = pop(t, p.s + 1.75, 0.5); show(u2Chip, w * clamp(cq * 2), { s: lerp(0.5, 1, cq), y: (1 - cq) * 40 }); }

  { const p = planBy('iki'); const w = win(t, p.s, p.e, 0.12, 0.14);
    const x = pop(t, p.s + 0.05, 0.5); show(n2, w * clamp(x * 2), { s: lerp(0.3, 1, x) });
    txt(i1, t, p.s + 0.28, p.e, 0.07);
    const aq = pop(t, p.s + 0.65, 0.55); show(iAv, w * clamp(aq * 2), { s: lerp(0.35, 1, aq) });
    const cc = document.getElementById('iavc'); if (cc) { const u = pop(t, p.s + 1.15, 0.45); cc.style.opacity = clamp(u * 1.6).toFixed(2); cc.style.transform = `scale(${lerp(0.2, 1, u)})`; } }

  { const p = planBy('tani'); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(tT, t, p.s + 0.05, p.e, 0.07);
    const x = pop(t, p.s + 0.25, 0.6); show(prof, w * clamp(x * 2), { x: (1 - x) * 260, s: lerp(0.9, 1, x), r: lerp(5, 1, x) });
    for (let k = 0; k < 3; k++) { const r = document.getElementById('pr' + k); const u = pop(t, p.s + 0.5 + k * 0.2, 0.45);
      r.style.opacity = clamp(u * 1.6).toFixed(3); r.style.transform = `translateX(${(1 - u) * 160}px)`; } }

  { const p = planBy('zeng'); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(zT, t, p.s + 0.05, p.e, 0.07);
    const x = pop(t, p.s + 0.2, 0.55); show(zPh, w * clamp(x * 2), { s: lerp(0.6, 1, x), y: (1 - x) * 50 });
    const bq = pop(t, p.s + 0.75, 0.5); const sh = Math.sin((t - p.s) * 18) * 5 * Math.exp(-Math.max(0, t - p.s - 0.75) * 1.6);
    show(zBell, w * clamp(bq * 2), { s: lerp(0.3, 1, bq), r: bq > 0.2 ? sh : -20 });
    const nq = pop(t, p.s + 1.1, 0.55); show(zNoti, w * clamp(nq * 2), { y: (1 - nq) * 120, s: lerp(0.85, 1, nq) }); }

  { const p = planBy('uc'); const w = win(t, p.s, p.e, 0.12, 0.14);
    const x = pop(t, p.s + 0.05, 0.5); show(n3, w * clamp(x * 2), { s: lerp(0.3, 1, x) });
    txt(c1, t, p.s + 0.28, p.e, 0.07);
    const aq = pop(t, p.s + 1.05, 0.5); show(pzA, w * clamp(aq * 2) * (1 - 0.45 * clamp((t - (p.s + 1.9)) / 0.4)), { x: (1 - aq) * -90, s: lerp(0.85, 1, aq) });
    const bq = pop(t, p.s + 1.45, 0.55); show(pzB, w * clamp(bq * 2), { x: (1 - bq) * 90, s: lerp(0.85, 1, bq) * (1 + 0.03 * Math.sin((t - p.s) * 5)) });
  }

  { const p = planBy('etiket'); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(eT, t, p.s + 0.05, p.e, 0.07);
    show(eArc, w * clamp((t - (p.s + 0.25)) / 0.3));
    for (let k = 0; k < 3; k++) { const el = document.getElementById('ea' + k); if (!el) continue;
      const u = easeInOut(clamp((t - (p.s + 0.35 + k * 0.16)) / 0.7)); el.style.strokeDashoffset = String(120 * (1 - u)); }
    const aq = pop(t, p.s + 1.3, 0.55); show(eApp, w * clamp(aq * 2), { s: lerp(0.3, 1, aq) * (1 + 0.04 * Math.sin((t - p.s) * 6)) }); }

  { const p = planBy('kecid'); const w = win(t, p.s, p.e, 0.16, 0.14);
    txt(kT, t, p.s + 0.05, p.e, 0.07);
    txt(kBig, t, p.s + 0.95, p.e, 0.09); }

  { const p = planBy('kecid2'); const w = win(t, p.s, p.e, 0.14, 0.16);
    const x = pop(t, p.s + 0.1, 0.6); show(k2Logo, w * clamp(x * 2), { s: lerp(0.3, 1, x), r: lerp(-26, 0, x) });
    txt(k2T, t, p.s + 0.35, p.e, 0.08); }

  { const p = planBy('toxun'); const c = S(13); const d = c.e - c.s; const w = win(t, p.s, p.e);
    txt(tx, t, c.s + 0.05, p.e, 0.07);
    const x = pop(t, c.s + 0.4, 0.5); const hit = c.s + d * 0.6;
    show(dev, w * clamp(x * 2), { s: lerp(0.4, 1, x) * (1 + 0.08 * Math.exp(-Math.max(0, t - hit) * 8) * (t > hit ? 1 : 0)) });
    rings.forEach((r, k) => { const u = clamp((t - hit - k * 0.18) / 0.9); show(r, w * (u > 0 && u < 1 ? (1 - u) : 0), { s: 1 + u * 1.6 }); });
    const pl = pop(t, hit + 0.1, 0.5); show(plus, w * clamp(pl * 2), { s: lerp(0.4, 1, pl), y: (1 - pl) * 40 - clamp(t - hit) * 30 }); }

  { const p = planBy('kartim'); const c = S(14); const w = win(t, p.s, p.e, 0.12, 0.14);
    txt(kpT, t, c.s + 0.02, p.e, 0.07);
    const x = pop(t, p.s + 0.05, 0.6); show(ph, w * clamp(x * 2), { y: (1 - x) * 300 + Math.sin(t * 1.4) * 8, s: lerp(0.85, 0.96, x) + (t - p.s) * 0.01, r: lerp(6, -1, x) });
    const g = pop(t, c.s + 1.2, 0.5); show(gift2, w * clamp(g * 2), { s: lerp(0.4, 1, g), y: (1 - g) * 36 }); }

  { const p = planBy('panel'); const c = S(15); const w = win(t, p.s, p.e);
    txt(pT, t, c.s + 0.02, p.e, 0.07);
    const x = pop(t, p.s + 0.1, 0.6); show(list, w * clamp(x * 2), { x: (1 - x) * 500, s: 0.95, r: lerp(8, 2, x) });
    ROWS.forEach((_, k) => { const r = document.getElementById('lr' + k); const u = pop(t, p.s + 0.2 + k * 0.15, 0.45); r.style.opacity = clamp(u * 1.5); r.style.transform = `translateX(${(1 - u) * 200}px)`; }); }

  { const p = planBy('cta'); const c = S(16); const w = win(t, p.s, PLAN.sure + 1, 0.15, 0.01);
    const sx = clamp((t - (c.s + 0.15)) / 0.3); const sc = sx < 1 ? lerp(2.3, 1, easeOut(sx)) : 1 + 0.05 * Math.exp(-(t - c.s - 0.45) * 9) * Math.cos((t - c.s - 0.45) * 30);
    show(cS, w * clamp(sx * 3), { s: sc });
    const gq = pop(t, c.s + 0.95, 0.5); show(cG, w * clamp(gq * 2), { s: lerp(0.5, 1, gq), y: (1 - gq) * 40 });
    const lg = easeOut(clamp((t - (c.s + 1.45)) / 0.4)); show(cB, w * lg, { y: (1 - lg) * 30 }); }
}

const K = (fn, z = 1.12, dy = 150) => (tl) => { const k = fn(tl); return { ...k, y: (k.y || 0) + dy, z: k.z * z }; };
const qar = (m, op, fill = '#1c1714') => { m.on.appendChild(duzb(-600, -600, 2400, 3200, 0, { fill, opacity: op })); };
const kafe = (ctx, isiq) => ctx.mekan('kafe', { isiq });
const pist = (m) => m.on.appendChild(pistaxta(m.P, { x: 540, y: 1920 - 40, w: 900, h: 300, renk: '#6b3f22', ust: '#efe4d4', kassa: true }));
// motion səhnə: personaj yox, yalnız qaranlıq fon + overlay
const sade = (kam) => (ctx) => { const m = ctx.mekan('ofis', { isiq: 'tund' }); qar(m, 1);
  return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on }, guncelle(tl, seg, tt) { overlay(tt); }, kamera: kam }; };
const duz = sade(() => ({ x: 0, y: 0, z: 1 }));

yonet2d(PLAN, {
  hook: duz, hook2: duz, bir: duz, ulduz: duz, ulduz2: duz, iki: duz, tani: duz, zeng: duz,
  uc: duz, etiket: duz, kecid: duz, kecid2: duz, kartim: duz,
  // --- 2D personaj səhnəsi 1/3: müştəri kassada möhürə toxundurur
  toxun(ctx) {
    const m = kafe(ctx, 'gunduz'); const b = musteri(); m.on.appendChild(b.g); qar(m, 0.25);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); const c = S(13); const hit = c.s + (c.e - c.s) * 0.6;
        const r = easeInOut(clamp((tt - (hit - 1.0)) / 0.7));
        b.ifade({ gulus: lerp(0.4, 0.85, clamp((tt - hit) / 0.4)), baxis: [0.6, 0.2] });
        b.poz({ x: 400, y: YER - 10, kolL: [8, 12], elL: 'acik', kolR: [lerp(14, 72, r), lerp(140, 40, r)], elR: ['tutma', 'telefon'], basDon: 0.4, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-20, 30, clamp(tl / 5)), y: 0, z: punch(tl, 1.25, 1.08) }), 1.0, 300) };
  },
  // --- 2D personaj səhnəsi 2/3: sahibkar panelə baxır
  panel(ctx) {
    const m = kafe(ctx, 'gunduz'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.5);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt);
        a.ifade({ gulus: 0.8, qas: 0.3, baxis: [0.6, 0.3] });
        a.poz({ x: 250, y: YER - 20, kolL: [8, 12], kolR: [14, 145], elR: ['tutma', 'telefon'], basDon: 0.4, basEg: 0.05, nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: lerp(-30, 20, clamp(tl / 4)), y: 0, z: punch(tl, 1.2, 1.06) }), 1.0, 360) };
  },
  // --- 2D personaj səhnəsi 3/3: CTA
  cta(ctx) {
    const m = kafe(ctx, 'gunduz'); const a = sahib(); m.on.appendChild(a.g); pist(m); qar(m, 0.72);
    return { qat: { uzaq: m.uzaq, orta: m.orta, on: m.on },
      guncelle(tl, seg, tt) { overlay(tt); a.ifade({ gulus: 0.85, qas: 0.3 });
        a.poz({ x: 540, y: YER - 20, kolL: [8, 12], kolR: [140 + Math.sin(tl * 7) * 12, 25], elR: 'acik', nefes: Math.sin(tl * 2), t: tl }); },
      kamera: K((tl) => ({ x: 0, y: 0, z: punch(tl, 1.2, 1.05) }), 1.0, 220) };
  },
}, { arxa: '#1c1714' });
