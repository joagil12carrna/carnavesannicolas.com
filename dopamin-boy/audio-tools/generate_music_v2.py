"""Música y efectos del video v2 (estilo "guía de supervivencia" + niveles de videojuego).
Lee src/v2/timeline.json y escribe public/audio/music2.wav y public/audio/sfx2.wav.

Uso: python generate_music_v2.py   (requiere numpy y scipy)
"""
import json, wave
from pathlib import Path
import numpy as np
from scipy.signal import lfilter
from synth import *  # noqa: F401,F403

ROOT = Path(__file__).resolve().parent.parent
tl = json.loads((ROOT / "src" / "v2" / "timeline.json").read_text())
FPS = tl["fps"]
SC, t = {}, 0
for s in tl["scenes"]:
    SC[s["id"]] = {**s, "start": t}
    t += s["duration"]
TOTAL = t / FPS
N = int((TOTAL + 1) * SR)
music = np.zeros(N)
sfx = np.zeros(N)


def T(sid, frame=0):
    return (SC[sid]["start"] + frame) / FPS


def P(sid, i, end=False):
    return T(sid, SC[sid]["parts"][i][1 if end else 0])


def END(sid):
    return T(sid, SC[sid]["duration"])


BPM = 140
B = 60 / BPM
S16 = B / 4
DM = [[62, 65, 69], [58, 62, 65], [60, 64, 67], [57, 61, 64]]  # Dm Bb C A


def b808(f0, dur, glide_to=None):
    tt_ = tt(dur)
    f = np.full(len(tt_), f0) if glide_to is None else f0 + (glide_to - f0) * np.minimum(1, tt_ / 0.12)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = np.tanh(x * 2.2) * np.exp(-tt_ * 1.6)
    return fade(x, 0.003, 0.04)


def bell(f, dur=0.9):
    tt_ = tt(dur)
    mod = np.sin(2 * np.pi * f * 3.5 * tt_) * 2.0 * np.exp(-tt_ * 4)
    return fade(np.sin(2 * np.pi * f * tt_ + mod) * np.exp(-tt_ * 3.5), 0.002, 0.05)


def chip(f, dur):
    tt_ = tt(dur)
    return fade(np.sign(np.sin(2 * np.pi * f * tt_)) * 0.5 * np.exp(-tt_ * 6), 0.002, 0.01)


def trap(t0, t1, mood="dark", gain=1.0):
    """Beat trap a medio tiempo. mood: dark | game | warm"""
    if t1 - t0 < 0.1:
        return
    k, buf = 0, np.zeros(int((t1 - t0) * SR) + SR)
    mel_dark = [74, None, 77, None, 76, None, 74, 72, None, 69, None, None, 70, None, 69, None]
    mel_game = [74, 77, 81, 77, 79, 76, 72, 76, 74, 77, 81, 84, 81, 77, 76, 72]
    while k * S16 < t1 - t0:
        at = k * S16
        bar = k // 16
        chord = DM[bar % 4] if mood != "warm" else [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]][bar % 4]
        step = k % 16
        if step in (0, 10) or (mood == "game" and step == 7):
            add(buf, at, kick(1.1), 0.9)
            add(buf, at, b808(midi(chord[0] - 24), S16 * 5), 0.55)
        if step in (4, 12) or (mood != "warm" and step == 8 and bar % 2):
            add(buf, at, clap(), 0.5)
        roll = mood != "warm" and bar % 2 == 1 and step >= 12
        if roll:
            for r in range(3):
                add(buf, at + r * S16 / 3, hat(), 0.18)
        elif step % 2 == 0 or mood == "game":
            add(buf, at, hat(), 0.2 if step % 4 == 2 else 0.12)
        if mood == "dark":
            n = mel_dark[step]
            if n:
                add(buf, at, bell(midi(n)), 0.16)
        elif mood == "game":
            add(buf, at, chip(midi(mel_game[step]), S16 * 0.9), 0.07)
        else:
            if step % 2 == 0:
                add(buf, at, soft_pluck(midi(chord[[0, 1, 2, 1][(step // 2) % 4]] + 12), 0.5), 0.2)
        if step == 0:
            add(buf, at, pad([midi(n) for n in chord], 16 * S16, 1200 if mood != "warm" else 2000), 0.16)
        k += 1
    n = int((t1 - t0) * SR)
    add(music, t0, buf[:n] * fade(np.ones(n), 0.01, 0.04), gain)


def tape_stop(at, dur):
    i0, n = int(at * SR), int(dur * SR)
    seg = music[i0:i0 + n].copy()
    pos = np.cumsum(np.linspace(1, 0, n) ** 1.2)
    music[i0:i0 + n] = np.interp(pos, np.arange(n), seg) * np.linspace(1, 0.2, n)


def level_jingle():
    out = np.zeros(int(1.0 * SR))
    for i, n in enumerate([72, 76, 79, 84]):
        add(out, i * 0.06, chip(midi(n), 0.12), 0.6)
    add(out, 0.24, chip(midi(88), 0.5), 0.6)
    return out


def scratch():
    return fade(np.concatenate([sweep(1500, 250, 0.1), sweep(250, 1200, 0.08)]) * 0.7 + hp(np.random.default_rng(3).standard_normal(int(0.18 * SR)), 1500) * 0.3, 0.002, 0.02)


def sub_drop(dur=1.2):
    return fade(sweep(90, 30, dur) * np.exp(-tt(dur) * 1.5), 0.005, 0.1)


# ---------------- arreglo musical ----------------
trap(T("h1"), END("h2"), "dark")
add(music, T("h2"), pad([midi(n) for n in (74, 77, 81, 86)], END("h2") - T("h2"), 3000), 0.25)
add(music, T("h3"), sub_drop(), 0.9)
trap(T("h3", 10), END("i2"), "dark")
trap(T("goal"), END("goal"), "game")
add(music, P("goal", 2), riser(P("goal", 3) - P("goal", 2)), 0.35)
# dopamina rápida: hype -> pico -> caída
trap(T("fast"), P("fast", 3), "game", 1.1)
add(music, P("fast", 2), riser(P("fast", 3) - P("fast", 2)), 0.5)
tape_stop(P("fast", 3) - 0.1, 0.9)
add(music, P("fast", 3) + 0.8, pad([midi(n) for n in (50, 53, 57)], END("fast") - P("fast", 3) - 0.8, 500), 0.3)
# tú también la tienes: tensión -> NO DESLICES (corte) -> súplica
trap(T("you"), P("you", 3), "dark")
add(music, P("you", 4), pad([midi(n) for n in (62, 65, 69, 72)], END("you") - P("you", 4), 1500), 0.3)
for i in range(6):
    add(music, P("you", 4) + i * 0.55, soft_pluck(midi([74, 72, 69, 72, 74, 77][i]), 0.9), 0.25)
# niveles
for lv in ("n1", "n2", "n4"):
    trap(T(lv, 10), END(lv), "game" if lv != "n4" else "warm")
# n2 a las 3 AM: la música se oscurece
i0, i1 = int(P("n2", 2) * SR), int(END("n2") * SR)
music[i0:i1] = lp(music[i0:i1], 700, 4) * 1.3
add(music, P("n2", 3), sub_drop(1.5), 0.7)
# n3: cuenta regresiva (la música se va, quedan latidos y golpes en cada número)
trap(T("n3", 10), P("n3", 3) - 0.1, "game")
counts = [P("n3", i) for i in range(3, 8)]
for i, c in enumerate(counts):
    add(music, c, lp(kick(1.3), 200), 1.0)
    add(music, c, b808(midi(38 + i), 0.8), 0.5)
    add(music, c + 0.45, lp(kick(0.8), 160), 0.6)
done = counts[-1] + 26 / FPS
trap(done + 0.4, END("n3"), "warm")
# final: victoria
trap(T("fin", 10), P("fin", 3) + 0.5, "dark", 0.8)
win = P("fin", 3) + 0.5
add(music, win, supersaw([midi(n) for n in (60, 64, 67, 72)], 2.0, 5000), 0.35)
trap(win, END("fin"), "warm")
trap(T("loop"), END("loop") - 0.05, "warm", 0.9)
# el loop corta en seco (sin fade) para empalmar con el inicio
i_end = int(END("loop") * SR)
music[i_end - int(0.6 * SR): i_end] = lp(music[i_end - int(0.6 * SR): i_end], 900)

# ducking bajo la voz
duck = np.ones(N)
for s in SC.values():
    for a, b in s["parts"]:
        i0, i1 = int(T(s["id"], a - 3) * SR), int(T(s["id"], b + 4) * SR)
        duck[max(i0, 0):i1] = 0.45
duck = lfilter([0.002], [1, -0.998], duck)
music *= np.clip(duck, 0.3, 1)

# ---------------- efectos ----------------
add(sfx, T("h1"), impact(), 0.6)
add(sfx, P("h1", 1), alarm(), 0.25)
add(sfx, P("h2", 1), ding(1568), 0.35)
add(sfx, T("h3"), impact(), 0.8)
for sid in ("i1", "i2", "goal", "fast", "you", "loop"):
    add(sfx, T(sid) - 0.12, whoosh(), 0.35)
for i in range(3):
    add(sfx, P("i1", 1) + (8 + i * 14) / FPS, pop(), 0.5)
for i in range(12):
    add(sfx, T("i2", 4 + i * 3), blip(400 + i * 60), 0.12)
add(sfx, T("i2", 40), buzzer(), 0.25)
add(sfx, P("i2", 1) + 0.2, riser(1.0), 0.4)
add(sfx, T("goal"), level_jingle(), 0.5)
add(sfx, P("goal", 3), impact(), 0.5)
for i in range(3):
    add(sfx, P("fast", 1) + i * 16 / FPS, ding(), 0.35)
add(sfx, P("you", 2), ding(1046), 0.3)
add(sfx, P("you", 3), scratch(), 0.6)
add(sfx, P("you", 3), impact(), 0.6)
for lv in ("n1", "n2", "n3", "n4", "fin"):
    add(sfx, T(lv), level_jingle(), 0.55)
    add(sfx, T(lv), kick(1.4), 0.6)
add(sfx, P("n1", 1) + 25 / FPS, pop(), 0.6)
add(sfx, P("n2", 1), whoosh(0.5), 0.4)
add(sfx, P("n2", 3), alarm(), 0.2)
for c in counts:
    add(sfx, c, tick(), 0.8)
add(sfx, done, fanfare(), 0.5)
for i in range(3):
    add(sfx, P("n4", 2) + i * 22 / FPS, pop(), 0.5)
add(sfx, P("fin", 1), impact(), 0.45)
add(sfx, win, fanfare(), 0.55)
for i in range(4):
    add(sfx, P("fin", 4) + i * 6 / FPS, pop(), 0.45)
add(sfx, T("loop", 20), ding(1568), 0.5)
add(sfx, T("loop", 20), vibrate((SC["loop"]["duration"] - 20) / FPS), 0.5)
# glitch mientras la barra vuelve a subir en el loop
for fr in range(40, SC["loop"]["duration"], 4):
    add(sfx, T("loop", fr), glitch(), 0.15)


def write(path, x, peak):
    x = x[: int(TOTAL * SR)]
    x = np.tanh(x / (np.max(np.abs(x)) + 1e-9) * 1.3) / np.tanh(1.3) * peak
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


out = ROOT / "public" / "audio"
write(out / "music2.wav", music, 0.8)
write(out / "sfx2.wav", sfx, 0.85)
print(f"ok: {TOTAL:.1f}s")
