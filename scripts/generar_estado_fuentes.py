#!/usr/bin/env python3
import json
import subprocess
from pathlib import Path

from scraper_usda import guardar_estado_fuentes


if __name__ == "__main__":
    estado = guardar_estado_fuentes("public/estado-fuentes.json")
    repo_root = Path(__file__).resolve().parents[1]
    subprocess.run(
        ["node", "scripts/generar_datasets_publicos.mjs"],
        cwd=repo_root,
        check=True,
    )
    print(json.dumps(estado, indent=2, ensure_ascii=False))
