# Cümlə vaxtlarını ffmpeg silencedetect boşluqlarına DP ilə yerləşdirir.
# istifadə: python3 zaman.py ses/vo.wav
import json, subprocess, sys, re

wav = sys.argv[1] if len(sys.argv) > 1 else 'ses/vo.wav'
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                            '-of', 'csv=p=0', wav], capture_output=True, text=True).stdout.strip())
out = subprocess.run(['ffmpeg', '-hide_banner', '-i', wav, '-af',
                      'silencedetect=noise=-30dB:d=0.10', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
ee = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
gaps = [(a, b) for a, b in zip(ss, ee) if b < dur - 0.25]   # sondakı sükutu at
print('%d boşluq, müddət %.2f' % (len(gaps), dur))

C = json.load(open('hikaye.json'))['cumleler']
n = len(C)
L = [len(c['metin']) for c in C]
tot = sum(L)
cum = []
a = 0
for x in L[:-1]:
    a += x
    cum.append(a / tot * dur)          # gözlənilən sərhəd vaxtları
need = n - 1
mid = [(g[0] + g[1]) / 2 for g in gaps]
if len(mid) < need:
    sys.exit('boşluq sayı azdır: %d < %d' % (len(mid), need))

INF = float('inf')
# dp[i][j] = ilk i sərhədi ilk j boşluğa yerləşdirmənin ən az xərci (j-ci istifadə olunur)
dp = [[INF] * (len(mid) + 1) for _ in range(need + 1)]
bk = [[-1] * (len(mid) + 1) for _ in range(need + 1)]
dp[0][0] = 0.0
for i in range(1, need + 1):
    for j in range(i, len(mid) + 1):
        best, arg = INF, -1
        for k in range(i - 1, j):
            if dp[i - 1][k] == INF:
                continue
            # proporsional gözlənti ilə uyğunluq + uzun boşluğa üstünlük
            c = dp[i - 1][k] + (mid[j - 1] - cum[i - 1]) ** 2 - 1.5 * (gaps[j - 1][1] - gaps[j - 1][0])
            if c < best:
                best, arg = c, k
        dp[i][j], bk[i][j] = best, arg
j = min(range(need, len(mid) + 1), key=lambda x: dp[need][x])
sel = []
i, j = need, j
while i > 0:
    sel.append(j - 1)
    j = bk[i][j]
    i -= 1
sel.reverse()
print('seçilən boşluqlar:', [round(mid[s], 2) for s in sel])
atilan = [round(mid[k], 2) for k in range(len(mid)) if k not in sel]
print('cümlə içi sayılan boşluqlar:', atilan)

cum_s = [0.0]
for s in sel:
    cum_s.append(gaps[s][1] - 0.04)     # yeni cümlə sükutun sonunda başlayır
ends = [gaps[s][0] + 0.04 for s in sel] + [dur]
Z = {'cumleler': [{'s': round(cum_s[i], 3), 'e': round(ends[i], 3)} for i in range(n)]}
json.dump(Z, open('ses/zamanlama.json', 'w'), indent=1)
for i, z in enumerate(Z['cumleler']):
    print('s%-2d %6.2f %6.2f  %.1fs  %s' % (i + 1, z['s'], z['e'], z['e'] - z['s'], C[i]['metin'][:46]))
