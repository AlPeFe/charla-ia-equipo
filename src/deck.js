/* Deck engine — vanilla, sin dependencias, funciona desde file:// */
(() => {
  const stage = document.getElementById('stage');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const chromeMod = document.getElementById('chromeMod');
  const chromeIdx = document.getElementById('chromeIdx');
  const chromeClock = document.getElementById('chromeClock');
  const progress = document.getElementById('progress');
  const notesBox = document.getElementById('notes');
  const notesBody = document.getElementById('notesBody');
  const overview = document.getElementById('overview');
  const ovgrid = document.getElementById('ovgrid');
  const help = document.getElementById('help');

  let i = 0;
  const total = slides.length;
  let seconds = 0;
  let clockOn = false;

  // ---- escala a la ventana y centra el escenario (origin 0 0, sin desbordes raros)
  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    const x = Math.round((innerWidth - 1280 * s) / 2);
    const y = Math.round((innerHeight - 720 * s) / 2);
    stage.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  addEventListener('resize', fit);

  // ---- índice de módulos
  const modules = [];
  slides.forEach((s, n) => {
    const m = s.dataset.module || '';
    if (!modules.length || modules[modules.length - 1].name !== m) modules.push({ name: m, from: n, to: n });
    else modules[modules.length - 1].to = n;
  });
  function moduleOf(n) { return (modules.find(m => n >= m.from && n <= m.to) || {}).name || ''; }

  // ---- overview
  slides.forEach((s, n) => {
    const item = document.createElement('div');
    item.className = 'ovitem';
    const t = s.querySelector('h1,h2')?.textContent?.trim() || '(sin título)';
    item.innerHTML = '<i></i>' + t.replace(/</g, '&lt;');
    item.querySelector('i').textContent = (moduleOf(n) || 'módulo');
    item.addEventListener('click', () => { go(n); toggleOverview(false); });
    ovgrid.appendChild(item);
  });
  const ovItems = Array.from(ovgrid.children);

  // ---- render
  function render() {
    slides.forEach((s, n) => s.classList.toggle('active', n === i));
    chromeMod.textContent = moduleOf(i);
    chromeIdx.textContent = (i + 1) + ' / ' + total;
    progress.style.width = ((i + 1) / total * 100) + '%';
    const noteHtml = slides[i].querySelector('.notes')?.innerHTML || '<em class="dim">(esta diapositiva no tiene notas del ponente)</em>';
    notesBody.innerHTML = noteHtml;
    ovItems.forEach((el, n) => { el.classList.toggle('now', n === i); el.classList.toggle('done', n < i); });
    if (location.hash !== '#/' + (i + 1)) history.replaceState(null, '', '#/' + (i + 1));
    document.title = '(' + (i + 1) + '/' + total + ') ' + (slides[i].querySelector('h1,h2')?.textContent?.trim() || 'Charla IA');
  }
  function go(n) { i = Math.max(0, Math.min(total - 1, n)); render(); }
  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  // ---- UI toggles
  function toggle(e) { e.classList.toggle('on'); }
  function toggleOverview(force) { const on = force === undefined ? !overview.classList.contains('on') : force; overview.classList.toggle('on', on); }
  function toggleNotes() { toggle(notesBox); }
  async function toggleFull() {
    try { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); }
    catch (e) { /* file:// o bloqueado: no pasa nada */ }
  }
  function toggleClock() { clockOn = !clockOn; chromeClock.style.display = clockOn ? '' : 'none'; }
  setInterval(() => {
    seconds++;
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor(seconds % 3600 / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    chromeClock.textContent = '\u23F1 ' + h + ':' + m + ':' + s;
  }, 1000);

  // ---- teclado
  addEventListener('keydown', ev => {
    const k = ev.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown' || k === 'n' && ev.ctrlKey) { ev.preventDefault(); next(); return; }
    if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { ev.preventDefault(); prev(); return; }
    if (k === 'Home') { go(0); return; }
    if (k === 'End') { go(total - 1); return; }
    if (k === 'o' || k === 'O') { toggleOverview(); return; }
    if (k === 'N') { toggleNotes(); return; }
    if (k === 'f' || k === 'F') { toggleFull(); return; }
    if (k === 'c' || k === 'C') { toggleClock(); return; }
    if (k === '?' || k === 'h' || k === 'H') { toggle(help); return; }
    if (k === 'Escape') { toggleOverview(false); help.classList.remove('on'); notesBox.classList.remove('on'); return; }
    if (k === 'p' || k === 'P') { toggleFull(); toggleNotes(); return; }
    // salto por número + Enter
    if (/^[0-9]$/.test(k)) {
      const n = parseInt(k, 10);
      if (n === 0) { go(0); return; }
      go(Math.round(n * total / 10) - 1);
    }
  });

  // ---- click / swipe
  stage.addEventListener('click', ev => {
    if (ev.target.closest('a')) return;
    const r = stage.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    if (x > 0.72) next(); else if (x < 0.16) prev();
  });
  let tx = 0, ty = 0;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? next() : prev();
  }, { passive: true });

  // ---- hash
  addEventListener('hashchange', () => {
    const n = parseInt((location.hash || '').replace('#/', ''), 10);
    if (!isNaN(n) && n - 1 !== i) go(n - 1);
  });

  // ---- arranque
  const start = parseInt((location.hash || '').replace('#/', ''), 10);
  fit();
  go(isNaN(start) ? 0 : start - 1);
  window.deck = { go, next, prev, total, fit };
})();
