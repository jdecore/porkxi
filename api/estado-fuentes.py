from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime, timezone
import sys

sys.path.append("scripts")

from scraper_usda import actualizar_datos


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_GET(self):
        usa = actualizar_datos()
        payload = {
            "fecha_consulta": datetime.now(timezone.utc).isoformat(),
            "usa": {
                "status": usa.get("status", "error"),
                "ultimo_reporte": usa.get("ultimo_reporte", "sin dato"),
                "fuente": usa.get("fuente", "USDA NASS"),
                "proximo_reporte": "Próximo reporte: 26 mar 2026",
                "error": usa.get("error"),
            },
            "colombia": {
                "status": "warning",
                "ultimo_reporte": "ene 2026",
                "fuente": "Porcinews",
                "proximo_reporte": "Sin fecha programada",
            },
        }
        self._send_json(200, payload)

    def do_POST(self):
        self._send_json(405, {"error": "Method Not Allowed"})
