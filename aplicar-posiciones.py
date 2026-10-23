"""Aplica las posiciones calculadas en el navegador a los <img class="meme-inline">."""
import re, glob, json, os

ROOT = r'C:\Users\alexlocal\projects\charla-ia-equipo'
PLACE = r'C:\Users\alexlocal\AppData\Local\hermes\profiles\upstream-polapermanga\cache\scratch\meme_placements.json'

pos = {int(k): v for k, v in json.load(open(PLACE)).items()}
os.chdir(ROOT)
files = sorted(glob.glob('src/slides/*.html'))
SEC = re.compile(r'<section class="slide.*?</section>', re.S)

# indice global de cada seccion, en orden
idx = 0
aplicados = 0
for f in files:
    raw = open(f, encoding='utf-8').read()
    out, last = [], 0
    for m in SEC.finditer(raw):
        out.append(raw[last:m.start()])
        txt = m.group(0)
        if 'class="meme-inline"' in txt:
            p = pos.get(idx)
            if p:
                txt = re.sub(r'\s*data-c="[^"]*"', '', txt)
                txt = re.sub(r'\s*style="[^"]*"', '', txt)
                txt = re.sub(r'(<img class="meme-inline"[^>]*?)>',
                             lambda mm: mm.group(1).rstrip() +
                             f' style="left:{p["left"]}px;top:{p["top"]}px;width:{p["w"]}px">',
                             txt, count=1)
                aplicados += 1
        out.append(txt)
        last = m.end()
        idx += 1
    out.append(raw[last:])
    open(f, 'w', encoding='utf-8').write(''.join(out))

print("secciones:", idx, "| memes con estilo aplicado:", aplicados)
# comprobacion
h = ''.join(open(f, encoding='utf-8').read() for f in files)
print("imgs meme-inline:", len(re.findall(r'class="meme-inline"', h)),
      "| con style:", len(re.findall(r'class="meme-inline"[^>]*style="left:', h)),
      "| data-c restantes:", len(re.findall(r'data-c="', h)))
