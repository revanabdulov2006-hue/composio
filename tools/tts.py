#!/usr/bin/env python3
"""Gemini TTS: stdlib only. Key comes from env GEMINI_API_KEY (never printed)."""
import os, sys, json, base64, wave, urllib.request, urllib.error

KEY = os.environ.get("GEMINI_API_KEY", "")
BASE = "https://generativelanguage.googleapis.com/v1beta"
if not KEY:
    sys.exit("GEMINI_API_KEY secret is empty")

def call(method, path, body=None):
    req = urllib.request.Request(BASE + path, method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit("HTTP %s on %s %s: %s" % (e.code, method, path, e.read().decode()[:600]))

def list_voices():
    out, tok, page = [], "", 0
    while True:
        d = call("GET", "/voices?pageSize=100" + ("&pageToken=" + tok if tok else ""))
        if page == 0:
            print("list response keys:", sorted(d.keys()))
        out += d.get("voices", [])
        tok = d.get("nextPageToken") or d.get("next_page_token") or ""
        page += 1
        if not tok or page > 60:
            return out

def name_of(v):
    return v.get("displayName") or v.get("display_name") or ""

def main():
    text, voice, outp = os.environ.get("TEXT", ""), os.environ.get("VOICE", "Bodi"), os.environ.get("OUT", "voice/out.wav")
    style, model = os.environ.get("STYLE", ""), os.environ.get("MODEL", "gemini-3.8-flash-tts")
    voices = list_voices()
    os.makedirs("voice", exist_ok=True)
    slim = [{k: x for k, x in v.items() if k not in ("sample_audio", "sampleAudio")} for v in voices]
    json.dump(slim, open("voice/voices.json", "w"), ensure_ascii=False, indent=1)
    print("voice count:", len(voices))
    q = os.environ.get("VOICE", "").strip().lower()
    print("names containing query:", [name_of(v) for v in voices if q and q in name_of(v).lower()])
    if not text.strip():
        return
    match = [v for v in voices if name_of(v).strip().lower() == voice.strip().lower()]
    vid = (match[0].get("id") or match[0].get("name")) if match else voice
    if not match:
        sys.exit("voice '%s' not found among %d stored voices (see voice/voices.json)" % (voice, len(voices)))
    prompt = (style.strip() + ": " if style.strip() else "") + text
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["AUDIO"],
                                 "speechConfig": {"voiceConfig": {"voice": vid}}}}
    d = call("POST", "/models/%s:generateContent" % model, body)
    part = d["candidates"][0]["content"]["parts"][0]["inlineData"]
    pcm = base64.b64decode(part["data"])
    rate = 24000
    if "rate=" in part.get("mimeType", ""):
        rate = int(part["mimeType"].split("rate=")[1].split(";")[0])
    os.makedirs(os.path.dirname(outp) or ".", exist_ok=True)
    with wave.open(outp, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm)
    print("wrote", outp, "%.2f s" % (len(pcm) / 2 / rate), "model", model)

main()
