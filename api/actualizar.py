from http.server import BaseHTTPRequestHandler
import json
import os
import sys

sys.path.append("scripts")

from scraper_usda import construir_estado_fuentes


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_GET(self):
        cron_secret = os.getenv("CRON_SECRET")
        if cron_secret:
            authorization = self.headers.get("authorization")
            expected = f"Bearer {cron_secret}"
            if authorization != expected:
                self._send_json(401, {"status": "error", "error": "Unauthorized"})
                return

        estado = construir_estado_fuentes()
        if estado.get("usa", {}).get("status") != "ok":
            self._send_json(502, estado)
            return

        self._send_json(200, estado)

    def do_POST(self):
        self._send_json(405, {"status": "error", "error": "Method Not Allowed"})
