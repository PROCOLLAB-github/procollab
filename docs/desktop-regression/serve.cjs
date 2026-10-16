/** @format */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
let root = path.resolve(process.argv[2]);
if (fs.existsSync(path.join(root, "browser/index.html"))) root = path.join(root, "browser");
const port = Number(process.argv[3]);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".md": "text/plain; charset=utf-8",
};
http
  .createServer((request, response) => {
    let file = path.resolve(
      root,
      "." + decodeURIComponent(new URL(request.url, "http://localhost").pathname),
    );
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
      file = path.join(root, "index.html");
    if (!fs.existsSync(file)) return response.writeHead(404).end("Not found");
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    fs.createReadStream(file).pipe(response);
  })
  .listen(port, "127.0.0.1", () => console.log(`Preview ${port}: ${root}`));
