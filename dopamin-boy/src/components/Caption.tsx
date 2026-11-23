import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../theme";
import { timing, Word } from "../timeline";

/**
 * Subtítulos estilo TikTok sincronizados con la voz (timeline.json):
 * cada palabra aparece cuando se dice, la activa se pinta amarilla y rebota,
 * las palabras en MAYÚSCULAS salen gigantes en rosa.
 */
export const Caption: React.FC<{ id?: string; words?: Word[]; top?: number; size?: number }> = ({ id, words: given, top = 1230, size = 112 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = given ?? timing(id!).words;
  let idx = -1;
  words.forEach((w, i) => {
    if (w.f <= frame) idx = i;
  });
  if (idx < 0) return null;
  const chunk = words[idx].chunk;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 52px" }}>
      {words.map((w, wi) => {
        if (w.chunk !== chunk || wi > idx) return null;
        const local = frame - w.f;
        const s = spring({ frame: local, fps, config: { damping: 13, stiffness: 240, mass: 0.6 } });
        const active = wi === idx;
        const loud = w.t === w.t.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{2,}/.test(w.t);
        const color = loud ? C.pink : active ? C.yellow : "white";
        const rot = interpolate(s, [0, 1], [wi % 2 ? 10 : -10, wi % 2 ? 2 : -2]);
        return (
          <span
            key={wi}
            style={{
              fontFamily,
              fontSize: loud ? size * 1.34 : size,
              lineHeight: 1.15,
              color,
              WebkitTextStroke: "14px black",
              paintOrder: "stroke fill",
              textShadow: "0 10px 0 rgba(0,0,0,.85)",
              transform: `scale(${interpolate(s, [0, 1], [0.3, active ? 1.08 : 1])}) rotate(${rot}deg)`,
              display: "inline-block",
            }}
          >
            {w.t}
          </span>
        );
      })}
    </div>
  );
};
