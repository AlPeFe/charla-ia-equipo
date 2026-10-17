#!/usr/bin/env node
/**
 * Descarga el catálogo público de modelos de OpenRouter y guarda un snapshot fechado
 *   node datos/actualizar-modelos.mjs
 * Genera:
 *   datos/panorama-openrouter-<fecha>.json   (crudo, para consultas)
 *   datos/panorama-openrouter-<fecha>.md     (tabla legible: gamas, precios, contexto)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const today = new Date().toISOString().slice(0, 10);
const res = await fetch('https://openrouter.ai/api/v1/models');
if (!res.ok) throw new Error('OpenRouter respondió ' + res.status);
const { data } = await res.json();

const rows = data.map(m => ({
  id: m.id,
  nombre: m.name,
  publicado: new Date((m.created || 0) * 1000).toISOString().slice(0, 10),
  contexto: m.context_length,
  entrada_por_millon: Number(m.pricing?.prompt) * 1e6,
  salida_por_millon: Number(m.pricing?.completion) * 1e6,
  entrada: (m.architecture?.input_modalities || []).join('+'),
  salida: (m.architecture?.output_modalities || []).join('+'),
  abierto: Boolean(m.hugging_face_id)
}));

const jsonFile = path.join(here, 'panorama-openrouter-' + today + '.json');
await fs.writeFile(jsonFile, JSON.stringify({ fuente: 'https://openrouter.ai/api/v1/models', fecha: today, total: rows.length, modelos: rows }, null, 1));

const money = n => n == null || Number.isNaN(n) ? '-' : '$' + n.toFixed(2);
const banda = r => r.salida_por_millon >= 50 ? 'frontera' : r.salida_por_millon >= 12 ? 'alta' : r.salida_por_millon >= 2 ? 'media' : 'económica';
const conPrecio = rows.filter(r => r.salida_por_millon > 0 && r.salida !== 'image');
const top = [...conPrecio].sort((a, b) => b.publicado.localeCompare(a.publicado)).slice(0, 40);

const md = [
  '# Panorama de modelos — snapshot ' + today,
  '',
  'Fuente: ' + 'https://openrouter.ai/api/v1/models' + ' · **' + rows.length + ' modelos** en catálogo · generado por `datos/actualizar-modelos.mjs`.',
  '',
  '## Modelos abiertos (pesos descargables)',
  '',
  '| modelo | publicado | contexto | entrada $/M | salida $/M |',
  '|---|---|---|---|---|',
  ...rows.filter(r => r.abierto).sort((a, b) => b.publicado.localeCompare(a.publicado)).slice(0, 30)
    .map(r => '| `' + r.id + '` | ' + r.publicado + ' | ' + r.contexto + ' | ' + money(r.entrada_por_millon) + ' | ' + money(r.salida_por_millon) + ' |'),
  '',
  '## Los 40 más recientes (todas las gamas)',
  '',
  '| modelo | banda | publicado | contexto | entrada $/M | salida $/M | modalidades |',
  '|---|---|---|---|---|---|---|',
  ...top.map(r => '| `' + r.id + '` | ' + banda(r) + ' | ' + r.publicado + ' | ' + r.contexto + ' | ' + money(r.entrada_por_millon) + ' | ' + money(r.salida_por_millon) + ' | ' + r.entrada + ' |'),
  '',
  '## Recuento por banda de precio',
  '',
  '| banda | nº de modelos |',
  '|---|---|',
  ...['económica', 'media', 'alta', 'frontera'].map(b => '| ' + b + ' | ' + conPrecio.filter(r => banda(r) === b).length + ' |'),
  ''
].join('\n');

const mdFile = path.join(here, 'panorama-openrouter-' + today + '.md');
await fs.writeFile(mdFile, md);

console.log('· ' + rows.length + ' modelos descargados');
console.log('· ' + path.basename(jsonFile));
console.log('· ' + path.basename(mdFile));
