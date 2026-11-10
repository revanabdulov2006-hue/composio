// Ya Olsaydı — yazı katmanı (DOM, 3D'nin üstünde): BAŞLIK, HUD, ALTYAZI, SORU/bitiş kartı.
// Konumlar ve boyutlar referanstan ölçüldü (../preset/referans-analizi.md § 7–8). Zamanlar veri.js'teki PLAN'dan gelir.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
const TR = 'tr-TR';

export const CSS = `
/* ── AsanBiznesim motion qatı: pill etiket, iki-çəkili başlıq, söz-söz build, marker vurğu ── */
.ab-pill { position:absolute; left:0; right:0; text-align:center; }
.ab-pill span { display:inline-block; background:rgba(14,21,18,0.62); border:1px solid rgba(255,255,255,0.14);
  color:#dfe9e2; font-family:'Geist'; font-weight:600; font-size:26px; letter-spacing:0.16em; text-transform:uppercase;
  padding:12px 22px; border-radius:999px; backdrop-filter:blur(6px); }
.ab-bas { position:absolute; left:80px; right:80px; text-align:center; font-family:'Archivo'; color:#ffffff;
  font-size:104px; line-height:1.08; letter-spacing:-0.015em; text-shadow:0 4px 26px rgba(0,0,0,0.5); }
.ab-bas .w { display:inline-block; margin:0 0.12em; will-change:transform,opacity,filter; }
.ab-bas .ince { font-weight:500; opacity:0.93; }
.ab-bas .qalin { font-weight:800; }
.ab-bas .ys { color:#7BD86A; }
.ab-mark { position:relative; display:inline-block; }
.ab-mark i { position:absolute; left:-0.08em; right:-0.08em; top:0.14em; bottom:0.08em; background:#55B848;
  border-radius:8px; transform-origin:left center; z-index:-1; opacity:0.92; }
.ab-alt { position:absolute; left:84px; right:84px; text-align:center; font-family:'Archivo'; font-weight:700;
  font-size:44px; line-height:1.2; color:#ffffff; text-shadow:0 3px 20px rgba(0,0,0,0.72); }
.ab-flash { position:absolute; inset:0; background:#fff; opacity:0; pointer-events:none; }
.ab-blob { position:absolute; left:50%; top:50%; width:10px; height:10px; margin:-5px 0 0 -5px; border-radius:50%;
  background:radial-gradient(circle, #9BEA86 0%, #55B848 55%, #2E7D32 100%); opacity:0; pointer-events:none; }
.yo-baslik { position:absolute; left:80px; right:80px; text-align:center; font-family:'Archivo'; font-weight:800; color:#fff; font-size:92px; line-height:1.1; text-shadow:0 4px 26px rgba(0,0,0,0.55); }
.yo-baslik .vurgu { color:inherit; }
.yo-soru { position:absolute; left:90px; right:90px; top:900px; text-align:center; font-family:'Archivo'; font-weight:800; color:#7BD86A; font-size:66px; line-height:1.15; text-shadow:0 4px 22px rgba(0,0,0,0.6); }
`;
export const CSS_ESKI = `
.yo-baslik { position:absolute; left:90px; right:90px; text-align:center; font-family:'Archivo'; font-weight:800; color:#fbf8f2;
  font-size:66px; line-height:1.22; letter-spacing:0.002em; text-shadow:0 2px 14px rgba(0,0,0,0.42), 0 1px 3px rgba(0,0,0,0.35); }
.yo-baslik .vurgu { color:var(--vurgu,#7BD86A); }
.yo-hud { position:absolute; left:66px; top:868px; color:#fbf8f2; text-shadow:0 1px 10px rgba(0,0,0,0.55), 0 0 3px rgba(0,0,0,0.35); }
.yo-hud .et { font-family:'Geist'; font-weight:600; font-size:19px; letter-spacing:0.17em; text-transform:uppercase; }
.yo-hud .dg { font-family:'Archivo'; font-weight:800; font-size:60px; line-height:1.0; margin-top:6px; font-variant-numeric:lining-nums tabular-nums; }
.yo-hud .al { font-family:'Geist'; font-weight:600; font-size:15px; letter-spacing:0.15em; text-transform:uppercase; margin-top:10px; opacity:0.95; }
.yo-alt { position:absolute; left:70px; right:70px; top:1262px; text-align:center; font-family:'Archivo'; font-weight:800;
  font-size:42px; line-height:1.18; color:#fbf8f2; text-shadow:0 2px 16px rgba(0,0,0,0.62), 0 0 4px rgba(0,0,0,0.42), 0 1px 2px rgba(0,0,0,0.5); }
.yo-soru { position:absolute; left:80px; right:80px; top:1086px; text-align:center; font-family:'Archivo'; font-weight:800;
  font-size:42px; color:var(--vurgu,#7BD86A); text-shadow:0 1px 8px rgba(0,0,0,0.35); }
`;

/** "Ya bugün [Allah'ın] huzuruna çıksaydın?" → köşeli parantezli kısım vurgu rengini alır; \n satır böler. */
export function vurguHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\[(.+?)\]/g, '<span class="vurgu">$1</span>').replace(/\n/g, '<br>');
}

/** Sayıyı Türkçe binlik noktayla yazar (TDK: beş basamaktan itibaren). */
export function sayiYaz(n, { ondalik = 0 } = {}) {
  const s = Number(n).toLocaleString(TR, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik });
  return Math.abs(n) < 10000 && !ondalik ? String(Math.round(n)) : s;
}
/** Saati "21.47" biçiminde (TDK: saat noktayla). */
export function saatYaz(dk) { dk = ((Math.floor(dk) % 1440) + 1440) % 1440; return `${String(Math.floor(dk / 60)).padStart(2, '0')}.${String(dk % 60).padStart(2, '0')}`; }

/** Geri sayım: saniye → "06.58" (dakika.saniye). */
export function sureYaz(sn) { sn = Math.ceil(sn); return `${String(Math.floor(sn / 60)).padStart(2, '0')}.${String(sn % 60).padStart(2, '0')}`; }

const SEMBOL = '0123456789?';
function karistir(s, t, seed = 1) {
  return s.replace(/[0-9]/g, (c, i) => SEMBOL[Math.floor(Math.abs(Math.sin((Math.floor(t * 24) + i * 7.3 + seed) * 12.9898) * 43758.5453)) % SEMBOL.length]);
}

/**
 * Katmanı kurar. plan: {baslik:{metin, s, e}, hud:[{s, e, etiket, deger, alt, tur, ...}], alt:[{metin, s, e}], kart:{s, baslik, soru}}
 * HUD değer türleri: 'sabit' (deger), 'saat' {dk0, hiz (dk/s)}, 'sayac' {a, b, ease, ondalik, ek}, 'karisik' (deger rakamları
 * kayar, '??.??' gibi), 'geri' (a→b sayar). Döner: guncelle(t).
 */
export function katman(root, plan, { vurgu = '#e6c98e' } = {}) {
  root.style.setProperty('--vurgu', vurgu);
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const el = (cls, html = '') => { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; root.appendChild(d); return d; };

  // AB motion başlıq: sözləri ayrı-ayrı qablaşdır (söz-söz build), [...] = marker vurğu, *...* = qalın
  const sozlereBol = (metin) => metin.split('\n').map((sətir) => sətir.split(/\s+/).filter(Boolean).map((w) => {
    const mark = /^\[(.+)\]$/.exec(w), qalin = /^\*(.+)\*$/.exec(w);
    const soz = mark ? mark[1] : qalin ? qalin[1] : w;
    const cls = mark ? 'w qalin' : qalin ? 'w qalin ys' : 'w ince';
    return mark ? `<span class="${cls}"><span class="ab-mark"><i></i>${soz}</span></span>`
                : `<span class="${cls}">${soz}</span>`;
  }).join(' ')).join('<br>');
  const AB = plan.baslik && plan.baslik.ab !== false;
  const B = plan.baslik ? el(AB ? 'ab-bas' : 'yo-baslik', AB ? sozlereBol(plan.baslik.metin) : vurguHTML(plan.baslik.metin)) : null;
  const pill = plan.baslik?.etiket ? el('ab-pill', `<span>${plan.baslik.etiket}</span>`) : null;
  const flash = el('ab-flash'), blob = el('ab-blob');
  const sozler = B ? [...B.querySelectorAll('.w')] : [], markerlar = B ? [...B.querySelectorAll('.ab-mark i')] : [];
  if (B) B.style.top = `${plan.baslik.y ?? 440}px`;
  if (pill) pill.style.top = `${(plan.baslik.y ?? 440) - 86}px`;
  const hud = el('yo-hud', '<div class="et"></div><div class="dg"></div><div class="al"></div>');
  const [hEt, hDg, hAl] = hud.children;
  const alt = el('ab-alt'); alt.style.top = '1262px';
  const kartB = plan.kart ? el('yo-baslik', vurguHTML(plan.kart.baslik ?? plan.baslik?.metin ?? '')) : null;
  if (kartB) { kartB.style.top = `${plan.kart.y ?? 588}px`; kartB.querySelectorAll('.vurgu').forEach((v) => (v.style.color = 'inherit')); }
  const soru = plan.kart?.soru ? el('yo-soru', vurguHTML(plan.kart.soru)) : null;

  let sonAlt = null;
  return function guncelle(t) {
    // BAŞLIK: hook'ta görünür, ilk cümle bitince söner (referans: ~0,3 s'lik yumuşak sönüş)
    if (B) { const b = plan.baslik; const cik = 1 - ease((t - b.e) / (b.cikis ?? 0.35));
      B.style.display = cik > 0.001 ? 'block' : 'none'; B.style.opacity = cik.toFixed(3);
      if (pill) { const pa = ease((t - b.s - 0.08) / 0.3) * cik; pill.style.opacity = pa.toFixed(3); pill.style.transform = `translateY(${(1 - pa) * 14}px)`; pill.style.display = pa > 0.001 ? 'block' : 'none'; }
      const ADD = b.sozAddim ?? 0.085, BAS = b.s + (b.sozGecik ?? 0.2);
      sozler.forEach((w, i) => { const u = ease((t - (BAS + i * ADD)) / 0.34);
        w.style.opacity = u.toFixed(3); w.style.transform = `translateY(${(1 - u) * 26}px)`; w.style.filter = u > 0.995 ? 'none' : `blur(${(1 - u) * 9}px)`; });
      markerlar.forEach((m, i) => { const u = ease((t - (BAS + (b.markerGecik ?? 0.45) + i * 0.12)) / 0.32); m.style.transform = `scaleX(${u})`; });
    }
    // keçid effektləri: flash (ağ) və glow-blob wipe (yaşıl körpü)
    { let fa = 0, ba = 0;
      for (const p of (plan.gecisler || [])) {
        if (p.tip === 'flash') fa = Math.max(fa, ease((t - (p.s - 0.1)) / 0.1) * (1 - ease((t - p.s) / 0.26)));
        if (p.tip === 'blob') { const u = clamp((t - p.s) / (p.sure ?? 0.6)); if (u > 0 && u < 1) { ba = Math.max(ba, 1); blob.style.transform = `scale(${Math.pow(u, 0.62) * 230})`; blob.style.opacity = (u < 0.75 ? 1 : 1 - (u - 0.75) / 0.25).toFixed(3); } }
      }
      flash.style.opacity = fa.toFixed(3); if (!ba) blob.style.opacity = '0';
    }
    // HUD
    const H = (plan.hud || []).find((h) => t >= h.s && t < h.e);
    if (H) {
      const gir = H.gir === false ? 1 : ease((t - H.s) / 0.3), cik = H.cik === false ? 1 : 1 - ease((t - (H.e - 0.3)) / 0.3);
      hud.style.opacity = Math.min(gir, cik).toFixed(3);
      hEt.textContent = H.etiket ?? ''; hAl.textContent = H.alt ?? '';
      let v = H.deger ?? '';
      const u = clamp((t - (H.ds ?? H.s)) / Math.max(0.01, (H.de ?? H.e) - (H.ds ?? H.s)));
      if (H.tur === 'saat') v = saatYaz(H.dk0 + (t - H.s) * (H.hiz ?? 1 / 60));
      if (H.tur === 'sayac' || H.tur === 'geri') { const k = H.ease === 'dogrusal' ? u : H.ease === 'yavas' ? 1 - Math.pow(1 - u, 3) : u * u * (3 - 2 * u); v = sayiYaz(H.a + (H.b - H.a) * k, { ondalik: H.ondalik ?? 0 }) + (H.ek ?? ''); }
      if (H.tur === 'geriSure') v = sureYaz(Math.max(0, H.a - (t - (H.s0 ?? H.s)) * (H.hiz ?? 1)));
      if (H.tur === 'ileriSure') v = sureYaz(Math.min(H.b ?? 1e9, (H.a ?? 0) + (t - (H.s0 ?? H.s)) * (H.hiz ?? 1)));
      if (H.tur === 'karisik') v = karistir(H.deger, t);
      if (H.tur === 'karisikSonra') v = t < (H.ks ?? H.s) ? (H.once ?? H.deger) : (t < (H.ks ?? H.s) + (H.kd ?? 0.6) ? karistir(H.once ?? H.deger, t) : H.deger);
      hDg.textContent = v;
    } else hud.style.opacity = '0';
    // ALTYAZI: cümle başında bütün olarak açılır, sonunda söner
    const A = (plan.alt || []).find((a) => t >= a.s - 0.05 && t < a.e);
    if (A) {
      if (sonAlt !== A) { alt.innerHTML = vurguHTML(A.metin); sonAlt = A; }
      const a = ease((t - A.s) / 0.22) * (1 - ease((t - (A.e - 0.2)) / 0.2));
      const gi = ease((t - A.s) / 0.3); alt.style.opacity = a.toFixed(3); alt.style.transform = `translateY(${((1 - gi) * 14).toFixed(2)}px)`; alt.style.filter = gi > 0.99 ? 'none' : `blur(${((1 - gi) * 7).toFixed(2)}px)`;
      alt.style.top = `${A.y ?? 1262}px`;
    } else alt.style.opacity = '0';
    // BİTİŞ KARTI: başlık + altın italik soru
    if (kartB) {
      const k = plan.kart, a = ease((t - k.s - 0.15) / 0.5);
      kartB.style.opacity = a.toFixed(3); kartB.style.display = a > 0.001 ? 'block' : 'none';
      if (soru) { const q = ease((t - (k.soruS ?? k.s + 0.9)) / 0.5); soru.style.opacity = q.toFixed(3); soru.style.display = q > 0.001 ? 'block' : 'none'; }
    }
  };
}
