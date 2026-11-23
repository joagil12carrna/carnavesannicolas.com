import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Flash } from "./components/Effects";
import { S1Hook, S2Night, S3Notifs, S4Videos, S5More, S6Crash, S7Nothing, S8Battery, S9Outside, S10Loop } from "./scenes/Scenes";

// [componente, duración en frames, color del flash de entrada]
const SCENES: [React.FC, number, string | null][] = [
  [S1Hook, 90, null],
  [S2Night, 120, "white"],
  [S3Notifs, 150, "white"],
  [S4Videos, 150, "#FFE600"],
  [S5More, 120, "white"],
  [S6Crash, 150, "black"],
  [S7Nothing, 120, null],
  [S8Battery, 90, null],
  [S9Outside, 210, "white"],
  [S10Loop, 150, "white"],
];

export const TOTAL_FRAMES = SCENES.reduce((a, [, d]) => a + d, 0);

export const DopaminBoyVideo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      {SCENES.map(([Scene, dur, flash], i) => {
        const start = from;
        from += dur;
        return (
          <Sequence key={i} from={start} durationInFrames={dur}>
            <Scene />
            {flash && <Flash color={flash} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
