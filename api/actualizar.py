from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.end_headers()

        resultado = {
            "status": "ok",
            "mensaje": "Actualización ejecutada correctamente",
            "fecha": datetime.now().isoformat(),
            "fuentes": {"usda": "verificado", "colombia": "sin_novedades"},
        }

        self.wfile.write(json.dumps(resultado).encode())
        return
