import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily } from "../theme";

/**
 * Subtítulos estilo TikTok: aparecen palabra por palabra, de a 3, la palabra activa
 * se pinta y "rebota". Las palabras en MAYÚSCULAS se resaltan en rosa.
 */
export const Caption: React.FC<{
  text: string;
  start?: number;
  wordFrames?: number;
  top?: number;
  chunk?: number;
}> = ({ text, start = 0, wordFrames = 7, top = 1230, chunk = 3 }) => {
  const frame = useCurrentFrame() - start;
  const { fps } = useVideoConfig();
  if (frame < 0) return null;
  // "/" marca cortes manuales de frase; si no hay, se agrupa de a `chunk` palabras
  const groups: string[][] = text.includes("/")
    ? text.split("/").map((g) => g.trim().split(" "))
    : text.split(" ").reduce<string[][]>((acc, w, i) => {
        if (i % chunk === 0) acc.push([]);
        acc[acc.length - 1].push(w);
        return acc;
      }, []);
  const words = groups.flat();
  const idx = Math.min(words.length - 1, Math.floor(frame / wordFrames));
  let chunkStart = 0;
  let visible: string[] = groups[0];
  for (const g of groups) {
    if (idx < chunkStart + g.length) { visible = g; break; }
    chunkStart += g.length;
  }
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 46px" }}>
      {visible.map((w, i) => {
        const wi = chunkStart + i;
        if (wi > idx) return null;
        const local = frame - wi * wordFrames;
        const s = spring({ frame: local, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
        const active = wi === idx;
        const loud = w === w.toUpperCase() && /[A-ZÁÉÍÓÚÑ]{2,}/.test(w);
        const color = loud ? C.pink : active ? C.yellow : "white";
        const rot = interpolate(s, [0, 1], [i % 2 ? 10 : -10, i % 2 ? 2 : -2]);
        return (
          <span
            key={wi}
            style={{
              fontFamily,
              fontSize: loud ? 150 : 112,
              lineHeight: 1.15,
              color,
              WebkitTextStroke: "14px black",
              paintOrder: "stroke fill",
              textShadow: "0 10px 0 rgba(0,0,0,.85)",
              transform: `scale(${interpolate(s, [0, 1], [0.3, active ? 1.08 : 1])}) rotate(${rot}deg)`,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
