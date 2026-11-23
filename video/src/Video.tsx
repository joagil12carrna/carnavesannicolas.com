import React from "react";
import {
  AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Nunito";
import { BRAND, CLIPS, INTRO, OUTRO, FPS, ADDRESS, INSTAGRAM, clipFrames, Clip } from "./brand";
import { CarnaveLogo } from "./Logo";

const { fontFamily: font } = loadFont("normal", { weights: ["700", "800", "900"] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* ---------- Intro: estampa de marca 1.5s ---------- */
const Intro: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 12 } });
  const tag = spring({ frame: f - 8, fps, config: { damping: 14 } });
  const out = interpolate(f, [INTRO - 8, INTRO], [0, 100], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: BRAND.red, clipPath: `inset(0 0 ${out}% 0)` }}>
      <Diagonals />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 50 }}>
        <div style={{ transform: `scale(${s}) rotate(${(1 - s) * -10}deg)` }}><CarnaveLogo width={640} /></div>
        <div style={{ fontFamily: font, fontWeight: 900, fontSize: 96, color: BRAND.white, letterSpacing: -1,
          opacity: tag, transform: `translateY(${(1 - tag) * 50}px)` }}>nuevo local</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Diagonals: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: 0.18 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ position: "absolute", top: -400 + i * 420, left: -600, width: 2400, height: 120,
          background: BRAND.white, transform: `rotate(-20deg) translateX(${(f * 6 + i * 90) % 400 - 200}px)` }} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------- Subtítulos estilo reel ---------- */
const Caption: React.FC<{ text: string; hl?: string }> = ({ text, hl }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 11, stiffness: 180 } });
  const parts = hl && text.includes(hl) ? text.split(hl) : [text];
  return (
    <div style={{ position: "absolute", bottom: 360, left: 70, right: 70, textAlign: "center",
      transform: `scale(${0.85 + pop * 0.15})`, opacity: pop }}>
      <span style={{ fontFamily: font, fontWeight: 900, fontSize: 74, lineHeight: 1.25, color: BRAND.white,
        textShadow: "0 4px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.45)", letterSpacing: -0.5 }}>
        {parts[0]}
        {parts.length > 1 && (
          <span style={{ background: BRAND.red, padding: "0 16px", borderRadius: 14, textShadow: "none",
            boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{hl}</span>
        )}
        {parts[1]}
      </span>
    </div>
  );
};

/* ---------- Overlays específicos ---------- */
const Teaser: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 10, fps, config: { damping: 12 } });
  const out = interpolate(f, [190, 205], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", top: 330, width: "100%", display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ fontFamily: font, fontWeight: 900, fontSize: 88, color: BRAND.red, background: BRAND.white,
        padding: "10px 40px", borderRadius: 24, transform: `scale(${s}) rotate(-4deg)`, boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
        ¿cierra carnave?
      </div>
    </div>
  );
};

const AddressPin: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 30, fps, config: { damping: 13 } });
  return (
    <div style={{ position: "absolute", top: 330, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: BRAND.red, color: BRAND.white,
        fontFamily: font, fontWeight: 900, fontSize: 62, padding: "18px 40px", borderRadius: 100,
        transform: `translateY(${(1 - s) * -200}px)`, opacity: s, boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
        <svg width="54" height="70" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#fff"/><circle cx="12" cy="12" r="5" fill={BRAND.red}/></svg>
        {ADDRESS}
      </div>
    </div>
  );
};

const Discount: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = spring({ frame: f - 78, fps, config: { damping: 8, stiffness: 160 } });
  const wobble = Math.sin(f / 6) * 3;
  return (
    <div style={{ position: "absolute", top: 300, right: 60, width: 380, height: 380, borderRadius: "50%",
      background: BRAND.red, border: `10px solid ${BRAND.white}`, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", color: BRAND.white, fontFamily: font,
      transform: `scale(${s}) rotate(${12 + wobble}deg)`, boxShadow: "0 18px 50px rgba(0,0,0,.35)" }}>
      <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 0.9, letterSpacing: -4 }}>10%</div>
      <div style={{ fontWeight: 900, fontSize: 58, lineHeight: 1 }}>off</div>
      <div style={{ fontWeight: 800, fontSize: 28, marginTop: 6 }}>mostrando el video</div>
    </div>
  );
};

/* ---------- Clip con marca ---------- */
const ClipScene: React.FC<{ clip: Clip }> = ({ clip }) => {
  const f = useCurrentFrame();
  const dur = clipFrames(clip);
  const zoom = interpolate(f, [0, dur], [1.02, 1.1]);
  const flash = interpolate(f, [0, 6], [0.7, 0], clamp);
  return (
    <AbsoluteFill style={{ background: BRAND.ink }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <OffthreadVideo src={staticFile(clip.file)} trimBefore={Math.round(clip.from * FPS)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)" }} />
      {clip.overlay === "teaser" && <Teaser />}
      {clip.overlay === "address" && <AddressPin />}
      {clip.overlay === "discount" && <Discount />}
      {clip.subs.map(([a, b, t, hl], i) => {
        const st = Math.max(0, Math.round((a - clip.from) * FPS));
        const en = Math.min(dur, Math.round((b - clip.from) * FPS));
        return en > st ? <Sequence key={i} from={st} durationInFrames={en - st}><Caption text={t} hl={hl} /></Sequence> : null;
      })}
      <AbsoluteFill style={{ background: BRAND.white, opacity: flash }} />
    </AbsoluteFill>
  );
};

/* ---------- Marco fijo de marca ---------- */
const Frame: React.FC = () => (
  <AbsoluteFill>
    <div style={{ position: "absolute", top: 90, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <CarnaveLogo width={300} />
    </div>
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 150, background: BRAND.red,
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px", color: BRAND.white, fontFamily: font }}>
      <span style={{ fontWeight: 900, fontSize: 52 }}>nuevo local</span>
      <span style={{ fontWeight: 800, fontSize: 38 }}>{INSTAGRAM}</span>
    </div>
  </AbsoluteFill>
);

/* ---------- Outro ---------- */
const Outro: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const s = (d: number) => spring({ frame: f - d, fps, config: { damping: 13 } });
  const wipe = interpolate(f, [0, 14], [0, 150], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: BRAND.red, clipPath: `circle(${wipe}% at 50% 50%)` }}>
      <Diagonals />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44, fontFamily: font, color: BRAND.white }}>
        <div style={{ fontWeight: 900, fontSize: 130, letterSpacing: -3, transform: `scale(${s(6)})` }}>te esperamos</div>
        <div style={{ transform: `scale(${s(12)})` }}><CarnaveLogo width={600} /></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 56, opacity: s(20) }}>
          <svg width="40" height="52" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="#fff"/><circle cx="12" cy="12" r="5" fill={BRAND.red}/></svg>
          {ADDRESS} · san nicolás
        </div>
        <div style={{ fontWeight: 900, fontSize: 50, color: BRAND.red, background: BRAND.white, padding: "16px 44px",
          borderRadius: 100, opacity: s(28), transform: `translateY(${(1 - s(28)) * 60}px)` }}>10% off mostrando este video</div>
        <div style={{ fontWeight: 800, fontSize: 46, opacity: s(36) }}>{INSTAGRAM}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  let t = INTRO;
  const seqs = CLIPS.map((c, i) => {
    const d = clipFrames(c); const from = t; t += d;
    return <Sequence key={i} from={from} durationInFrames={d}><ClipScene clip={c} /></Sequence>;
  });
  return (
    <AbsoluteFill style={{ background: BRAND.red }}>
      {seqs}
      <Sequence from={INTRO} durationInFrames={t - INTRO}><Frame /></Sequence>
      <Sequence from={t} durationInFrames={OUTRO}><Outro /></Sequence>
      <Sequence durationInFrames={INTRO}><Intro /></Sequence>
    </AbsoluteFill>
  );
};
