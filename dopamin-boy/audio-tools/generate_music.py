"""Sintetiza la música (public/audio/music.wav) y los efectos (public/audio/sfx.wav)
siguiendo src/timeline.json. Todo es generado por código: sin samples, sin derechos de autor.

Uso: python generate_music.py   (requiere numpy y scipy)
"""
import json, wave
from pathlib import Path
import numpy as np
from scipy.signal import butter, lfilter

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
rng = np.random.default_rng(7)

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


def add(buf, at, sig, gain=1.0):
    i = int(at * SR)
    if i < 0:
        sig, i = sig[-i:], 0
    n = min(len(sig), len(buf) - i)
    if n > 0:
        buf[i:i + n] += sig[:n] * gain


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR / 2 - 100) / (SR / 2), "low")
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), "high")
    return lfilter(b, a, x)


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def saw(f, t):
    return 2 * ((t * f) % 1) - 1


def sweep(f0, f1, dur, curve=1.0):
    t = tt(dur)
    f = f0 + (f1 - f0) * (t / dur) ** curve
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def fade(x, a=0.005, r=0.02):
    x = x.copy()
    na, nr = int(a * SR), int(r * SR)
    if na:
        x[:na] *= np.linspace(0, 1, na)
    if nr:
        x[-nr:] *= np.linspace(1, 0, nr)
    return x


# ---------- instrumentos ----------
def kick(power=1.0):
    t = tt(0.4)
    f = 45 + 110 * np.exp(-t * 32)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) + 0.3 * np.exp(-t * 300) * rng.standard_normal(len(t))) * power


def clap():
    t = tt(0.25)
    e = np.exp(-t * 18) + sum(np.exp(-np.maximum(t - d, 0) * 300) * (t >= d) for d in (0, 0.012, 0.024)) * 0.5
    return hp(lp(rng.standard_normal(len(t)), 3500), 900) * e


def hat(open_=False):
    t = tt(0.3 if open_ else 0.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (12 if open_ else 70))


def bass(f, dur):
    t = tt(dur)
    x = 0.6 * saw(f, t) + 0.6 * np.sin(2 * np.pi * f * t)
    return fade(lp(x, 500) * np.exp(-t * 3), 0.004, 0.02)


def pluck(f, dur, bright=4000):
    t = tt(dur)
    x = 0.6 * saw(f, t) + 0.4 * np.sign(np.sin(2 * np.pi * f * 1.005 * t))
    return fade(lp(x, bright) * np.exp(-t * 9), 0.002, 0.02)


def soft_pluck(f, dur):
    t = tt(dur)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return fade(x * np.exp(-t * 4), 0.003, 0.05)


def supersaw(freqs, dur, cutoff=3000):
    t = tt(dur)
    x = sum(saw(f * d, t) for f in freqs for d in (0.993, 1.0, 1.007)) / (3 * len(freqs))
    return fade(lp(x, cutoff), 0.01, 0.08)


def pad(freqs, dur, cutoff=1400):
    x = supersaw(freqs, dur, cutoff)
    n = len(x)
    env = np.minimum(1, np.arange(n) / (0.4 * SR)) * np.minimum(1, (n - np.arange(n)) / (0.5 * SR))
    return x * env


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


# ---------- efectos ----------
def noise(dur):
    return rng.standard_normal(int(dur * SR))


def whoosh(dur=0.35):
    t = tt(dur)
    return hp(lp(noise(dur), 4000), 400) * np.sin(np.pi * t / dur) ** 2


def impact():
    t = tt(1.2)
    k = kick(1.4)
    return np.pad(k, (0, len(t) - len(k))) + lp(noise(1.2), 2500) * np.exp(-t * 5) * 0.5


def ding(f=1318.5):
    t = tt(0.6)
    a = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 7)
    b = (np.sin(2 * np.pi * f * 1.335 * t) + 0.3 * np.sin(4 * np.pi * f * 1.335 * t)) * np.exp(-t * 6)
    return fade(a, 0.002, 0.05) + np.pad(fade(b, 0.002, 0.05), (int(0.08 * SR), 0))[: len(a)]


def coin():
    t1, t2 = tt(0.06), tt(0.25)
    a = np.sign(np.sin(2 * np.pi * 988 * t1))
    b = np.sign(np.sin(2 * np.pi * 1319 * t2)) * np.exp(-t2 * 10)
    return lp(np.concatenate([a, b]), 6000)


def pop():
    return fade(sweep(900, 250, 0.08), 0.001, 0.01)


def blip(f):
    t = tt(0.04)
    return fade(np.sign(np.sin(2 * np.pi * f * t)), 0.001, 0.01)


def bloop():
    return fade(sweep(700, 140, 0.16, 0.6), 0.002, 0.02)


def alarm():
    t = tt(0.7)
    f = np.where((t * 6).astype(int) % 2 == 0, 440, 330)
    return lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 2500) * 0.6


def glitch():
    x = noise(0.08)
    x = np.repeat(x[::40], 40)[: len(x)]
    return fade(np.round(x * 3) / 3, 0.001, 0.005)


def buzzer():
    t = tt(0.35)
    return fade(lp(saw(110, t) + saw(116, t), 1800), 0.005, 0.05)


def beep():
    t = tt(0.08)
    return fade(np.sin(2 * np.pi * 2000 * t), 0.002, 0.01)


def powerdown():
    return fade(sweep(900, 50, 0.8, 0.5) * np.linspace(1, 0.3, int(0.8 * SR)), 0.005, 0.1)


def chirp():
    out = np.zeros(int(0.35 * SR))
    for i in range(3):
        c = fade(sweep(3200, 4600, 0.06), 0.002, 0.01) * 0.6
        add(out, i * 0.1, c)
    return out


def fanfare():
    out = np.zeros(int(1.4 * SR))
    for i, n in enumerate([72, 76, 79, 84]):
        add(out, i * 0.09, pluck(midi(n), 0.9 if i == 3 else 0.3, 6000), 0.5)
    add(out, 0.27, supersaw([midi(72), midi(76), midi(79), midi(84)], 1.1, 5000), 0.4)
    return out


def vibrate(dur):
    t = tt(dur)
    gate = ((t % 0.5) < 0.32).astype(float)
    return lp(np.sign(np.sin(2 * np.pi * 150 * t)) * gate, 600) * 0.7


def riser(dur):
    t = tt(dur)
    return (hp(noise(dur), 2000) * 0.4 + sweep(200, 1400, dur, 2) * 0.5) * (t / dur) ** 2


def tick():
    return hp(noise(0.02), 3000) * np.exp(-tt(0.02) * 200)


def boom():
    t = tt(1.8)
    return np.sin(2 * np.pi * np.cumsum(40 + 60 * np.exp(-t * 10)) / SR) * np.exp(-t * 2.5) + lp(noise(1.8), 800) * np.exp(-t * 4) * 0.4


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
