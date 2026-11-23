import React from "react";
import {
  AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, spring,
  staticFile, useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Anton";
import { loadFont as loadBody } from "@remotion/google-fonts/Montserrat";
import { BRAND, TEXTS, SUBS } from "./brand";
import { INTRO, OUTRO } from "./Root";

const { fontFamily: display } = loadFont();
const { fontFamily: body } = loadBody();

export type Props = { videoFile: string; logoFile: string; videoFrames: number };

const Logo: React.FC<{ file: string; size: number }> = ({ file, size }) => {
  const [ok, setOk] = React.useState(true);
  if (ok && file)
    return <Img src={staticFile(file)} onError={() => setOk(false)} style={{ width: size, objectFit: "contain" }} />;
  return (
    <div style={{ fontFamily: display, fontSize: size * 0.32, color: BRAND.white, letterSpacing: 4 }}>CARNAVE</div>
  );
};

const Stripes: React.FC<{ progress: number }> = ({ progress }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        position: "absolute", left: -400, width: 2200, height: 90, top: 300 + i * 650,
        background: i % 2 ? BRAND.white : BRAND.redDark, opacity: i % 2 ? 0.08 : 0.5,
        transform: `rotate(-12deg) translateX(${interpolate(progress, [0, 1], [-1200 + i * 200, 0])}px)`,
      }} />
    ))}
  </AbsoluteFill>
);

const Intro: React.FC<{ logo: string }> = ({ logo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: f - d, fps, config: { damping: 14 } });
  const exit = interpolate(f, [INTRO - 12, INTRO], [0, -1920], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: BRAND.red, transform: `translateY(${exit}px)` }}>
      <Stripes progress={s(0)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
        <div style={{ transform: `scale(${s(0)})` }}><Logo file={logo} size={520} /></div>
        <div style={{ fontFamily: body, fontWeight: 700, fontSize: 48, color: BRAND.white, opacity: s(10), transform: `translateY(${(1 - s(10)) * 40}px)` }}>
          {TEXTS.kicker}
        </div>
        <div style={{
          fontFamily: display, fontSize: 190, lineHeight: 1, color: BRAND.red, background: BRAND.white,
          padding: "10px 40px", transform: `scaleX(${s(18)}) rotate(-3deg)`,
        }}>{TEXTS.title}</div>
        <div style={{ fontFamily: body, fontWeight: 600, fontSize: 44, color: BRAND.white, opacity: s(28) }}>{TEXTS.subtitle}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LowerThird: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 15 } });
  const out = interpolate(f, [130, 150], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 60, bottom: 420, opacity: out, transform: `translateX(${(1 - a) * -700}px)` }}>
      <div style={{ background: BRAND.red, color: BRAND.white, fontFamily: display, fontSize: 70, padding: "8px 30px" }}>{TEXTS.lowerName}</div>
      <div style={{ background: BRAND.white, color: BRAND.gray, fontFamily: body, fontWeight: 700, fontSize: 38, padding: "10px 30px", display: "inline-block" }}>{TEXTS.lowerRole}</div>
    </div>
  );
};

const Subtitles: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cur = SUBS.find(([a, b]) => t >= a && t < b);
  if (!cur) return null;
  return (
    <div style={{ position: "absolute", bottom: 260, width: "100%", display: "flex", justifyContent: "center", padding: "0 70px" }}>
      <div style={{ fontFamily: body, fontWeight: 800, fontSize: 56, color: BRAND.white, textAlign: "center", textShadow: "0 4px 18px rgba(0,0,0,.8)", textTransform: "uppercase" }}>
        {cur[2]}
      </div>
    </div>
  );
};

const Main: React.FC<{ video: string; logo: string }> = ({ video, logo }) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 900], [1.0, 1.06], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BRAND.dark }}>
      {video ? (
        <OffthreadVideo src={staticFile(video)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      ) : (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", color: "#888", fontFamily: body, fontSize: 50 }}>
          [ acá va el video: public/video.mp4 ]
        </AbsoluteFill>
      )}
      {/* viñeta para legibilidad */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 65%, rgba(0,0,0,.6) 100%)" }} />
      {/* marco de marca */}
      <AbsoluteFill style={{ border: `14px solid ${BRAND.red}` }} />
      <div style={{ position: "absolute", top: 70, left: 60, background: BRAND.red, padding: "14px 22px", borderRadius: 6 }}>
        <Logo file={logo} size={180} />
      </div>
      <div style={{ position: "absolute", top: 90, right: 60, background: BRAND.white, color: BRAND.red, fontFamily: display, fontSize: 46, padding: "6px 22px", transform: "rotate(3deg)" }}>
        NUEVO LOCAL
      </div>
      <Sequence from={20} durationInFrames={150}><LowerThird /></Sequence>
      <Subtitles />
      <div style={{ position: "absolute", bottom: 80, width: "100%", textAlign: "center", fontFamily: body, fontWeight: 700, fontSize: 36, color: BRAND.white }}>
        {TEXTS.instagram}
      </div>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ logo: string }> = ({ logo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: f - d, fps, config: { damping: 13 } });
  const wipe = interpolate(f, [0, 14], [100, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: BRAND.red, clipPath: `circle(${150 - wipe * 1.5}% at 50% 50%)` }}>
      <Stripes progress={s(4)} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 36 }}>
        <div style={{ fontFamily: display, fontSize: 170, color: BRAND.white, transform: `scale(${s(6)})` }}>{TEXTS.outroTitle}</div>
        <div style={{ transform: `scale(${s(14)})` }}><Logo file={logo} size={460} /></div>
        <div style={{ fontFamily: body, fontWeight: 700, fontSize: 46, color: BRAND.white, opacity: s(22) }}>{TEXTS.outroLine}</div>
        <div style={{ fontFamily: body, fontWeight: 800, fontSize: 54, color: BRAND.red, background: BRAND.white, padding: "14px 36px", borderRadius: 60, opacity: s(30), transform: `translateY(${(1 - s(30)) * 60}px)` }}>
          {TEXTS.instagram}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CarnaveNuevoLocal: React.FC<Props> = ({ videoFile, logoFile, videoFrames }) => (
  <AbsoluteFill style={{ background: BRAND.dark }}>
    <Sequence from={INTRO - 12} durationInFrames={videoFrames + 12}><Main video={videoFile} logo={logoFile} /></Sequence>
    <Sequence durationInFrames={INTRO}><Intro logo={logoFile} /></Sequence>
    <Sequence from={INTRO + videoFrames} durationInFrames={OUTRO}><Outro logo={logoFile} /></Sequence>
  </AbsoluteFill>
);
