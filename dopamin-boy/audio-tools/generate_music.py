"""Sintetiza la música (public/audio/music.wav) y los efectos (public/audio/sfx.wav)
siguiendo src/timeline.json. Todo es generado por código: sin samples, sin derechos de autor.

Uso: python generate_music.py   (requiere numpy y scipy)
"""
import json, wave
from pathlib import Path
import numpy as np
from scipy.signal import lfilter
from synth import *  # noqa: F401,F403  instrumentos y efectos

ROOT = Path(__file__).resolve().parent.parent

tl = json.loads((ROOT / "src" / "timeline.json").read_text())
FPS = tl["fps"]
SC = {}
t = 0
for s in tl["scenes"]:
    SC[s["id"]] = {**s, "start": t}
    t += s["duration"]
TOTAL = t / FPS
N = int((TOTAL + 1) * SR)
music = np.zeros(N)
sfx = np.zeros(N)


def T(sid, frame=0):
    return (SC[sid]["start"] + frame) / FPS


def end(sid):
    return T(sid, SC[sid]["duration"])


# ---------- secciones musicales ----------
BPM = 140
B = 60 / BPM
S16 = B / 4
PROG = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C G Am F
ARP = [0, 1, 2, 1, 2, 0, 1, 2]


def hype(t0, t1, filtered=False, extra_hats=False, gain=1.0):
    seg_len = int((t1 - t0) * SR) + SR
    drums = np.zeros(seg_len)
    inst = np.zeros(seg_len)
    k = 0
    while k * S16 < t1 - t0:
        at = k * S16
        chord = PROG[(k // 16) % 4]
        if (k % 4 == 0) if not filtered else (k % 8 == 0):
            add(drums, at, kick())
        if not filtered and k % 8 == 4:
            add(drums, at, clap(), 0.55)
        if k % 2 == 1 or extra_hats:
            add(drums, at, hat(open_=(k % 8 == 6)), 0.25)
        if k % 2 == 0:
            add(inst, at, bass(midi(chord[0] - 24), S16 * 1.8), 0.55)
        note = chord[ARP[k % 8]] + (12 if (k // 8) % 2 else 0)
        add(inst, at, pluck(midi(note + 12), S16 * 1.5), 0.16)
        if k % 16 in (0, 6, 10):
            add(inst, at, supersaw([midi(n) for n in chord], S16 * 3), 0.22)
        k += 1
    tb = (np.arange(seg_len) / SR) % B
    pump = 1 - 0.55 * np.exp(-tb * 14)
    mix = drums + inst * pump
    if filtered:
        mix = lp(mix, 650, 4) * 1.4
    add(music, t0, mix[: int((t1 - t0) * SR)] * fade(np.ones(int((t1 - t0) * SR)), 0.01, 0.03), gain)


def tape_stop(at, dur):
    i0, n = int(at * SR), int(dur * SR)
    seg = music[i0:i0 + n].copy()
    speed = np.linspace(1, 0, n) ** 1.2
    pos = np.cumsum(speed)
    music[i0:i0 + n] = np.interp(pos, np.arange(n), seg) * np.linspace(1, 0.2, n)
    music[i0 + n:i0 + n + int(0.2 * SR)] = 0


def drone(t0, t1, notes, cutoff=500, gain=0.35):
    add(music, t0, pad([midi(n) for n in notes], t1 - t0, cutoff), gain)


def heartbeat(t0, t1):
    at, gap = t0, 0.85
    while at < t1:
        add(music, at, lp(kick(), 180), 0.9)
        add(music, at + 0.22, lp(kick(), 180), 0.6)
        at += gap
        gap *= 1.15


def warm(t0, t1, gain=0.8):
    beat = 60 / 96
    bars = int((t1 - t0) / (beat * 4)) + 1
    for b in range(bars):
        chord = PROG[b % 4]
        at = t0 + b * beat * 4
        if at >= t1:
            break
        d = min(beat * 4, t1 - at)
        add(music, at, pad([midi(n) for n in chord] + [midi(chord[0] - 12)], d + 0.3, 1800), 0.3 * gain)
        for i in range(8):
            a2 = at + i * beat / 2
            if a2 < t1:
                add(music, a2, soft_pluck(midi(chord[[0, 1, 2, 1][i % 4]] + 12), 0.6), 0.2 * gain)
                add(music, a2, hat(), 0.06 * gain)


def suspense(t0, t1):
    k = 0
    seg = []
    while k * S16 < t1 - t0:
        at = t0 + k * S16
        root = [45, 41][(k // 32) % 2]  # A / F
        if k % 8 == 0:
            add(music, at, kick(0.8), 0.9)
        if k % 2 == 0:
            add(music, at, bass(midi(root - 12), S16 * 1.6), 0.5)
        if k % 4 == 2:
            add(music, at, hat(), 0.2)
        if k % 32 == 0:
            chord = [root + 12, root + 15 if root == 45 else root + 16, root + 19]
            add(music, at, pad([midi(n) for n in chord], 32 * S16, 1100), 0.22)
        k += 1


# ---------- arreglo ----------
hype(T("s1"), end("s1"))
hype(T("s2"), end("s2"), filtered=True)
hype(T("s3"), end("s4"))
hype(T("s5"), T("s6", 27), extra_hats=True, gain=1.1)
add(music, T("s5"), riser(end("s5") - T("s5")), 0.5)
tape_stop(T("s6"), 0.9)
drone(T("s6", 40), end("s7"), [33, 40, 45], 400, 0.4)
drone(T("s7"), end("s7"), [57, 58, 64], 700, 0.12)
heartbeat(T("s8"), T("s8", 40))
warm(T("s9", 10), T("s10", 30))
drone(T("s10", 30), end("s10"), [45, 52, 57], 600, 0.25)
add(music, T("s10", 55), riser(50 / FPS), 0.6)
suspense(T("s11", 2), end("s11") - 0.6)

# ducking de la música cuando habla la voz
duck = np.ones(N)
for s in SC.values():
    for a, b in s["parts"]:
        i0, i1 = int(T(s["id"], a - 3) * SR), int(T(s["id"], b + 4) * SR)
        duck[max(i0, 0):i1] = 0.45
duck = lfilter([0.002], [1, -0.998], duck) / 1.0
music *= np.clip(duck, 0.3, 1)

# efectos
add(sfx, T("s1"), impact(), 0.8)
for i, fr in enumerate(range(0, 23, 2)):
    add(sfx, T("s1", fr), blip(600 + i * 90), 0.15)
for sid in ("s2", "s3", "s4", "s5", "s9"):
    add(sfx, T(sid) - 0.15, whoosh(), 0.35)
for at in (8, 28, 44, 58, 70, 80, 88, 95):
    add(sfx, T("s3", at), ding(), 0.35)
    add(sfx, T("s3", at + 3), coin(), 0.12)
for fr in range(0, 120, 5):
    add(sfx, T("s4", fr), tick(), 0.25)
for at in (8, 32, 56, 80):
    add(sfx, T("s5", at), pop(), 0.5)
    add(sfx, T("s5", at), kick(1.2), 0.5)
for i in range(8):
    add(sfx, T("s6", 25 + i * 8), bloop(), 0.35)
add(sfx, T("s6", 95), alarm(), 0.25)
for fr in range(0, SC["s7"]["duration"], 3):
    if rng.random() < 0.18:
        add(sfx, T("s7", fr), glitch(), 0.25)
add(sfx, T("s7", 6), buzzer(), 0.35)
add(sfx, T("s7", 16), buzzer(), 0.3)
for fr in (0, 10, 20, 30):
    add(sfx, T("s8", fr), beep(), 0.3)
add(sfx, T("s8", 40), powerdown(), 0.45)
for fr in (30, 75, 140, 175):
    add(sfx, T("s9", fr), chirp(), 0.25)
add(sfx, T("s9", 125), fanfare(), 0.45)
add(sfx, T("s10", 30), ding(1568), 0.5)
add(sfx, T("s10", 30), vibrate(75 / FPS), 0.45)
p11 = SC["s11"]["parts"]
add(sfx, T("s11"), impact(), 0.7)
add(sfx, T("s11", p11[1][0]), whoosh(), 0.35)
add(sfx, T("s11", p11[2][0]), pop(), 0.6)
add(sfx, T("s11", p11[2][0]), ding(1046), 0.3)
add(sfx, T("s11", p11[3][0]), pop(), 0.6)
add(sfx, T("s11", p11[3][0]), ding(1397), 0.3)
add(sfx, T("s11", p11[4][0]), whoosh(), 0.4)
for fr in range(p11[4][0], SC["s11"]["duration"] - 20, 15):
    add(sfx, T("s11", fr), tick(), 0.5)
add(sfx, end("s11") - 0.6, boom(), 0.6)


def write(path, x, peak=0.89):
    x = x[: int(TOTAL * SR)]
    x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.3) / np.tanh(1.3) * peak
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


out = ROOT / "public" / "audio"
write(out / "music.wav", music, 0.8)
write(out / "sfx.wav", sfx, 0.85)
print(f"ok: {TOTAL:.1f}s")
