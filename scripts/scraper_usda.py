#!/usr/bin/env python3
"""
Actualización de estado de fuentes para Porkxi.

Usa el RSS oficial de noticias de USDA NASS y extrae el último
comunicado de inventario porcino ("hog inventory").
"""

import json
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib import error, request

USDA_NEWS_RSS_URL = "https://www.nass.usda.gov/rss/news.xml"

MESES_ES = {
    1: "ene",
    2: "feb",
    3: "mar",
    4: "abr",
    5: "may",
    6: "jun",
    7: "jul",
    8: "ago",
    9: "sep",
    10: "oct",
    11: "nov",
    12: "dic",
}

PATRON_INVENTARIO = re.compile(
    r"(\d+(?:\.\d+)?)\s+million\s+hogs\s+and\s+pigs",
    re.IGNORECASE,
)


def _parse_pub_date(valor):
    if not valor:
        return None
    try:
        return datetime.strptime(valor, "%a, %d %b %Y %H:%M GMT").replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _formatear_fecha_es(fecha):
    if not fecha:
        return "sin dato"
    return f"{fecha.day:02d} {MESES_ES[fecha.month]} {fecha.year}"


def _dias_desde(fecha):
    if not fecha:
        return None
    ahora = datetime.now(timezone.utc)
    return max((ahora - fecha).days, 0)


def _proximo_reporte_estimado(fecha):
    if not fecha:
        return "Próximo reporte: por confirmar"
    meses_trimestrales = [3, 6, 9, 12]
    siguiente = None
    for mes in meses_trimestrales:
        if fecha.month < mes:
            siguiente = (fecha.year, mes)
            break
    if siguiente is None:
        siguiente = (fecha.year + 1, 3)
    return f"Próximo reporte estimado: {MESES_ES[siguiente[1]]} {siguiente[0]} (trimestral)"


def _extraer_item_hog_inventory(xml_text):
    root = ET.fromstring(xml_text)
    channel = root.find("channel")
    if channel is None:
        return None

    candidatos = []
    for item in channel.findall("item"):
        title = (item.findtext("title") or "").strip()
        description = (item.findtext("description") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_date_raw = (item.findtext("pubDate") or "").strip()
        pub_date = _parse_pub_date(pub_date_raw)
        texto = f"{title} {description}".lower()

        if "hog" in texto and "pig" in texto and "inventory" in texto:
            candidatos.append(
                {
                    "title": title,
                    "description": description,
                    "link": link,
                    "pub_date_raw": pub_date_raw,
                    "pub_date": pub_date,
                }
            )

    if not candidatos:
        return None

    candidatos.sort(key=lambda item: item["pub_date"] or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
    return candidatos[0]


def obtener_ultimo_reporte_usda():
    try:
        with request.urlopen(USDA_NEWS_RSS_URL, timeout=15) as response:
            contenido = response.read().decode("utf-8")
    except error.URLError as exc:
        return {
            "status": "error",
            "error": f"No se pudo consultar USDA RSS: {exc}",
            "fuente": "USDA NASS RSS",
        }

    try:
        item = _extraer_item_hog_inventory(contenido)
    except ET.ParseError:
        return {
            "status": "error",
            "error": "USDA RSS devolvió XML inválido",
            "fuente": "USDA NASS RSS",
        }

    if not item:
        return {
            "status": "error",
            "error": "No se encontró un reporte de inventario porcino en el feed",
            "fuente": "USDA NASS RSS",
        }

    pub_date = item["pub_date"]
    inventario_match = PATRON_INVENTARIO.search(item["description"])
    inventario_millones = float(inventario_match.group(1)) if inventario_match else None

    return {
        "status": "ok",
        "fuente": "USDA NASS RSS",
        "titulo": item["title"],
        "enlace": item["link"],
        "ultimo_reporte": _formatear_fecha_es(pub_date),
        "ultimo_reporte_iso": pub_date.isoformat() if pub_date else None,
        "dias_desde_reporte": _dias_desde(pub_date),
        "inventario_millones": inventario_millones,
        "proximo_reporte": _proximo_reporte_estimado(pub_date),
    }


def construir_estado_fuentes():
    fecha_consulta = datetime.now(timezone.utc).isoformat()
    usa = obtener_ultimo_reporte_usda()

    colombia_fecha = datetime(2026, 1, 1, tzinfo=timezone.utc)
    colombia = {
        "status": "warning",
        "fuente": "Porcinews",
        "ultimo_reporte": "ene 2026",
        "ultimo_reporte_iso": colombia_fecha.isoformat(),
        "dias_desde_reporte": _dias_desde(colombia_fecha),
        "proximo_reporte": "Sin fecha oficial programada",
        "enlace": "https://www.porcinews.com/actualidad/datos-actuales-del-sector-porcino-en-colombia_21476/",
    }

    return {
        "fecha_consulta": fecha_consulta,
        "usa": usa,
        "colombia": colombia,
    }


def guardar_estado_fuentes(path="public/estado-fuentes.json"):
    estado = construir_estado_fuentes()
    destino = Path(path)
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(estado, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return estado


def actualizar_datos():
    """Compatibilidad: devuelve solo el bloque de USA."""
    return construir_estado_fuentes()["usa"]


if __name__ == "__main__":
    print(json.dumps(construir_estado_fuentes(), indent=2, ensure_ascii=False))
