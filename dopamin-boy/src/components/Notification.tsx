import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontFamily } from "../theme";

export const Notification: React.FC<{ icon: string; title: string; text: string; at: number; top: number; tilt?: number; color?: string }> = ({
  icon, title, text, at, top, tilt = 0, color = "#ffffff",
}) => {
  const f = useCurrentFrame() - at;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const s = spring({ frame: f, fps, config: { damping: 10, stiffness: 200 } });
  return (
    <div style={{
      position: "absolute", left: 70, right: 70, top: interpolate(s, [0, 1], [-260, top]),
      background: color, borderRadius: 44, border: "7px solid black", padding: "22px 30px",
      display: "flex", gap: 26, alignItems: "center", transform: `rotate(${tilt}deg) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
      boxShadow: "0 14px 0 rgba(0,0,0,.7)", fontFamily,
    }}>
      <div style={{ fontSize: 88 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 50, color: "#111" }}>{title}</div>
        <div style={{ fontSize: 40, color: "#555", fontFamily: "sans-serif", fontWeight: 700 }}>{text}</div>
      </div>
    </div>
  );
};
