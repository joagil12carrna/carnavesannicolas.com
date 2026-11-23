import React from "react";

export const Phone: React.FC<{ w?: number; children?: React.ReactNode; style?: React.CSSProperties; screen?: string }> = ({
  w = 420, children, style, screen = "#111",
}) => (
  <div style={{ width: w, height: w * 2, borderRadius: w * 0.14, background: "#141414", border: "10px solid black", padding: w * 0.04, boxShadow: "0 18px 0 rgba(0,0,0,.6)", position: "relative", ...style }}>
    <div style={{ width: "100%", height: "100%", borderRadius: w * 0.1, background: screen, overflow: "hidden", position: "relative" }}>{children}</div>
    <div style={{ position: "absolute", top: w * 0.06, left: "50%", width: w * 0.28, height: w * 0.06, marginLeft: -w * 0.14, borderRadius: 20, background: "black" }} />
  </div>
);
