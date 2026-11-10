// 2D personaj kuklası (puppet) — düz vektor, yumşaq kənarlar, oynaq sistemi.
// Koordinat: ayaq altı (0,0); yuxarı = mənfi y. Tam hündürlük ≈ 915 px (boy=1).
// API: poz({...}), ifade({...}), yeri(t), el(taraf) — 3D kitdəki adlarla eynidir ki, skill bir dildə qalsın.
import { el, q, yol2, dair, ellips, duzb, tr, egri, ton, clamp, lerp, rng, smooth, yuvarla } from './kadr.js';

export const TEN = ['#f2cfae', '#e8b88e', '#d49a6a', '#b07b4f', '#8a5c38', '#6b4428'];
export const SAC = ['#1d1510', '#2e2017', '#4a3120', '#6d4a2b', '#a9793f', '#c9c4bb'];

const SKELET = {
  ayaq: 0, topuq: -42, diz: -232, omba: -424, bel: -478, cigin: -690, boyun: -716,
  bas: -840, dirsek: -566, bilek: -438, basR: 128,
};

/** Bir uzuv (2 seqmentli): çiyin→dirsək→bilək, konik qalınlıq. */
function uzuv(uzun1, uzun2, q1, q2, renk, { qalin1 = 30, qalin2 = 26, uc = 22 } = {}) {
  const g = q();
  const a = q(); // üst
  a.appendChild(yol2(`M ${-qalin1 / 2} 0 L ${qalin1 / 2} 0 L ${qalin2 / 2} ${uzun1} L ${-qalin2 / 2} ${uzun1} Z`, { fill: renk, 'stroke-linejoin': 'round' }));
  a.appendChild(dair(0, 0, qalin1 / 2, { fill: renk }));
  a.appendChild(dair(0, uzun1, qalin2 / 2, { fill: renk }));
  const b = q(); // alt
  b.appendChild(yol2(`M ${-qalin2 / 2} 0 L ${qalin2 / 2} 0 L ${uc / 2} ${uzun2} L ${-uc / 2} ${uzun2} Z`, { fill: renk }));
  b.appendChild(dair(0, uzun2, uc / 2, { fill: renk }));
  tr(b, { y: uzun1 }); a.appendChild(b); g.appendChild(a);
  return { g, ust: a, alt: b };
}

/**
 * Personaj qurur. spec:
 *  { ten, sac, sacStil:'qisa'|'dalgali'|'topuz'|'uzun'|'kel'|'sapka', sacRenk, cins:'kisi'|'qadin',
 *    ust (köynək/pencək), alt (şalvar), ayaq (ayaqqabı), astar, eynek, saqqal, onluk, onlukRenk,
 *    boy (1 = 915px), seed }
 * Qaytarır: { g, poz, ifade, yeri, bas, kolL, kolR, el:{L,R}, spec }
 */
export function karakter(spec = {}) {
  const R = rng(spec.seed ?? 1);
  const kisi = (spec.cins ?? 'kisi') === 'kisi';
  const ten = spec.ten ?? TEN[(R() * 3) | 0];
  const sacR = spec.sacRenk ?? spec.sac ?? SAC[(R() * SAC.length) | 0];
  const ust = spec.ust ?? (kisi ? '#3f5a50' : '#e8e4da');
  const alt = spec.alt ?? '#2d3a44';
  const ayakR = spec.ayak ?? '#23272b';
  const astar = spec.astar ?? '#f6f3ec';
  const tenK = ton(ten, -0.14), ustK = ton(ust, -0.16), altK = ton(alt, -0.16);
  const S = SKELET, g = q();

  // ── ayaqlar ───────────────────────────────────────────────
  const ayaqQ = (s) => {
    const p = q(); tr(p, { x: s * 34, y: S.omba });
    // SVG-də aşağı müsbət; uzuv aşağıya qurulur
    const a = q();
    a.appendChild(yol2(`M -27 0 L 27 0 L 22 ${(S.diz - S.omba)} L -22 ${(S.diz - S.omba)} Z`, { fill: alt }));
    a.appendChild(dair(0, 0, 27, { fill: alt })); a.appendChild(dair(0, (S.diz - S.omba), 22, { fill: alt }));
    const b = q(); tr(b, { y: (S.diz - S.omba) });
    b.appendChild(yol2(`M -22 0 L 22 0 L 19 ${(S.topuq - S.diz)} L -19 ${(S.topuq - S.diz)} Z`, { fill: alt }));
    b.appendChild(dair(0, (S.topuq - S.diz), 19, { fill: alt }));
    const ayaqqabi = q(); tr(ayaqqabi, { y: (S.topuq - S.diz) });
    ayaqqabi.appendChild(yol2(egri([[-22, -18], [-24, 6], [-10, 22], [34, 24], [40, 12], [30, -14], [0, -22]], true, 0.9), { fill: ayakR }));
    ayaqqabi.appendChild(yol2(`M -24 18 L 40 18 L 40 26 Q 40 30 34 30 L -16 30 Q -24 30 -24 24 Z`, { fill: ton(ayakR, -0.3) }));
    b.appendChild(ayaqqabi); a.appendChild(b); p.appendChild(a);
    return { p, ust: a, alt: b };
  };
  const bacL = ayaqQ(-1), bacR = ayaqQ(1);

  // ── gövdə ─────────────────────────────────────────────────
  const govde = q(); tr(govde, { y: S.cigin });
  const gH = S.omba - S.cigin;  // müsbət (aşağı)
  const govdeForm = egri([[-78, 6], [-86, gH * 0.34], [-74, gH * 0.78], [-62, gH + 16], [0, gH + 24], [62, gH + 16], [74, gH * 0.78], [86, gH * 0.34], [78, 6], [0, -12]], true, 0.95);
  govde.appendChild(yol2(govdeForm, { fill: ust }));
  // köynək V / astar
  govde.appendChild(yol2(`M -30 -4 Q 0 44 30 -4 Q 0 14 -30 -4 Z`, { fill: astar }));
  // yaxa
  govde.appendChild(yol2(`M -34 -8 Q 0 26 34 -8 Q 36 -22 24 -26 Q 0 4 -24 -26 Q -36 -22 -34 -8 Z`, { fill: ton(ust, 0.1) }));
  // qırış xətləri
  govde.appendChild(yol2(`M -52 ${gH * 0.48} Q -36 ${gH * 0.56} -26 ${gH * 0.5}`, { fill: 'none', stroke: ustK, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.6 }));
  govde.appendChild(yol2(`M 52 ${gH * 0.52} Q 36 ${gH * 0.6} 26 ${gH * 0.54}`, { fill: 'none', stroke: ustK, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.6 }));
  if (spec.pencek) {
    const pc = spec.pencek, pk = ton(pc, -0.18);
    govde.appendChild(yol2(`M -34 -8 L -62 ${gH * 0.46} L -22 ${gH * 0.58} Z`, { fill: pk })); govde.appendChild(yol2(`M 34 -8 L 62 ${gH * 0.46} L 22 ${gH * 0.58} Z`, { fill: pk }));
    govde.appendChild(yol2(`M -22 ${gH * 0.58} L -20 ${gH + 18}`, { stroke: pk, 'stroke-width': 4, fill: 'none' })); govde.appendChild(yol2(`M 22 ${gH * 0.58} L 20 ${gH + 18}`, { stroke: pk, 'stroke-width': 4, fill: 'none' }));
  }
  if (spec.yelek) {
    const vk = spec.yelek;
    govde.appendChild(yol2(`M -70 -2 L -24 -4 L 0 ${gH * 0.5} L 24 -4 L 70 -2 L 66 ${gH + 12} L 0 ${gH + 20} L -66 ${gH + 12} Z`, { fill: vk }));
    govde.appendChild(yol2(`M -24 -4 L 0 ${gH * 0.5} L 24 -4`, { fill: 'none', stroke: ton(vk, -0.25), 'stroke-width': 4, 'stroke-linejoin': 'round' }));
  }
  if (spec.onluk) {
    const om = spec.onlukRenk ?? '#55B848';
    govde.appendChild(yol2(egri([[-60, 30], [-66, gH * 0.5], [-58, gH + 10], [0, gH + 18], [58, gH + 10], [66, gH * 0.5], [60, 30], [28, 12], [0, 34], [-28, 12]], true, 0.9), { fill: om }));
    govde.appendChild(duzb(-34, gH * 0.52, 68, 46, 8, { fill: ton(om, -0.18) }));
    if (spec.onlukLogo) { const lt = el('text', { x: 0, y: gH * 0.52 + 36, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 40, fill: '#2a1b10' }); lt.textContent = spec.onlukLogo; govde.appendChild(lt); }
  }

  // ── qollar ────────────────────────────────────────────────
  const kolQ = (s) => {
    const p = q(); tr(p, { x: s * 74, y: S.cigin + 18 });
    const L1 = S.cigin - S.dirsek, L2 = S.dirsek - S.bilek;   // müsbət uzunluqlar (yuxarı mənfi olduğu üçün)
    const a = q();
    a.appendChild(yol2(`M -24 0 L 24 0 L 20 ${L1} L -20 ${L1} Z`, { fill: ust }));
    a.appendChild(dair(0, 0, 24, { fill: ust })); a.appendChild(dair(0, L1, 20, { fill: ust }));
    const b = q(); tr(b, { y: L1 });
    b.appendChild(yol2(`M -20 0 L 20 0 L 17 ${L2} L -17 ${L2} Z`, { fill: ust }));
    b.appendChild(dair(0, L2, 17, { fill: ust }));
    // əl: mitten
    const elG = q(); tr(elG, { y: L2 + 4 });
    const elForm = yol2(egri([[-20, -2], [-24, 20], [-16, 38], [6, 42], [22, 32], [24, 10], [16, -6]], true, 0.95), { fill: ten });
    elG.appendChild(elForm);
    const bashBarmaq = ellips(s * -22, 12, 9, 13, { fill: ten, transform: `rotate(${s * 18} ${s * -22} 12)` });
    elG.appendChild(bashBarmaq);
    const barmaqlar = q();
    for (let i = 0; i < 3; i++) barmaqlar.appendChild(duzb(-15 + i * 11, 30, 9, 18, 4.5, { fill: ten }));
    elG.appendChild(barmaqlar);
    b.appendChild(elG); a.appendChild(b); p.appendChild(a);
    return { p, ust: a, alt: b, el: elG, barmaqlar };
  };
  const kolL = kolQ(-1), kolR = kolQ(1);

  // ── baş ───────────────────────────────────────────────────
  const bas = q(); tr(bas, { y: S.bas });
  const r = S.basR;
  bas.appendChild(yol2(`M -17 ${r * 0.62} L 17 ${r * 0.62} L 15 ${r * 1.08} L -15 ${r * 1.08} Z`, { fill: tenK }));   // boyun
  // kəllə: kişidə çənə kvadrat, qadında yumru
  const cene = kisi ? 0.86 : 0.7;
  const kelle = yol2(egri([
    [0, -r * 1.02], [r * 0.74, -r * 0.78], [r * 0.95, -r * 0.1], [r * 0.9, r * 0.34],
    [r * cene, r * 0.72], [r * 0.4, r * 0.98], [0, r * 1.03], [-r * 0.4, r * 0.98],
    [-r * cene, r * 0.72], [-r * 0.9, r * 0.34], [-r * 0.95, -r * 0.1], [-r * 0.74, -r * 0.78],
  ], true, 0.95), { fill: ten });
  bas.appendChild(kelle);
  // qulaqlar
  const qulaqL = ellips(-r * 0.96, r * 0.06, 13, 19, { fill: ten }), qulaqR = ellips(r * 0.96, r * 0.06, 13, 19, { fill: ten });
  bas.appendChild(qulaqL); bas.appendChild(qulaqR);
  // ── üz ─────────────────────────────────────────────
  const uz = q(); bas.appendChild(uz);
  const gozY = -r * 0.06, gozX = r * 0.38, gozR = r * 0.2;
  const gozAg = [], iris = [], isiq = [], qapaq = [], qas = [];
  for (const s of [-1, 1]) {
    const ag = ellips(s * gozX, gozY, gozR, gozR * 1.06, { fill: '#fbf8f4' }); uz.appendChild(ag); gozAg.push(ag);
    const ir = dair(s * gozX, gozY, gozR * 0.58, { fill: spec.gozRenk ?? '#3a2a1e' }); uz.appendChild(ir); iris.push(ir);
    const hl = dair(s * gozX + gozR * 0.22, gozY - gozR * 0.3, gozR * 0.2, { fill: '#ffffff' }); uz.appendChild(hl); isiq.push(hl);
    const qp = yol2(`M ${s * gozX - gozR} ${gozY} A ${gozR} ${gozR * 1.06} 0 0 1 ${s * gozX + gozR} ${gozY} Z`, { fill: ten, opacity: 0 });
    uz.appendChild(qp); qapaq.push(qp);
    const qq = yol2(`M ${s * gozX - gozR * 0.95} ${gozY - gozR * 1.5} Q ${s * gozX} ${gozY - gozR * 1.95} ${s * gozX + gozR * 0.95} ${gozY - gozR * 1.5}`,
      { fill: 'none', stroke: sacR, 'stroke-width': kisi ? 11 : 8, 'stroke-linecap': 'round' });
    uz.appendChild(qq); qas.push(qq);
    if (!kisi) uz.appendChild(ellips(s * r * 0.62, r * 0.3, 15, 9, { fill: '#ff8e8e', opacity: 0.3 }));
  }
  const burun = yol2(`M 0 ${r * 0.12} q ${kisi ? 9 : 7} ${r * 0.16} 0 ${r * 0.2}`, { fill: 'none', stroke: tenK, 'stroke-width': 6, 'stroke-linecap': 'round' });
  uz.appendChild(burun);
  const agiz = yol2('', { fill: 'none', stroke: '#9a4f48', 'stroke-width': 8, 'stroke-linecap': 'round' }); uz.appendChild(agiz);
  if (spec.saqqal) uz.appendChild(yol2(egri([[-r * 0.72, r * 0.3], [-r * 0.66, r * 0.72], [0, r * 1.0], [r * 0.66, r * 0.72], [r * 0.72, r * 0.3], [0, r * 0.5]], true, 0.9),
    { fill: spec.saqqalRenk ?? sacR, opacity: spec.saqqalGuclu ? 0.96 : 0.26 * (typeof spec.saqqal === 'number' ? spec.saqqal : 1) }));
  if (spec.saqqal && spec.saqqalGuclu) uz.appendChild(yol2(egri([[-r * 0.42, r * 0.42], [-r * 0.2, r * 0.62], [r * 0.2, r * 0.62], [r * 0.42, r * 0.42], [0, r * 0.5]], true, 0.9), { fill: ton(ten, 0.05) }));   // ağız ətrafı açıq (saqqal yarası)
  if (spec.big) uz.appendChild(yol2(`M ${-r * 0.5} ${r * 0.36} Q ${-r * 0.2} ${r * 0.24} 0 ${r * 0.32} Q ${r * 0.2} ${r * 0.24} ${r * 0.5} ${r * 0.36} Q ${r * 0.22} ${r * 0.44} 0 ${r * 0.38} Q ${-r * 0.22} ${r * 0.44} ${-r * 0.5} ${r * 0.36} Z`, { fill: spec.bigRenk ?? ton(sacR, -0.1) }));
  if (spec.saqqal || spec.big) uz.appendChild(agiz);
  if (spec.eynek) {
    const e = q();
    for (const s of [-1, 1]) e.appendChild(dair(s * gozX, gozY, gozR * 1.32, { fill: 'none', stroke: spec.eynekRenk ?? '#20262a', 'stroke-width': 7 }));
    e.appendChild(yol2(`M ${-gozX + gozR * 1.32} ${gozY} L ${gozX - gozR * 1.32} ${gozY}`, { stroke: spec.eynekRenk ?? '#20262a', 'stroke-width': 7 }));
    uz.appendChild(e);
  }
  // ── saç ────────────────────────────────────────────
  const stil = spec.sacStil ?? (kisi ? 'qisa' : 'dalgali');
  const sacQ = q();
  if (stil === 'qisa') sacQ.appendChild(yol2(egri([[-r * 1.0, r * 0.02], [-r * 1.02, -r * 0.6], [-r * 0.5, -r * 1.1], [r * 0.35, -r * 1.12], [r * 1.0, -r * 0.68], [r * 1.02, r * 0.06], [r * 0.86, -r * 0.3], [r * 0.3, -r * 0.52], [-r * 0.4, -r * 0.44], [-r * 0.84, -r * 0.2]], true, 0.95), { fill: sacR }));
  if (stil === 'dalgali') { sacQ.appendChild(yol2(egri([[-r * 1.08, r * 0.5], [-r * 1.12, -r * 0.5], [-r * 0.5, -r * 1.14], [r * 0.4, -r * 1.12], [r * 1.1, -r * 0.5], [r * 1.12, r * 0.55], [r * 0.9, r * 0.2], [r * 0.86, -r * 0.34], [0, -r * 0.56], [-r * 0.86, -r * 0.3], [-r * 0.9, r * 0.22]], true, 0.95), { fill: sacR }));
    sacQ.appendChild(yol2(egri([[-r * 0.9, -r * 0.42], [-r * 0.2, -r * 0.72], [r * 0.5, -r * 0.5], [r * 0.2, -r * 0.42], [-r * 0.4, -r * 0.3]], true, 0.9), { fill: ton(sacR, 0.12) })); }
  if (stil === 'topuz') { sacQ.appendChild(dair(0, -r * 1.06, r * 0.34, { fill: sacR }));
    sacQ.appendChild(yol2(egri([[-r * 1.0, r * 0.04], [-r * 1.02, -r * 0.6], [-r * 0.45, -r * 1.08], [r * 0.45, -r * 1.08], [r * 1.02, -r * 0.6], [r * 1.0, r * 0.04], [r * 0.84, -r * 0.3], [0, -r * 0.52], [-r * 0.84, -r * 0.3]], true, 0.95), { fill: sacR })); }
  if (stil === 'uzun') { sacQ.appendChild(yol2(egri([[-r * 1.12, r * 1.5], [-r * 1.18, -r * 0.4], [-r * 0.5, -r * 1.14], [r * 0.45, -r * 1.12], [r * 1.18, -r * 0.4], [r * 1.12, r * 1.5], [r * 0.86, r * 1.4], [r * 0.9, -r * 0.3], [0, -r * 0.56], [-r * 0.9, -r * 0.3], [-r * 0.86, r * 1.4]], true, 0.95), { fill: sacR })); }
  if (stil === 'sapka') { const sm = spec.sapkaRenk ?? '#2f4a3a';
    sacQ.appendChild(yol2(egri([[-r * 1.02, -r * 0.18], [-r * 0.9, -r * 0.86], [0, -r * 1.14], [r * 0.9, -r * 0.86], [r * 1.02, -r * 0.18], [0, -r * 0.3]], true, 0.95), { fill: sm }));
    const kz = q(); tr(kz, { y: -r * 0.34 });
    kz.appendChild(yol2(`M ${-r * 1.06} ${-r * 0.2} Q ${-r * 0.2} ${-r * 0.42} ${r * 1.36} ${-r * 0.16} Q ${r * 1.3} ${-r * 0.02} ${r * 0.9} ${r * 0.0} Q ${-r * 0.2} ${-r * 0.14} ${-r * 1.06} ${-r * 0.06} Z`, { fill: spec.kozyrek ?? ton(sm, -0.22) }));
    kz.appendChild(yol2(`M ${-r * 0.95} ${-r * 0.1} Q 0 ${r * 0.1} ${r * 0.95} ${-r * 0.1} L ${r * 0.9} ${r * 0.08} Q 0 ${r * 0.26} ${-r * 0.9} ${r * 0.08} Z`,     { fill: sacR })); sacQ.appendChild(kz); }
  if (spec.qivrim) for (const [px, py, pr] of [[-0.98, 0.0, 0.22], [-0.9, 0.3, 0.2], [0.98, 0.0, 0.22], [0.9, 0.3, 0.2], [-0.7, -0.15, 0.2], [0.7, -0.15, 0.2]]) sacQ.insertBefore(dair(px * r, py * r, pr * r, { fill: sacR }), sacQ.firstChild);
  if (spec.quiff) sacQ.appendChild(yol2(egri([[-r * 0.7, -r * 0.7], [-r * 0.2, -r * 1.3], [r * 0.5, -r * 1.28], [r * 0.9, -r * 0.8], [r * 0.4, -r * 0.9], [-r * 0.2, -r * 0.8]], true, 0.95), { fill: sacR }));
  if (stil !== 'kel') bas.appendChild(sacQ);

  g.appendChild(bacL.p); g.appendChild(bacR.p); g.appendChild(kolL.p); g.appendChild(govde); g.appendChild(kolR.p); g.appendChild(bas);
  if (spec.boy && spec.boy !== 1) tr(g, { sx: spec.boy, sy: spec.boy });

  // ── ifadə ─────────────────────────────────────────
  const E = { qas: 0, agiz: 0.2, goz: 1, baxis: [0, 0] };
  function uzYenile() {
    const ax = r * 0.46, ay = r * 0.52, k = E.agiz;
    agiz.setAttribute('d', k > 0.02
      ? `M ${-ax * 0.8} ${ay} Q 0 ${ay + ax * 0.75 * k} ${ax * 0.8} ${ay}`
      : k < -0.02 ? `M ${-ax * 0.7} ${ay + ax * 0.3 * -k} Q 0 ${ay - ax * 0.55 * -k} ${ax * 0.7} ${ay + ax * 0.3 * -k}`
      : `M ${-ax * 0.55} ${ay} L ${ax * 0.55} ${ay}`);
    qas.forEach((qq, i) => { const s = i ? 1 : -1;
      const dy = -E.qas * r * 0.1, egim = E.qas * r * 0.09 * s;
      qq.setAttribute('d', `M ${s * gozX - gozR * 0.95} ${gozY - gozR * 1.5 + dy + egim} Q ${s * gozX} ${gozY - gozR * 1.95 + dy} ${s * gozX + gozR * 0.95} ${gozY - gozR * 1.5 + dy - egim}`); });
    iris.forEach((ir, i) => { const s = i ? 1 : -1;
      ir.setAttribute('cx', yuvarla(s * gozX + E.baxis[0] * gozR * 0.42)); ir.setAttribute('cy', yuvarla(gozY + E.baxis[1] * gozR * 0.34));
      isiq[i].setAttribute('cx', yuvarla(s * gozX + gozR * 0.22 + E.baxis[0] * gozR * 0.42)); isiq[i].setAttribute('cy', yuvarla(gozY - gozR * 0.3 + E.baxis[1] * gozR * 0.34));
      const ac = clamp(E.goz); gozAg[i].setAttribute('ry', yuvarla(gozR * 1.06 * Math.max(0.06, ac)));
      ir.setAttribute('r', yuvarla(gozR * 0.58 * Math.max(0.1, ac)));
      isiq[i].setAttribute('opacity', ac > 0.4 ? 1 : 0); });
  }
  uzYenile();

  const api = {
    g, bas, govde, kolL, kolR, bacL, bacR, el: { L: kolL.el, R: kolR.el }, spec, skelet: S,
    /** qas: -1 qəzəb … +1 narahat/təəccüb · agiz: -1 kədər … +1 gülüş · goz: 0..1 · baxis: [-1..1,-1..1] */
    ifade(x = {}) { Object.assign(E, x); uzYenile(); },
    /**
     * poz: bucaqlar DƏRƏCƏ ilə, 0 = aşağı sallanan.
     * { kolL:[çiyin,dirsək], kolR, bacL:[omba,diz], bacR, govdeEg, basEg, basDon, nefes, yuru, siddet, t }
     */
    poz(o = {}) {
      const { kolL: kl = null, kolR: kr = null, bacL: bl = null, bacR: br = null,
        govdeEg = 0, basEg = 0, basDon = 0, nefes = 0, yuru = null, siddet = 1, t = null, x = 0, y = 0, cevir = 1 } = o;
      const w = yuru === null ? null : Math.sin(yuru) * siddet;
      const nef = nefes * 3;
      tr(g, { x, y, sx: (spec.boy ?? 1) * cevir, sy: spec.boy ?? 1 });
      tr(govde, { y: S.cigin + nef, r: govdeEg });
      tr(bas, { y: S.bas + nef - Math.abs(w ?? 0) * 4, r: basEg * 18 });
      tr(uz, { x: basDon * 16, y: 0, sx: 1 - Math.abs(basDon) * 0.1 });
      tr(kolL.p, { x: -74, y: S.cigin + 18 + nef, r: kl ? kl[0] : (w !== null ? -w * 26 : 6) });
      tr(kolR.p, { x: 74, y: S.cigin + 18 + nef, r: kr ? kr[0] : (w !== null ? w * 26 : -6) });
      tr(kolL.alt, { y: S.cigin - S.dirsek, r: kl ? kl[1] : 8 });
      tr(kolR.alt, { y: S.cigin - S.dirsek, r: kr ? kr[1] : -8 });
      tr(bacL.p, { x: -34, y: S.omba + nef * 0.4, r: bl ? bl[0] : (w !== null ? w * 24 : 0) });
      tr(bacR.p, { x: 34, y: S.omba + nef * 0.4, r: br ? br[0] : (w !== null ? -w * 24 : 0) });
      tr(bacL.alt, { y: (S.diz - S.omba), r: bl ? bl[1] : (w !== null ? Math.max(0, -w) * 30 : 0) });
      tr(bacR.alt, { y: (S.diz - S.omba), r: br ? br[1] : (w !== null ? Math.max(0, w) * 30 : 0) });
      if (t !== null) { const k = (t % 3.6) / 3.6, bl2 = k < 0.05 ? 1 - Math.abs(k - 0.025) / 0.025 : 0;
        const gz = E.goz; if (bl2 > 0) { E.goz = gz * (1 - bl2); uzYenile(); E.goz = gz; } }
    },
    /** Yeriş: t saniyə, hiz addım/san. Yerdə sıçrayış da verir. */
    yeri(t, { hiz = 2.2, siddet = 1, x = 0, y = 0, cevir = 1, kolL = null, kolR = null, basEg = 0, basDon = 0 } = {}) {
      const f = t * hiz * Math.PI;
      api.poz({ yuru: f, siddet, x, y: y - Math.abs(Math.cos(f)) * 7 * siddet, cevir, kolL, kolR, basEg, basDon, nefes: Math.sin(t * 2), t });
    },
  };
  api.poz({});
  return api;
}
