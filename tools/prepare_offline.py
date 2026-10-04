#!/usr/bin/env python3
from pathlib import Path
import base64, shutil, zipfile

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "offline"
B64 = ROOT / "assets-b64"
DST = ROOT / "app" / "src" / "main" / "assets" / "www"
TMP = ROOT / "build-offline-assets.zip"

if DST.exists():
    shutil.rmtree(DST)
DST.mkdir(parents=True, exist_ok=True)

parts = sorted(B64.glob("part-*.txt"))
if len(parts) != 5:
    raise SystemExit(f"Se esperaban 5 partes de recursos, encontradas: {len(parts)}")

data = "".join(p.read_text(encoding="utf-8").strip() for p in parts)
TMP.write_bytes(base64.b64decode(data))

with zipfile.ZipFile(TMP, "r") as z:
    z.extractall(DST)

for name in ("index.html", "app.css", "app.js"):
    shutil.copy2(SRC / name, DST / name)

required = ["index.html","app.css","app.js","products.js","logo-mercados-jehosua.webp"]
missing = [x for x in required if not (DST/x).exists()]
if missing:
    raise SystemExit("Faltan archivos: " + ", ".join(missing))

images = list((DST/"assets"/"products").glob("*.webp"))
if len(images) < 800:
    raise SystemExit(f"Solo se encontraron {len(images)} imágenes")

print("Recursos offline preparados:", len(images), "imágenes")
TMP.unlink(missing_ok=True)
