#!/usr/bin/env python3
"""Локальная SPA-раздача оптимизированного артефакта, без публикации."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "dist/social_platform"

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if not Path(self.translate_path(self.path)).exists() and not Path(self.path.split("?")[0]).suffix:
            self.path = "/index.html"
        super().do_GET()

ThreadingHTTPServer(("127.0.0.1", 4365), Handler).serve_forever()
