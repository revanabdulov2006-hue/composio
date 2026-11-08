#!/usr/bin/env python3
"""Ses faylinda her cumlenin baslama/bitme vaxtini Gemini ile tapir.
env: GEMINI_API_KEY, AUDIO (wav yolu), LINES (cumleler, '|' ile), OUT (json), MODEL (opsional)"""
import os, sys, json, base64, urllib.request, urllib.error
KEY = os.environ.get("GEMINI_API_KEY", "").strip()
if not KEY: sys.exit("GEMINI_API_KEY yoxdur")
B = "https://generativelanguage.googleapis.com/v1beta"
def call(method, path, body=None):
    req = urllib.request.Request(B + path, method=method, headers={"x-goog-api-key": KEY, "Content-Type": "application/json"},
                                 data=json.dumps(body).encode() if body is not None else None)
    try:
        with urllib.request.urlopen(req, timeout=300) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:800]); return None
model = os.environ.get("MODEL", "").strip()
if not model:
    ms = (call("GET", "/models?pageSize=200") or {}).get("models", [])
    cands = [m["name"].split("/")[-1] for m in ms if "generateContent" in m.get("supportedGenerationMethods", [])
             and "flash" in m["name"] and not any(x in m["name"] for x in ("tts", "image", "live", "lite", "embedding", "audio"))]
    print("modeller:", cands)
    pref = [c for c in cands if "latest" in c] or sorted(cands, reverse=True)
    model = pref[0] if pref else "gemini-2.5-flash"
print("model:", model)
lines = [l.strip() for l in os.environ["LINES"].split("|") if l.strip()]
audio = base64.b64encode(open(os.environ["AUDIO"], "rb").read()).decode()
prompt = ("This audio is an Azerbaijani voiceover. It contains exactly these lines in order:\n" +
          "\n".join(f"{i+1}. {l}" for i, l in enumerate(lines)) +
          "\nReturn ONLY a JSON array, one object per line, in the same order: "
          '{"i": line number, "start": seconds, "end": seconds} with millisecond precision, '
          "start = first audible sound of the line, end = last audible sound.")
body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": audio}}, {"text": prompt}]}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
res = call("POST", f"/models/{model}:generateContent", body)
if not res: sys.exit(1)
txt = "".join(p.get("text", "") for p in res["candidates"][0]["content"]["parts"])
data = json.loads(txt)
for d in data:
    d["text"] = lines[d["i"] - 1]
json.dump({"model": model, "lines": data}, open(os.environ["OUT"], "w"), ensure_ascii=False, indent=1)
print(json.dumps(data, ensure_ascii=False))
