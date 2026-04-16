#!/usr/bin/env python3
import json

from scraper_usda import guardar_estado_fuentes


if __name__ == "__main__":
    estado = guardar_estado_fuentes("public/estado-fuentes.json")
    print(json.dumps(estado, indent=2, ensure_ascii=False))
