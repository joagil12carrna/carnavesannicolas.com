import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily, shake } from "../theme";
import { Caption } from "../components/Caption";
import { DopamineBar } from "../components/DopamineBar";
import { EmojiRain, NeonBurst, Stamp } from "../components/Effects";
import { Notification } from "../components/Notification";
import { Phone } from "../components/Phone";
import { FatBoy } from "./FatBoy";
import { timing2 } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const P = (id: string, i: number) => timing2(id).parts[i][0];
const PE = (id: string, i: number) => timing2(id).parts[i][1];
const Cap: React.FC<{ id: string; top?: number }> = ({ id, top = 1330 }) => <Caption words={timing2(id).words} top={top} size={100} />;

const Center: React.FC<{ top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ top, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", ...style }}>{children}</div>
);

/** "Cámara": corte seco a un encuadre nuevo en cada frame de `cuts`, con un empuje lento entre cortes. */
const Cam: React.FC<{ cuts: { at: number; s: number; x?: number; y?: number }[]; children: React.ReactNode; drift?: number }> = ({ cuts, children, drift = 0.0018 }) => {
  const f = useCurrentFrame();
  let c = cuts[0];
  for (const k of cuts) if (k.at <= f) c = k;
  const s = c.s * (1 + (f - c.at) * drift);
  return <AbsoluteFill style={{ transform: `translate(${c.x ?? 0}px, ${c.y ?? 0}px) scale(${s})`, transformOrigin: "50% 45%" }}>{children}</AbsoluteFill>;
};

/** HUD del objetivo: la barra de dopamina que hay que bajar a 0 */
export const Hud: React.FC<{ from: number; to?: number; at?: number; dur?: number; alarm?: boolean }> = ({ from, to = from, at = 0, dur = 20, alarm }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [from, to], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const changing = f >= at && f < at + dur + 10 && from !== to;
  const mode = v > 60 ? "danger" : v > 20 ? "neon" : "gold";
  return (
    <Center top={140} style={{ transform: `scale(${changing ? 1.06 + Math.sin(f) * 0.02 : 0.9})`, opacity: alarm && f % 6 < 3 ? 0.6 : 1 }}>
      <DopamineBar value={v} mode={mode} label="DOPAMINA · META 0%" />
      {changing && to < from && (
        <div style={{ position: "absolute", right: 90, top: 120, fontFamily, fontSize: 90, color: C.lime, WebkitTextStroke: "10px black", paintOrder: "stroke fill" }}>
          -{from - to}% ⬇
        </div>
      )}
    </Center>
  );
};

/** Molécula de dopamina: rápida (rosa, con pinchos, nerviosa) o lenta (dorada, suave) */
const Molecule: React.FC<{ kind: "fast" | "slow"; size?: number }> = ({ kind, size = 520 }) => {
  const f = useCurrentFrame();
  const fast = kind === "fast";
  const spikes = 14;
  const pts = Array.from({ length: spikes * 2 }).map((_, i) => {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 ? 0.62 : 0.95 + (fast ? Math.sin(f * 0.9 + i) * 0.05 : 0);
    return `${50 + Math.cos(a) * r * 50},${50 + Math.sin(a) * r * 50}`;
  });
  const icons = fast ? ["📱", "❤️", "🔔", "▶️", "🎮"] : ["🌳", "⚽", "📚", "🤝", "🏋️"];
  const orbit = fast ? f / 6 : f / 30;
  return (
    <div style={{ position: "relative", width: size, height: size, transform: fast ? shake(f, 4) : `scale(${1 + Math.sin(f / 15) * 0.03})` }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: `drop-shadow(0 0 ${fast ? 40 : 60}px ${fast ? C.pink : "#FFD000"})` }}>
        {fast ? (
          <polygon points={pts.join(" ")} fill={C.pink} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" transform={`rotate(${f * 3} 50 50)`} />
        ) : (
          <circle cx={50} cy={50} r={44} fill="#FFD23F" stroke={C.ink} strokeWidth={2.5} />
        )}
        <circle cx={50} cy={50} r={fast ? 28 : 30} fill={fast ? "#FF7AC3" : "#FFE98A"} />
        <circle cx={40} cy={40} r={8} fill="white" opacity={0.5} />
      </svg>
      {icons.map((ic, i) => {
        const a = orbit + (i / icons.length) * Math.PI * 2;
        return (
          <div key={i} style={{ position: "absolute", left: size / 2 + Math.cos(a) * size * 0.62 - 50, top: size / 2 + Math.sin(a) * size * 0.62 - 50, fontSize: 100 }}>
            {ic}
          </div>
        );
      })}
    </div>
  );
};

const Bg: React.FC<{ kind: "danger" | "room" | "warm" | "gold" | "gray" | "night" }> = ({ kind }) => {
  const f = useCurrentFrame();
  if (kind === "danger")
    return (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #5a0b2e, #14030c 75%)" }}>
        <AbsoluteFill style={{ background: `repeating-linear-gradient(45deg, rgba(255,46,154,.08) 0 40px, transparent 40px 80px)`, backgroundPosition: `${f * 4}px 0` }} />
      </AbsoluteFill>
    );
  if (kind === "room")
    return (
      <AbsoluteFill style={{ background: "linear-gradient(#0b0f2e,#1c1036)" }}>
        <div style={{ position: "absolute", left: 80, top: 330, width: 260, height: 330, background: "#16244f", border: "10px solid #05060f" }}>
          <div style={{ position: "absolute", right: 40, top: 40, width: 70, height: 70, borderRadius: 35, background: "#FFF6C8", boxShadow: "0 0 50px #FFF6C8" }} />
        </div>
        <div style={{ position: "absolute", right: 70, top: 380, fontSize: 90, opacity: 0.6 }}>🍕</div>
        <div style={{ position: "absolute", right: 140, top: 1040, fontSize: 80, opacity: 0.7 }}>🥤</div>
        <div style={{ position: "absolute", left: 110, top: 1050, fontSize: 80, opacity: 0.7 }}>🍟</div>
      </AbsoluteFill>
    );
  if (kind === "night") return <AbsoluteFill style={{ background: "linear-gradient(#03040f,#101a3d)" }} />;
  if (kind === "gray") return <AbsoluteFill style={{ background: "linear-gradient(#6d6d6d,#2e2e2e)" }} />;
  if (kind === "gold") return <NeonBurst a="#FFD54A" b="#FF8A3D" speed={0.6} />;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#5EC8FF,#BDEBFF 55%,#FFE3B0)" }} />
      <svg width={1080} height={800} viewBox="0 0 1080 800" style={{ position: "absolute", top: 1120 }}>
        <path d="M-50 140 Q270 0 600 120 T1130 90 L1130 800 L-50 800 Z" fill="#6BD66B" stroke="black" strokeWidth={10} />
      </svg>
      <div style={{ position: "absolute", right: 90, top: 300, width: 180, height: 180, borderRadius: 90, background: "#FFE14D", border: "9px solid black", boxShadow: "0 0 90px #FFE14D" }} />
    </AbsoluteFill>
  );
};

/** Cartel de nivel tipo videojuego */
const LevelSlam: React.FC<{ label: string; color?: string; out: number }> = ({ label, color = C.yellow, out }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f > out) return null;
  const s = spring({ frame: f, fps, config: { damping: 8, stiffness: 220 } });
  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(0,0,0,${interpolate(f, [out - 6, out], [0.55, 0], clamp)})` }}>
      <div style={{ transform: `scale(${interpolate(s, [0, 1], [4, 1])}) rotate(-5deg)`, fontFamily, fontSize: 210, color, WebkitTextStroke: "18px black", paintOrder: "stroke fill", textShadow: "0 18px 0 black", textAlign: "center", lineHeight: 0.9 }}>
        {label}
      </div>
    </AbsoluteFill>
  );
};

/** Gráfico de dopamina en el tiempo */
const Graph: React.FC<{ kind: "fast" | "slow"; progress: number; w?: number }> = ({ kind, progress, w = 860 }) => {
  const h = 420;
  const d =
    kind === "fast"
      ? `M0 ${h * 0.7} L${w * 0.25} ${h * 0.7} L${w * 0.35} ${h * 0.05} L${w * 0.45} ${h * 0.95} L${w * 1} ${h * 0.92}`
      : `M0 ${h * 0.7} C${w * 0.3} ${h * 0.68} ${w * 0.5} ${h * 0.3} ${w} ${h * 0.25}`;
  const col = kind === "fast" ? C.pink : "#FFD000";
  return (
    <div style={{ background: "rgba(0,0,0,.55)", border: "8px solid black", borderRadius: 40, padding: 30 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <line x1={0} y1={h * 0.7} x2={w} y2={h * 0.7} stroke="white" strokeDasharray="14 14" strokeWidth={4} opacity={0.5} />
        <path d={d} fill="none" stroke="black" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${progress} 1`} />
        <path d={d} fill="none" stroke={col} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${progress} 1`} />
      </svg>
      <div style={{ fontFamily, color: "white", fontSize: 44, marginTop: 6 }}>🧠 tu dopamina → tiempo</div>
    </div>
  );
};

const Big: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 120, color = "white", style }) => (
  <div style={{ fontFamily, fontSize: size, color, WebkitTextStroke: `${Math.round(size / 9)}px black`, paintOrder: "stroke fill", textAlign: "center", lineHeight: 1, textShadow: `0 ${Math.round(size / 12)}px 0 black`, ...style }}>{children}</div>
);

/* ───────────────────────── TOMAS ───────────────────────── */

export const H1: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = P("h1", 1);
  return (
    <AbsoluteFill>
      <Bg kind="danger" />
      <Cam cuts={[{ at: 0, s: 1 }, { at: p1, s: 1.35, y: 120 }]}>
        <Center top={420}><Molecule kind="fast" /></Center>
      </Cam>
      {f >= p1 && <Center top={250}><Stamp color={C.red} size={130}>⚠️ ALÉJATE ⚠️</Stamp></Center>}
      <Cap id="h1" />
    </AbsoluteFill>
  );
};

export const H2: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = P("h2", 1);
  return (
    <AbsoluteFill>
      <Bg kind="gold" />
      <Cam cuts={[{ at: 0, s: 1.2 }, { at: p1, s: 1 }]}>
        <Center top={420}><Molecule kind="slow" /></Center>
      </Cam>
      {f >= p1 && <Center top={250}><Stamp color={C.lime} size={130}>✅ NUNCA</Stamp></Center>}
      <Cap id="h2" />
    </AbsoluteFill>
  );
};

export const H3: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = P("h3", 1);
  const flash = f < 4 || (f > p1 && f < p1 + 3);
  return (
    <AbsoluteFill>
      <Bg kind="room" />
      <Cam cuts={[{ at: 0, s: 1 }, { at: p1, s: 1.9, y: 380 }]} drift={0.003}>
        <Center top={380}><FatBoy mood="scroll" glow={C.cyan} size={680} /></Center>
      </Cam>
      {flash && <AbsoluteFill style={{ background: "white", opacity: 0.8 }} />}
      <Cap id="h3" />
    </AbsoluteFill>
  );
};

export const I1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p1 = P("i1", 1);
  const tag = spring({ frame: f - 6, fps, config: { damping: 10 } });
  const stats = [["📱", "150 DÍAS sin soltarlo"], ["🕐", "14 h de pantalla"], ["👟", "12 pasos hoy"]];
  return (
    <AbsoluteFill>
      <NeonBurst a="#3d1d6e" b="#12082a" speed={0.5} />
      <Cam cuts={[{ at: 0, s: 1.15, y: 60 }, { at: p1, s: 0.85, x: -180, y: 40 }]}>
        <Center top={330}><FatBoy mood="scroll" glow={C.pink} size={620} /></Center>
      </Cam>
      <Center top={250} style={{ transform: `scale(${tag}) rotate(-3deg)` }}>
        <div style={{ fontFamily, fontSize: 96, color: C.yellow, background: C.ink, padding: "6px 36px", borderRadius: 24, border: "7px solid white", WebkitTextStroke: "6px black", paintOrder: "stroke fill" }}>DOPAMIN BOY</div>
      </Center>
      {stats.map(([ic, txt], i) => {
        const at = p1 + 8 + i * 14;
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 11 } });
        return (
          <div key={i} style={{ position: "absolute", right: 40, top: 470 + i * 170, transform: `translateX(${(1 - s) * 600}px)`, background: "white", border: "7px solid black", borderRadius: 30, padding: "14px 26px", fontFamily, fontSize: 50, color: C.ink, boxShadow: "0 10px 0 black", maxWidth: 520 }}>
            {ic} {txt}
          </div>
        );
      })}
      <Cap id="i1" />
    </AbsoluteFill>
  );
};

export const I2: React.FC = () => {
  const f = useCurrentFrame();
  const p1 = P("i2", 1);
  const kg = Math.round(interpolate(f, [4, 40], [0, 120], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const needle = interpolate(f, [p1 + 5, p1 + 30], [-90, 85], { ...clamp, easing: Easing.out(Easing.back(2)) }) + (f > p1 + 30 ? Math.sin(f * 2) * 3 : 0);
  return (
    <AbsoluteFill>
      <NeonBurst a="#1d4f6e" b="#0b1630" speed={1} />
      {f < p1 ? (
        <Cam cuts={[{ at: 0, s: 1 }]}>
          <Center top={260}><FatBoy mood="scroll" glow={C.cyan} size={560} /></Center>
          <Center top={950}>
            <div style={{ width: 560, height: 210, background: "#ddd", border: "9px solid black", borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", transform: shake(f, kg > 110 ? 6 : 0) }}>
              <div style={{ background: "#0d2", color: "#022", fontFamily, fontSize: 110, padding: "0 30px", borderRadius: 16, border: "6px solid black" }}>{kg} KG</div>
            </div>
          </Center>
        </Cam>
      ) : (
        <Cam cuts={[{ at: p1, s: 1 }]}>
          <Center top={300}>
            <svg width={800} height={460} viewBox="0 0 200 115">
              <path d="M10 105 A90 90 0 0 1 190 105" fill="none" stroke="black" strokeWidth={18} />
              <path d="M10 105 A90 90 0 0 1 190 105" fill="none" stroke="url(#spd)" strokeWidth={11} />
              <defs>
                <linearGradient id="spd"><stop offset="0" stopColor={C.lime} /><stop offset=".6" stopColor={C.yellow} /><stop offset="1" stopColor={C.red} /></linearGradient>
              </defs>
              <g transform={`rotate(${needle} 100 105)`}><polygon points="96,105 104,105 100,25" fill="white" stroke="black" strokeWidth={2} /></g>
              <circle cx={100} cy={105} r={10} fill="black" />
            </svg>
          </Center>
          <Center top={800}><Big size={70} color={C.yellow}>VELOCIDAD DE SCROLL</Big></Center>
          <div style={{ position: "absolute", top: 920, left: interpolate(f, [p1, p1 + 120], [-200, 700]), fontSize: 170 }}>🐎</div>
          <div style={{ position: "absolute", top: 1080, left: interpolate(f, [p1, p1 + 60], [-200, 1200]), fontSize: 170, transform: "rotate(90deg)" }}>👍</div>
        </Cam>
      )}
      <Cap id="i2" />
    </AbsoluteFill>
  );
};

export const Goal: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [p1, p2, p3] = [P("goal", 1), P("goal", 2), P("goal", 3)];
  const ban = spring({ frame: f - 2, fps, config: { damping: 9 } });
  return (
    <AbsoluteFill>
      <NeonBurst a="#2b1150" b="#0b0518" speed={1.2} />
      <Cam cuts={[{ at: 0, s: 0.9, y: 160 }, { at: p2, s: 0.8, y: 220 }, { at: p3, s: 1.7, y: 330 }]}>
        <Center top={420}><FatBoy mood={f >= p3 ? "viewer" : "scroll"} look={f >= p3 ? [0, 0] : undefined} glow={C.pink} size={620} /></Center>
      </Cam>
      {f < p1 && (
        <Center top={260} style={{ transform: `scale(${ban}) rotate(-4deg)` }}>
          <Big size={150} color={C.yellow}>🎯 OBJETIVO</Big>
        </Center>
      )}
      {f >= p1 && <Hud from={100} />}
      {f >= p1 && f < p3 && (
        <Center top={420}>
          <Big size={130} color={C.lime} style={{ transform: `translateY(${Math.abs(Math.sin(f / 5)) * 30}px)` }}>⬇ 0%</Big>
        </Center>
      )}
      {f >= p2 && f < p3 && (
        <div style={{ position: "absolute", left: 100, right: 100, top: 1180, height: 34, borderRadius: 17, border: "6px solid black", background: "rgba(0,0,0,.5)" }}>
          <div style={{ width: `${interpolate(f, [p2, p3], [0, 100], clamp)}%`, height: "100%", background: C.red, borderRadius: 17 }} />
          <div style={{ position: "absolute", right: -20, top: -70, fontSize: 80 }}>⏱️</div>
        </div>
      )}
      {f >= p3 && (
        <Center top={480}>
          <Stamp color={C.yellow} size={220} rotate={-8}>🫵 TÚ</Stamp>
        </Center>
      )}
      <Cap id="goal" />
    </AbsoluteFill>
  );
};

export const Fast: React.FC = () => {
  const f = useCurrentFrame();
  const [p1, p2, p3] = [P("fast", 1), P("fast", 2), P("fast", 3)];
  const notifs = [
    { icon: "▶️", title: "Video nuevo", text: "no vas a creer esto 😱" },
    { icon: "❤️", title: "+87 likes", text: "estás en tendencia" },
    { icon: "🔔", title: "Notificación", text: "alguien te mencionó" },
  ];
  return (
    <AbsoluteFill>
      {f < p2 ? <Bg kind="danger" /> : <NeonBurst a="#2a0f3f" b="#08030f" speed={0.4} />}
      {f < p1 && (
        <Cam cuts={[{ at: 0, s: 1.1 }]}>
          <Center top={420}><Molecule kind="fast" /></Center>
        </Cam>
      )}
      {f >= p1 && f < p2 && (
        <AbsoluteFill style={{ transform: shake(f, 3) }}>
          <Center top={560}><FatBoy mood="spiral" glow={C.pink} size={520} /></Center>
          {notifs.map((n, i) => <Notification key={i} {...n} at={p1 + i * 16} top={300 + i * 150} tilt={i % 2 ? 3 : -3} color={i === 1 ? C.yellow : "white"} />)}
        </AbsoluteFill>
      )}
      {f >= p2 && (
        <Cam cuts={[{ at: p2, s: 1 }, { at: p3, s: 1.08, y: 40 }]} drift={0.001}>
          <Center top={430}><Graph kind="fast" progress={interpolate(f, [p2, p2 + 30, p3, p3 + 30], [0.12, 0.38, 0.38, 1], clamp)} /></Center>
          {f >= p3 && <Center top={960}><FatBoy mood="sad" phone={false} gray size={330} /></Center>}
        </Cam>
      )}
      {f >= p2 && f < p3 && <Center top={280}><Stamp color={C.pink} size={120}>📈 PICO</Stamp></Center>}
      {f >= p3 && <Center top={280}><Stamp color="#bbb" size={120}>📉 VACÍO</Stamp></Center>}
      <Hud from={100} />
      <Cap id="fast" />
    </AbsoluteFill>
  );
};

export const You: React.FC = () => {
  const f = useCurrentFrame();
  const [p1, p2, p3, p4] = [P("you", 1), P("you", 2), P("you", 3), P("you", 4)];
  const thumbY = f < p1 ? 1500 : f < p3 ? interpolate(f, [p1, p1 + 20, p2], [1500, 900, 760], clamp) : interpolate(f, [p3, p3 + 8], [760, 1700], clamp);
  return (
    <AbsoluteFill>
      {f < p4 ? <Bg kind="danger" /> : <Bg kind="room" />}
      {f < p4 && (
        <AbsoluteFill>
          {/* pantalla de "TikTok" del espectador */}
          <Center top={330}>
            <div style={{ width: 640, height: 900, borderRadius: 50, border: "12px solid black", background: "linear-gradient(#2a2a2a,#111)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 24, width: "100%", textAlign: "center", fontFamily, color: "white", fontSize: 40 }}>Siguiendo | <u>Para ti</u></div>
              <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontSize: 200 }}>{f >= p2 ? "🧪" : "📱"}</div>
              <div style={{ position: "absolute", right: 20, top: 420, fontSize: 64, display: "flex", flexDirection: "column", gap: 24 }}>
                <span>❤️</span><span>💬</span><span>↗️</span>
              </div>
              <div style={{ position: "absolute", left: "50%", top: 120, marginLeft: -40, fontSize: 90, opacity: f >= p1 && f < p3 ? (f % 16 < 8 ? 1 : 0.3) : 0 }}>⬆️</div>
            </div>
          </Center>
          <div style={{ position: "absolute", left: 400, top: thumbY, fontSize: 330, transform: `rotate(-10deg)` }}>👆</div>
          {f >= p2 && f < p3 && (
            <div style={{ position: "absolute", left: 600, top: thumbY - 80, transform: "scale(0.35)", transformOrigin: "0 0" }}>
              <Molecule kind="fast" />
            </div>
          )}
          {f >= p2 && f < p3 && <Center top={250}><Stamp color={C.pink} size={140}>ES ELLA 👀</Stamp></Center>}
          {f >= p3 && (
            <Center top={520}>
              <div style={{ transform: `scale(${spring({ frame: f - p3, fps: 30, config: { damping: 8 } })}) rotate(-6deg)` }}>
                <svg width={560} height={560} viewBox="0 0 100 100">
                  <polygon points="30,2 70,2 98,30 98,70 70,98 30,98 2,70 2,30" fill={C.red} stroke="white" strokeWidth={5} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Big size={92}>NO<br />DESLICES</Big>
                </div>
              </div>
            </Center>
          )}
        </AbsoluteFill>
      )}
      {f >= p4 && (
        <Cam cuts={[{ at: p4, s: 1.6, y: 360 }]} drift={0.002}>
          <Center top={360}><FatBoy mood="plead" phone={false} size={640} /></Center>
        </Cam>
      )}
      <Hud from={100} />
      <Cap id="you" />
    </AbsoluteFill>
  );
};

const Toggle: React.FC<{ on: boolean; label: string }> = ({ on, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 30, background: "white", border: "8px solid black", borderRadius: 30, padding: "20px 34px", fontFamily, fontSize: 56, boxShadow: "0 10px 0 black" }}>
    {label}
    <div style={{ width: 150, height: 80, borderRadius: 40, background: on ? C.lime : "#bbb", border: "6px solid black", position: "relative" }}>
      <div style={{ position: "absolute", top: 4, left: on ? 74 : 4, width: 60, height: 60, borderRadius: 30, background: "white", border: "5px solid black" }} />
    </div>
  </div>
);

export const N1: React.FC = () => {
  const f = useCurrentFrame();
  const [p1, p2, p3] = [P("n1", 1), P("n1", 2), P("n1", 3)];
  const gray = interpolate(f, [p1 + 30, p2], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${gray})` }}>
        <NeonBurst a={C.pink} b={C.violet} speed={1} />
        <Cam cuts={[{ at: 0, s: 1 }, { at: p1, s: 1.25, y: 120 }, { at: p2, s: 1, y: 60 }, { at: p3, s: 1.5, y: 320 }]}>
          <Center top={420}><FatBoy mood={f >= p3 ? "bored" : "scroll"} glow={gray > 0.5 ? "#9a9a9a" : C.pink} size={600} /></Center>
        </Cam>
        {f >= p1 && f < p3 && <Center top={1020}><Toggle on={f > p1 + 25} label="Escala de grises" /></Center>}
        {f >= p3 && <div style={{ position: "absolute", right: 120, top: 420, fontSize: 130 }}>💤</div>}
      </AbsoluteFill>
      <LevelSlam label="NIVEL 1" out={p1 - 2} />
      <Hud from={100} to={80} at={P("n1", 3) + 10} />
      <Cap id="n1" />
    </AbsoluteFill>
  );
};

export const N2: React.FC = () => {
  const f = useCurrentFrame();
  const [p1, p2, p3] = [P("n2", 1), P("n2", 2), P("n2", 3)];
  return (
    <AbsoluteFill>
      {f < p2 ? <Bg kind="room" /> : <Bg kind="night" />}
      {f >= p1 && f < p2 && (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 140, top: 380, width: 360, height: 720, background: "#8B5A2B", border: "10px solid black", borderRadius: 10, transformOrigin: "0 50%", transform: `perspective(1200px) rotateY(${interpolate(f, [p1, p1 + 20], [0, -60], clamp)}deg)` }}>
            <div style={{ position: "absolute", right: 30, top: 360, width: 40, height: 40, borderRadius: 20, background: C.yellow, border: "5px solid black" }} />
          </div>
          <div style={{ position: "absolute", left: 120, top: 980, fontSize: 150 }}>🛏️</div>
          <div style={{ position: "absolute", left: 180, top: 900, transform: "rotate(-80deg) scale(.5)", transformOrigin: "0 0" }}><Phone w={150} screen="#222" /></div>
          <div style={{ position: "absolute", left: 230, top: 860, fontSize: 70 }}>💤</div>
          <div style={{ position: "absolute", right: 60, top: 430 }}><FatBoy mood="viewer" phone={false} size={430} /></div>
        </AbsoluteFill>
      )}
      {f >= p2 && (
        <Cam cuts={[{ at: p2, s: 1 }, { at: p3, s: 1.35, y: 140 }]} drift={0.003}>
          <Center top={300}><Big size={200} color={C.red} style={{ opacity: f % 30 < 22 ? 1 : 0.3, textShadow: `0 0 40px ${C.red}` }}>3:00</Big></Center>
          {f >= p3 && (
            <Center top={560} style={{ transform: shake(f, 6) }}>
              <div style={{ position: "relative" }}>
                <Phone w={330} screen="#1a0000">
                  <svg viewBox="0 0 100 200" width="100%" height="100%">
                    <polygon points="18,70 42,82 18,90" fill={C.red} />
                    <polygon points="82,70 58,82 82,90" fill={C.red} />
                    <path d="M20 125 L30 140 L40 125 L50 140 L60 125 L70 140 L80 125 L80 150 L20 150 Z" fill="white" stroke="black" strokeWidth={2} />
                  </svg>
                </Phone>
              </div>
            </Center>
          )}
        </Cam>
      )}
      <LevelSlam label="NIVEL 2" out={p1 - 2} />
      <Hud from={80} to={60} at={PE("n2", 3) - 10} />
      <Cap id="n2" />
    </AbsoluteFill>
  );
};

export const N3: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = timing2("n3");
  const [p1, p2] = [P("n3", 1), P("n3", 2)];
  const counts = t.parts.slice(3).map((p) => p[0]);
  let n = -1;
  counts.forEach((c, i) => {
    if (f >= c) n = i;
  });
  const done = f >= counts[counts.length - 1] + 26;
  const num = 5 - n;
  const local = n >= 0 ? f - counts[n] : 0;
  const pulse = spring({ frame: local, fps, config: { damping: 8, stiffness: 300 } });
  return (
    <AbsoluteFill>
      <NeonBurst a={done ? "#2f9e44" : n >= 0 ? "#3a0b20" : "#1d1036"} b="#08030f" speed={0.8} />
      <Cam cuts={[{ at: 0, s: 1 }, { at: p1, s: 1, y: 40 }, { at: p2, s: 1.5, y: 330 }, { at: counts[0], s: 0.75, y: 260 }]}>
        <Center top={400}>
          <FatBoy mood={done ? "happy" : f >= p2 && f < counts[0] ? "viewer" : "effort"} look={[0, 0]} sweat={n >= 0 && !done} glow={C.red} size={600} />
        </Center>
      </Cam>
      {f >= p1 && f < p2 && <div style={{ position: "absolute", right: 70, top: 420, fontSize: 160, transform: `rotate(${Math.sin(f / 3) * 15}deg)` }}>📲</div>}
      {f >= p2 && f < counts[0] && <Center top={330}><Stamp color={C.cyan} size={120}>CONTÁ CONMIGO 🤝</Stamp></Center>}
      {n >= 0 && !done && (
        <Center top={300}>
          <div style={{ position: "relative", width: 420, height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={420} height={420} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
              <circle cx={50} cy={50} r={44} fill="rgba(0,0,0,.5)" stroke="black" strokeWidth={8} />
              <circle cx={50} cy={50} r={44} fill="none" stroke={C.yellow} strokeWidth={5} pathLength={1} strokeDasharray={`${num / 5} 1`} transform="rotate(-90 50 50)" />
            </svg>
            <Big size={300} color={C.yellow} style={{ transform: `scale(${interpolate(pulse, [0, 1], [1.8, 1])})` }}>{num}</Big>
          </div>
        </Center>
      )}
      {done && <Center top={330}><Stamp color={C.lime} size={140}>✅ RESISTIDO</Stamp></Center>}
      <LevelSlam label="NIVEL 3" out={p1 - 2} />
      <Hud from={60} to={40} at={counts[counts.length - 1] + 26} />
      {/* durante la cuenta el número gigante reemplaza al subtítulo */}
      <Caption words={t.words.filter((w) => w.f < counts[0])} top={1330} size={100} />
    </AbsoluteFill>
  );
};

export const N4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [p1, p2, p3, p4] = [P("n4", 1), P("n4", 2), P("n4", 3), P("n4", 4)];
  const morph = interpolate(f, [p1 + 20, p1 + 50], [0, 1], clamp);
  const acts = [["🚶", "SALIR"], ["🏋️", "ENTRENAR"], ["🗣️", "HABLAR"]];
  return (
    <AbsoluteFill>
      {f < p2 ? <Bg kind="danger" /> : <Bg kind="warm" />}
      {f >= p1 && f < p2 && (
        <Center top={420}>
          <div style={{ position: "relative", width: 520, height: 520 }}>
            <div style={{ position: "absolute", opacity: 1 - morph }}><Molecule kind="fast" /></div>
            <div style={{ position: "absolute", opacity: morph }}><Molecule kind="slow" /></div>
          </div>
        </Center>
      )}
      {f >= p2 && (
        <Cam cuts={[{ at: p2, s: 1 }, { at: p3, s: 1.45, y: 280 }, { at: p4, s: 0.9, y: 160 }]}>
          <Center top={420}><FatBoy mood={f >= p3 && f < p4 ? "effort" : "happy"} phone={false} jog={f < p4} sweat={f >= p3} size={560} /></Center>
        </Cam>
      )}
      {f >= p2 && f < p3 && acts.map(([ic, lbl], i) => {
        const at = p2 + i * 22;
        if (f < at) return null;
        const s = spring({ frame: f - at, fps, config: { damping: 9 } });
        return (
          <div key={i} style={{ position: "absolute", left: 60 + i * 330, top: 1040, transform: `scale(${s})`, textAlign: "center" }}>
            <div style={{ fontSize: 130 }}>{ic}</div>
            <Big size={56} color={C.yellow}>{lbl}</Big>
          </div>
        );
      })}
      {f >= p4 && <Center top={340}><Graph kind="slow" progress={interpolate(f, [p4, p4 + 40], [0, 1], clamp)} w={700} /></Center>}
      <LevelSlam label="NIVEL 4" out={p1 - 2} />
      <Hud from={40} to={20} at={p4 + 10} />
      <Cap id="n4" />
    </AbsoluteFill>
  );
};

export const Fin: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [p1, p2, p3, p4] = [P("fin", 1), P("fin", 2), P("fin", 3), P("fin", 4)];
  const win = f >= p3 + 15;
  return (
    <AbsoluteFill>
      {win ? <Bg kind="gold" /> : <NeonBurst a="#2b1150" b="#0b0518" speed={1} />}
      {win && <EmojiRain emojis={["🎉", "⭐", "🏆", "✨"]} seed="w" speed={2} />}
      <Cam cuts={[{ at: 0, s: 1 }, { at: p1, s: 1.8, y: 360 }, { at: p2, s: 1, y: 80 }, { at: p4, s: 0.8, y: 0 }]}>
        <Center top={440}><FatBoy mood={f >= p1 && f < p2 ? "viewer" : win ? "happy" : "plead"} look={[0, 0]} phone={false} size={600} /></Center>
      </Cam>
      {f >= p1 && f < p2 && <Center top={420}><Stamp color={C.yellow} size={240} rotate={-8}>🫵</Stamp></Center>}
      {f >= p2 && f < p4 && !win && (
        <Center top={1060}>
          <div style={{ fontFamily, fontSize: 64, background: "white", border: "8px solid black", borderRadius: 30, padding: "12px 34px", boxShadow: "0 10px 0 black" }}>
            ⏱️ {Math.floor((f - p2) / 30) + 80}s sin deslizar ✅
          </div>
        </Center>
      )}
      {win && f < p4 && <Center top={430} style={{ transform: `scale(${spring({ frame: f - p3 - 15, fps, config: { damping: 9 } })})` }}><Big size={110} color={C.yellow}>🏆 OBJETIVO<br />CUMPLIDO</Big></Center>}
      {f >= p4 && (
        <AbsoluteFill>
          <Center top={700}>
            <div style={{ background: "white", border: "9px solid black", borderRadius: 40, padding: "26px 34px", width: 820, boxShadow: "0 14px 0 black", fontFamily }}>
              <div style={{ fontSize: 56, color: C.ink }}>💬 ¿Cuántas horas de pantalla tienes hoy?</div>
              <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                {["2h", "5h", "8h", "12h+"].map((h, i) => (
                  <div key={h} style={{ flex: 1, textAlign: "center", fontSize: 64, background: [C.lime, C.yellow, "#FF9A1F", C.red][i], border: "6px solid black", borderRadius: 24, transform: `scale(${spring({ frame: f - p4 - i * 6, fps, config: { damping: 9 } })})` }}>{h}</div>
                ))}
              </div>
            </div>
          </Center>
          <div style={{ position: "absolute", right: 30 - Math.abs(Math.sin(f / 4)) * 30, top: 1120, fontSize: 130 }}>👉</div>
        </AbsoluteFill>
      )}
      <LevelSlam label="ÚLTIMO NIVEL" color={C.pink} out={p1 - 2} />
      <Hud from={20} to={0} at={p3 + 10} />
      <Cap id="fin" />
    </AbsoluteFill>
  );
};

/** Toma final: el celular vibra, la barra vuelve a 100%... y la frase queda cortada → empalma con el inicio */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const buzz = f > 20;
  const back = interpolate(f, [30, 60], [0, 100], { ...clamp, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ transform: shake(f, buzz ? 5 : 0) }}>
      <Bg kind="warm" />
      <Cam cuts={[{ at: 0, s: 1 }, { at: 40, s: 1.9, y: 330 }]} drift={0.004}>
        <Center top={420}><FatBoy mood={f < 40 ? "happy" : f % 8 < 4 ? "spiral" : "shock"} phone={false} look={[0.6, 1]} size={580} /></Center>
        <div style={{ position: "absolute", left: 690, top: 1110, transform: `rotate(${buzz ? Math.sin(f * 3) * 12 - 80 : -80}deg)` }}>
          <Phone w={170} screen={buzz ? C.pink : "#111"} />
        </div>
      </Cam>
      <Center top={140} style={{ transform: "scale(.9)" }}>
        <DopamineBar value={back} mode={back > 60 ? "danger" : "gold"} label="DOPAMINA · META 0%" />
      </Center>
      {buzz && <AbsoluteFill style={{ boxShadow: `inset 0 0 ${120 + Math.sin(f) * 40}px ${C.pink}` }} />}
      <Cap id="loop" />
    </AbsoluteFill>
  );
};

export const SHOTS: Record<string, React.FC> = { h1: H1, h2: H2, h3: H3, i1: I1, i2: I2, goal: Goal, fast: Fast, you: You, n1: N1, n2: N2, n3: N3, n4: N4, fin: Fin, loop: Loop };
