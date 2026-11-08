#!/usr/bin/env python3
"""Ekranın cihaza DÜZGÜN oturduğunu yoxlayır (sıxılma/uzanma/qıraqdan çıxma/keyfiyyət).
  python3 verify_screen.py mockup.jpg cixis.png ekran.png --quad TL TR BR BL [--inset 0.75]
Çıxış kodu 0 = PASS, 1 = FAIL. place_in_mockup.py bunu avtomatik, ayrıca proses kimi çağırır
(yoxlama #2: çıxış faylı diskdən təzədən oxunur)."""
import argparse, math, sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter

def coeffs(dst, src):
    A=[]
    for (dx,dy),(sx,sy) in zip(dst,src):
        A.append([dx,dy,1,0,0,0,-sx*dx,-sx*dy]); A.append([0,0,0,dx,dy,1,-sy*dx,-sy*dy])
    return np.linalg.solve(np.array(A,float), np.array(src,float).reshape(8))
def P(p): x,y=p.split(','); return (float(x),float(y))
def D(a,b): return math.hypot(a[0]-b[0],a[1]-b[1])
def inset(q, px):
    cx=sum(p[0] for p in q)/4; cy=sum(p[1] for p in q)/4; o=[]
    for x,y in q:
        d=math.hypot(x-cx,y-cy) or 1; k=max(0,(d-px)/d); o.append((cx+(x-cx)*k, cy+(y-cy)*k))
    return o
def target_ratio(q):
    tw=(D(q[0],q[1])+D(q[3],q[2]))/2; th=(D(q[0],q[3])+D(q[1],q[2]))/2; return tw,th,tw/th

def verify(mock_p, out_p, scr_p, quad, ins=0.75):
    res=[]; ok=True
    def chk(name,cond,info):
        nonlocal ok; ok&=bool(cond); res.append(f"  [{'OK ' if cond else 'XƏTA'}] {name}: {info}")
    M=Image.open(mock_p).convert('RGB'); O=Image.open(out_p).convert('RGB'); S=Image.open(scr_p).convert('RGB')
    W,H=M.size; q=inset(quad,ins); tw,th,tr=target_ratio(quad)
    chk('ölçü',O.size==M.size,f'{O.size} vs mockup {M.size}')
    # 1) NİSBƏT: ekran şəklinin nisbəti ekran sahəsinə uyğundur (≤1%)
    sr=S.size[0]/S.size[1]; dev=abs(sr/tr-1)*100
    chk('nisbət (sıxılma/uzanma yoxdur)',dev<=1.0,f'ekran {sr:.4f} | cihaz ekranı {tr:.4f} | sapma {dev:.2f}% (≤1%)')
    # 2) QIRAQDAN ÇIXMA: polygonun 3px xaricində heç bir piksel dəyişməyib
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon(quad,fill=255)
    out_zone=np.array(m.filter(ImageFilter.MaxFilter(7)))==0
    diff=np.abs(np.asarray(M,int)-np.asarray(O,int)).max(axis=2)
    bleed=int(((diff>3)&out_zone).sum())
    chk('qıraqdan çıxma yoxdur',bleed==0,f'çərçivə/korpus üzərinə düşən piksel: {bleed}')
    # 3) KEYFİYYƏT: ekran şəkli kiçikdirsə böyüdüləndə bulanır
    up=tw/S.size[0]
    chk('keyfiyyət (böyütmə yoxdur)',up<=1.15,f'ekran eni {S.size[0]}px, cihazda {tw:.0f}px (böyütmə ×{up:.2f}, ≤1.15)')
    # 4) GEOMETRİYA: çıxışı düzləndir, orijinal ekranla müqayisə et (mərkəz + 4 qıraq zolağı)
    RW,RH=int(round(tw)),int(round(th))
    c=coeffs([(0,0),(RW,0),(RW,RH),(0,RH)], quad)
    R=O.transform((RW,RH),Image.PERSPECTIVE,c,resample=Image.BICUBIC)
    sw,sh=S.size
    if sr>tr: nw=int(round(sh*tr)); x0=(sw-nw)//2; Sc=S.crop((x0,0,x0+nw,sh))
    else: nh=int(round(sw/tr)); y0=(sh-nh)//2; Sc=S.crop((0,y0,sw,y0+nh))
    bl=ImageFilter.GaussianBlur(max(1.2,RW/150)); Sr=np.asarray(Sc.resize((RW,RH),Image.LANCZOS).filter(bl),float); Rr=np.asarray(R.filter(bl),float)
    b=max(3,int(min(RW,RH)*0.015))
    inner=np.abs(Sr-Rr)[b:-b,b:-b].mean()
    edges=np.concatenate([np.abs(Sr-Rr)[:b+3].ravel(),np.abs(Sr-Rr)[-b-3:].ravel(),
                          np.abs(Sr-Rr)[:,:b+3].ravel(),np.abs(Sr-Rr)[:,-b-3:].ravel()]).mean()
    chk('geometriya (məzmun yerində)',inner<=14,f'orta fərq {inner:.1f}/255 (≤14)')
    chk('qıraqlar kəsilməyib/sürüşməyib',edges<=24,f'qıraq zolağı fərqi {edges:.1f}/255 (≤24)')
    return ok,res

if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('mockup'); ap.add_argument('out'); ap.add_argument('screen')
    ap.add_argument('--quad',nargs=4,required=True); ap.add_argument('--inset',type=float,default=0.75)
    ap.add_argument('--label',default='YOXLAMA'); a=ap.parse_args()
    ok,res=verify(a.mockup,a.out,a.screen,[P(p) for p in a.quad],a.inset)
    print(f"{a.label}: {'PASS' if ok else 'FAIL'}"); print('\n'.join(res)); sys.exit(0 if ok else 1)
