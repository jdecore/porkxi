#!/usr/bin/env python3
"""
Scraper automático para datos USDA NASS
Ejecutado diariamente por Vercel Cron

Demuestra: Python, Web Scraping, Automatización
"""

import json
from datetime import datetime, timezone
from urllib import request, error


def obtener_ultimo_reporte_usda():
    """Obtiene el último reporte de inventario porcino del USDA"""
    url = "https://usda.library.cornell.edu/api/v1/publication/recent?series=Livestock%20Slaughter"

    try:
        with request.urlopen(url, timeout=10) as response:
            datos = json.loads(response.read().decode())
            if not isinstance(datos, list) or not datos:
                return {
                    "status": "error",
                    "error": "USDA respondió sin datos",
                    "fecha_consulta": datetime.now(timezone.utc).isoformat(),
                    "fuente": "USDA NASS",
                }

            return {
                "status": "ok",
                "fecha_consulta": datetime.now(timezone.utc).isoformat(),
                "ultimo_reporte": datos[0].get("publication_date", "sin_dato"),
                "fuente": "USDA NASS",
            }

    except error.URLError as e:
        return {
            "status": "error",
            "error": str(e),
            "fecha_consulta": datetime.now(timezone.utc).isoformat(),
            "fuente": "USDA NASS",
        }


def actualizar_datos():
    """Función principal ejecutada por el cron job"""
    return obtener_ultimo_reporte_usda()


if __name__ == "__main__":
    print(json.dumps(actualizar_datos(), indent=2))
