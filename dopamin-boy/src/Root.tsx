import React from "react";
import { Composition } from "remotion";
import { DopaminBoyVideo, TOTAL_FRAMES } from "./DopaminBoyVideo";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="DopaminBoy" component={DopaminBoyVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
