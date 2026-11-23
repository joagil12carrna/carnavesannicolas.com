import React from "react";
import { C, fontFamily } from "../theme";

export const DopamineBar: React.FC<{
  value: number; // 0..100
  mode?: "neon" | "danger" | "gold";
  label?: string;
  style?: React.CSSProperties;
}> = ({ value, mode = "neon", label = "DOPAMINA", style }) => {
  const v = Math.max(0, Math.min(100, value));
  const fill =
    mode === "gold"
      ? "linear-gradient(90deg,#FFB800,#FFE600,#FFF6B0)"
      : mode === "danger"
      ? `linear-gradient(90deg,${C.red},#FF7A00)`
      : `linear-gradient(90deg,${C.cyan},${C.lime},${C.yellow},${C.pink})`;
  const glow = mode === "gold" ? "#FFD000" : mode === "danger" ? C.red : C.pink;
  return (
    <div style={{ width: 820, fontFamily, ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "white", fontSize: 56, WebkitTextStroke: "8px black", paintOrder: "stroke fill", marginBottom: 10 }}>
        <span>🧠 {label}</span>
        <span>{Math.round(v)}%</span>
      </div>
      <div style={{ height: 70, borderRadius: 40, background: "#1b0b33", border: "8px solid black", overflow: "hidden", boxShadow: `0 0 ${20 + v / 2}px ${glow}` }}>
        <div style={{ width: `${v}%`, height: "100%", background: fill, borderRadius: 30, boxShadow: "inset 0 -12px 0 rgba(0,0,0,.2), inset 0 10px 0 rgba(255,255,255,.35)" }} />
      </div>
    </div>
  );
};
