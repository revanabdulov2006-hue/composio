// Sprite personaj: referans şəkildən kəsilmiş (baş + bədən). Karakter API-si ilə uyğundur: g, poz, ifade, yeri.
// Baş boyun nöqtəsində əyilir (basEg/basDon), bədən nəfəs/yırğalanma/yeriş ilə hərəkət edir. Qol-əl ayrı hərəkət ETMİR (kəsik şəkil).
import { el, q, tr, clamp } from './kadr.js';
const NS = 'http://www.w3.org/1999/xlink';
let META = null; const ZIMN = [];
export async function metaYukle(baza = './kit/sprites') { if (!META) META = await (await fetch(`${baza}/meta.json`)).json(); return META; }
export const hazir = () => Promise.all(ZIMN);
const sekil = (href, w, h) => { const im = el('image', { href, width: w, height: h, preserveAspectRatio: 'none' });
  ZIMN.push(new Promise((ok) => { const i = new Image(); i.onload = i.onerror = ok; i.src = href; })); return im; };

export function sprayt(ad, spec = {}) {
  const M = META?.[ad]; if (!M) throw new Error(`[sprayt] meta yoxdur: ${ad} (əvvəl await metaYukle())`);
  const baza = spec.baza ?? './kit/sprites', s = spec.boy ?? 1.0;
  const g = q(), kok = q(), beden = q(), bas = q();
  const px = M.boyunX - M.w / 2, py = -M.h + M.boyunY;               // boyun pivotu (ayaq mərkəzinə nəzərən)
  const bi = sekil(`${baza}/${ad}-beden.png`, M.w, M.h - M.bedenY); tr(bi, { x: -M.w / 2, y: -M.h + M.bedenY }); beden.appendChild(bi);
  const hi = sekil(`${baza}/${ad}-bas.png`, M.w, M.basH); tr(hi, { x: -M.w / 2, y: -M.h }); bas.appendChild(hi);
  kok.appendChild(beden); kok.appendChild(bas); g.appendChild(kok);
  const api = {
    g, spec, bas, govde: beden, el: {},
    ifade() {},   // sabit üz (kəsik şəkil). İfadə lazımdırsa referansdan yeni baş şəkli yarat → karakterler/sprites
    poz(o = {}) {
      const { basEg = 0, basDon = 0, govdeEg = 0, nefes = 0, yuru = null, siddet = 1, x = 0, y = 0, cevir = 1 } = o;
      const w = yuru === null ? 0 : Math.sin(yuru) * siddet, sal = yuru === null ? 0 : Math.abs(Math.cos(yuru)) * 9 * siddet;
      tr(g, { x, y: y - sal, sx: s * cevir, sy: s });
      tr(kok, { r: govdeEg * 40 + w * 2.2, ox: 0, oy: 0 });
      tr(beden, { sy: 1 + nefes * 0.006, ox: 0, oy: 0 });
      tr(bas, { x: 0, y: -nefes * 1.2, r: basEg * 18 + basDon * 6 + w * -1.4, ox: px, oy: py });
    },
    yeri(t, { hiz = 2.2, siddet = 1, x = 0, y = 0, cevir = 1, basEg = 0, basDon = 0 } = {}) { api.poz({ yuru: t * hiz * Math.PI, siddet, x, y, cevir, basEg, basDon, nefes: Math.sin(t * 2) }); },
  };
  api.poz({}); return api;
}
