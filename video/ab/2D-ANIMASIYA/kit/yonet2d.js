// 2D direktor: planları zamana görə açıb-bağlayır, kamerani sürür, keçidləri və mətn qatını çağırır.
// kurucular: { planAdi: (ctx) => ({ grup, mekan?, guncelle?(tl,seg,t), kamera?(tl,seg,t) → {x,y,z,r} }) }
// Hər plan öz SVG qrupunu və öz mekanını (fon) qurur; yalnız aktiv plan görünür.
import { sahne, clamp, smooth, el } from './kadr.js';
import { mekan as mekanQur } from './mekan.js';
import { katman } from './katman.js';
import { hazir } from './sprayt.js';

export async function yonet2d(PLAN, kurucular, { arxa = '#101418', ad = 'sahne2d' } = {}) {
  await Promise.all([document.fonts.load("800 66px 'Archivo'"), document.fonts.load("600 19px 'Geist'")]);
  const S = sahne(document.getElementById('sahne'), { arxa });
  const ctx = { S, PLAN, seg: (a) => PLAN.planlar.find((p) => p.ad === a), mekan: (tur, opt) => mekanQur(S.defs, tur, opt) };
  const planlar = {};
  for (const a of [...new Set(PLAN.planlar.map((p) => p.ad))]) {
    if (a === 'kart') continue;
    if (!kurucular[a]) throw new Error(`[yonet2d] kurucu yok: ${a}`);
    const P = kurucular[a](ctx);
    for (const k of ['uzaq', 'orta', 'on']) { const g = P.qat?.[k]; if (g) { g.style.display = 'none'; S.qat[k].appendChild(g); } }
    planlar[a] = P;
  }
  await hazir();   // sprite şəkillər yüklənsin
  const yaz = katman(document.getElementById('katman'), PLAN.yazi, { vurgu: PLAN.vurgu });
  const kar = document.getElementById('karart'), bey = document.getElementById('beyaz');
  let aktif = null;
  const segBul = (t) => PLAN.planlar.find((p) => t >= p.s && t < p.e) ?? PLAN.planlar[PLAN.planlar.length - 1];
  function renderAt(t) {
    let seg = segBul(t), kartU = 0, tt = t;
    if (seg.ad === 'kart') { kartU = smooth(seg.s, seg.s + 0.9, t); const i = PLAN.planlar.indexOf(seg); seg = PLAN.planlar[i - 1]; tt = seg.e - 0.001; }
    const P = planlar[seg.ad];
    if (aktif !== P) {
      for (const p of Object.values(planlar)) for (const k of ['uzaq', 'orta', 'on']) if (p.qat?.[k]) p.qat[k].style.display = 'none';
      for (const k of ['uzaq', 'orta', 'on']) if (P.qat?.[k]) P.qat[k].style.display = '';
      aktif = P;
    }
    const tl = tt - seg.s;
    P.guncelle?.(tl, seg, tt);
    S.kamera(P.kamera ? P.kamera(tl, seg, tt) : {});
    let beyaz = 0, karart = 0;
    for (const p of PLAN.planlar) {
      if (p.gecis === 'beyaz') beyaz = Math.max(beyaz, smooth(p.s - 0.25, p.s, t) * (1 - smooth(p.s + 0.05, p.s + 0.6, t)));
      if (p.gecis === 'siyah') karart = Math.max(karart, smooth(p.s - 0.35, p.s, t) * (1 - smooth(p.s + 0.1, p.s + 0.8, t)));
    }
    karart = Math.max(karart, 0.55 * kartU, 1 - smooth(0, 0.2, t), smooth(PLAN.sure - 0.5, PLAN.sure, t));
    kar.style.opacity = karart; bey.style.opacity = beyaz;
    yaz(t);
  }
  window.addEventListener('hf-seek', (e) => renderAt(e.detail.time));
  renderAt(window.__hfTime || 0);
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {}; window.__hf.buildReady[ad] = renderAt;
  window.__bitdi = true; window.__renderAt = renderAt;
  return renderAt;
}
