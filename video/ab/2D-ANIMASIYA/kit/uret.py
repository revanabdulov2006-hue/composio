#!/usr/bin/env python3
"""2D animasiya üreticisi: hikaye.json (+ ses/zamanlama.json varsa) → plan (veri.js) → HyperFrames layihəsi → kontrol → render.
  python3 kit/uret.py projeler/<ad> --kontrol        # hər planın ortasından kadr + izgara (review/izgara.jpg)
  python3 kit/uret.py projeler/<ad> --render [--quality draft|standard]
Səs yoxdursa söz sayından avtomatik vaxtlama (0.36 san/söz). Səs: ses/ovoz.mp3|wav varsa final MP4-ə qarışdırılır."""
import argparse, json, os, re, shutil, subprocess, sys
from pathlib import Path
KIT = Path(__file__).resolve().parent
HF = "hyperframes@0.8.105"
NPX = shutil.which("npx") or "npx"
os.environ.setdefault("HYPERFRAMES_SKIP_SKILLS", "1")
SN_SOZ, ARA = 0.36, 0.45

def zamanla(hik, job):
    zf = job / "ses" / "zamanlama.json"
    if zf.exists(): return json.loads(zf.read_text(encoding="utf-8"))["cumleler"]
    t, out = 0.35, []
    for c in hik["cumleler"]:
        d = max(1.2, len(re.findall(r"\S+", c["metin"])) * SN_SOZ); out.append({"s": round(t, 2), "e": round(t + d, 2)}); t += d + ARA
    return out

def plan_kur(job):
    hik = json.loads((job / "hikaye.json").read_text(encoding="utf-8")); hc = hik["cumleler"]; zc = zamanla(hik, job); n = len(hc)
    sinir = [0.0] + [round(zc[i-1]["e"] + (zc[i]["s"] - zc[i-1]["e"]) * 0.6, 3) for i in range(1, n)]
    sure = round(zc[-1]["e"] + hc[-1].get("nefes", 2.4), 3)
    planlar = []
    for i, c in enumerate(hc):
        s = sinir[i]
        if planlar and planlar[-1]["ad"] == c["plan"] and not c.get("gecis"): continue
        if planlar: planlar[-1]["e"] = s
        planlar.append({"ad": c["plan"], "s": s, "e": sure, "gecis": c.get("gecis", "kesme"), "cumleler": []})
    for p in planlar: p["cumleler"] = [{"metin": hc[i]["metin"], "s": zc[i]["s"], "e": zc[i]["e"], "olay": hc[i].get("olay")} for i in range(n) if p["s"] <= zc[i]["s"] < p["e"]]
    bas = next((i for i, c in enumerate(hc) if c.get("baslik")), None)
    yazi = {"baslik": {"metin": hik["baslik"], "s": 0.0, "e": zc[bas]["e"] + 0.35} if bas is not None else None, "hud": [], "alt": []}
    for i, c in enumerate(hc):
        if c.get("baslik") or c.get("kart") or c.get("altyazi") is False: continue
        e = min(zc[i]["e"] + 1.2, (zc[i+1]["s"] - 0.12) if i + 1 < n else sure)
        yazi["alt"].append({"metin": c.get("altyazi", c["metin"]), "s": round(zc[i]["s"] - 0.04, 3), "e": round(e, 3)})
    kart = next((i for i, c in enumerate(hc) if c.get("kart")), None)
    if kart is not None: yazi["kart"] = {"s": sinir[kart], "baslik": hik["baslik"], "soru": hik.get("kart", {}).get("soru", hc[kart]["metin"]), "soruS": zc[kart]["s"]}
    return {"baslik": re.sub(r"[\[\]\n]", lambda m: " " if m.group() == "\n" else "", hik["baslik"]), "sure": sure, "planlar": planlar, "yazi": yazi, "vurgu": hik.get("vurgu", "#7BD86A")}

INDEX = """<!doctype html><html lang="az"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1080, height=1920"/><title>{baslik}</title>
<style>
@font-face {{ font-family:'Archivo'; src:url('kit/fontlar/archivo-latin-800-normal.woff2') format('woff2'); font-weight:800; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }}
@font-face {{ font-family:'Archivo'; src:url('kit/fontlar/archivo-latin-ext-800-normal.woff2') format('woff2'); font-weight:800; unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@font-face {{ font-family:'Geist'; src:url('kit/fontlar/geist-latin-600-normal.woff2') format('woff2'); font-weight:600; }}
@font-face {{ font-family:'Geist'; src:url('kit/fontlar/geist-latin-ext-600-normal.woff2') format('woff2'); font-weight:600; unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
html,body {{ margin:0; height:100%; background:#000; }}
#root {{ position:relative; width:1080px; height:1920px; overflow:hidden; background:#000; }}
#sahne,#katman {{ position:absolute; inset:0; }} #katman {{ pointer-events:none; }}
#karart,#beyaz {{ position:absolute; inset:0; opacity:0; pointer-events:none; }} #karart {{ background:#000; }} #beyaz {{ background:#fff; }}
</style></head><body>
<div id="root" data-composition-id="sahne2d" data-no-timeline data-start="0" data-width="1080" data-height="1920" data-duration="{sure}">
<div id="sahne"></div><div id="karart"></div><div id="katman"></div><div id="beyaz"></div></div>
<script type="module" src="./sahne.js"></script></body></html>
"""

def hazirla(job, plan):
    hf = job / "hf-grafikler"; dst = hf / "kit"; dst.mkdir(parents=True, exist_ok=True)
    for f in ("kadr.js", "karakter.js", "komanda.js", "sprayt.js", "insan.js", "mekan.js", "katman.js", "yonet2d.js"): shutil.copy2(KIT / f, dst / f)
    shutil.copytree(KIT / "fontlar", dst / "fontlar", dirs_exist_ok=True); shutil.copytree(KIT / "sprites", dst / "sprites", dirs_exist_ok=True)
    (hf / "index.html").write_text(INDEX.format(baslik=plan["baslik"], sure=plan["sure"]), encoding="utf-8")
    if not (hf / "sahne.js").exists(): shutil.copy2(KIT.parent / "ornekler" / "market-pilot" / "sahne.js", hf / "sahne.js"); print("[uret] sahne.js ← market-pilot")
    (hf / "veri.js").write_text("export const PLAN = " + json.dumps(plan, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    return hf

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("is_klasoru"); ap.add_argument("--render", action="store_true"); ap.add_argument("--kontrol", action="store_true"); ap.add_argument("--quality", default="draft")
    a = ap.parse_args(); job = Path(a.is_klasoru).resolve(); plan = plan_kur(job); hf = hazirla(job, plan)
    print(f"[uret] {plan['sure']} san · " + " | ".join(f"{p['ad']} {p['s']:.1f}" for p in plan["planlar"]))
    if a.kontrol:
        anlar = [(p["s"] + p["e"]) / 2 for p in plan["planlar"]]
        r = subprocess.run([sys.executable, str(KIT / "kontrol.py"), str(hf), *[f"{x:.2f}" for x in anlar]])
        if r.returncode: sys.exit("[uret] kontrol uğursuz")
    if a.render:
        out = job / "ciktilar"; out.mkdir(exist_ok=True); v = hf / "renders" / "goruntu.mp4"; v.parent.mkdir(exist_ok=True)
        r = subprocess.run([NPX, "-y", HF, "render", str(hf), "--output", str(v), "--quality", a.quality, "--player-ready-timeout", "180000"])
        if r.returncode: sys.exit("[uret] render uğursuz")
        ses = next((s for s in [job/"ses"/"ovoz.mp3", job/"ses"/"ovoz.wav"] if s.exists()), None); fin = out / f"{job.name}.mp4"
        if ses: subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(v), "-i", str(ses), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-shortest", str(fin)], check=True)
        else: shutil.copy2(v, fin)
        print("[uret] hazır:", fin)

if __name__ == "__main__": main()
