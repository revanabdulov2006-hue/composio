#!/usr/bin/env python3
"""Ekran şəklini real cihaz mockup-unun boş ekranına yerləşdirir — SIXMADAN, UZATMADAN, QIRAQDAN ÇIXMADAN.
  python3 place_in_mockup.py mockup.jpg ekran.png cixis.png --quad TL TR BR BL
  python3 place_in_mockup.py mockup.jpg --quad ... --print-ratio     # ekranı hansı nisbətdə render etməli
Rejimlər (--fit):
  exact (DEFAULT): ekran nisbəti cihaz ekranına ≤1% uyğun olmalıdır (≤1% mikro-kəsim edilir). Uyğun deyilsə XƏTA verir və
                   lazım olan nisbəti yazır → ekranı həmin nisbətdə yenidən render et. Heç vaxt uzatmır.
  cover:           nisbətə mərkəzdən kəsir (məzmun qıraqdan itə bilər — yalnız şəkil/foto üçün).
  contain:         sığdırır, boşluğu --bg rənglə doldurur.
Avtomatik: yerləşdirmədən sonra verify_screen.py İKİ DƏFƏ işləyir (yaddaşda + diskdən təzədən). FAIL olarsa fayl silinir, çıxış kodu 1.
"""
import argparse, os, subprocess, sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from verify_screen import coeffs, P, inset, target_ratio, verify

ap=argparse.ArgumentParser(); ap.add_argument('mockup'); ap.add_argument('screen',nargs='?'); ap.add_argument('out',nargs='?')
ap.add_argument('--quad',nargs=4,required=True); ap.add_argument('--fit',default='exact',choices=['exact','cover','contain'])
ap.add_argument('--bg',default='#ffffff'); ap.add_argument('--inset',type=float,default=0.75)
ap.add_argument('--print-ratio',action='store_true'); a=ap.parse_args()
quad=[P(p) for p in a.quad]; tw,th,tr=target_ratio(quad)
if a.print_ratio or not (a.screen and a.out):
    print(f'ekran sahəsi ~{tw:.0f}x{th:.0f}px | nisbət {tr:.4f} (en/hündürlük) → ekranı ən azı {int(math.ceil(tw*2))}px en, bu nisbətdə render et'); sys.exit(0)
mock=Image.open(a.mockup).convert('RGBA'); scr=Image.open(a.screen).convert('RGBA'); W,H=mock.size; sw,sh=scr.size; sr=sw/sh
if a.fit=='exact':
    dev=abs(sr/tr-1)*100
    if dev>1.0:
        print(f'XƏTA: ekran nisbəti {sr:.4f}, cihaz ekranı {tr:.4f} (sapma {dev:.1f}%). Şəkil sıxılıb/uzadılmayacaq.\n'
              f'→ ekranı {tr:.4f} nisbətində (məs. {int(tw*2)}x{int(th*2)}px) yenidən render et.',file=sys.stderr); sys.exit(2)
    if sr>tr: nw=int(round(sh*tr)); x0=(sw-nw)//2; canvas=scr.crop((x0,0,x0+nw,sh))
    else: nh=int(round(sw/tr)); y0=(sh-nh)//2; canvas=scr.crop((0,y0,sw,y0+nh))
elif a.fit=='cover':
    if sr>tr: nw=int(round(sh*tr)); x0=(sw-nw)//2; canvas=scr.crop((x0,0,x0+nw,sh))
    else: nh=int(round(sw/tr)); y0=(sh-nh)//2; canvas=scr.crop((0,y0,sw,y0+nh))
else:
    if sr>tr: cw,ch=sw,int(round(sw/tr))
    else: cw,ch=int(round(sh*tr)),sh
    canvas=Image.new('RGBA',(cw,ch),a.bg); canvas.paste(scr,((cw-sw)//2,(ch-sh)//2),scr)
cw,ch=canvas.size
if cw<tw*0.95: print(f'XƏBƏRDARLIQ: ekran eni {cw}px < cihaz ekranı {tw:.0f}px → bulanıq olar. ≥{int(tw*2)}px render et.')
if cw>tw*2.0:  # aşağı ölçüləndirmədə aliasing olmasın — vahid miqyas, nisbət saxlanır
    k=tw*2.0/cw; canvas=canvas.resize((int(round(cw*k)),int(round(ch*k))),Image.LANCZOS); cw,ch=canvas.size
q=inset(quad,a.inset)
c=coeffs(q,[(0,0),(cw,0),(cw,ch),(0,ch)])
warped=canvas.transform((W,H),Image.PERSPECTIVE,c,resample=Image.BICUBIC)
SS=4; mk=Image.new('L',(W*SS,H*SS),0); ImageDraw.Draw(mk).polygon([(x*SS,y*SS) for x,y in q],fill=255)
mask=mk.resize((W,H),Image.LANCZOS)
out=mock.copy(); out.paste(warped,(0,0),mask); out=out.convert('RGB'); out.save(a.out)
# --- İKİ DƏFƏ YOXLAMA ---
tmp=a.screen
ok1,r1=verify(a.mockup,a.out,tmp,quad,a.inset); print('YOXLAMA #1 (yaddaşda):','PASS' if ok1 else 'FAIL'); print('\n'.join(r1))
cmd=[sys.executable,os.path.join(os.path.dirname(os.path.abspath(__file__)),'verify_screen.py'),a.mockup,a.out,tmp,'--quad',*a.quad,'--inset',str(a.inset),'--label','YOXLAMA #2 (diskdən təzədən)']
p2=subprocess.run(cmd,capture_output=True,text=True); print(p2.stdout.strip())
if not (ok1 and p2.returncode==0):
    try: os.remove(a.out)
    except OSError: pass
    print('NƏTİCƏ: FAIL — çıxış silindi. Ekranı düzəlt və təkrar et. POSTDA İSTİFADƏ ETMƏ.',file=sys.stderr); sys.exit(1)
print(f'NƏTİCƏ: PASS ✔✔ (2/2) → {a.out} | fit={a.fit} | nisbət {tr:.3f}')
