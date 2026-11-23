import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C, fontFamily } from "../theme";

export const Flash: React.FC<{ color?: string; frames?: number }> = ({ color = "white", frames = 6 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, frames], [1, 0], { extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};

// Fondo neón con rayos giratorios (estilo "anime speed")
export const NeonBurst: React.FC<{ a?: string; b?: string; speed?: number }> = ({ a = C.pink, b = C.violet, speed = 1 }) => {
  const f = useCurrentFrame();
  const rays = 18;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${a}, ${b} 70%)`, overflow: "hidden" }}>
      <svg viewBox="-100 -100 200 200" style={{ position: "absolute", width: 3200, height: 3200, left: -1060, top: -830, transform: `rotate(${f * 0.8 * speed}deg)` }}>
        {Array.from({ length: rays }).map((_, i) => {
          const a1 = (i / rays) * Math.PI * 2;
          const a2 = a1 + Math.PI / rays;
          return <polygon key={i} points={`0,0 ${Math.cos(a1) * 150},${Math.sin(a1) * 150} ${Math.cos(a2) * 150},${Math.sin(a2) * 150}`} fill="white" opacity={0.09} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// Emojis flotando por detrás
export const EmojiRain: React.FC<{ emojis: string[]; count?: number; seed?: string; speed?: number; size?: number }> = ({
  emojis, count = 18, seed = "e", speed = 1, size = 90,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const x = random(`${seed}x${i}`) * 1080;
        const v = (6 + random(`${seed}v${i}`) * 14) * speed;
        const y = ((random(`${seed}y${i}`) * 2200 + f * v) % 2300) - 200;
        const r = Math.sin((f + i * 10) / 10) * 25;
        const s = 0.6 + random(`${seed}s${i}`) * 0.9;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: size * s, transform: `rotate(${r}deg)`, opacity: 0.85 }}>
            {emojis[i % emojis.length]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// Texto tipo sello / "stamp" que golpea la pantalla
export const Stamp: React.FC<{ children: React.ReactNode; at?: number; color?: string; size?: number; rotate?: number; style?: React.CSSProperties }> = ({
  children, at = 0, color = C.yellow, size = 130, rotate = -6, style,
}) => {
  const f = useCurrentFrame() - at;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 8, stiffness: 260 } });
  return (
    <div
      style={{
        fontFamily, fontSize: size, color, WebkitTextStroke: "14px black", paintOrder: "stroke fill",
        textShadow: "0 12px 0 black", textAlign: "center", lineHeight: 1,
        transform: `scale(${interpolate(s, [0, 1], [3, 1])}) rotate(${rotate}deg)`,
        opacity: interpolate(f, [0, 3], [0, 1], { extrapolateRight: "clamp" }),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Barras de glitch horizontales
export const GlitchBars: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const f = useCurrentFrame();
  const on = random(`g${Math.floor(f / 2)}`) < 0.6 * intensity;
  if (!on) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {Array.from({ length: 6 }).map((_, i) => {
        const y = random(`gy${f}${i}`) * 1920;
        const h = 10 + random(`gh${f}${i}`) * 80;
        const x = (random(`gx${f}${i}`) - 0.5) * 160;
        const col = [C.cyan, C.pink, C.lime][i % 3];
        return <div key={i} style={{ position: "absolute", top: y, left: x, width: 1080, height: h, background: col, opacity: 0.35 }} />;
      })}
    </AbsoluteFill>
  );
};

// Contador de días fijo arriba: genera "loop mental" y retención
export const DayChip: React.FC<{ day: number; dim?: boolean }> = ({ day, dim }) => {
  const f = useCurrentFrame();
  const pulse = 1 + Math.sin(f / 4) * 0.03;
  return (
    <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{
        fontFamily, fontSize: 64, color: "white", background: dim ? "#444" : C.red, padding: "10px 36px", borderRadius: 30,
        border: "7px solid black", transform: `scale(${pulse}) rotate(-2deg)`, boxShadow: "0 10px 0 black",
      }}>
        🔴 DÍA {day}
      </div>
    </div>
  );
};
