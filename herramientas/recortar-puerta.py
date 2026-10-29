# Recorta la hoja de la puerta del pasillo y deja un hueco transparente en el fondo.
import sys
from PIL import Image, ImageDraw, ImageFilter
src, out_dir = sys.argv[1], sys.argv[2]
x, y, w, h = [float(v) for v in sys.argv[3:7]]   # % de la foto
im = Image.open(src).convert("RGB")
W, H = im.size
L, T, R, B = round(x/100*W), round(y/100*H), round((x+w)/100*W), round((y+h)/100*H)
leaf = im.crop((L, T, R, B))
leaf.save(f"{out_dir}/puerta.webp", "WEBP", quality=88, method=6)
bg = im.convert("RGBA")
mask = Image.new("L", (W, H), 255)
ImageDraw.Draw(mask).rectangle((L+1, T+1, R-2, B-2), fill=0)
bg.putalpha(mask)
bg.save(f"{out_dir}/pasillo.webp", "WEBP", quality=86, method=6)
print("leaf px", L, T, R, B)
