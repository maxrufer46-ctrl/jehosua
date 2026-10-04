#!/usr/bin/env python3
from pathlib import Path
import shutil

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"offline"
DST=ROOT/"app"/"src"/"main"/"assets"/"www"

if DST.exists():
    shutil.rmtree(DST)
DST.mkdir(parents=True,exist_ok=True)

for p in SRC.iterdir():
    if p.is_file():
        shutil.copy2(p,DST/p.name)

required=["index.html","app.css","app.js","products-01.js","products-02.js","products-03.js","products-04.js","products-05.js"]
missing=[x for x in required if not (DST/x).exists()]
if missing:
    raise SystemExit("Faltan archivos offline: "+", ".join(missing))
print("Recursos offline preparados:", len(required))
