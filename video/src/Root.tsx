import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { FPS, TOTAL } from "./brand";
export const Root: React.FC = () => (
  <Composition id="CarnaveNuevoLocal" component={Video} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL} />
);
