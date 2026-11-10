// insan.js — peşəkar 2D "cut-out" personaj rig (SVG). Üslub: yarı-real multfilm, tünd kontur, 2 tonlu cel-kölgə.
// Proporsiya ≈ 4.6 baş (baş iri, bədən real): ayaq altı (0,0), yuxarı = mənfi y, boy=1 → ~1000 px.
// Hissələr: ayaqlar → çanaq → gövdə(+geyim) → qollar(+əllər, əşya) → boyun → baş(qulaq, saç, üz, saqqal, bığ, kepka).
// İdarə: poz({x,y,cevir,kolL:[çiyin,dirsək],kolR,elL,elR,bacL,bacR,govdeEg,basEg,basDon,nefes,yuru,t,danis})
//        ifade({gulus,ac,qas,egim,goz,baxis:[x,y]}).  Bucaqlar dərəcə; çiyin + = kənara, dirsək + = içəri/yuxarı bükülmə.
import { el, q, yol2, dair, ellips, duzb, tr, ton, clamp, lerp } from './kadr.js';

export const OL = '#2a1f19';           // kontur rəngi
const LW = 4.6;                         // kontur qalınlığı
let UID = 0;

// ── köməkçilər ────────────────────────────────────────────────────────────
/** Doldur + (istəyə görə) kölgə + kontur. kolge: kölgə yolu (forma daxilində kəsilir). */
function parca(g, d, renk, { kolge = null, kolgeRenk = null, isiq = null, isiqRenk = null, xett = LW, clip = true } = {}) {
  const id = `cp${++UID}`;
  g.appendChild(yol2(d, { fill: renk }));
  if (kolge || isiq) {
    const cp = el('clipPath', { id }); cp.appendChild(yol2(d)); g.appendChild(el('defs', {}, cp));
    const k = q(); if (clip) k.setAttribute('clip-path', `url(#${id})`);
    if (kolge) k.appendChild(yol2(kolge, { fill: kolgeRenk ?? ton(renk, -0.16) }));
    if (isiq) k.appendChild(yol2(isiq, { fill: isiqRenk ?? ton(renk, 0.14) }));
    g.appendChild(k);
  }
  if (xett) g.appendChild(yol2(d, { fill: 'none', stroke: OL, 'stroke-width': xett, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  return g;
}
const cizgi = (d, { w = 3, renk = OL, op = 1 } = {}) => yol2(d, { fill: 'none', stroke: renk, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: op });
/** Kapsulun yalnız yan konturları (oynaqda tikiş görünməsin). */
const kapsulYan = (L, w1, w2) => { const a = w1 / 2, b = w2 / 2; return `M ${-a} 0 C ${-a - 1} ${L * 0.45} ${-b - 1} ${L * 0.8} ${-b} ${L} M ${b} ${L} C ${b + 1} ${L * 0.8} ${a + 1} ${L * 0.45} ${a} 0`; };
/** Konik kapsul (qol/ayaq seqmenti): (0,0)-dan (0,L)-ə, en w1→w2, yuxarı və aşağı yumru. */
const kapsul = (L, w1, w2) => { const a = w1 / 2, b = w2 / 2;
  return `M ${-a} 0 C ${-a - 1} ${L * 0.45} ${-b - 1} ${L * 0.8} ${-b} ${L} A ${b} ${b * 0.8} 0 0 0 ${b} ${L} C ${b + 1} ${L * 0.8} ${a + 1} ${L * 0.45} ${a} 0 A ${a} ${a * 0.8} 0 0 0 ${-a} 0 Z`; };

// ── skelet (boy=1) ────────────────────────────────────────────────────────
export const SK = {
  topuq: -44, diz: -248, omba: -452, bel: -510, ciyin: -706, boyun: -718, basM: -842,   // basM: başın mərkəzi
  ciyinX: 80, ombaX: 34, L1: 168, L2: 150, ayaqL1: 204, ayaqL2: 206, BAS: 1.16,
};

// ── EL (bilək (0,0), barmaqlar +y) ──────────────────────────────────────────
function el_(ten, s, poza, esya) {
  const g = q(), tk = ton(ten, -0.18), ic = -s;      // ic: bədənə doğru tərəf (+x sol qol üçün)
  const esyaG = q(), on = q();
  const xurma = 'M -17 -2 C -20 12 -20 28 -15 40 C -6 46 6 46 15 40 C 20 28 20 12 17 -2 Z';
  if (esya) esyaG.appendChild(esyaCiz(esya));
  // baş barmaq (arxada)
  const bas = (dx, dy, r, L = 24) => { const b = q(); tr(b, { x: dx, y: dy, r }); parca(b, kapsul(L, 13, 11), ten, { kolge: `M 0 0 L 9 0 L 9 ${L + 8} L 0 ${L + 8} Z`, kolgeRenk: tk, xett: 3.6 }); return b; };
  const barmaq = (x, y, L, r = 0, en = 9.5) => { const b = q(); tr(b, { x, y, r }); parca(b, kapsul(L, en, en - 1.2), ten, { kolge: `M 1 0 L 8 0 L 8 ${L + 6} L 1 ${L + 6} Z`, kolgeRenk: tk, xett: 3.4 }); return b; };
  if (poza === 'yumruq' || poza === 'isare') {
    parca(g, 'M -18 -2 C -21 12 -21 30 -16 44 C -6 52 8 52 17 44 C 21 30 21 12 18 -2 Z', ten, { kolge: 'M 4 -4 L 24 -4 L 24 56 L 4 56 Z', kolgeRenk: tk });
    for (const x of [-9, 0, 9]) g.appendChild(cizgi(`M ${x} 34 L ${x} 46`, { w: 2.6, renk: tk }));
    if (poza === 'isare') g.appendChild(barmaq(ic * -9, 36, 34, 0));
    g.appendChild(bas(ic * 14, 12, ic * -38, 20));
  } else if (poza === 'tutma') {           // əşyanı ovucda saxlayır: barmaqlar əşyanın üstündə
    g.appendChild(bas(ic * 15, 8, ic * -44, 26));
    parca(g, xurma, ten, { kolge: 'M 4 -4 L 24 -4 L 24 50 L 4 50 Z', kolgeRenk: tk });
    for (let i = 0; i < 4; i++) on.appendChild(barmaq(ic * -6, 12 + i * 9.5, [20, 23, 22, 18][i], ic * -84, 9.6));
  } else {                                // açıq / sallanan
    parca(g, xurma, ten, { kolge: 'M 4 -4 L 24 -4 L 24 50 L 4 50 Z', kolgeRenk: tk });
    for (const [i, x] of [-11.5, -3.8, 3.8, 11.5].entries()) g.appendChild(barmaq(x, 32, [17, 21, 20, 16][i], x * 0.25, 8.6));
    g.appendChild(bas(ic * 16, 8, ic * -30, 25));
  }
  const kok = q(); kok.appendChild(esyaG); kok.appendChild(g); kok.appendChild(on);
  return kok;
}

// ── ƏŞYALAR (ovucda; mərkəz ~ (0,40)) ──────────────────────────────────────
function esyaCiz(ad) {
  const g = q();
  if (ad === 'telefon') {
    const t = q(); tr(t, { x: -2, y: 10, r: -8 });
    parca(t, 'M -22 -40 Q -22 -48 -14 -48 L 14 -48 Q 22 -48 22 -40 L 22 40 Q 22 48 14 48 L -14 48 Q -22 48 -22 40 Z', '#2c3440', { kolge: 'M 8 -50 L 30 -50 L 30 50 L 8 50 Z' });
    t.appendChild(duzb(-17, -42, 34, 80, 4, { fill: '#9fb7d9' }));
    t.appendChild(yol2('M -17 -42 L 6 -42 L -17 0 Z', { fill: '#ffffff', opacity: 0.25 }));
    g.appendChild(t);
  } else if (ad === 'bloknot') {
    const t = q(); tr(t, { x: 10, y: 6, r: -12 });
    parca(t, 'M -44 -58 L 44 -58 L 44 58 L -44 58 Z', '#d8c4a0', { kolge: 'M 30 -60 L 50 -60 L 50 60 L 30 60 Z' });
    for (let i = 0; i < 6; i++) t.appendChild(cizgi(`M -32 ${-30 + i * 14} L 32 ${-30 + i * 14}`, { w: 2, renk: '#a8926c' }));
    for (let i = 0; i < 9; i++) t.appendChild(ellips(-36 + i * 9, -60, 3, 7, { fill: 'none', stroke: '#54585e', 'stroke-width': 2.5 }));
    g.appendChild(t);
  } else if (ad === 'qelem') {
    const t = q(); tr(t, { x: 0, y: 20, r: 35 });
    parca(t, 'M -4 -40 L 4 -40 L 4 26 L 0 36 L -4 26 Z', '#2f3540', { xett: 3 });
    g.appendChild(t);
  } else if (ad === 'fincan') {
    const t = q(); tr(t, { x: ic0 * 3.2, y: -6 });
    parca(t, 'M -30 -22 L 30 -22 C 30 6 20 22 0 22 C -20 22 -30 6 -30 -22 Z', '#f1ede4', { kolge: 'M 10 -24 L 34 -24 L 34 24 L 10 24 Z' });
    t.appendChild(ellips(0, -22, 30, 7, { fill: '#5a3a24', stroke: OL, 'stroke-width': 3.6 }));
    t.appendChild(cizgi('M 30 -14 C 46 -14 46 6 26 8', { w: 4.6 }));
    t.appendChild(cizgi('M -8 -36 C -14 -46 -2 -52 -8 -62', { w: 3, renk: '#b9b2a6', op: 0.8 }));
    t.appendChild(cizgi('M 6 -34 C 0 -44 12 -50 6 -60', { w: 3, renk: '#b9b2a6', op: 0.8 }));
    g.appendChild(t);
  } else if (ad === 'qovluq') {
    const t = q(); tr(t, { x: 14, y: 4, r: -18 });
    parca(t, 'M -50 -66 L 50 -66 L 50 66 L -50 66 Z', '#b98a52', { kolge: 'M 34 -70 L 56 -70 L 56 70 L 34 70 Z' });
    parca(t, 'M -42 -56 L 42 -56 L 42 60 L -42 60 Z', '#fbfaf6', { xett: 2.6 });
    t.appendChild(el('text', { x: 0, y: -38, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 12, fill: '#2a2a2a' }, document.createTextNode('QAİMƏ')));
    for (let i = 0; i < 6; i++) t.appendChild(cizgi(`M -32 ${-22 + i * 13} L 32 ${-22 + i * 13}`, { w: 2, renk: '#9aa3ab' }));
    parca(t, 'M -16 -72 L 16 -72 L 16 -56 L -16 -56 Z', '#8d949b', { xett: 3 });
    g.appendChild(t);
  } else if (ad === 'karton') {
    const t = q(); tr(t, { x: 0, y: 16 });
    parca(t, 'M -58 -50 L 58 -50 L 58 50 L -58 50 Z', '#c99a64', { kolge: 'M 30 -52 L 62 -52 L 62 52 L 30 52 Z' });
    t.appendChild(duzb(-10, -50, 20, 100, 0, { fill: '#e6c48f', opacity: 0.9 }));
    t.appendChild(cizgi('M -58 -50 L 58 -50', { w: LW }));
    g.appendChild(t);
  }
  return g;
}
let ic0 = 0;

// ── SAÇ STİLLƏRİ (baş mərkəzinə nəzərən) ────────────────────────────────────
function sacCiz(g, arxa, stil, sR, opt) {
  const sk = ton(sR, -0.22), si = ton(sR, 0.16);
  if (stil === 'modern') {        // üstü həcmli, yanları qısa (Rəvan, kofeşop)
    parca(arxa, 'M -84 -4 C -92 -70 -60 -116 -4 -120 C 56 -122 92 -80 86 -6 L 76 -6 C 74 -50 60 -70 40 -76 L -50 -76 C -66 -66 -74 -40 -76 -6 Z', sR, { kolge: 'M 30 -130 L 100 -130 L 100 0 L 60 0 Z', kolgeRenk: sk });
    parca(g, 'M -80 -20 C -86 -78 -50 -118 0 -122 C 50 -126 88 -96 86 -46 C 84 -30 80 -20 78 -10 C 72 -40 60 -60 40 -66 C 20 -58 -6 -70 -26 -64 C -46 -58 -64 -48 -72 -26 Z', sR,
      { kolge: 'M 20 -66 C 50 -70 76 -54 84 -20 L 100 -20 L 100 -140 L 60 -140 C 80 -110 70 -80 20 -66 Z', kolgeRenk: sk, isiq: 'M -50 -96 C -30 -112 10 -116 30 -110 C 10 -104 -20 -100 -50 -86 Z', isiqRenk: si });
    g.appendChild(cizgi('M -40 -100 C -20 -90 0 -86 20 -94', { w: 2.6, renk: sk }));
    g.appendChild(cizgi('M -10 -112 C 10 -102 30 -100 50 -104', { w: 2.6, renk: sk }));
  } else if (stil === 'geri') {   // geri daranmış, boz, alın açıq (yaşlı sahibkar)
    parca(arxa, 'M -84 0 C -94 -64 -60 -112 0 -114 C 60 -114 94 -64 84 0 L 76 0 C 76 -40 50 -70 0 -72 C -50 -70 -76 -40 -76 0 Z', sR, { kolge: 'M 30 -130 L 100 -130 L 100 0 L 60 0 Z', kolgeRenk: sk });
    parca(g, 'M -80 -18 C -86 -70 -52 -108 0 -110 C 54 -110 88 -74 82 -20 C 76 -46 58 -66 30 -72 C 6 -76 -20 -76 -42 -70 C -62 -62 -74 -44 -80 -18 Z', sR,
      { kolge: 'M 30 -72 C 60 -66 80 -46 82 -20 L 100 -20 L 100 -130 L 50 -130 C 70 -100 60 -80 30 -72 Z', kolgeRenk: sk, isiq: 'M -40 -98 C -10 -106 30 -104 50 -96 C 20 -92 -10 -92 -40 -86 Z', isiqRenk: si });
    for (const [a, b] of [[-52, -82], [-22, -90], [10, -92]]) g.appendChild(cizgi(`M ${a} ${b} C ${a + 12} ${b - 4} ${a + 24} ${b - 2} ${a + 32} ${b + 3}`, { w: 2.4, renk: sk }));
    // yan saçlar (qulaq üstü)
    for (const s of [-1, 1]) parca(g, `M ${s * 80} -40 C ${s * 86} -24 ${s * 86} -6 ${s * 80} 6 L ${s * 74} 6 C ${s * 76} -10 ${s * 76} -24 ${s * 72} -36 Z`, sR, { xett: 3.4 });
  } else if (stil === 'qivrim') { // qıvrım (kepka altından çıxır)
    const pts = [[-86, -30], [-90, -6], [-84, 16], [86, -30], [90, -6], [84, 16], [-70, -52], [70, -52]];
    for (const [x, y] of pts) parca(arxa, `M ${x - 15} ${y} A 15 15 0 1 1 ${x + 15} ${y} A 15 15 0 1 1 ${x - 15} ${y} Z`, sR, { kolge: `M ${x} ${y - 20} L ${x + 20} ${y - 20} L ${x + 20} ${y + 20} L ${x} ${y + 20} Z`, kolgeRenk: sk, xett: 3.4 });
    parca(arxa, 'M -84 -10 C -92 -70 -60 -112 0 -116 C 60 -112 92 -70 84 -10 Z', sR, { xett: 0 });
  } else if (stil === 'qadin') {  // çiyinə qədər, hörgüsüz (qadın personajlar)
    parca(arxa, 'M -92 120 C -110 40 -104 -80 -40 -116 C 20 -134 96 -100 100 -20 C 104 40 104 90 92 120 Z', sR, { kolge: 'M 40 -140 L 120 -140 L 120 130 L 60 130 Z', kolgeRenk: sk });
    parca(g, 'M -82 -10 C -84 -84 -40 -120 8 -120 C 60 -118 90 -84 86 -20 C 70 -60 30 -76 -6 -76 C -40 -70 -66 -50 -82 -10 Z', sR,
      { kolge: 'M 30 -76 C 60 -70 80 -50 86 -20 L 100 -140 Z', kolgeRenk: sk, isiq: 'M -40 -100 C -10 -110 30 -108 50 -100 C 20 -96 -10 -94 -40 -88 Z', isiqRenk: si });
  }
}

// ── PERSONAJ ──────────────────────────────────────────────────────────────
/**
 * spec: { ten, sacRenk, sac:'modern'|'geri'|'qivrim'|'qadin'|'kel', saqqal:0..1 (tam saqqal), saqqalRenk, big:'yox'|'nazik'|'qalin'|'bugrum',
 *   bigRenk, yas:0..1 (qırış), qas: qaş rəngi, gozRenk, eynek,
 *   geyim:'pencek'|'yelek'|'koynek'|'forma', ic: köynək/tişört rəngi, ust: pencək/yelek/forma rəngi, yaxa:'tisort'|'koynek',
 *   onluk: rəng, onlukLogo, forma2: forma ikinci rəngi (çiyin), zolaq: əks etdirici zolaq,
 *   alt: şalvar, ayaq: ayaqqabı, kepka: {renk, kozyrek, yazi}, boy, kok: bədən eni (0.9–1.15) }
 */
export function insan(spec = {}) {
  const ten = spec.ten ?? '#e0a983', tk = ton(ten, -0.14), tkk = ton(ten, -0.26);
  const sR = spec.sacRenk ?? '#3b2618', kok = spec.kok ?? 1;
  const ust = spec.ust ?? '#2a3d6a', icR = spec.ic ?? '#f4f3ef', alt = spec.alt ?? '#232b38', ayakR = spec.ayak ?? '#6b3f24';
  const S = SK, g = q(), govdeG = q(), kolL = {}, kolR = {}, bac = {};
  const qolRenk = spec.geyim === 'yelek' || spec.geyim === 'koynek' ? icR : ust;

  // ── AYAQLAR ──
  const ayaqQ = (s) => {
    const p = q(), u = q(), a = q(), f = q();
    parca(u, kapsul(S.ayaqL1, 60, 50), alt, { xett: 0, kolge: `M ${s > 0 ? 6 : 10} -10 L 40 -10 L 40 ${S.ayaqL1 + 20} L ${s > 0 ? 8 : 12} ${S.ayaqL1 + 20} Z` }); u.appendChild(cizgi(kapsulYan(S.ayaqL1, 60, 50), { w: LW }));
    parca(a, kapsul(S.ayaqL2 - 10, 50, 46), alt, { kolge: `M 8 -10 L 40 -10 L 40 ${S.ayaqL2 + 10} L 8 ${S.ayaqL2 + 10} Z` });
    a.appendChild(cizgi(`M ${s * -4} 10 L ${s * -2} ${S.ayaqL2 - 30}`, { w: 2.4, renk: ton(alt, -0.3), op: 0.7 }));   // ütü xətti
    if (spec.zolaq) a.appendChild(duzb(-24, 120, 48, 13, 0, { fill: '#c9cdd2', stroke: OL, 'stroke-width': 2.4 }));
    tr(f, { y: S.ayaqL2 - 4 });
    parca(f, `M -26 -14 L 26 -14 C ${30 + s * 4} -2 ${36 + s * 6} 16 ${30 + s * 8} 30 C 14 38 -14 38 ${-30 + s * 8} 30 C ${-36 + s * 6} 16 -30 -2 -26 -14 Z`, ayakR,
      { kolge: `M -40 18 L 50 18 L 50 40 L -40 40 Z`, kolgeRenk: ton(ayakR, -0.35), isiq: 'M -14 -8 C -4 -12 8 -12 16 -6 C 6 -4 -4 -2 -14 0 Z' });
    f.appendChild(cizgi('M -10 -6 L 10 -6 M -9 2 L 9 2', { w: 2.2, renk: ton(ayakR, -0.4) }));
    a.appendChild(f); tr(a, { y: S.ayaqL1 }); u.insertBefore(a, u.firstChild); p.appendChild(u);
    return { p, ust: u, alt: a };
  };
  bac.L = ayaqQ(-1); bac.R = ayaqQ(1);
  // çanaq / şalvar üstü
  const canaq = q(); tr(canaq, { y: S.omba });
  parca(canaq, `M ${-70 * kok} -50 L ${70 * kok} -50 L ${66 * kok} 40 C 30 52 -30 52 ${-66 * kok} 40 Z`, alt, { kolge: `M 20 -60 L 90 -60 L 90 60 L 30 60 Z` });
  canaq.appendChild(cizgi('M 0 -40 L 0 36', { w: 2.4, renk: ton(alt, -0.3) }));
  parca(canaq, `M ${-70 * kok} -54 L ${70 * kok} -54 L ${70 * kok} -36 L ${-70 * kok} -36 Z`, '#3a2a20', { xett: 3 });   // kəmər
  parca(canaq, 'M -12 -56 L 12 -56 L 12 -34 L -12 -34 Z', '#b8a27a', { xett: 2.6 });

  // ── GÖVDƏ ──
  tr(govdeG, { y: S.ciyin });
  const w = 90 * kok, gH = S.omba - S.ciyin;   // gH ≈ 258
  const govde = `M -34 -12 C ${-w + 34} -4 ${-w + 8} 4 ${-w} 26 C ${-w - 4} 70 ${-w + 10} 150 ${-w + 18} 210 L ${-w + 22} ${gH + 8} L ${w - 22} ${gH + 8} L ${w - 18} 210 C ${w - 10} 150 ${w + 4} 70 ${w} 22 C ${w - 8} 4 ${w - 34} -4 34 -12 Z`;
  const govdeKolge = `M 30 -20 C 60 0 ${w + 10} 60 ${w} 140 L ${w + 20} 300 L 40 300 C ${w - 40} 200 ${w - 30} 80 30 -20 Z`;
  const geyim = spec.geyim ?? 'pencek';
  parca(govdeG, govde, geyim === 'pencek' ? icR : geyim === 'yelek' || geyim === 'koynek' ? icR : ust, { kolge: govdeKolge });
  if (geyim === 'pencek') {
    // tişört yaxası
    govdeG.appendChild(cizgi('M -30 -8 C -16 14 16 14 30 -8', { w: 3.4 }));
    for (const s of [-1, 1]) {
      const panel = `M ${s * 34} -12 C ${s * (w - 30)} -8 ${s * (w - 4)} 0 ${s * w} 22 C ${s * (w + 4)} 70 ${s * (w - 10)} 150 ${s * (w - 18)} 210 L ${s * (w - 20)} ${gH + 24} L ${s * 18} ${gH + 30} L ${s * 26} 150 L ${s * 34} 40 Z`;
      parca(govdeG, panel, ust, s > 0 ? { kolge: `M 40 -20 C 70 10 ${w + 10} 80 ${w} 150 L ${w + 20} 320 L 60 320 C ${w - 30} 200 80 80 40 -20 Z` } : { isiq: `M -40 10 C -60 30 -70 80 -72 140 L -60 140 C -58 90 -50 40 -40 10 Z` });
      parca(govdeG, `M ${s * 32} -14 L ${s * 56} 52 L ${s * 42} 62 L ${s * 26} 150 L ${s * 34} 40 Z`, ton(ust, -0.12), { xett: 3.6 });   // yaxalıq (lapel)
      govdeG.appendChild(cizgi(`M ${s * 52} 196 L ${s * 82} 194`, { w: 3, renk: ton(ust, -0.35) }));      // cib
    }
    for (const y of [170, 214]) govdeG.appendChild(dair(-14, y, 4.5, { fill: ton(ust, -0.35), stroke: OL, 'stroke-width': 2 }));
    govdeG.appendChild(cizgi(`M -60 30 C -66 26 -74 28 -80 34`, { w: 2.6, renk: ton(ust, -0.35) }));   // döş cibi
  } else if (geyim === 'yelek') {
    for (const s of [-1, 1]) parca(govdeG, `M ${s * 16} -6 L ${s * 30} -12 L ${s * 26} 30 L ${s * 8} 20 Z`, icR, { xett: 3.2 });   // köynək yaxası
    const yel = `M ${-w + 18} 4 L -26 -2 L 0 118 L 26 -2 L ${w - 18} 4 C ${w - 6} 60 ${w - 12} 160 ${w - 16} ${gH - 6} C 40 ${gH + 8} -40 ${gH + 8} ${-w + 16} ${gH - 6} C ${-w + 12} 160 ${-w + 6} 60 ${-w + 18} 4 Z`;
    parca(govdeG, yel, ust, { kolge: `M 30 -10 C 70 10 ${w} 80 ${w - 10} ${gH} L ${w + 20} ${gH + 20} L 50 ${gH + 20} C 70 180 60 60 30 -10 Z`, isiq: 'M -60 20 C -70 60 -72 120 -70 180 L -58 180 C -60 120 -58 60 -50 20 Z' });
    for (let i = 0; i < 9; i++) govdeG.appendChild(cizgi(`M ${-w + 26 + i * 18} ${gH - 22} L ${-w + 26 + i * 18} ${gH - 2}`, { w: 2.2, renk: ton(ust, -0.3) }));   // toxunma hissə
    govdeG.appendChild(cizgi('M 0 118 L 0 124', { w: 3 }));
  } else if (geyim === 'koynek') {
    for (const s of [-1, 1]) parca(govdeG, `M ${s * 16} -6 L ${s * 32} -12 L ${s * 30} 22 L ${s * 6} 16 Z`, ton(icR, 0.06), { xett: 3.2 });
    govdeG.appendChild(cizgi(`M 0 14 L 0 ${gH}`, { w: 2.6, renk: ton(icR, -0.3) }));
    for (const y of [40, 90, 140, 190]) govdeG.appendChild(dair(4, y, 3.2, { fill: ton(icR, -0.3) }));
  } else if (geyim === 'forma') {
    const f2 = spec.forma2 ?? '#e8772b';
    parca(govdeG, `M -34 -10 C ${-w + 30} -8 ${-w + 4} 0 ${-w} 22 L ${-w - 2} 66 L ${w + 2} 66 L ${w} 22 C ${w - 4} 0 ${w - 30} -8 34 -10 Z`, f2, { kolge: 'M 40 -20 L 120 -20 L 120 80 L 50 80 Z' });
    parca(govdeG, `M ${-w - 2} 74 L ${w + 2} 74 L ${w + 2} 90 L ${-w - 2} 90 Z`, '#c9cdd2', { xett: 3 });
    for (const s of [-1, 1]) parca(govdeG, `M ${s * 14} -10 L ${s * 34} -16 L ${s * 34} 14 L ${s * 10} 18 Z`, ton(ust, -0.1), { xett: 3.2 });   // yaxa
    govdeG.appendChild(cizgi(`M 0 0 L 0 ${gH + 4}`, { w: 3 }));       // zəncir
    parca(govdeG, 'M 22 110 L 70 110 L 70 160 L 22 160 Z', ust, { xett: 3 }); govdeG.appendChild(cizgi('M 22 122 L 70 122', { w: 3 }));
    if (spec.formaYazi) { const t = el('text', { x: 46, y: 104, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 13, fill: '#ffffff' }); t.textContent = spec.formaYazi; govdeG.appendChild(t); }
  }
  if (spec.onluk) {
    const o = spec.onluk, oy = 54, oH = 470;
    for (const s of [-1, 1]) govdeG.appendChild(cizgi(`M ${s * 44} ${oy} L ${s * 30} -8`, { w: 9, renk: ton(o, -0.3) }));
    parca(govdeG, `M -52 ${oy} L 52 ${oy} L 56 ${oy + 170} C 76 ${oy + 190} 84 ${oy + 230} 86 ${oH} L -86 ${oH} C -84 ${oy + 230} -76 ${oy + 190} -56 ${oy + 170} Z`, o,
      { kolge: `M 30 ${oy - 10} L 100 ${oy - 10} L 100 ${oH + 10} L 50 ${oH + 10} C 60 300 40 200 30 ${oy - 10} Z` });
    govdeG.appendChild(cizgi(`M -56 ${oy + 170} L 56 ${oy + 170}`, { w: 3, renk: ton(o, -0.3) }));
    if (spec.onlukLogo) { const t = el('text', { x: 0, y: oy + 110, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 64, fill: '#3a2414' }); t.textContent = spec.onlukLogo; govdeG.appendChild(t); }
  }

  // ── QOLLAR ──
  const qolQ = (s, K) => {
    const p = q(), u = q(), a = q();
    parca(u, kapsul(S.L1, 52, 44), qolRenk, { xett: 0, kolge: s > 0 ? `M 6 -10 L 40 -10 L 40 ${S.L1 + 20} L 8 ${S.L1 + 20} Z` : `M 10 -10 L 40 -10 L 40 ${S.L1 + 20} L 12 ${S.L1 + 20} Z` });
    u.appendChild(cizgi(kapsulYan(S.L1, 52, 44) + ` M -26 0 A 26 20 0 0 1 26 0`, { w: LW }));
    if (spec.geyim === 'forma') parca(u, `M -26 30 L 26 30 L 25 46 L -25 46 Z`, '#c9cdd2', { xett: 2.6 });
    if (spec.geyim === 'forma') parca(u, `M -26 -4 C -20 -24 20 -24 26 -4 L 26 18 L -26 18 Z`, spec.forma2 ?? '#e8772b', { xett: 3 });
    parca(a, kapsul(S.L2, 44, 38), qolRenk, { kolge: `M 8 -10 L 40 -10 L 40 ${S.L2 + 10} L 8 ${S.L2 + 10} Z` });
    if (spec.geyim === 'pencek') parca(a, `M -20 ${S.L2 - 12} L 20 ${S.L2 - 12} L 19 ${S.L2 + 2} L -19 ${S.L2 + 2} Z`, icR, { xett: 3 });   // manjet
    a.appendChild(cizgi(`M ${-s * 6} 20 C ${-s * 2} 40 ${-s * 8} 60 ${-s * 4} 80`, { w: 2.2, renk: ton(qolRenk, -0.3), op: 0.6 }));   // büzüş
    const eG = q(); tr(eG, { y: S.L2 + 2 }); a.appendChild(eG);
    tr(a, { y: S.L1 }); u.insertBefore(a, u.firstChild); p.appendChild(u);
    Object.assign(K, { p, ust: u, alt: a, elG: eG, s, poza: null, esya: null });
  };
  qolQ(-1, kolL); qolQ(1, kolR);
  const elQur = (K, poza = 'acik', esya = null) => {
    if (K.poza === poza && K.esya === esya) return; K.poza = poza; K.esya = esya;
    K.elG.innerHTML = ''; ic0 = -K.s * 10; const kk = el_(ten, K.s, poza, esya); K.elG.appendChild(kk); K.esyaG = kk.firstChild;
  };

  // ── BAŞ ──
  const bas = q(), basIc = q(), arxaSac = q(), uz = q(), onSac = q();
  // boyun
  const boyun = q(); tr(boyun, { y: S.boyun });
  parca(boyun, 'M -27 -56 L -29 16 C -10 24 10 24 28 16 L 26 -46 Z', ten, { kolge: 'M -30 -46 C -10 -20 10 -20 30 -46 L 30 -10 C 10 6 -10 6 -30 -10 Z', kolgeRenk: tk });
  tr(bas, { y: S.basM, sx: S.BAS, sy: S.BAS });
  bas.appendChild(arxaSac);
  // qulaqlar
  const qulaq = [];
  for (const s of [-1, 1]) { const qq = q(); parca(qq, `M ${s * 72} -20 C ${s * 92} -30 ${s * 100} -2 ${s * 94} 18 C ${s * 90} 34 ${s * 78} 38 ${s * 70} 30 Z`, ten, { kolge: `M ${s * 76} -10 C ${s * 88} -8 ${s * 90} 14 ${s * 84} 24 L ${s * 70} 30 Z`, kolgeRenk: tk });
    qq.appendChild(cizgi(`M ${s * 80} -8 C ${s * 90} -4 ${s * 90} 14 ${s * 82} 22`, { w: 2.6, renk: tkk })); bas.appendChild(qq); qulaq.push(qq); }
  // üz forması
  const uzD = 'M 0 -100 C 48 -100 78 -72 80 -22 C 82 10 78 40 68 62 C 56 86 30 104 0 106 C -30 104 -56 86 -68 62 C -78 40 -82 10 -80 -22 C -78 -72 -48 -100 0 -100 Z';
  parca(bas, uzD, ten, { kolge: 'M 44 -70 C 72 -54 84 -6 78 36 C 70 74 44 100 8 106 L 100 120 L 100 -100 Z', kolgeRenk: tk, isiq: 'M -50 -60 C -60 -40 -62 -20 -58 0 C -50 -20 -46 -40 -40 -56 Z' });
  bas.appendChild(basIc);
  // saqqal
  const sqR = spec.saqqalRenk ?? sR;
  if (spec.saqqal) {
    const d = 'M -80 -24 C -82 20 -74 66 -50 94 C -30 116 30 116 50 94 C 74 66 82 20 80 -24 L 71 -24 C 72 4 68 28 54 44 C 44 54 36 58 28 60 C 16 55 -16 55 -28 60 C -36 58 -44 54 -54 44 C -68 28 -72 4 -71 -24 Z';
    parca(basIc, d, sqR, { kolge: 'M 40 0 C 80 10 84 60 60 90 L 100 120 L 100 -40 Z', kolgeRenk: ton(sqR, -0.25), isiq: 'M -60 30 C -56 60 -44 80 -30 92 C -40 70 -50 50 -54 30 Z', isiqRenk: ton(sqR, 0.12) });
    for (const [x, y] of [[-50, 60], [-30, 84], [30, 84], [50, 60], [0, 96], [-64, 30], [64, 30]]) basIc.appendChild(cizgi(`M ${x} ${y} l ${x > 0 ? -4 : 4} 8`, { w: 2, renk: ton(sqR, -0.35) }));
  }
  // yaş qırışları
  if (spec.yas) {
    for (const y of [-62, -50]) uz.appendChild(cizgi(`M -36 ${y} C -12 ${y - 6} 12 ${y - 6} 36 ${y}`, { w: 2.2, renk: tkk, op: 0.55 * spec.yas }));
    for (const s of [-1, 1]) { uz.appendChild(cizgi(`M ${s * 20} 22 C ${s * 24} 26 ${s * 36} 26 ${s * 44} 20`, { w: 2, renk: tkk, op: 0.5 * spec.yas }));
      uz.appendChild(cizgi(`M ${s * 58} -6 l ${s * 8} -4 M ${s * 58} 2 l ${s * 9} 0`, { w: 2, renk: tkk, op: 0.5 * spec.yas })); }
  }
  // GÖZLƏR
  const gozler = [];
  for (const s of [-1, 1]) {
    const G = q(); tr(G, { x: s * 31, y: -4, sx: 1.22, sy: 1.22 }); uz.appendChild(G);
    const id = `gz${++UID}`, alm = 'M -17 1 C -11 -11 11 -12 17 -1 C 11 8 -11 9 -17 1 Z';
    const cp = el('clipPath', { id }); cp.appendChild(yol2(alm)); G.appendChild(el('defs', {}, cp));
    G.appendChild(yol2(alm, { fill: '#fbf9f5' }));
    const ic = q(); ic.setAttribute('clip-path', `url(#${id})`); G.appendChild(ic);
    const iris = q(); ic.appendChild(iris);
    iris.appendChild(dair(0, 0, 8.6, { fill: spec.gozRenk ?? '#5a3a22' })); iris.appendChild(dair(0, 0, 8.6, { fill: 'none', stroke: '#2a1a10', 'stroke-width': 1.6 }));
    iris.appendChild(dair(0, 0, 4.2, { fill: '#140c08' })); iris.appendChild(dair(-2.6, -3, 2.3, { fill: '#ffffff' }));
    const qapaq = duzb(-20, -16, 40, 0, 0, { fill: ten }); ic.appendChild(qapaq);
    G.appendChild(cizgi('M -18 2 C -12 -12 12 -13 19 -2 L 22 -5', { w: 4.6 }));     // üst qapaq xətti
    G.appendChild(cizgi('M -12 6 C -4 10 6 10 14 4', { w: 1.8, renk: tkk, op: 0.8 })); // alt qapaq
    const qasG = q(); tr(qasG, { x: s * 32, y: -34 }); uz.appendChild(qasG);
    qasG.appendChild(yol2(s > 0 ? 'M -20 4 C -8 -6 10 -8 25 2 C 12 -1 -6 -1 -19 9 Z' : 'M 20 4 C 8 -6 -10 -8 -25 2 C -12 -1 6 -1 19 9 Z', { fill: spec.qas ?? ton(sR, -0.1), stroke: OL, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }));
    gozler.push({ G, iris, qapaq, qasG, s });
  }
  if (spec.eynek) for (const s of [-1, 1]) uz.appendChild(el('rect', { x: s * 32 - 24, y: -22, width: 48, height: 34, rx: 10, fill: 'none', stroke: spec.eynek, 'stroke-width': 4 }));
  // BURUN
  uz.appendChild(yol2('M 6 -4 C 10 10 14 24 16 34 C 12 40 6 40 4 38 Z', { fill: tk, opacity: 0.8 }));
  uz.appendChild(cizgi('M -14 34 C -10 42 -4 43 0 40 C 4 43 10 42 14 34', { w: 3.4 }));
  uz.appendChild(cizgi('M 16 34 C 18 28 16 24 12 22', { w: 2.4, renk: tkk }));
  // AĞIZ
  const agizG = q(); uz.appendChild(agizG);
  const agizId = `ag${++UID}`, agCP = el('clipPath', { id: agizId }), agCPyol = yol2(''); agCP.appendChild(agizCPdummy(agCPyol)); uz.appendChild(el('defs', {}, agCP));
  const agizIc = yol2('', { fill: '#5b2620' }), disler = q(), dil = ellips(0, 84, 14, 7, { fill: '#c45b57' });
  disler.setAttribute('clip-path', `url(#${agizId})`); const dis = duzb(-34, 56, 68, 11, 0, { fill: '#fbf8f2' }); disler.appendChild(dis); disler.appendChild(dil);
  const agizX = cizgi('', { w: 3.6 }), dodaq = cizgi('', { w: 2.4, renk: tkk, op: 0.7 }), yanaqL = cizgi('', { w: 2.4, renk: tkk }), yanaqR = cizgi('', { w: 2.4, renk: tkk });
  agizG.appendChild(agizIc); agizG.appendChild(disler); agizG.appendChild(agizX); agizG.appendChild(dodaq); uz.appendChild(yanaqL); uz.appendChild(yanaqR);
  // BIĞ
  const bigR = spec.bigRenk ?? sqR;
  if (spec.big && spec.big !== 'yox') {
    const d = spec.big === 'qalin' ? 'M -48 66 C -46 44 -18 40 0 48 C 18 40 46 44 48 66 C 40 60 30 58 20 60 C 12 62 6 64 0 63 C -6 64 -12 62 -20 60 C -30 58 -40 60 -48 66 Z'
      : spec.big === 'bugrum' ? 'M -54 58 C -44 40 -16 40 0 48 C 16 40 44 40 54 58 C 46 54 36 54 24 58 C 12 62 6 62 0 61 C -6 62 -12 62 -24 58 C -36 54 -46 54 -54 58 Z'
      : 'M -34 54 C -24 42 -8 44 0 48 C 8 44 24 42 34 54 C 26 54 14 54 0 56 C -14 54 -26 54 -34 54 Z';
    parca(uz, d, bigR, { kolge: 'M 0 54 L 60 54 L 60 70 L 0 70 Z', kolgeRenk: ton(bigR, -0.25), isiq: 'M -36 50 C -26 44 -12 44 -4 48 C -14 48 -26 50 -36 54 Z', isiqRenk: ton(bigR, 0.18), xett: 3.4 });
  }
  bas.appendChild(uz);
  // saç / kepka
  if (spec.sac && spec.sac !== 'kel') sacCiz(onSac, arxaSac, spec.sac, sR, spec);
  if (spec.kepka) {
    const k = spec.kepka, kr = k.renk ?? '#2d4f86', kz = k.kozyrek ?? '#e8772b';
    parca(onSac, 'M -86 -34 C -90 -100 -46 -132 0 -132 C 46 -132 90 -100 86 -34 C 40 -46 -40 -46 -86 -34 Z', kr,
      { kolge: 'M 30 -140 C 70 -120 90 -80 86 -34 L 110 -30 L 110 -150 Z', kolgeRenk: ton(kr, -0.2), isiq: 'M -60 -100 C -40 -118 -10 -124 10 -122 C -14 -114 -40 -104 -60 -90 Z' });
    onSac.appendChild(cizgi('M 0 -128 L 0 -48', { w: 2.4, renk: ton(kr, -0.35) })); parca(onSac, 'M -16 -96 L 0 -106 L 16 -96 L 16 -76 L 0 -66 L -16 -76 Z', kz, { xett: 2.6 });
    if (k.yazi) { const t = el('text', { x: 0, y: -54, 'text-anchor': 'middle', 'font-family': 'Archivo', 'font-weight': 800, 'font-size': 15, fill: '#ffffff' }); t.textContent = k.yazi; onSac.appendChild(t); }
    parca(onSac, 'M -88 -36 C -40 -52 50 -52 104 -36 C 112 -30 108 -18 96 -18 C 50 -28 -40 -28 -86 -22 Z', kz, { kolge: 'M -90 -26 L 110 -26 L 110 -10 L -90 -10 Z', kolgeRenk: ton(kz, -0.25) });
    onSac.appendChild(dair(0, -131, 6, { fill: kr, stroke: OL, 'stroke-width': 3 }));
  }
  bas.appendChild(onSac);

  // sıra: arxa qol? (yox, qollar önə) → ayaqlar → çanaq → gövdə → boyun → baş → qollar
  const govdeKok = q();
  g.appendChild(bac.L.p); g.appendChild(bac.R.p); g.appendChild(canaq);
  govdeKok.appendChild(boyun); govdeKok.appendChild(govdeG); govdeKok.appendChild(bas);
  govdeKok.appendChild(kolL.p); govdeKok.appendChild(kolR.p);
  g.appendChild(govdeKok);

  // ── İFADƏ ──
  const E = { gulus: 0.3, ac: 0, qas: 0, egim: 0, goz: 1, baxis: [0, 0], en: 1 };
  function uzYenile() {
    const a = clamp(E.ac), gu = clamp(E.gulus, -1, 1), wM = 25 * E.en * (1 + gu * 0.22 + a * 0.05), cy = 70 - gu * 7 + a * 2;
    const ust = 66 - a * 2 - gu * 2, alt_ = 70 + a * 28 + Math.max(0, gu) * 12;
    const d = `M ${-wM} ${cy} Q 0 ${ust - (gu > 0 ? 2 : -3)} ${wM} ${cy} Q 0 ${alt_ + 6} ${-wM} ${cy} Z`;
    if (a > 0.06 || gu > 0.55) {
      agizIc.setAttribute('d', d); agCPyol.setAttribute('d', d); agizX.setAttribute('d', d); disler.style.display = '';
      dil.setAttribute('cy', alt_ - 2); dis.setAttribute('y', ust - 6); dis.setAttribute('height', 9 + a * 4 + Math.max(0, gu) * 3);
    } else {
      agizIc.setAttribute('d', ''); disler.style.display = 'none';
      agizX.setAttribute('d', `M ${-wM} ${cy} Q 0 ${68 + gu * 10} ${wM} ${cy}`);
    }
    dodaq.setAttribute('d', `M -10 ${alt_ + 12} Q 0 ${alt_ + 16} 10 ${alt_ + 12}`);
    const yk = Math.max(0, gu);
    yanaqL.setAttribute('d', yk > 0.2 ? `M -30 46 C -40 56 -40 68 -32 78` : ''); yanaqR.setAttribute('d', yk > 0.2 ? `M 30 46 C 40 56 40 68 32 78` : '');
    yanaqL.setAttribute('opacity', yk); yanaqR.setAttribute('opacity', yk);
    for (const G of gozler) {
      const ac2 = clamp(E.goz) * (1 - Math.max(0, gu - 0.6) * 0.35);
      G.qapaq.setAttribute('height', Math.max(0, (1 - ac2) * 24));
      tr(G.iris, { x: E.baxis[0] * 6, y: E.baxis[1] * 4 }); tr(G.G, { x: G.s * 31, y: -4, sx: 1.22, sy: 1.22 });
      tr(G.qasG, { x: G.s * 32, y: -36 - E.qas * 8 + (1 - clamp(E.goz)) * 3, r: G.s * E.egim * 14, ox: 0, oy: 0 });
    }
  }
  uzYenile();

  const B = spec.boy ?? 1;
  const api = {
    g, bas, uz, spec, kolL, kolR, bac, skelet: S,
    ifade(x = {}) { Object.assign(E, x); uzYenile(); },
    elPoza(tərəf, poza, esya = null) { elQur(tərəf === 'L' ? kolL : kolR, poza, esya); },
    poz(o = {}) {
      const { kolL: kl = null, kolR: kr = null, bacL: bl = null, bacR: br = null, elL = null, elR = null,
        govdeEg = 0, basEg = 0, basDon = 0, nefes = 0, yuru = null, siddet = 1, t = null, x = 0, y = 0, cevir = 1, danis = 0 } = o;
      const w2 = yuru === null ? null : Math.sin(yuru) * siddet, sal = yuru === null ? 0 : Math.abs(Math.cos(yuru)) * 8 * siddet;
      tr(g, { x, y: y - sal, sx: B * cevir, sy: B });
      const nf = nefes * 2.4;
      tr(govdeKok, { y: -nf * 0.5, r: govdeEg * 8 + (w2 ?? 0) * 1.2, ox: 0, oy: S.omba });
      tr(govdeG, { y: S.ciyin, sy: 1 + nefes * 0.006 });
      tr(boyun, { y: S.boyun - nf * 0.4 });
      tr(bas, { y: S.basM - nf * 0.6, r: basEg * 14 + (w2 ?? 0) * -1.2, ox: 0, oy: 110, sx: S.BAS, sy: S.BAS });
      tr(uz, { x: basDon * 14 });
      tr(onSac, { x: basDon * 5 }); tr(arxaSac, { x: basDon * -3 });
      qulaq[0].setAttribute('transform', `translate(${basDon * (basDon > 0 ? 10 : 4)} 0)`); qulaq[1].setAttribute('transform', `translate(${basDon * (basDon < 0 ? 10 : 4)} 0)`);
      // qollar: çiyin + kənara, dirsək + içəri
      const cL = kl ? kl[0] : (w2 !== null ? 3 + w2 * 7 : 3), dL = kl ? kl[1] : (w2 !== null ? 10 + Math.max(0, w2) * 14 : 8);
      const cR = kr ? kr[0] : (w2 !== null ? 3 - w2 * 7 : 3), dR = kr ? kr[1] : (w2 !== null ? 10 + Math.max(0, -w2) * 14 : 8);
      tr(kolL.p, { x: -S.ciyinX * kok, y: S.ciyin + 16 - nf * 0.5, r: cL });
      tr(kolR.p, { x: S.ciyinX * kok, y: S.ciyin + 16 - nf * 0.5, r: -cR });
      // dirsək çox bükülürsə qol kameraya doğru gəlir → ön qolu qısalt (perspektiv), əli bərpa et
      const qs = (d) => clamp(1 - Math.max(0, d - 75) / 80 * 0.45, 0.55, 1);
      const sL = qs(dL), sR2 = qs(dR);
      tr(kolL.alt, { y: S.L1, r: -dL, sy: sL }); tr(kolR.alt, { y: S.L1, r: dR, sy: sR2 });
      tr(kolL.elG, { y: S.L2 + 2, sy: 1 / sL }); tr(kolR.elG, { y: S.L2 + 2, sy: 1 / sR2 });
      elQur(kolL, elL?.[0] ?? elL ?? kolL.poza ?? 'acik', elL?.[1] ?? (Array.isArray(elL) ? null : kolL.esya));
      elQur(kolR, elR?.[0] ?? elR ?? kolR.poza ?? 'acik', elR?.[1] ?? (Array.isArray(elR) ? null : kolR.esya));
      // əşya həmişə dik qalsın (qolun ümumi dönməsini kompensasiya et)
      if (kolL.esyaG) tr(kolL.esyaG, { r: -(cL - dL) });
      if (kolR.esyaG) tr(kolR.esyaG, { r: -(-cR + dR) });
      // ayaqlar — öndən görünüşdə yeriş: diz qalxır (baldır qısalır), yan yırğalanma kiçik
      if (w2 !== null && !bl && !br) {
        const lL = Math.max(0, w2), lR = Math.max(0, -w2);
        tr(bac.L.p, { x: -S.ombaX * kok, y: S.omba - lL * 12, r: 1.5 + w2 * 2 });
        tr(bac.R.p, { x: S.ombaX * kok, y: S.omba - lR * 12, r: -1.5 + w2 * 2 });
        tr(bac.L.alt, { y: S.ayaqL1 - lL * 6, sy: 1 - lL * 0.14 }); tr(bac.R.alt, { y: S.ayaqL1 - lR * 6, sy: 1 - lR * 0.14 });
      } else {
        tr(bac.L.p, { x: -S.ombaX * kok, y: S.omba, r: bl ? bl[0] : 1.5 });
        tr(bac.R.p, { x: S.ombaX * kok, y: S.omba, r: br ? -br[0] : -1.5 });
        tr(bac.L.alt, { y: S.ayaqL1, r: bl ? bl[1] : 0 }); tr(bac.R.alt, { y: S.ayaqL1, r: br ? -br[1] : 0 });
      }
      if (t !== null) {
        const k = (t % 3.7) / 3.7, bl2 = k < 0.045 ? 1 - Math.abs(k - 0.0225) / 0.0225 : 0, gz = E.goz;
        const ac0 = E.ac; if (danis) E.ac = clamp((Math.abs(Math.sin(t * 10.5)) * 0.55 + Math.abs(Math.sin(t * 6.3 + 1)) * 0.3) * danis);
        if (bl2 > 0) E.goz = gz * (1 - bl2);
        uzYenile(); E.goz = gz; E.ac = ac0;
      }
    },
    yeri(t, { hiz = 2.0, siddet = 1, x = 0, y = 0, cevir = 1, ...ext } = {}) {
      api.poz({ yuru: t * hiz * Math.PI, siddet, x, y, cevir, nefes: Math.sin(t * 2), t, ...ext });
    },
  };
  api.poz({});
  return api;
}
function agizCPdummy(p) { return p; }
