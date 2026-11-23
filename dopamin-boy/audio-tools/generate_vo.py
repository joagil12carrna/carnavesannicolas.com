"""Genera la voz en off (Piper TTS, voz es_AR) y src/timeline.json con:
- duración de cada escena (se adapta al largo de la voz)
- en qué frame arranca cada parte de la voz
- en qué frame aparece cada palabra del subtítulo (sincronizado con la voz)

Uso:
  python generate_vo.py <modelo.onnx>                         # v1 (voz es_AR)
  python generate_vo.py <modelo.onnx> --script v2 --pitch 0.94  # v2 (voz masculina, más grave)

Texto hablado: "|" separa partes con una pausa dramática.
Subtítulo: "|" debe coincidir con las partes de la voz; "/" corta el subtítulo en grupos.
"""
import json, wave
from pathlib import Path
from piper import PiperVoice, SynthesisConfig

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
FPS = 30
PAUSE = 0.35  # segundos

# id, voz, subtítulo, velocidad (length_scale), duración mínima (frames), delay de la voz (frames)
LINES = [
    ("s1", "¡Dopamin Boy hace ciento cincuenta días que no puede dejar el celular!",
           "Dopamin Boy hace / 150 DÍAS / que no puede / dejar el celular", 0.82, 90, 2),
    ("s2", "Son las tres y cuarenta y siete de la mañana... | y Dopamin Boy sigue escroleando.",
           "Son las / 3:47am | y Dopamin Boy / sigue scrolleando", 0.85, 110, 4),
    ("s3", "Cada notificación le da un golpe de dopamina.",
           "Cada notificación / le da un golpe / de DOPAMINA", 0.88, 130, 4),
    ("s4", "Dopamin Boy mira novecientos videos por día.",
           "Dopamin Boy mira / 900 videos / POR DÍA", 0.88, 130, 4),
    ("s5", "Pero cada vez necesita más... | para sentir lo mismo.",
           "Pero cada vez / necesita MÁS | para sentir / lo mismo", 0.9, 115, 4),
    ("s6", "Hasta que un día... | la dopamina... | se acabó.",
           "Hasta que un día | la dopamina | SE ACABÓ", 1.0, 140, 10),
    ("s7", "Dopamin Boy ya no siente nada.",
           "Dopamin Boy / ya no siente / NADA", 1.08, 110, 6),
    ("s8", "Y el celular... | se quedó sin batería.",
           "Y el celular | se quedó sin / BATERÍA", 1.0, 90, 4),
    ("s9", "Por primera vez en ciento cincuenta días, Dopamin Boy salió afuera.",
           "Por primera vez / en 150 días / Dopamin Boy / salió AFUERA", 0.95, 200, 20),
    ("s10", "Pero entonces... | el celular vibró.",
            "Pero entonces | el celular / VIBRÓ", 0.95, 120, 4),
    ("s11", "¿Y ahora? | ¿Qué hace Dopamin Boy? | ¡Uno! Agarra el celular. | ¡Dos! Lo tira por la ventana. | Comentá uno o dos... | y el final más votado sale en la parte dos.",
            "¿Y ahora? | ¿Qué hace / Dopamin Boy? | ¡UNO! / Agarra el celular | ¡DOS! / Lo tira / por la ventana | Comentá / 1 o 2 | y el final / más votado / sale en la PARTE 2", 0.88, 345, 6),
]


def word_timings(caption: str, part_starts, part_lens):
    parts = [p.strip() for p in caption.split("|")]
    assert len(parts) == len(part_starts), f"partes distintas: {caption}"
    words, chunk = [], 0
    for p, start, length in zip(parts, part_starts, part_lens):
        groups = [g.split() for g in p.split("/")]
        flat = [w for g in groups for w in g]
        weights = [len(w) + 2 for w in flat]
        total, acc, k = sum(weights), 0, 0
        for g in groups:
            for w in g:
                words.append({"t": w, "f": int(round(start + length * acc / total)), "chunk": chunk})
                acc += weights[k]; k += 1
            chunk += 1
    return words


def main(model: str, lines, prefix: str, timeline_path: Path, pitch: float, tail: int, pause: float = PAUSE):
    voice = PiperVoice.load(model)
    # pitch < 1: se reproduce un poco más lento y más grave (voz de narrador)
    rate = int(voice.config.sample_rate * pitch)
    OUT.mkdir(parents=True, exist_ok=True)
    scenes = []
    for sid, text, caption, speed, min_frames, delay in lines:
        cfg = SynthesisConfig(length_scale=speed)
        pcm = b""
        part_starts, part_lens = [], []
        for i, part in enumerate(text.split("|")):
            if i:
                pcm += b"\x00\x00" * int(rate * pause)
            s0 = len(pcm) / 2 / rate
            for chunk in voice.synthesize(part.strip(), syn_config=cfg):
                pcm += chunk.audio_int16_bytes
            s1 = len(pcm) / 2 / rate
            part_starts.append(delay + s0 * FPS)
            part_lens.append((s1 - s0) * FPS)
        with wave.open(str(OUT / f"{prefix}{sid}.wav"), "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm)
        secs = len(pcm) / 2 / rate
        vo_frames = int(round(secs * FPS))
        dur = max(min_frames, delay + vo_frames + tail)
        scenes.append({
            "id": sid, "duration": dur, "voDelay": delay, "voFrames": vo_frames,
            "parts": [[round(a), round(a + b)] for a, b in zip(part_starts, part_lens)],
            "words": word_timings(caption, part_starts, part_lens),
        })
        print(f"{sid}: voz {secs:.2f}s -> escena {dur} frames")
    timeline_path.parent.mkdir(parents=True, exist_ok=True)
    timeline_path.write_text(json.dumps({"fps": FPS, "scenes": scenes}, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument("model")
    ap.add_argument("--script", default="v1", choices=["v1", "v2"])
    ap.add_argument("--pitch", type=float, default=1.0)
    a = ap.parse_args()
    if a.script == "v2":
        from script_v2 import LINES as L2
        main(a.model, L2, "vo2_", ROOT / "src" / "v2" / "timeline.json", a.pitch, tail=5, pause=0.22)
    else:
        main(a.model, LINES, "vo_", ROOT / "src" / "timeline.json", a.pitch, tail=12)
