from http.server import BaseHTTPRequestHandler
import json
import os
import urllib.error
import urllib.request


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        self.send_response(status_code)
        self.send_header("Content-type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_GET(self):
        self._send_json(405, {"error": "Method Not Allowed"})

    def do_POST(self):
        content_length_header = self.headers.get("Content-Length", "0")
        try:
            content_length = int(content_length_header)
        except ValueError:
            self._send_json(400, {"error": "Content-Length inválido"})
            return

        if content_length <= 0:
            self._send_json(400, {"error": "Body requerido"})
            return

        try:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(raw_body)
        except json.JSONDecodeError:
            self._send_json(400, {"error": "JSON inválido"})
            return

        prompt = str(body.get("prompt", "")).strip()
        if not prompt:
            self._send_json(400, {"error": "Prompt requerido"})
            return

        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            self._send_json(500, {"error": "Falta configurar GEMINI_API_KEY"})
            return

        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"gemini-2.0-flash:generateContent?key={api_key}"
        )
        gemini_payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 300,
            },
        }

        request = urllib.request.Request(
            url=url,
            data=json.dumps(gemini_payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                gemini_data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="ignore")
            self._send_json(
                502,
                {
                    "error": "Gemini API devolvió error",
                    "detail": detail[:500],
                },
            )
            return
        except urllib.error.URLError as error:
            self._send_json(
                502,
                {
                    "error": "No se pudo contactar Gemini API",
                    "detail": str(error.reason),
                },
            )
            return

        candidates = gemini_data.get("candidates", [])
        if not candidates:
            self._send_json(502, {"error": "Respuesta sin candidates"})
            return

        content = candidates[0].get("content", {})
        parts = content.get("parts", [])
        if not parts or "text" not in parts[0]:
            self._send_json(502, {"error": "Respuesta sin texto"})
            return

        self._send_json(200, {"text": parts[0]["text"].strip()})
