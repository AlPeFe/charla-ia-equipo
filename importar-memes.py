import os, glob, shutil
from PIL import Image

SRC = r'C:\Users\alexlocal\Pictures\Nueva carpeta'
DST = r'C:\Users\alexlocal\projects\charla-ia-equipo\src\img\memes'
MAX = 900          # lado mayor
Q = 82

os.makedirs(DST, exist_ok=True)
# limpiar memes anteriores
for f in glob.glob(os.path.join(DST, '*')):
    os.remove(f)

files = sorted(glob.glob(os.path.join(SRC, '*.*')),
               key=lambda p: os.path.basename(p).lower())
n = 0
total = 0
for i, p in enumerate(files, 1):
    try:
        im = Image.open(p)
        im = im.convert('RGB')
        w, h = im.size
        if max(w, h) > MAX:
            k = MAX / max(w, h)
            im = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
        out = os.path.join(DST, f'm{i:02d}.jpg')
        im.save(out, 'JPEG', quality=Q, optimize=True, progressive=True)
        sz = os.path.getsize(out)
        total += sz
        n += 1
        print(f"  {i:02d} {os.path.basename(p)[:45]:<45} {w}x{h} -> {im.size[0]}x{im.size[1]}  {sz//1024} KB")
    except Exception as e:
        print(f"  !! {os.path.basename(p)}: {e}")

print(f"\n{n} memes convertidos a {DST}")
print(f"peso total: {total/1024/1024:.2f} MB")
