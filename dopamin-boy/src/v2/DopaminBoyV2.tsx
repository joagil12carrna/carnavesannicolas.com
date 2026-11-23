import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Flash } from "../components/Effects";
import { SHOTS } from "./Shots";
import { TIMELINE2 } from "./timeline";

export const TOTAL_FRAMES_V2 = TIMELINE2.reduce((a, s) => a + s.duration, 0);

// Cortes secos como en los videos de "guía de supervivencia"; flash solo en los momentos fuertes
const FLASH: Record<string, string> = { h3: "white", goal: "white", n1: "white", n2: "white", n3: "white", n4: "white", fin: "white" };

export const DopaminBoyV2: React.FC = () => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Audio src={staticFile("audio/music2.wav")} volume={0.7} />
      <Audio src={staticFile("audio/sfx2.wav")} volume={0.8} />
      {TIMELINE2.map((t) => {
        const Shot = SHOTS[t.id];
        const start = from;
        from += t.duration;
        return (
          <Sequence key={t.id} from={start} durationInFrames={t.duration} name={t.id}>
            <Shot />
            {FLASH[t.id] && <Flash color={FLASH[t.id]} frames={5} />}
            <Sequence from={t.voDelay} name={`voz ${t.id}`}>
              <Audio src={staticFile(`audio/vo2_${t.id}.wav`)} volume={1} />
            </Sequence>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
