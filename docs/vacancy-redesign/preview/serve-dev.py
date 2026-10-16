"""Локальная сборка + настоящий DEV API. Только loopback, без сохранения паролей/токенов.

Запуск из tmp/vacancy-dev/browser. Proxy передаёт Authorization в фиксированный DEV host;
вход выполняется пользователем в локальном приложении обычной формой Angular.
"""
import http.server
import urllib.error
import urllib.request
from pathlib import Path


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Пересборка меняет имена chunks: не оставлять старый index в HTTP-кеше.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def handle_request(self):
        if self.path.startswith("/dev-api/"):
            path = self.path[len("/dev-api"):]
            size = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(size) if size else None
            headers = {key: self.headers[key] for key in ("Authorization", "Content-Type", "Accept") if key in self.headers}
            request = urllib.request.Request("https://dev.procollab.ru" + path, data=body, headers=headers, method=self.command)
            try:
                response = urllib.request.urlopen(request, timeout=30)
            except urllib.error.HTTPError as error:
                response = error
            except urllib.error.URLError:
                self.send_error(502, "DEV API unavailable")
                return
            with response:
                data = response.read()
                self.send_response(response.status)
                self.send_header("Content-Type", response.headers.get("Content-Type", "application/json"))
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        elif self.command == "GET":
            if not Path(self.translate_path(self.path.split("?")[0])).is_file():
                if Path(self.path.split("?")[0]).suffix:
                    self.send_error(404, "Asset missing; reload the page after rebuilding")
                    return
                self.path = "/index.html"
            super().do_GET()
        else:
            self.send_error(405)

    do_GET = handle_request
    do_POST = handle_request
    do_PATCH = handle_request
    do_DELETE = handle_request
    do_PUT = handle_request

    def log_message(self, *_):
        pass  # Не записывать данные авторизации или пользовательские запросы в логи.


http.server.ThreadingHTTPServer(("127.0.0.1", 4360), Handler).serve_forever()
