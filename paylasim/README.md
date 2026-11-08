# Instagram paylaşım növbəsi

Fayl: `paylasim/novbe.json`. Media: `media` branch-ı, yol `media/<brend>/<tarix>/...` (açıq raw URL).

## Item sxemi
```
{
  "id": "2026-11-09-ab-post1",
  "brend": "ab" | "yg",
  "nov": "post" | "story" | "reel",
  "slot": "14:00" | "18:00" | "19:00",
  "tarix": "2026-11-09",
  "media": "media/ab/2026-11-09/post1.jpg",      // post/story: JPEG, reel: MP4
  "caption": "tam metn (story ucun bos)",
  "status": "gozleyir" | "dayandirildi" | "paylasildi" | "xeta",
  "ig_media_id": null, "permalink": null, "qeyd": ""
}
```
`url` sahəsi (commit-SHA-lı raw link) Instagram-a verilən image_url/video_url-dir. Hazırlamanı `python3 paylasim/hazirla.py` edir.

## Formatlar (Instagram tələbi)
- post: JPEG, 1080x1350 (4:5), ≤8 MB. PNG qəbul olunmur, JPEG-ə çevir.
- story: JPEG, 1080x1920 (9:16).
- reel: MP4 (H.264/AAC), 9:16, ≤100 MB.

## Paylaşım qaydası
1. `tarix`=bu gün, `slot`=cari saat, `status`="gozleyir" olan itemləri götür.
2. `dayandirildi` olanı keç.
3. post/reel: `INSTAGRAM_POST_IG_USER_MEDIA` (image_url/video_url, caption) → `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH`.
   story: eyni, `media_type: STORIES`, caption yoxdur.
4. Uğurda status=paylasildi + ig_media_id + permalink; xətada status=xeta + qeyd. Eyni item iki dəfə paylaşılmır.
