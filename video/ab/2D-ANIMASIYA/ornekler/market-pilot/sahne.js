// Market pilot: 2 personaj (Azərbaycanlı görünüşlü), 3 plan. Plan = { qat:{uzaq,orta,on}, guncelle(tl), kamera(tl) }.
import { clamp, lerp, easeInOut, q } from './kit/kadr.js';
import { sahibkar, ekspeditor } from './kit/komanda.js';

import { yonet2d } from './kit/yonet2d.js';
import { PLAN } from './veri.js';

const satici = () => sahibkar({ boy: 1.0 });   // marketin sahibi
const tedarukcu = () => ekspeditor({ boy: 1.05 });   // tədarükçü ekspeditoru
const YER = 1900, YER2 = 1840;   // YER2: piştaxta arxasında dayanan personaj (ayaqları gizlənir)

function market(ctx, isiq = 'gunduz') {
  const m = ctx.mekan('market', { isiq });
  const a = satici(), t = tedarukcu();
  m.on.insertBefore(a.g, m.on.firstChild); m.on.appendChild(t.g);   // satıcı piştaxtanın ARXASINDA (ilk uşaq), tədarükçü qabağında
  return { m, a, t, qat: { uzaq: m.uzaq, orta: m.orta, on: m.on } };
}

yonet2d(PLAN, {
  giris(ctx) {
    const { a, t, qat } = market(ctx); const Pn = ctx.seg('giris');
    a.ifade({ gulus: 0.1, qas: 0.4, baxis: [0.6, 0] }); t.ifade({ gulus: 0.3, baxis: [-0.6, 0] });
    return { qat,
      guncelle(tl) {
        const u = easeInOut(clamp(tl / 1.6));
        a.poz({ x: 330, y: YER2, kolL: [12, 150], elL: ['tutma', 'bloknot'], kolR: [8, 145], elR: ['tutma', 'qelem'], basEg: 0.05, basDon: 0.3, nefes: Math.sin(tl * 2), t: tl });
        if (u < 1) t.yeri(tl, { x: lerp(1250, 790, u), y: YER, hiz: 2.2, kolL: [12, 148], elL: ['tutma', 'qovluq'] });
        else t.poz({ x: 790, y: YER, kolL: [12, 148], elL: ['tutma', 'qovluq'], kolR: [35 + Math.sin(tl * 3) * 10, 60], elR: 'isare', basDon: -0.4, nefes: Math.sin(tl * 2), t: tl, danis: 1 });
      },
      kamera: (tl) => ({ x: lerp(30, 0, clamp(tl / 4)), y: 0, z: lerp(1.0, 1.06, clamp(tl / 4)) }) };
  },
  say(ctx) {
    const { a, t, qat } = market(ctx); const Pn = ctx.seg('say');
    a.ifade({ gulus: -0.5, qas: 0.5, egim: -0.4, baxis: [0.2, 0.6] }); t.ifade({ gulus: 0, qas: 0.2, baxis: [-0.7, 0] });
    return { qat,
      guncelle(tl) {
        a.poz({ x: 400, y: YER2, kolL: [12, 150], elL: ['tutma', 'bloknot'], kolR: [8, 140 + Math.sin(tl * 5) * 8], elR: ['tutma', 'qelem'], basEg: 0.18, basDon: 0.2, nefes: Math.sin(tl * 2), t: tl });
        t.poz({ x: 800, y: YER, kolL: [12, 148], elL: ['tutma', 'qovluq'], kolR: [4, 10], basEg: -0.05, basDon: -0.5, nefes: Math.sin(tl * 2 + 1), t: tl });
      },
      kamera: (tl) => ({ x: lerp(-60, 40, clamp(tl / 6)), y: 0, z: lerp(1.12, 1.2, clamp(tl / 6)) }) };
  },
  hell(ctx) {
    const { a, qat } = market(ctx, 'gunduz'); const Pn = ctx.seg('hell');
    a.ifade({ gulus: 0.8, qas: 0.4, baxis: [0, 0] });
    return { qat,
      guncelle(tl) { a.poz({ x: 540, y: YER2, kolL: [4, 8], kolR: [40 + Math.sin(tl * 4) * 6, 70], elR: 'isare', basEg: -0.05, nefes: Math.sin(tl * 2), t: tl, danis: 1 }); },
      kamera: (tl) => ({ x: 0, y: 0, z: lerp(1.15, 1.0, clamp(tl / 3)) }) };
  },
});
