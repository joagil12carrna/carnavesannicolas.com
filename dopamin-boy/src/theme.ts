import { loadFont } from "@remotion/google-fonts/LilitaOne";

export const { fontFamily } = loadFont();

export const C = {
  pink: "#FF2E9A",
  cyan: "#00F0FF",
  yellow: "#FFE600",
  violet: "#8A2BE2",
  lime: "#7CFF4F",
  red: "#FF2D2D",
  ink: "#120821",
  skin: "#FFD2A6",
  hair: "#A13BFF",
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Temblor de pantalla determinístico
export const shake = (frame: number, intensity: number) => {
  const x = Math.sin(frame * 2.7) * intensity + Math.sin(frame * 7.3) * intensity * 0.5;
  const y = Math.cos(frame * 3.1) * intensity + Math.cos(frame * 5.9) * intensity * 0.5;
  return `translate(${x}px, ${y}px)`;
};
