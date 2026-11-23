import React from "react";
import { AbsoluteFill } from "remotion";
import { FatBoy, FatMood } from "./FatBoy";
import { fontFamily } from "../theme";

const POSES: [FatMood, boolean, string][] = [
  ["scroll", true, "scroll"], ["viewer", true, "viewer"], ["spiral", true, "spiral"],
  ["plead", false, "plead"], ["effort", true, "effort"], ["happy", false, "happy"],
  ["sad", false, "sad"], ["shock", true, "shock"], ["bored", true, "bored"],
];

/** Hoja de personaje: todas las expresiones de Dopamin Boy v2 */
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#2b1a40", display: "flex", flexWrap: "wrap", padding: 20 }}>
    {POSES.map(([m, phone, label]) => (
      <div key={label} style={{ width: 346, height: 620, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <FatBoy mood={m} phone={phone} sweat={m === "effort"} size={330} />
        <div style={{ fontFamily, color: "white", fontSize: 40 }}>{label}</div>
      </div>
    ))}
  </AbsoluteFill>
);
