#!/usr/bin/env node
// Servidor local + auto-build + apertura del navegador.  Uso:  node serve.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 5180);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.ico': 'image/x-icon' };

async function needsBuild() {
  try {
    const idx = await fs.stat(path.join(root, 'index.html'));
    const dir = path.join(root, 'src');
    const list = ['styles.css', 'deck.js', 'meta.json'];
    for (const f of await fs.readdir(path.join(dir, 'slides'))) list.push('slides/' + f);
    for (const f of list) {
      const st = await fs.stat(path.join(dir, f));
      if (st.mtimeMs > idx.mtimeMs) return true;
    }
    return false;
  } catch { return true; }
}

if (await needsBuild()) {
  console.log('· construyendo index.html ...');
  await new Promise((res, rej) => {
    const p = spawn(process.execPath, [path.join(root, 'build.mjs')], { stdio: 'inherit' });
    p.on('exit', c => c === 0 ? res() : rej(new Error('build falló')));
  });
}

const server = http.createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.join(root, rel);
  if (!file.startsWith(root)) { res.writeHead(403).end('nope'); return; }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404 — ' + rel);
  }
});

server.listen(port, () => {
  const url = 'http://localhost:' + port + '/';
  console.log('');
  console.log('  Charla IA — servidor local');
  console.log('  ' + url);
  console.log('');
  console.log('  Ctrl+C para parar. También puedes abrir index.html directamente, sin servidor.');
  console.log('');
  if (!process.argv.includes('--no-open')) {
    const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]]
      : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
    try { spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref(); } catch (e) {}
  }
});
