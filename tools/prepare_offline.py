#!/usr/bin/env python3
import os
import re
import shutil
import urllib.request
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app" / "src" / "main" / "assets" / "www"
OFFLINE = ROOT / "offline"
BASE = os.environ.get("SITE_URL", "https://leafy-narwhal-7889dd.netlify.app/").rstrip("/") + "/"

UA = "Mozilla/5.0 MercadosJehosuaOfflineBuilder/1.0"

def get(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()

def download(rel: str, required=True):
    rel = rel.lstrip("/")
    dst = OUT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    try:
        data = get(urljoin(BASE, rel))
        dst.write_bytes(data)
        print("OK", rel, len(data))
        return True
    except Exception as e:
        print("ERROR", rel, e)
        if required:
            raise
        return False

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir(parents=True)

for name in ("index.html", "app.css", "app.js"):
    shutil.copy2(OFFLINE / name, OUT / name)

products_data = get(urljoin(BASE, "products.js"))
(OUT / "products.js").write_bytes(products_data)
text = products_data.decode("utf-8", errors="ignore")

paths = sorted(set(re.findall(r'"image"\s*:\s*"([^"]+)"', text)))
print("Productos con imagen:", len(paths))
for i, rel in enumerate(paths, 1):
    download(rel, required=False)
    if i % 100 == 0:
        print("Descargadas", i, "de", len(paths))

download("logo-mercados-jehosua.png", required=True)

missing = []
for rel in paths:
    if not (OUT / rel.lstrip("/")).exists():
        missing.append(rel)

if missing:
    print("Imágenes no disponibles:", len(missing))
    placeholder = OUT / "logo-mercados-jehosua.png"
    for rel in missing:
        dst = OUT / rel.lstrip("/")
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(placeholder, dst)

print("Aplicación offline preparada en", OUT)
