/** @format */

const fs = require("node:fs");
const path = require("node:path");

// Optional direct delivery of unmodified build bytes avoids local HTTP/proxy failures.
module.exports = async function preview(context, baseUrl) {
  if (!process.env.QA_BUILD_ROOT) return;
  let root = path.resolve(process.env.QA_BUILD_ROOT);
  if (fs.existsSync(path.join(root, "browser/index.html"))) root = path.join(root, "browser");
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".json": "application/json",
  };
  await context.route(baseUrl + "/**", async route => {
    const url = new URL(route.request().url());
    let file = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep)) return route.abort();
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory())
      file = path.join(root, "index.html");
    await route.fulfill({
      path: file,
      contentType: types[path.extname(file)] || "application/octet-stream",
    });
  });
};
