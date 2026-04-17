#!/usr/bin/env python3
"""
Actualización de estado de fuentes para Porkxi.

Usa el RSS oficial de noticias de USDA NASS y extrae el último
comunicado de inventario porcino ("hog inventory").
"""

import json
import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib import error, request

USDA_NEWS_RSS_URL = "https://www.nass.usda.gov/rss/news.xml"
EUROSTAT_SERIE_URL = (
    "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
    "apro_mt_lspig?geo=EU27_2020&animals=A3100&unit=THS_HD&month=M11_M12&sinceTimePeriod=2015"
)

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
    ahora = datetime.now(timezone.utc)
    referencia = ahora if ahora > fecha else fecha
    meses_trimestrales = [3, 6, 9, 12]
    siguiente = None
    for mes in meses_trimestrales:
        if referencia.month < mes:
            siguiente = (referencia.year, mes)
            break
    if siguiente is None:
        siguiente = (referencia.year + 1, 3)
    return f"Próximo reporte estimado: {MESES_ES[siguiente[1]]} {siguiente[0]} (trimestral)"


def _proxima_actualizacion_eurostat(last_year):
    ahora = datetime.now(timezone.utc)
    estimado = int(last_year) + 1
    if estimado < ahora.year:
        estimado = ahora.year
    if ahora.month > 4 and estimado == ahora.year:
        estimado += 1
    return f"Próxima actualización anual estimada: {MESES_ES[4]} {estimado}"


def _crear_analisis_fallback(usa, europa, colombia):
    inventario_usa = usa.get("inventario_millones")
    inventario_europa = europa.get("inventario_millones")
    inventario_colombia = colombia.get("inventario_millones")
    ratio_usa = None
    ratio_europa = None

    if isinstance(inventario_usa, (int, float)) and isinstance(inventario_colombia, (int, float)) and inventario_colombia > 0:
        ratio_usa = inventario_usa / inventario_colombia
    if isinstance(inventario_europa, (int, float)) and isinstance(inventario_colombia, (int, float)) and inventario_colombia > 0:
        ratio_europa = inventario_europa / inventario_colombia

    escala = (
        f"Europa registra {inventario_europa:.1f} millones y EE.UU. {inventario_usa:.1f} millones frente a {inventario_colombia:.1f} millones de Colombia ({ratio_europa:.1f}x y {ratio_usa:.1f}x)."
        if ratio_usa is not None and ratio_europa is not None
        else "Europa y EE.UU. mantienen una escala de inventario muy superior a Colombia."
    )

    transparencia = (
        "Europa (Eurostat) y EE.UU. (USDA) publican series oficiales trazables, mientras Colombia depende de una fuente periodística especializada sin API gubernamental equivalente."
    )
    conclusion = (
        "La prioridad para cerrar la brecha es institucionalizar una publicación oficial, periódica y abierta de datos porcinos en Colombia."
    )

    return f"{escala} {transparencia} {conclusion}"


def _crear_prompt_analisis(usa, europa, colombia):
    inventario_usa = usa.get("inventario_millones")
    inventario_europa = europa.get("inventario_millones")
    inventario_colombia = colombia.get("inventario_millones")
    dias_usa = usa.get("dias_desde_reporte")
    dias_europa = europa.get("dias_desde_reporte")
    dias_colombia = colombia.get("dias_desde_reporte")
    ultimo_usa = usa.get("ultimo_reporte", "sin dato")
    ultimo_europa = europa.get("ultimo_reporte", "sin dato")
    ultimo_colombia = colombia.get("ultimo_reporte", "sin dato")
    inventario_usa_txt = f"{inventario_usa:.1f}" if isinstance(inventario_usa, (int, float)) else "sin dato"
    inventario_europa_txt = (
        f"{inventario_europa:.1f}" if isinstance(inventario_europa, (int, float)) else "sin dato"
    )
    inventario_colombia_txt = (
        f"{inventario_colombia:.1f}" if isinstance(inventario_colombia, (int, float)) else "sin dato"
    )

    return (
        "Analiza estos datos del inventario porcino en español y responde con exactamente 3 frases profesionales y claras.\n\n"
        f"- Colombia: {inventario_colombia_txt} millones de cabezas, último reporte {ultimo_colombia}, {dias_colombia} días desde publicación.\n"
        f"- Europa (UE-27): {inventario_europa_txt} millones de cabezas, último reporte {ultimo_europa}, {dias_europa} días desde publicación.\n"
        f"- EE.UU.: {inventario_usa_txt} millones de cabezas, último reporte {ultimo_usa}, {dias_usa} días desde publicación.\n"
        "- Contexto: Europa usa Eurostat con API pública; EE.UU. usa USDA; Colombia no tiene una serie oficial pública equivalente con la misma frecuencia.\n\n"
        "Incluye: 1) diferencia de escala, 2) diferencia de transparencia/actualización, 3) una conclusión accionable."
    )


def construir_analisis_ia(usa, europa, colombia):
    """Genera análisis usando fallback local (sin API externa)."""
    return {
        "texto": _crear_analisis_fallback(usa, europa, colombia),
        "fuente": "analisis-local",
        "actualizado_en": datetime.now(timezone.utc).isoformat(),
    }


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


def obtener_ultimo_reporte_eurostat():
    try:
        with request.urlopen(EUROSTAT_SERIE_URL, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except error.URLError as exc:
        return {
            "status": "error",
            "error": f"No se pudo consultar Eurostat API: {exc}",
            "fuente": "Eurostat API",
        }
    except json.JSONDecodeError:
        return {
            "status": "error",
            "error": "Eurostat devolvió JSON inválido",
            "fuente": "Eurostat API",
        }

    values = payload.get("value", {})
    if not values:
        return {
            "status": "error",
            "error": "Eurostat no devolvió valores para la serie solicitada",
            "fuente": "Eurostat API",
        }

    time_index = payload.get("dimension", {}).get("time", {}).get("category", {}).get("index", {})
    if not time_index:
        return {
            "status": "error",
            "error": "Eurostat no devolvió índices de tiempo",
            "fuente": "Eurostat API",
        }

    reverse_time = {int(pos): year for year, pos in time_index.items()}
    available_positions = sorted(int(key) for key in values.keys())
    last_pos = available_positions[-1]
    last_year = reverse_time.get(last_pos)
    last_value_ths = float(values[str(last_pos)])
    status_code = payload.get("status", {}).get(str(last_pos))

    if not last_year:
        return {
            "status": "error",
            "error": "No se pudo determinar el último año de la serie europea",
            "fuente": "Eurostat API",
        }

    fecha = datetime(int(last_year), 12, 1, tzinfo=timezone.utc)
    nota_status = None
    if status_code == "p":
        nota_status = "Dato provisional"
    elif status_code == "b":
        nota_status = "Serie con corte metodológico"
    elif status_code:
        nota_status = f"Código de estado Eurostat: {status_code}"

    result = {
        "status": "ok",
        "fuente": "Eurostat API",
        "dataset": "apro_mt_lspig",
        "enlace": EUROSTAT_SERIE_URL,
        "ultimo_reporte": str(last_year),
        "ultimo_reporte_iso": fecha.isoformat(),
        "dias_desde_reporte": _dias_desde(fecha),
        "inventario_millones": round(last_value_ths / 1000, 2),
        "proximo_reporte": _proxima_actualizacion_eurostat(last_year),
    }
    if nota_status:
        result["nota"] = nota_status
    return result


def construir_estado_fuentes():
    fecha_consulta = datetime.now(timezone.utc).isoformat()
    usa = obtener_ultimo_reporte_usda()
    europa = obtener_ultimo_reporte_eurostat()

    colombia_fecha = datetime(2026, 1, 1, tzinfo=timezone.utc)
    colombia = {
        "status": "warning",
        "fuente": "Porcinews",
        "ultimo_reporte": "ene 2026",
        "ultimo_reporte_iso": colombia_fecha.isoformat(),
        "dias_desde_reporte": _dias_desde(colombia_fecha),
        "inventario_millones": 10.7,
        "proximo_reporte": "Sin fecha oficial programada",
        "enlace": "https://www.porcinews.com/actualidad/datos-actuales-del-sector-porcino-en-colombia_21476/",
    }

    analisis_ia = construir_analisis_ia(usa, europa, colombia)

    return {
        "fecha_consulta": fecha_consulta,
        "usa": usa,
        "europa": europa,
        "colombia": colombia,
        "analisis_ia": analisis_ia,
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
