import React from "react";
import { loadFont } from "@remotion/google-fonts/VarelaRound";
import { BRAND } from "./brand";
export const { fontFamily: logoFont } = loadFont();

// Recreación del cartel: hexágono alargado blanco con "carnave" en rojo
export const CarnaveLogo: React.FC<{ width: number; inverted?: boolean }> = ({ width, inverted }) => {
  const h = width * 0.42;
  const bg = inverted ? BRAND.red : BRAND.white;
  const fg = inverted ? BRAND.white : BRAND.red;
  return (
    <div style={{ position: "relative", width, height: h, filter: "drop-shadow(0 10px 25px rgba(0,0,0,.25))" }}>
      <svg width={width} height={h} viewBox="0 0 240 100" style={{ position: "absolute" }}>
        <path d="M40 4 H200 Q206 4 210 9 L236 45 Q239 50 236 55 L210 91 Q206 96 200 96 H40 Q34 96 30 91 L4 55 Q1 50 4 45 L30 9 Q34 4 40 4 Z" fill={bg} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: logoFont, color: fg, fontSize: width * 0.2, letterSpacing: width * 0.004, paddingBottom: width * 0.02 }}>
        carnave
      </div>
    </div>
  );
};
