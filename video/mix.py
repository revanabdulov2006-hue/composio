#!/usr/bin/env python3
"""Video + ses qarisdirma.
python3 mix.py --video vid.mp4 --voice vo.wav --music a/arxa-01.mp3 --cues cues.json --out final.mp4 [--music-db -3] [--ratio 2]
cues.json: [{"t": 1.25, "file": "sfx/pop-331049.mp3", "db": -6}, ...]   (t saniye, db ixtiyari)
Ses: danis loudnorm -16 LUFS; musiqi loudnorm -24 LUFS + music-db (YG: -3, AB: -3); sidechain ducking;
SFX adelay ile yerlesdirilir; limiter 0.89; AAC 192k.
"""
import argparse, json, subprocess, sys

p = argparse.ArgumentParser()
p.add_argument("--video", required=True); p.add_argument("--voice", required=True)
p.add_argument("--music", required=True); p.add_argument("--cues", required=True)
p.add_argument("--out", required=True)
p.add_argument("--music-db", type=float, default=-3.0)
p.add_argument("--ratio", type=float, default=2.5)
a = p.parse_args()
cues = json.load(open(a.cues, encoding="utf-8"))
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                     "-of", "csv=p=0", a.video], text=True).strip())
inputs = ["-i", a.video, "-i", a.voice, "-stream_loop", "-1", "-i", a.music]
for c in cues:
    inputs += ["-i", c["file"]]
f = [f"[1:a]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,asplit=2[vo][vosc]",
     f"[2:a]atrim=0:{dur},loudnorm=I=-24:TP=-2:LRA=11,volume={a.music_db}dB,aresample=48000[mu]",
     f"[mu][vosc]sidechaincompress=threshold=0.03:ratio={a.ratio}:attack=20:release=400[mud]"]
labels = ["[vo]", "[mud]"]
for i, c in enumerate(cues):
    ms = int(c["t"] * 1000)
    db = c.get("db", -8)
    f.append(f"[{i+3}:a]aresample=48000,volume={db}dB,adelay={ms}|{ms}[s{i}]")
    labels.append(f"[s{i}]")
f.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,"
         f"atrim=0:{dur},alimiter=limit=0.89[aout]")
cmd = ["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(f), "-map", "0:v", "-map", "[aout]",
       "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", a.out]
sys.exit(subprocess.call(cmd))
