# Video istehsal xətti (günlük Reels)

Səs → səhnə vaxtları → render → miks. Hər addım sandbox-da işləyir (playwright + google-chrome + ffmpeg).

## 1. Mətn
Rəvan verərsə onu götür; verməzsə `asanbiz-kontent` / `yenegel-kontent` skili ilə yaz. Mətndə emoji/nida yox. Mətn ~2.5 söz/san.

## 2. Səs (GitHub Actions, GEMINI_API_KEY secret-dədir; açar heç vaxt söhbətə yazılmır)
- workflow `tts.yml` (inputs: text, voice, out, style, model). YENƏGƏL = `en-us-kira` (qadın), AsanBiznesim = `en-us-bodi` (kişi).
- `style` BOŞ buraxılır (ingilis stil mətni səslənir). Nəticə `voice/<ad>.wav` repo-ya commit olunur: `git pull`.
- Gemini TTS bəzən 503 verir → 2–3 dəfə yenidən dispatch et. İşləməsə o günün videosunu keç və Rəvana yaz.
- Dispatch: Composio `GITHUB_CREATE_A_WORKFLOW_DISPATCH_EVENT` (`inputs` JSON STRING); run/log: `GITHUB_LIST_WORKFLOW_RUNS_FOR_A_WORKFLOW`.
- Cümlə vaxtları: `align.yml` tez-tez 503 verir; sandbox-da `ffmpeg silencedetect` + cümlə sayına görə DP ilə də hesablaya bilərsən (ab05 belə edildi).
- Səs faylının başında stil mətni oxunubsa (ilk ~10 san) kəs.

## 3. Render
- YENƏGƏL (motion, 2D, krem/terracotta): şablon `video/yg/` (index.html + render.js + fonts.css). `times.json` = cümlə [start,end] cütləri; səhnələr səsə görə qurulur. `node render.js still 1.5,10` / `node render.js video out.mp4 <dur>`. Fontlar `npm i` (@fontsource) ilə.
- AsanBiznesim (2D, sürətli keçidlər, yaşıl): kit `video/ab/2D-ANIMASIYA` (`CLAUDE.md`, `preset/2D.md`), nümunə `projeler/ab05-kamil/{hikaye.json,hf-grafikler/sahne.js,ses/zamanlama.json}`; render `node video/ab/r2d.js <qovluq> render out.mp4 <dur>` (index.html `window.__bitdi`/`__renderAt` verir).
- 3D yoxdur. Real foto-mockup: homography (matrix3d). Qaydalar: AZ hərfli font, ekranlar sıxılmır/uzanmır, hook 3 san.
- Hər kadr 1080x1920, 30 fps, libx264 crf17 (veryfast).

## 4. Miks
`python3 video/mix.py --video vid.mp4 --voice vo.wav --music video/yg/a/arxa-01.mp3 --cues cues.json --out final.mp4 --music-db -10` (YG −10, AB −3 daha yüksək musiqi).
cues.json = `[{"t":1.25,"file":"video/yg/sfx/pop-331049.mp3","db":-6}, ...]` (keçid/ekran hadisələrinə SFX).
SFX: `video/yg/sfx/`. Musiqi: `video/yg/a/arxa-01.mp3`, `arxa-04.mp3`.

## 5. Yoxlama (MƏCBURİ, paylaşımdan əvvəl)
Seçilmiş kadrları (hook, orta, CTA) PNG kimi aç və bax: mətn kəsilməsin/üst-üstə düşməsin. `ffprobe`: video+audio, müddət səs+0.8 san. Səs 0 peak-dən aşağı, səssiz hissə yox.

## 6. Növbəyə qoy
`python3 paylasim/hazirla.py --brend yg|ab --tarix <bu gün> --slot 19:00 --nov reel --src final.mp4 --caption-file cap.txt`
Rəvana önizləməni SendUserFile ilə göndər ("19:00-da paylaşılacaq, dayandırmaq üçün yaz: dayandır YG 19:00").
