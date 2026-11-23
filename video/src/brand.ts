// Identidad Carnave (colores tomados del cartel real del local)
export const BRAND = {
  red: "#DA1F45",
  redDark: "#A8122F",
  pink: "#F2557A",
  white: "#FFFFFF",
  ink: "#1C1C1E",
};

export const FPS = 30;
export const INTRO = 45; // 1.5 s
export const OUTRO = 120; // 4 s

// ⚠️ confirmar dirección exacta del local nuevo
export const ADDRESS = "Viale 1250";
export const INSTAGRAM = "@carnavesannicolas";

type Sub = [number, number, string, string?]; // inicio, fin (seg. del clip original), texto, palabra destacada
export type Clip = {
  file: string; from: number; to: number; subs: Sub[];
  overlay?: "teaser" | "address" | "discount";
};

export const CLIPS: Clip[] = [
  { file: "c1.mp4", from: 0.3, to: 10.5, overlay: "teaser", subs: [
    [7.5, 9.0, "¿dijeron que estamos locos", "locos"],
    [9.0, 10.5, "por abrir otro local?", "otro local"],
  ]},
  { file: "c2.mp4", from: 0.8, to: 6.15, subs: [
    [0.9, 2.5, "este pollo vendió tanto", "pollo"],
    [2.5, 3.8, "en nación y morteo", "nación y morteo"],
    [3.8, 6.15, "que tuvimos que abrir otro local", "otro local"],
  ]},
  { file: "c3.mp4", from: 0.0, to: 3.4, overlay: "address", subs: [
    [0.0, 1.4, "así que acá estamos", "acá"],
    [1.4, 3.4, `en ${ADDRESS.toLowerCase()}`, ADDRESS.toLowerCase()],
  ]},
  { file: "c4.mp4", from: 0.0, to: 2.9, subs: [
    [0.0, 1.5, "misma calidad de siempre", "calidad"],
    [1.5, 2.9, "pero más cerca tuyo", "más cerca"],
  ]},
  { file: "c5.mp4", from: 0.0, to: 6.5, overlay: "discount", subs: [
    [0.0, 1.2, "y para arrancar", ""],
    [1.2, 2.6, "mostrá este video en caja", "este video"],
    [2.6, 4.9, "y te regalamos un 10% de descuento", "10%"],
  ]},
];

export const clipFrames = (c: Clip) => Math.round((c.to - c.from) * FPS);
export const TOTAL = INTRO + CLIPS.reduce((a, c) => a + clipFrames(c), 0) + OUTRO;
