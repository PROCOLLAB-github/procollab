/** @format */

// Only local, compiled visual fixtures. No application API or business writes.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve("tmp/current/browser");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
http
  .createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(file, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
      res.end(data);
    });
  })
  .listen(Number(process.argv[2] || 4302), "127.0.0.1");
