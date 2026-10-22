#!/usr/bin/env node
// Ensambla index.html (un solo fichero autocontenido) a partir de src/
// Sin dependencias externas.  Uso:  node build.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, 'src');
const r = (p) => fs.readFile(path.join(src, p), 'utf8');

const meta = JSON.parse(await r('meta.json'));
const dir = path.join(src, 'slides');
const files = (await fs.readdir(dir)).filter(f => f.endsWith('.html')).sort();
const slides = [];
for (const f of files) slides.push((await r(path.join('slides', f))).trim());

const css = await r('styles.css');
const js = await r('deck.js');

const head = [
  '<!doctype html>',
  '<html lang="es">',
  '<head>',
  '<meta charset="utf-8">',
  '<meta name="viewport" content="width=device-width,initial-scale=1">',
  '<title>' + meta.title + '</title>',
  '<meta name="description" content="' + meta.subtitle + '">',
  '<meta name="author" content="' + meta.author + '">',
  '<meta name="generated" content="' + new Date().toISOString().slice(0, 10) + '">',
  '<style>',
  css,
  '</style>',
  '</head>',
  '<body>',
  '<div id="viewport">',
  '  <div id="stage">'
].join('\n');

const tail = [
  '    <div id="progress"></div>',
  '    <div id="chrome">',
  '      <span class="mod" id="chromeMod"></span>',
  '      <span class="chip" id="chromeClock" style="display:none">&#9201; 00:00:00</span>',
  '      <span class="chip" id="chromeIdx">1 / ' + slides.length + '</span>',
  '    </div>',
  '  </div>',
  '</div>',
  '<div id="help">',
  '  <b>&#8592; &#8594;</b> / <b>espacio</b> navegar &middot; <b>O</b> indice &middot; <b>N</b> notas del ponente &middot; <b>F</b> pantalla completa &middot; <b>C</b> cronometro &middot; <b>P</b> modo presentar &middot; <b>?</b> ayuda &middot; <b>1&hellip;9</b> saltar por decimas &middot; <b>Ctrl+P</b> PDF &middot; clic en los bordes',
  '</div>',
  '<div id="overview"><h3>Indice &mdash; ' + slides.length + ' diapositivas &middot; pulsa para saltar (Esc cierra)</h3><div id="ovgrid"></div></div>',
  '<div id="notes"><h4>Notas del ponente &mdash; diapositiva <span id="notesIdx"></span></h4><div id="notesBody"></div></div>',
  '<script>',
  js,
  '</script>',
  '</body>',
  '</html>',
  ''
].join('\n');

let html = [head, slides.join('\n'), tail].join('\n');

// Inyecta las imágenes de src/img/ como data URI para que index.html siga siendo autocontenido
const mimes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
for (const m of new Set(html.match(/src="img\/[^"]+"/g) || [])) {
  const rel = m.slice(5, -1);
  const file = path.join(src, rel);
  const ext = path.extname(file).toLowerCase();
  const b64 = (await fs.readFile(file)).toString('base64');
  html = html.split(m).join('src="data:' + (mimes[ext] || 'application/octet-stream') + ';base64,' + b64 + '"');
}
await fs.writeFile(path.join(root, 'index.html'), html, 'utf8');
const n = (html.match(/<section class="slide/g) || []).length;
console.log('index.html listo: ' + n + ' diapositivas, ' + (html.length / 1024).toFixed(1) + ' KB, ' + files.length + ' ficheros fuente');
