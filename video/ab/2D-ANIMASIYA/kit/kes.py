#!/usr/bin/env python3
"""Referans şəkildən personajları kəsir (ağ fon → şəffaf) və baş/bədən spritlərinə bölür.
  python3 kit/kes.py sekil.jpg ad1,ad2 --kes 268 --boyun 348,372 [--y0 190 --y1 960]
--kes: personajlar arası şaquli kəsik x-ləri (n-1 dənə); --boyun: hər personajın boyun y-i (orijinal şəkildə).
Çıxış: kit/sprites/<ad>-{bas,beden,tam}.png + meta.json-a əlavə. Yeni əsas personaj üçün: Rəvan referansa uyğun şəkil yaradır → bu skript kəsir."""
import argparse, json
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi
ap = argparse.ArgumentParser(); ap.add_argument("sekil"); ap.add_argument("adlar"); ap.add_argument("--kes", default=""); ap.add_argument("--boyun", required=True)
ap.add_argument("--y0", type=int, default=0); ap.add_argument("--y1", type=int, default=0); a = ap.parse_args()
KIT = Path(__file__).resolve().parent; out = KIT / "sprites"; out.mkdir(exist_ok=True)
adlar = a.adlar.split(","); kes = [int(x) for x in a.kes.split(",") if x]; boyun = [int(x) for x in a.boyun.split(",")]
im = Image.open(a.sekil).convert("RGB"); A = np.array(im).astype(int); H, W = A.shape[:2]; y1 = a.y1 or H
mn, mx = A.min(2), A.max(2); cand = (mn > 178) & ((mx - mn) < 26); cand[:a.y0] = True; cand[y1:] = True
lab, _ = ndi.label(cand); bd = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
fg = ~np.isin(lab, list(bd)); fg[:a.y0] = False; fg[y1:] = False
fg = ndi.binary_fill_holes(ndi.binary_opening(fg, iterations=1))
pl, pn = ndi.label((mn > 236) & ((mx - mn) < 14))      # personajlar arası qapalı ağ boşluqlar
for i in range(2, pn + 1):
    ys, _ = np.where(pl == i)
    if len(ys) > 5000 and ys.mean() > H * 0.6: fg &= ~(pl == i)
cl, k = ndi.label(fg); sz = ndi.sum(fg, cl, range(1, k + 1)); fg = np.isin(cl, [i + 1 for i, s in enumerate(sz) if s > 3000])
rgba = Image.fromarray(np.dstack([A, ndi.gaussian_filter(fg.astype(float), 0.7) * 255]).astype("uint8"), "RGBA")
xs = [0] + kes + [W]; mf = out / "meta.json"; meta = json.loads(mf.read_text()) if mf.exists() else {}
for i, ad in enumerate(adlar):
    m = Image.new("L", (W, H), 0); ImageDraw.Draw(m).rectangle([xs[i], 0, xs[i + 1], H], fill=255)
    c = rgba.copy(); c.putalpha(Image.fromarray(np.minimum(np.array(c.split()[3]), np.array(m)))); bb = c.getbbox(); c = c.crop(bb)
    ny = boyun[i] - bb[1]; h = c.size[1]; bas = c.crop((0, 0, c.size[0], ny + 14)); bed = c.crop((0, max(0, ny - 14), c.size[0], h))
    bas.save(out / f"{ad}-bas.png"); bed.save(out / f"{ad}-beden.png"); c.save(out / f"{ad}-tam.png")
    ha = np.array(bas.split()[3]); xx = np.where(ha[:int(ny * .8)].max(0) > 128)[0]
    meta[ad] = {"w": c.size[0], "h": h, "boyunY": ny, "boyunX": int((xx.min() + xx.max()) / 2), "basH": ny + 14, "bedenY": max(0, ny - 14)}; print("[kes]", ad, meta[ad])
mf.write_text(json.dumps(meta, indent=1))
