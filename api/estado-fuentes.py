from http.server import BaseHTTPRequestHandler
import json
from pathlib import Path

ESTADO_PATH = Path(__file__).resolve().parent.parent / "public" / "estado-fuentes.json"


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_GET(self):
        if not ESTADO_PATH.exists():
            self._send_json(404, {"error": "Snapshot no encontrado"})
            return
        try:
            payload = json.loads(ESTADO_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            self._send_json(500, {"error": "Snapshot inválido"})
            return
        self._send_json(200, payload)

    def do_POST(self):
        self._send_json(405, {"error": "Method Not Allowed"})
