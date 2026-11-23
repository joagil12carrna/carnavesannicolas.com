# Dopamin Boy — video para TikTok (Remotion)

9:16 · 1080x1920 · 30 fps · ~54 s · voz en off en tercera persona, subtítulos sincronizados palabra por palabra, música y efectos sintetizados, final interactivo (el público elige comentando 1 o 2).

```bash
npm install
npm run dev      # abre Remotion Studio para previsualizar y editar
npm run render   # genera out/dopamin-boy.mp4
```

## Guion
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
