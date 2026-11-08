#!/usr/bin/env python3
"""python3 kit/kontrol.py <hf-grafikler> t1 t2 ... → review/kadr_N.png + review/izgara.jpg (localhost server + playwright)."""
import sys, threading, http.server, socketserver, functools, asyncio
from pathlib import Path
from playwright.async_api import async_playwright
hf = Path(sys.argv[1]).resolve(); ts = [float(x) for x in sys.argv[2:]]; out = hf.parent / "review"; out.mkdir(exist_ok=True)
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(hf)); H.log_message = lambda *a, **k: None
srv = socketserver.TCPServer(("127.0.0.1", 0), H); port = srv.server_address[1]; threading.Thread(target=srv.serve_forever, daemon=True).start()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1080, "height": 1920}); bad = []
        pg.on("pageerror", lambda e: bad.append(str(e)[:200]))
        await pg.goto(f"http://127.0.0.1:{port}/index.html"); await pg.wait_for_function("window.__bitdi===true", timeout=60000)
        for i, t in enumerate(ts):
            await pg.evaluate(f"window.__renderAt({t})"); await pg.screenshot(path=str(out / f"kadr_{i}.png"))
        await b.close(); return bad
bad = asyncio.run(main())
from PIL import Image
im = [Image.open(out / f"kadr_{i}.png").resize((360, 640)) for i in range(len(ts))]
w = Image.new("RGB", (360 * len(im), 640)); [w.paste(x, (360 * i, 0)) for i, x in enumerate(im)]; w.save(out / "izgara.jpg", quality=88)
print("[kontrol]", out / "izgara.jpg", "XƏTA:" if bad else "ok", *bad); sys.exit(1 if bad else 0)
