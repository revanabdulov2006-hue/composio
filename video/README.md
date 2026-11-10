# Video istehsal xətti (günlük Reels)

Səs → səhnə vaxtları → render → miks. Hər addım sandbox-da işləyir (playwright + google-chrome + ffmpeg).

## 0. Daimi qaydalar (HƏR videoda, HƏR brenddə — pozulmaz)
- **Kiçik başlıq/etiket YOX.** Səhnənin yuxarısında "Səbəb", "Nəticə", "Daimi müştəri", "Sual" kimi kiçik, böyük hərflərlə, aralıqlı (letter-spacing) eyebrow-etiket mətni HEÇ VAXT işlənmir — nə YG-də, nə AB-də, heç bir səhnədə. Əsas cümlə özü kifayətdir, ayrıca etiketə ehtiyac yoxdur. (Köhnə `video/yg/index.html` şablonundakı `.lab` sinfi bu səbəbdən YENİ videolarda istifadə olunmur — saxlansa da görünməz/boş saxlanmalıdır.)
- **2D-animasiya istifadə qaydası (video növünə görə):**
  - **Hekayə tipli video** (story, gündəlik həyat, personaj mərkəzli): `iki-d-animasiya` skili tam istifadə oluna bilər — çoxlu insan.js personaj səhnəsi normaldır.
  - **Satış / məhsul tanıtım tipli video**: yalnız **2–3 səhnə** 2D-animasiya personajı ilə olsun; qalanı motion-qrafik, mətn-animasiya, telefon/kart mockup tipli qurulsun ki, video professionalizm hissi versin.
- **Şəkil / ikon / fiqur / arxa fon → Gemini Image ilə.** Video üçün lazım olan statik şəkil aktivləri (ikon, illüstrasiya, fiqur, arxa fon, overlay) **Google AI Studio / Gemini Image** ilə hazırlanır. Yol: `img/jobs/<layihə>.json` yaz (`[{"prompt","out","aspect"}]`), GitHub Actions `image.yml`-i `jobs_file` ilə dispatch et (model boş = avtomatik; free-tier üçün `gemini-2.5-flash-image`), `git pull` ilə `img/...`-ni götür. **HTTP 429 / `limit: 0`** = açarda şəkil kvotası yoxdur (billing lazımdır) → videonu dayandırma: real UI + kod-əsaslı professional qrafika ilə davam et və sonda Rəvana bildir.

## 1. Vizual keyfiyyət standartı (Rəvanın rəyi, 2026-11-10 — HƏR video)
Rəy: "çox sadə, standart effektlər, eyni görüntü, eyni arxa fon, eyni yazı tipi, keçid yox, AI məhsulu olduğu bilinən saxta oxlar". Buna görə:
- **Şablon görüntü YOX.** Hər səhnə bölməsinin öz dünyası olsun: tünd isti fon, krem kağız, tam terrakota, real foto (blur/parallax), hərəkətli gradient + film qrain. Bütün video boyu eyni fon/eyni kompozisiya təkrarlanmır.
- **Hər səhnə keçidi real keçiddir**, sadə fade və ya sərt kəsik deyil: whip-pan (motion blur + uzanma), dairə/iris açılışı (bir elementdən böyüyür), rəngli panel silmə (2–3 qat, diaqonal), zoom-through, split/şter, match-cut (bir səhnənin elementi növbəti səhnəyə keçir). Növlər növbələşir, eyni keçid ard-arda iki dəfə işlənmir.
- **Kinetik tipoqrafiya.** Ən azı 2–3 tip: böyük kondensə qrotesk (Archivo 800, BÖYÜK HƏRF vurğu sözləri), zərif serif (Fraunces, italik vurğu), UI üçün sans (Jakarta). Yazı girişləri dəyişir: maska ilə sətir-sətir sürüşmə, hərf-hərf, söz dəyişmə (ticker), vurğu zolağı sözün altından süpürülür, üstündən xətt çəkilir, rəqəm sayğacı. Yazı səhnədən səhnəyə də keçidlə gedir (çıxış animasiyası var).
- **Kamera daim canlıdır:** hər səhnədə yavaş push-in/drift/parallax; tam statik kadr yoxdur.
- **Saxta/AI görünüşlü əl işi SVG ox/ikon YOX.** Əvəzinə: real UI (real cihaz mockup + real ekran şəkli), real logo, Gemini Image fiqur/illüstrasiya, 2D personajlar, data vizual (sütun, tərəzi, axın), hissəcik/fiqur animasiyası.
- **Fiqurlar olsun:** insan fiqurları (2D personaj və ya stilizə kiçik fiqurlar — kütlə, növbə, axın), obyektlər (kart, fincan, sikkə), məlumat qrafikası.
- **Axın:** səhnələr bir-birinə bağlı hiss olunsun (rəng/element davamlılığı), səs ritmi ilə vizual vuruşlar üst-üstə düşsün; bir kadr 3–4 san-dan çox eyni qalmasın.
- **İlham yoxdursa, referans hesablara bax (YALNIZ YENƏGƏL — AsanBiznesim-ə aid DEYİL).** Rəvan YENƏGƏL üçün mövzu/ssenari verməyəndə əvvəlcə öz keçmiş videolarına (təkrar olmasın deyə), sonra bu Instagram hesablarına bax: **trytappi, loyaltify.io, getcentik, goodly.by, beklioz**. Həmin hesabların ən çox baxış/bəyənmə almış reels-lərinə ÖNCƏLİK ver (ən yüksək performanslı videonu tap, onun ideyasını/struktur axınını uyğunlaşdır), qalan aşağı performanslı videolara yalnız yeni mövzu tapılmayanda keç. Script-i söz-sözə köçürmə — struktur/bucaq olaraq istifadə et, YENƏGƏL-in öz faktlarına uyğunlaşdır. AsanBiznesim mövzusu üçün bu hesablara baxılmır — AB öz keçmiş videolarına və `asanbiz-kontent` skilinin mesaj bucaqlarına görə mövzu seçir.
- **Problem → həll keçidi YUMŞAQ olsun.** Problemi/dərdi dedikdən sonra birbaşa "QR skan edir, kart açılır" kimi mexanizmə tullanma. Aralarında körpü cümləsi olsun: "Bunun sadə bir həlli var.", "Biz bunu belə həll etdik.", "Bəs bunu dəyişən bir şey olsaydı?" və bənzəri — hər dəfə fərqli, şablonlaşmamış ifadə ilə. Bu keçid cümləsi səsləndirmə mətninin öz cümləsi olmalıdır, sonradan əlavə redaktə deyil.
- **YENƏGƏL məhsul faktları (düzəliş, 2026-11-10):** Müştəri kartı əsasən **kassada möhür oxudur** (stamp/NFC oxuyucu) ilə alır — QR kod skanı da var, amma əsas/birinci yol möhür oxutmaqdır, videolarda bunu əks etdir (QR-ı yalnız ikinci/alternativ yol kimi göstər, əsas səhnə möhür oxutma olsun). Müştərilər YENƏGƏL şəbəkəsində təkcə öz kartını deyil, **digər iştirakçı bizneslərin də (kafe, restoran, bərbər və s.) endirim/kartlarını görə bilir, yenidən qeydiyyatdan keçmədən**. Bu, videolarda "bir kart, bütün şəhər" və ya "yenidən qeydiyyat yox, hər yerdə" kimi bir üstünlük kimi işlənə bilər.

## 2. Səs (GitHub Actions, GEMINI_API_KEY secret-dədir; açar heç vaxt söhbətə yazılmır)
- workflow `tts.yml` (inputs: text, voice, out, style, model). voice inputu display name ilə: YENƏGƏL = `Kira` (qadın), AsanBiznesim = `Bodi` (kişi) — `en-us-kira` kimi adlar xəta verir.
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
