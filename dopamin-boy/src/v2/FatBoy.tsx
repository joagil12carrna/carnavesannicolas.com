import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";

export type FatMood = "scroll" | "viewer" | "spiral" | "plead" | "sad" | "happy" | "effort" | "shock" | "bored";

const SKIN = "#F2C29B";
const SKIN_D = "#E0A47E";
const HOODIE = "#7A8B5C";
const HOODIE_L = "#8E9F6D";
const HAIR = "#3A2A3F";
const INK = C.ink;

const spiral = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 90; i++) {
    const t = (i / 90) * 3 * Math.PI * 2;
    const r = (i / 90) * 20;
    pts.push(`${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r).toFixed(1)}`);
  }
  return "M" + pts.join(" L");
})();

/** Dopamin Boy v2: gordito, grasiento, ojeras, granos, buzo manchado y celular pegado a la mano. */
export const FatBoy: React.FC<{
  mood?: FatMood;
  phone?: boolean;
  glow?: string;
  sweat?: boolean;
  jog?: boolean;
  gray?: boolean;
  look?: [number, number];
  size?: number;
  style?: React.CSSProperties;
}> = ({ mood = "scroll", phone = true, glow = C.cyan, sweat = false, jog = false, gray = false, look, size = 600, style }) => {
  const f = useCurrentFrame();
  const [lx, ly] = look ?? (mood === "scroll" || mood === "bored" ? [0.2, 1] : [0, 0]);
  const breathe = Math.sin(f / 12) * 0.012;
  const jogY = jog ? -Math.abs(Math.sin(f / 4)) * 28 : 0;
  const jiggle = jog ? Math.sin(f / 2) * 8 : Math.sin(f / 12) * 2;
  const tremble = mood === "effort" ? Math.sin(f * 2.3) * 3 : 0;
  const lidDrop = mood === "scroll" || mood === "bored" || mood === "sad" ? 0.55 : mood === "effort" ? 0.35 : 0;
  const big = mood === "plead";
  const drool = (f % 45) / 45;
  const eye = (cx: number) => {
    const cy = 215;
    const ry = big ? 30 : mood === "shock" ? 30 : 24;
    return (
      <g key={cx}>
        <ellipse cx={cx} cy={cy} rx={big ? 34 : 30} ry={ry} fill="white" stroke={INK} strokeWidth={6} />
        {(mood === "scroll" || mood === "spiral") && (
          <g stroke="#E5534B" strokeWidth={2} opacity={0.7}>
            <path d={`M${cx - 26} ${cy + 4} l10 -3 l6 4`} fill="none" />
            <path d={`M${cx + 26} ${cy - 2} l-9 4 l-5 -3`} fill="none" />
          </g>
        )}
        {mood === "spiral" ? (
          <g transform={`translate(${cx} ${cy}) rotate(${f * 20})`}>
            <path d={spiral} fill="none" stroke={C.pink} strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx={cx + lx * 10} cy={cy + ly * 8} r={big ? 16 : mood === "shock" ? 7 : 10} fill={INK} />
            <circle cx={cx + lx * 10 - 4} cy={cy + ly * 8 - 4} r={big ? 6 : 3} fill="white" />
            {big && <circle cx={cx + 6} cy={cy + 6} r={3} fill="white" />}
          </g>
        )}
        {lidDrop > 0 && (
          <path
            d={`M${cx - 34} ${cy - ry - 2} L${cx + 34} ${cy - ry - 2} L${cx + 34} ${cy - ry + ry * 2 * lidDrop} Q${cx} ${cy - ry + ry * 2 * lidDrop + 8} ${cx - 34} ${cy - ry + ry * 2 * lidDrop} Z`}
            fill={SKIN}
            stroke={INK}
            strokeWidth={5}
          />
        )}
        <path d={`M${cx - 28} ${cy + 30} Q${cx} ${cy + 46} ${cx + 28} ${cy + 30}`} stroke="#8A5A9E" strokeWidth={6} fill="none" opacity={0.7} strokeLinecap="round" />
        <path d={`M${cx - 22} ${cy + 42} Q${cx} ${cy + 54} ${cx + 22} ${cy + 42}`} stroke="#8A5A9E" strokeWidth={4} fill="none" opacity={0.4} strokeLinecap="round" />
      </g>
    );
  };
  const brow =
    mood === "plead" || mood === "sad"
      ? "M150 168 Q200 150 250 158 Q300 150 350 168"
      : mood === "effort"
      ? "M150 160 Q200 175 250 188 Q300 175 350 160"
      : mood === "shock"
      ? "M150 150 Q200 128 250 148 Q300 128 350 150"
      : "M150 176 Q200 156 250 172 Q300 156 350 176";

  const mouth = () => {
    switch (mood) {
      case "scroll":
      case "spiral":
      case "bored":
        return (
          <g>
            <ellipse cx={250} cy={310} rx={mood === "bored" ? 20 : 32} ry={mood === "bored" ? 26 : 18} fill="#5A1525" stroke={INK} strokeWidth={6} />
            {mood !== "bored" && <rect x={237} y={292} width={12} height={13} fill="white" stroke={INK} strokeWidth={2} />}
            {mood !== "bored" && <rect x={251} y={292} width={12} height={13} fill="white" stroke={INK} strokeWidth={2} />}
            {mood !== "bored" && (
              <ellipse cx={272} cy={326 + drool * 40} rx={5} ry={7 + drool * 6} fill="#BFE8FF" stroke={INK} strokeWidth={2} opacity={1 - drool * 0.6} />
            )}
          </g>
        );
      case "viewer":
        return <path d="M212 310 Q252 326 290 302" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
      case "plead":
        return <path d="M222 318 Q250 300 278 318" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
      case "sad":
        return <path d="M215 322 Q250 296 285 322" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
      case "happy":
        return (
          <g>
            <path d="M200 296 Q250 352 300 296 Z" fill="#5A1525" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <rect x={222} y={297} width={56} height={12} fill="white" />
          </g>
        );
      case "effort":
        return (
          <g>
            <rect x={210} y={296} width={80} height={26} rx={8} fill="white" stroke={INK} strokeWidth={6} />
            <path d="M230 296 V322 M250 296 V322 M270 296 V322" stroke={INK} strokeWidth={3} />
          </g>
        );
      case "shock":
        return <ellipse cx={250} cy={315} rx={20} ry={28} fill="#5A1525" stroke={INK} strokeWidth={6} />;
    }
  };

  const armsSwing = jog ? Math.sin(f / 4) * 28 : 0;
  return (
    <svg viewBox="0 0 500 640" width={size} height={size * 1.28} style={{ overflow: "visible", filter: gray ? "grayscale(1)" : undefined, ...style }}>
      <defs>
        <radialGradient id="fbGlow" cx="50%" cy="95%" r="75%">
          <stop offset="0%" stopColor={glow} stopOpacity={0.32} />
          <stop offset="100%" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(${tremble} ${jogY}) scale(1 ${1 + breathe})`} style={{ transformOrigin: "250px 640px" }}>
        {/* cuerpo / buzo */}
        <path d="M30 650 C10 460 100 342 250 338 C400 342 490 460 470 650 Z" fill={HOODIE} stroke={INK} strokeWidth={9} />
        <ellipse cx={250} cy={540 + jiggle * 0.3} rx={190 + jiggle} ry={125} fill={HOODIE_L} />
        <ellipse cx={250} cy={648} rx={150} ry={42 + jiggle * 0.5} fill={SKIN} stroke={INK} strokeWidth={7} />
        <path d="M244 630 q6 8 12 0" stroke={INK} strokeWidth={4} fill="none" />
        <ellipse cx={175} cy={485} rx={26} ry={16} fill="#5A4630" opacity={0.45} />
        <ellipse cx={330} cy={560} rx={34} ry={20} fill="#5A4630" opacity={0.4} />
        {[[200, 430], [292, 452], [318, 500], [182, 540], [262, 520], [222, 585]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={7} fill="#FF9A1F" stroke={INK} strokeWidth={2} />
        ))}
        <path d="M228 360 L222 440 M272 360 L278 440" stroke="#ddd" strokeWidth={6} />
        <circle cx={222} cy={445} r={8} fill="#ddd" stroke={INK} strokeWidth={3} />
        <circle cx={278} cy={445} r={8} fill="#ddd" stroke={INK} strokeWidth={3} />
        {/* brazos colgando (sin celular) */}
        {!phone && (
          <g>
            <g transform={`rotate(${armsSwing} 70 420)`}>
              <path d="M70 420 Q20 500 40 590" stroke={INK} strokeWidth={84} strokeLinecap="round" fill="none" />
              <path d="M70 420 Q20 500 40 590" stroke={HOODIE} strokeWidth={68} strokeLinecap="round" fill="none" />
              <circle cx={40} cy={605} r={32} fill={SKIN} stroke={INK} strokeWidth={7} />
            </g>
            <g transform={`rotate(${-armsSwing} 430 420)`}>
              <path d="M430 420 Q480 500 460 590" stroke={INK} strokeWidth={84} strokeLinecap="round" fill="none" />
              <path d="M430 420 Q480 500 460 590" stroke={HOODIE} strokeWidth={68} strokeLinecap="round" fill="none" />
              <circle cx={460} cy={605} r={32} fill={SKIN} stroke={INK} strokeWidth={7} />
            </g>
          </g>
        )}
        {/* orejas, papada, cabeza */}
        <ellipse cx={100} cy={218} rx={24} ry={32} fill={SKIN} stroke={INK} strokeWidth={7} />
        <ellipse cx={400} cy={218} rx={24} ry={32} fill={SKIN} stroke={INK} strokeWidth={7} />
        <ellipse cx={250} cy={328} rx={122} ry={52} fill={SKIN} stroke={INK} strokeWidth={8} />
        <ellipse cx={250} cy={205} rx={150} ry={140} fill={SKIN} stroke={INK} strokeWidth={9} />
        {phone && <ellipse cx={250} cy={205} rx={146} ry={136} fill="url(#fbGlow)" />}
        <path d="M185 338 Q250 365 315 338" stroke={INK} strokeWidth={5} fill="none" opacity={0.6} />
        {/* pelo grasoso */}
        <path
          d="M100 205 Q92 68 250 58 Q408 68 400 205 Q388 142 352 150 L346 118 L322 162 L302 112 L282 166 L256 108 L236 166 L212 115 L192 162 L168 120 L152 160 Q118 146 100 205 Z"
          fill={HAIR}
          stroke={INK}
          strokeWidth={8}
          strokeLinejoin="round"
        />
        <path d="M165 88 Q250 66 335 88" stroke="white" strokeWidth={8} fill="none" opacity={0.3} strokeLinecap="round" />
        {/* granos */}
        {[[150, 272], [348, 262], [302, 300], [200, 142]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={8} fill="#E5534B" />
            <circle cx={x - 2} cy={y - 2} r={3} fill="#FFE1A8" />
          </g>
        ))}
        {/* uniceja, ojos, nariz, bigotito, boca */}
        <path d={brow} stroke="#2A1E2E" strokeWidth={17} strokeLinecap="round" fill="none" />
        {eye(195)}
        {eye(305)}
        <ellipse cx={250} cy={262} rx={27} ry={21} fill={SKIN_D} stroke={INK} strokeWidth={6} />
        <ellipse cx={240} cy={268} rx={5} ry={4} fill={INK} />
        <ellipse cx={260} cy={268} rx={5} ry={4} fill={INK} />
        <g fill="#2A1E2E" opacity={0.45}>
          {[-30, -18, -6, 6, 18, 30].map((dx) => <circle key={dx} cx={250 + dx} cy={290} r={2.5} />)}
        </g>
        {mouth()}
        {mood === "happy" && (
          <g opacity={0.45}>
            <ellipse cx={150} cy={295} rx={26} ry={14} fill={C.pink} />
            <ellipse cx={350} cy={295} rx={26} ry={14} fill={C.pink} />
          </g>
        )}
        {/* sudor */}
        {sweat &&
          [0, 1, 2].map((i) => {
            const t = ((f + i * 15) % 45) / 45;
            const x = [112, 392, 140][i];
            return <path key={i} d={`M${x} ${160 + t * 120} q-10 18 0 24 q10 -6 0 -24 Z`} fill="#8FD8FF" stroke={INK} strokeWidth={3} opacity={1 - t * 0.5} />;
          })}
        {/* celular en las manos, con el pulgar scrolleando */}
        {phone && (
          <g transform="rotate(-4 250 450)">
            <path d="M115 400 Q120 500 205 495" stroke={INK} strokeWidth={84} strokeLinecap="round" fill="none" />
            <path d="M115 400 Q120 500 205 495" stroke={HOODIE} strokeWidth={68} strokeLinecap="round" fill="none" />
            <path d="M385 400 Q380 500 295 495" stroke={INK} strokeWidth={84} strokeLinecap="round" fill="none" />
            <path d="M385 400 Q380 500 295 495" stroke={HOODIE} strokeWidth={68} strokeLinecap="round" fill="none" />
            <rect x={200} y={370} width={100} height={170} rx={16} fill="#111" stroke={INK} strokeWidth={7} />
            <rect x={210} y={382} width={80} height={146} rx={10} fill={glow} />
            <rect x={210} y={382 + ((f * 9) % 146)} width={80} height={6} fill="white" opacity={0.5} />
            <circle cx={205} cy={500} r={30} fill={SKIN} stroke={INK} strokeWidth={7} />
            <circle cx={295} cy={500} r={30} fill={SKIN} stroke={INK} strokeWidth={7} />
            <ellipse cx={272} cy={mood === "scroll" || mood === "spiral" ? 470 - Math.abs(Math.sin(f / 3)) * 50 : 470} rx={15} ry={22} fill={SKIN} stroke={INK} strokeWidth={5} />
          </g>
        )}
      </g>
    </svg>
  );
};
