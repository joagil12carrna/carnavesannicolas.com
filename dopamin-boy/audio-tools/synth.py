"""Instrumentos y efectos sintetizados (numpy/scipy) compartidos por los generadores de música."""
import numpy as np
from scipy.signal import butter, lfilter

SR = 44100
rng = np.random.default_rng(7)


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


