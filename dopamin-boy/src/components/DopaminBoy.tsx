import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";

export type Mood = "hyped" | "neutral" | "empty" | "happy" | "shock" | "glitch";

const spiralPath = (() => {
  const pts: string[] = [];
  const turns = 3.2;
  const steps = 120;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = (i / steps) * 40;
    pts.push(`${(Math.cos(t) * r).toFixed(2)},${(Math.sin(t) * r).toFixed(2)}`);
  }
  return "M" + pts.join(" L");
})();

const Eye: React.FC<{ cx: number; cy: number; mood: Mood; spiral: boolean; frame: number; look: number }> = ({
  cx, cy, mood, spiral, frame, look,
}) => {
  const blink = !spiral && mood !== "shock" && frame % 75 > 71;
  const pupilR = mood === "empty" ? 9 : mood === "shock" ? 8 : mood === "happy" ? 20 : 17;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={48} ry={blink ? 4 : mood === "empty" ? 30 : 48} fill="white" stroke={C.ink} strokeWidth={7} />
      {!blink && (spiral ? (
        <g transform={`translate(${cx} ${cy}) rotate(${frame * 18})`}>
          <path d={spiralPath} fill="none" stroke={C.pink} strokeWidth={7} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <circle cx={cx + look * 8} cy={cy + 6} r={pupilR} fill={C.ink} />
          <circle cx={cx + look * 8 - 6} cy={cy - 2} r={pupilR / 3} fill="white" />
        </g>
      ))}
      {mood === "empty" && (
        <rect x={cx - 52} y={cy - 40} width={104} height={22} fill={C.skin} />
      )}
    </g>
  );
};

const Mouth: React.FC<{ mood: Mood; frame: number }> = ({ mood, frame }) => {
  switch (mood) {
    case "hyped":
    case "glitch":
      return (
        <g>
          <path d="M130 295 Q200 395 270 295 Z" fill="#6B0F2A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
          <rect x={150} y={297} width={100} height={16} fill="white" />
          <ellipse cx={200} cy={345} rx={28} ry={12} fill={C.pink} />
        </g>
      );
    case "happy":
      return <path d="M150 300 Q200 350 250 300" fill="none" stroke={C.ink} strokeWidth={9} strokeLinecap="round" />;
    case "shock":
      return <ellipse cx={200} cy={320} rx={22} ry={30 + Math.sin(frame) * 2} fill="#6B0F2A" stroke={C.ink} strokeWidth={7} />;
    case "empty":
      return <path d="M165 318 L235 318" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />;
    default:
      return <path d="M170 315 Q200 330 230 315" fill="none" stroke={C.ink} strokeWidth={8} strokeLinecap="round" />;
  }
};

export const DopaminBoy: React.FC<{
  mood?: Mood;
  spiral?: boolean;
  glow?: string; // color de la pantalla reflejado en la cara
  look?: number; // -1..1 hacia dónde mira
  size?: number;
  style?: React.CSSProperties;
}> = ({ mood = "neutral", spiral = false, glow, look = 0, size = 600, style }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / (mood === "hyped" ? 2.5 : 8)) * (mood === "hyped" ? 10 : 5);
  const hairWiggle = mood === "hyped" || mood === "glitch" ? Math.sin(frame * 1.3) * 4 : 0;
  return (
    <svg viewBox="0 0 400 520" width={size} height={size * 1.3} style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id="faceGlow" cx="50%" cy="85%" r="70%">
          <stop offset="0%" stopColor={glow ?? "transparent"} stopOpacity={0.75} />
          <stop offset="100%" stopColor={glow ?? "transparent"} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={`translate(0 ${bob})`}>
        {/* cuerpo / buzo */}
        <rect x={85} y={345} width={230} height={190} rx={70} fill={C.cyan} stroke={C.ink} strokeWidth={8} />
        <polygon points="210,380 170,450 200,450 185,510 240,425 208,425 225,380" fill={C.yellow} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
        {/* orejas */}
        <circle cx={62} cy={225} r={28} fill={C.skin} stroke={C.ink} strokeWidth={7} />
        <circle cx={338} cy={225} r={28} fill={C.skin} stroke={C.ink} strokeWidth={7} />
        {/* cabeza */}
        <circle cx={200} cy={215} r={145} fill={C.skin} stroke={C.ink} strokeWidth={8} />
        {glow && <circle cx={200} cy={215} r={141} fill="url(#faceGlow)" />}
        {/* pelo eléctrico */}
        <path
          transform={`rotate(${hairWiggle} 200 120)`}
          d="M58 190 L62 115 L22 85 L105 88 L98 25 L160 72 L192 -5 L228 68 L290 18 L290 90 L370 70 L340 135 L345 192 Q300 110 200 108 Q100 110 58 190 Z"
          fill={C.hair}
          stroke={C.ink}
          strokeWidth={8}
          strokeLinejoin="round"
        />
        {/* ojeras */}
        {mood !== "happy" && (
          <g opacity={0.55}>
            <path d="M100 270 Q145 290 190 270" stroke="#7B4FB0" strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M210 270 Q255 290 300 270" stroke="#7B4FB0" strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        )}
        <Eye cx={145} cy={215} mood={mood} spiral={spiral} frame={frame} look={look} />
        <Eye cx={255} cy={215} mood={mood} spiral={spiral} frame={frame} look={look} />
        {mood === "happy" && (
          <g>
            <ellipse cx={100} cy={285} rx={26} ry={14} fill={C.pink} opacity={0.5} />
            <ellipse cx={300} cy={285} rx={26} ry={14} fill={C.pink} opacity={0.5} />
          </g>
        )}
        <Mouth mood={mood} frame={frame} />
      </g>
    </svg>
  );
};
