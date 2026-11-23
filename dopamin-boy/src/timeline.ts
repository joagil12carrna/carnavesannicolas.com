import data from "./timeline.json";

export type Word = { t: string; f: number; chunk: number };
export type SceneTiming = { id: string; duration: number; voDelay: number; voFrames: number; parts: [number, number][]; words: Word[] };

export const TIMELINE = data.scenes as SceneTiming[];
export const timing = (id: string) => TIMELINE.find((s) => s.id === id)!;
