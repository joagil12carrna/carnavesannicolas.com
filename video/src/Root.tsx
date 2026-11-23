import React from "react";
import { Composition, staticFile } from "remotion";
import { getVideoMetadata } from "@remotion/media-utils";
import { CarnaveNuevoLocal, Props } from "./CarnaveNuevoLocal";

const FPS = 30;
export const INTRO = 3 * FPS;
export const OUTRO = 4 * FPS;

export const Root: React.FC = () => (
  <Composition
    id="CarnaveNuevoLocal"
    component={CarnaveNuevoLocal}
    width={1080}
    height={1920}
    fps={FPS}
    durationInFrames={INTRO + 10 * FPS + OUTRO}
    defaultProps={{ videoFile: "video.mp4", logoFile: "logo.png", videoFrames: 10 * FPS } as Props}
    calculateMetadata={async ({ props }) => {
      try {
        const m = await getVideoMetadata(staticFile(props.videoFile));
        const vf = Math.floor(m.durationInSeconds * FPS);
        return { durationInFrames: INTRO + vf + OUTRO, props: { ...props, videoFrames: vf } };
      } catch {
        return { props: { ...props, videoFile: "" } };
      }
    }}
  />
);
