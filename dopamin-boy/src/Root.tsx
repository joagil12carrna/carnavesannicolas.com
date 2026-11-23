import React from "react";
import { Composition } from "remotion";
import { DopaminBoyVideo, TOTAL_FRAMES } from "./DopaminBoyVideo";
import { CharacterSheet } from "./v2/CharacterSheet";
import { DopaminBoyV2, TOTAL_FRAMES_V2 } from "./v2/DopaminBoyV2";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DopaminBoyV2" component={DopaminBoyV2} durationInFrames={TOTAL_FRAMES_V2} fps={FPS} width={W} height={H} />
    <Composition id="DopaminBoy" component={DopaminBoyVideo} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="CharacterSheet" component={CharacterSheet} durationInFrames={60} fps={FPS} width={W} height={H} />
  </>
);
