# Dopamin Boy — video para TikTok (Remotion)

Hay dos versiones:
- **`DopaminBoyV2` (principal, ~94 s)**: estilo "guía de supervivencia". Un narrador masculino le habla al espectador, Dopamin Boy (gordito, ojeras, granos, buzo manchado) tiene el **objetivo de bajar su dopamina de 100% a 0%** a lo largo de 4 niveles + uno final que depende del espectador (cuenta regresiva juntos, "no deslices", comentá tus horas de pantalla). Termina con una frase cortada que empalma con el inicio, así el video se repite sin que se note el corte.
- `DopaminBoy` (v1, ~54 s): narración en tercera persona con final de votación 1 o 2.


9:16 · 1080x1920 · 30 fps · ~54 s · voz en off en tercera persona, subtítulos sincronizados palabra por palabra, música y efectos sintetizados, final interactivo (el público elige comentando 1 o 2).

```bash
npm install
npm run dev      # abre Remotion Studio para previsualizar y editar
npm run render   # genera out/dopamin-boy-v2.mp4 (npm run render:v1 para la v1)
```

## Guion v2
| Toma | Voz en off | Visual |
|---|---|---|
| h1–h3 | Si tu cerebro recibe esta dopamina, tienes que alejarte. Con esta otra, nunca. Si te equivocas, terminas como él. | Molécula rosa con pinchos vs. molécula dorada → Dopamin Boy en su cuarto |
| i1–i2 | Este es Dopamin Boy… Pesa más de 120 kilos y scrollea más rápido que un caballo de carreras. | Ficha de personaje, balanza, velocímetro de scroll |
| goal | Hoy tiene un objetivo: bajar su dopamina de 100 a 0 antes de que termine este video. Y tú vas a ayudarlo. | Aparece la barra META 0%, "🫵 TÚ" |
| fast | Esta es la dopamina rápida… te da un pico enorme y te deja más vacío que antes. | Notificaciones, gráfico pico → caída |
| you | Y tú también la tienes… No deslices. Dopamin Boy te necesita. | Pantalla de TikTok, pulgar, señal de STOP |
| n1–n4 | Nivel 1: blanco y negro · Nivel 2: el celular duerme fuera · Nivel 3: espera 5 segundos (cuenta juntos) · Nivel 4: dopamina lenta | Cada nivel baja la barra 20% |
| fin | Último nivel: este depende de ti… Comenta cuántas horas de pantalla tienes hoy. | OBJETIVO CUMPLIDO, encuesta de horas, flecha a comentarios |
| loop | Porque la próxima vez que tu celular vibre… | La barra vuelve a 100% y corta → vuelve a empezar |

Audio v2: `python audio-tools/generate_vo.py es_ES-davefx-medium.onnx --script v2 --pitch 0.95` y `python audio-tools/generate_music_v2.py`. El guion está en `audio-tools/script_v2.py`.

## Guion v1
| # | Voz en off / subtítulo | Visual |
|---|---|---|
| 1 | Dopamin Boy hace 150 DÍAS que no puede dejar el celular | Ojos en espiral, contador DÍA 1→150, impacto |
| 2 | Son las 3:47am… y Dopamin Boy sigue scrolleando | Cuarto de noche, música filtrada |
| 3 | Cada notificación le da un golpe de DOPAMINA | Notificaciones con *ding*, la barra sube |
| 4 | Dopamin Boy mira 900 videos POR DÍA | Swipe cada 5 frames, contador |
| 5 | Pero cada vez necesita MÁS… para sentir lo mismo | x2 x4 x8 x16, riser |
| 6 | Hasta que un día… la dopamina… SE ACABÓ | La música se frena (tape stop), todo se desatura |
| 7 | Dopamin Boy ya no siente NADA | Gris, glitch, ERROR 404 |
| 8 | Y el celular… se quedó sin BATERÍA | Latidos, batería 0%, apagado |
| 9 | Por primera vez en 150 días, Dopamin Boy salió AFUERA | Música cálida, pájaros, logro desbloqueado |
| 10 | Pero entonces… el celular VIBRÓ | Vibración, zoom a los ojos que dudan |
| 11 | ¿Y ahora? ¿Qué hace Dopamin Boy? 1: agarra el celular. 2: lo tira por la ventana. Comentá 1 o 2… y el final más votado sale en la PARTE 2 | **Final interactivo**: pausa, dos opciones, cuenta regresiva y flecha a los comentarios |

## Audio
Los archivos de `public/audio/` se generan con los scripts de `audio-tools/`:

```bash
pip install piper-tts numpy scipy
# voz es_AR "daniela" de https://huggingface.co/rhasspy/piper-voices
python audio-tools/generate_vo.py es_AR-daniela-high.onnx   # voz + src/timeline.json
python audio-tools/generate_music.py                        # música + efectos
```

Para cambiar el guion, editá `LINES` en `generate_vo.py` y volvé a correr los dos scripts: la duración de cada escena y los subtítulos se ajustan solos a la voz.
En el subtítulo, `|` coincide con las pausas de la voz, `/` corta en grupos y las MAYÚSCULAS se resaltan.
