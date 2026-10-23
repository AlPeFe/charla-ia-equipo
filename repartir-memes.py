import re, glob, random, os

random.seed(7)
root = os.path.dirname(os.path.abspath(__file__))
os.chdir(root)

files = sorted(glob.glob('src/slides/*.html'))
SEC = re.compile(r'<section class="slide.*?</section>', re.S)

# 1) recolectar secciones por fichero (preamble + lista)
parsed = {}
order = []   # (file, sep, text)
for f in files:
    raw = open(f, encoding='utf-8').read()
    items = list(SEC.finditer(raw))
    pre = raw[:items[0].start()] if items else raw
    secs = []
    for i, m in enumerate(items):
        sep = raw[items[i-1].end():m.start()] if i else ''
        secs.append((sep if not secs else sep, m.group(0)))
    parsed[f] = {'pre': pre, 'secs': secs}
    for sep, txt in secs:
        order.append((f, sep, txt))

total_antes = len(order)
memes = [(f, sep, t) for (f, sep, t) in order if 'class="slide meme"' in t]
content = [(f, sep, t) for (f, sep, t) in order if 'class="slide meme"' not in t]
print(f"slides totales: {total_antes} | contenido: {len(content)} | memes: {len(memes)}")

# 2) imagenes de los memes, barajadas, y limpiar el texto visible
imgs = [f'img/memes/{os.path.basename(p)}' for p in sorted(glob.glob('src/img/memes/*.jpg'))]
random.shuffle(imgs)
print("memes disponibles:", len(imgs))

def make_meme(img, module):
    return ('<section class="slide meme"' + (f' data-module="{module}"' if module else '') + '>\n'
            f'  <img class="meme-shot" src="{img}" alt="meme">\n'
            '  <aside class="notes"><ul><li>Meme de descanso: se pasa rapido, sin comentario. '
            'Si no hay tiempo, salta con <b>&#8594;</b>.</li></ul></aside>\n'
            '</section>')

def module_of(txt):
    m = re.search(r'data-module="([^"]*)"', txt)
    return m.group(1) if m else ''

# 3) posiciones al azar repartidas por toda la charla (sin amontonarse)
n, k = len(content), len(imgs)
start = random.randint(3, 6)
huecos_min = 4 * (k - 1)
sobra = max(0, (n - 2) - start - huecos_min)      # holgura a repartir al azar
extras = [0] * (k - 1)
for _ in range(sobra):
    extras[random.randrange(k - 1)] += 1
pos, cur = [], start
for g in extras:
    pos.append(cur)
    cur += 4 + g
pos.append(cur)
pos = pos[:k]
assert len(pos) == k, f"solo {len(pos)} huecos"
print("posiciones (indice de la diapositiva de contenido tras la que va):", pos)
print("separaciones:", [pos[i+1]-pos[i] for i in range(len(pos)-1)])

# 4) ensamblar la nueva secuencia global
nueva = []          # (file_dueno, text)
meme_iter = iter(imgs)
pos_to_img = dict(zip(pos, imgs))
for i, (f, sep, txt) in enumerate(content):
    nueva.append((f, txt))
    if i in pos_to_img:
        nueva.append((f, make_meme(pos_to_img[i], module_of(txt))))

# 5) reescribir cada fichero con lo que le toca
from collections import OrderedDict
por_fichero = OrderedDict((f, []) for f in files)
for f, txt in nueva:
    por_fichero[f].append(txt)

for f in files:
    cuerpo = '\n\n'.join(t for t in por_fichero[f])
    out = parsed[f]['pre'] + cuerpo + '\n'
    open(f, 'w', encoding='utf-8').write(out)
    n_mem = sum(1 for t in por_fichero[f] if 'class="slide meme"' in t)
    print(f"  {f}: {len(por_fichero[f])} secciones ({n_mem} memes)")

# 6) comprobacion
tot = sum(len(SEC.findall(open(f, encoding='utf-8').read())) for f in files)
mem = sum(len(re.findall(r'class="slide meme"', open(f, encoding='utf-8').read())) for f in files)
cap = sum(len(re.findall(r'meme-cap|meme-tag', open(f, encoding='utf-8').read())) for f in files)
print(f"RESULTADO: {tot} slides, {mem} memes, textos bajo el meme: {cap}")
