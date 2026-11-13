#!/usr/bin/env python3
"""Google AI Studio / Gemini Image generasiyası. Stdlib-only.

Açar env GEMINI_API_KEY-dən gəlir, heç vaxt çap olunmur.
JOBS = JSON massiv: [{"prompt": "...", "out": "img/.../a.png", "aspect": "1:1"}, ...]
MODEL boş olarsa mövcud modellərdən ən yaxşı şəkil modeli avtomatik seçilir.
"""
import os, sys, json, base64, re, urllib.request, urllib.error

KEY = os.environ.get("GEMINI_API_KEY", "")
BASE = "https://generativelanguage.googleapis.com/v1beta"
if not KEY:
    sys.exit("GEMINI_API_KEY secret is empty")


def call(method, path, body=None, timeout=300):
    req = urllib.request.Request(
        BASE + path, method=method,
        data=None if body is None else json.dumps(body).encode(),
        headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read())


def call_soft(method, path, body=None):
    """Returns (data, err_string)."""
    try:
        return call(method, path, body), None
    except urllib.error.HTTPError as e:
        return None, "HTTP %s: %s" % (e.code, e.read().decode()[:400])
    except Exception as e:
        return None, "%s: %s" % (type(e).__name__, e)


def list_models():
    out, tok, page = [], "", 0
    while True:
        d, err = call_soft("GET", "/models?pageSize=200" + ("&pageToken=" + tok if tok else ""))
        if err:
            sys.exit("model list failed -> " + err)
        out += d.get("models", [])
        tok = d.get("nextPageToken") or ""
        page += 1
        if not tok or page > 40:
            return out


def score(name):
    n = name.lower()
    s = 0.0
    m = re.search(r"(\d+(?:\.\d+)?)", n)
    if m:
        s += float(m.group(1)) * 10
    if "pro" in n:
        s += 60
    if "ultra" in n:
        s += 40
    if "flash" in n:
        s += 10
    if "preview" in n:
        s -= 4
    if "lite" in n:
        s -= 20
    return s


def pick_model(models):
    cand = []
    for m in models:
        name = m.get("name", "")
        meth = m.get("supportedGenerationMethods") or m.get("supported_generation_methods") or []
        low = name.lower()
        if "image" not in low and "imagen" not in low:
            continue
        if any(b in low for b in ("tts", "embed", "aqa", "vision-")):
            continue
        if not ({"generateContent", "predict"} & set(meth)):
            continue
        cand.append((score(name), name, meth))
    cand.sort(reverse=True)
    print("image-capable models:", [c[1] for c in cand])
    if not cand:
        sys.exit("no image-capable model found; see img/models.json")
    return cand[0][1], cand[0][2]


def extract_images(d):
    outs = []
    for c in d.get("candidates", []):
        for p in (c.get("content") or {}).get("parts", []):
            inl = p.get("inlineData") or p.get("inline_data")
            if inl and inl.get("data"):
                outs.append(base64.b64decode(inl["data"]))
    for pr in d.get("predictions", []):
        b = pr.get("bytesBase64Encoded") or pr.get("bytes_base64_encoded")
        if b:
            outs.append(base64.b64decode(b))
    return outs


def generate(model, meth, prompt, aspect):
    """Try a few request shapes; return (bytes, note) or (None, error)."""
    errs = []
    if "generateContent" in meth:
        gc = {"responseModalities": ["IMAGE"]}
        shapes = []
        if aspect:
            shapes.append({"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": aspect}})
        shapes.append(gc)
        shapes.append({"responseModalities": ["TEXT", "IMAGE"]})
        for g in shapes:
            body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": g}
            d, err = call_soft("POST", "/models/%s:generateContent" % model.split("/")[-1], body)
            if err:
                errs.append(err)
                continue
            imgs = extract_images(d)
            if imgs:
                return imgs[0], "generateContent " + json.dumps(g.get("imageConfig", {}))
            errs.append("no image part in response")
    if "predict" in meth:
        params = {"sampleCount": 1}
        if aspect:
            params["aspectRatio"] = aspect
        body = {"instances": [{"prompt": prompt}], "parameters": params}
        d, err = call_soft("POST", "/models/%s:predict" % model.split("/")[-1], body)
        if err:
            errs.append(err)
        else:
            imgs = extract_images(d)
            if imgs:
                return imgs[0], "predict"
            errs.append("no image in predictions")
    return None, " | ".join(errs[:3])


def is_quota_error(note):
    """429 / RESOURCE_EXHAUSTED / 'quota' -> Gemini free-tier kvotasi bitib."""
    low = (note or "").lower()
    return "429" in low or "resource_exhausted" in low or "quota" in low


def main():
    jobs_raw = os.environ.get("JOBS", "").strip()
    jobs_file = os.environ.get("JOBS_FILE", "").strip()
    if not jobs_raw and jobs_file:
        jobs_raw = open(jobs_file, encoding="utf-8").read().strip()
        print("jobs from file:", jobs_file)
    want = os.environ.get("MODEL", "").strip()
    models = list_models()
    os.makedirs("img", exist_ok=True)
    json.dump([{"name": m.get("name"), "methods": m.get("supportedGenerationMethods")} for m in models],
              open("img/models.json", "w"), indent=1)
    if want:
        hit = [m for m in models if m.get("name", "").split("/")[-1] == want.split("/")[-1]]
        if not hit:
            sys.exit("model '%s' not available; see img/models.json" % want)
        model = hit[0]["name"]
        meth = hit[0].get("supportedGenerationMethods") or ["generateContent"]
        print("using requested model:", model)
    else:
        model, meth = pick_model(models)
        print("auto-picked model:", model)
    if not jobs_raw:
        print("JOBS empty -> only wrote img/models.json")
        return
    jobs = json.loads(jobs_raw)
    ok, fail, quota_fail = 0, [], []
    for j in jobs:
        outp = j["out"]
        os.makedirs(os.path.dirname(outp) or ".", exist_ok=True)
        data, note = generate(model, meth, j["prompt"], j.get("aspect", ""))
        if data is None:
            print("FAIL", outp, "->", note)
            fail.append(outp)
            if is_quota_error(note):
                quota_fail.append(outp)
            continue
        open(outp, "wb").write(data)
        print("OK", outp, len(data), "bytes", "(%s)" % note)
        ok += 1
    print("done: %d ok, %d failed (%d quota)" % (ok, len(fail), len(quota_fail)))
    if fail and len(quota_fail) == len(fail):
        # Butun ugursuzluqlar Gemini kvotasi bitdiyi ucundur (HTTP 429).
        # Workflow-u "fail" statusu ile bitirib render zencirini dayandirmaq
        # yerine, aydin bir isare qoyub sifir exit kodu ile cixiriq ki,
        # sonraki render merhelesi bunu oxuyub sekilsiz davam ede bilsin.
        marker = "img/QUOTA_EXCEEDED"
        with open(marker, "w", encoding="utf-8") as f:
            f.write("Gemini kvotasi bitib (HTTP 429). Ugursuz sekiller: "
                    + ", ".join(fail) + "\n")
        gh_out = os.environ.get("GITHUB_OUTPUT", "")
        if gh_out:
            with open(gh_out, "a", encoding="utf-8") as f:
                f.write("quota_exceeded=true\n")
        print("KVOTA_BITIB: %d sekil kvota sebebi ile alinmadi, bu %s "
              "faylinda qeyd olundu. Script success (0) ile cixir ki, "
              "workflow fail olmasin." % (len(fail), marker))
        return
    if fail:
        sys.exit("failed: " + ", ".join(fail))


main()
