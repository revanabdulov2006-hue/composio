#!/usr/bin/env python3
"""Personaj önizləmə: python3 kit/onizle.py onizle-sira.html cixis.png [x,y,en,hund]   (qovluq kökündən işlədilir)
Lokal server qaldırır, SVG səhnəni screenshot edir. Referansla yan-yana müqayisə üçün: PIL ilə yapışdır."""
import asyncio, sys, threading, http.server, socketserver, functools
from pathlib import Path
from playwright.async_api import async_playwright
KOK = Path(__file__).resolve().parent.parent
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(KOK)); H.log_message = lambda *a, **k: None
srv = socketserver.TCPServer(("127.0.0.1", 0), H); port = srv.server_address[1]; threading.Thread(target=srv.serve_forever, daemon=True).start()
async def m():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 540, "height": 960}); pg.on("pageerror", lambda e: print("XƏTA", str(e)[:300]))
        await pg.goto(f"http://127.0.0.1:{port}/{sys.argv[1]}"); await pg.wait_for_function("window.__bitdi===true", timeout=30000)
        x, y, w, h = map(int, sys.argv[3].split(",")) if len(sys.argv) > 3 else (0, 220, 540, 580)
        await pg.screenshot(path=sys.argv[2], clip={"x": x, "y": y, "width": w, "height": h}); await b.close()
asyncio.run(m())
