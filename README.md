# IA en el trabajo: entenderla y usarla

Charla interna de **4 horas** sobre inteligencia artificial: qué es, cómo funciona por dentro, y cómo
usarla de verdad (harness, skills, agentes) para ganar productividad en código, despliegues y tareas
repetitivas.

Es una presentación **en un solo fichero HTML**: navegable como PowerPoint, sin instalar nada, sin
internet y sin dependencias. Funciona con doble clic en cualquier PC (Windows, macOS, Linux).

---

## Arrancarla

**Opción 1 — la más fácil (Windows):** doble clic en `abrir.cmd`.

**Opción 2 — cualquier sistema:**

```bash
node serve.mjs
```

Abre el navegador en `http://localhost:5180` y activa la recarga al editar (reconstruye solo).

**Opción 3 — sin servidor ni Node:** abre `index.html` con doble clic en el navegador. Ya está construido
y es autocontenido.

---

## Atajos de teclado

| Tecla | Qué hace |
|---|---|
| `←` `→` / `espacio` | Diapositiva anterior / siguiente |
| `O` | Índice completo (pulsa cualquier diapositiva para saltar) |
| `N` | Notas del ponente de la diapositiva actual |
| `P` | Modo presentar (pantalla completa + notas) |
| `F` | Pantalla completa |
| `C` | Cronómetro de la sesión |
| `?` | Ayuda con los atajos |
| `1`…`9` | Saltar por décimas partes de la charla |
| `Ctrl`+`P` | Exportar a PDF (cada diapositiva ocupa una página) |

También funciona con clic en los bordes de la diapositiva y con deslizar en táctil.
Enlace directo a una diapositiva: `index.html#/42`.

---

## Contenido: 159 diapositivas en 16 módulos

| Módulo | Diapositivas | Contenido |
|---|---|---|
| 0 · Encuadre | 6 | Objetivos, agenda de 4 h, reglas del juego |
| 1 · Qué es la IA | 8 | Definiciones, los tres saltos (transformer, ChatGPT, agentes), taxonomía, glosario |
| 2 · Cómo aprende | 14 | Datos, pérdida, gradientes, sobreajuste, las 4 fases, **fine-tuning, LoRA y QLoRA** |
| 3 · Anatomía de un LLM | 10 | Tokens, embeddings, atención, bloques, muestreo, multimodalidad |
| 4 · Inferencia | 14 | Prefill/decode, KV cache, cuantización, razonamiento, precios, hardware, API vs propio |
| 5 · Arquitecturas | 11 | Densa vs MoE, CNN, RNN/LSTM, tres familias de transformer, alternativas, otros modelos |
| 6 · Difusión y ComfyUI | 9 | Difusión paso a paso, checkpoints/VAE/LoRA/ControlNet, ComfyUI, flujos de equipo, LoRA de imagen, vídeo y audio |
| 7 · Panorama 2026 | 12 | Laboratorios, modelos punteros, precios, pesos abiertos, benchmarks, riesgos |
| 8 · Harness y agentes | 12 | Bucle, herramientas, contexto, permisos, ecosistema, MCP, paralelismo, coste |
| 9 · Skills y contexto | 7 | Skills, fichero de convenciones, memoria, ADRs, anatomía del prompt |
| 10 · Día a día (código) | 11 | Código heredado, tests, revisión, refactors, SQL, bugs, anti-patrones |
| 11 · Despliegue y apps | 10 | Plantillas, contenedores, IaC, CI/CD, observabilidad, seguridad, métricas |
| 12 · Automatizar | 9 | Inventario, contrato, CLIs, lotes, trabajos programados, cuándo NO |
| 13 · Riesgos y reglas | 10 | Alucinaciones, inyección de prompts, datos, seguridad, coste, checklists |
| 14 · Taller y adopción | 12 | 6 ejercicios guiados, plan 30/60/90, diez reglas |
| 15 · Anexo | 5 | Recursos, plantilla de convenciones, glosario, cómo editar |

Cada diapositiva incluye **notas del ponente** (tecla `N`).

---

## Editarla

Estructura del repositorio:

```
index.html             la presentación construida (se abre con doble clic)
abrir.cmd / abrir.sh   arrancar en local
serve.mjs              servidor local + reconstrucción automática
build.mjs              ensambla index.html a partir de src/
src/
  meta.json            título, subtítulo y autor
  styles.css           aspecto visual
  deck.js              navegación, notas, índice, cronómetro
  slides/*.html        el contenido: un fichero por módulo
datos/
  actualizar-modelos.mjs   refresca el panorama de modelos (OpenRouter)
  panorama-openrouter-2026-10-17.{json,md}
```

Para cambiar algo:

1. Edita o añade un fichero en `src/slides/`. Cada diapositiva es:

   ```html
   <section class="slide" data-module="1 · Qué es la IA">
     <div class="kicker">1 · Sección</div>
     <h2>Título de la diapositiva</h2>
     <div class="body"> ... contenido ... </div>
     <aside class="notes"><ul><li>Notas del ponente.</li></ul></aside>
   </section>
   ```

2. Reconstruye: `node build.mjs` (o simplemente `node serve.mjs`, que lo hace solo).
3. Recarga el navegador.

Clases útiles: `cols c2` / `c3` / `c4` (columnas), `card`, `callout`, `okbox`, `warnbox`,
`badbox`, `table sm|xs|xxs` (tablas densas), `body compact` (diapositiva cargada), `body dense`.

> Consejo: si añades mucho contenido a una diapositiva, comprueba que no se sale. La presentación
> recorta lo que no cabe. Cambia a `body compact` o divide la diapositiva en dos.

---

## Refrescar el panorama de modelos

Los datos de los laboratorios, precios y contextos son un **snapshot del 17 de octubre de 2026**,
obtenido de la API pública de OpenRouter (~470 modelos). Para actualizarlo:

```bash
node datos/actualizar-modelos.mjs
```

Genera un JSON con todos los modelos y un Markdown con tablas comparativas (bandas de precio,
modelos abiertos, novedades). Después actualiza a mano las tablas de la sección 6 si quieres.

---

## Cómo presentar

- Dos pantallas: pon la presentación en el proyector con `F` (pantalla completa) y el portátil con `N`
  (notas) — o usa `P`, que activa las dos cosas.
- Cronómetro: `C`. La agenda prevista está en la diapositiva de agenda.
- Para enviar el material: `Ctrl`+`P` y "Guardar como PDF".

---

## Licencia y uso

Material interno. Los textos son originales; las cifras de mercado y de modelos están fechadas y
proceden de fuentes públicas citadas en las propias diapositivas. Revisa la información volátil
(versiones de modelos, precios) antes de reutilizarla fuera del equipo.
