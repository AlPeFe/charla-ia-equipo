"""Reinserta los 30 memes en las primeras 50 diapositivas, solo donde hay hueco
real (medido en navegador con regla estricta: cualquier texto cuenta) y
emparejando las imagenes mas altas con las diapositivas con mas sitio.
m21 (badalona) va forzada en el indice 2 -> diapositiva 3."""
import re, glob, os
from collections import OrderedDict
from PIL import Image

root = os.path.dirname(os.path.abspath(__file__))
os.chdir(root)

# capacidad medida en el navegador (indice 0-based -> ancho maximo que cabe)
FIT = {2:224, 3:224, 4:224, 5:140, 6:224, 7:104, 8:224, 10:224, 11:140, 12:224, 13:168,
       14:224, 15:196, 16:168, 17:84, 18:196, 19:196, 20:92, 21:84, 23:84, 25:224, 27:224,
       28:196, 29:196, 30:224, 31:168, 32:168, 33:118, 34:168, 35:224, 36:118, 37:224,
       39:168, 40:140, 41:224, 42:224, 43:140, 44:92, 45:92, 46:224, 47:168, 48:84, 49:104}
BADALONA_IDX, BADALONA = 2, 'm21.jpg'

files = sorted(glob.glob('src/slides/*.html'))
SEC = re.compile(r'<section class="slide.*?</section>', re.S)

for f in files:
    raw = open(f, encoding='utf-8').read()
    raw = re.sub(r'\n?\s*<img class="meme-inline"[^>]*>', '', raw)
    open(f, 'w', encoding='utf-8').write(raw)

parsed, order = {}, []
for f in files:
    raw = open(f, encoding='utf-8').read()
    items = list(SEC.finditer(raw))
    parsed[f] = {'pre': raw[:items[0].start()] if items else raw}
    for m in items:
        order.append((f, m.group(0)))
print("secciones:", len(order))

ratios = {}
for p in glob.glob('src/img/memes/*.jpg'):
    im = Image.open(p)
    ratios[os.path.basename(p)] = im.size[1] / im.size[0]

cands = sorted([i for i in FIT if i != BADALONA_IDX], key=lambda i: -FIT[i])[:29]
imgs = sorted([k for k in ratios if k != BADALONA], key=lambda k: -ratios[k])

img_por_idx = {BADALONA_IDX: BADALONA}
for i, im in zip(cands, imgs):
    img_por_idx[i] = im

print("diapositivas destino:", sorted(x + 1 for x in img_por_idx))
for i in sorted(img_por_idx):
    print(f"   {i+1:>2}: {img_por_idx[i]}  ratio={ratios[img_por_idx[i]]:.2f}  sitio={FIT[i]}")

def insertar(txt, img):
    tag = re.match(r'(<section[^>]*>)', txt)
    return txt[:tag.end()] + f'\n  <img class="meme-inline" src="img/memes/{img}" alt="">' + txt[tag.end():]

por_fichero = OrderedDict((f, []) for f in files)
for i, (f, t) in enumerate(order):
    por_fichero[f].append(insertar(t, img_por_idx[i]) if i in img_por_idx else t)
for f in files:
    open(f, 'w', encoding='utf-8').write(parsed[f]['pre'] + '\n\n'.join(por_fichero[f]) + '\n')

h = ''.join(open(f, encoding='utf-8').read() for f in files)
print("pegatinas insertadas:", len(re.findall(r'class="meme-inline"', h)))
