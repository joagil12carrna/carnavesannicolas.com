import data from "./timeline.json";
import type { SceneTiming } from "../timeline";

export const TIMELINE2 = data.scenes as SceneTiming[];
export const timing2 = (id: string) => TIMELINE2.find((s) => s.id === id)!;
