# hikaye.json + ses/zamanlama.json -> hf/veri.js
import json,sys
H=json.load(open('hikaye.json')); Z=json.load(open('ses/zamanlama.json'))['cumleler']; sure=float(sys.argv[1])
C=[dict(c,**z) for c,z in zip(H['cumleler'],Z)]
pl=[]
for i,c in enumerate(C):
    if not pl or pl[-1]['ad']!=c['plan']:
        pl.append({'ad':c['plan'],'gecis':c.get('gecis','kesme'),'cumleler':[]})
    pl[-1]['cumleler'].append({'metin':c['metin'],'s':c['s'],'e':c['e'],'olay':None})
for k,p in enumerate(pl):
    p['s']=0.0 if k==0 else round((pl[k-1]['cumleler'][-1]['e']+p['cumleler'][0]['s'])/2,3)
for k,p in enumerate(pl): p['e']=pl[k+1]['s'] if k+1<len(pl) else sure
alt=[]
for i,c in enumerate(C):
    if c.get('baslik') or c.get('altyazi') is False: continue
    nx=C[i+1]['s'] if i+1<len(C) else sure
    alt.append({'metin':c.get('altyazi') or c['metin'],'s':round(c['s']-0.06,2),'e':round(min(c['e']+0.4,nx-0.05),2)})
b=C[0]; yazi={'baslik':{'metin':H['baslik'],'s':0.0,'e':round(C[1]['s'],2)},'hud':[],'alt':alt}
P={'baslik':H['baslik'].replace('\n',' ').replace('[','').replace(']',''),'sure':sure,'planlar':pl,'yazi':yazi,'vurgu':H['vurgu']}
open('hf/veri.js','w').write('export const PLAN = '+json.dumps(P,ensure_ascii=False,indent=1)+';\n')
print([ (p['ad'],p['s'],p['e']) for p in pl])
