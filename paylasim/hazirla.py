#!/usr/bin/env python3
"""Hazir post/video-nu paylasim novbesine elave edir.

Post:  python3 paylasim/hazirla.py --brend ab --tarix 2026-11-09 --slot 14:00 --nov post --src post.png --caption-file cap.txt
Reel:  python3 paylasim/hazirla.py --brend yg --tarix 2026-11-09 --slot 19:00 --nov reel --src video.mp4 --caption-file cap.txt
Post ucun avtomatik eyni slota story de elave olunur (--no-story ile sondurulur).
Teleb: repo /home/claude/composio-da klonlanib, push huququ var (add_repo access=push).
"""
import argparse, json, os, subprocess, sys, shutil
from PIL import Image, ImageFilter

REPO = os.environ.get("PAYLASIM_REPO", "/home/claude/composio")
WT = "/tmp/mediawt"
ENV = dict(os.environ, GIT_AUTHOR_NAME="claude", GIT_AUTHOR_EMAIL="noreply@anthropic.com",
           GIT_COMMITTER_NAME="claude", GIT_COMMITTER_EMAIL="noreply@anthropic.com")
TRAILER = ("\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>\n"
           "Claude-Session: https://claude.ai/code/session_016TcJFzFz7dSG6yVgekhpJq")

def sh(*a, cwd=REPO):
    return subprocess.run(a, cwd=cwd, env=ENV, check=True, capture_output=True, text=True).stdout

def media_worktree():
    sh("git", "fetch", "origin", "media:refs/remotes/origin/media", "main")
    if os.path.isdir(WT):
        sh("git", "worktree", "remove", "--force", WT)
    sh("git", "worktree", "prune")
    sh("git", "worktree", "add", "-B", "media", WT, "origin/media")

def make_post(src, dst):
    im = Image.open(src).convert("RGB")
    w, h = im.size
    tw, th = 1080, 1350
    if abs(w / h - tw / th) > 0.01:  # nisbet 4:5 deyilse merkezden kes
        r = tw / th
        nw, nh = (int(h * r), h) if w / h > r else (w, int(w / r))
        l, t = (w - nw) // 2, (h - nh) // 2
        im = im.crop((l, t, l + nw, t + nh))
    im = im.resize((tw, th), Image.LANCZOS)
    im.save(dst, "JPEG", quality=92, optimize=True)
    return im

def make_story(post_im, dst):
    bg = post_im.resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.GaussianBlur(40))
    bg = Image.eval(bg, lambda v: int(v * 0.75))
    fg = post_im.resize((960, 1200), Image.LANCZOS)
    bg.paste(fg, (60, (1920 - 1200) // 2))
    bg.save(dst, "JPEG", quality=92, optimize=True)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--brend", required=True, choices=["ab", "yg"])
    p.add_argument("--tarix", required=True)
    p.add_argument("--slot", required=True)
    p.add_argument("--nov", required=True, choices=["post", "reel"])
    p.add_argument("--src", required=True)
    p.add_argument("--caption-file", required=True)
    p.add_argument("--no-story", action="store_true")
    p.add_argument("--n", default="1", help="gunluk nomre (post1/post2)")
    a = p.parse_args()
    caption = open(a.caption_file, encoding="utf-8").read().strip()
    base = f"media/{a.brend}/{a.tarix}"
    items = []
    media_worktree()
    os.makedirs(f"{WT}/{base}", exist_ok=True)
    if a.nov == "post":
        im = make_post(a.src, f"{WT}/{base}/post{a.n}.jpg")
        items.append(dict(id=f"{a.tarix}-{a.brend}-post{a.n}", nov="post", media=f"{base}/post{a.n}.jpg", caption=caption))
        if not a.no_story:
            make_story(im, f"{WT}/{base}/story{a.n}.jpg")
            items.append(dict(id=f"{a.tarix}-{a.brend}-story{a.n}", nov="story", media=f"{base}/story{a.n}.jpg", caption=""))
    else:
        shutil.copy(a.src, f"{WT}/{base}/reel.mp4")
        items.append(dict(id=f"{a.tarix}-{a.brend}-reel", nov="reel", media=f"{base}/reel.mp4", caption=caption))
    sh("git", "add", "-A", cwd=WT)
    sh("git", "commit", "-m", f"media {a.brend} {a.tarix} {a.slot}" + TRAILER, cwd=WT)
    sh("git", "push", "origin", "media", cwd=WT)
    sha = sh("git", "rev-parse", "HEAD", cwd=WT).strip()
    for it in items:  # deyismez URL (branch kesi 404 verebilir)
        it["url"] = f"https://raw.githubusercontent.com/revanabdulov2006-hue/composio/{sha}/{it['media']}"
    # novbe.json (main)
    sh("git", "checkout", "main"); sh("git", "pull", "--rebase", "origin", "main")
    path = f"{REPO}/paylasim/novbe.json"
    d = json.load(open(path, encoding="utf-8"))
    ids = {i["id"] for i in d["items"]}
    for it in items:
        if it["id"] in ids:
            sys.exit(f"artiq var: {it['id']}")
        it.update(brend=a.brend, tarix=a.tarix, slot=a.slot, status="gozleyir", ig_media_id=None, permalink=None, qeyd="")
        d["items"].append(it)
    json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    sh("git", "add", "paylasim/novbe.json")
    sh("git", "commit", "-m", f"novbe: {', '.join(i['id'] for i in items)}" + TRAILER)
    sh("git", "push", "origin", "main")
    print("OK", [i["id"] for i in items])

if __name__ == "__main__":
    main()
