import React from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily, shake } from "../theme";
import { DopaminBoy } from "../components/DopaminBoy";
import { DopamineBar } from "../components/DopamineBar";
import { Caption } from "../components/Caption";
import { DayChip, EmojiRain, GlitchBars, NeonBurst, Stamp } from "../components/Effects";
import { Phone } from "../components/Phone";
import { Notification } from "../components/Notification";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Center: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

/* 1 · HOOK — 0:00 */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const punch = spring({ frame: f, fps, config: { damping: 12 } });
  const day = Math.round(interpolate(f, [0, 22], [1, 150], { ...clamp, easing: Easing.out(Easing.cubic) }));
  return (
    <AbsoluteFill style={{ transform: shake(f, 6) }}>
      <NeonBurst a={C.pink} b={C.violet} speed={3} />
      <EmojiRain emojis={["📱", "❤️", "🔔", "💬", "🔥"]} seed="h" speed={2} />
      <Center top={330} style={{ transform: `scale(${interpolate(punch, [0, 1], [1.8, 1])})` }}>
        <DopaminBoy mood="hyped" spiral glow={C.cyan} size={760} />
      </Center>
      <DayChip day={day} />
      <Caption text="Dopamin Boy hace / 150 DÍAS / que no puede / dejar el celular" start={4} wordFrames={7} />
    </AbsoluteFill>
  );
};

/* 2 · 3:47 AM */
export const S2Night: React.FC = () => {
  const f = useCurrentFrame();
  const flicker = [C.cyan, C.pink, C.yellow, C.lime][Math.floor(f / 6) % 4];
  const zoom = interpolate(f, [0, 120], [1, 1.18]);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#070a2b,#1a0b3d)" }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`sx${i}`) * 1080, top: random(`sy${i}`) * 1100, width: 6, height: 6, borderRadius: 3, background: "white", opacity: 0.3 + 0.7 * Math.abs(Math.sin((f + i * 7) / 9)) }} />
      ))}
      <div style={{ position: "absolute", right: 110, top: 300, width: 150, height: 150, borderRadius: 75, background: "#FFF6C8", boxShadow: "0 0 80px #FFF6C8" }} />
      <Center top={300}>
        <div style={{ fontFamily, fontSize: 170, color: C.red, WebkitTextStroke: "10px black", paintOrder: "stroke fill", opacity: f % 30 < 22 ? 1 : 0.25, textShadow: `0 0 40px ${C.red}` }}>3:47 AM</div>
      </Center>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 45%" }}>
        <Center top={560}>
          <div style={{ position: "relative" }}>
            <DopaminBoy mood="neutral" glow={flicker} look={0.6} size={560} />
            <div style={{ position: "absolute", left: 300, top: 470, transform: `rotate(-12deg) translateY(${Math.sin(f / 3) * 6}px)` }}>
              <Phone w={150} screen={flicker} />
            </div>
          </div>
        </Center>
        {/* sábana */}
        <div style={{ position: "absolute", left: -40, right: -40, top: 1080, height: 260, background: "#3D5AFE", borderTop: "10px solid black", borderRadius: "80px 80px 0 0" }} />
      </AbsoluteFill>
      <DayChip day={150} />
      <Caption text="Son las 3:47 AM / y Dopamin Boy / sigue scrolleando" wordFrames={8} />
    </AbsoluteFill>
  );
};

/* 3 · LLUVIA DE NOTIFICACIONES */
const NOTIFS = [
  { at: 8, icon: "❤️", title: "+1 like", text: "a alguien le gustó tu video" },
  { at: 28, icon: "💬", title: "Nuevo mensaje", text: "jajaja mirá esto 😂" },
  { at: 44, icon: "🎮", title: "¡Recompensa!", text: "abrí tu cofre diario" },
  { at: 58, icon: "🔥", title: "Racha x150", text: "¡no la pierdas!" },
  { at: 70, icon: "🔔", title: "En vivo", text: "tu streamer favorito" },
  { at: 80, icon: "💸", title: "Ganaste", text: "+500 monedas" },
  { at: 88, icon: "⭐", title: "LEVEL UP", text: "nivel 999" },
  { at: 95, icon: "📸", title: "+99 likes", text: "estás en tendencia" },
];
export const S3Notifs: React.FC = () => {
  const f = useCurrentFrame();
  const hits = NOTIFS.filter((n) => f >= n.at);
  const last = hits.length ? f - hits[hits.length - 1].at : 99;
  const impulse = Math.max(0, 14 - last * 2);
  const target = Math.min(100, 30 + hits.length * 9);
  const bar = interpolate(Math.min(last, 6), [0, 6], [Math.max(30, target - 9), target]);
  return (
    <AbsoluteFill style={{ transform: shake(f, impulse) }}>
      <NeonBurst a={C.cyan} b={C.violet} speed={2} />
      <Center top={540} style={{ transform: `scale(${1 + impulse / 80})` }}>
        <DopaminBoy mood="hyped" spiral={hits.length > 3} glow={C.yellow} size={440} />
      </Center>
      {hits.map((n, i) =>
        i < hits.length - 3 ? null : (
          <Notification key={i} {...n} top={270 + (i % 3) * 120} tilt={i % 2 ? 3 : -3} color={i % 3 === 2 ? C.yellow : "white"} />
        )
      )}
      {hits.length > 0 && last < 14 && (
        <div style={{ position: "absolute", right: 70, top: 1000 - last * 8, fontFamily, fontSize: 120, color: C.lime, WebkitTextStroke: "12px black", paintOrder: "stroke fill", opacity: 1 - last / 14 }}>+10</div>
      )}
      <Center top={1130}><DopamineBar value={bar} /></Center>
      <Caption text="Cada notificación / le da un golpe / de DOPAMINA" wordFrames={9} top={1330} />
    </AbsoluteFill>
  );
};

/* 4 · 900 VIDEOS */
const CARDS = [
  { bg: "#FF6B6B", e: "🐱" }, { bg: "#4ECDC4", e: "🍕" }, { bg: "#FFE66D", e: "🚗" }, { bg: "#A06CD5", e: "💸" },
  { bg: "#FF9F1C", e: "🎮" }, { bg: "#2EC4B6", e: "🤣" }, { bg: "#E71D36", e: "😱" }, { bg: "#7CFF4F", e: "🐶" },
];
export const S4Videos: React.FC = () => {
  const f = useCurrentFrame();
  const per = 5;
  const i = Math.floor(f / per);
  const p = (f % per) / per;
  const count = Math.round(interpolate(f, [0, 120], [0, 900], { ...clamp, easing: Easing.in(Easing.quad) }));
  const cur = CARDS[i % CARDS.length];
  const nxt = CARDS[(i + 1) % CARDS.length];
  const slide = interpolate(p, [0.6, 1], [0, -100], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, 3) }}>
      <NeonBurst a={C.yellow} b={C.pink} speed={4} />
      <Center top={180}>
        <div style={{ fontFamily, fontSize: 84, color: "white", WebkitTextStroke: "10px black", paintOrder: "stroke fill", background: C.ink, padding: "8px 34px", borderRadius: 30, border: "7px solid white" }}>
          VIDEOS HOY: <span style={{ color: C.yellow }}>{count}</span>
        </div>
      </Center>
      <Center top={340}>
        <Phone w={420}>
          {[cur, nxt].map((c, k) => (
            <div key={k} style={{ position: "absolute", inset: 0, background: c.bg, transform: `translateY(${slide + k * 100}%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 260 }}>
              {c.e}
            </div>
          ))}
          <div style={{ position: "absolute", right: 16, bottom: 120, fontSize: 56, display: "flex", flexDirection: "column", gap: 20 }}>
            <span>❤️</span><span>💬</span><span>↗️</span>
          </div>
        </Phone>
      </Center>
      <div style={{ position: "absolute", right: 0, top: 820, transform: "rotate(-10deg)" }}>
        <DopaminBoy mood="hyped" spiral size={300} glow={cur.bg} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 620, fontSize: 150, transform: `translateY(${-((f * 18) % 300)}px)`, opacity: 0.9 }}>👆</div>
      <Caption text="Dopamin Boy mira / 900 videos / POR DÍA" wordFrames={9} />
    </AbsoluteFill>
  );
};

/* 5 · NECESITA MÁS */
export const S5More: React.FC = () => {
  const f = useCurrentFrame();
  const intensity = interpolate(f, [0, 110], [4, 26], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, intensity) }}>
      <NeonBurst a={C.red} b={C.pink} speed={6} />
      <EmojiRain emojis={["🍬", "🥤", "🎮", "📱", "💥"]} seed="m" speed={4} />
      <Center top={520} style={{ transform: `scale(${1 + f / 600})` }}>
        <DopaminBoy mood="glitch" spiral glow={C.lime} size={520} />
      </Center>
      {[0, 1, 2].map((k) => {
        const a = (f / 8) + (k * Math.PI * 2) / 3;
        return (
          <div key={k} style={{ position: "absolute", left: 540 + Math.cos(a) * 380 - 90, top: 820 + Math.sin(a) * 300 - 180, transform: `rotate(${Math.cos(a) * 25}deg)` }}>
            <Phone w={180} screen={[C.cyan, C.yellow, C.pink][(k + Math.floor(f / 4)) % 3]} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 60, top: 320 }}><Stamp at={8} color={C.cyan} size={120}>x2</Stamp></div>
      <div style={{ position: "absolute", right: 60, top: 360 }}><Stamp at={32} color={C.yellow} size={140} rotate={8}>x4</Stamp></div>
      <div style={{ position: "absolute", left: 80, top: 1060 }}><Stamp at={56} color={C.lime} size={160} rotate={-10}>x8</Stamp></div>
      <div style={{ position: "absolute", right: 60, top: 1020 }}><Stamp at={80} color={C.pink} size={190} rotate={10}>x16</Stamp></div>
      <Center top={180}><DopamineBar value={96 + Math.sin(f) * 4} label="MÁS... MÁS..." /></Center>
      <Caption text="Pero cada vez / necesita MÁS / para sentir lo mismo" wordFrames={8} top={1330} />
    </AbsoluteFill>
  );
};

/* 6 · SE ACABÓ */
export const S6Crash: React.FC = () => {
  const f = useCurrentFrame();
  const sat = interpolate(f, [10, 70], [1, 0], clamp);
  const bar = interpolate(f, [20, 95], [100, 3], { ...clamp, easing: Easing.in(Easing.cubic) });
  const mood = f < 45 ? "shock" : "empty";
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `saturate(${sat}) brightness(${interpolate(f, [10, 80], [1, 0.65], clamp)})` }}>
        <NeonBurst a={C.pink} b={C.violet} speed={interpolate(f, [0, 60], [2, 0], clamp)} />
        <Center top={480}><DopaminBoy mood={mood} size={560} /></Center>
        {Array.from({ length: 8 }).map((_, i) => {
          const t = f - 25 - i * 8;
          if (t < 0) return null;
          return <div key={i} style={{ position: "absolute", left: 200 + random(`d${i}`) * 680, top: 330 + t * 22, width: 34, height: 46, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: C.pink, border: "5px solid black" }} />;
        })}
      </AbsoluteFill>
      <Center top={200}><DopamineBar value={bar} mode={bar < 40 ? "danger" : "neon"} /></Center>
      {f > 95 && <Center top={430}><Stamp color={C.red} size={110}>⚠️ VACÍO ⚠️</Stamp></Center>}
      <Caption text="Hasta que un día / la dopamina / SE ACABÓ" wordFrames={10} />
    </AbsoluteFill>
  );
};

/* 7 · NADA */
export const S7Nothing: React.FC = () => {
  const f = useCurrentFrame();
  const jump = random(`j${Math.floor(f / 3)}`) < 0.3;
  const jx = jump ? (random(`jx${f}`) - 0.5) * 60 : 0;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#5b5b5b,#2b2b2b)" }}>
      <AbsoluteFill style={{ filter: "grayscale(1)" }}>
        <Center top={470} style={{ transform: `translateX(${jx}px)` }}>
          <div style={{ position: "relative" }}>
            <DopaminBoy mood="empty" size={560} style={{ position: "absolute", left: -12, top: 0, opacity: jump ? 0.5 : 0, filter: "drop-shadow(0 0 0 cyan)" }} />
            <DopaminBoy mood="empty" size={560} />
          </div>
        </Center>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `translateX(${-jx}px)` }}>
        <Stamp at={6} color={C.red} size={150} rotate={-4}>ERROR 404</Stamp>
        <Stamp at={16} color="white" size={72} rotate={-4}>DIVERSIÓN NOT FOUND</Stamp>
      </div>
      <GlitchBars intensity={1} />
      <Center top={1120}><DopamineBar value={f % 10 < 5 ? 3 : 0} mode="danger" style={{ opacity: 0.9 }} /></Center>
      <Caption text="Dopamin Boy / ya no siente / NADA" wordFrames={10} top={1340} />
    </AbsoluteFill>
  );
};

/* 8 · SIN BATERÍA */
export const S8Battery: React.FC = () => {
  const f = useCurrentFrame();
  const dead = f > 40;
  const lvl = dead ? 0 : 1;
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Center top={560}>
        <div style={{ opacity: dead ? interpolate(f, [40, 60], [1, 0.25], clamp) : f % 10 < 6 ? 1 : 0.3, display: "flex", alignItems: "center" }}>
          <div style={{ width: 520, height: 260, border: "22px solid white", borderRadius: 50, padding: 18 }}>
            <div style={{ width: `${Math.max(lvl * 4, 0)}%`, minWidth: dead ? 0 : 20, height: "100%", background: C.red, borderRadius: 16 }} />
          </div>
          <div style={{ width: 40, height: 110, background: "white", borderRadius: "0 20px 20px 0" }} />
        </div>
      </Center>
      <Center top={900}><div style={{ fontFamily, fontSize: 150, color: dead ? "#666" : C.red, WebkitTextStroke: "8px black", paintOrder: "stroke fill" }}>{dead ? "0%" : "1%"}</div></Center>
      <Caption text="Y el celular / se quedó sin / BATERÍA" wordFrames={8} />
    </AbsoluteFill>
  );
};

/* 9 · AFUERA */
export const S9Outside: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sunY = interpolate(f, [0, 90], [900, 330], { ...clamp, easing: Easing.out(Easing.cubic) });
  const reveal = interpolate(f, [0, 30], [0, 1], clamp);
  const bar = interpolate(f, [40, 180], [3, 72], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const ballY = Math.abs(Math.sin(f / 7)) * -260;
  const ach = spring({ frame: f - 125, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#5EC8FF,#FFD59E 70%,#FF9E6B)" }} />
      <AbsoluteFill style={{ background: "#111", opacity: 1 - reveal }} />
      <div style={{ position: "absolute", left: 540 - 140, top: sunY - 140, width: 280, height: 280, borderRadius: 140, background: "#FFE14D", border: "10px solid black", boxShadow: "0 0 140px #FFE14D" }} />
      <svg width={1080} height={900} style={{ position: "absolute", top: 1020 }} viewBox="0 0 1080 900">
        <path d="M-50 160 Q270 0 600 140 T1130 110 L1130 900 L-50 900 Z" fill="#6BD66B" stroke="black" strokeWidth={10} />
        <path d="M-50 330 Q400 190 760 320 T1130 300 L1130 900 L-50 900 Z" fill="#3FB650" stroke="black" strokeWidth={10} />
      </svg>
      {["🌼", "🌷", "🌼", "🌻", "🌷"].map((e, i) => (
        <div key={i} style={{ position: "absolute", left: 60 + i * 220, top: 1300 + (i % 2) * 70, fontSize: 90, transform: `rotate(${Math.sin((f + i * 20) / 12) * 12}deg)` }}>{e}</div>
      ))}
      {[0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: ((f * (5 + i * 3)) % 1300) - 150, top: 420 + i * 120 + Math.sin(f / 5 + i) * 20, fontSize: 80 }}>🐦</div>
      ))}
      <Center top={560}><DopaminBoy mood="happy" size={500} /></Center>
      <div style={{ position: "absolute", left: 790, top: 1120 + ballY, fontSize: 130, transform: `rotate(${f * 12}deg)` }}>⚽</div>
      <Center top={200}><DopamineBar value={bar} mode="gold" label="DOPAMINA REAL" /></Center>
      {f > 125 && (
        <Center top={430} style={{ transform: `scale(${ach}) rotate(-3deg)` }}>
          <div style={{ fontFamily, fontSize: 66, background: C.ink, color: C.yellow, padding: "18px 40px", borderRadius: 30, border: "8px solid #FFD000", boxShadow: "0 0 50px #FFD000" }}>🏆 LOGRO DESBLOQUEADO</div>
        </Center>
      )}
      <Caption text="Por primera vez / en 150 días / Dopamin Boy / salió AFUERA" wordFrames={9} top={1420} />
    </AbsoluteFill>
  );
};

/* 10 · EL LOOP */
export const S10Loop: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(f, [55, 105], [1, 3.2], { ...clamp, easing: Easing.in(Easing.cubic) });
  const spiral = f > 75;
  const vib = f > 30 && f < 105 ? Math.sin(f * 3) * 10 : 0;
  const neon = interpolate(f, [70, 105], [0, 1], clamp);
  const q = spring({ frame: f - 108, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill style={{ transform: shake(f, f > 70 ? 8 : 0) }}>
      <AbsoluteFill style={{ background: "linear-gradient(#FFB37A,#FF8A5B)" }} />
      <AbsoluteFill style={{ opacity: neon }}><NeonBurst a={C.pink} b={C.violet} speed={4} /></AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 33%" }}>
        <Center top={330}><DopaminBoy mood={f < 30 ? "happy" : spiral ? "hyped" : "shock"} spiral={spiral} glow={spiral ? C.cyan : undefined} look={-0.5} size={620} /></Center>
      </AbsoluteFill>
      {f < 75 && (
        <div style={{ position: "absolute", left: 120, top: 1080, transform: `rotate(${-80 + vib}deg)` }}>
          <Phone w={200} screen={f > 30 ? C.cyan : "#111"} />
        </div>
      )}
      {f > 30 && f < 75 && (
        <div style={{ position: "absolute", left: 300, top: 930, fontFamily, fontSize: 130, color: "white", WebkitTextStroke: "12px black", paintOrder: "stroke fill", transform: `rotate(-8deg) scale(${1 + Math.sin(f) * 0.08})` }}>*DING*</div>
      )}
      {f < 100 && <Caption text="Pero entonces / el celular / VIBRÓ" wordFrames={8} />}
      {f > 108 && (
        <Center top={1180} style={{ transform: `scale(${q})` }}>
          <div style={{ fontFamily, fontSize: 104, color: "white", textAlign: "center", WebkitTextStroke: "14px black", paintOrder: "stroke fill", lineHeight: 1.1, padding: "0 50px" }}>
            ¿Y VOS CUÁNTOS <span style={{ color: C.yellow }}>DÍAS</span> LLEVÁS? 👀
          </div>
        </Center>
      )}
    </AbsoluteFill>
  );
};
