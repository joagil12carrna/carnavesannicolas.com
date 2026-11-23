import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Flash } from "./components/Effects";
import { S1Hook, S2Night, S3Notifs, S4Videos, S5More, S6Crash, S7Nothing, S8Battery, S9Outside, S10Loop, S11Choice } from "./scenes/Scenes";
import { TIMELINE } from "./timeline";

// componente y color del flash de entrada de cada escena (las duraciones salen de timeline.json)
const SCENES: Record<string, [React.FC, string | null]> = {
  s1: [S1Hook, null],
  s2: [S2Night, "white"],
  s3: [S3Notifs, "white"],
  s4: [S4Videos, "#FFE600"],
  s5: [S5More, "white"],
  s6: [S6Crash, "black"],
  s7: [S7Nothing, null],
  s8: [S8Battery, null],
  s9: [S9Outside, "white"],
  s10: [S10Loop, "white"],
  s11: [S11Choice, "white"],
};

export const TOTAL_FRAMES = TIMELINE.reduce((a, s) => a + s.duration, 0);

export const DopaminBoyVideo: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("audio/music.wav")} volume={0.75} />
      <Audio src={staticFile("audio/sfx.wav")} volume={0.8} />
      {TIMELINE.map((t) => {
        const [Scene, flash] = SCENES[t.id];
        const start = from;
        from += t.duration;
        return (
          <Sequence key={t.id} from={start} durationInFrames={t.duration} name={t.id}>
            <Scene />
            {flash && <Flash color={flash} />}
            <Sequence from={t.voDelay} name={`voz ${t.id}`}>
              <Audio src={staticFile(`audio/vo_${t.id}.wav`)} volume={1} />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
